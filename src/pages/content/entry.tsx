import { createRoot } from "react-dom/client";
import App from "@src/pages/content/app";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import { Provider } from "jotai";
import { initializeShadowRoot, shadowRoot } from "./root";

refreshOnUpdate("pages/content");

initializeShadowRoot();

const cssPath = "assets/css/Style.chunk.css";

const cssFullPath = chrome.runtime.getURL(cssPath);

if (window.location.pathname.includes("auth/login")) {
  console.log("Please login first");
} else {
  createRoot(shadowRoot).render(
    <Provider>
      <link rel="stylesheet" href={cssFullPath} />
      <App />
    </Provider>
  );
}
