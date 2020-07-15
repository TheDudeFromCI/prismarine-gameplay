const sm = require('mineflayer-statemachine');
const collectBlock = require('./collectBlock');
const collectItems = require('./collectItems');

/**
 * This is the root of the state machine used to control the bot.
 */
function buildStateMachine(bot, triggers, settings)
{
    const idleState = createIdleState();

    const transitions = [];
    loadState(transitions, idleState, triggers, collectItems.createCollectItemsState(bot));
    loadState(transitions, idleState, triggers, collectBlock.createCollectBlockState(bot));

    const nestedStateMachine = new sm.NestedStateMachine(transitions, idleState);
    nestedStateMachine.stateName = 'Root';

    const stateMachine = new sm.BotStateMachine(bot, nestedStateMachine);
    return stateMachine;
}

function createIdleState()
{
    const state = new sm.BehaviorIdle();
    state.stateName = 'Waiting for Command';
    return state;
}

function loadState(transitions, idleState, triggers, state)
{
    const enter = new sm.StateTransition({
        parent: idleState,
        child: state
    });

    const exit = new sm.StateTransition({
        parent: state,
        child: idleState,
        shouldTransition: () => state.isFinished(),
    });

    transitions.push(enter);
    transitions.push(exit);

    triggers.addState({
        name: state.stateName,
        state: state,
        enter: enter,
        exit: exit
    });
}

module.exports = { buildStateMachine };