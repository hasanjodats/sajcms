import { WorkflowError, WorkflowErrorType } from '@common/error/workflow.error';
import { logger } from '@common/logger/winston.logger';
import {
  TaskResponseState,
  TaskState,
} from '@common/pattern/batch-processing/task/task';
import {
  Workflow,
  WorkflowResponse,
  WorkflowResponseState,
  WorkflowState,
} from '@common/pattern/batch-processing/workflow/workflow';
import { WorkflowHandler } from '@common/pattern/batch-processing/workflow/workflow.handler';
import { WorkflowEvent } from '@common/pattern/batch-processing/workflow/workflow.event-emitter';

/**
 * The WorkflowExecutionHandler is responsible for executing all tasks within a workflow sequentially.
 * It handles the initiation, progress tracking, and completion of workflow tasks, as well as emitting events
 * at different stages of the workflow execution.
 */
export class WorkflowExecutionHandler extends WorkflowHandler {
  /**
   * Handles the execution of all tasks in the workflow.
   * It emits events to track the start, progress, and completion of the workflow,
   * and ensures that all tasks are executed in sequence.
   * If any task fails or is pending, the workflow will stop and return the appropriate response.
   *
   * @param {Workflow} workflow - The workflow instance that contains tasks to be executed.
   * @returns {Promise<WorkflowResponse>} - The response indicating the success or failure of the workflow execution.
   */
  public async handle(workflow: Workflow): Promise<WorkflowResponse> {
    // Emit the start event when the workflow begins execution
    workflow.events.emit(WorkflowEvent.Start, workflow);
    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) has started execution.`,
    );
    workflow.startTime = Date.now(); // Track the start time of the workflow execution

    try {
      // Emit the initial progress event at 0% completion
      workflow.events.emit(WorkflowEvent.Progress, workflow, 0);

      let index = 1; // Initialize task index for progress calculation

      // Iterate over each task and execute them sequentially
      for (const task of workflow.tasks) {
        // Check if the task is already completed, if not, execute it
        if (task.state !== TaskState.Completed) {
          logger.info(
            `Workflow ${workflow.name}(${workflow.id}) has started executing task ${task.name}(${task.id}).`,
          );

          // Execute the task using the task handler chain
          const response = await workflow.taskHandlerChain.handle(
            task,
            workflow,
          );

          // Log the result of task execution
          logger.info(
            `Workflow ${workflow.name}(${workflow.id}) has executed task ${task.name}(${task.id}) and the response state is ${response.state}.`,
          );

          // Calculate and emit the progress of the workflow
          let progress = Math.round((index / workflow.tasks.length) * 100);
          workflow.events.emit(WorkflowEvent.Progress, workflow, progress);

          index = index + 1; // Increment the task index

          // If the task response is pending, stop execution and return pending status
          if (response.state === TaskResponseState.Pending) {
            return {
              state: WorkflowResponseState.Pending,
            };
          }
          // If the task failed, stop execution and return failure status
          else if (response.state === TaskResponseState.Failure) {
            return {
              state: WorkflowResponseState.Failure,
              error: new WorkflowError(
                workflow,
                WorkflowErrorType.ExecutionFailed,
                'Not all tasks were completed successfully.',
              ),
            };
          }
        }
      }

      // If all tasks are completed successfully, mark the workflow as completed
      workflow.state = WorkflowState.Completed;
      logger.info(
        `Workflow ${workflow.name}(${workflow.id}) has executed all tasks successfully.`,
      );

      // Pass the workflow to the next handler in the chain
      return super.handle(workflow);
    } catch (error: any) {
      const errorMessage = error?.message ?? 'Unknown error';

      // If an error occurs during execution, create a workflow error and emit the failure event
      const workflowError = new WorkflowError(
        workflow,
        WorkflowErrorType.ExecutionFailed,
        errorMessage,
      );
      workflow.events.emit(WorkflowEvent.Failure, workflow, workflowError);
      logger.error(
        `Workflow ${workflow.name}(${workflow.id}) execution has failed.`,
        errorMessage,
      );

      // Return failure response with the error details
      return {
        state: WorkflowResponseState.Failure,
        error: workflowError,
      };
    } finally {
      // Calculate and log the elapsed time of workflow execution
      const elapsedTime = Date.now() - (workflow.startTime || 0);
      logger.info(
        `Workflow ${workflow.name}(${workflow.id}) has executed in ${elapsedTime} ms`,
      );
    }
  }
}
