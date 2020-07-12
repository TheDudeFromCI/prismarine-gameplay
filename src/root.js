const sm = require('mineflayer-statemachine');

/**
 * This is the root of the state machine used to control the bot.
 */
function buildStateMachine(bot)
{
    const idleState = createIdleState();

    const transitions = [

    ];

    const nestedStateMachine = new sm.NestedStateMachine(transitions, idleState);
    nestedStateMachine.stateName = 'Root';

    const stateMachine = new sm.BotStateMachine(bot, nestedStateMachine);
    return stateMachine;
}

/**
 * Creates a standard idle state.
 */
function createIdleState()
{
    const state = new sm.BehaviorIdle();
    state.stateName = 'Waiting for Command';
    return state;
}

module.exports = { buildStateMachine };