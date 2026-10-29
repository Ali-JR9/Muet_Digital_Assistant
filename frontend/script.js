document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const chatBox = document.getElementById("chat");
  const questionInput = document.getElementById("question");
  const sendBtn = document.getElementById("sendBtn");
  const chips = document.querySelectorAll(".chip");

  // Navigation Buttons
  const newChatBtn = document.getElementById("newChatBtn");
  const historyBtn = document.getElementById("historyBtn");
  const themeBtn = document.getElementById("themeBtn");
  const themeLabel = document.getElementById("themeLabel");
  const backToChatBtn = document.getElementById("backToChatBtn");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const historySearch = document.getElementById("historySearch");
  const historyList = document.getElementById("historyList");

  // Views
  const viewChat = document.getElementById("view-chat");
  const viewHistory = document.getElementById("view-history");
  const viewAbout = document.getElementById("view-about");
  const viewContact = document.getElementById("view-contact");
  const allViews = [viewChat, viewHistory, viewAbout, viewContact];

  // State Variables
  let chatHistory = JSON.parse(localStorage.getItem("muet_chat_history")) || [];

  // Initialize
  initTheme();

  // --- VIEW ROUTING ---
  function showView(targetView) {
    allViews.forEach((v) => {
      if (v) v.classList.remove("active");
    });
    if (targetView) targetView.classList.add("active");
  }

  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      showView(viewChat);
      chatBox.innerHTML = "";
      questionInput.value = "";
    });
  }

  if (historyBtn) {
    historyBtn.addEventListener("click", () => {
      renderHistory();
      showView(viewHistory);
    });
  }

  if (backToChatBtn) {
    backToChatBtn.addEventListener("click", () => showView(viewChat));
  }

  // --- THEME TOGGLE ---
  function initTheme() {
    const savedTheme = localStorage.getItem("muet_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (themeLabel) {
      themeLabel.textContent = savedTheme === "dark" ? "Light mode" : "Dark mode";
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("muet_theme", nextTheme);
      if (themeLabel) {
        themeLabel.textContent = nextTheme === "dark" ? "Light mode" : "Dark mode";
      }
    });
  }

  // --- CHAT & BACKEND FETCH ---
  async function handleSend(queryText) {
    const text = (queryText || questionInput.value).trim();
    if (!text) return;

    // Append User Message
    appendMessage(text, "user");
    questionInput.value = "";

    // Append Placeholder Bot Message
    const botMsgDiv = appendMessage("Searching prospectus...", "bot");

    try {
      const response = await fetch(`http://127.0.0.1:8001/search?q=${encodeURIComponent(text)}`);
      
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      
      let answerText = "";
      if (typeof data.results === "string") {
        answerText = data.results;
      } else if (Array.isArray(data.results) && data.results.length > 0) {
        answerText = data.results.join("\n\n");
      } else {
        answerText = "No relevant prospectus sections found for your query.";
      }

      botMsgDiv.innerText = answerText;

      // Save to History
      saveToHistory(text, answerText);

    } catch (err) {
      console.error(err);
      botMsgDiv.innerText = "Error connecting to FastAPI server. Make sure Uvicorn is running on port 8001.";
    }
  }

  function appendMessage(content, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.innerText = content;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
  }

  // Event Listeners for Input
  if (sendBtn) {
    sendBtn.addEventListener("click", () => handleSend());
  }

  if (questionInput) {
    questionInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleSend();
      }
    });
  }

  // Suggestion Chips
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      showView(viewChat);
      handleSend(chip.textContent);
    });
  });

  // --- HISTORY MANAGEMENT ---
  function saveToHistory(query, answer) {
    const item = {
      id: Date.now(),
      query: query,
      answer: answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    chatHistory.unshift(item);
    localStorage.setItem("muet_chat_history", JSON.stringify(chatHistory));
  }

  function renderHistory(filterText = "") {
    if (!historyList) return;
    historyList.innerHTML = "";

    const filtered = chatHistory.filter((item) =>
      item.query.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
      historyList.innerHTML = "<p style='color: var(--text-muted); padding: 0.5rem;'>No conversation history found.</p>";
      return;
    }

    filtered.forEach((item) => {
      const card = document.createElement("div");
      card.style.cssText = "padding: 0.75rem; border-bottom: 1px solid var(--border); cursor: pointer;";
      card.innerHTML = `
        <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${escapeHtml(item.query)}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">${item.timestamp}</div>
      `;
      card.addEventListener("click", () => {
        showView(viewChat);
        chatBox.innerHTML = "";
        appendMessage(item.query, "user");
        appendMessage(item.answer, "bot");
      });
      historyList.appendChild(card);
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      chatHistory = [];
      localStorage.removeItem("muet_chat_history");
      renderHistory();
    });
  }

  if (historySearch) {
    historySearch.addEventListener("input", (e) => {
      renderHistory(e.target.value);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});
