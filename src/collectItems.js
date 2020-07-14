const sm = require('mineflayer-statemachine');
const entityFilters = require('mineflayer-statemachine').EntityFilters;

/**
 * Creates a new nested state machine for collecting nearby dropped items.
 * 
 * @param {Bot} bot - The bot preforming the action.
 * @param {*} settings - Settings and configurations how to preform this action.
 */
function createCollectItemsState(bot, settings = {
    maxDistance: 7
})
{
    const tempTargets = {};

    const findNearbyItems = createFindNearbyItemsState(bot, tempTargets, settings);
    const moveToItem = createMoveToItemState(bot, tempTargets);
    const finished = createFinishedState();

    const transitions = [

        new sm.StateTransition({
            parent: findNearbyItems,
            child: moveToItem,
            shouldTransition: () => tempTargets.item !== undefined,
        }),

        new sm.StateTransition({
            parent: findNearbyItems,
            child: finished,
            shouldTransition: () => tempTargets.item === undefined,
        }),

        new sm.StateTransition({
            parent: moveToItem,
            child: findNearbyItems,
            shouldTransition: () => moveToItem.isFinished,
        }),

    ];

    const nestedStateMachine = new sm.NestedStateMachine(transitions, findNearbyItems);
    nestedStateMachine.stateName = 'Collect Item';
    return nestedStateMachine;
}

function createFindNearbyItemsState(bot, targets, settings)
{
    function itemFilter(entity)
    {
        return entity.position.distanceTo(bot.entity.position) < settings.maxDistance
            && entityFilters().ItemDrops(entity);
    }

    const state = new sm.BehaviorGetClosestEntity(bot, targets, itemFilter);
    state.stateName = 'Find Nearby Item';
    return state;
}

function createMoveToItemState(bot, targets)
{
    const state = new sm.BehaviorFollowEntity(bot, targets);
    state.followDistance = 0;
    state.stateName = 'Move To Item';
    return state;
}

function createFinishedState()
{
    const state = new sm.BehaviorIdle();
    state.stateName = 'Finished Collecting Item';
    return state;
}

module.exports = { createCollectItemsState };