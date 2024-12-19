import { describe, expect, test } from '@jest/globals';
import { WorkflowError, WorkflowErrorType } from '@common/error/workflow.error';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';

describe('WorkflowError Class', () => {
  const mockWorkflow = {
    name: 'SampleWorkflow',
    id: 'wf-1234',
  } as unknown as Workflow;

  const type = WorkflowErrorType.WorkflowFailed;
  const message = 'Workflow execution failed.';
  const cause = new Error('Root cause of the failure');
  const code = 'WF_ERR_001';

  test('should create a WorkflowError with correct message and properties', () => {
    const timestamp = '2024-06-10T12:00:00Z';
    const workflowError = new WorkflowError(
      mockWorkflow,
      type,
      message,
      undefined,
      undefined,
      timestamp,
    );

    expect(workflowError).toBeInstanceOf(WorkflowError);
    expect(workflowError.name).toBe(type);
    expect(workflowError.message).toContain(
      `Workflow ${mockWorkflow.name} (${mockWorkflow.id}): ${message}`,
    );
    expect(workflowError.message).toContain(`Timestamp: ${timestamp}`);
    expect(workflowError.cause).toBe('No additional cause');
  });

  test('should include the cause if provided', () => {
    const workflowError = new WorkflowError(mockWorkflow, type, message, cause);

    expect(workflowError.cause).toBe(cause);
    expect(workflowError.message).toContain(
      `Workflow ${mockWorkflow.name} (${mockWorkflow.id}): ${message}`,
    );
  });

  test('should include the error code if provided', () => {
    const workflowError = new WorkflowError(
      mockWorkflow,
      type,
      message,
      undefined,
      code,
    );

    expect(workflowError.message).toContain(`Error Code: ${code}`);
  });

  test('should include the correct timestamp if provided', () => {
    const customTimestamp = '2024-06-10T14:30:00Z';
    const workflowError = new WorkflowError(
      mockWorkflow,
      type,
      message,
      undefined,
      undefined,
      customTimestamp,
    );

    expect(workflowError.message).toContain(`Timestamp: ${customTimestamp}`);
  });
});
