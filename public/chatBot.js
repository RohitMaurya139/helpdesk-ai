(function () {
  const api_Url = "https://helpdesk-ai-gold.vercel.app/api/chat";

  const scriptTag = document.currentScript;
  const ownerId = scriptTag.getAttribute("data-owner-id");

  if (!ownerId) {
    console.log("owner id not found");
    return;
  }

  // ── Markdown → HTML converter ──────────────────────────────────────────────
  function markdownToHTML(text) {
    return (
      text
        // Bold: **text**
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Italic: *text* or _text_  (single asterisk that is NOT a bullet)
        .replace(/(?<!\n)\*(?!\s)(.*?)\*/g, "<em>$1</em>")
        // Inline code: `code`
        .replace(
          /`([^`]+)`/g,
          '<code style="background:#d1d5db;padding:1px 5px;border-radius:4px;font-size:12px;">$1</code>',
        )
        // Bullet lines: lines starting with "* " or "- "
        .replace(/^[\*\-]\s+(.+)/gm, "<li>$1</li>")
        // Wrap consecutive <li> elements in a <ul>
        .replace(
          /(<li>[\s\S]*?<\/li>)(\s*<li>[\s\S]*?<\/li>)*/g,
          (match) =>
            `<ul style="margin:6px 0;padding-left:18px;list-style:disc;">${match}</ul>`,
        )
        // Headings: ### text
        .replace(
          /^###\s+(.+)/gm,
          '<strong style="display:block;margin-top:6px;">$1</strong>',
        )
        .replace(
          /^##\s+(.+)/gm,
          '<strong style="display:block;font-size:14px;margin-top:6px;">$1</strong>',
        )
        // Line breaks
        .replace(/\n/g, "<br/>")
    );
  }

  // ── Toggle Button ──────────────────────────────────────────────────────────
  const button = document.createElement("div");
  button.innerHTML = "🗨️";

  Object.assign(button.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#000",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "22px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.35)",
    zIndex: "999999",
    transition: "transform 0.2s ease",
  });

  button.onmouseenter = () => (button.style.transform = "scale(1.1)");
  button.onmouseleave = () => (button.style.transform = "scale(1)");

  document.body.appendChild(button);

  // ── Chat Box ───────────────────────────────────────────────────────────────
  const box = document.createElement("div");
  Object.assign(box.style, {
    position: "fixed",
    bottom: "90px",
    right: "24px",
    width: "320px",
    height: "420px",
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
    display: "none",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: "999999",
    fontFamily: "Inter, system-ui, sans-serif",
  });

  box.innerHTML = `
    <div style="
      background:#000;
      color:#fff;
      padding:12px 14px;
      font-size:14px;
      display:flex;
      justify-content:space-between;
      align-items:center;
    ">
      <span>ChatBot</span>
      <span id="chat-close" style="cursor:pointer;font-size:16px;line-height:1;">╳</span>
    </div>

    <div id="chat-messages" style="
      flex:1;
      padding:12px;
      overflow-y:auto;
      background:#f9fafb;
      display:flex;
      flex-direction:column;
    "></div>

    <div style="
      display:flex;
      border-top:1px solid #e5e7eb;
      padding:8px;
      gap:6px;
      background:#fff;
    ">
      <input id="chat-input" type="text"
        style="
          flex:1;
          padding:8px 10px;
          border:1px solid #d1d5db;
          border-radius:8px;
          font-size:13px;
          outline:none;
          font-family:inherit;
        "
        placeholder="Type a message…"
      />
      <button id="chat-send" style="
        padding:8px 12px;
        border:none;
        background:#000;
        color:#fff;
        border-radius:8px;
        font-size:13px;
        cursor:pointer;
        font-family:inherit;
      ">Send</button>
    </div>
    `;

  document.body.appendChild(box);

  // ── Toggle visibility ──────────────────────────────────────────────────────
  button.onclick = () => {
    box.style.display = box.style.display === "none" ? "flex" : "none";
  };

  document.querySelector("#chat-close").onclick = () => {
    box.style.display = "none";
  };

  // ── Refs ───────────────────────────────────────────────────────────────────
  const input = document.querySelector("#chat-input");
  const sendBtn = document.querySelector("#chat-send");
  const messageArea = document.querySelector("#chat-messages");

  // ── Add message bubble ─────────────────────────────────────────────────────
  function addMessage(text, from) {
    const bubble = document.createElement("div");

    // Render markdown only for AI messages
    bubble.innerHTML = from === "ai" ? markdownToHTML(text) : text;

    Object.assign(bubble.style, {
      maxWidth: "78%",
      padding: "8px 12px",
      borderRadius: "14px",
      fontSize: "13px",
      lineHeight: "1.5",
      marginBottom: "8px",
      alignSelf: from === "user" ? "flex-end" : "flex-start",
      background: from === "user" ? "#000" : "#e5e7eb",
      color: from === "user" ? "#fff" : "#111",
      borderTopRightRadius: from === "user" ? "4px" : "14px",
      borderTopLeftRadius: from === "user" ? "14px" : "4px",
      wordBreak: "break-word",
    });

    messageArea.appendChild(bubble);
    messageArea.scrollTop = messageArea.scrollHeight;
  }

  // ── Send message ───────────────────────────────────────────────────────────
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    // Typing indicator
    const typing = document.createElement("div");
    typing.textContent = "Typing…";
    Object.assign(typing.style, {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "8px",
      alignSelf: "flex-start",
    });
    messageArea.appendChild(typing);
    messageArea.scrollTop = messageArea.scrollHeight;

    try {
      const response = await fetch(api_Url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, message: text }),
      });

      const data = await response.json();
      messageArea.removeChild(typing);

      // Handle various response shapes gracefully
      const reply =
        typeof data === "string"
          ? data
          : data.reply ||
          data.message ||
          data.text ||
          data.answer ||
          JSON.stringify(data);

      addMessage(reply || "Something went wrong.", "ai");
    } catch (error) {
      console.error(error);
      messageArea.removeChild(typing);
      addMessage("Something went wrong. Please try again.", "ai");
    }
  }

  sendBtn.onclick = sendMessage;

  // Allow Enter key to send
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
