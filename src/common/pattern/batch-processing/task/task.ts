import _, { uniqueId } from 'lodash';
import { GeneralError } from '@common/error/general.error';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';
import { RetryOption } from '@common/pattern/batch-processing/common/common';
import { TaskEventEmitter } from './task.event-emitter';
import { logger } from '@common/logger/winston.logger';
import {
  validateTaskCircularDependency,
  validateTaskPayload,
} from '../helper/validation.helper';

/**
 * @enum TaskState
 * Represents the possible states of a task.
 */
export enum TaskState {
  InProgress = 'INPROGRESS',
  Waiting = 'WAITING',
  Completed = 'COMPLETED',
}

/**
 * @enum TaskResponseState
 * Represents the possible states of a task response.
 */
export enum TaskResponseState {
  Pending = 'PENDING',
  Failure = 'FAILURE',
  Success = 'SUCCESS',
}

/**
 * @interface TaskConfig
 * Holds the configuration for a task, including retry options.
 */
export type TaskConfig = {
  /** Retry option for the task */
  retry?: RetryOption;
  /** Execution info for the task */
  execution?: {
    /** Execution state of the task */
    state?: {
      /** Progress count of the task (Default is 0) */
      progress?: number;
      /** The last execution time of the task (Default is 0) */
      lastExecutedTime?: number;
    };
    /** The delay time between each execution of the task (Default is 1000) */
    delay?: number;
  };
};

export const DEFAULT_TASK_CONFIG: TaskConfig = {
  retry: { maximumAttempts: 1, attemptDelay: 1000, timeout: Infinity },
  execution: { delay: 1000, state: { progress: 0, lastExecutedTime: 0 } },
};

/**
 * @interface TaskMetadata
 * Contains extra information about tasks.
 */
export type TaskMetadata = {
  /** Requester information */
  caller?: {
    /** Name of requester */
    name: string;
    /** Requester access point */
    address: string;
  };
  additionalInfo?: { [key: string]: any };
};

export const DEFAULT_TASK_METADATA: TaskMetadata = {
  caller: {
    name: 'Unknown',
    address: 'Unknown',
  },
};

/**
 * @interface TaskResponse
 * Represents the result of executing a task, including state, result, and error.
 */
export type TaskResponse = {
  /** The response state of task */
  state: TaskResponseState;
  /** The response data of running task */
  result?: any;
  /** The error object that contains information about the failed task */
  error?: GeneralError;
};

/**
 * @interface TaskOptions
 * Represents the task options.
 */
export interface TaskOptions {
  id?: string;
  name?: string;
  order?: number;
  state?: TaskState;
  config?: TaskConfig;
  meta?: TaskMetadata;
  dependencies?: Workflow[];
  payload?: any;
  events?: TaskEventEmitter;
  action: (task: Task, workflow: Workflow) => Promise<TaskResponse>;
}

/**
 * @class Task
 * Describes the structure of a task within a workflow, including its ID, name, state, configuration, and action function.
 * @event Task#start
 * Emitted when the task starts.
 * @event Task#progress
 * Emitted when the task ongoing.
 * @event Task#failure
 * Emitted when the task failed.
 * @event Task#complete
 * Emitted when the task completed.
 * @param {Task} task - The task instance.
 * @param {Workflow} workflow - The workflow instance.
 */
export class Task {
  /** The unique identifier of each task */
  public id: string;
  /** The name of each task */
  public name: string;
  /** Order of tasks execution */
  public order: number;
  /** The state of task */
  public state: TaskState;
  /** The task configuration */
  public config?: TaskConfig;
  /** The extra information for the task */
  public meta?: TaskMetadata;
  /** Contains workflows that must execute before the task */
  public dependencies?: Workflow[];
  /** The payload of each task */
  public payload?: any;
  /** The task function that accepts task and workflow as parameters */
  public action: (task: Task, workflow: Workflow) => Promise<TaskResponse>;
  /** The start time of execution */
  public startTime?: number;
  /** The response returned after task execution */
  public response?: TaskResponse;
  /** Task EventEmitter instance */
  public events: TaskEventEmitter;

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

    validateTaskPayload(this.payload, this.name);
    validateTaskCircularDependency(this, this.name);

    if (!this.action || typeof this.action !== 'function') {
      logger.error(`Task ${this.name}: Invalid action provided.`);
      throw new Error(`Task ${this.name}: Invalid action provided.`);
    }
  }

  /**
   * Change task complete percentage by code inside task
   * @param percentage
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
