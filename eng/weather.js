const axios = require("axios"); // Import axios for making HTTP requests
const cron = require("node-cron"); // Import node-cron for scheduling tasks
const TelegramBot = require("node-telegram-bot-api");

const weatherApiKey = "your_weather_api"; // Insert your OpenWeatherMap API key
const city = "Kyoto"; // Specify the city
const token = "your_token"; // Insert your BotFather token
const bot = new TelegramBot(token, { polling: false }); // Create a bot instance

// Allowed chat IDs
const allowedChatIds = ["yourGf_tg_id"]; // Replace with your chat ID from @myidbot

// Function to fetch weather data
async function fetchWeather() {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`
    ); // Request weather data
    const temp = response.data.main.temp;
    const description = response.data.weather[0].description;
    console.log(`Weather data retrieved: ${temp}°C, ${description}`); // Log weather data retrieval
    return { temp, description };
  } catch (error) {
    console.error("Error fetching weather data:", error); // Log weather data fetch error
    return null;
  }
}

// Function to send weather notification
function setupWeatherMessages(bot, chatId) {
  if (!allowedChatIds.includes(chatId.toString())) {
    console.log(`chatId: ${chatId} is not allowed to receive weather updates`); // Log unauthorized chat ID
    return;
  }

  const times = ["12:00", "20:00"]; // Specify times for notifications
  console.log(
    `Scheduling weather updates for chatId: ${chatId} at ${times.join(", ")}`
  );

  times.forEach((time) => {
    const [hour, minute] = time.split(":");
    const cronExpression = `${minute} ${hour} * * *`; // Cron format: "minutes hours * * *"

    console.log(`Cron job scheduled at ${time} for chatId: ${chatId}`);

    cron.schedule(cronExpression, async () => {
      console.log(`Cron job triggered at ${time} for chatId: ${chatId}`);
      const weather = await fetchWeather();
      if (!weather) {
        bot.sendMessage(
          chatId,
          "Unable to retrieve weather data, but I still love you! ❤️"
        );
        return;
      }

      const { temp, description } = weather;

      let advice = "Dress comfortably!"; // Provide advice based on the weather; feel free to customize it
      if (temp < 0) {
        advice = "It’s freezing! Dress warmly! ❄️";
      } else if (temp >= 0 && temp <= 10) {
        advice = "It’s chilly outside. Wear a coat. 🌬️";
      } else if (temp > 10 && temp <= 20) {
        advice =
          "The weather is nice, but you might want to bring a jacket. 🌤️";
      } else {
        advice = "It’s warm! Dress light. ☀️";
      }

      bot
        .sendMessage(
          chatId,
          `Currently in ${city}: ${temp}°C, ${description}. ${advice} ❤️`
        ) // Send weather update with advice
        .then(() =>
          console.log(`Message successfully sent to chatId: ${chatId}`)
        ) // Log successful message delivery
        .catch((error) => console.error("Error sending message:", error)); // Log message send error
    });
  });
}

// Export the function
module.exports = { setupWeatherMessages };
