import {
  Workflow,
  WorkflowState,
} from '@common/pattern/batch-processing/workflow/workflow';
import { logger } from '@common/logger/winston.logger';
import { WorkflowError, WorkflowErrorType } from '@common/error/workflow.error';

/**
 * @class PoolProcessor
 * PoolProcessor class is designed to manage workflows that are not executed immediately (as with JIT workflows) but are instead queued for batch processing.
 * Uses a heartbeat mechanism for periodic execution and cleanup.
 */
export class PoolProcessor {
  private workflowStorage: Map<string, Workflow>; // This will simulate storage

  public constructor() {
    this.workflowStorage = new Map(); // Use an in-memory map for storage simulation
  }

  /**
   * Manage the execution of workflows that are processed in a pool rather than immediately upon creation.
   * @returns
   * @public
   */

  /**
   * Adds a workflow to the processing queue.
   * @param workflow - The workflow to be added to the queue.
   * @throws {Error} If the workflow already exists in the storage.
   */
  public addWorkflow(workflow: Workflow) {
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
      throw error;
    }
    this.workflowStorage.set(workflow.id, workflow);
    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) has added to pool for process in defered mode.`,
    );
  }

  /**
   * Cleans up completed workflows from storage to free resources.
   * @private
   */
  private cleanupCompletedWorkflows(): void {
    logger.info('Start cleaning up pool workflow storage.');
    for (let [id, workflow] of this.workflowStorage) {
      if (workflow.state === WorkflowState.Completed) {
        logger.info(
          `Wrkflow ${workflow.name}(${workflow.id}) has completed and removed from pool workflow storage.`,
        );

        this.workflowStorage.delete(id); // Remove completed workflow from storage
      }
    }
  }

  /**
   * Processes workflows in the queue and cleans up completed workflows.
   * Called periodically by the heartbeat mechanism.
   * @public
   * @async
   * @returns {Promise<void>}
   */
  public async heartbeat(): Promise<void> {
    // Track workflows that are still in progress
    let inProgressWorkflows = 0;
    for (let [_, workflow] of this.workflowStorage) {
      try {
        if (workflow.state !== WorkflowState.Completed) {
          inProgressWorkflows++;
          logger.info(
            `Start processing workflow ${workflow.name}(${workflow.id}).`,
          );
          const response = await workflow.workflowHandlerChain.handle(workflow);
          this.workflowStorage.set(workflow.id, workflow); // Update the workflow in storage
        } else {
          logger.info(
            `Workflow ${workflow.name}(${workflow.id}) is already completed.`,
          );
        }
      } catch (error: any) {
        logger.error(
          `Error occured during processing workflow ${workflow.name}(${workflow.id}). ${error.message}`,
          error,
        );
      }
    }

    // Perform cleanup of completed workflows after each heartbeat
    if (inProgressWorkflows === 0) {
      logger.info('No active workflow.');
      this.cleanupCompletedWorkflows();
    }
  }

  /**
   * Starts a periodic heartbeat to process workflows.
   * @param intervalMs - Interval between heartbeats in milliseconds.
   * @public
   */
  public startHeartbeat(intervalMs: number): void {
    logger.info(`Starting periodic heartbeat with interval: ${intervalMs}ms.`);
    const interval = setInterval(async () => {
      try {
        await this.heartbeat(); // Call the heartbeat method periodically

        if (this.workflowStorage.size === 0) {
          logger.info('No workflows left in the queue. Stopping heartbeat.');
          clearInterval(interval);
        }
      } catch (error: any) {
        logger.error(
          `Error occured during heartbeat execution. ${error.message}`,
          error,
        );
      }
    }, intervalMs); // Interval in milliseconds (e.g., 5000 for 5 seconds)
  }
}
