window.AUCKLAND_EXPLORER_API_URL =
    window.AUCKLAND_EXPLORER_API_URL ||
    (["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://127.0.0.1:8000/api/chat"
        : "https://auckland-explorer-ai-agent-api.onrender.com/api/chat");
