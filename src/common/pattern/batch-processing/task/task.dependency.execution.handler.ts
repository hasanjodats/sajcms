import {
  Workflow,
  WorkflowResponseState,
  WorkflowState,
} from '@common/pattern/batch-processing/workflow/workflow';
import { WorkflowInvoker } from '@common/pattern/batch-processing/workflow/workflow.invoker';
import { TaskHandler } from '@common/pattern/batch-processing/task/task.handler';
import {
  Task,
  TaskResponse,
  TaskResponseState,
} from '@common/pattern/batch-processing/task/task';
import { TaskError, TaskErrorType } from '@common/error/task.error';
import { logger } from '@common/logger/winston.logger';

/**
 * The TaskDependencyExecutionHandler ensures that all dependencies of a task are successfully
 * executed before moving forward. It uses the Chain of Responsibility pattern, allowing seamless integration
 * with other task handlers
 */
export class TaskDependencyExecutionHandler extends TaskHandler {
  public async handle(task: Task, workflow: Workflow): Promise<TaskResponse> {
    logger.info(
      `Task ${task.name}(${task.id}) has started execute dependency.`,
    );
    const invoker = new WorkflowInvoker();

    try {
      /** Execute dependencies */
      if (task.dependencies && task.dependencies.length > 0) {
        for (const dependency of task.dependencies) {
          if (dependency.state !== WorkflowState.Completed) {
            logger.info(
              `Task ${task.name}(${task.id}) has started execute dependency ${dependency.name}(${dependency.id}).`,
            );
            const response = await invoker.run(dependency);
            logger.info(
              `Task ${task.name}(${task.id}) has executed dependency ${dependency.name}(${dependency.id}) and the response state is ${response.state}.`,
            );
            if (response.state === WorkflowResponseState.Pending) {
              return {
                state: TaskResponseState.Pending,
              };
            } else if (response.state === WorkflowResponseState.Failure) {
              return {
                state: TaskResponseState.Failure,
                error: response.error,
              };
            }
          }
        }
      }

      logger.info(
        `Task ${task.name}(${task.id}) has executed all dependencies successfully.`,
      );
      return super.handle(task, workflow);
    } catch (error: any) {
      const taskError = new TaskError(
        task,
        TaskErrorType.DependencyExecutionFailed,
        `Task ${task.name}(${task.id}) dependencies execution has failed: ${error.message}`,
        error,
      );
      logger.error(
        `Task ${task.name}(${task.id}) dependencies execution has failed:`,
        error,
      );
      return {
        state: TaskResponseState.Failure,
        error: taskError,
      };
    }
  }
}
