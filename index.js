/**
 * dsh-starter-kit — Host half (global prompt feature)
 *
 * Injects one user-managed prompt section into every new conversation and
 * subagent via ctx.systemPrompt.section(). The section's text is a function,
 * so the value is read at assembly time: saving takes effect on the next
 * request, and the text is never written into conversation history.
 *
 * The market and sidebar plugins are self-mounting bundles declared as
 * dependencies; this file only implements the kit's own global prompt.
 */
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const inject = ['systemPrompt']

const HERE = join(fileURLToPath(new URL('.', import.meta.url)), 'package.json')

function findProfileDir() {
  const profile = process.env.DSH_PROFILE || 'desktop'
  const candidates = [
    process.env.DSH_PROFILE_DIR,
    process.env.DSH_HOME && join(process.env.DSH_HOME, 'profiles', profile),
    join(process.env.USERPROFILE || process.env.HOME || '', '.dsh', 'profiles', profile),
  ].filter(Boolean)
  return candidates.find(dir => existsSync(join(dir, 'node_modules'))) || candidates[0]
}

const PROFILE_DIR = findProfileDir()

function loadSchema() {
  const bases = [HERE]
  if (PROFILE_DIR) bases.push(join(PROFILE_DIR, 'package.json'))
  let lastError
  for (const base of bases) {
    try {
      const module = createRequire(base)('@deepseek-ai/schemastery')
      return module.default || module.z || module
    } catch (error) {
      lastError = error
    }
  }
  throw new Error(`dsh-starter-kit: cannot resolve @deepseek-ai/schemastery (${lastError?.message})`)
}

const z = loadSchema()

export const Config = z.object({
  prompt: z.string().default('').volatile(),
  enabled: z.boolean().default(true).volatile(),
})

const API_PATH = '/starter-kit/api'
const SECTION_NAME = 'starter-kit:global-prompt'
const MAX_PROMPT_CHARS = 64 * 1024
const MAX_BODY_CHARS = 128 * 1024

function isLoopback(address) {
  if (!address) return true
  return (
    address === '127.0.0.1' ||
    address === '::1' ||
    address === '::ffff:127.0.0.1' ||
    address.startsWith('127.')
  )
}

function json(res, code, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

function normalizePrompt(value) {
  if (typeof value !== 'string') return ''
  return value.slice(0, MAX_PROMPT_CHARS)
}

function valueOf(field, fallback) {
  if (field !== null && typeof field === 'object' && typeof field.get === 'function') {
    return field.get()
  }
  return field === undefined ? fallback : field
}

async function readBody(req) {
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > MAX_BODY_CHARS) throw new Error('payload-too-large')
  }
  return raw
}

export function apply(ctx, config) {
  const entryId = ctx.fiber.entry?.options.id
  const effects = []

  const readConfig = () => ({
    prompt: normalizePrompt(valueOf(config?.prompt, '')),
    enabled: valueOf(config?.enabled, true) !== false,
  })

  let live = readConfig()
  const current = () => ({ ...live })

  effects.push(ctx.systemPrompt.section({
    name: SECTION_NAME,
    order: 0,
    interpolate: false,
    text: () => (live.enabled ? live.prompt : ''),
  }))

  async function save(patch) {
    const prompt = normalizePrompt(patch.prompt ?? live.prompt)
    const enabled = (patch.enabled ?? live.enabled) !== false
    const change = { prompt, enabled }

    const settings = ctx.get('settings')
    if (settings !== undefined && entryId !== undefined) {
      await settings.update(entryId, change)
    } else {
      const editor = ctx.get('configEditor')
      if (entryId === undefined || editor === undefined) {
        throw new Error('Configuration cannot be saved in this profile')
      }
      await editor.edit(entryId, value => ({ ...value, ...change }))
    }

    live = change
    return current()
  }

  function handler() {
    return async (req, res) => {
      if (!isLoopback(req.socket && req.socket.remoteAddress)) {
        return json(res, 403, { ok: false, error: 'loopback-only' })
      }
      try {
        if (req.method === 'GET' || req.method === 'HEAD') {
          return json(res, 200, { ok: true, value: current() })
        }
        if (req.method !== 'POST') {
          return json(res, 405, { ok: false, error: 'method-not-allowed' })
        }
        if (!String(req.headers['content-type'] || '').includes('application/json')) {
          return json(res, 415, { ok: false, error: 'json-required' })
        }
        const raw = await readBody(req)
        let patch
        try {
          patch = JSON.parse(raw || '{}')
        } catch {
          return json(res, 400, { ok: false, error: 'bad-json' })
        }
        if (!patch || typeof patch !== 'object') {
          return json(res, 400, { ok: false, error: 'bad-json' })
        }
        const value = await save(patch)
        return json(res, 200, { ok: true, value })
      } catch (error) {
        ctx.logger?.warn('[starter-kit] request failed: %s', error?.message ?? error)
        return json(res, 500, { ok: false, error: 'save-failed' })
      }
    }
  }

  ctx.inject(['webServer'], http => {
    effects.push(http.webServer.register({ kind: 'exact', path: API_PATH, handler: handler() }))
  })

  ctx.on('loader/volatile-update', () => {
    live = readConfig()
  })

  ctx.effect(() => () => {
    for (const dispose of effects.splice(0).reverse()) {
      try { dispose?.() } catch { /* disposal must not throw into the framework */ }
    }
  }, 'starter-kit: disposers')

  ctx.logger?.info('[starter-kit] global-prompt active: %s', entryId ?? '(no entry)')
}
