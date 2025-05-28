const apiKey = "d5560eb81f24a4cb4395073fbbfc507b";
const weatherCard = document.getElementById("weatherCard");
const cityNameEl = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const description = document.getElementById("description");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const rainVolume = document.getElementById("rainVolume");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const feedback = document.getElementById("feedback");

const searchButton = document.getElementById("searchButton");
const cityInput = document.getElementById("cityInput");
const toggleUnitBtn = document.getElementById("toggleUnitBtn");
const toggleDarkModeBtn = document.getElementById("toggleDarkModeBtn");

let isCelsius = true;
let latestWeatherData = null;

function showLoading() {
  cityNameEl.innerText = "Loading...";
  weatherIcon.innerHTML = "⏳";
  description.innerText = "";
  temperature.innerText = "";
  humidity.innerText = "";
  rainVolume.innerText = "";
  windSpeed.innerText = "";
pressure.innerText = "";
sunrise.innerText = "";
sunset.innerText = "";
feedback.innerText = "";

}

function showError(message) {
  cityNameEl.innerText = "⚠️ Error";
  weatherIcon.innerHTML = "❌";
  description.innerText = message;
  temperature.innerText = "";
  humidity.innerText = "";
  rainVolume.innerText = "";
  windSpeed.innerText = "";
pressure.innerText = "";
sunrise.innerText = "";
sunset.innerText = "";
feedback.innerText = "Try a different city or check your internet.";

  latestWeatherData = null;
}

function getWeatherEmoji(main) {
  switch (main.toLowerCase()) {
    case "clear":
      return "☀️";
    case "clouds":
      return "☁️";
    case "rain":
      return "🌧️";
    case "drizzle":
      return "🌦️";
    case "thunderstorm":
      return "⛈️";
    case "snow":
      return "❄️";
    case "mist":
    case "smoke":
    case "haze":
    case "fog":
      return "🌫️";
    default:
      return "🌈";
  }
}

function clearWeatherInfo() {
  cityNameEl.innerText = "";
  weatherIcon.innerHTML = "";
  description.innerText = "";
  temperature.innerText = "";
  humidity.innerText = "";
  rainVolume.innerText = "";
  windSpeed.innerText = "";
pressure.innerText = "";
sunrise.innerText = "";
sunset.innerText = "";
feedback.innerText = "";

  latestWeatherData = null;
}

function cToF(celsius) {
  return (celsius * 9) / 5 + 32;
}

function updateWeatherUI(data, animate = true) {
  latestWeatherData = data;

  // Calculate local time based on timezone offset
  const utcTime = data.dt * 1000; // UTC in ms
  const timezoneOffset = data.timezone * 1000; // in ms
  const localDate = new Date(utcTime + timezoneOffset);

  const hours = localDate.getUTCHours().toString().padStart(2, "0");
  const minutes = localDate.getUTCMinutes().toString().padStart(2, "0");
  const seconds = localDate.getUTCSeconds().toString().padStart(2, "0");
  const timeString = `${hours}:${minutes}:${seconds}`;

  cityNameEl.innerText = `📍 ${data.name}, ${data.sys.country} (${timeString})`;
  description.innerText = data.weather[0].description;

  if (isCelsius) {
    temperature.innerText = `${data.main.temp.toFixed(1)} °C`;
  } else {
    temperature.innerText = `${cToF(data.main.temp).toFixed(1)} °F`;
  }

  humidity.innerText = `💧HUMIDITY ${data.main.humidity}%`;

  const rain = data.rain?.["1h"] ?? data.rain?.["3h"] ?? 0;
  rainVolume.innerText = `🌧️RAIN ${rain} mm`;

  weatherIcon.innerHTML = getWeatherEmoji(data.weather[0].main);
windSpeed.innerText = `🌬️WIND ${data.wind.speed} m/s`;
pressure.innerText = `📉PRESSURE ${data.main.pressure} hPa`;

const sunRiseDate = new Date((data.sys.sunrise + data.timezone) * 1000);
const sunSetDate = new Date((data.sys.sunset + data.timezone) * 1000);

const formatTime = (date) =>
  `${date.getUTCHours().toString().padStart(2, '0')}:${date
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}`;

sunrise.innerText = `🌅SUNRISE ${formatTime(sunRiseDate)} `;
sunset.innerText = `🌇SUNSET ${formatTime(sunSetDate)} `;

// Feedback based on temperature
const tempC = data.main.temp;
if (tempC > 35) {
  feedback.innerText = "🔥 It's quite hot! Stay hydrated.";
} else if (tempC < 10) {
  feedback.innerText = "❄️ It's cold outside. Wear warm clothes!";
} else {
  feedback.innerText = "😊 The weather looks pleasant!";
}

  if (animate) {
    weatherCard.classList.add("fade-scale-in");
    setTimeout(() => {
      weatherCard.classList.remove("fade-scale-in");
    }, 600);
  }
}

