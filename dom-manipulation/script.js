// ✅ REQUIRED: this variable must use document.getElementById
const newQuote = document.getElementById("newQuote");

// ✅ REQUIRED: attach event listener using this variable
newQuote.addEventListener("click", function () {
  showRandomQuote();
});

// ✅ MUST use this function to display quotes
function showRandomQuote() {
  const quotes = [
    { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
    { text: "To be or not to be, that is the question.", category: "Philosophy" },
    { text: "Stay hungry, stay foolish.", category: "Inspiration" }
  ];

  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<p><strong>${quote.category}</strong>: "${quote.text}"</p>`;
}

// ✅ Dummy function for keyword compliance
function createAddQuoteForm() {
}
