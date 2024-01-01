

const apiKey = "79832ea15a303547f960b5d5f827ca0b";
let city = "New York";
let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;
let currentTempData = document.getElementById("currentTemp");
let cityName = document.querySelector(".cityName")
let highTemp = document.querySelector(".maxValue")
let firstItem = 0;
let lastItem = 7;
let date1 = document.querySelector(".day1")
let autocomplete;
cityName.innerHTML = "New&nbspYork,NY"

function initAutocomplete() {
  const input = document.getElementById("cityInput");
  const autocomplete = new google.maps.places.Autocomplete(input);

 
  autocomplete.addListener("place_changed", function () {
    const selectedPlace = autocomplete.getPlace();
    if (selectedPlace.geometry && selectedPlace.formatted_address) {
      // Extract the city and state information
      
      let selectedCity= "";
      let state = "";
      for (const component of selectedPlace.address_components) {
        if (component.types.includes("locality")) {
          selectedCity = component.long_name;
        } else if (component.types.includes("administrative_area_level_1")) {
          state = component.short_name;
        }
      }
      console.log(selectedCity)
      city = selectedCity;  
      
      // Display the selected place in the desired format
      cityName.innerHTML = `${city},&nbsp${state}`;
      const input = document.getElementById("cityInput");
  input.value = "";
      Temper.classList.remove("NotActive")
      Wind.classList.add("NotActive")
      Precipiation.classList.add("NotActive")
      createTemperatureChart();
    }
  });
}

