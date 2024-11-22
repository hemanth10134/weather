// Using Open-Meteo API (no API key required)
const BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const weatherInfo = document.querySelector('.weather-info');
const cityElement = document.querySelector('.city');
const dateElement = document.querySelector('.date');
const tempElement = document.querySelector('.temp');
const descElement = document.querySelector('.description');
const weatherIcon = document.querySelector('.weather-icon');
const feelsLikeElement = document.querySelector('.feels-like');
const humidityElement = document.querySelector('.humidity');
const windSpeedElement = document.querySelector('.wind-speed');

// Function to format the date
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to get weather icon based on weather code
function getWeatherIcon(weatherCode) {
    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    if (weatherCode <= 3) return 'fas fa-sun'; // Clear to partly cloudy
    if (weatherCode <= 48) return 'fas fa-cloud'; // Cloudy, foggy
    if (weatherCode <= 67) return 'fas fa-cloud-rain'; // Rain
    if (weatherCode <= 77) return 'fas fa-snowflake'; // Snow
    if (weatherCode <= 82) return 'fas fa-cloud-showers-heavy'; // Rain showers
    if (weatherCode <= 86) return 'fas fa-snowflake'; // Snow showers
    if (weatherCode <= 99) return 'fas fa-bolt'; // Thunderstorm
    return 'fas fa-cloud';
}

// Function to get weather description based on weather code
function getWeatherDescription(weatherCode) {
    if (weatherCode <= 3) return 'Clear to partly cloudy';
    if (weatherCode <= 48) return 'Cloudy';
    if (weatherCode <= 67) return 'Rainy';
    if (weatherCode <= 77) return 'Snowy';
    if (weatherCode <= 82) return 'Rain showers';
    if (weatherCode <= 86) return 'Snow showers';
    if (weatherCode <= 99) return 'Thunderstorm';
    return 'Unknown';
}

// Function to fetch coordinates for a city
async function getCoordinates(city) {
    try {
        const response = await fetch(`${BASE_URL}?name=${city}&count=1`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return {
                lat: data.results[0].latitude,
                lon: data.results[0].longitude,
                name: data.results[0].name,
                country: data.results[0].country
            };
        }
        throw new Error('City not found');
    } catch (error) {
        alert(error.message);
        return null;
    }
}

// Function to fetch weather data
async function getWeatherData(lat, lon) {
    try {
        const response = await fetch(
            `${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,apparent_temperature`
        );
        if (!response.ok) {
            throw new Error('Weather data not available');
        }
        return await response.json();
    } catch (error) {
        alert(error.message);
        return null;
    }
}

// Function to update UI with weather data
function updateUI(locationData, weatherData) {
    if (!weatherData) return;

    const current = weatherData.current_weather;
    const currentHourIndex = new Date().getHours();
    
    weatherInfo.classList.remove('hidden');
    cityElement.textContent = `${locationData.name}, ${locationData.country}`;
    dateElement.textContent = formatDate(new Date());
    tempElement.textContent = `${Math.round(current.temperature)}°C`;
    descElement.textContent = getWeatherDescription(current.weathercode);
    weatherIcon.className = `weather-icon ${getWeatherIcon(current.weathercode)}`;
    feelsLikeElement.textContent = `${Math.round(weatherData.hourly.apparent_temperature[currentHourIndex])}°C`;
    humidityElement.textContent = `${Math.round(weatherData.hourly.relativehumidity_2m[currentHourIndex])}%`;
    windSpeedElement.textContent = `${Math.round(current.windspeed)} km/h`;
}

// Event listeners
searchButton.addEventListener('click', async () => {
    const city = searchInput.value.trim();
    if (city) {
        const locationData = await getCoordinates(city);
        if (locationData) {
            const weatherData = await getWeatherData(locationData.lat, locationData.lon);
            updateUI(locationData, weatherData);
        }
    }
});

searchInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            const locationData = await getCoordinates(city);
            if (locationData) {
                const weatherData = await getWeatherData(locationData.lat, locationData.lon);
                updateUI(locationData, weatherData);
            }
        }
    }
});
