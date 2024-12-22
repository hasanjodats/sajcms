import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Action } from '@common/pattern/batch-processing/common/action';
import { GeneralError } from '@common/error/general.error';
import ActionContainer from '@common/pattern/batch-processing/common/container';
import {
  Task,
  TaskResponse,
  TaskResponseState,
} from '@common/pattern/batch-processing/task/task';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';

describe('ActionContainer', () => {
  let container: ActionContainer;
  let mockAction: Action;

  beforeEach(() => {
    // Create a mock action
    mockAction = {
      name: 'mockAction',
      execute: jest.fn().mockImplementation(() => {
        return { state: TaskResponseState.Success };
      }) as jest.MockedFunction<
        (task: Task, workflow: Workflow) => Promise<TaskResponse>
      >,

      configure: jest.fn().mockImplementation(() => {}) as (
        config: unknown,
      ) => Promise<void> | void,
    };

    // Create a new instance of ActionContainer
    container = new (class extends ActionContainer {
      public async init(): Promise<void> {
        // Empty init implementation for the test
      }
    })();
  });

  it('should register a new action', async () => {
    // Register the action
    await container.registerAction(mockAction);

    // Verify that the action was registered
    const registeredAction = container.getAction('mockAction');
    expect(registeredAction).toBe(mockAction);
  });

  it('should throw an error if trying to retrieve an unregistered action', () => {
    // Try to retrieve an action that hasn't been registered yet
    expect(() => container.getAction('test')).toThrowError(
      new GeneralError('ActionNotFound', 'Action test not found.'),
    );
  });

  it('should return a list of registered actions', async () => {
    // Register the action
    await container.registerAction(mockAction);

    // Verify the registered actions list
    const registeredActions = container.getRegisteredActions();
    expect(registeredActions).toEqual(['mockAction']);
  });
});
