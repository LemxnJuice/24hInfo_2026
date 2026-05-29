import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import "./styles.css";

// Ensure we have a root element; if not, create one but keep any existing content as fallback
let rootEl = document.getElementById("root");
if (!rootEl) {
  rootEl = document.createElement("div");
  rootEl.id = "root";
  // Append to body but keep existing body content inside the root as fallback content
  // If body already has content, move it into the root to provide a visible fallback
  while (document.body.firstChild) {
    rootEl.appendChild(document.body.firstChild);
  }
  document.body.appendChild(rootEl);
}

function showGlobalError(message: string, stack?: string | null) {
  try {
    let overlay = document.getElementById("global-error-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "global-error-overlay";
      Object.assign(overlay.style, {
        position: "fixed",
        left: "10px",
        right: "10px",
        top: "10px",
        zIndex: "99999",
        background: "#fff7f7",
        color: "#900",
        padding: "12px",
        border: "1px solid #f5c2c2",
        borderRadius: "6px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
      });
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<strong>Erreur client :</strong> ${message}<br/><pre style="white-space:pre-wrap;background:#fff;padding:8px;border-radius:4px;margin-top:8px;">${stack || ""}</pre>`;
  } catch (e) {
    // ignore
  }
}

window.addEventListener("error", (ev) => {
  const msg = ev.message || (ev.error && ev.error.message) || "Unknown error";
  const stack = ev.error && ev.error.stack ? ev.error.stack : null;
  showGlobalError(msg, stack);
});

window.addEventListener("unhandledrejection", (ev: PromiseRejectionEvent) => {
  const reason = ev.reason;
  const msg =
    (reason && reason.message) || String(reason) || "Unhandled rejection";
  const stack = reason && reason.stack ? reason.stack : null;
  showGlobalError(msg, stack);
});

function mountApp() {
  try {
    const root = createRoot(rootEl as HTMLElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>,
    );
  } catch (err) {
    console.error("Error while mounting React app:", err);
    if (rootEl) {
      rootEl.innerHTML =
        '<div style="padding:2rem;color:#900">Une erreur client est survenue. Vérifie la console.</div>';
    }
    try {
      const e = err as any;
      showGlobalError(e?.message || String(e), e?.stack || null);
    } catch (_) {}
  }
}

mountApp();
