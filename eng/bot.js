const TelegramBot = require('node-telegram-bot-api');
const { setupReminders } = require('./reminders'); // Import reminders module
const { setupWeatherMessages } = require('./weather'); // Import weather notifications module
const { getRandomLoveMessage } = require('./messages'); // Import random love messages module

// Token from BotFather
const token = 'your_token_here';

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Allowed chat IDs
const allowedChatIds = ['yourGf_tg_id']; // Replace with your chat ID from @myidbot

// Function to check if chatId is allowed
function isAllowed(chatId) {
    return allowedChatIds.includes(chatId.toString());
}

// Directly initialize reminders and weather notifications for all allowed chat IDs
console.log('Setting up reminders and weather notifications for all allowed chat IDs...');
allowedChatIds.forEach(chatId => {
    console.log(`Directly setting up reminders for chatId: ${chatId}`);
    setupReminders(bot, chatId);

    console.log(`Directly setting up weather notifications for chatId: ${chatId}`);
    setupWeatherMessages(bot, chatId);
});

// Command handler for /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    console.log(`Received /start command from chatId: ${chatId}`); // Log the /start command

    // Check if chatId is allowed
    if (!isAllowed(chatId)) {
        bot.sendMessage(chatId, "You do not have access to this bot. 🚫"); // If chat ID is not allowed
        console.log(`chatId: ${chatId} is not allowed`);
        return;
    }

    bot.sendMessage(chatId, "Hi! To gain access, you need to pass a test! \n\nWhat date did we meet?"); // Ask a simple test question
    bot.once('message', (answer) => {
        console.log(`Test answer from chatId: ${chatId} -> ${answer.text}`);

        if (answer.text === "11") { // Check the correct answer
            bot.sendMessage(chatId, "Well done! Welcome to the bot!", {
                reply_markup: {
                    keyboard: [
                        [{ text: "Does Name love me?" }], // Example button triggering a love message
                    ],
                    resize_keyboard: true
                }
            });

            // Set up reminders and weather notifications
            console.log(`Setting up reminders and weather notifications for chatId: ${chatId}`); // Log the setup process
            setupReminders(bot, chatId);
            setupWeatherMessages(bot, chatId);
        } else {
            bot.sendMessage(chatId, "If you made a mistake, don't worry. Just type /start."); // If the answer is wrong
            console.log(`chatId: ${chatId} failed the test`); // Log failed test
        }
    });
});

// Handler for buttons
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Check if chatId is allowed
    if (!isAllowed(chatId)) {
        console.log(`chatId: ${chatId} tried to send a message but access is denied`); // Log denied access attempt
        return;
    }

    if (msg.text === "Does Name love me?") {  // Check button text
        const loveMessage = getRandomLoveMessage();
        bot.sendMessage(chatId, loveMessage);
        console.log(`Answer to "Does Name love me?" sent to chatId: ${chatId} -> ${loveMessage}`); // Log the response
    }
});

// Log when the bot starts successfully
console.log('Bot has successfully started and is ready to work!');
