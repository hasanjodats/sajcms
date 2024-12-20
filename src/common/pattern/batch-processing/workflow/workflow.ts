import { uniqueId } from 'lodash';
import { GeneralError } from '@common/error/general.error';
import { Task } from '@common/pattern/batch-processing/task/task';
import { TaskHandler } from '@common/pattern/batch-processing/task/task.handler';
import { WorkflowHandler } from '@common/pattern/batch-processing/workflow/workflow.handler';
import { WorkflowEventEmitter } from '@common/pattern/batch-processing/workflow/workflow.event-emitter';
import { logger } from '@common/logger/winston.logger';
import {
  validateWorkflowCircularDependency,
  validateWorkflowInitialState,
} from '@common/pattern/batch-processing/helper/validation.helper';
import MapContainer, { StaticThis } from '@common/pattern/batch-processing/common/container';

/**
 * @enum WorkflowState
 * Represents the possible states of a workflow.
 */
export enum WorkflowState {
  InProgress = 'INPROGRESS',
  Waiting = 'WAITING',
  Completed = 'COMPLETED',
}

/**
 * @enum WorkflowResponseState
 * Represents the possible states of a workflow response.
 */
export enum WorkflowResponseState {
  Pending = 'PENDING',
  Failure = 'FAILURE',
  Success = 'SUCCESS',
}

/**
 * @interface WorkflowConfig
 * Configuration for workflows, including retry options and a JIT (Just-In-Time) option.
 */
export type WorkflowConfig = {
  /** Just in time flag */
  JIT: boolean;
  /** Execution info for the workflow */
  execution?: {
    /** Execution state of the workflow */
    state: {
      /** Progress count of the workflow */
      progress?: number;
    };
  };
};

export const DEFAULT_WORKFLOW_CONFIG: WorkflowConfig = {
  JIT: true,
  execution: { state: { progress: 0 } },
};

/**
 * @interface WorkflowMetadata
 * Contains extra information about workflows.
 */
export type WorkflowMetadata = {
  /** Requester information */
  caller?: {
    /** Name of requester */
    name: string;
    /** Requester access point */
    address: string;
  };
  additionalInfo?: { [key: string]: any };
};

export const DEFAULT_WORKFLOW_METADATA: WorkflowMetadata = {
  caller: {
    name: 'Unknown',
    address: 'Unknown',
  },
};

/**
 * @interface WorkflowResponse
 * Represents the result of executing a workflow, including state, result, and error.
 */
export type WorkflowResponse = {
  /** The response state of workflow */
  state: WorkflowResponseState;
  /** The response data of running workflow */
  result?: any;
  /** The error object that contains information about the failed workflow */
  error?: GeneralError;
};

/**
 * @interface WorkflowOptions
 * Represents the workflow options.
 */
export interface WorkflowOptions {
  id?: string;
  name?: string;
  initialState?: any;
  state?: WorkflowState;
  config?: WorkflowConfig;
  meta?: WorkflowMetadata;
  dependencies?: Workflow[];
  tasks: Task[];
  taskHandlerChain: TaskHandler;
  workflowHandlerChain: WorkflowHandler;
  events?: WorkflowEventEmitter;
  container?: StaticThis;
}

/**
 * @class Workflow
 * Describes the structure of a workflow, including its tasks, state, configuration, and dependencies.
 * @event Workflow#start
 * Emitted when the workflow starts.
 * @event Workflow#progress
 * Emitted when the workflow ongoing.
 * @event Workflow#failure
 * Emitted when the workflow failed.
 * @event Workflow#complete
 * Emitted when the workflow completed.
 * @param {Workflow} workflow - The workflow instance.
 */
export class Workflow {
  /** The unique identifier of each workflow */
  public id: string;
  /** The name of each workflow */
  public name: string;
  /** The initial state of each workflow */
  public initialState?: any;
  /** The state of workflow */
  public state: WorkflowState;
  /** The workflow configuration */
  public config?: WorkflowConfig;
  /** The extra information of workflow */
  public meta?: WorkflowMetadata;
  /** Contains workflows that must execute before the current workflow */
  public dependencies?: Workflow[];
  /** The start time of execution */
  public startTime?: number;
  /** Workflow's tasks */
  public tasks: Task[];
  /** Task handlers */
  public taskHandlerChain: TaskHandler;
  /** Workflow handlers */
  public workflowHandlerChain: WorkflowHandler;
  /** Workflow EventEmitter instance */
  public events: WorkflowEventEmitter;
  public container?: StaticThis;

  public constructor(options: WorkflowOptions) {
    const {
      id,
      name,
      initialState,
      state,
      config,
      meta,
      dependencies,
      tasks,
      taskHandlerChain,
      workflowHandlerChain,
      events,
      container,
    } = options;
    const unique = uniqueId();
    this.id = id || `W_${unique}`;
    this.name = name || `Workflow.${unique}`;
    this.initialState = initialState || {};
    this.state = state || WorkflowState.InProgress;
    this.config = { ...DEFAULT_WORKFLOW_CONFIG, ...config };
    this.meta = { ...DEFAULT_WORKFLOW_METADATA, ...meta };
    this.dependencies = dependencies || [];
    this.tasks = tasks;
    this.taskHandlerChain = taskHandlerChain;
    this.workflowHandlerChain = workflowHandlerChain;
    this.events = events || new WorkflowEventEmitter();
    this.container = container;

    validateWorkflowInitialState(this.initialState, this.name);
    validateWorkflowCircularDependency(this);

    if (!Array.isArray(this.tasks)) {
      logger.error(`Tasks for workflow ${this.name} must be an array.`);
      throw new Error(`Tasks for workflow ${this.name} must be an array.`);
    }

    if (
      !this.taskHandlerChain ||
      !(this.taskHandlerChain instanceof TaskHandler)
    ) {
      logger.error(
        `A valid TaskHandler instance for workflow ${this.name} must be provided.`,
      );
      throw new Error(
        `A valid TaskHandler instance for workflow ${this.name} must be provided.`,
      );
    }

    if (
      !this.workflowHandlerChain ||
      !(this.workflowHandlerChain instanceof WorkflowHandler)
    ) {
      logger.error(
        `A valid WorkflowHandler instance must for workflow ${this.name} be provided.`,
      );
      throw new Error(
        `A valid WorkflowHandler instance must for workflow ${this.name} be provided.`,
      );
    }
  }

  /**
   * Change workflow complete percentage by code inside task
   * @param percentage
   */
  public progress(percentage: number): void {
    this.config = {
      ...DEFAULT_WORKFLOW_CONFIG,
      ...this.config,
      ...{
        execution: {
          state: { progress: percentage },
        },
      },
    };
  }
}
