import { describe, expect, test } from '@jest/globals';
import { TaskError, TaskErrorType } from '@common/error/task.error';
import { Task } from '@common/pattern/batch-processing/task/task';
import { GeneralError } from '@common/error/general.error';

// Mocked Task object for testing
const mockTask = {
  id: 'T_123',
  name: 'Test Task',
} as Task;

describe('TaskError Class', () => {
  test('should create a TaskError with correct message and properties', () => {
    const message = 'Execution failed due to timeout.';
    const errorType = TaskErrorType.ExecutionFailed;

    const taskError = new TaskError(mockTask, errorType, message);

    expect(taskError).toBeInstanceOf(GeneralError);
    expect(taskError.name).toBe(errorType);
    expect(taskError.message).toContain(
      `Task ${mockTask.name} (${mockTask.id})`,
    );
    expect(taskError.message).toContain(message);
    expect(taskError.cause).toBe('No additional cause');
  });

  test('should include the error code if provided', () => {
    // Arrange
    const message = 'An unknown error occurred.';
    const errorType = TaskErrorType.TaskFailed;
    const errorCode = 'ERR_500';

    // Act
    const taskError = new TaskError(
      mockTask,
      errorType,
      message,
      undefined,
      errorCode,
    );

    // Assert
    expect(taskError.message).toContain(`Error Code: ${errorCode}`);
  });

  test('should include cause if provided', () => {
    // Arrange
    const message = 'Task dependency failed.';
    const errorType = TaskErrorType.TaskFailed;
    const cause = new Error('Cause of failure');

    // Act
    const taskError = new TaskError(mockTask, errorType, message, cause);

    // Assert
    expect(taskError.cause).toBe(cause);
  });

  test('should include timestamp in the error message', () => {
    // Arrange
    const message = 'Task failed unexpectedly.';
    const errorType = TaskErrorType.TaskFailed;

    // Act
    const taskError = new TaskError(mockTask, errorType, message);

    // Assert
    expect(taskError.message).toContain('Timestamp');
  });
});
