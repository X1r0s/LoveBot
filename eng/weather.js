// weather.js

// Import required libraries:
// axios is used for making HTTP requests to the OpenWeatherMap API,
// and node-cron is used for scheduling tasks.
const axios = require("axios");
const cron = require("node-cron");

// ======================================================
// 1. Configuration
// ======================================================

// Insert your OpenWeatherMap API key below.
const weatherApiKey = "____"; // Replace with your OpenWeatherMap API key

// Specify the city for which you want to fetch weather data.
const city = "_____"; // Replace with the desired city (e.g., "Moscow")

// Define the list of allowed chat IDs (as strings) for which the bot should send weather notifications.
const allowedChatIds = ["______"]; // Replace with allowed chat IDs (e.g., ["123456789"])

// ======================================================
// 2. Mapping Weather Conditions to Custom Descriptions
// ======================================================

// This object maps the standard weather condition codes (as returned by the API)
// to custom phrases. You can modify these phrases as desired.
const conditionPhrases = {
  Clear: "Clear and sunny",
  Rain: "Rainy",
  Clouds: "Cloudy",
  Mist: "Misty",
  Fog: "Foggy",
  Smoke: "Smoky",
  Haze: "Hazy",
  Drizzle: "Light drizzle",
  Thunderstorm: "Stormy",
  Snow: "Snowy",
};

// ======================================================
// 3. Temperature Recommendations
// ======================================================

// Define an array of temperature ranges with corresponding recommendations.
// You can customize the ranges and advice as needed.
const temperatureRecommendations = [
  {
    min: -40,
    max: -30,
    advice: "Extremely cold! It is best to stay indoors.",
  },
  {
    min: -30,
    max: -20,
    advice: "Very cold! Dress very warmly.",
  },
  {
    min: -20,
    max: -10,
    advice: "Quite cold, ensure you wear appropriate winter clothing.",
  },
  {
    min: -10,
    max: 0,
    advice: "Cold weather; dress warmly and consider extra layers.",
  },
  {
    min: 0,
    max: 10,
    advice: "Cool weather; a warm jacket is recommended.",
  },
  {
    min: 10,
    max: 19,
    advice:
      "Mild weather; light clothing is suitable, but consider a light sweater.",
  },
  {
    min: 20,
    max: 26,
    advice: "Warm weather; dressing lightly is appropriate.",
  },
  {
    min: 26,
    max: 40,
    advice: "Very hot! Wear breathable clothes and stay well hydrated.",
  },
];

// ======================================================
// 4. Functions for Wind and Temperature Advice
// ======================================================

/**
 * Returns a recommendation based on the wind speed.
 * @param {number} speed - Wind speed in meters per second.
 * @returns {string} - Wind advice.
 */
function getWindAdvice(speed) {
  if (speed < 2) {
    return "Calm conditions.";
  } else if (speed >= 2 && speed < 5) {
    return "Light breeze.";
  } else if (speed >= 5 && speed < 8) {
    return "Moderate wind; please be cautious.";
  } else if (speed >= 8 && speed < 12) {
    return "Strong wind; take care when going outside.";
  } else {
    return "Very strong wind; it is advisable to remain indoors.";
  }
}

/**
 * Returns a temperature recommendation based on the current temperature.
 * @param {number} temp - Current temperature in degrees Celsius.
 * @returns {string} - Temperature advice.
 */
function getTemperatureAdvice(temp) {
  for (const range of temperatureRecommendations) {
    if (temp >= range.min && temp < range.max) {
      return range.advice;
    }
  }
  // If the temperature does not match any defined range, return a generic message.
  return "Temperature is outside expected ranges. Please check the current conditions.";
}

// ======================================================
// 5. Function to Fetch Weather Data from OpenWeatherMap
// ======================================================

/**
 * Fetches weather data from OpenWeatherMap for the specified city.
 * The function returns an object containing the current temperature,
 * a description, the main weather condition, and the wind speed.
 * @returns {Promise<Object|null>} - Returns weather data or null if an error occurs.
 */
async function fetchWeather() {
  try {
    // Construct the API URL with the specified city, API key, and metric units.
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`
    );
    // Extract necessary data from the API response.
    const temp = response.data.main.temp;
    const description = response.data.weather[0].description;
    const weatherMain = response.data.weather[0].main;
    const windSpeed = response.data.wind.speed;
    console.log(
      `Weather data: ${temp}°C, ${description}, wind: ${windSpeed} m/s`
    );
    return { temp, description, weatherMain, windSpeed };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

// ======================================================
// 6. Function to Schedule and Send Weather Notifications
// ======================================================

/**
 * Schedules weather notifications to be sent to a given chatId at specified times.
 * The function checks if the chatId is allowed, then for each scheduled time,
 * it sets up a cron job that fetches the weather data, composes a message with
 * custom descriptions and recommendations, and sends it via the Telegram bot.
 * @param {Object} bot - An instance of TelegramBot.
 * @param {string|number} chatId - The chat ID to which notifications will be sent.
 */
function setupWeatherMessages(bot, chatId) {
  // Check if the chatId is in the allowed list.
  if (!allowedChatIds.includes(chatId.toString())) {
    console.log(
      `Chat ID ${chatId} is not allowed to receive weather notifications.`
    );
    return;
  }

  // Define the times at which notifications should be sent.
  const times = ["10:00", "20:00"];
  console.log(
    `Scheduling weather notifications for chat ID ${chatId} at: ${times.join(
      ", "
    )}`
  );

  // For each scheduled time, set up a cron job.
  times.forEach((time) => {
    // Split the time string into hour and minute.
    const [hour, minute] = time.split(":");
    // Create a cron expression in the format "minute hour * * *" (every day at the specified time).
    const cronExpression = `${minute} ${hour} * * *`;
    console.log(
      `Setting up cron job for ${time} (cron: "${cronExpression}") for chat ID ${chatId}`
    );

    // Schedule the cron job.
    cron.schedule(cronExpression, async () => {
      console.log(`Cron job triggered at ${time} for chat ID ${chatId}`);
      // Fetch weather data.
      const weather = await fetchWeather();
      if (!weather) {
        // If fetching fails, send an error message.
        bot.sendMessage(
          chatId,
          "Unable to retrieve weather data. Please try again later."
        );
        return;
      }
      const { temp, description, weatherMain, windSpeed } = weather;

      // Determine the custom weather condition using the mapping.
      const condition = conditionPhrases[weatherMain] || description;
      // Get advice based on temperature and wind speed.
      const tempAdvice = getTemperatureAdvice(temp);
      const windAdvice = getWindAdvice(windSpeed);

      // Compose the final message.
      const message = `🌦 Weather update in ${city}:
Temperature: ${temp}°C, ${condition}
Wind: ${windSpeed} m/s (${windAdvice})

Advice: ${tempAdvice}`;

      // Send the weather notification.
      bot
        .sendMessage(chatId, message)
        .then(() =>
          console.log(`Weather notification sent to chat ID ${chatId}`)
        )
        .catch((error) =>
          console.error("Error sending weather notification:", error)
        );
    });
  });
}

// ======================================================
// 7. Export the setupWeatherMessages function
// ======================================================

module.exports = { setupWeatherMessages };
