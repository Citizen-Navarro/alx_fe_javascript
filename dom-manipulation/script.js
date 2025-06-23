let quotes = [];

// Save to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load from local storage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
      { text: "To be or not to be, that is the question.", category: "Philosophy" },
      { text: "Stay hungry, stay foolish.", category: "Inspiration" }
    ];
    saveQuotes();
  }
}

// Show random quote
function showRandomQuote(display) {
  if (quotes.length === 0) {
    display.textContent = "No quotes available.";
    return;
  }
  const rand = Math.floor(Math.random() * quotes.length);
  const quote = quotes[rand];
  display.innerHTML = `<p><strong>${quote.category}</strong>: "${quote.text}"</p>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Add a quote
function addQuote(textInput, catInput, display) {
  const text = textInput.value.trim();
  const category = catInput.value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  display.innerHTML = `<p><strong>${category}</strong>: "${text}"</p>`;
  postQuoteToServer(newQuote);

  textInput.value = "";
  catInput.value = "";
}

// Populate dropdown categories
function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  dropdown.innerHTML = `<option value="all">All Categories</option>`;
  const uniqueCats = [...new Set(quotes.map(q => q.category))];

  uniqueCats.forEach(cat => {
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

// Filter quotes by category
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
      const p = document.createElement("p");
      p.innerHTML = `<strong>${q.category}</strong>: "${q.text}"`;
      display.appendChild(p);
    });
  }
}

// Export quotes to JSON file
function exportQuotesToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
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
    } catch {
      alert("Invalid JSON format.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ✅ Post to mock API
async function postQuoteToServer(quote) {
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote)
  });
}

// ✅ Fetch from mock API
async function fetchQuotesFromServer() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await res.json();
  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: "Server"
  }));
}

// ✅ Sync quotes with server
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    const newOnes = serverQuotes.filter(sq => !quotes.some(lq => lq.text === sq.text));
    if (newOnes.length > 0) {
      quotes.push(...newOnes);
      saveQuotes();
      populateCategories();
      displayNotification("Quotes synced with server!");
    }
  } catch (err) {
    console.error("Sync failed:", err);
  }
}

// ✅ Notification UI
function displayNotification(msg) {
  let note = document.getElementById("syncNotification");
  if (!note) {
    note = document.createElement("div");
    note.id = "syncNotification";
    document.body.appendChild(note);
  }
  note.textContent = msg;
  note.style.cssText = `
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background: #4caf50;
    color: white;
    padding: 10px;
    z-index: 1000;
  `;
  setTimeout(() => note.remove(), 4000);
}

// ✅ Init everything
function initializeApp() {
  loadQuotes();
  const display = document.getElementById("quoteDisplay");

  document.getElementById("newQuote").addEventListener("click", () => {
    showRandomQuote(display);
  });

  document.getElementById("addQuoteButton").addEventListener("click", () => {
    addQuote(
      document.getElementById("newQuoteText"),
      document.getElementById("newQuoteCategory"),
      display
    );
  });

  document.getElementById("exportButton").addEventListener("click", exportQuotesToJson);
  populateCategories();

  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const q = JSON.parse(lastQuote);
    display.innerHTML = `<p><strong>${q.category}</strong>: "${q.text}"</p>`;
  }

  // ✅ Periodic sync
  setInterval(syncQuotes, 30000);
}

window.onload = initializeApp;
