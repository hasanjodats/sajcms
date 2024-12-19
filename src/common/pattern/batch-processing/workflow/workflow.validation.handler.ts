import { WorkflowError, WorkflowErrorType } from '@common/error/workflow.error';
import { WorkflowResponseState } from '@common/pattern/batch-processing/workflow/workflow';
import {
  Workflow,
  WorkflowResponse,
} from '@common/pattern/batch-processing/workflow/workflow';
import { WorkflowHandler } from '@common/pattern/batch-processing/workflow/workflow.handler';
import { logger } from '@common/logger/winston.logger';

/**
 * @class WorkflowValidationHandler
 * The WorkflowValidationHandler class ensures that workflows must have both an id and a name. If these properties
 * are missing, it returns an error with the WorkflowErrorType.ValidationFailed type. If the validation passes, it
 * allows the workflow to proceed to the next handler in the chain.
 */
export class WorkflowValidationHandler extends WorkflowHandler {
  async handle(workflow: Workflow): Promise<WorkflowResponse> {
    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) validation has started.`,
    );
    if (!workflow.name || !workflow.id) {
      logger.info(
        `Workflow ${workflow.name}(${workflow.id}) validation has failed.`,
      );
      return {
        state: WorkflowResponseState.Failure,
        error: new WorkflowError(
          workflow,
          WorkflowErrorType.ValidationFailed,
          `Workflow ${workflow.name}(${workflow.id}) must have a valid ID and Name.`,
        ),
      };
    }
    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) has passed validation.`,
    );
    return super.handle(workflow);
  }
}
