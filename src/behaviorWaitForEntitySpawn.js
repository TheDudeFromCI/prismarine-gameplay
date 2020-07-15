class BehaviorWaitForEntitySpawn
{
    constructor(bot, targets, filter, timeout = 40)
    {
        this.stateName = 'waitForEntitySpawn';
        this.active = false;
        this.finished = false;
        this.timeout = timeout;

        bot.on('entitySpawn', (entity) =>
        {
            if (!this.active)
                return;
            
            if (filter(entity))
            {
                this.finished = true;
                targets.entity = entity;
            }
        });
    }

    onStateEntered()
    {
        this.finished = false;
        this.ticksLeft = this.timeout;
    }

    update()
    {
        this.ticksLeft--;
        if (this.ticksLeft <= 0)
            this.finished = true;
    }

    onStateExited()
    {
        this.finished = true;
    }

    isFinished()
    {
        if (!this.active)
            return true;

        return this.finished;
    }
}

module.exports = { BehaviorWaitForEntitySpawn }