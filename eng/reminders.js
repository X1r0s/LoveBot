const cron = require('node-cron');

const reminders = [ // Array of reminders
    { time: `11:30`, message: `Good morning! Have a great day!` },
    { time: `15:30`, message: `Darling, don't forget to have lunch! Love you` },
    { time: `20:30`, message: `It's getting late, don't stay up too long!` }
]; // Be creative, come up with unique messages to surprise

const allowedChatIds = [`yourIdfromTg`]; // Allowed chat IDs

function setupReminders(bot, chatId) {
    console.log(`Starting setup of reminders for chatId: ${chatId}`); // Log the start of reminder setup

    if (!allowedChatIds.includes(chatId.toString())) {
        console.log(`chatId: ${chatId} is not allowed to receive reminders`); // Log for unauthorized chat ID
        return;
    }

    reminders.forEach((reminder) => { // Iterate through the reminders array
        const [hour, minute] = reminder.time.split(':');
        const cronExpression = `${minute} ${hour} * * *`;

        console.log(`Scheduling reminder: "${reminder.message}" for chatId: ${chatId} at ${reminder.time}`); // Log scheduled reminder

        cron.schedule(cronExpression, () => {
            console.log(`Reminder triggered for chatId: ${chatId} at ${reminder.time}`); // Log reminder trigger
            bot.sendMessage(chatId, reminder.message)
                .then(() => console.log(`Reminder successfully sent to chatId: ${chatId} at ${reminder.time}`)) // Log successful reminder send
                .catch(error => console.error(`Error sending reminder to chatId: ${chatId} at ${reminder.time}`, error)); // Log error in sending reminder
        });

        console.log(`Cron job for chatId: ${chatId} at ${reminder.time} has been set up`); // Log cron job setup immediately after bot starts
    });

    console.log(`All reminders have been set up for chatId: ${chatId}`); // Log completion of all reminder setups
}

module.exports = { setupReminders }; // Export the function for use in the main file
