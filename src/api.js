const { Vec3 } = require("vec3");

function load(bot)
{
    bot.gameplay.mineBlockAt = (x, y, z) => mineBlockAt(bot, x, y, z);
}

function mineBlockAt(bot, x, y, z)
{
    bot.gameplay.stopAll();
    bot.gameplay.targets.position = new Vec3(x, y, z);
    bot.gameplay.triggerState('Collect Block');
}

module.exports = { load };