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
 * The TaskValidationHandler class ensures that taaks must have both an id and a name. If these properties
 * are missing, it returns an error with the TaskErrorType.ValidationFailed type. If the validation passes, it
 * allows the taks to proceed to the next handler in the chain.
 */
export class TaskValidationHandler extends TaskHandler {
  async handle(task: Task, workflow: Workflow): Promise<TaskResponse> {
    logger.info(`Task ${task.name}(${task.id}) validation has started.`);
    if (!task.name || !task.id) {
      logger.info(`Task ${task.name}(${task.id}) validation has failed.`);
      return {
        state: TaskResponseState.Failure,
        error: new TaskError(
          task,
          TaskErrorType.ValidationFailed,
          `Task ${task.name}(${task.id}) must have a valid ID and Name.`,
        ),
      };
    }

    if (
      workflow.config?.JIT &&
      (!task.action || typeof task.action !== 'function')
    ) {
      logger.error(`Task ${task.name}: Invalid action provided.`);
      return {
        state: TaskResponseState.Failure,
        error: new TaskError(
          task,
          TaskErrorType.ValidationFailed,
          `Task ${task.name}: Invalid action provided.`,
        ),
      };
    }

    if (!workflow.config?.JIT && !task.plugin) {
      logger.error(`Task ${task.name}: Invalid plugin provided.`);
      return {
        state: TaskResponseState.Failure,
        error: new TaskError(
          task,
          TaskErrorType.ValidationFailed,
          `Task ${task.name}: Invalid plugin provided.`,
        ),
      };
    }

    logger.info(`Task ${task.name}(${task.id}) has passed validation.`);
    return super.handle(task, workflow);
  }
}
