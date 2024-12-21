import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  Task,
  TaskResponse,
  TaskResponseState,
} from '@common/pattern/batch-processing/task/task';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';
import { Action } from '@common/pattern/batch-processing/common/action';

describe('Action', () => {
  let action: Action;
  let mockTask: Task;
  let mockWorkflow: Workflow;

  beforeEach(() => {
    mockTask = { id: 'task1' } as Task;
    mockWorkflow = { id: 'workflow1' } as Workflow;

    action = {
      name: 'mockAction',
      execute: jest.fn().mockImplementation(() => {
        return { state: TaskResponseState.Success };
      }) as jest.MockedFunction<
        (task: Task, workflow: Workflow) => Promise<TaskResponse>
      >,

      configure: jest.fn().mockImplementation(() => {}) as (
        config: any,
      ) => Promise<void> | void,
    };
  });

  it('should execute the action successfully', async () => {
    // فراخوانی متد execute
    const response = await action.execute(mockTask, mockWorkflow);

    // بررسی اینکه متد execute با آرگومان‌های صحیح فراخوانی شده است
    expect(action.execute).toHaveBeenCalledWith(mockTask, mockWorkflow);
    // بررسی اینکه نتیجه همان چیزی است که انتظار داریم
    expect(response).toEqual({
      state: TaskResponseState.Success, // بررسی state
    });
  });

  it('should configure the action if configure method is provided', async () => {
    const config = { setting: 'value' };

    // فراخوانی متد configure
    await action.configure!(config);

    // بررسی اینکه متد configure با آرگومان‌های صحیح فراخوانی شده است
    expect(action.configure).toHaveBeenCalledWith(config);
  });
});
