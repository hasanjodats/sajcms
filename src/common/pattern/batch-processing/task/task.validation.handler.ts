import { TaskError, TaskErrorType } from '@common/error/task.error';
import { logger } from '@common/logger/winston.logger';
import {
  TaskResponseState,
  Task,
  TaskResponse,
} from '@common/pattern/batch-processing/task/task';
import { TaskHandler } from '@common/pattern/batch-processing/task/task.handler';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';

/**
 * @class TaskValidationHandler
 * The TaskValidationHandler class ensures that tasks have both a valid id and a name.
 * If either of these properties is missing, the handler returns a validation failure.
 * If the validation passes, the task proceeds to the next handler in the chain.
 */
export class TaskValidationHandler extends TaskHandler {
  /**
   * Handles the task validation logic. This method checks if the task has a valid `id` and `name`.
   * If either property is missing, it logs the failure and returns a TaskResponse with a failure state.
   * If validation passes, the method calls the next handler in the chain.
   *
   * @param task - The task that is being validated.
   * @param workflow - The workflow in which the task is included.
   * @returns {Promise<TaskResponse>} - The result of the validation, either success or failure.
   */
  async handle(task: Task, workflow: Workflow): Promise<TaskResponse> {
    logger.info(`Task ${task.name}(${task.id}) validation has started.`);

    // Check if the task has both a valid name and id
    if (!task.name || !task.id) {
      logger.info(`Task ${task.name}(${task.id}) validation has failed.`);

      // Return a failure response with a validation error
      return {
        state: TaskResponseState.Failure,
        error: new TaskError(
          task,
          TaskErrorType.ValidationFailed,
          `Task ${task.name}(${task.id}) must have a valid ID and Name.`,
        ),
      };
    }

    logger.info(`Task ${task.name}(${task.id}) has passed validation.`);

    // If validation passes, pass the task to the next handler in the chain
    return super.handle(task, workflow);
  }
}
