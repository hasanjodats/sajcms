import { Task } from '@common/pattern/batch-processing/task/task';
import { GeneralError } from '@common/error/general.error';

/**
 * @enum TaskErrorType
 * Represents the type of task errors.
 */
export enum TaskErrorType {
  TaskFailed = 'TASKFAILED',
  ExecutionFailed = 'EXECUTIONFAILED',
  ValidationFailed = 'VALIDATIONFAILED',
  DependencyExecutionFailed = 'DEPENDENCYEXECUTIONFAILED',
  NotDependenciesCompleted = 'NOTDEPENDENCIESCOMPLETED',
}

/**
 * @class TaskError
 * A class for handling errors that occur during task execution.
 */
export class TaskError extends GeneralError {
  constructor(
    task: Task,
    type: TaskErrorType,
    message: string,
    cause?: unknown,
    code?: string,
    timestamp = new Date().toISOString(),
  ) {
    super(
      type,
      `Task ${task.name} (${task.id}): ${message}${code ? `, Error Code: ${code}` : ''}, Timestamp: ${timestamp}`,
      cause,
    );
  }
}
