const sm = require('mineflayer-statemachine');
const { createCollectItemsState } = require('./collectItems');
const { BehaviorWaitForEntitySpawn } = require('./behaviorWaitForEntitySpawn');

/**
 * Creates a new nested state machine for collecting a given block.
 * 
 * @param {Bot} bot - The bot preforming the action.
 * @param {*} settings - Settings and configurations how to preform this action.
 */
function createCollectBlockState(bot, settings = {})
{
    const itemSpawnTargets = {};

    const tryCollectBlock = createTryCollectBlockState();
    const moveToBlock = createMoveToBlockState(bot);
    const mineBlock = createMineBlockState(bot);
    const waitForItemSpawn = createWaitForItemSpawnState(bot, itemSpawnTargets);
    const collectItems = createCollectItemsState(bot, itemSpawnTargets);
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
            child: waitForItemSpawn,
            shouldTransition: () => mineBlock.isFinished,
        }),

        new sm.StateTransition({
            parent: waitForItemSpawn,
            child: collectItems,
            shouldTransition: () => waitForItemSpawn.isFinished(),
        }),

        new sm.StateTransition({
            parent: collectItems,
            child: finished,
            shouldTransition: () => collectItems.isFinished(),
        }),

    ];

    const nestedStateMachine = new sm.NestedStateMachine(transitions, tryCollectBlock, finished);
    nestedStateMachine.stateName = 'Collect Block';
    return nestedStateMachine;
}

function createWaitForItemSpawnState(bot, targets)
{
    const state = new BehaviorWaitForEntitySpawn(bot, targets, (entity) =>
    {
        return sm.EntityFilters().ItemDrops(entity)
            && entity.position.distanceTo(bot.gameplay.targets.position) <= 5;
    }, 20);

    state.stateName = 'Wait For Item Drop';
    return state;
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
    state.distance = 2;
    return state;
}

function createMineBlockState(bot)
{
    const state = new sm.BehaviorMineBlock(bot, bot.gameplay.targets);
    state.stateName = 'Mine Block';
    return state;
}

function createFinishedState()
{
    const state = new sm.BehaviorIdle();
    state.stateName = 'Finished Collecting Block';
    return state;
}

module.exports = { createCollectBlockState }