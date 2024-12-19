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
 * The WorkflowDependencyExecutionHandler ensures that all dependencies of a workflow are successfully
 * executed before moving forward. It uses the Chain of Responsibility pattern, allowing seamless integration
 * with other workflow handlers
 */
export class WorkflowDependencyExecutionHandler extends WorkflowHandler {
  public async handle(workflow: Workflow): Promise<WorkflowResponse> {
    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) has started execute dependency.`,
    );
    const invoker = new WorkflowInvoker();

    try {
      /** Execute dependencies */
      if (workflow.dependencies && workflow.dependencies.length > 0) {
        for (const dependency of workflow.dependencies) {
          if (dependency.state !== WorkflowState.Completed) {
            logger.info(
              `Workflow ${workflow.name}(${workflow.id}) has started execute dependency ${dependency.name}(${dependency.id}).`,
            );
            const response = await invoker.run(dependency);
            logger.info(
              `Workflow ${workflow.name}(${workflow.id}) has executed dependency ${dependency.name}(${dependency.id}) and the response state is ${response.state}.`,
            );
            if (response.state === WorkflowResponseState.Pending) {
              return {
                state: WorkflowResponseState.Pending,
              };
            } else if (response.state === WorkflowResponseState.Failure) {
              return response;
            }
          }
        }
      }

      logger.info(
        `Workflow ${workflow.name}(${workflow.id}) has executed all dependencies successfully.`,
      );
      return super.handle(workflow);
    } catch (error: any) {
      const workflowError = new WorkflowError(
        workflow,
        WorkflowErrorType.WorkflowFailed,
        `Workflow ${workflow.name}(${workflow.id}) dependencies execution has failed: ${error.message}`,
        error,
      );
      logger.error(
        `Workflow ${workflow.name}(${workflow.id}) dependencies execution has failed:`,
        error,
      );
      return {
        state: WorkflowResponseState.Failure,
        error: workflowError,
      };
    }
  }
}
