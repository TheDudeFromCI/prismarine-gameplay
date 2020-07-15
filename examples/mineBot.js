const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const gameplay = require('./..').gameplay;
const sm = require('mineflayer-statemachine');

if (process.argv.length < 4 || process.argv.length > 6)
{
    console.log('Usage : node mineBot.js <host> <port> [<name>] [<password>]');
    process.exit(1);
}

const bot = mineflayer.createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    username: process.argv[4] ? process.argv[4] : 'mineBot',
    password: process.argv[5]
});

bot.loadPlugin(pathfinder)
bot.loadPlugin(gameplay);
sm.globalSettings.debugMode = true;

bot.once('spawn', () => bot.gameplay.configure({
    webserver: true,
}));

bot.on('chat', (username, message) =>
{
    if (username === bot.username) return;

    const command = message.split(' ')
    const pos = bot.players[username] ? bot.players[username].entity.position : null;

    switch (true)
    {
        case /^dig \d+ \d+ \d+$/.test(message):
            bot.gameplay.mineBlockAt(command[1], command[2], command[3]);
            break;

        case /^dig here$/.test(message):
            if (pos)
                bot.gameplay.mineBlockAt(pos.x, pos.y - 1, pos.z);
            else
                bot.chat("I can't see you.");
            break;

        case 'stop':
            bot.gameplay.stopAll();
            break;
    }
})
