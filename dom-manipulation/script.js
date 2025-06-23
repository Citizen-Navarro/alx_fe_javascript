// Load quotes from localStorage or initialize default quotes
let quotes = [];

const savedQuotes = localStorage.getItem("quotes");
if (savedQuotes) {
  quotes = JSON.parse(savedQuotes);
} else {
  quotes = [
    { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
    { text: "To be or not to be, that is the question.", category: "Philosophy" },
    { text: "Stay hungry, stay foolish.", category: "Inspiration" }
  ];
  saveQuotes();
}

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote and store it in sessionStorage
function showRandomQuote(quoteDisplay) {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `<p><strong>${quote.category}</strong>: "${quote.text}"</p>`;

  // Store last quote shown for the session
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Add a new quote, update category dropdown, and save
function addQuote(quoteInput, categoryInput, quoteDisplay) {
  const newText = quoteInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });

  quoteInput.value = "";
  categoryInput.value = "";

  quoteDisplay.innerHTML = `<p><strong>${newCategory}</strong>: "${newText}"</p>`;

  populateCategories(); // update categories dropdown live
  saveQuotes();
}

// Populate categories dropdown dynamically and restore last selected filter
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Extract unique categories
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  // Add each category as an option
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category filter from localStorage
  const lastFilter = localStorage.getItem("lastFilter");
  if (lastFilter) {
    categoryFilter.value = lastFilter;
    filterQuotes(); // immediately filter on page load
  }
}

// Filter quotes by selected category and update display
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  let filtered = quotes;
  if (selectedCategory !== "all") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  // Display filtered quotes
  filtered.forEach(q => {
    const quoteEl = document.createElement("p");
    quoteEl.innerHTML = `<strong>${q.category}</strong>: "${q.text}"`;
    quoteDisplay.appendChild(quoteEl);
  });
}

// Export quotes as a downloadable JSON file
function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  downloadLink.click();

  URL.revokeObjectURL(url);
}

// Import quotes from a JSON file and update storage
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid format: expected an array of quotes.");
      }
    } catch (error) {
      alert("Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize app: bind event listeners, load categories, restore last quote
function initializeApp() {
  const quoteDisplayElement = document.getElementById("quoteDisplay");

  const newQuoteBtn = document.getElementById("newQuote");
  newQuoteBtn.addEventListener("click", function () {
    showRandomQuote(quoteDisplayElement);
  });

  const addQuoteBtn = document.getElementById("addQuoteButton");
  const quoteInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  addQuoteBtn.addEventListener("click", function () {
    addQuote(quoteInput, categoryInput, quoteDisplayElement);
  });

  const exportBtn = document.getElementById("exportButton");
  exportBtn.addEventListener("click", exportQuotesToJson);

  // Populate categories dropdown and restore filter
  populateCategories();

  // Load last quote from sessionStorage if present
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    quoteDisplayElement.innerHTML = `<p><strong>${quote.category}</strong>: "${quote.text}"</p>`;
  }
}

window.onload = initializeApp;
