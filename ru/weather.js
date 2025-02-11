// weather.js

// Импортируем библиотеки:
// axios – для выполнения HTTP-запросов,
// node-cron – для планирования выполнения задач по расписанию.
const axios = require("axios");
const cron = require("node-cron");

// =============================
// 1. Конфигурация
// =============================

// Задайте свой API-ключ OpenWeatherMap, город и список разрешённых chatId,
// для которых бот будет отправлять уведомления о погоде.
const weatherApiKey = "____"; // Вставьте ваш API-ключ OpenWeatherMap
const city = "_____"; // Укажите название города (например, Moscow)
const allowedChatIds = ["______"]; // Укажите список разрешённых chatId (например, ["123456789"])

// =============================
// 2. Настройка отображения погодных условий
// =============================

// Объект conditionPhrases сопоставляет стандартные значения, возвращаемые API, с
// пользовательскими описаниями (вы можете изменять эти строки по своему усмотрению).
const conditionPhrases = {
  Clear: "Солнечно",
  Rain: "Дождь",
  Clouds: "Облачно",
  Mist: "Туманно",
  Fog: "Туманно",
  Smoke: "Смог",
  Haze: "Туманно",
  Drizzle: "Небольшой дождик",
  Thunderstorm: "Шторм",
  Snow: "Снежок",
};

// Массив temperatureRecommendations содержит диапазоны температур и
// соответствующие рекомендации по одежде и поведению.
// Вы можете изменить диапазоны и рекомендации под свои нужды.
const temperatureRecommendations = [
  {
    min: -40,
    max: -30,
    advice: "Очень холодно! Лучше оставаться в помещении.",
  },
  {
    min: -30,
    max: -20,
    advice: "Экстремально холодно! Одевайтесь очень тепло.",
  },
  {
    min: -20,
    max: -10,
    advice: "Очень холодно, рекомендуется теплая одежда и аксессуары.",
  },
  {
    min: -10,
    max: 0,
    advice: "Холодно, оденьтесь тепло, накиньте капюшон.",
  },
  {
    min: 0,
    max: 10,
    advice: "Низкая температура, одевайтесь теплее.",
  },
  {
    min: 10,
    max: 19,
    advice:
      "Умеренно, легкая одежда подойдет, но можно добавить что-то сверху.",
  },
  {
    min: 20,
    max: 26,
    advice: "Тепло, легкая одежда оптимальна.",
  },
  {
    min: 26,
    max: 40,
    advice: "Очень жарко, одевайтесь прохладно и пейте больше воды.",
  },
];

// =============================
// 3. Функции для генерации рекомендаций
// =============================

/**
 * Функция getWindAdvice возвращает текстовую рекомендацию в зависимости от скорости ветра.
 * @param {number} speed - Скорость ветра в м/с.
 * @returns {string} - Рекомендация по ветру.
 */
function getWindAdvice(speed) {
  if (speed < 2) {
    return "Почти безветренно.";
  } else if (speed >= 2 && speed < 5) {
    return "Легкий ветерок.";
  } else if (speed >= 5 && speed < 8) {
    return "Умеренный ветер, будьте осторожны.";
  } else if (speed >= 8 && speed < 12) {
    return "Сильный ветер, соблюдайте осторожность.";
  } else {
    return "Очень сильный ветер, лучше оставаться в помещении.";
  }
}

/**
 * Функция getTemperatureAdvice проходит по массиву диапазонов температур и возвращает соответствующую рекомендацию.
 * @param {number} temp - Текущая температура.
 * @returns {string} - Рекомендация по температуре.
 */
function getTemperatureAdvice(temp) {
  for (const range of temperatureRecommendations) {
    if (temp >= range.min && temp < range.max) {
      return range.advice;
    }
  }
  // Если температура не попадает ни в один диапазон
  return "Температура вне пределов прогнозируемых значений. Проверьте актуальные данные.";
}

// =============================
// 4. Функция для получения данных о погоде
// =============================