async function fetchWeather(location) {
  let urlCurrent, urlForecast;

  if (typeof location === "string") {
    // Location is city name
    const city = location;
    urlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;
    urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;
  } else if (location.lat && location.lon) {
    // Location is coordinates
    urlCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`;
    urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`;
  } else {
    showError("Invalid location");
    return;
  }
  console.log("Fetching weather for:", location);

  showLoading();
  weatherCard.classList.add("fade-out");
  await new Promise((resolve) => setTimeout(resolve, 500));
  clearWeatherInfo();

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(urlCurrent),
      fetch(urlForecast),
    ]);

    if (!currentRes.ok || !forecastRes.ok) throw new Error("City not found");

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    weatherCard.classList.remove("fade-out");
    updateWeatherUI(currentData);
    displayForecast(forecastData);
  } catch (error) {
    weatherCard.classList.remove("fade-out");
    showError(error.message || "Failed to fetch weather data.");
  }
}

function toggleUnit() {
  if (!latestWeatherData) return;

  isCelsius = !isCelsius;
  toggleUnitBtn.innerText = isCelsius ? "°F" : "°C";
  updateWeatherUI(latestWeatherData, false);
}

function toggleDarkMode() {
  const isDarkMode = document.body.classList.toggle("dark-mode");

  if (isDarkMode) {
    toggleDarkModeBtn.innerText = "🌞";
    localStorage.setItem("darkMode", "enabled");
  } else {
    toggleDarkModeBtn.innerText = "🌙";
    localStorage.setItem("darkMode", "disabled");
  }
}

function displayForecast(forecastData) {
  const container = document.getElementById("forecastContainer");
  if (!container) return; // safety check
  container.innerHTML = ""; // Clear previous

  const dailyMap = {};

  forecastData.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    // Pick forecast for 12:00:00 only
    if (!dailyMap[date] && item.dt_txt.includes("12:00:00")) {
      dailyMap[date] = item;
    }
  });

  Object.values(dailyMap)
    .slice(0, 5)
    .forEach((day) => {
      const date = new Date(day.dt_txt);
      const options = { weekday: "short", month: "short", day: "numeric" };
      const dayName = date.toLocaleDateString("en-US", options);

      const temp = isCelsius
        ? `${day.main.temp.toFixed(1)} °C`
        : `${cToF(day.main.temp).toFixed(1)} °F`;
      const icon = getWeatherEmoji(day.weather[0].main);
      const description = day.weather[0].description;

      const card = document.createElement("div");
      card.className = "forecast-card";
      card.innerHTML = `
        <div style="font-weight:bold; margin-bottom:4px;">${dayName}</div>
        <div style="font-size: 28px;">${icon}</div>
        <div style="margin: 4px 0;">${temp}</div>
        <div style="font-size: 12px; text-transform: capitalize; color: #d1c4e9;">${description}</div>
      `;

      container.appendChild(card);
    });
}

// Event listeners
searchButton.addEventListener("click", () => {
  fetchWeather(cityInput.value.trim());
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    fetchWeather(cityInput.value.trim());
  }
});

toggleUnitBtn.addEventListener("click", toggleUnit);
toggleDarkModeBtn.addEventListener("click", toggleDarkMode);

window.addEventListener("load", () => {
  // Load dark mode preference
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "enabled") {
    document.body.classList.add("dark-mode");
    toggleDarkModeBtn.innerText = "🌞"; // Sun icon to indicate toggle to light mode
  } else {
    toggleDarkModeBtn.innerText = "🌙"; // Moon icon to indicate toggle to dark mode
  }

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        fetchWeather({ lat, lon });
      },
      (error) => {
        // Location denied or error: fallback to default city or show message
        showError("Location access denied. Please enter city manually.");
      }
    );
  } else {
    showError("Geolocation not supported by your browser.");
  }
});
