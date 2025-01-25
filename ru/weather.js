const axios = require('axios') // Подключаем axios для запросов
const cron = require('node-cron') // Подключаем node-cron для планирования
const TelegramBot = require('node-telegram-bot-api') 

const weatherApiKey = 'your_weather_api' // Вставь свой API-ключ OpenWeatherMap
const city = 'Kioto' // Укажи город
const token = 'your_token' // Вставь токен от BotFather
const bot = new TelegramBot(token, { polling: false }) // Создаём экземпляр бота

// Разрешённые chatId
const allowedChatIds = ['yourGf_tg_id']  // From @myidbot in Telegram

// Функция для получения данных о погоде
async function fetchWeather() {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`) // Запрос к API погоды
        const temp = response.data.main.temp
        const description = response.data.weather[0].description
        console.log(`Получены данные о погоде: ${temp}°C, ${description}`) // Лог получения данных о погоде
        return { temp, description }
    } catch (error) {
        console.error('Ошибка получения данных о погоде:', error) // Лог ошибки получения данных о погоде
        return null
    }
}

// Функция для отправки уведомлений о погоде
function setupWeatherMessages(bot, chatId) {
    if (!allowedChatIds.includes(chatId.toString())) {
        console.log(`chatId: ${chatId} не разрешён для получения уведомлений о погоде`) // Лог не разрешенного id, если срабатывает, проверьте id в разрешенных выше
        return
    }

    const times = ['12:00', '20:00'] // Укажи ближайшее время для теста
    console.log(`Планируем отправку погоды для chatId: ${chatId} в ${times.join(', ')}`)

    times.forEach((time) => {
        const [hour, minute] = time.split(':')
        const cronExpression = `${minute} ${hour} * * *` // Формат для cron: "минуты часы * * *"

        console.log(`Планируется задача по cron на ${time} для chatId: ${chatId}`)

        cron.schedule(cronExpression, async () => {
            console.log(`Задача по cron началась на ${time} для chatId: ${chatId}`)
            const weather = await fetchWeather()
            if (!weather) {
                bot.sendMessage(chatId, 'Не удалось получить данные о погоде. Но я всё равно тебя люблю! ❤️')
                return
            }

            const { temp, description } = weather 

            let advice = 'Одевайся комфортно!' // Тут мы даём советы основываясь на ощущениях нашей половинки к погоде с помощью if else, в идеале опишите сами советы, проявите заботу
            if (temp < 0) {
                advice = 'Очень холодно! Оденься теплее! ❄️'
            } else if (temp >= 0 && temp <= 10) {
                advice = 'На улице прохладно. Накинь пальто. 🌬️'
            } else if (temp > 10 && temp <= 20) {
                advice = 'Погода приятная, но можно что то накинуть. 🌤️'
            } else {
                advice = 'Тепло! Одевайся свободнее. ☀️'
            }

            bot.sendMessage(chatId, `Сейчас в городе ${city} ${temp}°C, ${description}. ${advice} ❤️`) // Отправляем сообщение с погодой и советом
                .then(() => console.log(`Сообщение успешно отправлено в chatId: ${chatId}`)) // Лог успешной отправки сообщенияs
                .catch(error => console.error('Ошибка отправки сообщения:', error)) // Лог ошибки отправки сообщения
        })
    })
}

// Экспорт функции
module.exports = { setupWeatherMessages }

// Настройка таймера для всех разрешённых chatId
allowedChatIds.forEach(chatId => setupWeatherMessages(bot, chatId))
