const marqueeContainer = document.querySelector(".marquee-container");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const searchResults = document.querySelector("#results");
const spinner = document.querySelector("#spinner");

const fetchResults = async () => {
  try {
    const res = await fetch(
      `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/search?query=${searchInput.value}&limit=10&exchange=NASDAQ`
    );
    const json = await res.json();
    return json;
  } catch (err) {
    console.log(err);
  }
};

const fetchCompanyInfo = async (symbols) => {
  try {
    const res = await fetch(
      `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/${symbols}`
    );
    const json = await res.json();
    return json;
  } catch (err) {
    console.log(err);
  }
};

const joinSymbols = (data) => {
  const symbolsArray = data.map((obj) => obj.symbol);
  const joinedSymbolsArray = [];

  while (symbolsArray.length > 0) {
    joinedSymbolsArray.push(symbolsArray.splice(0, 3).join(","));
  }

  return joinedSymbolsArray;
};

const fetchAndCombinePromises = async (array) => {
  try {
    const promises = array.map(async (batch) => {
      const promise = await fetchCompanyInfo(batch);
      return promise;
    });

    const allPromises = await Promise.all(promises);
    return allPromises;
  } catch (err) {
    console.log(err);
  }
};

const displayResults = async () => {
  toggleSpinner();
  const data = await fetchResults();
  toggleSpinner();

  const symbolsArray = joinSymbols(data);
  const allPromises = await fetchAndCombinePromises(symbolsArray);

  allPromises.forEach((obj) => {
    if (obj.profile) {
      const company = obj.profile;
      modifyHTML(
        obj.symbol,
        company.image,
        company.companyName,
        company.changesPercentage
      );
    } else {
      obj.companyProfiles.forEach((obj) => {
        const company = obj.profile;
        modifyHTML(
          obj.symbol,
          company.image,
          company.companyName,
          company.changesPercentage
        );
      });
    }
  });
};

const modifyHTML = (sym, img, name, change) => {
  searchResults.innerHTML += `
  <tr>
    <td>${sym}</td>
    <td class="text-break">
    <a class="text-decoration-none" href="./company.html?symbol=${sym}"><img class="search-image" src="${img}" />${name}</a>
    </td>
    <td>${isNumberNegative(change)}</td>
  </tr>
  `;
};

const isNumberNegative = (n) => {
  return n >= 0
    ? `<span class="positive">${n}%</span>`
    : `<span class="negative">${n}%</span>`;
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

window.addEventListener("load", () => {
  const marquee = new Marquee(marqueeContainer);
  marquee.render();
});
