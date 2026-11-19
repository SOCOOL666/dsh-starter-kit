# DSH Starter Kit · dsh-starter-kit

> New to the agent runtime (DSH) and lost among dozens of plugins? Install this one kit.
> Plugin market + enhanced sidebar + global prompt, bundled together so you can start using DSH right away.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![DSH](https://img.shields.io/badge/DSH-0.2.2--rc.2%2B-4d6bfe.svg)](https://github.com/deepseek-ai/deepseek-harness)

[English](README.md) · [简体中文](README.zh-CN.md)

---

## What it is (in one sentence)

A **DSH plugin starter kit** that bundles three battle-tested features into one install:

1. 🛒 **Visual plugin market** (`dshmarket`) — browse and one-click install community plugins from inside DSH;
2. 🗂️ **Enhanced sidebar** (`dsh-better-sidebar`) — file tree, editor, Git, terminal, subagent tasks and side chat in one column;
3. ✍️ **Global prompt** (built into this kit) — write a prompt once, automatically attached to every new conversation and subagent.

For beginners, this means you no longer need to search GitHub one plugin at a time, guess which versions are compatible, or learn each install flow. Install this kit and the everyday essentials are covered.

## Why these plugins (real numbers)

Data from the GitHub API and npm downloads API, collected **2026-11-19**. Numbers change over time — follow the links for the latest.

| Bundled plugin | GitHub stars ⭐ | Forks | npm downloads (last 30 days) | Why it matters |
| --- | --- | --- | --- | --- |
| [dshmarket](https://github.com/dsh-market/dsh-market) (plugin market) | **12,897** | 492 | **1,270,308** | The most popular plugin market in the DSH ecosystem, million-scale monthly downloads |
| [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) (enhanced sidebar) | **5,235** | 508 | **361,958** | A 5k-star sidebar workbench with 30+ ecosystem extensions |
| Global prompt (built into this kit) | included | — | — | Lightweight, zero-dependency, instant — fixes the "repeat the same instruction every chat" pain |

> About the numbers: stars/forks come from `api.github.com/repos/...` (`stargazers_count` / `forks_count`); downloads from the npm downloads API `last-month` window (2026-10-19 ~ 2026-11-17). These figures describe the third-party projects themselves, not this kit — they are here to help you judge whether the tools are widely validated.

## Installation (beginner-friendly)

### Prerequisites

- DSH ≥ **0.2.2-rc.2** (verified on `0.2.2-rc.3`)
- Node.js ≥ 20

### Option 1: Download from GitHub (no command line)

1. On this repo's page click **Code → Download ZIP** and unzip it to a fixed folder (e.g. `D:\plugins\dsh-starter-kit`).
2. Open DSH → **Settings → Plugins → Add plugin**.
3. Select the unzipped `dsh-starter-kit` folder.
4. In the plugin list, confirm **DSH Starter Kit** is enabled.
5. **Hard-refresh the browser**: `Ctrl+Shift+R` (Mac: `Cmd+Shift+R`). Front-end plugins only appear after a refresh.

### Option 2: git clone

```bash
git clone https://github.com/SOCOOL666/dsh-starter-kit.git
```

Then pick the `dsh-starter-kit` folder in **Settings → Plugins → Add plugin** and hard-refresh.

### Option 3: npm (for CLI users)

```bash
npm install -g dsh-starter-kit
```

Then enable it in the plugin manager and hard-refresh the browser.

## What each plugin does and where to find it

### 1. 🛒 Visual plugin market · dshmarket

**What**: an app store inside DSH. When you want more plugins, browse and install here instead of searching GitHub.

**Where**: after install, under **Settings → Plugins** (bottom-left area). You can browse/search community plugins, install with one click, and see descriptions, stars and authors.

**When**: your first stop whenever you want to add a new capability (voice input, themes, workflows).

> Stars 12,897, 1.27M monthly downloads — the mainstream DSH plugin market.

### 2. 🗂️ Enhanced sidebar · dsh-better-sidebar

**What**: turns DSH's sidebar into a full workbench with a set of developer tools.

**Where**: the right-hand sidebar tabs (settings at **Settings → Side card**, bottom-left).

| Tab | What it does |
| --- | --- |
| 📂 Files | Lazy file tree with Git status colors, global search, drag-and-drop upload, multi-select, editable CodeMirror editor |
| 🌿 Git | Source control (staged/changes/commit), read-only commit graph (branches, tags, details) |
| 📝 Editor | Editable CodeMirror (stock preview is read-only), Markdown + Mermaid preview, sandboxed HTML preview |
| 🧩 Tasks | Live subagent topology, background task list with output and force-kill |
| 💬 Side chat (beta) | Codex-style side threads inheriting context, run independently, promote to top-level session |
| 🖥️ Bottom workbench | Drag-to-split panes, multiple terminal tabs (terminals provided by DSH itself) |

**When**: editing code, reviewing Git changes, managing files, or watching subagent tasks.

> Stars 5,235, 361k monthly downloads, 30+ ecosystem extensions.

### 3. ✍️ Global prompt (built in)

**What**: make one instruction apply to every new conversation automatically.

**Where**: **Settings → General → Global prompt (kit built-in)**.

**How**:

1. Type your prompt, e.g. `Always reply in English. Be concise and list key reasons at the end.`
2. Click **Save** — seeing **Saved** means success.
3. From then on, every new conversation and subagent includes it in the System Prompt.
4. To disable, clear the textarea and save.

Injected via `ctx.systemPrompt.section()` — never written into conversation history, no repeated context cost, effective on the next request without a restart, and persisted in the profile.

## About "install one and you're done" (a candid note)

The goal of this kit is to let beginners **start immediately and stop hunting for plugins in daily use**. After installing:

- ✅ Browse/install plugins → use the market
- ✅ File editing, Git, terminal, subagent tasks → use the enhanced sidebar
- ✅ Global prompt → use the built-in feature

To be honest: **no starter kit can guarantee you'll "never need another plugin."** The DSH ecosystem has hundreds of plugins, and you may later have specialized needs. This kit's value is that it sets up the **most common, most general** three things at once, and the included market makes future expansion trivial.

A more accurate claim: **install this kit and the everyday foundation is complete; when you want more, the marketplace is already at hand.**

## Compatibility

- DSH ≥ 0.2.2-rc.2 (verified on 0.2.2-rc.3)
- Core services used: `systemPrompt`, `webServer`, `settings` (all ship with DSH)
- Bundled third-party versions: `dshmarket@1.73.20`, `dsh-better-sidebar@0.32.1`

## FAQ

- **No sidebar/market after install?** Hard-refresh the browser (Ctrl+Shift+R).
- **Save fails?** Check that the active profile's `cordis.patch.yml` is writable.
- **Two sidebars?** If you previously installed dsh-better-sidebar manually, remove the old mount line from the profile to avoid double-mounting.
- **Prompt applies to new chats but not old ones?** Expected — it only affects conversations/requests created after saving.

## Security note

The bundled `dsh-better-sidebar` since v0.23.0 performs **no workspace-containment check** on its file routes (limited only by OS permissions) and includes sandboxed HTML previews. It is a powerful MIT-licensed community plugin, but that means a broad file-access surface. Disable the relevant features in its settings or uninstall it if that concerns you.

## License

[MIT](LICENSE) for this kit's own code. Bundled third-party plugins keep their own licenses (dshmarket and dsh-better-sidebar are both MIT).

## Credits

- [dsh-market/dsh-market](https://github.com/dsh-market/dsh-market) — visual plugin market
- [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) — enhanced sidebar
- [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) — DSH itself
