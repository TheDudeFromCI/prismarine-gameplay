const { buildStateMachine } = require('./src/root');

const ActionTriggers
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
    bot.gameplay.triggerState = triggers.triggerState;
    bot.gameplay.forceExitState = triggers.forceExitState;

    bot.once('spawn', () => bot.gameplay.statemachine = buildStateMachine(bot, triggers));
}

modules.exports = {
    gameplay: inject
};