/**
 * Функция fetchWeather выполняет запрос к API OpenWeatherMap для получения данных о погоде.
 * @returns {Promise<Object|null>} - Объект с данными о погоде (температура, описание, основное состояние, скорость ветра) или null в случае ошибки.
 */
async function fetchWeather() {
  try {
    // Формируем URL для запроса к API с нужными параметрами
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`
    );
    // Извлекаем необходимые данные из ответа
    const temp = response.data.main.temp;
    const description = response.data.weather[0].description;
    const weatherMain = response.data.weather[0].main;
    const windSpeed = response.data.wind.speed;
    // Выводим полученные данные в консоль для отладки
    console.log(
      `Получены данные о погоде: ${temp}°C, ${description}, ветер: ${windSpeed} м/с`
    );
    return { temp, description, weatherMain, windSpeed };
  } catch (error) {
    console.error("Ошибка получения данных о погоде:", error);
    return null;
  }
}

// =============================
// 5. Функция для отправки уведомлений о погоде
// =============================

/**
 * Функция setupWeatherMessages планирует отправку уведомлений о погоде в заданное время.
 * Если данные о погоде получить не удалось, отправляет сообщение об ошибке.
 * @param {Object} bot - Экземпляр TelegramBot.
 * @param {string|number} chatId - Идентификатор чата, для которого отправляются уведомления.
 */
function setupWeatherMessages(bot, chatId) {
  // Проверяем, разрешено ли отправлять уведомления для данного chatId
  if (!allowedChatIds.includes(chatId.toString())) {
    console.log(`Chat ID ${chatId} не разрешён для уведомлений о погоде.`);
    return;
  }

  // Задаем время отправки уведомлений (например, два раза в день)
  const times = ["10:00", "20:00"];
  console.log(
    `Настройка отправки уведомлений о погоде для chat ID ${chatId} в ${times.join(
      ", "
    )}`
  );

  // Для каждого времени планируем задачу через cron
  times.forEach((time) => {
    // Разбиваем строку времени на часы и минуты
    const [hour, minute] = time.split(":");
    // Формируем cron-выражение (например, "00 10 * * *" для 10:00 каждый день)
    const cronExpression = `${minute} ${hour} * * *`;
    console.log(
      `Настройка cron-задачи для ${time} (cron: "${cronExpression}") для chat ID ${chatId}`
    );

    // Планируем выполнение задачи
    cron.schedule(cronExpression, async () => {
      console.log(
        `Запуск cron-задачи для времени ${time} для chat ID ${chatId}`
      );
      const weather = await fetchWeather();
      if (!weather) {
        // Если данные не получены, отправляем сообщение с уведомлением об ошибке
        bot.sendMessage(
          chatId,
          "Не удалось получить данные о погоде. Пожалуйста, попробуйте позже."
        );
        return;
      }
      // Деструктурируем данные о погоде
      const { temp, description, weatherMain, windSpeed } = weather;

      // Определяем кастомное описание погодного состояния с помощью объекта conditionPhrases
      const condition = conditionPhrases[weatherMain] || description;
      // Получаем рекомендации по температуре и ветру
      const tempAdvice = getTemperatureAdvice(temp);
      const windAdvice = getWindAdvice(windSpeed);

      // Формируем итоговое сообщение с информацией о погоде и рекомендациями
      const message = `🌦 Погода в ${city}:
Температура: ${temp}°C, ${condition}  
Ветер: ${windSpeed} м/с (${windAdvice})  

Рекомендация: ${tempAdvice}`;

      // Отправляем сообщение через Telegram Bot API
      bot
        .sendMessage(chatId, message)
        .then(() =>
          console.log(`Уведомление о погоде отправлено для chat ID ${chatId}`)
        )
        .catch((error) =>
          console.error("Ошибка отправки уведомления о погоде:", error)
        );
    });
  });
}

// Экспортируем функцию setupWeatherMessages для использования в основном файле бота.
module.exports = { setupWeatherMessages };
