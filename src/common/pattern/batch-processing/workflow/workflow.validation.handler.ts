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
 * The WorkflowValidationHandler class ensures that workflows have the necessary properties to be valid.
 * It checks that both `id` and `name` are defined. For deferred workflows (non-JIT), it also verifies
 * that a valid container is present.
 * If any validation fails, the workflow is rejected with an error.
 * If validation passes, it allows the workflow to proceed to the next handler in the chain.
 */
export class WorkflowValidationHandler extends WorkflowHandler {
  /**
   * Handles the validation of a workflow.
   * - Checks if the workflow has both an id and name.
   * - Verifies that deferred workflows (non-JIT) have a valid container.
   *
   * @param {Workflow} workflow - The workflow to validate.
   * @returns {Promise<WorkflowResponse>} The validation result with a response indicating success or failure.
   */
  async handle(workflow: Workflow): Promise<WorkflowResponse> {
    logger.info(
      `Starting validation for workflow ${workflow.name}(${workflow.id}).`,
    );

    // Check if the workflow has both a valid name and ID
    if (!workflow.name || !workflow.id) {
      logger.info(
        `Validation failed for workflow ${workflow.name}(${workflow.id}): Missing name or ID.`,
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

    // For non-JIT workflows, check if a valid container exists
    if (!workflow.config?.JIT && !workflow.container) {
      logger.info(
        `Validation failed for workflow ${workflow.name}(${workflow.id}): Missing container for deferred workflow.`,
      );
      return {
        state: WorkflowResponseState.Failure,
        error: new WorkflowError(
          workflow,
          WorkflowErrorType.ValidationFailed,
          `Workflow ${workflow.name}(${workflow.id}) of type deferred must have a valid container.`,
        ),
      };
    }

    // If all validations pass, log success and proceed to the next handler
    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) passed validation successfully.`,
    );
    return super.handle(workflow);
  }
}
