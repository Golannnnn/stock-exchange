const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const searchResults = document.querySelector("#search-results");
const spinner = document.querySelector("#spinner");

const fetchResults = async () => {
  const res = await fetch(
    `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/search?query=${searchInput.value}&limit=10&exchange=NASDAQ`
  );
  const json = await res.json();
  return json;
};

const fetchCompanyInfo = async (obj) => {
  const res = await fetch(
    `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/${obj.symbol}`
  );
  const json = await res.json();
  return json;
};

const displayResults = async () => {
  toggleSpinner();
  const data = await fetchResults();
  toggleSpinner();

  data.forEach(async (obj) => {
    const company = await fetchCompanyInfo(obj);
    if (!company.profile) return "";
    searchResults.innerHTML += `<a class="border-bottom text-decoration-none mb-2" href="./company.html?symbol=${
      obj.symbol
    }">
    <img class="search-image" src="${company.profile.image}" />
      ${obj.name} <span class="small-text">(${obj.symbol}) ${isNumberNegative(
      company.profile.changesPercentage
    )}</span>
    </a>`;
  });
};

const isNumberNegative = (n) => {
  if (n >= 0) {
    return `<span class="positive">(${n}%)</span>`;
  } else {
    return `<span class="negative">(${n}%)</span>`;
  }
};

const toggleSpinner = () => {
  searchResults.innerHTML = "";
  spinner.classList.toggle("d-none");
  searchResults.classList.toggle("d-none");
};

const handleSearchButtonClick = () => {
  displayResults();
};

searchButton.addEventListener("click", handleSearchButtonClick);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearchButtonClick();
  }
});
