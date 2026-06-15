import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

// @hortus Explorer filtering (v4 `Component.Explorer({ filterFn })`) needs NO override in v5:
//   - hiding the `tags` folder is the Explorer's DEFAULT filterFn (slugSegment !== "tags").
//   - hiding `underground: true` notes is handled by the local ./plugins/underground
//     transformer, which aliases `underground` onto v5's native `unlisted` mechanism
//     (content-index then excludes the page from Explorer/search/RSS, still accessible).

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
