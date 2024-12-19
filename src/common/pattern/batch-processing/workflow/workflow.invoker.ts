import { logger } from '@common/logger/winston.logger';
import {
  Workflow,
  WorkflowResponse,
  WorkflowResponseState,
} from '@common/pattern/batch-processing/workflow/workflow';
import { PoolProcessor } from '@common/pattern/batch-processing/workflow/workflow.pool.processor';

/**
 * The WorkflowInvoker class determines how workflows are executed.
 * It supports Just-In-Time (JIT) workflows for immediate execution and deferred workflows
 * managed via a processing pool.
 */
export class WorkflowInvoker {
  /**
   * Executes the provided workflow. If it's a JIT workflow, execute immediately; otherwise, add it to the processing pool.
   * @param workflow - The workflow to execute.
   * @returns {Promise<GeneralResponse | null>} Workflow response or null.
   */
  public async run(workflow: Workflow): Promise<WorkflowResponse> {
    try {
      // If the workflow's configuration indicates it is a JIT (Just-In-Time) workflow, it calls the execute method directly.
      if (workflow.config?.JIT ?? true) {
        // Log the workflow execution start
        logger.info(
          `Workflow ${workflow.name}(${workflow.id}) has started in JIT mode.`,
        );
        const response = await workflow.workflowHandlerChain.handle(workflow);
        logger.info(
          `JIT workflow ${workflow.name}(${workflow.id}) execution has finished and the response state is ${response.state}.`,
        );
        return response;
      } else {
        logger.info(
          `Workflow ${workflow.name}(${workflow.id}) has started in deferred mode.`,
        );
        const pool = new PoolProcessor();
        pool.addWorkflow(workflow);
        pool.startHeartbeat(5000); // Start the heartbeat to trigger every 5 seconds
        return {
          state: WorkflowResponseState.Success,
        };
      }
    } catch (error: any) {
      logger.error(
        `Error occurred while running workflow ${workflow.name}(${workflow.id}).`,
        error,
      );
      return {
        state: WorkflowResponseState.Failure,
        error,
      };
    }
  }

  /**
   * Cancels the execution of the specified workflow. Placeholder for future implementation.
   * @param workflow - The workflow to cancel.
   * @returns {Promise<void>} Promise indicating completion of the cancellation.
   */
  public async cancel(workflow: Workflow): Promise<void> {}
}
