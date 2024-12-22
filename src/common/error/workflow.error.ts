import { GeneralError } from '@common/error/general.error';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';

/**
 * @enum WorkflowErrorType
 * Represents the type of workflow errors.
 */
export enum WorkflowErrorType {
  WorkflowFailed = 'WORKFLOWFAILED',
  ExecutionFailed = 'EXECUTIONFAILED',
  ValidationFailed = 'VALIDATIONFAILED',
  NotTasksCompleted = 'NOTTASKSCOMPLETED',
  DependencyExecutionFailed = 'DEPENDENCYEXECUTIONFAILED',
}

/**
 * @class WorkflowError
 * A class for handling errors that occur during workflow execution.
 */
export class WorkflowError extends GeneralError {
  constructor(
    public workflow: Workflow,
    public type: WorkflowErrorType,
    message: string,
    cause?: unknown,
    public code?: string,
    public timestamp = new Date().toISOString(),
  ) {
    super(
      type,
      `Workflow ${workflow.name} (${workflow.id}): ${message}${code ? `, Error Code: ${code}` : ''}, Timestamp: ${timestamp}`,
      cause,
    );
  }
}
