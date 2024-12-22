import { Task, TaskResponse } from '@common/pattern/batch-processing/task/task';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';

/**
 * The Action interface defines a structure for tasks that can be executed within a defered workflow.
 *
 * Each Action represents a unit of work in the workflow processing pipeline. Actions
 * are executed on a Task and should produce a TaskResponse indicating the result.
 * Actions may also have an optional `configure` method to initialize or set configuration
 * before execution.
 */
export interface Action {
  /**
   * The name of the action. This is used to uniquely identify the action within a container.
   */
  name: string;

  /**
   * Executes the task of workflow.
   *
   * This method should perform the necessary logic for the action and return a
   * TaskResponse indicating the result of the execution. The execution is asynchronous.
   *
   * @param task - The task to be executed action.
   * @param workflow - The workflow that the task is a part of.
   * @returns A promise that resolves to the TaskResponse of the task.
   */
  execute: (task: Task, workflow: Workflow) => Promise<TaskResponse>;

  /**
   * Optional method to configure the action before execution.
   *
   * If provided, this method will be called to configure the action with the given
   * configuration settings. This method can return either a void or a promise that resolves
   * once the configuration is complete.
   *
   * @param config - The configuration settings to apply to the action.
   */
  configure?: (config: unknown) => Promise<void> | void;
}
