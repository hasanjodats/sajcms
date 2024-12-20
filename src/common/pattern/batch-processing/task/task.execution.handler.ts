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
import { ActionPlugin } from '@common/pattern/plugin/action.plugin';

/**
 * The TaskExecutionHandler execute task of the workflow.
 */
export class TaskExecutionHandler extends TaskHandler {
  public async executePlugin(
    plugin: ActionPlugin,
    task: Task,
    workflow: Workflow,
  ): Promise<TaskResponse> {
    return await plugin.execute(task, workflow, task.payload);
  }

  public async handle(task: Task, workflow: Workflow): Promise<TaskResponse> {
    task.events.emit(TaskEvent.Start, task);
    logger.info(`Task ${task.name}(${task.id}) has started execution.`);
    task.startTime = Date.now();

    try {
      task.events.emit(TaskEvent.Progress, task, 0);
      let response: TaskResponse;

      if (workflow.config?.JIT) {
        // Perform task execution
        response = await this.performTaskExecution(task, workflow);
      } else {
        response = await this.executePlugin(
          workflow.container?.providers.get(task.plugin!)!,
          task,
          workflow,
        );
      }

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
   * Executes a task within a workflow, handling dependencies and retries.
   * @param workflow The workflow containing the task
   */

  /**
   * Executes a task with timeout and retry logic.
   * @param workflow The workflow containing the task
   */
  private async performTaskExecution(
    task: Task,
    workflow: Workflow,
  ): Promise<TaskResponse> {
    // Wrap task action with timeout and retry
    const taskWithTimeout = Utility.withTimeout(
      () => task.action!(task, workflow),
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
