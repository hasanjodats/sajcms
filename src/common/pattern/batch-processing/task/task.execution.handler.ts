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
 * The TaskExecutionHandler execute task of the workflow.
 */
export class TaskExecutionHandler extends TaskHandler {
  public async handle(task: Task, workflow: Workflow): Promise<TaskResponse> {
    task.events.emit(TaskEvent.Start, task);
    logger.info(`Task ${task.name}(${task.id}) has started execution.`);
    task.startTime = Date.now();

    try {
      task.events.emit(TaskEvent.Progress, task, 0);
      // Perform task execution
      const response = await this.performTaskExecution(task, workflow);

      logger.info(
        `Task ${task.name}(${task.id}) has executed and the response state is ${response.state}.`,
      );
      if (response.state === TaskResponseState.Pending) {
        task.state = TaskState.Waiting;
        workflow.state = WorkflowState.Waiting;
      } else {
        task.state = TaskState.Completed;
        task.response = response;
        task.events.emit(TaskEvent.Complete, task, response);
        task.events.emit(TaskEvent.Progress, task, 100);
      }
      logger.info(`Task ${task.name}(${task.id}) has executed successfully.`);
      return response;
    } catch (error: any) {
      const taskError = new TaskError(
        task,
        TaskErrorType.ExecutionFailed,
        error,
      );
      task.events.emit(TaskEvent.Failure, task, taskError);

      logger.error(
        `Task ${task.name}(${task.id}) execution has failed.`,
        error,
      );
      return {
        state: TaskResponseState.Failure,
        error: taskError,
      };
    } finally {
      const elapsedTime = Date.now() - (task.startTime || 0);
      logger.info(
        `Task ${task.name}(${task.id}) has executed in ${elapsedTime} ms`,
      );
    }
  }

  /**
   * Executes a task with timeout and retry logic.
   * @param workflow The workflow containing the task
   */
  private async performTaskExecution(
    task: Task,
    workflow: Workflow,
  ): Promise<TaskResponse> {
    let action: (task: Task, workflow: Workflow) => Promise<TaskResponse>;
    if (workflow.config?.JIT) {
      action = task.action! as (
        task: Task,
        workflow: Workflow,
      ) => Promise<TaskResponse>;
    } else {
      action = workflow.container?.getAction(task.action as string).execute!;
    }

    // Wrap task action with timeout and retry
    const taskWithTimeout = Utility.withTimeout(
      () => action(task, workflow),
      task.config?.retry?.timeout ?? Infinity,
    );
    const taskWithRetry = Utility.withRetry(
      taskWithTimeout,
      task.config?.retry?.maximumAttempts ?? 1,
      task.config?.retry?.attemptDelay ?? 1000,
    );

    try {
      return await taskWithRetry();
    } catch (error: any) {
      logger.error(`Error executing task ${task.name}(${task.id}):`, error);
      return {
        state: TaskResponseState.Failure,
        error: new TaskError(task, error.message, error),
      };
    }
  }
}
