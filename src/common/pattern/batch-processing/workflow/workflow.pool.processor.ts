import {
  Workflow,
  WorkflowState,
} from '@common/pattern/batch-processing/workflow/workflow';
import { logger } from '@common/logger/winston.logger';
import { WorkflowError, WorkflowErrorType } from '@common/error/workflow.error';

/**
 * @class PoolProcessor
 * The PoolProcessor class is responsible for managing workflows that are not executed immediately (like JIT workflows) but are instead queued for batch processing.
 * It utilizes a heartbeat mechanism to periodically execute workflows and clean up completed ones.
 */
export class PoolProcessor {
  private workflowStorage: Map<string, Workflow>; // Simulates storage for queued workflows.

  public constructor() {
    this.workflowStorage = new Map(); // Using an in-memory map to simulate workflow storage.
  }

  /**
   * Adds a workflow to the processing queue.
   * If the workflow is already in the queue, an error is thrown.
   *
   * @param {Workflow} workflow - The workflow to add to the pool for deferred processing.
   * @throws {Error} If the workflow is already present in the storage, a WorkflowError is thrown.
   */
  public addWorkflow(workflow: Workflow): void {
    // Check if the workflow already exists in the pool
    if (this.workflowStorage.has(workflow.id)) {
      const error = new WorkflowError(
        workflow,
        WorkflowErrorType.WorkflowFailed,
        `Workflow ${workflow.name}(${workflow.id}) already exists in pool.`,
      );

      logger.error(
        `Workflow ${workflow.name}(${workflow.id}) already exists in pool.`,
        error,
      );
      throw error; // Throw an error if the workflow is already in the pool
    }

    // Add the new workflow to the pool storage
    this.workflowStorage.set(workflow.id, workflow);
    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) has been added to the pool for deferred processing.`,
    );
  }

  /**
   * Cleans up completed workflows from the pool storage to free resources.
   * This method is used to remove workflows that have finished processing.
   *
   * @private
   */
  private cleanupCompletedWorkflows(): void {
    logger.info('Starting cleanup of completed workflows in the pool.');

    // Iterate over the workflow storage and remove completed workflows
    for (let [id, workflow] of this.workflowStorage) {
      if (workflow.state === WorkflowState.Completed) {
        logger.info(
          `Workflow ${workflow.name}(${workflow.id}) is completed and removed from pool storage.`,
        );

        // Remove the completed workflow from the pool storage
        this.workflowStorage.delete(id);
      }
    }
  }

  /**
   * Periodically processes workflows in the queue and cleans up completed ones.
   * This method is triggered by the heartbeat mechanism at regular intervals.
   *
   * @public
   * @async
   * @returns {Promise<void>} - A promise that resolves when the heartbeat cycle is complete.
   */
  public async heartbeat(): Promise<void> {
    let inProgressWorkflows = 0;

    // Iterate over workflows in the pool storage
    for (let [_, workflow] of this.workflowStorage) {
      try {
        // Process workflows that are not yet completed
        if (workflow.state !== WorkflowState.Completed) {
          inProgressWorkflows++;
          logger.info(
            `Starting to process workflow ${workflow.name}(${workflow.id}).`,
          );

          // Initialize the workflow container and execute the workflow handler chain
          await workflow.container?.init();
          const response = await workflow.workflowHandlerChain.handle(workflow);

          // Update the workflow in storage with the response
          this.workflowStorage.set(workflow.id, workflow);
        } else {
          // Log if the workflow is already completed and not processed again
          logger.info(
            `Workflow ${workflow.name}(${workflow.id}) has already completed.`,
          );
        }
      } catch (error: any) {
        const errorMessage = error?.message ?? 'Unknown error';
        // Log an error if workflow processing fails
        logger.error(
          `Error occurred during processing workflow ${workflow.name}(${workflow.id}): ${error.message}`,
          errorMessage,
        );
      }
    }

    // Perform cleanup of completed workflows if no workflows are in progress
    if (inProgressWorkflows === 0) {
      logger.info('No active workflows. Cleaning up completed workflows.');
      this.cleanupCompletedWorkflows();
    }
  }

  /**
   * Starts a periodic heartbeat to process workflows at regular intervals.
   * The heartbeat ensures that workflows are processed and completed workflows are cleaned up periodically.
   *
   * @param {number} intervalMs - The interval between heartbeats in milliseconds.
   * @public
   */
  public startHeartbeat(intervalMs: number): void {
    logger.info(
      `Starting periodic heartbeat with an interval of ${intervalMs}ms.`,
    );

    // Set an interval to invoke the heartbeat method periodically
    const interval = setInterval(async () => {
      try {
        await this.heartbeat(); // Call the heartbeat method to process workflows

        // Stop the heartbeat if no workflows are left in the pool
        if (this.workflowStorage.size === 0) {
          logger.info('No workflows left in the queue. Stopping heartbeat.');
          clearInterval(interval); // Stop the interval when all workflows are processed
        }
      } catch (error: any) {
        const errorMessage = error?.message ?? 'Unknown error';
        // Log any errors that occur during the heartbeat execution
        logger.error(
          `Error occurred during heartbeat execution: ${error.message}`,
          errorMessage,
        );
      }
    }, intervalMs); // Periodic interval in milliseconds (e.g., 5000 for 5 seconds)
  }
}
