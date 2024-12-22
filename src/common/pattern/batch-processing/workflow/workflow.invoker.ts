import { GeneralError } from '@common/error/general.error';
import { logger } from '@common/logger/winston.logger';
import {
  Workflow,
  WorkflowResponse,
  WorkflowResponseState,
} from '@common/pattern/batch-processing/workflow/workflow';
import { PoolProcessor } from '@common/pattern/batch-processing/workflow/workflow.pool.processor';

/**
 * The WorkflowInvoker class defines how workflows are executed.
 * It determines whether a workflow should be executed immediately (Just-In-Time - JIT)
 * or deferred and handled via a processing pool.
 */
export class WorkflowInvoker {
  /**
   * Executes the provided workflow based on its configuration.
   * If the workflow is marked as a JIT (Just-In-Time) workflow, it is executed immediately.
   * Otherwise, the workflow is added to a processing pool and deferred for later execution.
   *
   * @param {Workflow} workflow - The workflow to execute.
   * @returns {Promise<WorkflowResponse>} - The response after workflow execution indicating success or failure.
   */
  public async run(workflow: Workflow): Promise<WorkflowResponse> {
    try {
      // If the workflow is configured as a JIT (Just-In-Time) workflow, execute immediately.
      if (workflow.config?.JIT ?? true) {
        // Log the start of workflow execution in JIT mode
        logger.info(
          `Workflow ${workflow.name}(${workflow.id}) has started in JIT mode.`,
        );

        // Execute the workflow using its handler chain
        const response = await workflow.workflowHandlerChain.handle(workflow);

        // Log the result of JIT execution
        logger.info(
          `JIT workflow ${workflow.name}(${workflow.id}) execution has finished and the response state is ${response.state}.`,
        );

        // Return the execution response
        return response;
      } else {
        // Log the start of workflow execution in deferred mode (via processing pool)
        logger.info(
          `Workflow ${workflow.name}(${workflow.id}) has started in deferred mode.`,
        );

        // Create a new PoolProcessor instance to handle the workflow
        const pool = new PoolProcessor();
        pool.addWorkflow(workflow); // Add the workflow to the pool for later execution
        pool.startHeartbeat(5000); // Start a heartbeat to check for task execution every 5 seconds

        // Return a success response indicating the workflow was successfully added to the pool
        return {
          state: WorkflowResponseState.Success,
        };
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error?.message : 'Unknown error';
      // Log an error if an exception occurs during workflow execution
      logger.error(
        `Error occurred while running workflow ${workflow.name}(${workflow.id}).`,
        errorMessage,
      );

      // Return a failure response with the error details
      return {
        state: WorkflowResponseState.Failure,
        error:
          error instanceof Error
            ? error
            : new GeneralError('UnknownError', errorMessage),
      };
    }
  }

  /**
   * Cancels the execution of the specified workflow.
   * Currently a placeholder method for future implementation of cancellation logic.
   *
   * @param {Workflow} workflow - The workflow to cancel.
   * @returns {Promise<void>} - A promise indicating the completion of the cancellation process.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async cancel(_workflow: Workflow): Promise<void> {
    // Placeholder for future cancellation logic
  }
}
