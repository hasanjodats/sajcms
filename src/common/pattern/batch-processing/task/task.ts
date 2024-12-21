import _, { uniqueId } from 'lodash';
import { GeneralError } from '@common/error/general.error';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';
import { RetryOption } from '@common/pattern/batch-processing/common/common';
import { TaskEventEmitter } from '@common/pattern/batch-processing/task/task.event-emitter';
import { logger } from '@common/logger/winston.logger';
import {
  validateTaskCircularDependency,
  validateTaskPayload,
} from '@common/pattern/batch-processing/helper/validation.helper';

/**
 * @enum TaskState
 * Represents the possible states of a task during its lifecycle.
 */
export enum TaskState {
  InProgress = 'INPROGRESS', // The task is currently in progress
  Waiting = 'WAITING', // The task is waiting to be executed
  Completed = 'COMPLETED', // The task has been completed successfully
}

/**
 * @enum TaskResponseState
 * Represents the possible states of a task response after execution.
 */
export enum TaskResponseState {
  Pending = 'PENDING', // The task is pending execution
  Failure = 'FAILURE', // The task execution has failed
  Success = 'SUCCESS', // The task has completed successfully
}

/**
 * @interface TaskConfig
 * Represents the configuration settings for a task, including retry options and execution details.
 */
export type TaskConfig = {
  /** Retry options for handling task retries in case of failure */
  retry?: RetryOption;
  /** Execution details for the task, including progress and last execution time */
  execution?: {
    /** The current progress of the task (Default is 0) */
    state?: {
      progress?: number;
      lastExecutedTime?: number;
    };
    /** Delay time between task executions (Default is 1000 ms) */
    delay?: number;
  };
};

/**
 * Default configuration settings for a task.
 */
export const DEFAULT_TASK_CONFIG: TaskConfig = {
  retry: { maximumAttempts: 1, attemptDelay: 1000, timeout: Infinity },
  execution: { delay: 1000, state: { progress: 0, lastExecutedTime: 0 } },
};

/**
 * @interface TaskMetadata
 * Represents metadata about the task, such as requester information and additional info.
 */
export type TaskMetadata = {
  /** Information about the caller requesting the task */
  caller?: {
    name: string; // Name of the requester
    address: string; // Address or endpoint of the requester
  };
  additionalInfo?: { [key: string]: any }; // Any other additional information about the task
};

/**
 * Default metadata for a task, used when no custom metadata is provided.
 */
export const DEFAULT_TASK_METADATA: TaskMetadata = {
  caller: {
    name: 'Unknown',
    address: 'Unknown',
  },
};

/**
 * @interface TaskResponse
 * Represents the result of executing a task, including the state, result, and any errors.
 */
export type TaskResponse = {
  state: TaskResponseState; // The state of the task response (e.g., success, failure)
  result?: any; // The result of the task execution (if any)
  error?: GeneralError; // Error object if the task failed
};

/**
 * @interface TaskOptions
 * Represents the various options available for configuring a task.
 */
export interface TaskOptions {
  id?: string; // The unique identifier for the task
  name?: string; // The name of the task
  order?: number; // The order of execution in the workflow
  state?: TaskState; // The state of the task (in progress, waiting, completed)
  config?: TaskConfig; // Configuration settings for the task
  meta?: TaskMetadata; // Metadata associated with the task
  dependencies?: Workflow[]; // Workflows that must complete before this task
  payload?: any; // The data to be processed by the task
  events?: TaskEventEmitter; // EventEmitter instance to handle task events
  action: ((task: Task, workflow: Workflow) => Promise<TaskResponse>) | string; // The action to execute for the task
  undo?: ((task: Task, workflow: Workflow) => Promise<TaskResponse>) | string; // Optional undo action for the task
}

/**
 * @class Task
 * Represents a task within a workflow. Tasks can be executed, tracked for progress, and have dependencies.
 * It includes an action that can be executed and optionally undone.
 */
export class Task {
  public id: string; // The unique identifier of the task
  public name: string; // The name of the task
  public order: number; // The order of execution in the workflow
  public state: TaskState; // The current state of the task
  public config?: TaskConfig; // The task's configuration settings
  public meta?: TaskMetadata; // The task's metadata
  public dependencies?: Workflow[]; // List of workflows that must execute before this task
  public payload?: any; // The payload or data associated with the task
  public action:
    | ((task: Task, workflow: Workflow) => Promise<TaskResponse>)
    | string; // The action function or string to execute the task
  public undo?:
    | ((task: Task, workflow: Workflow) => Promise<TaskResponse>)
    | string; // The optional undo action for the task
  public startTime?: number; // The start time of the task execution
  public response?: TaskResponse; // The response from the task execution
  public events: TaskEventEmitter; // EventEmitter instance for task-related events

  /**
   * Creates a new task instance with the provided options.
   *
   * The constructor validates the task's payload and checks for circular dependencies.
   * It also ensures that the action provided is valid (either a function or a string).
   *
   * @param options - The options to configure the task instance.
   */
  public constructor(options: TaskOptions) {
    const {
      id,
      name,
      order,
      state,
      config,
      meta,
      dependencies,
      payload,
      action,
      undo,
      events,
    } = options;

    const unique = uniqueId();
    this.id = id || `T_${unique}`;
    this.name = name || `Task.${unique}`;
    this.state = state || TaskState.InProgress;
    this.order = order || 0;
    this.config = { ...DEFAULT_TASK_CONFIG, ...config };
    this.meta = { ...DEFAULT_TASK_METADATA, ...meta };
    this.dependencies = dependencies || [];
    this.payload = payload || {};
    this.events = events || new TaskEventEmitter();
    this.action = action;
    this.undo = undo;

    // Validate the task payload and check for circular dependencies
    validateTaskPayload(this.payload, this.name);
    validateTaskCircularDependency(this);

    // Validate that the action provided is either a function or a string
    if (
      !this.action ||
      (typeof this.action !== 'function' && typeof this.action !== 'string')
    ) {
      logger.error(`Task ${this.name}: Invalid action provided.`);
      throw new Error(`Task ${this.name}: Invalid action provided.`);
    }
  }

  /**
   * Updates the task's progress by setting the percentage of completion.
   *
   * This method updates the task configuration to reflect the current progress and the last execution time.
   *
   * @param percentage - The percentage of completion (0-100).
   */
  public progress(percentage: number): void {
    this.config = {
      ...DEFAULT_TASK_CONFIG,
      ...this.config,
      ...{
        execution: {
          state: { progress: percentage, lastExecutedTime: Date.now() },
        },
      },
    };
  }
}
