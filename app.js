const apiKey = config.apiKey;
const weatherDiv = document.getElementById('weather');
const forecastDiv = document.querySelector('.forecast');
const cityInput = document.getElementById('cityInput');

document.getElementById('getWeatherBtn').addEventListener('click', getWeather);
cityInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') getWeather();
});

async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        updateUI('Please enter a city name', '');
        return;
    }
    updateUI('Loading...', 'Loading forecast...');
    try {
        const weatherData = await fetchWeather(city);
        const forecastData = await fetchForecast(city);
        displayCurrentWeather(weatherData);
        displayForecast(forecastData);
    } catch (error) {
        updateUI(`Error: ${error.message}`, '');
    }
}

async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('City not found');
    return response.json();
}

async function fetchForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Forecast data not available');
    return response.json();
}

function displayCurrentWeather(data) {
    const {name} = data;
    const {temp, humidity} = data.main;
    const {speed} = data.wind;
    const {description, icon} = data.weather[0];
    const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

    weatherDiv.innerHTML = `
        <h2>Weather in ${name}</h2>
        <img src="${iconUrl}" alt="Weather icon">
        <p>Temperature: ${temp}°C</p>
        <p>Condition: ${description}</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${speed} m/s</p>
    `;
}

function displayForecast(data) {
    forecastDiv.innerHTML = '<h3>3-Day Forecast</h3>';
    const dailyData = data.list.filter(entry => entry.dt_txt.includes('12:00:00')).slice(0, 3);

    if (dailyData.length === 0) {
        forecastDiv.innerHTML += '<p>No forecast data available</p>';
        return;
    }

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        const {temp} = day.main;
        const {description, icon} = day.weather[0];
        const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

        forecastDiv.innerHTML += `
            <div>
                <p>${date}</p>
                <img src="${iconUrl}" alt="Weather icon">
                <p>${temp}°C</p>
                <p>${description}</p>
            </div>
        `;
    });
}

function updateUI(weatherText, forecastText) {
    weatherDiv.innerHTML = weatherText;
    forecastDiv.innerHTML = forecastText;
}
