# Hortus customizations on Quartz v5

This fork of Quartz **v5** re-applies the customizations from the previous v4 site
(*"a digital garden" / hortus*). v5 moved to a YAML config and a plugin-package
architecture, so the customizations are applied differently than in v4 — see the mapping
below. Custom code is tagged with the marker comment **`@hortus`** (grep for it).

> **Status: applied and verified.** Everything below was built and rendered with a real
> `npx quartz build` (Quartz v5.0.0) — see [§3](#3-verification). Full v4→v5 mapping
> reference: `../CUSTOMIZATION_SPEC.md`.

---

## 1. What was applied

### Core config — `quartz.config.default.yaml`
| Setting | Value |
|---|---|
| `pageTitle` | `a digital garden` |
| `baseUrl` | `pinei.github.io` |
| `analytics` | `goatcounter`, `websiteId: pinei` |
| `theme.typography` | header `Schibsted Grotesk` / body **`Inconsolata`** / code `IBM Plex Mono` |
| `fonts` plugin `options` | **same trio** — header/body/code. Required because v5's `fonts` plugin re-declares `--bodyFont`/`--headerFont`/`--codeFont` from its *own* options (defaulting to Source Sans Pro) and is **decoupled from `theme.typography`**. Setting only the theme leaves the article font as the plugin's default. |
| Graph plugin | **disabled** (replaced by the Meta panel) |

### Core-local files (patched directly, same as v4)
| File | Change |
|---|---|
| `quartz/util/theme.ts` | `--primaryGreen` / `--secondaryGreen` CSS vars in both light & dark `:root` (the v4 dark-mode typo `--privaryGreen` is **fixed**) |
| `quartz/styles/variables.scss` | proportional grid: `$sidePanelWidth: 320fr`, desktop columns `320fr 720fr 320fr` |
| `quartz/styles/base.scss` | content `max-width` widened (+300px → +700px); mobile `.sidebar.left` `align-items: center` commented out |
| `quartz/styles/custom.scss` | `.page-title` pulled up under the Logo + centered; hidden on mobile |
| `quartz/static/hortus.svg` | master brand SVG (copied from v4) |
| `quartz/plugins/loader/gitLoader.ts` | **self-heal broken local-plugin symlinks**: the local-source cleanup now uses `lstatSync` (not `fs.existsSync`, which follows links and returns false for a dangling one). A stale `.quartz/plugins/*` symlink left by a build at a different path (e.g. Docker `/work` vs Codespace `/workspaces`) previously made `symlinkSync` throw `EEXIST`, which silently dropped **all** local plugins (Logo/Meta/Carousel/…). Now it's unlinked + recreated. |

### Custom features — local plugin packages in `plugins/`
v5 components/transformers must be **plugin packages**. Each is a self-contained local plugin
referenced as `source: ./plugins/<name>` in the config and symlinked + built on first build.

| Plugin | Type | Replaces v4 | Wiring |
|---|---|---|---|
| `plugins/logo` | component | `components/Logo.tsx` | layout: left, priority 5 (above page title) |
| `plugins/meta` | component (+ own i18n) | `components/Meta.tsx` + i18n patches | layout: right, priority 10 |
| `plugins/page-views` | component | the `ContentMeta.tsx` page-views span + `goatcounter.inline.ts` | layout: beforeBody, priority 21 |
| `plugins/carousel` | transformer | `plugins/transformers/carousel.ts` + script/styles | order 35 |

Each plugin's build scaffolding (`package.json`, `tsup.config.ts`, `tsconfig.json`,
`types/globals.d.ts`) mirrors the official `quartz-community` plugins. Key points learned
from the real plugins:
- Deps are **git deps**: `"@quartz-community/types": "github:quartz-community/types"` (not npm).
- `preact` is a peer + dev dependency; type imports use `import type` (verbatimModuleSyntax).
- The `tsup.config.ts` `inlineScriptPlugin` compiles `*.scss` → CSS string and `*.inline.ts`
  → browser-JS string (used by `carousel.inline.ts`).

