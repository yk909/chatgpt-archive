import { CONTENT_VIEW_CONTAINER_ID } from "@src/constants";

export let shadowRoot;

export function initializeShadowRoot() {
  const root = document.createElement("div");
  root.id = CONTENT_VIEW_CONTAINER_ID;
  document.body.appendChild(root);
  root.attachShadow({ mode: "open" });
  const reactRoot = document.createElement("div");
  reactRoot.id = CONTENT_VIEW_CONTAINER_ID;
  root.shadowRoot.appendChild(reactRoot);
  shadowRoot = reactRoot;
  return shadowRoot;
}
