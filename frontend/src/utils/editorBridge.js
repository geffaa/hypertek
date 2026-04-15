/**
 * editorBridge.js
 *
 * Activates ONLY when the URL contains ?_hedit=1  (added by the admin panel iframe).
 * - Injects a CSS highlight layer over every [data-edit-section] element.
 * - On click, sends a postMessage to the parent window (admin panel) with the
 *   section key so the admin can open the matching edit drawer.
 * - Listens for a "hypertek-refresh" message from admin to hot-reload content
 *   without a full page refresh.
 */

const EDIT_FLAG = "_hedit";
const MSG_CLICK   = "hypertek-section-click";
const MSG_REFRESH = "hypertek-refresh";

function isEditorMode() {
  return new URLSearchParams(window.location.search).has(EDIT_FLAG);
}

function injectStyles() {
  if (document.getElementById("__ht-editor-styles")) return;

  const style = document.createElement("style");
  style.id = "__ht-editor-styles";
  style.textContent = `
    /* Base: make every editable section a positioned container */
    [data-edit-section] {
      position: relative !important;
      cursor: pointer !important;
      transition: outline 0.15s ease !important;
    }

    /* Blue ring on hover */
    [data-edit-section]:hover {
      outline: 2px solid rgba(59, 130, 246, 0.75) !important;
      outline-offset: -2px !important;
    }

    /* Section label badge — top-left corner */
    [data-edit-section]::before {
      content: attr(data-edit-label);
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 99999;
      background: rgba(59, 130, 246, 0.92);
      color: #fff;
      font-family: system-ui, sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
      padding: 4px 10px;
      border-radius: 6px;
      opacity: 0;
      pointer-events: none;
      white-space: nowrap;
      backdrop-filter: blur(4px);
      transition: opacity 0.15s ease;
    }

    /* "Click to edit" pill — bottom-right corner */
    [data-edit-section]::after {
      content: "✏  Click to edit";
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 99999;
      background: rgba(59, 130, 246, 0.92);
      color: #fff;
      font-family: system-ui, sans-serif;
      font-size: 11px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 20px;
      opacity: 0;
      pointer-events: none;
      white-space: nowrap;
      backdrop-filter: blur(4px);
      transition: opacity 0.15s ease;
    }

    /* Show badges on hover */
    [data-edit-section]:hover::before,
    [data-edit-section]:hover::after {
      opacity: 1 !important;
    }

    /* Active (clicked) flash */
    [data-edit-section].ht-editing {
      outline: 2px solid rgba(59, 130, 246, 1) !important;
      outline-offset: -2px !important;
      background-color: rgba(59, 130, 246, 0.04) !important;
    }
  `;
  document.head.appendChild(style);
}

function attachClickListeners() {
  document.addEventListener(
    "click",
    (e) => {
      const section = e.target.closest("[data-edit-section]");
      if (!section) return;

      e.preventDefault();
      e.stopPropagation();

      // Visual feedback
      document.querySelectorAll(".ht-editing").forEach((el) =>
        el.classList.remove("ht-editing")
      );
      section.classList.add("ht-editing");

      window.parent.postMessage(
        {
          type: MSG_CLICK,
          key:   section.dataset.editSection,
          label: section.dataset.editLabel || section.dataset.editSection,
        },
        "*"
      );
    },
    true // capture phase — fires before component onClick handlers
  );
}

function listenForRefresh() {
  window.addEventListener("message", (e) => {
    if (!e.data || e.data.type !== MSG_REFRESH) return;
    // Clear the CMS localStorage cache so the next load fetches fresh data
    try { localStorage.removeItem("cms_cache"); } catch {}
    // The admin will reload the iframe after a short delay — nothing else needed here
  });
}

/** Call this once at app startup. Does nothing outside editor mode. */
export function initEditorBridge() {
  if (!isEditorMode()) return;
  injectStyles();
  attachClickListeners();
  listenForRefresh();
  console.info("[HyperTek Editor] Visual editor active — hover sections to highlight, click to edit.");
}
