import {
  TaskResponseState,
  Task,
  TaskResponse,
  TaskState,
} from '@common/pattern/batch-processing/task/task';
import { TaskHandler } from '@common/pattern/batch-processing/task/task.handler';
import {
  Workflow,
  WorkflowState,
} from '@common/pattern/batch-processing/workflow/workflow';
import { Utility } from '@common/helper/function.util';
import { logger } from '@common/logger/winston.logger';
import { TaskError, TaskErrorType } from '@common/error/task.error';
import { TaskEvent } from '@common/pattern/batch-processing/task/task.event-emitter';

/**
 * @class TaskExecutionHandler
 * The TaskExecutionHandler class is responsible for executing tasks in a workflow. It manages the
 * execution of the task, handles errors, updates task states, and emits relevant events during
 * the task's lifecycle (start, progress, failure, complete).
 */
export class TaskExecutionHandler extends TaskHandler {
  /**
   * This is the main handler method which executes the task and emits events accordingly.
   * @param task - The task to be executed.
   * @param workflow - The workflow containing the task.
   * @returns {Promise<TaskResponse>} - A promise that resolves with the task's execution response.
   */
  public async handle(task: Task, workflow: Workflow): Promise<TaskResponse> {
    task.events.emit(TaskEvent.Start, task); // Emit task start event
    logger.info(`Task ${task.name}(${task.id}) has started execution.`);
    task.startTime = Date.now(); // Capture the start time of the task

    try {
      task.events.emit(TaskEvent.Progress, task, 0); // Emit progress event at 0%
      // Perform task execution
      const response = await this.performTaskExecution(task, workflow);

      logger.info(
        `Task ${task.name}(${task.id}) has executed and the response state is ${response.state}.`,
      );

      // Handling task states based on execution response
      if (response.state === TaskResponseState.Pending) {
        task.state = TaskState.Waiting;
        workflow.state = WorkflowState.Waiting; // Mark workflow as waiting if task is pending
      } else {
        task.state = TaskState.Completed; // Mark task as completed
        task.response = response;
        task.events.emit(TaskEvent.Complete, task, response); // Emit task complete event
        task.events.emit(TaskEvent.Progress, task, 100); // Emit progress event at 100%
      }

      logger.info(`Task ${task.name}(${task.id}) has executed successfully.`);
      return response;
    } catch (error: any) {
      const errorMessage = error?.message ?? 'Unknown error';
      // Handling execution failure
      const taskError = new TaskError(
        task,
        TaskErrorType.ExecutionFailed,
        errorMessage,
      );
      task.events.emit(TaskEvent.Failure, task, taskError); // Emit failure event

      logger.error(
        `Task ${task.name}(${task.id}) execution has failed.`,
        errorMessage,
      );
      return {
        state: TaskResponseState.Failure,
        error: taskError,
      };
    } finally {
      // Log the time taken for task execution
      const elapsedTime = Date.now() - (task.startTime || 0);
      logger.info(
        `Task ${task.name}(${task.id}) has executed in ${elapsedTime} ms`,
      );
    }
  }

  /**
   * Executes the task with retry and timeout logic. If the task execution fails, it retries the execution
   * according to the configured retry attempts and delay.
   * @param task - The task to be executed.
   * @param workflow - The workflow containing the task.
   * @returns {Promise<TaskResponse>} - A promise that resolves with the task's execution response.
   */
  private async performTaskExecution(
    task: Task,
    workflow: Workflow,
  ): Promise<TaskResponse> {
    let action: (task: Task, workflow: Workflow) => Promise<TaskResponse>;

    // If Just-In-Time (JIT) execution is enabled in workflow config, use the task's action
    if (workflow.config?.JIT) {
      action = task.action! as (
        task: Task,
        workflow: Workflow,
      ) => Promise<TaskResponse>;
    } else {
      // Otherwise, fetch the action from the container
      action = workflow.container?.getAction(task.action as string).execute!;
    }

    // Wrap task action with timeout and retry
    const taskWithTimeout = Utility.withTimeout(
      () => action(task, workflow),
      task.config?.retry?.timeout ?? Infinity, // Default timeout is Infinity
    );
    const taskWithRetry = Utility.withRetry(
      taskWithTimeout,
      task.config?.retry?.maximumAttempts ?? 1, // Default maximum retry attempts
      task.config?.retry?.attemptDelay ?? 1000, // Default retry delay (1 second)
    );

    try {
      return await taskWithRetry(); // Execute the task with retry and timeout
    } catch (error: any) {
      const errorMessage = error?.message ?? 'Unknown error';
      // Log and return error if task execution fails
      logger.error(
        `Error executing task ${task.name}(${task.id}):`,
        errorMessage,
      );
      return {
        state: TaskResponseState.Failure,
        error: new TaskError(task, errorMessage, error),
      };
    }
  }
}
