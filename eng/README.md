```markdown
# Documentation for Love Bot
## **Introduction** 💖

Welcome to the documentation for **Love Bot**! 🌹

**Love Bot** is a small romantic project initially created just for my significant other. However, I decided to release a neutral version (without my personal love confessions) for public access!

**The bot offers the following features:**
- 💌 Sends random sweet messages from your list to the chat when you press a button.
- 🌤️ Sends weather updates and cute clothing recommendations at a specific time (e.g., "It's -1°C outside, dress warmly! ❄️").
- ⏰ Sends charming reminders at specific times (e.g., a reminder to eat 🍽️).
- 💕 Serves as a constant virtual reminder of your love.

This documentation provides a complete overview of the bot, its installation process, the technologies used, and detailed descriptions of each module.

---

## **Technologies Used**
- **Node.js**: Runtime environment for executing JavaScript code.
- **Telegram Bot API**: For interacting with Telegram users.
- **node-cron**: Manages scheduled tasks (e.g., reminders).
- **axios**: For sending HTTP requests and fetching weather data.
- **PM2**: Process manager for keeping the bot running continuously.

---

## **Installation**

### **Dependencies**
Before installation, ensure the following are installed on your server:
- Node.js (version 16 or higher)
- npm (Node.js package manager)
- PM2

### **Installation Steps**

#### **On Local Machine**
1. Clone the repository:
   
```bash
   git clone https://github.com/your_user/LoveBot.git
```

2. Navigate to the project directory:
   
```bash
   cd LoveBot
```

3. Install dependencies:
   
```bash
   npm install
```

4. Create a bot token using @BotFather on Telegram. // Customization is straightforward.

5. Use @myidbot on Telegram to get the chat_id where the sweet reminders and messages will be sent. // Personally, I set mine and my partner's.

---

#### **On Server**
1. Connect to the server via SSH:
   
```bash
   ssh root@server_address
```

2. Update the system:
   
```bash
   sudo apt update && sudo apt upgrade -y
```

3. Install Node.js and npm:
   
```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs
```

4. Install PM2:
   
```bash
   npm install -g pm2
```

5. Copy the project to the server:
   // Create an archive locally using:
   
```bash
   tar -czvf love-bot.tar.gz .
```

   Then transfer it:
   
```bash
   scp love-bot.tar.gz root@server_address:/root
```

6. Extract the project on the server:
   
```bash
   cd /root
   tar -xzvf love-bot.tar.gz
   cd love-bot
```

7. Install dependencies:
   
```bash
   npm install
```

8. Start the bot using PM2:
   
```bash
   pm2 start bot.js --name "love-bot"
   pm2 save
   pm2 startup
```

---

## **Project Structure**

LoveBot/
├── bot.js  
├── modules/  
│   ├── reminders.js  
│   ├── weather.js  
│   ├── messages.js  
├── package.json  
└── Readme.md  

### **Main File**
- **bot.js**: Entry point for the application. Handles user interaction and connects modules.

### **Modules**
#### **1. reminders.js**
- **Purpose**: Manages reminders scheduled for specific times.
- **Location**: modules/reminders.js
- **Key Functions**:
  - setupReminders(bot, chatId): Sets up reminders for the specified chat_id.

#### **2. weather.js**
- **Purpose**: Fetches and sends weather updates.
- **Location**: modules/weather.js
- **Key Functions**:
  - fetchWeather(): Retrieves current weather data from OpenWeather API.
  - setupWeatherMessages(bot, chatId): Configures weather notifications.

#### **3. messages.js**
- **Purpose**: Handles requests to send romantic messages.
- **Location**: modules/messages.js
- **Key Functions**:
  - getRandomLoveMessage(): Returns a random romantic message.

---

## **Code Highlights**

### **1. bot.js**
Handles user interaction and connects modules.

#### Key Sections:
- **Initialization**:
  
```javascript
  const TelegramBot = require('node-telegram-bot-api');
  const { setupReminders } = require('./modules/reminders');
  const { setupWeatherMessages } = require('./modules/weather');
  const { getRandomLoveMessage } = require('./modules/messages');

  const token = process.env.TELEGRAM_BOT_TOKEN; // Your bot token
  const bot = new TelegramBot(token, { polling: true });
```

- **User Interaction**:
  
```javascript
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "// Example: When did we meet?");
  }); // Small quiz example
```

- **Module Integration**:
  
```javascript
  setupReminders(bot, chatId); // Setting reminders
  setupWeatherMessages(bot, chatId); // Configuring weather notifications
```

### **2. reminders.js**

#### Example Code:
```javascript
const cron = require('node-cron');

const reminders = [
  { time: '08:00', message: 'Good morning! Have a wonderful day!' }, // Reminder example
  { time: '20:00', message: 'It’s evening, don’t forget to eat!' }
];

function setupReminders(bot, chatId) {
  reminders.forEach((reminder) => {
    cron.schedule(reminder.time, () => {
      bot.sendMessage(chatId, reminder.message); // Sends scheduled messages
    });
  });
}

module.exports = { setupReminders };
```

### **3. weather.js**

#### Example Code:
```javascript
const axios = require('axios');
const cron = require('node-cron');

const weatherApiKey = 'your_api_key'; // API key from OpenWeather
const city = 'Kyoto'; // Your city

async function fetchWeather() {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
    const temp = response.data.main.temp;
    const description = response.data.weather[0].description;
    return { temp, description };
  } catch (error) {
    console.error('Error fetching weather data:', error); // Log errors
    return null;
  }
}

function setupWeatherMessages(bot, chatId) {
  const times = ['08:00', '20:00']; // Times for weather notifications
  times.forEach((time) => {
    cron.schedule(time, async () => {
      const weather = await fetchWeather();
      if (!weather) {
        bot.sendMessage(chatId, 'Couldn’t fetch the weather data, but I still care about you! ❤️');
        return;
      }

      const { temp, description } = weather;
      let advice = 'Dress comfortably!'; // Default advice
      if (temp < 0) {
        advice = 'It’s freezing! Dress warmly and don’t forget a scarf! ❄️';
      } else if (temp >= 0 && temp <= 10) {
        advice = 'It’s chilly outside. Bring a jacket. 🌬️';
      } else if (temp > 10 && temp <= 20) {
        advice = 'The weather is nice, but take something light. 🌤️';
      } else {
        advice = 'It’s warm! Light clothes are fine. ☀️';
      }

      bot.sendMessage(chatId, `Currently in ${city}: ${temp}°C, ${description}. ${advice}`);
    });
  });
}

module.exports = { fetchWeather, setupWeatherMessages };
```

---

## **Best Practices**
1. **Token Security**:
   - Store the token in a .env file. // Optional, not done in this setup.
2. **Testing**:
   - Test changes locally before deploying to the server. // We don’t want the bot to fail for our significant other.
3. **Use PM2**:
   - For automatic restarts in case of crashes.

---

## **Updating the Bot on the Server**
1. Make changes in the local repository.
2. Commit the changes:
   
```bash
   git add .
   git commit -m "Bot update"
```

3. Push the changes to the remote repository:
   
```bash
   git push origin main
```

4. On the server:
   
```bash
   cd /root/love-bot
   git pull origin main
   pm2 restart love-bot
```

---

## **License**
This project is licensed under the MIT License. See the LICENSE file for details.
