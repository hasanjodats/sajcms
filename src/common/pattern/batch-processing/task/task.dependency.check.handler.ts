import { TaskError, TaskErrorType } from '@common/error/task.error';
import { logger } from '@common/logger/winston.logger';
import {
  TaskResponseState,
  Task,
  TaskResponse,
} from '@common/pattern/batch-processing/task/task';
import { TaskHandler } from '@common/pattern/batch-processing/task/task.handler';
import {
  Workflow,
  WorkflowState,
} from '@common/pattern/batch-processing/workflow/workflow';

/**
 * The TaskExecutionHandler ensures that all dependencies of a task are successfully executed.
 */
export class TaskDependencyCheckHandler extends TaskHandler {
  async handle(task: Task, workflow: Workflow): Promise<TaskResponse> {
    logger.info(
      `Task ${task.name}(${task.id}) has started ensure all dependencies completed.`,
    );
    if (
      task.dependencies?.some((dep) => dep.state !== WorkflowState.Completed)
    ) {
      return {
        state: TaskResponseState.Failure,
        error: new TaskError(
          task,
          TaskErrorType.NotDependenciesCompleted,
          'One or more dependencies are still in progress.',
        ),
      };
    }
    logger.info(
      `Task ${task.name}(${task.id}) has passed ensure dependencies completed successfully.`,
    );
    return super.handle(task, workflow);
  }
}
