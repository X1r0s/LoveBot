const loveMessages = [ // A list of messages from which a random one is sent after clicking a button, get creative! 
    `I love you!`,
    `Я тебя люблю!`,
    `ТJe t'aime!`,
    `Ich liebe dich!`,
    `我爱你!`,
    `ฉันรักคุณ!`,
    `Aš tave myliu!`,
]

function getRandomLoveMessage() {  // Random sending function
    return loveMessages[Math.floor(Math.random() * loveMessages.length)];
}

module.exports = { getRandomLoveMessage } // Export function to main file