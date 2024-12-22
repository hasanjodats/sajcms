import { describe, expect, it, jest } from '@jest/globals';
import {
  validateWorkflowInitialState,
  validateTaskPayload,
  validateWorkflowCircularDependency,
  validateTaskCircularDependency,
} from '@common/pattern/batch-processing/helper/validation.helper';
import { GeneralError } from '@common/error/general.error';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';
import { Task } from '@common/pattern/batch-processing/task/task';

jest.mock('@common/logger/winston.logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Validation Tests', () => {
  const mockWorkflow = {
    id: 'wf-123',
    name: 'Mock Workflow',
    dependencies: [],
  } as unknown as Workflow;

  const mockTask = {
    id: 'task-456',
    name: 'Mock Task',
    dependencies: [],
  } as unknown as Task;

  it('should validate workflow initial state (valid)', () => {
    expect(() =>
      validateWorkflowInitialState({}, 'MockWorkflow'),
    ).not.toThrow();
  });

  it('should throw error for invalid workflow initial state', () => {
    expect(() => validateWorkflowInitialState(1, 'MockWorkflow')).toThrow(
      new GeneralError(
        'InvalidInitialState',
        'InitialState for workflow MockWorkflow must be an object.',
      ),
    );
  });

  it('should validate task payload (valid)', () => {
    expect(() =>
      validateTaskPayload({ key: 'value' }, 'MockTask'),
    ).not.toThrow();
  });

  it('should throw error for invalid task payload', () => {
    expect(() => validateTaskPayload(1, 'MockTask')).toThrow(
      new GeneralError(
        'InvalidTaskPayload',
        'Payload for task MockTask must be an object.',
      ),
    );
  });

  it('should detect circular dependency in workflow', () => {
    mockWorkflow.dependencies = [mockWorkflow]; // Circular dependency
    expect(() => validateWorkflowCircularDependency(mockWorkflow)).toThrow(
      new GeneralError(
        'CircularDependencyError',
        'Circular dependency detected in workflow Mock Workflow',
      ),
    );
  });

  it('should detect circular dependency in task', () => {
    mockTask.dependencies = [mockWorkflow]; // Circular dependency
    expect(() => validateTaskCircularDependency(mockTask)).toThrow(
      new GeneralError(
        'CircularDependencyError',
        'Circular dependency detected in task Mock Task',
      ),
    );
  });
});
