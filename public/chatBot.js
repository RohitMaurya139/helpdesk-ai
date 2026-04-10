(function () {
  const api_Url = "https://helpdesk-ai-gold.vercel.app/api/chat";

  const scriptTag = document.currentScript;
  const ownerId = scriptTag.getAttribute("data-owner-id");

  if (!ownerId) {
    console.log("owner id not found");
    return;
  }

  // ── Inject font ─────────────────────────────────────────────────────────────
  if (!document.querySelector('link[href*="Inter"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }

  // ── Inject keyframes ───────────────────────────────────────────────────────
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes hdai-fade-in { from { opacity: 0; transform: translateY(12px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes hdai-fade-out { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(12px) scale(0.96); } }
    @keyframes hdai-dot-bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-4px); } }
    @keyframes hdai-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    #hdai-box.hdai-open  { display: flex !important; animation: hdai-fade-in 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
    #hdai-box.hdai-close { animation: hdai-fade-out 0.2s ease forwards; }
    #hdai-messages::-webkit-scrollbar { width: 4px; }
    #hdai-messages::-webkit-scrollbar-track { background: transparent; }
    #hdai-messages::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 2px; }
    #hdai-input:focus { border-color: #a78bfa; box-shadow: 0 0 0 3px rgba(167,139,250,0.15); }
  `;
  document.head.appendChild(styleSheet);

  // ── Markdown → HTML converter ──────────────────────────────────────────────
  function markdownToHTML(text) {
    // Sanitize first to prevent XSS
    const temp = document.createElement("div");
    temp.textContent = text;
    const safe = temp.innerHTML;
    return (
      safe
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/(?<!\n)\*(?!\s)(.*?)\*/g, "<em>$1</em>")
        .replace(
          /`([^`]+)`/g,
          '<code style="background:#ede9fe;color:#6d28d9;padding:1px 6px;border-radius:4px;font-size:12px;font-family:monospace;">$1</code>',
        )
        .replace(/^[\*\-]\s+(.+)/gm, "<li>$1</li>")
        .replace(
          /(<li>[\s\S]*?<\/li>)(\s*<li>[\s\S]*?<\/li>)*/g,
          (match) =>
            `<ul style="margin:6px 0;padding-left:18px;list-style:disc;">${match}</ul>`,
        )
        .replace(
          /^###\s+(.+)/gm,
          '<strong style="display:block;margin-top:6px;">$1</strong>',
        )
        .replace(
          /^##\s+(.+)/gm,
          '<strong style="display:block;font-size:14px;margin-top:6px;">$1</strong>',
        )
        .replace(/\n/g, "<br/>")
    );
  }

  // ── Toggle Button ──────────────────────────────────────────────────────────
  const button = document.createElement("div");
  // Chat icon SVG
  button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

  Object.assign(button.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow:
      "0 8px 32px rgba(124,58,237,0.35), 0 2px 8px rgba(0,0,0,0.1)",
    zIndex: "999999",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  });

  button.onmouseenter = () => {
    button.style.transform = "scale(1.1)";
    button.style.boxShadow =
      "0 12px 40px rgba(124,58,237,0.45), 0 4px 12px rgba(0,0,0,0.12)";
  };
  button.onmouseleave = () => {
    button.style.transform = "scale(1)";
    button.style.boxShadow =
      "0 8px 32px rgba(124,58,237,0.35), 0 2px 8px rgba(0,0,0,0.1)";
  };

  document.body.appendChild(button);

  // ── Chat Box ───────────────────────────────────────────────────────────────
  const box = document.createElement("div");
  box.id = "hdai-box";
  Object.assign(box.style, {
    position: "fixed",
    bottom: "92px",
    right: "24px",
    width: "360px",
    maxWidth: "calc(100vw - 32px)",
    height: "500px",
    maxHeight: "calc(100vh - 120px)",
    background: "#fff",
    borderRadius: "20px",
    boxShadow:
      "0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)",
    display: "none",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: "999999",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  });

  box.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
      padding: 16px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="
          width:36px;height:36px;border-radius:50%;
          background:linear-gradient(135deg,#7c3aed,#6366f1);
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-size:13px;font-weight:700;
        ">AI</div>
        <div>
          <div style="color:#fff;font-size:14px;font-weight:600;">ChatBot</div>
          <div style="color:#a1a1aa;font-size:11px;display:flex;align-items:center;gap:5px;">
            <span style="width:6px;height:6px;border-radius:50%;background:#34d399;display:inline-block;"></span>
            Online
          </div>
        </div>
      </div>
      <div id="hdai-close" style="
        cursor:pointer;color:#71717a;padding:4px;border-radius:8px;
        display:flex;align-items:center;justify-content:center;
        transition:all 0.15s ease;
      " onmouseover="this.style.background='rgba(255,255,255,0.1)';this.style.color='#fff'"
         onmouseout="this.style.background='transparent';this.style.color='#71717a'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>
    </div>

    <div id="hdai-messages" style="
      flex:1;
      padding:16px;
      overflow-y:auto;
      background:linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%);
      display:flex;
      flex-direction:column;
      gap:12px;
    ">
      <div style="display:flex;gap:8px;align-items:flex-end;">
        <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#6366f1);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;">AI</div>
        <div style="background:#fff;border:1px solid #e4e4e7;border-radius:16px 16px 16px 4px;padding:10px 14px;font-size:13px;line-height:1.5;color:#18181b;max-width:78%;box-shadow:0 1px 2px rgba(0,0,0,0.04);">
          Hi! How can I help you today?
        </div>
      </div>
    </div>

    <div style="
      display:flex;
      border-top:1px solid #e4e4e7;
      padding:12px;
      gap:8px;
      background:#fff;
    ">
      <input id="hdai-input" type="text"
        style="
          flex:1;
          padding:10px 14px;
          border:1.5px solid #e4e4e7;
          border-radius:12px;
          font-size:13px;
          outline:none;
          font-family:inherit;
          background:#fafafa;
          transition: all 0.2s ease;
          color:#18181b;
        "
        placeholder="Type a message…"
      />
      <button id="hdai-send" style="
        padding:10px 16px;
        border:none;
        background:linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
        color:#fff;
        border-radius:12px;
        font-size:13px;
        font-weight:600;
        cursor:pointer;
        font-family:inherit;
        transition:all 0.2s ease;
        display:flex;
        align-items:center;
        gap:6px;
      " onmouseover="this.style.boxShadow='0 4px 16px rgba(124,58,237,0.35)'"
         onmouseout="this.style.boxShadow='none'">
        Send
      </button>
    </div>
  `;

  document.body.appendChild(box);

  // ── Toggle visibility ──────────────────────────────────────────────────────
  let isOpen = false;

  function openChat() {
    isOpen = true;
    box.classList.remove("hdai-close");
    box.classList.add("hdai-open");
    // Swap to close icon
    button.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    document.getElementById("hdai-input").focus();
  }

  function closeChat() {
    isOpen = false;
    box.classList.remove("hdai-open");
    box.classList.add("hdai-close");
    // Swap to chat icon
    button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
    setTimeout(() => {
      if (!isOpen) box.style.display = "none";
    }, 200);
  }

  button.onclick = () => {
    if (isOpen) closeChat();
    else openChat();
  };

  document.getElementById("hdai-close").onclick = closeChat;

  // ── Refs ───────────────────────────────────────────────────────────────────
  const input = document.getElementById("hdai-input");
  const sendBtn = document.getElementById("hdai-send");
  const messageArea = document.getElementById("hdai-messages");

  // ── Conversation history ──────────────────────────────────────────────────
  const chatHistory = [];

  // ── Add message bubble ─────────────────────────────────────────────────────
  function addMessage(text, from) {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      display: "flex",
      gap: "8px",
      alignItems: "flex-end",
      justifyContent: from === "user" ? "flex-end" : "flex-start",
    });

    let html = "";

    if (from === "ai") {
      html += `<div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#6366f1);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;">AI</div>`;
    }

    const bubble = document.createElement("div");
    if (from === "ai") {
      bubble.innerHTML = markdownToHTML(text);
    } else {
      bubble.textContent = text;
    }

    Object.assign(bubble.style, {
      maxWidth: "78%",
      padding: "10px 14px",
      fontSize: "13px",
      lineHeight: "1.55",
      wordBreak: "break-word",
      ...(from === "user"
        ? {
            background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
            color: "#fff",
            borderRadius: "16px 16px 4px 16px",
          }
        : {
            background: "#fff",
            color: "#18181b",
            border: "1px solid #e4e4e7",
            borderRadius: "16px 16px 16px 4px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }),
    });

    wrapper.innerHTML = html;
    wrapper.appendChild(bubble);
    messageArea.appendChild(wrapper);
    messageArea.scrollTop = messageArea.scrollHeight;
  }

  // ── Send message ───────────────────────────────────────────────────────────
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    chatHistory.push({ role: "user", content: text });
    input.value = "";

    // Animated typing indicator
    const typingWrapper = document.createElement("div");
    Object.assign(typingWrapper.style, {
      display: "flex",
      gap: "8px",
      alignItems: "flex-end",
    });
    typingWrapper.innerHTML = `
      <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#6366f1);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;">AI</div>
      <div style="background:#fff;border:1px solid #e4e4e7;border-radius:16px 16px 16px 4px;padding:12px 16px;display:flex;gap:4px;align-items:center;box-shadow:0 1px 2px rgba(0,0,0,0.04);">
        <span style="width:6px;height:6px;border-radius:50%;background:#a1a1aa;display:inline-block;animation:hdai-dot-bounce 1.4s infinite ease-in-out both;animation-delay:0s;"></span>
        <span style="width:6px;height:6px;border-radius:50%;background:#a1a1aa;display:inline-block;animation:hdai-dot-bounce 1.4s infinite ease-in-out both;animation-delay:0.16s;"></span>
        <span style="width:6px;height:6px;border-radius:50%;background:#a1a1aa;display:inline-block;animation:hdai-dot-bounce 1.4s infinite ease-in-out both;animation-delay:0.32s;"></span>
      </div>
    `;
    messageArea.appendChild(typingWrapper);
    messageArea.scrollTop = messageArea.scrollHeight;

    // Disable input while waiting
    input.disabled = true;
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.6";

    try {
      const response = await fetch(api_Url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          message: text,
          history: chatHistory.slice(-10),
        }),
      });

      messageArea.removeChild(typingWrapper);

      if (response.status === 429) {
        addMessage(
          "You're sending messages too quickly. Please wait a moment.",
          "ai",
        );
        return;
      }

      const data = await response.json();

      const reply =
        typeof data === "string"
          ? data
          : data.reply ||
            data.message ||
            data.text ||
            data.answer ||
            JSON.stringify(data);

      const aiReply = reply || "Something went wrong.";
      addMessage(aiReply, "ai");
      chatHistory.push({ role: "ai", content: aiReply });
    } catch (error) {
      console.error(error);
      if (messageArea.contains(typingWrapper))
        messageArea.removeChild(typingWrapper);
      addMessage("Something went wrong. Please try again.", "ai");
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      sendBtn.style.opacity = "1";
      input.focus();
    }
  }

  sendBtn.onclick = sendMessage;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
