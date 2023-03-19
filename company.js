const infoContainer = document.querySelector("#info-container");
const infoSpinner = document.querySelector("#info-spinner");
const chartSpinner = document.querySelector("#chart-spinner");

const grabSymbol = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const string = urlParams.toString().replace("symbol=", "");
  return string;
};

const fetchSymbol = async () => {
  try {
    const symbol = grabSymbol();
    const res = await fetch(
      `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/${symbol}`
    );
    const json = await res.json();
    return json;
  } catch (err) {
    console.log(err);
  }
};

const displaySymbol = async () => {
  toggleSpinner(infoSpinner);
  const data = await fetchSymbol();
  toggleSpinner(infoSpinner);
  const company = data.profile;
  const description = shortenString(company.description);
  modifyHTML(
    company.image,
    company.companyName,
    company.price,
    company.changesPercentage,
    description,
    company.website
  );
};

const testImage = async (URL) => {
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
};

const modifyHTML = async (img, name, price, changes, desc, site) => {
  const checkedImg = await testImage(img);
  infoContainer.innerHTML = `
  <div class="company-title">
  <img src="${checkedImg}" />
  <span>${name}</span>
  </div>
  <p class="light-font"><b>Stock price: $${price} ${isNumberNegative(
    roundNumber(changes)
  )}</b></p>
  <p class="light-font">${desc} <a href="${site}" target="_blank">${site}</a></p>
`;
};

const roundNumber = (n) => {
  return Math.round(n * 100) / 100;
};

const shortenString = (str) => {
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
};

const isNumberNegative = (n) => {
  if (n >= 0) {
    return `<span class="positive">(${n}%)</span>`;
  } else {
    return `<span class="negative">(${n}%)</span>`;
  }
};

const fetchCompanyProfile = async () => {
  try {
    const symbol = grabSymbol();
    const res = await fetch(
      `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/historical-price-full/${symbol}?serietype=line`
    );
    const json = await res.json();
    return json;
  } catch (err) {
    console.log(err);
  }
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
  toggleSpinner(chartSpinner);
  const data = await fetchCompanyProfile();
  const modifiedData = filterByYear(data.historical);
  const labels = modifiedData.map((obj) => obj.date);
  const price = modifiedData.map((obj) => obj.close);
  const ctx = document.getElementById("myChart");

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

  toggleSpinner(chartSpinner);
  new Chart(ctx, config);
};

const toggleSpinner = (spinner) => {
  spinner.classList.toggle("d-none");
};

window.addEventListener("load", () => {
  displaySymbol();
  displayCompanyProfile();
});
