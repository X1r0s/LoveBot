Вот обновлённый `README.md` с подробной инструкцией об **автообновлении на сервере**.

Формат сохранён, добавлена информация:

- 🔄 **Как работает автоматическое обновление через GitHub Actions**
- 🖥️ **Как вручную обновить бота на сервере**
- 🚀 **Как настроить SSH-ключ для GitHub**
- ✅ **Полный гайд по автообновлению через `update-bot.sh`**

---

### **Обновлённый `README.md`**

````markdown
# 💖 Love Bot — Телеграм-бот с напоминаниями и романтикой

## **Введение** 💕

Добро пожаловать в документацию к **Love Bot**!

**Love Bot** — это персональный Telegram-бот, который отправляет:

- 💌 **Романтические напоминания**
- 🌤️ **Информацию о погоде с рекомендациями по одежде**
- 🔔 **Напоминания о важных событиях**
- 🎀 **Случайные милые фразы**

Автообновление бота настроено через **GitHub Actions и SSH**.  
Бот работает на **Node.js**, управляется через **PM2**, а напоминания создаются с помощью **cron**.

---

## **📌 Используемые технологии**

- **Node.js** — среда выполнения для JavaScript
- **Telegram Bot API** — взаимодействие с пользователями
- **node-cron** — планирование задач
- **axios** — работа с API погоды
- **PM2** — управление ботом

---

# 🛠️ Установка и запуск

## **1. Установка на локальной машине**

1. **Клонируйте репозиторий:**
   ```bash
   git clone git@github.com:yourusername/yourrepo.git
   ```
````

2. **Перейдите в папку с проектом:**
   ```bash
   cd love-bot
   ```
3. **Установите зависимости:**
   ```bash
   npm install
   ```
4. **Создайте `.env` (если используется API-ключ погоды и Telegram-токен):**
   ```env
   TELEGRAM_BOT_TOKEN=<ваш_токен>
   WEATHER_API_KEY=<ваш_ключ_OpenWeatherMap>
   ```
5. **Запустите бота:**
   ```bash
   node bot.js
   ```

---

# 📡 **Деплой на сервер**

## **2. Подключение к серверу**

1. **Подключаемся по SSH:**
   ```bash
   ssh root@your_server_ip
   ```
2. **Убеждаемся, что установлен Git и Node.js:**
   ```bash
   git --version
   node -v
   ```
   Если Git или Node.js не установлен:
   ```bash
   sudo apt update && sudo apt install git nodejs -y
   ```

---

## **3. Развёртывание бота**

1. **Клонируем репозиторий:**
   ```bash
   cd /root/
   git clone git@github.com:yourusername/yourrepo.git love-bot
   cd love-bot
   ```
2. **Устанавливаем зависимости:**
   ```bash
   npm install
   ```
3. **Запускаем бота через PM2:**
   ```bash
   pm2 start bot.js --name love-bot
   ```
4. **Настраиваем автозапуск PM2:**
   ```bash
   pm2 save
   pm2 startup
   ```

---

# 🔄 **Автоматическое обновление бота**

## **4. Настройка SSH-ключа для GitHub**

Чтобы сервер мог обновлять код без пароля:

1. **Создаём SSH-ключ на сервере:**

   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```

   Нажмите `Enter`, когда спросит путь (`~/.ssh/id_rsa`).

2. **Смотрим ключ:**

   ```bash
   cat ~/.ssh/id_rsa.pub
   ```

   Скопируйте его.

3. **Добавляем ключ в GitHub:**  
   Перейдите в **GitHub → Settings → SSH and GPG keys → New SSH Key**  
   Вставьте ключ и нажмите **"Add key"**.

4. **Проверяем подключение:**
   ```bash
   ssh -T git@github.com
   ```
   Если всё правильно:
   ```
   Hi yourusername! You've successfully authenticated, but GitHub does not provide shell access.
   ```

---

## **5. Создание скрипта автообновления**

Чтобы не вводить вручную `git pull`, `npm install` и `pm2 restart`, создаём **скрипт автообновления**.

1. **Создаём скрипт:**
   ```bash
   nano /root/update-bot.sh
   ```
2. **Вставляем код:**
   ```bash
   #!/bin/bash
   cd /root/love-bot
   echo "📥 Получаю последнюю версию бота..."
   git pull origin main
   echo "🔄 Устанавливаю зависимости..."
   npm install
   echo "🚀 Перезапускаю бота..."
   pm2 restart love-bot
   echo "✅ Бот успешно обновлён!"
   ```
3. **Сохраняем и делаем исполняемым:**
   ```bash
   chmod +x /root/update-bot.sh
   ```

Теперь для обновления бота достаточно одной команды:

```bash
/root/update-bot.sh
```

---

## **6. Автообновление через GitHub Actions**

Теперь **GitHub будет автоматически обновлять бота** после каждого пуша.

1. **Создаём папку в проекте:**
   ```
   .github/workflows/
   ```
2. **Добавляем файл `.github/workflows/deploy.yml`:**

   ```yaml
   name: Deploy Bot

   on:
     push:
       branches:
         - main

   jobs:
     deploy:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout repository
           uses: actions/checkout@v2

         - name: Deploy to Server via SSH
           uses: appleboy/ssh-action@v0.1.5
           with:
             host: ${{ secrets.SERVER_IP }}
             username: ${{ secrets.SERVER_USER }}
             key: ${{ secrets.SSH_PRIVATE_KEY }}
             script: |
               /root/update-bot.sh
   ```

3. **Добавляем секретные переменные в GitHub:**  
   Перейдите в **Settings → Secrets and variables → Actions**  
   Добавьте:
   - **SERVER_IP** → IP-адрес сервера
   - **SERVER_USER** → `root`
   - **SSH_PRIVATE_KEY** → Приватный ключ `~/.ssh/id_rsa`

---

# ✅ **Команды управления ботом**

- **Перезапустить бота:**
  ```bash
  pm2 restart love-bot
  ```
- **Остановить бота:**
  ```bash
  pm2 stop love-bot
  ```
- **Удалить бота из PM2:**
  ```bash
  pm2 delete love-bot
  ```
- **Посмотреть статус:**
  ```bash
  pm2 list
  ```
- **Посмотреть логи:**
  ```bash
  pm2 logs love-bot
  ```

---

# 🔧 **Полезные команды**

- **Проверить, что бот работает:**
  ```bash
  curl -s http://localhost:3000 || echo "Бот не отвечает"
  ```
- **Изменить часовой пояс (если нужно):**
  ```bash
  sudo timedatectl set-timezone Europe/Moscow
  ```
