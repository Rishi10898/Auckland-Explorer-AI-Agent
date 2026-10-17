/*
 * Purpose: select the chat API origin without embedding credentials.
 * Workflow: explicit override -> GitHub Pages production API -> local backend
 * for static development -> same-origin API for Render staging.
 */
window.AUCKLAND_EXPLORER_API_URL =
    window.AUCKLAND_EXPLORER_API_URL ||
    (window.location.hostname === "rishi10898.github.io"
        ? "https://auckland-explorer-ai-agent-api.onrender.com/api/chat"
        : ["localhost", "127.0.0.1"].includes(window.location.hostname)
            && window.location.port !== "8000"
            ? "http://127.0.0.1:8000/api/chat"
            : new URL("/api/chat", window.location.origin).href);
