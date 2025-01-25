const cron = require('node-cron')

const reminders = [ // Массив с напоминаниями 
    { time: `11:30`, message: `Доброе утро! Хорошего тебе денька!` },
    { time: `15:30`, message: `Догорая, не забудь пообедать! Лю` },
    { time: `20:30`, message: `Уже вечереет, незасиживайся долго!` }
] // Креативьте, придумывайте, удивляйте

const allowedChatIds = [`yourIdfromTg`] // Разрешенные id чатов

function setupReminders(bot, chatId) {
    console.log(`Начинается настройка напоминаний для chatId: ${chatId}`) // Лог начала настройки напоминаний

    if (!allowedChatIds.includes(chatId.toString())) {
        console.log(`chatId: ${chatId} не разрешён для получения напоминаний`) // Лог не разрешенного id
        return
    }

    reminders.forEach((reminder) => { // Перебор массива с напоминаниями
        const [hour, minute] = reminder.time.split(':')
        const cronExpression = `${minute} ${hour} * * *`

        console.log(`Планируется напоминание: "${reminder.message}" для chatId: ${chatId} на ${reminder.time}`) // Лог планируемого напоминания

        cron.schedule(cronExpression, () => {
            console.log(`Напоминание для chatId: ${chatId} началось в ${reminder.time}`) // Лог начала напоминания
            bot.sendMessage(chatId, reminder.message)
                .then(() => console.log(`Напоминание успешно отправлено для chatId: ${chatId} в ${reminder.time}`)) // Лог успешной отправки напоминания
                .catch(error => console.error(`Ошибка отправки напоминания для chatId: ${chatId} в ${reminder.time}`, error)) // Лог ошибки отправки напоминания
        })

        console.log(`Задача по cron для chatId: ${chatId} на ${reminder.time} установлена`) // Лог установки задачи отображается сразу при запуске бота
    })

    console.log(`Все напоминания настроены для chatId: ${chatId}`) 
}

module.exports = { setupReminders } // Экспорт функции в основной файл
