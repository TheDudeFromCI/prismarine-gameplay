const { buildStateMachine } = require('./src/root');
const sm = require('mineflayer-statemachine');
const api = require('./src/api');

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

    stopAll()
    {
        for (const state of this.states)
        {
            if (state.state.active)
                state.exit.trigger();
        }
    }
}

function inject(bot)
{
    bot.gameplay = {};
    bot.gameplay.targets = {};
    bot.gameplay.statemachine = emptyStateMachine(bot);
    bot.gameplay.configure = (settings = {}) => configure(bot, settings);
    api.load(bot);
}

function emptyStateMachine(bot)
{
    const idleState = new sm.BehaviorIdle();
    idleState.stateName = 'Waiting for Command';

    const transitions = [];

    const nestedStateMachine = new sm.NestedStateMachine(transitions, idleState);
    nestedStateMachine.stateName = 'Root';

    const stateMachine = new sm.BotStateMachine(bot, nestedStateMachine);
    return stateMachine;
}

function defaultSettings(settings)
{
    if (settings.webserver === undefined)settings.webserver = false;
}

function configure(bot, settings)
{
    const triggers = new ActionTriggers();
    bot.gameplay.triggerState = (name) => triggers.triggerState(name);
    bot.gameplay.forceExitState = (name) => triggers.forceExitState(name);
    bot.gameplay.stopAll = () => triggers.stopAll();

    defaultSettings(settings);
    bot.gameplay.statemachine = buildStateMachine(bot, triggers, settings);

    if (settings.webserver)
    {
        const webserver = new sm.StateMachineWebserver(bot, bot.gameplay.statemachine);
        webserver.startServer();
    }
}

module.exports = { gameplay: inject };