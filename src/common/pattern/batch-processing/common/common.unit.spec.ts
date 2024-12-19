import { describe, expect, it } from '@jest/globals';
import { hasCircularDependency } from '@common/pattern/batch-processing/common/common';
import {
  Workflow,
  WorkflowState,
} from '@common/pattern/batch-processing/workflow/workflow';
import {
  Task,
  TaskResponseState,
  TaskState,
} from '@common/pattern/batch-processing/task/task';
import { TaskValidationHandler } from '../task/task.validation.handler';
import { WorkflowValidationHandler } from '../workflow/workflow.validation.handler';

describe('hasCircularDependency', () => {
  it('should return true for circular dependency', () => {
    // Define tasks
    const taskA = new Task({
      id: 'taskA',
      name: 'Task A',
      state: TaskState.InProgress,
      action: async () => ({ state: TaskResponseState.Success }),
      order: 1,
    });

    const taskB = new Task({
      id: 'taskB',
      name: 'Task B',
      state: TaskState.InProgress,
      action: async () => ({ state: TaskResponseState.Success }),
      order: 2,
    });

    // Defining Workflows with Circular Dependencies
    const workflowA = new Workflow({
      id: 'workflowA',
      name: 'Workflow A',
      state: WorkflowState.InProgress,
      tasks: [taskA],
      taskHandlerChain: new TaskValidationHandler(),
      workflowHandlerChain: new WorkflowValidationHandler(),
      dependencies: [],
    });

    const workflowB = new Workflow({
      id: 'workflowB',
      name: 'Workflow B',
      state: WorkflowState.InProgress,
      tasks: [taskB],
      taskHandlerChain: new TaskValidationHandler(),
      workflowHandlerChain: new WorkflowValidationHandler(),
      dependencies: [workflowA],
    });

    // With circular dependency
    workflowA.dependencies = [workflowB]; // Workflow A is dependent on workflow B.
    expect(hasCircularDependency(workflowA)).toBe(true);
  });

  it('should return false for no circular dependency', () => {
    // تعریف Task ها
    const taskA = new Task({
      id: 'taskA',
      name: 'Task A',
      state: TaskState.InProgress,
      action: async () => ({ state: TaskResponseState.Success }),
      order: 1,
    });

    const taskB = new Task({
      id: 'taskB',
      name: 'Task B',
      state: TaskState.InProgress,
      action: async () => ({ state: TaskResponseState.Success }),
      order: 2,
    });

    // Defining Workflows without Circular Dependencies
    const workflowA = new Workflow({
      id: 'workflowA',
      name: 'Workflow A',
      state: WorkflowState.InProgress,
      tasks: [taskA],
      taskHandlerChain: new TaskValidationHandler(),
      workflowHandlerChain: new WorkflowValidationHandler(),
      dependencies: [],
    });

    const workflowB = new Workflow({
      id: 'workflowB',
      name: 'Workflow B',
      state: WorkflowState.InProgress,
      tasks: [taskB],
      taskHandlerChain: new TaskValidationHandler(),
      workflowHandlerChain: new WorkflowValidationHandler(),
      dependencies: [workflowA],
    });

    // Without circular dependency
    expect(hasCircularDependency(workflowB)).toBe(false);
  });
});
