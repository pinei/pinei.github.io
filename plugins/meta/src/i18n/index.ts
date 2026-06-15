import enUS from "./locales/en-US"
import enGB from "./locales/en-GB"
import ptBR from "./locales/pt-BR"

// @hortus Meta translations live with the plugin (v5 plugins own their i18n
// instead of patching core quartz/i18n). Labels and value-translations are
// looked up per frontmatter attribute; missing entries fall back to the raw key/value.
export interface MetaTranslation {
  components: {
    meta: {
      title: string
      attributes?: Record<string, string>
      translations?: Record<string, Record<string, string>>
    }
  }
}

const locales: Record<string, MetaTranslation> = {
  "en-US": enUS,
  "en-GB": enGB,
  "pt-BR": ptBR,
}

export function i18n(locale?: string): MetaTranslation {
  return (locale && locales[locale]) || enUS
}
