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
 * @class TaskDependencyCheckHandler
 * The TaskDependencyCheckHandler class ensures that all dependencies of a task are completed before
 * the task itself can proceed. It checks whether any dependency of the task is still in progress. If
 * there are dependencies that are not completed, it will return a failure response.
 * If all dependencies are completed, it proceeds to the next handler in the chain.
 */
export class TaskDependencyCheckHandler extends TaskHandler {
  /**
   * Handles the verification that all dependencies of a task are completed. If any dependency
   * is not completed, it returns a failure response. If all dependencies are completed, it proceeds
   * to the next handler in the chain.
   *
   * @param task - The task whose dependencies are being verified.
   * @param workflow - The workflow that the task belongs to.
   * @returns {Promise<TaskResponse>} - A promise that resolves with the task's response, either failure or success.
   */
  async handle(task: Task, workflow: Workflow): Promise<TaskResponse> {
    logger.info(
      `Task ${task.name}(${task.id}) has started ensuring all dependencies are completed.`,
    );

    // Check if any dependency is not completed
    if (
      task.dependencies?.some((dep) => dep.state !== WorkflowState.Completed)
    ) {
      // If any dependency is still in progress, return failure response
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
      `Task ${task.name}(${task.id}) has successfully ensured that all dependencies are completed.`,
    );

    // Proceed to the next handler if all dependencies are completed
    return super.handle(task, workflow);
  }
}
