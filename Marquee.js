class Marquee {
  constructor(el) {
    this.el = el;
  }

  async fetchNasdaqCompanies() {
    try {
      const res = await fetch(
        `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/nasdaq_constituent`
      );
      const json = await res.json();
      return json;
    } catch (err) {
      console.log(err);
    }
  }

  async joinSymbols() {
    try {
      const json = await this.fetchNasdaqCompanies();
      const array = json.map((obj) => obj.symbol);
      const shotenArray = array.slice(array.length / 2);
      return shotenArray.join(",");
    } catch (err) {
      console.log(err);
    }
  }

  async fetchMarqueeInfo() {
    try {
      const symbols = await this.joinSymbols();
      const res = await fetch(
        `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/quote-short/${symbols}`
      );
      const json = await res.json();
      return json;
    } catch (err) {
      console.log(err);
    }
  }

  isPriceNegative(n) {
    return n >= 0
      ? `<span class="positive">${n}</span>`
      : `<span class="negative">${n}</span>`;
  }

  async render() {
    const data = await this.fetchMarqueeInfo();
    const content = document.createElement("div");
    content.classList.add("marquee-content");
    content.setAttribute("id", "marquee-content");
    data.forEach((obj) => {
      content.innerHTML += `<span>${obj.symbol} ${this.isPriceNegative(
        obj.price
      )}</span>`;
    });
    this.el.append(content);
  }
}