Adaptations from v4:
- **Meta** carries its own i18n (`plugins/meta/src/i18n`, locales en-US/en-GB/pt-BR) instead of
  patching core `quartz/i18n`; renders a plain `<ul>` (core `OverflowList` isn't exposed to plugins).
- **PageViews** is a standalone `beforeBody` component (v5's `content-meta` is external and not
  patchable), so the view count renders on its own line. Host `pinei.goatcounter.com` must match
  the analytics `websiteId`.
- `classNames` is inlined in each component (avoids a runtime dep on `@quartz-community/utils`).

### Infra
- `.devcontainer.json`, `CUSTOM.md` ported from v4.
- `.gitignore` ignores `plugins/*/dist/`.
- `.github/workflows/deploy.yml` — GitHub Pages deploy (see §2 → Deployment). The 5 Quartz-internal workflows the v5 clone shipped (Cloudflare preview, Docker push, test matrix — all guarded to `jackyzha0/quartz`, inert in a fork) were removed.

---

## 2. How to build

```sh
npm install
npx quartz build --serve     # → http://localhost:8080
```

First build fetches the ~40 `github:quartz-community/*` plugins pinned in `quartz.lock.json`
(they ship pre-built `dist/`, so it's fast) and builds the 5 local `./plugins/*` (`npm install`
+ `tsup` per plugin — needs network for the `github:quartz-community/types` dep).

**Docker option** (used to verify this, since the `devcontainer` image already has Node 22):

```sh
docker run --rm -v "$PWD":/work -w /work \
  mcr.microsoft.com/devcontainers/javascript-node:22-bookworm \
  bash -lc "npm install && npx quartz build --serve"
```

> Build artifacts (`node_modules`, `plugins/*/dist`, `.quartz/`, `public/`) are all gitignored.
> If you build in Docker (Linux) and later build natively, delete `node_modules` and
> `plugins/*/node_modules` first (native binaries differ). `quartz.lock.json` re-records the
> local plugins' resolved paths on each build — that change is local-only, don't commit it.

### Deployment — GitHub Actions → GitHub Pages

`.github/workflows/deploy.yml` (ported from v4, adapted for v5) runs on push to **`v5`** (and
manual dispatch). It:

1. Checks out with `submodules: recursive` using **`secrets.PAT_TOKEN`** — required because the
   `content/` submodule (`pinei/quartz-content`) is **private** and the default `GITHUB_TOKEN`
   cannot read another private repo. `git submodule update --remote` then pulls the latest content.
2. Sets up Node from `.node-version`; caches `~/.npm` and **`.quartz/plugins`** (keyed on `quartz.lock.json`).
3. `npm ci` → **`npx quartz plugin install --from-config`** (community plugins **and** local
   `./plugins/*`; plain `plugin install` resolves only lockfile plugins and the build then fails on
   the unresolved locals) → `npx quartz build`.
4. Uploads `public/` and deploys via `actions/deploy-pages`.

**One-time setup:**
- Repo **Settings → Pages → Source: GitHub Actions**.
- Secret **`PAT_TOKEN`** = a token with read access to `pinei/quartz-content` (a fine-grained PAT
  scoped to *Contents: Read* on that repo is the least-privilege option).
- Change the trigger `branches:` if your deploy branch isn't `v5`.

Best-practice changes vs the original v4 workflow: removed the `continue-on-error` + npm-debug-log
hack and the `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` env; added npm + plugin caching; `node-version-file`
instead of a hardcoded version; kept least-privilege `permissions` and `concurrency`.

**Auto-deploy on content push.** `deploy.yml` also listens for `repository_dispatch` (type
`content-update`), and the content repo sends that event on every push via
`quartz-content/.github/workflows/notify-garden.yml` (a one-step `curl` to the
`POST /repos/pinei/pinei.github.io/dispatches` API). So: push to `quartz-content` → garden
rebuilds with the latest content (the deploy's `git submodule update --remote` pulls it). Setup:
- Add secret **`GARDEN_DISPATCH_TOKEN`** on the **`quartz-content`** repo — a token that can trigger
  workflows on `pinei.github.io` (classic `repo` scope, or fine-grained *Contents: Read and write*
  on `pinei.github.io`). This is separate from `PAT_TOKEN`.
- Commit `notify-garden.yml` in the **content** repo (`cd content && git add .github && git commit && git push`).
- ⚠️ `repository_dispatch` runs `deploy.yml` from `pinei.github.io`'s **default branch** — make sure
  `deploy.yml` is on the default branch (e.g. keep `v5` as default, or merge it to `main`).

---

## 3. Verification

Built with `npx quartz build` (Quartz v5.0.0) in the Node 22 container. All plugins
(community + 4 local: logo/meta/page-views/carousel) loaded with no errors. A test page confirmed the rendered HTML:

- **Logo** → `logo-container` + SVG in the left sidebar; `.logo .letter` fills resolve to
  `--primaryGreen` / `--secondaryGreen` (present in the built CSS, both light `#306030` and
  dark `#81c784`).
- **Meta** → `<div class="meta"><h3>Meta</h3>…` with i18n labels + value translations
  (`lang: en` → *Language / English*, `style: article` → *Style / Article*, `maturity: budding`
  → *Maturity / budding*).
- **PageViews** → `id="page-views"` span rendered.
- **Carousel** → a `<Carousel>` block became `.quartz-carousel` markup with per-image
  `.carousel-caption` (from `alt`).
- **Unlisted pages** → a page with `unlisted: true` is still built and accessible by direct URL
  but absent from `static/contentIndex.json` → hidden from Explorer, search, RSS, and sitemap
  (handled natively by the `unlisted-pages` community plugin).

---

## 4. How the v4 Explorer filter maps (both halves resolved natively)

The v4 `Component.Explorer({ filterFn })` needed **no TS override** in v5:

1. **Hiding the `tags` folder** is the v5 Explorer's **default** `filterFn`
   (`node.slugSegment !== "tags"`). Nothing to do.
2. **Hiding previously-`underground` notes** → all content frontmatter was migrated from
   `underground: true` to `unlisted: true`. The native `unlisted-pages` plugin (already
   enabled in the config) handles this: it sets `file.data.unlisted = true`, and the
   `content-index` emitter skips any file with that flag — hiding it from Explorer, search,
   RSS, and sitemap.

The v4 `contentIndex.tsx` frontmatter patch is **not needed** — v5's content-index already
carries the fields the Explorer trie uses.

### Not ported (intentional)
- v4 `citations.ts` URL typo (`citation-stylelanguage`) — a bug; v5 citations is external + disabled.
- v4 `.bak` development leftovers.

---

## 5. Remaining manual step & tuning

- **Content submodule** — v4 wired `content/` to `github:pinei/quartz-content` (see `CUSTOM.md`).
  The v5 clone ships a plain `content/` folder; set up the submodule when ready:
  ```sh
  rm -rf content && git submodule add -b main git@github.com:pinei/quartz-content.git content
  ```
- **Carousel order** (`order: 35`) controls when the `<Carousel>` rewrite runs among transformers.
- **Layout priorities** (logo 5 / meta 10 / page-views 21) live under each plugin's `layout:` block in the config.
