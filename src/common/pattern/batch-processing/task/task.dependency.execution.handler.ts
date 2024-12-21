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
 * @class TaskDependencyExecutionHandler
 * The TaskDependencyExecutionHandler ensures that all dependencies of a task are executed successfully
 * before the task itself can proceed. If a task has dependencies that are not yet completed, the handler
 * will invoke them and wait for their response before moving on.
 * This handler uses the Chain of Responsibility pattern, allowing it to be linked with other handlers in the task processing pipeline.
 */
export class TaskDependencyExecutionHandler extends TaskHandler {
  /**
   * Handles the execution of task dependencies. This method ensures that all dependencies of the task
   * are successfully completed before the task can proceed. If a dependency fails or is pending, the task
   * will return a response reflecting that state.
   *
   * @param task - The task whose dependencies are being processed.
   * @param workflow - The workflow that the task belongs to.
   * @returns {Promise<TaskResponse>} - A promise that resolves with the task's response, either success, failure, or pending.
   */
  public async handle(task: Task, workflow: Workflow): Promise<TaskResponse> {
    logger.info(
      `Task ${task.name}(${task.id}) has started executing dependencies.`,
    );
    const invoker = new WorkflowInvoker(); // Invoker to handle the execution of task dependencies

    try {
      // Check if the task has any dependencies and execute them
      if (task.dependencies && task.dependencies.length > 0) {
        for (const dependency of task.dependencies) {
          // If the dependency is not yet completed, execute it
          if (dependency.state !== WorkflowState.Completed) {
            logger.info(
              `Task ${task.name}(${task.id}) is executing dependency ${dependency.name}(${dependency.id}).`,
            );
            const response = await invoker.run(dependency); // Execute the dependency
            logger.info(
              `Task ${task.name}(${task.id}) executed dependency ${dependency.name}(${dependency.id}) with response state: ${response.state}.`,
            );

            // Handle the response state of the dependency execution
            if (response.state === WorkflowResponseState.Pending) {
              return {
                state: TaskResponseState.Pending, // Return pending if the dependency is pending
              };
            } else if (response.state === WorkflowResponseState.Failure) {
              return {
                state: TaskResponseState.Failure, // Return failure if the dependency execution failed
                error: response.error,
              };
            }
          }
        }
      }

      // Log and return success if all dependencies are executed successfully
      logger.info(
        `Task ${task.name}(${task.id}) has executed all dependencies successfully.`,
      );
      return super.handle(task, workflow); // Proceed to the next handler in the chain
    } catch (error: any) {
      // Handle any errors that occurred during dependency execution
      const taskError = new TaskError(
        task,
        TaskErrorType.DependencyExecutionFailed,
        `Task ${task.name}(${task.id}) dependency execution failed: ${error.message}`,
        error,
      );
      logger.error(
        `Task ${task.name}(${task.id}) dependency execution failed:`,
        error,
      );

      // Return failure response with error details
      return {
        state: TaskResponseState.Failure,
        error: taskError,
      };
    }
  }
}
