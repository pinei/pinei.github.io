import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { i18n } from "../i18n"

// @hortus inlined classNames (avoids a runtime dep on @quartz-community/utils)
function classNames(displayClass?: string, ...classes: string[]): string {
  return [...classes, displayClass].filter((c) => c !== undefined && c !== "").join(" ")
}

interface MetaOptions {
  attributes: string[]
}

const defaultOptions: MetaOptions = {
  attributes: ["lang", "style", "published", "forecast", "source", "website", "maturity"],
}

// Converted from v4 meta.scss ($semiBoldWeight -> 600). Plain CSS so the plugin
// needs no SCSS build step. The v4 OverflowList scroll wrapper is replaced by a
// plain <ul class="meta-list">.
const css = `
.meta {
  flex-direction: column;
}
.meta > h3 {
  font-size: 1rem;
  margin: 0;
}
.meta > ul.meta-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}
.meta > ul.meta-list > li {
  margin-bottom: 0.5em;
}
.meta > ul.meta-list > li > .meta-label {
  opacity: 0.5;
}
.meta > ul.meta-list > li > .meta-value {
  font-weight: 600;
}
`

export default ((opts?: Partial<MetaOptions>) => {
  const options: MetaOptions = { ...defaultOptions, ...opts }

  const Meta: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
    const frontmatter: { [key: string]: unknown } = fileData.frontmatter ?? {}
    const dict = i18n(cfg.locale).components.meta

    const metaAttributes: { label: string; value: string }[] = []
    for (const key of options.attributes) {
      if (frontmatter[key] === undefined || frontmatter[key] === null) continue
      const rawValue = String(frontmatter[key])
      const label = dict.attributes?.[key] ?? key
      const value = dict.translations?.[key]?.[rawValue] ?? rawValue
      metaAttributes.push({ label, value })
    }

    if (metaAttributes.length === 0) {
      return null
    }

    return (
      <div class={classNames(displayClass, "meta")}>
        <h3>{dict.title}</h3>
        <ul class="meta-list">
          {metaAttributes.map((attribute) => (
            <li key={attribute.label}>
              <div class="meta-label">{attribute.label}</div>
              <div class="meta-value">{attribute.value}</div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  Meta.css = css
  return Meta
}) satisfies QuartzComponentConstructor
