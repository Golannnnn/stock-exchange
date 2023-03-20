class SearchResult {
  constructor(el) {
    this.el = el;
    this.render();
    this.compareArray = [];
    this.compareInstance = new Compare();
  }

  render() {
    this.el.classList.add(
      "d-flex",
      "flex-column",
      "justify-content-center",
      "align-items-center"
    );
    this.el.innerHTML = `
    <div class="table-responsive container-lg container-xl">
    <div id="compare"><div id="compare-container"></div><a id="compare-link"></a></div>
    <table class="table table-hover table-dark">
      <thead class="default-table">
        <tr>
          <th scope="col" class="fw-light">Symbol</th>
          <th scope="col" class="fw-light">Name</th>
          <th scope="col" class="fw-light">Change</th>
          <th scope="col" class="fw-light">Compare</th>
        </tr>
      </thead>
      <tbody class="tbody"></tbody>
    </table>
  </div>

  <div class="spinner-border d-none" role="status" id="spinner">
    <span class="visually-hidden">Loading...</span>
  </div>
    `;
  }

  async testImage(URL) {
    try {
      await new Promise((resolve, reject) => {
        const tester = new Image();
        tester.onload = () => resolve();
        tester.onerror = () => reject();
        tester.src = URL;
      });
      return URL;
    } catch (error) {
      return "./images/default-img.svg";
    }
  }

  async renderResults(companies) {
    this.toggleSpinner();
    const allPromises = await companies;
    allPromises.forEach((obj) => {
      if (Object.keys(obj).length === 0) return;
      if (obj.profile) {
        const company = obj.profile;
        this.modifyHTML(
          obj.symbol,
          company.image,
          company.companyName,
          company.changesPercentage
        );
      } else {
        obj.companyProfiles.forEach((obj) => {
          const company = obj.profile;
          this.modifyHTML(
            obj.symbol,
            company.image,
            company.companyName,
            company.changesPercentage
          );
        });
      }
    });
  }

  highlightSearchTerms(input) {
    const searchInput = document.querySelector("#search-input");
    const regex = new RegExp(searchInput.value, "gi");
    const matchedText = input.match(regex);
    if (matchedText === null) return input;
    const newText = input.replace(
      regex,
      `<span class="highlight">${matchedText[0].toString()}</span>`
    );
    return newText;
  }

  async modifyHTML(sym, img, name, change) {
    const tbody = document.querySelector(".tbody");
    const checkedImg = await this.testImage(img);
    tbody.innerHTML += `
    <tr>
    <td class="fw-bold stock-symbol">${this.highlightSearchTerms(sym)}</td>
    <td class="text-break">
    <img class="search-image" src="${checkedImg}" />
    <a class="text-decoration-none stock-name" href="./company.html?symbol=${sym}">${this.highlightSearchTerms(
      name
    )}</a>
      </td>
      <td class="fw-bold">${this.isNumberNegative(
        this.roundNumber(change)
      )}</td>
        <td><button type="button" class="btn btn-light">Compare</button></td>
        </tr>
        `;
    this.handleCompareBtnClick(sym);
  }

  handleCompareBtnClick(sym) {
    const tbody = document.querySelector("tbody");
    tbody.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return;
      const symbol = e.target.parentElement.parentElement.children[0].innerText;
      if (sym === symbol) {
        this.compareInstance.add(sym);
      }
    });
  }

  roundNumber(n) {
    return Math.round(n * 100) / 100;
  }

  isNumberNegative(n) {
    return n >= 0
      ? `<span class="positive">${n}%</span>`
      : `<span class="negative">${n}%</span>`;
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

class Compare {
  constructor() {
    this.array = [];
    this.container = document.querySelector("#compare-container");
    this.link = document.querySelector("#compare-link");
    this.remove();
  }

  render() {
    this.container.innerHTML = this.array
      .map((sym) => {
        return `<span class="compare-element">${sym}<span class="remove-compare-element">x</span></span>`;
      })
      .join("");

    if (this.array.length === 1) {
      this.link.innerHTML = `Compare 1 company &rarr;`;
    } else if (this.array.length > 1) {
      this.link.innerHTML = `Compare ${this.array.length} companies &rarr;`;
    } else {
      this.link.innerHTML = "";
    }

    this.link.setAttribute(
      "href",
      `./company.html?symbol=${this.array.join()}`
    );
  }

  add(symbol) {
    if (this.array.length === 3) return;
    if (this.array.includes(symbol)) return;
    this.array.push(symbol);
    this.render();
  }

  remove() {
    this.container.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-compare-element")) {
        const elementText = e.target.parentElement.innerText;
        const symbol = elementText.slice(0, -1);
        const index = this.array.indexOf(symbol);
        this.array.splice(index, 1);
        this.render();
      }
    });
  }
}
