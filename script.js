const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeather = document.querySelector(".hourly-weather .weather-list");

const API_KEY = "bf0dd2169dcb40ea84b124815251008"; // <-- IMPORTANT: Replace with your API key

const weatherCodes = {
  clear: [1000],
  clouds: [1003,1006,1009],
  mist: [1030,1135,1147],
  rain: [1063,1150,1153,1168,1171,1180,1183,1198,1201,1240,1243,1246,1273,1276],
  moderate_heavy_rain: [1186,1189,1192,1195,1243,1246],
  snow: [1066,1069,1072,1114,1117,1204,1207,1210,1213,1216,1219,1222,1225,1237,1249,1252,1255,1258,1261,1264,1279,1282],
  thunder: [1087,1279,1282],
  thunder_rain: [1273,1276],
};

function displayHourlyForecast(hourlyData) {
  const now = new Date().setMinutes(0, 0, 0);
  hourlyWeather.innerHTML = hourlyData
    .filter(item => new Date(item.time).getTime() >= now)
    .slice(0, 24)
    .map(item => {
      const temp = Math.round(item.temp_c);
      const time = item.time.split(' ')[1].slice(0,5);
      const iconKey = Object.keys(weatherCodes).find(key =>
        weatherCodes[key].includes(item.condition.code)
      ) || 'clear';
      return `
        <li class="weather-item">
          <p class="time">${time}</p>
          <img src="icons/${iconKey}.svg" class="weather-icon">
          <p class="temperature">${temp}°</p>
        </li>`;
    }).join('');
}

async function getWeatherDetails(url) {
  document.body.classList.remove("show-no-results");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response not ok");
    const data = await res.json();
    const tempC = Math.round(data.current.temp_c);
    const desc = data.current.condition.text;
    const iconKey = Object.keys(weatherCodes).find(key =>
      weatherCodes[key].includes(data.current.condition.code)
    ) || 'clear';

    currentWeatherDiv.querySelector(".weather-icon").src = `icons/${iconKey}.svg`;
    currentWeatherDiv.querySelector(".temperature").innerHTML = `${tempC}<span>°C</span>`;
    currentWeatherDiv.querySelector(".description").innerText = desc;

    const combined = [...data.forecast.forecastday[0]?.hour, ...data.forecast.forecastday[1]?.hour];
    displayHourlyForecast(combined);
    searchInput.value = data.location.name;

  } catch (err) {
    document.body.classList.add("show-no-results");
    console.error("Weather Fetch Error:", err);
  }
}

function setupWeatherRequest(cityOrCoords) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityOrCoords}&days=2&aqi=no&alerts=no`;
  getWeatherDetails(url);
}

searchInput.addEventListener("keyup", e => {
  if (e.key === "Enter" && searchInput.value.trim()) {
    setupWeatherRequest(searchInput.value.trim());
  }
});

locationButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    pos => setupWeatherRequest(`${pos.coords.latitude},${pos.coords.longitude}`),
    () => alert("Location access denied.")
  );
});

// Default load
setupWeatherRequest("London");
