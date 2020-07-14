const mineflayer = require('mineflayer');
const gameplay = require('./..');

if (process.argv.length < 4 || process.argv.length > 6)
{
    console.log('Usage : node mineBot.js <host> <port> [<name>] [<password>]');
    process.exit(1);
}

const bot = mineflayer.createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    username: process.argv[4] ? process.argv[4] : 'Player',
    password: process.argv[5]
});

bot.loadPlugin(gameplay);

bot.on('chat', (username, message) =>
{
    if (username === bot.username) return;
    switch (message)
    {
        case 'dig':
            bot.gameplay.triggers.position = bot.entity.position.offset(1, 0, 0);
            bot.gameplay.triggerState('Collect Block');
            sayItems();
            break;

        case 'stop':
            dig();
            break;
    }
})
