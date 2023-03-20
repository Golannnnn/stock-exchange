class CompanyInfo {
  API_URL = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3`;
  constructor(el, symbol) {
    this.el = el;
    this.symbol = symbol;
    this.render();
  }

  render() {
    this.el.innerHTML = `
      <div class="info-container"></div>
      <div class="spinner-border d-none info-spinner" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <canvas class="myChart"></canvas>

      <div class="spinner-border d-none chart-spinner" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    `;
  }

  async fetchSymbol() {
    try {
      const symbol = this.symbol;
      const res = await fetch(`${this.API_URL}/company/profile/${symbol}`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.log(err);
    }
  }

  async displaySymbol() {
    const infoSpinner = this.el.querySelector(".info-spinner");
    this.toggleSpinner(infoSpinner);
    const data = await this.fetchSymbol();
    this.toggleSpinner(infoSpinner);
    if (data.profile) {
      const company = data.profile;
      const description = this.shortenString(company.description);
      this.modifyHTML(
        company.image,
        company.companyName,
        company.price,
        company.changesPercentage,
        description,
        company.website
      );
    }
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

  async modifyHTML(img, name, price, changes, desc, site) {
    const infoContainer = this.el.querySelector(".info-container");
    const checkedImg = await this.testImage(img);
    infoContainer.innerHTML = `
  <div class="company-title">
  <img src="${checkedImg}" />
  <span>${name}</span>
  </div>
  <p class="light-font"><b>Stock price: $${price} ${this.isNumberNegative(
      this.roundNumber(changes)
    )}</b></p>
  <p class="light-font">${desc} <a href="${site}" target="_blank">${site}</a></p>
`;
  }

  roundNumber(n) {
    return Math.round(n * 100) / 100;
  }

  shortenString(str) {
    if (str === null) return "";
    if (str.length <= 500) {
      return str;
    } else {
      let trimmedString = str.slice(0, 500);
      let lastSpaceIndex = trimmedString.lastIndexOf(" ");
      if (lastSpaceIndex !== -1) {
        return trimmedString.slice(0, lastSpaceIndex) + "...";
      } else {
        return trimmedString + "...";
      }
    }
  }

  isNumberNegative(n) {
    if (n >= 0) {
      return `<span class="positive">(${n}%)</span>`;
    } else {
      return `<span class="negative">(${n}%)</span>`;
    }
  }

  async fetchCompanyProfile() {
    try {
      const symbol = this.symbol;
      const res = await fetch(
        `${this.API_URL}/historical-price-full/${symbol}?serietype=line`
      );
      const json = await res.json();
      return json;
    } catch (err) {
      console.log(err);
    }
  }

  filterByYear(array) {
    const years = [];
    let result = [];

    for (let i = 0, l = array.length; i < l; i++) {
      const year = new Date(array[i].date).getFullYear();

      if (!years.includes(year)) {
        years.push(year);
        result.unshift(array[i]);
      }
    }

    if (years.length < 5) {
      return array.reverse();
    }

    return result;
  }

  async displayCompanyProfile() {
    const chartSpinner = this.el.querySelector(".chart-spinner");
    this.toggleSpinner(chartSpinner);
    const data = await this.fetchCompanyProfile();
    const modifiedData = this.filterByYear(data.historical);
    const labels = modifiedData.map((obj) => obj.date);
    const price = modifiedData.map((obj) => obj.close);
    const ctx = this.el.querySelector(".myChart");

    // set default font color of chart labels to white
    Chart.defaults.color = "#cfcfcf";

    const config = {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Stock price",
            fill: true,
            data: price,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            suggestedMin: 0,
          },
        },
      },
    };

    this.toggleSpinner(chartSpinner);
    new Chart(ctx, config);
  }

  toggleSpinner(spinner) {
    spinner.classList.toggle("d-none");
  }

  load() {
    this.displaySymbol();
  }

  addChart() {
    this.displayCompanyProfile();
  }
}
