const TelegramBot = require('node-telegram-bot-api')
const { setupReminders } = require('./reminders') // Подключаем модуль напоминаний
const { setupWeatherMessages } = require('./weather') // Подключаем модуль погоды
const { getRandomLoveMessage } = require('./messages') // Подключаем модуль сообщений

// Токен от BotFather
const token = 'your_token_here'

// Создаём экземпляр бота
const bot = new TelegramBot(token, { polling: true })

// Разрешённые chatId
const allowedChatIds = ['yourGf_tg_id'] // Из @myidbot в телеграм

// Проверка, разрешён ли chatId
function isAllowed(chatId) {
    return allowedChatIds.includes(chatId.toString())
}

// Прямой вызов настройки напоминаний и уведомлений для всех chatId
console.log('Настраиваем напоминания и погоду для всех разрешённых chatId...')
allowedChatIds.forEach(chatId => {
    console.log(`Прямой вызов настройки напоминаний для chatId: ${chatId}`)
    setupReminders(bot, chatId)

    console.log(`Прямой вызов настройки уведомлений о погоде для chatId: ${chatId}`)
    setupWeatherMessages(bot, chatId)
})

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id

    console.log(`Получена команда /start от chatId: ${chatId}`) // Лог команды /start

    // Проверяем, разрешён ли chatId
    if (!isAllowed(chatId)) {
        bot.sendMessage(chatId, "У вас нет доступа к этому боту. 🚫") // id нет в списке допущенных к боту
        console.log(`chatId: ${chatId} не разрешён для доступа`)
        return
    }

    bot.sendMessage(chatId, "Привет! Чтобы получить доступ, нужно пройти тест! \n\nКакого числа мы познакомились?") // Задаём вопрос для одноответного теста
    bot.once('message', (answer) => {
        console.log(`Ответ на тест от chatId: ${chatId} -> ${answer.text}`)

        if (answer.text === "11") { // Указываем ответ на вопрос, функция проверки ответа.
            bot.sendMessage(chatId, "Молодец! Добро пожаловать в нашего бота!", {
                reply_markup: {
                    keyboard: [
                        [{ text: "Любит ли меня name?" }], // Пример кнопки, при нажатии на которую бот отправит сообщения с признаниями в любви. В вашем случае это может быть что угодно.
                    ],
                    resize_keyboard: true
                }
            })

            // Устанавливаем напоминания и уведомления о погоде
            console.log(`Настраиваем напоминания и уведомления о погоде для chatId: ${chatId}`) // Логи настройки напоминаний и погоды
            setupReminders(bot, chatId)
            setupWeatherMessages(bot, chatId)
        } else {
            bot.sendMessage(chatId, "Если просто ошиблась, не переживай, напиши /start.") // Если id верный, а ответ неправильный
            console.log(`chatId: ${chatId} не прошёл тест`) // Логи не прохождения теста
        }
    })
})

// Обработчик для кнопки 
bot.on('message', (msg) => {
    const chatId = msg.chat.id

    // Проверяем, разрешён ли chatId
    if (!isAllowed(chatId)) {
        console.log(`chatId: ${chatId} попытался отправить сообщение, но доступ запрещён`) // Логи попытки отправки сообщения
        return
    }

    if (msg.text === "Любит ли меня Name?") {  // Проверка на текст кнопки
        const loveMessage = getRandomLoveMessage()
        bot.sendMessage(chatId, loveMessage)
        console.log(`Ответ "Любит ли меня Name?" отправлен в chatId: ${chatId} -> ${loveMessage}`) // Логи отправки сообщения
    }
})

// Лог запуска бота
console.log('Бот успешно запущен и готов к работе!') 