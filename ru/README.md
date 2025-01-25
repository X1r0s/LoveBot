# Документация к Love Bot
## **Введение** 💖

Добро пожаловать в документацию к **Love Bot**! 🌹

**Love Bot** — это небольшой романтический проект, изначально созданный только для моей второй половинки. Но я решил опубликовать его нейтральную версию (без моих личных признаний в любви) в общий доступ! 

**Бот обладает следующими функциями:**
- 💌 Отправляет рандомные милые сообщения в чат из вашего списка после нажатия на кнопку.
- 🌤️ В определенное время отправляет пользователю информацию о погоде и даёт милые рекомендации по одежде (например, "Сегодня на улице -1, одевайся теплее! ❄️").
- ⏰ Отправляет в определенное время очаровательные напоминания (например, напоминание покушать 🍽️).
- 💕 Является постоянным виртуальным напоминанием о вашей любви.

Эта документация предоставляет полный обзор бота, процесса его установки, используемых технологий и подробное описание каждого модуля.
---

## **Используемые технологии**
- **Node.js**: Среда выполнения для запуска JavaScript-кода.
- **Telegram Bot API**: Для взаимодействия с пользователями Telegram.
- **node-cron**: Управляет задачами, выполняемыми по расписанию (например, напоминания).
- **axios**: Для отправки HTTP-запросов и получения данных о погоде.
- **PM2**: Менеджер процессов для непрерывной работы бота.

---

## **Установка**

### **Зависимости**
Перед установкой убедитесь, что на сервере установлены:
- Node.js (версия 16 или выше)
- npm (менеджер пакетов Node.js)
- PM2

### **Шаги установки**

#### **На локальной машине**
1. Клонируйте репозиторий:
   
```bash
   git clone https://github.com/ваш_пользователь/LoveBot.git
```

2. Перейдите в директорию проекта:
   
```bash
   cd LoveBot
```

3. Установите зависимости:
   
```bash
   npm install
```

4. Создайте токен бота через @BotFather в Telegram. Как кастомизировать, я думаю разберётесь, всё просто.

5. Узнайте chat_id с помощью @myidbot в Telegram, чтобы милые напоминания и сообщения отправлялись только в определенные чаты. Я лично выставил свой и своей половинки.

---

#### **На сервере**
1. Подключитесь к серверу через SSH:
   
```bash
   ssh root@адрес_сервера
```

2. Обновите систему:
   
```bash
   sudo apt update && sudo apt upgrade -y
```

3. Установите Node.js и npm:
   
```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs
```

4. Установите PM2:
   
```bash
   npm install -g pm2
```

5. Скопируйте проект на сервер:  (Архив создается с помощью команды tar -czvf love-bot.tar.gz . открыв предварительно проект в консоли через cd ~/lovebot)
   На локальной машине выполните:
   
```bash
   scp love-bot.tar.gz root@адрес_сервера:/root
```

6. На сервере распакуйте проект:
   
```bash
   cd /root
   tar -xzvf love-bot.tar.gz
   cd love-bot
```

7. Установите зависимости:
   
```bash
   npm install
```

8. Запустите бота через PM2:
   
```bash
   pm2 start bot.js --name "love-bot"
   pm2 save
   pm2 startup
```

---

## **Структура проекта**

LoveBot/
├── bot.js
├── modules/
│   ├── reminders.js
│   ├── weather.js
│   ├── messages.js
├── package.json
└── Readme.md


### **Главный файл**
- **bot.js**: Точка входа в приложение. Обрабатывает взаимодействие с пользователем и подключает модули.

### **Модули**
#### **1. reminders.js**
- **Назначение**: Управляет напоминаниями, выполняемыми по расписанию.
- **Расположение**: modules/reminders.js
- **Ключевые функции**:
  - setupReminders(bot, chatId): Настраивает напоминания для указанного chat_id.

#### **2. weather.js**
- **Назначение**: Получает и отправляет данные о погоде.
- **Расположение**: modules/weather.js
- **Ключевые функции**:
  - fetchWeather(): Получает данные о текущей погоде из OpenWeather API.
  - setupWeatherMessages(bot, chatId): Настраивает уведомления о погоде.

#### **3. messages.js**
- **Назначение**: Обрабатывает запросы на отправку романтических сообщений.
- **Расположение**: modules/messages.js
- **Ключевые функции**:
  - getRandomLoveMessage(): Возвращает случайное романтическое сообщение.

---

## **Описание основных блоков кода**

### **1. bot.js**
Обрабатывает взаимодействие с пользователем и подключает модули.

