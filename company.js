const infoContainer = document.querySelector("#info-container");
const infoSpinner = document.querySelector("#info-spinner");
const chartSpinner = document.querySelector("#chart-spinner");

const grabSymbol = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const string = urlParams.toString().replace("symbol=", "");
  return string;
};

const fetchSymbol = async () => {
  const symbol = grabSymbol();
  const res = await fetch(
    `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/${symbol}`
  );
  const json = await res.json();
  return json;
};

const displaySymbol = async () => {
  toggleInfoSpinner();
  const data = await fetchSymbol();
  toggleInfoSpinner();
  const company = data.profile;
  const description = shortenString(company.description);
  infoContainer.innerHTML = `
    <div class="company-title">
    <img src="${company.image}" />
    <span>${company.companyName}</span>
    </div>
    <p class="company-price"><b>Stock price: $${
      company.price
    } ${isNumberNegative(company.changesPercentage)}</b></p>
    <p>${description} <a href="${company.website}" target="_blank">${
    company.website
  }</a></p>
  `;
};

function shortenString(str) {
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

const isNumberNegative = (n) => {
  if (n >= 0) {
    return `<span class="positive">(${n}%)</span>`;
  } else {
    return `<span class="negative">(${n}%)</span>`;
  }
};

const fetchCompanyProfile = async () => {
  const symbol = grabSymbol();
  const res = await fetch(
    `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/historical-price-full/${symbol}?serietype=line`
  );
  const json = await res.json();
  return json;
};

const filterByYear = (array) => {
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
};

const displayCompanyProfile = async () => {
  toggleChartSpinner();
  const data = await fetchCompanyProfile();
  const modifiedData = filterByYear(data.historical);
  const labels = modifiedData.map((obj) => obj.date);
  const price = modifiedData.map((obj) => obj.close);
  const ctx = document.getElementById("myChart");
  const config = {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Stock price",
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

  toggleChartSpinner();
  new Chart(ctx, config);
};

const toggleInfoSpinner = () => {
  infoSpinner.classList.toggle("d-none");
};

const toggleChartSpinner = () => {
  chartSpinner.classList.toggle("d-none");
};

window.addEventListener("load", () => {
  displaySymbol();
  displayCompanyProfile();
});
