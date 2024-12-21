import { WorkflowError, WorkflowErrorType } from '@common/error/workflow.error';
import { logger } from '@common/logger/winston.logger';
import { TaskState } from '@common/pattern/batch-processing/task/task';
import {
  Workflow,
  WorkflowResponse,
  WorkflowResponseState,
} from '@common/pattern/batch-processing/workflow/workflow';
import { WorkflowHandler } from '@common/pattern/batch-processing/workflow/workflow.handler';

/**
 * The WorkflowEnsureTasksCompletedHandler class ensures that all tasks within a workflow are completed before proceeding.
 * If any task is still in progress, the workflow is considered incomplete and an error is returned.
 * This handler is an essential part of the workflow execution process, ensuring that the workflow only moves forward
 * when all tasks have finished.
 */
export class WorkflowEnsureTasksCompletedHandler extends WorkflowHandler {
  /**
   * Handles the validation that all tasks of the workflow have been completed.
   * If any task is not completed, it returns a failure response with an error.
   * If all tasks are completed, it proceeds to the next handler in the chain.
   *
   * @param {Workflow} workflow - The workflow instance whose tasks need to be validated.
   * @returns {Promise<WorkflowResponse>} - The response of the workflow, either a failure or the result of the next handler.
   */
  async handle(workflow: Workflow): Promise<WorkflowResponse> {
    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) has started ensuring all tasks are completed.`,
    );

    // Check if all tasks are completed
    if (!workflow.tasks.every((task) => task.state === TaskState.Completed)) {
      // If any task is not completed, return a failure response
      return {
        state: WorkflowResponseState.Failure,
        error: new WorkflowError(
          workflow,
          WorkflowErrorType.NotTasksCompleted,
          'One or more tasks are still in progress.', // Error message when tasks are incomplete
        ),
      };
    }

    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) has passed the task completion check.`,
    );

    // If all tasks are completed, pass the workflow to the next handler
    return super.handle(workflow);
  }
}
