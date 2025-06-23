// ==========================
// Core Quotes & Storage Logic
// ==========================

let quotes = [];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const saved = localStorage.getItem("quotes");
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    quotes = [
      { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
      { text: "To be or not to be, that is the question.", category: "Philosophy" },
      { text: "Stay hungry, stay foolish.", category: "Inspiration" }
    ];
    saveQuotes();
  }
}

function showRandomQuote(quoteDisplay) {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `<p><strong>${quote.category}</strong>: "${quote.text}"</p>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function addQuote(quoteInput, categoryInput, quoteDisplay) {
  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim();
  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);

  quoteDisplay.innerHTML = `<p><strong>${category}</strong>: "${text}"</p>`;
  quoteInput.value = "";
  categoryInput.value = "";

  populateCategories();
  saveQuotes();

  // Simulate POST to server
  postQuoteToServer(newQuote);
}

function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  dropdown.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    dropdown.appendChild(opt);
  });

  const last = localStorage.getItem("lastFilter");
  if (last) {
    dropdown.value = last;
    filterQuotes();
  }
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", selectedCategory);

  const display = document.getElementById("quoteDisplay");
  display.innerHTML = "";

  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    display.innerHTML = `<p>No quotes found for this category.</p>`;
  } else {
    filtered.forEach(q => {
      const el = document.createElement("p");
      el.innerHTML = `<strong>${q.category}</strong>: "${q.text}"`;
      display.appendChild(el);
    });
  }
}

// ==========================
// JSON Import/Export
// ==========================

function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      }
    } catch (err) {
      alert("Invalid JSON format.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ==========================
// Server Sync (Simulated)
// ==========================

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // simulated endpoint

function fetchQuotesFromServer() {
  fetch(SERVER_URL)
    .then(res => res.json())
    .then(data => {
      const simulatedQuotes = data.slice(0, 5).map(post => ({
        text: post.title,
        category: "ServerSync"
      }));

      let newQuotes = simulatedQuotes.filter(sq =>
        !quotes.some(lq => lq.text === sq.text)
      );

      if (newQuotes.length > 0) {
        quotes.push(...newQuotes);
        saveQuotes();
        populateCategories();
        notifyUser(`${newQuotes.length} new quotes synced from server.`);
      }
    })
    .catch(err => {
      console.warn("Failed to fetch server quotes:", err);
    });
}

function postQuoteToServer(quote) {
  fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify(quote)
  })
    .then(res => res.json())
    .then(data => {
      console.log("Quote synced to server:", data);
    });
}

// ==========================
// Notifications
// ==========================

function notifyUser(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.cssText = `
    background: #222;
    color: #fff;
    padding: 10px;
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
  `;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 3000);
}

// ==========================
// App Initialization
// ==========================

function initializeApp() {
  loadQuotes();

  const quoteDisplay = document.getElementById("quoteDisplay");

  document.getElementById("newQuote").addEventListener("click", () => {
    showRandomQuote(quoteDisplay);
  });

  document.getElementById("addQuoteButton").addEventListener("click", () => {
    addQuote(
      document.getElementById("newQuoteText"),
      document.getElementById("newQuoteCategory"),
      quoteDisplay
    );
  });

  document.getElementById("exportButton").addEventListener("click", exportQuotesToJson);

  populateCategories();

  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const q = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `<p><strong>${q.category}</strong>: "${q.text}"</p>`;
  }

  // ⏱️ Start server sync every 30 seconds
  setInterval(fetchQuotesFromServer, 30000);
}

window.onload = initializeApp;
