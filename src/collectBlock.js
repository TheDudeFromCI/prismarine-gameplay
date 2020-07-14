const sm = require('mineflayer-statemachine');
const { createCollectItemsState } = require('./collectItems');

/**
 * Creates a new nested state machine for collecting a given block.
 * 
 * @param {Bot} bot - The bot preforming the action.
 * @param {*} settings - Settings and configurations how to preform this action.
 */
function createCollectBlockState(bot, settings = {})
{
    const tryCollectBlock = createTryCollectBlockState();
    const moveToBlock = createMoveToBlockState(bot);
    const mineBlock = createMineBlockState(bot);
    const collectItems = createCollectItemsState(bot);
    const finished = createFinishedState();

    const transitions = [

        new sm.StateTransition({
            parent: tryCollectBlock,
            child: moveToBlock,
            shouldTransition: () => true,
        }),

        new sm.StateTransition({
            parent: moveToBlock,
            child: mineBlock,
            shouldTransition: () => moveToBlock.isFinished(),
        }),

        new sm.StateTransition({
            parent: mineBlock,
            child: collectItems,
            shouldTransition: () => mineBlock.isFinished,
        }),

        new sm.StateTransition({
            parent: collectItems,
            child: finished,
            shouldTransition: () => collectItems.isFinished(),
        }),

    ];

    const nestedStateMachine = new sm.NestedStateMachine(transitions, tryCollectBlock);
    nestedStateMachine.stateName = 'Collect Block';
    return nestedStateMachine;
}

function createTryCollectBlockState()
{
    const state = new sm.BehaviorIdle();
    state.stateName = 'Try Collect Block';
    return state;
}

function createMoveToBlockState(bot)
{
    const state = new sm.BehaviorMoveTo(bot, bot.gameplay.targets);
    state.stateName = 'Move To Block';
    return state;
}

function createMineBlockState(bot)
{
    const state = new sm.BehaviorMineBlock(bot, bot.gameplay.targets);
    state.stateName = 'Mine Block';
    return state;
}

function createCollectItemsState(bot)
{
    const state = createCollectItemsState(bot);
    state.stateName = 'Collect Dropped Item';
    return state;
}

function createFinishedState()
{
    const state = new sm.BehaviorIdle();
    state.stateName = 'Finished Collecting Block';
    return state;
}

module.exports = { createCollectBlockState }