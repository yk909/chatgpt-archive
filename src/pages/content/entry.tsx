import { createRoot } from "react-dom/client";
import App from "@src/pages/content/app";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import { Provider } from "jotai";
import { CONTENT_VIEW_CONTAINER_ID } from "@src/constants";

refreshOnUpdate("pages/content");

const root = document.createElement("div");
root.id = CONTENT_VIEW_CONTAINER_ID;
document.body.appendChild(root);

const rootIntoShadow = document.createElement("div");

// const shadowRoot = root.attachShadow({ mode: "open" });
// shadowRoot.appendChild(rootIntoShadow);

if (window.location.pathname.includes("auth/login")) {
  console.log("Please login first");
} else {
  createRoot(root).render(
    <Provider>
      <App />
    </Provider>,
  );
}
