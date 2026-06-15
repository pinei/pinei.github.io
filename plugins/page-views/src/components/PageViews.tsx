import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"

// @hortus inlined classNames (avoids a runtime dep on @quartz-community/utils)
function classNames(displayClass?: string, ...classes: string[]): string {
  return [...classes, displayClass].filter((c) => c !== undefined && c !== "").join(" ")
}

// v4 injected the #page-views span into ContentMeta's segments. In v5 ContentMeta
// is an external plugin, so this is a standalone component placed in beforeBody
// just after content-meta. The GoatCounter host must match the analytics
// `websiteId` configured in quartz.config.default.yaml (pinei).
const PageViews: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return <span id="page-views" class={classNames(displayClass, "page-views")}></span>
}

PageViews.css = `
.page-views {
  color: var(--darkgray);
}
`

// Plain browser JS (ported from v4 goatcounter.inline.ts). Runs on every SPA nav.
// Moves the span into .content-meta so it appears inline after reading time (v4 behaviour).
PageViews.afterDOMLoaded = `
document.addEventListener("nav", () => {
  const el = document.querySelector("#page-views")
  if (!el) return

  // Graft into .content-meta so the comma CSS makes it read "2 min read, 12 views"
  const meta = document.querySelector(".content-meta")
  if (meta && !meta.contains(el)) meta.appendChild(el)

  const gc = window.goatcounter
  const path = (gc && gc.get_data && gc.get_data().p) || location.pathname
  fetch("https://pinei.goatcounter.com/counter/" + encodeURIComponent(path) + ".json")
    .then((r) => {
      if (r.status === 404) { el.innerText = "0 views"; return }
      if (!r.ok) return
      return r.json()
    })
    .then((data) => {
      if (data && data.count !== undefined) {
        el.innerText = data.count + " view" + (data.count != 1 ? "s" : "")
      }
    })
    .catch(() => {})
})
`

export default (() => PageViews) satisfies QuartzComponentConstructor
