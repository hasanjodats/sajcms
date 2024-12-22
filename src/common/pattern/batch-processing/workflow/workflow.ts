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
import ActionContainer from '@common/pattern/batch-processing/common/container';

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
type WorkflowConfig = {
  JIT: boolean;
  execution?: {
    state: {
      progress?: number;
    };
  };
};

const DEFAULT_WORKFLOW_CONFIG: WorkflowConfig = {
  JIT: true,
  execution: { state: { progress: 0 } },
};

/**
 * @interface WorkflowMetadata
 * Contains extra information about workflows.
 */
type WorkflowMetadata = {
  caller?: {
    name: string;
    address: string;
  };
  additionalInfo?: { [key: string]: unknown };
};

const DEFAULT_WORKFLOW_METADATA: WorkflowMetadata = {
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
  state: WorkflowResponseState;
  result?: unknown;
  error?: GeneralError;
};

/**
 * @interface WorkflowOptions
 * Represents the workflow options.
 */
interface WorkflowOptions {
  id?: string;
  name?: string;
  initialState?: unknown;
  state?: WorkflowState;
  config?: WorkflowConfig;
  meta?: WorkflowMetadata;
  dependencies?: Workflow[];
  tasks: Task[];
  taskHandlerChain: TaskHandler;
  workflowHandlerChain: WorkflowHandler;
  events?: WorkflowEventEmitter;
  container?: ActionContainer;
}

/**
 * @class Workflow
 * Describes the structure of a workflow, including its tasks, state, configuration, and dependencies.
 */
export class Workflow {
  public id: string;
  public name: string;
  public initialState?: unknown;
  public state: WorkflowState;
  public config?: WorkflowConfig;
  public meta?: WorkflowMetadata;
  public dependencies?: Workflow[];
  public startTime?: number;
  public tasks: Task[];
  public taskHandlerChain: TaskHandler;
  public workflowHandlerChain: WorkflowHandler;
  public events: WorkflowEventEmitter;
  public container?: ActionContainer;

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
   * Update the progress of the workflow based on task completion.
   * @param percentage - The progress percentage to update the workflow state.
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
    logger.info(`Workflow ${this.name} progress updated to ${percentage}%`);
  }
}
