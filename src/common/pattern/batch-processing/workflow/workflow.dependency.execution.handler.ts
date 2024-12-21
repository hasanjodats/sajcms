import { WorkflowError, WorkflowErrorType } from '@common/error/workflow.error';
import { logger } from '@common/logger/winston.logger';
import {
  Workflow,
  WorkflowResponse,
  WorkflowResponseState,
  WorkflowState,
} from '@common/pattern/batch-processing/workflow/workflow';
import { WorkflowHandler } from '@common/pattern/batch-processing/workflow/workflow.handler';
import { WorkflowInvoker } from '@common/pattern/batch-processing/workflow/workflow.invoker';

/**
 * The WorkflowDependencyExecutionHandler class is responsible for executing the dependencies of a workflow.
 * This class uses the Chain of Responsibility pattern, allowing seamless integration with other workflow handlers
 * to ensure that all dependencies are executed successfully before moving forward in the workflow process.
 */
export class WorkflowDependencyExecutionHandler extends WorkflowHandler {
  /**
   * Main method that executes the dependencies of the workflow and returns the result.
   * It first checks if dependencies need to be executed, and then processes each dependency in sequence.
   * If an error occurs or the status is "Pending" during the execution of any dependency, the process stops.
   *
   * @param {Workflow} workflow - The workflow object whose dependencies need to be executed.
   * @returns {Promise<WorkflowResponse>} - The response of the workflow after executing its dependencies.
   */
  public async handle(workflow: Workflow): Promise<WorkflowResponse> {
    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) has started executing dependencies.`,
    );

    const invoker = new WorkflowInvoker(); // Create an invoker object to execute dependencies

    try {
      // Check and execute dependencies
      if (workflow.dependencies && workflow.dependencies.length > 0) {
        for (const dependency of workflow.dependencies) {
          // If the dependency's state is not "Completed", it needs to be executed
          if (dependency.state !== WorkflowState.Completed) {
            logger.info(
              `Workflow ${workflow.name}(${workflow.id}) is executing dependency ${dependency.name}(${dependency.id}).`,
            );
            const response = await invoker.run(dependency); // Execute the dependency

            // Handle the dependency's response
            const result = this.handleDependencyResponse(
              response,
              workflow,
              dependency,
            );
            if (result) {
              // If the response is "Pending" or "Failure", the process will stop
              return result;
            }
          }
        }
      }

      // If all dependencies were executed successfully, proceed to the next handler in the chain
      logger.info(
        `Workflow ${workflow.name}(${workflow.id}) has executed all dependencies successfully.`,
      );
      return super.handle(workflow);
    } catch (error: any) {
      // If an error occurs while executing dependencies, log the error and return a failure response
      const workflowError = new WorkflowError(
        workflow,
        WorkflowErrorType.WorkflowFailed,
        `Workflow ${workflow.name}(${workflow.id}) dependencies execution has failed: ${error.message}`,
        error,
      );
      logger.error(
        `Workflow ${workflow.name}(${workflow.id}) dependencies execution failed:`,
        error,
      );
      return {
        state: WorkflowResponseState.Failure,
        error: workflowError,
      };
    }
  }

  /**
   * Helper method to handle the response of dependencies.
   * This method processes the response and determines whether the workflow can continue or needs to stop.
   *
   * @param {WorkflowResponse} response - The response object from executing a dependency.
   * @param {Workflow} workflow - The workflow being executed.
   * @param {Workflow} dependency - The current dependency being executed.
   * @returns {WorkflowResponse | null} - The response to be returned, or null if the process should continue.
   */
  private handleDependencyResponse(
    response: WorkflowResponse,
    workflow: Workflow,
    dependency: Workflow,
  ): WorkflowResponse | null {
    // If the response is "Pending", return a pending response and stop further execution
    if (response.state === WorkflowResponseState.Pending) {
      return {
        state: WorkflowResponseState.Pending,
      };
    }

    // If the response is "Failure", return the failure response and stop further execution
    if (response.state === WorkflowResponseState.Failure) {
      return response;
    }

    // If the response is successful, continue processing
    return null;
  }
}
