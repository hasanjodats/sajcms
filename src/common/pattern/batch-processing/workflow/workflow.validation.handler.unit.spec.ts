import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { WorkflowValidationHandler } from '@common/pattern/batch-processing/workflow/workflow.validation.handler';
import {
  Workflow,
  WorkflowResponseState,
} from '@common/pattern/batch-processing/workflow/workflow';
import { WorkflowError } from '@common/error/workflow.error';
import { WorkflowHandler } from '@common/pattern/batch-processing/workflow/workflow.handler';

// Mocking logger
jest.mock('@common/logger/winston.logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('WorkflowValidationHandler Tests', () => {
  let handler: WorkflowHandler;
  beforeEach(() => {
    handler = new WorkflowValidationHandler();
  });

  it('should pass validation for a valid workflow', async () => {
    const workflow = {
      id: '1',
      name: 'Valid Workflow',
      config: { JIT: true },
    } as unknown as Workflow;

    const response = await handler.handle(workflow);

    expect(response.state).not.toBe(WorkflowResponseState.Failure);
  });

  it('should fail validation for a workflow with missing id and name', async () => {
    const workflow = {
      id: '',
      name: '',
      config: { JIT: true },
    } as unknown as Workflow;
    workflow.id = workflow.name = '';

    const response = await handler.handle(workflow);

    expect(response.state).toBe(WorkflowResponseState.Failure);
    expect(response.error).toBeInstanceOf(WorkflowError);
  });

  it('should fail validation for a deferred workflow without a container', async () => {
    const workflow = {
      id: '2',
      name: 'Deferred Workflow',
      config: { JIT: false },
    } as unknown as Workflow;

    const response = await handler.handle(workflow);

    expect(response.state).toBe(WorkflowResponseState.Failure);
    expect(response.error).toBeInstanceOf(WorkflowError);
  });
});
