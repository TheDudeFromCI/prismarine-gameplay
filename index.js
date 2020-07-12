const { buildStateMachine } = require('./src/root');

function inject(bot)
{
    bot.gameplay = {};
    bot.gameplay.targets = {};

    bot.once('spawn', () =>
    {
        bot.gameplay.statemachine = buildStateMachine(bot);
    });
}

modules.exports = {
    gameplay: inject
};