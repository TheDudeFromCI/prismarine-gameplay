import { StrategyBase, StrategyExecutionInstance, Dependency, Callback, Solver, Heuristics } from '../strategy';
import { DependencyResolver } from '../tree';
import { TaskOrGroup } from '../dependencies';

export class StratTaskOrGroup extends StrategyBase
{
    readonly name: string = 'taskOrGroup';

    constructor(solver: Solver)
    {
        super(solver, TaskOrGroupInstance);
    }

    estimateHeuristic(dependency: Dependency): Heuristics | null
    {
        if (dependency.name !== 'taskOrGroup')
            return null;

        const taskOrGroupTask = <TaskOrGroup>dependency;
        
        return {
            time: 0,
            childTasks: taskOrGroupTask.inputs.tasks
        };
    }
}

class TaskOrGroupInstance extends StrategyExecutionInstance
{
    handle(dependency: Dependency, resolver: DependencyResolver, cb: Callback): void
    {
        if (dependency.name !== 'taskOrGroup')
            throw new Error("Unsupported dependency!");

        const taskOrGroupTask = <TaskOrGroup>dependency;

        const tasks = [...taskOrGroupTask.inputs.tasks];

        function handleNext()
        {
            // TODO Estimate cost and get the cheapest
            const task = tasks.pop();

            if (!task)
            {
                cb(new Error("No tasks remaining!"));
                return;
            }

            resolver(task, err => {
                if (err) handleNext();
                else
                {
                    taskOrGroupTask.outputs.passingTask = task;
                    cb();
                }
            })
        }

        handleNext();
    }
}