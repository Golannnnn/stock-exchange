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
    <div class="table-responsive w-100">
    <table class="table table-hover">
      <thead>
        <tr>
          <th scope="col">Symbol</th>
          <th scope="col">Name</th>
          <th scope="col">Change</th>
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

  async renderResults(companies) {
    this.toggleSpinner();
    const allPromises = await companies;
    allPromises.forEach((obj) => {
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

  modifyHTML(sym, img, name, change) {
    const tbody = document.querySelector(".tbody");
    tbody.innerHTML += `
    <tr>
      <td>${sym}</td>
      <td class="text-break">
      <a class="text-decoration-none" href="./company.html?symbol=${sym}"><img class="search-image" src="${img}" />${name}</a>
      </td>
      <td>${this.isNumberNegative(change)}</td>
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
    tbody.innerHTML = "";
    spinner.classList.toggle("d-none");
  }
}
