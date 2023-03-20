class SearchForm {
  API_URL =
    "https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3";
  constructor(el) {
    this.el = el;
    this.render();
    this.checkQueryOnLoad();
    this.handleClick();
  }

  async onSearch(callback) {
    this.onSearchCallback = callback;
  }

  render() {
    this.el.classList.add(
      "d-flex",
      "flex-column",
      "align-items-center",
      "mb-4"
    );
    this.el.innerHTML = `
    <div class="d-flex container-md justify-content-center">  
      <input
      type="text"
      class="form-control me-2 bg-light"
      placeholder="Stock search"
      aria-label="Stock search"
      id="search-input"
    />
    <button class="btn btn-primary" id="search-button">Search</button> 
    </div>
    `;
  }

  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  handleClick() {
    const searchButton = this.el.querySelector("#search-button");
    const searchInput = this.el.querySelector("#search-input");

    searchButton.addEventListener("click", this.handleSearch.bind(this));
    searchInput.addEventListener(
      "keyup",
      this.debounce(this.handleSearch.bind(this), 500)
    );

    window.addEventListener("load", () => {
      if (!searchInput.value) return;
      this.handleSearch();
    });
  }

  async handleSearch() {
    this.toggleSpinner();
    const data = await this.fetchResults();
    const symbolsArray = this.joinSymbols(data);
    const allPromises = await this.fetchAndCombinePromises(symbolsArray);
    this.onSearchCallback(allPromises);
  }

  checkQueryOnLoad() {
    const url = new URL(window.location);
    const query = url.searchParams.get("query");
    if (query) {
      const searchInput = this.el.querySelector("#search-input");
      searchInput.value = query;
    }
  }

  setQueryParams(value) {
    const url = new URL(window.location);
    url.searchParams.set("query", value);
    window.history.pushState(null, "", url.toString());
  }

  async fetchResults() {
    const searchInput = this.el.querySelector("#search-input");
    this.setQueryParams(searchInput.value);
    try {
      const res = await fetch(
        `${this.API_URL}/search?query=${searchInput.value}&limit=10&exchange=NASDAQ`
      );
      const json = await res.json();
      return json;
    } catch (err) {
      console.log(err);
    }
  }

  async fetchCompanyInfo(symbols) {
    try {
      return fetch(`${this.API_URL}/company/profile/${symbols}`).then((res) =>
        res.json()
      );
    } catch (err) {
      console.log(err);
    }
  }

  async joinSymbols(data) {
    const symbolsArray = data.map((obj) => obj.symbol);
    const joinedSymbolsArray = [];

    while (symbolsArray.length > 0) {
      joinedSymbolsArray.push(symbolsArray.splice(0, 3).join(","));
    }

    return joinedSymbolsArray;
  }

  async fetchAndCombinePromises(array) {
    const arr = await array;
    try {
      const promises = arr.map((batch) => {
        const promise = this.fetchCompanyInfo(batch);
        return promise;
      });

      const allPromises = await Promise.all(promises);
      return allPromises;
    } catch (err) {
      console.log(err);
    }
  }

  toggleSpinner() {
    const spinner = document.querySelector("#spinner");
    const tbody = document.querySelector(".tbody");
    const searchButton = document.querySelector("#search-button");
    tbody.innerHTML = "";
    spinner.classList.toggle("d-none");
    searchButton.disabled = !searchButton.disabled;
  }
}