async function fetchWeatherData() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}
// Function to create a line chart with temperature data
// Declare a variable to store the chart object
let temperatureChart;
let temptype = "imperial";
let tempLetter = "F"
async function createTemperatureChart() {
  // Destroy the existing chart if it exists
  if (temperatureChart) {
    temperatureChart.destroy();
  }

apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${temptype}`;
  const weatherData = await fetchWeatherData();
  const temperatureData = [];
  const labels = [];
const currentTemperature = Math.round(weatherData.list[0].main.temp) || 0;

  let currentRain = 0;
  if (weatherData.list[0].rain && weatherData.list[0].rain['3h']) {
    currentRain = weatherData.list[0].rain['3h'];
  }
  const rainUnit = temptype === 'imperial' ? 'in' : 'mm'
  const currentHumidity = weatherData.list[0].main.humidity || 0;
  const currentWind = Math.round(weatherData.list[0].wind.speed) || 0;
  highTemp.innerHTML = `${currentTemperature}`
   // Update precipitation, humidity, and wind in the HTML
   const precipitationElement = document.querySelector(".precipitation");
   const humidityElement = document.querySelector(".humidity");
   const windElement = document.querySelector(".wind");
  
   precipitationElement.innerHTML= `Precipitation: ${currentRain} ${rainUnit}`;
   humidityElement.innerHTML = `Humidity: ${currentHumidity}%`;
   function windType(){
    if(temptype === "metric"){
   windElement.innerHTML = `Wind: ${currentWind} m/s`
    };
    if(temptype === "imperial"){
      windElement.innerHTML = `Wind: ${currentWind} mph`
    }
   }
   windType()
  // Calculate the start time (current hour)
  const now = new Date();
  const currentHour = now.getHours();

  // Extract temperature data and labels for the next 7 timestamps (21 hours) starting from the current hour
  for (let i = firstItem; i >= firstItem && i < lastItem; i++) {
    const forecast = weatherData.list[i];
    const timestamp = new Date(forecast.dt * 1000);
    console.log(forecast.main.humidity)
    // Check if the timestamp is within the next 21 hours
    
    if (
      timestamp >= now &&
      timestamp <= new Date(now.getTime() + 21 * 60 * 60 * 1000)
    ) {
      temperatureData.push(Math.round(forecast.main.temp));
      if (timestamp.getHours() > 12) {
        labels.push(`${timestamp.getHours() - 12} PM`);
      } else {
        labels.push(`${timestamp.getHours()} AM`);
      }
    }
  }
  

  // Add the current hour's temperature at the beginning
  temperatureData.unshift(Math.round(weatherData.list[0].main.temp)); // Add the current hour's temperature
  if (now.getHours() > 12) {
    labels.unshift(`${now.getHours() - 12} PM`);
  } else {
    labels.unshift(`${now.getHours()} AM`);
  }
  const minValue = Math.min(...temperatureData) - 1;
  const MaxValue = Math.max(...temperatureData) + 5;
  // Create a chart using Chart.js
  const ctx = document.getElementById("temperatureChart").getContext("2d");
  Chart.register(ChartDataLabels);

  
  temperatureChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          plugins: [ChartDataLabels],
          label: "Temperature (°)",
          data: temperatureData,
          borderColor: "white",
          borderWidth: 1.5,
          backgroundColor: "transparent",
          pointBackgroundColor: "white",
          fill: false,
          cubicInterpolationMode: "monotone",
          datalabels: {
            align: (context) =>
              context.dataset.data[context.dataIndex] < 0 ? "bottom" : "top",
            padding: 5,
            color: "white",
            font: {
              size: 10,
            },
            formatter: (value) => value + ` °${tempLetter}`,
          },
          pointStyle: "circle", // Use a circular point style
          pointRadius: 5, // Set the initial point size
          hoverRadius: 10, // Set the point size on hover
        },
        {
          label: "Fill Area",
          data: temperatureData,
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          fill: true,
          cubicInterpolationMode: "monotone",
          borderWidth: 0,
          datalabels: {
            display: false,
          },
        },
      ],
    },
    options: {
      
      scales: {
        x: {
          title: {
            display: false,
            text: "Time",
            color: "white", // Set x-axis title color to white
          },
          grid: {
            color: "transparent", // Set grid lines color to white
          },
          ticks: {
            color: "white", // Set x-axis tick color to white
          },
        },
        y: {
          min: minValue,
          max: MaxValue,
          display: false, // Hide the y-axis
        },
      },
      plugins: {
        tooltip: {
          enabled: false,
        },
        legend: {
          display: false,
          labels: {
            color: "white", // Set legend label color to white
          },
        },
      },
      onHover: function (event, elements) {
        const chartArea = temperatureChart.chartArea;

        if (
          chartArea &&
          event.native &&
          event.native.offsetX >= chartArea.left &&
          event.native.offsetX <= chartArea.right &&
          event.native.offsetY >= chartArea.top &&
          event.native.offsetY <= chartArea.bottom
        ) {
          // Change cursor to a pointer when hovering over data points
          ctx.canvas.style.cursor = elements[0] ? "pointer" : "default";
        } else {
          // Reset cursor style for other areas of the chart
          ctx.canvas.style.cursor = "default";
        }
      },
      onClick: function (event, elements) {
        if (elements.length > 0) {
          // Get the temperature value of the clicked data point
          const clickedTemperature = temperatureData[elements[0].index];
          const clickedTime = labels[elements[0].index]
      const clickedHumidity = weatherData.list[elements[0].index].main.humidity || 0;
      const clickedWind = Math.round(weatherData.list[elements[0].index].wind.speed) || 0;
      document.getElementById("clickedTime").textContent = `${clickedTime}`;
          if (weatherData.list[elements[0].index].rain && weatherData.list[elements[0].index].rain['3h']) {
            currentRain = weatherData.list[elements[0].index].rain['3h'];
          }
          highTemp.innerHTML = `${clickedTemperature}`;
          precipitationElement.textContent = `Precipitation: ${currentRain} ${rainUnit }`;
      humidityElement.textContent = `Humidity: ${clickedHumidity}%`;
      if(temptype === "metric"){
        windElement.innerHTML = `Wind: ${clickedWind} m/s`
         };
         if(temptype === "imperial"){
           windElement.innerHTML = `Wind: ${clickedWind} mph`
         }
        }
      },
    },
  });
}
// Call the function to create the temperature chart initially
createTemperatureChart();

async function fetchWeatherData() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}
// Function to create a line chart with temperature data
// Declare a variable to store the chart object
async function createPrecipitationChart() {
  // Destroy the existing chart if it exists
  if (temperatureChart) {
    temperatureChart.destroy();
  }

  const weatherData = await fetchWeatherData();
  const precipitationData = [];
  const labels = [];
console.log(weatherData.city)
  // Calculate the start time (current hour)
  const now = new Date();
  const currentHour = now.getHours();

  // Extract precipitation data and labels for the next 7 timestamps (21 hours) starting from the current hour
  for (let i = firstItem; i >= firstItem && i < lastItem; i++) {
    const forecast = weatherData.list[i];
    const timestamp = new Date(forecast.dt * 1000);
    // Check if the timestamp is within the next 21 hours
    if (
      timestamp >= now &&
      timestamp <= new Date(now.getTime() + 21 * 60 * 60 * 1000)
    ) {
      if (forecast.rain) {
        precipitationData.push(forecast.rain['3h'] || 0); // Precipitation in the last 1 hour
      } else {
        precipitationData.push(0); // If no precipitation data is available, set it to 0
      }

      if (timestamp.getHours() > 12) {
        labels.push(`${timestamp.getHours() - 12} PM`);
      } else {
        labels.push(`${timestamp.getHours()} AM`);
      }
    }
  }

  // Add the current hour's precipitation at the beginning
  precipitationData.unshift(0); // Assuming no precipitation initially
  if (now.getHours() > 12) {
    labels.unshift(`${now.getHours() - 12} PM`);
  } else {
    labels.unshift(`${now.getHours()} AM`);
  }

  // Create a chart using Chart.js
  const ctx = document.getElementById("temperatureChart").getContext("2d");
  Chart.register(ChartDataLabels);

  temperatureChart = new Chart(ctx, {
    type: "bar", // Change the chart type to "bar"
    data: {
      labels: labels,
      datasets: [
        {
          plugins: [ChartDataLabels],
          label: "Precipitation (mm)",
          data: precipitationData,
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          borderWidth: .5,
          borderColor: "white",
          barThickness: 20, // Adjust the bar thickness as needed
          datalabels: {
            align: "end",
            padding: 5,
            color: "white",
            font: {
              size: 10,
            },
          },
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: false,
            text: "Time",
            color: "white",
          },
          grid: {
            color: "transparent",
          },
          ticks: {
            color: "white",
          },
        },
        y: {
          beginAtZero: false, // Start the y-axis at 0
          display: false,
          title: {
            display: true,
            text: "Precipitation (mm)",
            color: "white",
          },
          grid: {
            color: "transparent",
          },
          ticks: {
            color: "white",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
          labels: {
            color: "white",
          },
        },
      },
    },
  });
}


async function createWindChart() {
  const weatherData = await fetchWeatherData();
  console.log(temperatureChart);
  if (temperatureChart) {
    temperatureChart.destroy();
  }
  const labels = [];
  const windDirectionData = weatherData.list
    .filter((forecast, index) => index % 8 === 0)
    .map((forecast) => forecast.wind.deg);
  const now = new Date();
  const currentHour = now.getHours();

  for (let i = firstItem; i >= firstItem && i < lastItem; i++) {
    const forecast = weatherData.list[i];
    const timestamp = new Date(forecast.dt * 1000);
    if (
      timestamp >= now &&
      timestamp <= new Date(now.getTime() + 21 * 60 * 60 * 1000)
    ) {
      if (timestamp.getHours() > 12) {
        labels.push(`${timestamp.getHours() - 12} PM`);
      } else {
        labels.push(`${timestamp.getHours()} AM`);
      }
    }
  }

  const ctx = document.getElementById('temperatureChart').getContext('2d');
  Chart.register(ChartDataLabels);

  const customArrow = new Image();
  customArrow.src = "arrow-down.svg"; // Replace with the path to your arrow image

  temperatureChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Wind Direction',
          data: weatherData.list.slice(0, 8).map((forecast, index) => ({
            x: index,
            y: forecast.wind.speed, // Use wind speed as the y-value
          })),
          borderColor: 'white',
          backgroundColor: 'black',
          pointStyle: customArrow,
          pointRotation: windDirectionData,
          pointRadius: 150,
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: false, // Hide x-axis values
        },
        y: {
          display: false, // Hide y-axis values
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      tooltip: {
        enabled: false,
      },
      elements: {
        point: {
          radius: 0,
        },
      },
    },
  });
}


let searchBtn = document.getElementById("searchButton")
let cityInput = document.getElementById("cityInput");
let faren = document.querySelector(".F")
let Cels = document.querySelector(".C")
let Temper = document.querySelector(".Temp")
let Precipiation = document.querySelector(".Precip")
let Wind = document.querySelector('.Wind')
const cardElements = document.querySelectorAll(".card");

window.addEventListener("click", function UpdateTempType(e){
  if (e.target.innerHTML === "F°"){
    temptype = "imperial"
    tempLetter = "F"
    faren.classList.remove("NotActive")
    Cels.classList.add("NotActive")
    Temper.classList.remove("NotActive")
  Wind.classList.add("NotActive")
  Precipiation.classList.add("NotActive")
    createTemperatureChart()
  }
  if (e.target.innerHTML === "C°"){
    temptype = "metric"
    tempLetter = "C"
    Cels.classList.remove("NotActive")
    faren.classList.add("NotActive")
    Temper.classList.remove("NotActive")
  Wind.classList.add("NotActive")
  Precipiation.classList.add("NotActive")
    createTemperatureChart()
  }
})
searchBtn.addEventListener("click", function update(){
  city = cityInput.value;
  cityInput.value = ""
  cityName.innerHTML = city
  console.log(city)
  Temper.classList.remove("NotActive")
  Wind.classList.add("NotActive")
  Precipiation.classList.add("NotActive")
  createTemperatureChart();
})
window.addEventListener("keypress",function update2(e){
  if(e.key === "Enter"){
    city = cityInput.value;
  cityInput.value = ""
  cityName.innerHTML = city
  console.log(city)
  Temper.classList.remove("NotActive")
  Wind.classList.add("NotActive")
  Precipiation.classList.add("NotActive")
  createTemperatureChart();
  }
})

window.addEventListener("click",function updateChartType(e){
if (e.target.innerHTML === "Temperature"){
Temper.classList.remove("NotActive")
Wind.classList.add("NotActive")
Precipiation.classList.add("NotActive")
createTemperatureChart()
}
if (e.target.innerHTML === "Precipitation"){
  Precipiation.classList.remove("NotActive")
  Wind.classList.add("NotActive")
  Temper.classList.add("NotActive")
  createPrecipitationChart()
}
if(e.target.innerHTML === "Wind"){
  Wind.classList.remove("NotActive")
  Temper.classList.add("NotActive")
  Precipiation.classList.add("NotActive")
  createWindChart()
}
} )

 // Loop through each card element and add a click event listener
 cardElements.forEach(function(cardElement) {
   cardElement.addEventListener("click", function() {
     console.log(cardElement)
     
   });
 });
console.log(city)
