/**
 * dsh-starter-kit — Client half (global prompt row)
 *
 * Registers one row in 设置 → 通用设置 with a textarea and a 保存 button.
 * Uses only React from the browser module table and DSH theme tokens.
 */
window.__ModuleLoader__.load({
  id: 'dsh-starter-kit',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const SLOT = 'settings.general.item'
    const API = '/starter-kit/api'

    const S = {
      wrap: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0 6px', width: '100%' },
      head: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' },
      label: { fontSize: '13px', lineHeight: '20px', color: 'var(--dsw-alias-label-primary)' },
      hint: { fontSize: '12px', lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary)' },
      area: {
        width: '100%',
        minHeight: '104px',
        resize: 'vertical',
        boxSizing: 'border-box',
        padding: '8px 10px',
        fontFamily: 'inherit',
        fontSize: '13px',
        lineHeight: '20px',
        color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-specific-input-major)',
        border: '0.5px solid var(--dsw-alias-border-l2)',
        borderRadius: 'var(--dsw-radius-md, 8px)',
        outline: 'none',
      },
      actions: { display: 'flex', alignItems: 'center', gap: '10px' },
      button: {
        padding: '5px 14px',
        fontSize: '13px',
        lineHeight: '18px',
        cursor: 'pointer',
        borderRadius: 'var(--dsw-radius-md, 8px)',
        border: '0.5px solid var(--dsw-alias-state-business-primary)',
        background: 'var(--dsw-alias-state-business-primary)',
        color: 'var(--dsw-alias-label-primary-inverted)',
      },
      saved: { fontSize: '12px', color: 'var(--dsw-alias-state-business-primary)' },
      error: { fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)' },
    }

    function request(method, body) {
      const init = { method, cache: 'no-store' }
      if (body) {
        init.headers = { 'content-type': 'application/json' }
        init.body = JSON.stringify(body)
      } else {
        init.headers = { accept: 'application/json' }
      }
      return window.fetch(API, init)
        .then(res => (res && res.ok ? res.json() : null))
        .then(payload => (payload && payload.ok ? payload.value : null))
        .catch(() => null)
    }

    function GlobalPromptRow() {
      const [saved, setSaved] = React.useState('')
      const [draft, setDraft] = React.useState('')
      const [loaded, setLoaded] = React.useState(false)
      const [status, setStatus] = React.useState('loading')
      const [enabled, setEnabled] = React.useState(true)

      React.useEffect(() => {
        let alive = true
        request('GET').then(value => {
          if (!alive) return
          if (value) {
            setDraft(typeof value.prompt === 'string' ? value.prompt : '')
            setSaved(typeof value.prompt === 'string' ? value.prompt : '')
            setEnabled(value.enabled !== false)
            setStatus('ready')
          } else {
            setStatus('error')
          }
          setLoaded(true)
        })
        return () => { alive = false }
      }, [])

      function onSave() {
        setStatus('saving')
        request('POST', { prompt: draft, enabled }).then(value => {
          if (value) {
            const next = typeof value.prompt === 'string' ? value.prompt : draft
            setSaved(next)
            setDraft(next)
            setEnabled(value.enabled !== false)
            setStatus('saved')
          } else {
            setStatus('error')
          }
        })
      }

      const dirty = draft !== saved
      return h('div', { style: S.wrap, 'data-dsh-starter-kit': 'row' },
        h('div', { style: S.head },
          h('span', { style: S.label }, '全局提示词（一键包内置）'),
          h('span', { style: S.hint }, '保存后注入每一个新对话与子代理的 System Prompt')
        ),
        h('textarea', {
          style: S.area,
          value: loaded ? draft : '',
          disabled: !loaded || status === 'saving',
          placeholder: '例如：始终使用简体中文回复，并在回答末尾给出简要依据。',
          'aria-label': '全局提示词',
          onChange: event => {
            setDraft(event.target.value)
            if (status === 'saved' || status === 'error') setStatus('ready')
          },
        }),
        h('div', { style: S.actions },
          h('button', {
            type: 'button',
            style: S.button,
            disabled: !loaded || status === 'saving' || !dirty,
            onClick: onSave,
          }, status === 'saving' ? '保存中…' : '保存'),
          status === 'saved' ? h('span', { style: S.saved }, '已保存') : null,
          status === 'error' ? h('span', { style: S.error }, '保存失败，请重试') : null,
          status === 'ready' && dirty ? h('span', { style: S.hint }, '未保存的修改') : null,
        )
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject(SLOT, () =>
          ctx.slots.register({ name: SLOT, id: 'dsh-starter-kit', order: 50 }, GlobalPromptRow)
        )
      },
    }
  },
})
