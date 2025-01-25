const loveMessages = [ // Список сообщений из которых рандомное отправляется после нажатия на кнопку, креативьте! 
    `I love you!`,
    `Я тебя люблю!`,
    `ТJe t'aime!`,
    `Ich liebe dich!`,
    `我爱你!`,
    `ฉันรักคุณ!`,
    `Aš tave myliu!`,
]

function getRandomLoveMessage() {  // Функция рандомной отправки
    return loveMessages[Math.floor(Math.random() * loveMessages.length)];
}

module.exports = { getRandomLoveMessage } // Экспорт функции в основной файл