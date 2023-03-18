class SearchResult {
  constructor(el) {
    this.el = el;
    this.render();
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
    <table class="table table-hover table-dark">
      <thead>
        <tr>
          <th scope="col" class="fw-light">Symbol</th>
          <th scope="col" class="fw-light">Name</th>
          <th scope="col" class="fw-light">Change</th>
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

  async modifyHTML(sym, img, name, change) {
    const tbody = document.querySelector(".tbody");
    const checkedImg = await this.testImage(img);
    tbody.innerHTML += `
    <tr>
      <td class="fw-bold">${sym}</td>
      <td class="text-break">
      <a class="text-decoration-none stock-name" href="./company.html?symbol=${sym}"><img class="search-image" src="${checkedImg}" />${name}</a>
      </td>
      <td class="fw-bold">${this.isNumberNegative(change)}</td>
    </tr>
    `;
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
