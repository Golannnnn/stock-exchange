const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const searchResults = document.querySelector("#search-results");
const spinner = document.querySelector("#spinner");

const handleSearchButtonClick = () => {
  const inputValue = searchInput.value;
  renderResults(inputValue);
};

const fetchResults = async (input) => {
  const res = await fetch(
    `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/search?query=${input}&limit=10&exchange=NASDAQ`
  );
  const json = await res.json();
  return json;
};

const renderResults = async (input) => {
  toggleSpinner();
  const data = await fetchResults(input);
  toggleSpinner();
  data.forEach((obj) => {
    searchResults.innerHTML += `<a class="border-bottom text-decoration-none" href="./company.html?symbol=${obj.symbol}">${obj.name} (${obj.symbol})</a>`;
  });
};

const toggleSpinner = () => {
  searchResults.innerHTML = "";
  spinner.classList.toggle("d-none");
  searchResults.classList.toggle("d-none");
};

searchButton.addEventListener("click", handleSearchButtonClick);