#### Ключевые секции:
- **Инициализация**:
  
```javascript
  const TelegramBot = require('node-telegram-bot-api');
  const { setupReminders } = require('./modules/reminders');
  const { setupWeatherMessages } = require('./modules/weather');
  const { getRandomLoveMessage } = require('./modules/messages');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const bot = new TelegramBot(token, { polling: true });
```

- **Проверка пользователя**: 
  
```javascript
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "// Например: Какого числа мы познакомились?");
  }); // Небольшой одновопросный квиз, тут можете спросить любой вопрос и вставить в функцию ответ, подробнее описано в коде.
```

- **Подключение модулей**:
  
```javascript
  setupReminders(bot, chatId);
  setupWeatherMessages(bot, chatId);
```

### **2. reminders.js**

#### Пример кода:
```javascript
const cron = require('node-cron');

const reminders = [ // Пример сообщений напоминаний в нужное время, можно напомнить поесть, что то сделать, либо просто признаться в любви, всё зависит от вашего креатива.
  { time: '08:00', message: 'Доброе утро! Чудесного тебе денька!' },
  { time: '20:00', message: 'Уже вечер, не забудь поесть!' }
];

function setupReminders(bot, chatId) {
  reminders.forEach((reminder) => {
    cron.schedule(reminder.time, () => {
      bot.sendMessage(chatId, reminder.message);
    });
  });
}

module.exports = { setupReminders };
```
### **3. weather.js**

#### Пример кода:
```javascript
const axios = require('axios');
const cron = require('node-cron');

const weatherApiKey = 'ваш_api_key'; // Апи ключ с сайте openweathermap
const city = 'Kioto'; // Ваш город

async function fetchWeather() {
  try {
    const response = await axios.get(https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric); // Подключаемся к api погоды 
    const temp = response.data.main.temp;
    const description = response.data.weather[0].description;
    return { temp, description };
  } catch (error) {
    console.error('Ошибка получения данных о погоде:', error); // Логи ошибки
    return null;
  }
}

function setupWeatherMessages(bot, chatId) {
  const times = ['08:00', '20:00']; // Выставляем нужное время, в которое будет отправлено автоматическое сообщение
  times.forEach((time) => {
    cron.schedule(time, async () => {
      const weather = await fetchWeather();
      if (!weather) {
        bot.sendMessage(chatId, 'Не удалось получить данные о погоде, но я всё равно о тебе забочусь! ❤️'); // Сообщение, если ошибка в получении погоды на нужное время
        return; 
      }

      const { temp, description } = weather; // В этом блоке мы выставляем if els функцию определяя индивидуально под человека переносимость погоды, если меньше 0, то рекомендуем одеваться теплее и так далее.
      let advice = 'Одевайся комфортно!';
      if (temp < 0) {
        advice = 'Очень холодно! Оденься теплее и шарф не забудь! ❄️';
      } else if (temp >= 0 && temp <= 10) {
        advice = 'На улице прохладно. Возьми с собой куртку. 🌬️';
      } else if (temp > 10 && temp <= 20) {
        advice = 'Погода приятная, но накинь что-то лёгкое. 🌤️';
      } else {
        advice = 'Тепло! Лёгкая одежда подойдёт. ☀️';
      }

      bot.sendMessage(chatId, Сейчас в городе ${city}: ${temp}°C, ${description}. ${advice})
    })
  })
}

module.exports = { fetchWeather, setupWeatherMessages }
```
**Ключевые функции:**
fetchWeather(): Получает данные о текущей погоде из OpenWeather API.
setupWeatherMessages(bot, chatId): Настраивает уведомления о погоде.
---

## **Лучшие практики**
1. **Безопасность токена**:
   - Храните токен в файле .env. // По желанию, я так не сделал.
2. **Тестирование**:
   - Тестируйте изменения локально перед загрузкой на сервер, мы же не хотим уронить бота у второй половинки?.
3. **Используйте PM2**:
   - Для обеспечения автоматического перезапуска бота в случае сбоя и удобства использования.

---

## **Как загрузить обновления на сервер**
1. Внесите изменения в локальный репозиторий.
2. Зафиксируйте их:
   
```bash
   git add .
   git commit -m "Обновление бота"
```
3. Отправьте изменения в удалённый репозиторий:
   
```bash
   git push origin main
```
4. На сервере выполните:
   
```bash
   cd /root/love-bot
   git pull origin main
   pm2 restart love-bot
```

---

## **Лицензия**
Этот проект распространяется под лицензией MIT. Подробности смотрите в файле LICENSE.