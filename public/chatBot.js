(function () {
  // ── Derive API URL from the script's own src ────────────────────────────────
  var scriptTag = document.currentScript;
  var scriptSrc = scriptTag.getAttribute("src");
  var baseUrl = scriptSrc.replace(/\/chatBot\.js$/, "");
  var api_Url = baseUrl + "/api/chat";

  // Support both apiKey (new) and ownerId (legacy)
  var apiKey = scriptTag.getAttribute("data-api-key");
  var ownerId = scriptTag.getAttribute("data-owner-id");

  if (!apiKey && !ownerId) {
    console.error("[HelpDesk AI] data-api-key attribute is required.");
    return;
  }

  // ── Conversation history ──────────────────────────────────────────────────
  var chatHistory = [];

  // ── HTML sanitizer (XSS protection) ───────────────────────────────────────
  function sanitizeHTML(str) {
    var temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  }

  // ── Markdown → HTML converter (operates on sanitized text) ────────────────
  function markdownToHTML(text) {
    // First sanitize to prevent XSS, then apply markdown formatting
    var safe = sanitizeHTML(text);
    return (
      safe
        // Bold: **text**
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Italic: *text* (not bullets)
        .replace(/(?<!\n)\*(?!\s)(.*?)\*/g, "<em>$1</em>")
        // Inline code: `code`
        .replace(
          /`([^`]+)`/g,
          '<code style="background:#d1d5db;padding:1px 5px;border-radius:4px;font-size:12px;">$1</code>',
        )
        // Bullet lines: * or -
        .replace(/^[\*\-]\s+(.+)/gm, "<li>$1</li>")
        // Wrap consecutive <li> in <ul>
        .replace(
          /(<li>[\s\S]*?<\/li>)(\s*<li>[\s\S]*?<\/li>)*/g,
          function (match) {
            return (
              '<ul style="margin:6px 0;padding-left:18px;list-style:disc;">' +
              match +
              "</ul>"
            );
          },
        )
        // Headings
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
  var button = document.createElement("button");
  button.setAttribute("aria-label", "Open customer support chat");
  button.setAttribute("aria-expanded", "false");
  button.textContent = "Chat";

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
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "Inter, system-ui, sans-serif",
    border: "none",
    boxShadow: "0 15px 40px rgba(0,0,0,0.35)",
    zIndex: "999999",
    transition: "transform 0.2s ease",
  });

  button.onmouseenter = function () {
    button.style.transform = "scale(1.1)";
  };
  button.onmouseleave = function () {
    button.style.transform = "scale(1)";
  };

  document.body.appendChild(button);

  // ── Chat Box ───────────────────────────────────────────────────────────────
  var box = document.createElement("div");
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Customer support chat");
  box.setAttribute("aria-hidden", "true");

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

  box.innerHTML =
    '<div style="' +
    "background:#000;" +
    "color:#fff;" +
    "padding:12px 14px;" +
    "font-size:14px;" +
    "display:flex;" +
    "justify-content:space-between;" +
    "align-items:center;" +
    '">' +
    "<span>Customer Support</span>" +
    '<button id="chat-close" aria-label="Close chat" style="' +
    "cursor:pointer;font-size:16px;line-height:1;" +
    "background:none;border:none;color:#fff;padding:4px;" +
    '">&#x2715;</button>' +
    "</div>" +
    '<div id="chat-messages" role="log" aria-live="polite" style="' +
    "flex:1;" +
    "padding:12px;" +
    "overflow-y:auto;" +
    "background:#f9fafb;" +
    "display:flex;" +
    "flex-direction:column;" +
    '"></div>' +
    '<div style="' +
    "display:flex;" +
    "border-top:1px solid #e5e7eb;" +
    "padding:8px;" +
    "gap:6px;" +
    "background:#fff;" +
    '">' +
    '<input id="chat-input" type="text" ' +
    'aria-label="Type a message" ' +
    'style="' +
    "flex:1;" +
    "padding:8px 10px;" +
    "border:1px solid #d1d5db;" +
    "border-radius:8px;" +
    "font-size:13px;" +
    "outline:none;" +
    "font-family:inherit;" +
    '" ' +
    'placeholder="Type a message..." />' +
    '<button id="chat-send" aria-label="Send message" style="' +
    "padding:8px 12px;" +
    "border:none;" +
    "background:#000;" +
    "color:#fff;" +
    "border-radius:8px;" +
    "font-size:13px;" +
    "cursor:pointer;" +
    "font-family:inherit;" +
    '">Send</button>' +
    "</div>";

  document.body.appendChild(box);

  // ── Toggle visibility ──────────────────────────────────────────────────────
  function openChat() {
    box.style.display = "flex";
    box.setAttribute("aria-hidden", "false");
    button.setAttribute("aria-expanded", "true");
    var inputEl = document.getElementById("chat-input");
    if (inputEl) inputEl.focus();
  }

  function closeChat() {
    box.style.display = "none";
    box.setAttribute("aria-hidden", "true");
    button.setAttribute("aria-expanded", "false");
    button.focus();
  }

  button.onclick = function () {
    if (box.style.display === "none") {
      openChat();
    } else {
      closeChat();
    }
  };

  document.getElementById("chat-close").onclick = closeChat;

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && box.style.display !== "none") {
      closeChat();
    }
  });

  // ── Refs ───────────────────────────────────────────────────────────────────
  var input = document.getElementById("chat-input");
  var sendBtn = document.getElementById("chat-send");
  var messageArea = document.getElementById("chat-messages");

  // ── Add message bubble ─────────────────────────────────────────────────────
  function addMessage(text, from) {
    var bubble = document.createElement("div");

    // Render markdown for AI messages, plain text (sanitized) for user
    if (from === "ai") {
      bubble.innerHTML = markdownToHTML(text);
    } else {
      bubble.textContent = text;
    }

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
    var text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    chatHistory.push({ role: "user", content: text });
    input.value = "";

    // Typing indicator
    var typing = document.createElement("div");
    typing.textContent = "Typing...";
    typing.setAttribute("aria-label", "Agent is typing");
    Object.assign(typing.style, {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "8px",
      alignSelf: "flex-start",
    });
    messageArea.appendChild(typing);
    messageArea.scrollTop = messageArea.scrollHeight;

    // Disable input while waiting
    input.disabled = true;
    sendBtn.disabled = true;

    try {
      var body = { message: text, history: chatHistory.slice(-10) };
      if (apiKey) body.apiKey = apiKey;
      else body.ownerId = ownerId;

      var response = await fetch(api_Url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      messageArea.removeChild(typing);

      if (response.status === 429) {
        addMessage(
          "You're sending messages too quickly. Please wait a moment.",
          "ai",
        );
        return;
      }

      var data = await response.json();

      // Handle various response shapes
      var reply =
        typeof data === "string"
          ? data
          : data.reply ||
            data.message ||
            data.text ||
            data.answer ||
            JSON.stringify(data);

      var aiReply = reply || "Something went wrong.";
      addMessage(aiReply, "ai");
      chatHistory.push({ role: "ai", content: aiReply });
    } catch (error) {
      console.error(error);
      if (messageArea.contains(typing)) messageArea.removeChild(typing);
      addMessage("Something went wrong. Please try again.", "ai");
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.onclick = sendMessage;

  // Allow Enter key to send
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendMessage();
  });
})();
