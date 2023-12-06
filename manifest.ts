import { CHATGPT_DOMAIN_URL } from "./src/constants";
import packageJson from "./package.json";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  permissions: ["storage", "tabs"],
  options_page: "src/pages/options/index.html",
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: "icon-34.png",
  },
  icons: {
    "128": "icon-128.png",
  },
  content_scripts: [
    {
      // matches: [`${CHATGPT_DOMAIN_URL}/*`],
      matches: ["https://*/*", "http://*/*", "<all_urls>"],
      js: ["src/pages/content/index.js"],
      // KEY for cache invalidation
      // css: ["assets/css/Style.chunk.css"],
      css: [],
    },
  ],
  devtools_page: "src/pages/devtools/index.html",
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "icon-128.png",
        "icon-34.png",
      ],
      // matches: [`${CHATGPT_DOMAIN_URL}/*`],
      matches: ["https://*/*", "http://*/*", "<all_urls>"],
    },
  ],
};

export default manifest;
