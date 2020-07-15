const { buildStateMachine } = require('./src/root');
const { StateMachineWebserver } = require('mineflayer-statemachine');

class ActionTriggers
{
    constructor()
    {
        this.states = [];
    }
    
    addState(state)
    {
        this.states.push(state);
    }
    
    triggerState(name)
    {
        for (const state of this.states)
        {
            if (state.name === name)
            {
                if (!state.state.active)
                    state.enter.trigger();
                
                return;
            }
        }
    }

    forceExitState(name)
    {
        for (const state of this.states)
        {
            if (state.name === name)
            {
                if (state.state.active)
                    state.exit.trigger();
                
                return;
            }
        }
    }
}

function inject(bot)
{
    bot.gameplay = {};
    bot.gameplay.targets = {};
    
    const triggers = new ActionTriggers();
    bot.gameplay.triggerState = (name) => triggers.triggerState(name);
    bot.gameplay.forceExitState = (name) => triggers.forceExitState(name);

    bot.once('spawn', () =>
    {
        bot.gameplay.statemachine = buildStateMachine(bot, triggers);

        const webserver = new StateMachineWebserver(bot, bot.gameplay.statemachine);
        webserver.startServer();
    });
}

module.exports = {
    gameplay: inject
};