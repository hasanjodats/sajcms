import { WorkflowError, WorkflowErrorType } from '@common/error/workflow.error';
import { WorkflowResponseState } from '@common/pattern/batch-processing/workflow/workflow';
import {
  Workflow,
  WorkflowResponse,
} from '@common/pattern/batch-processing/workflow/workflow';
import { WorkflowHandler } from '@common/pattern/batch-processing/workflow/workflow.handler';
import { logger } from '@common/logger/winston.logger';

/**
 * Centralized error messages for workflow validation.
 */
const ValidationErrorMessages = {
  MissingIdentification: (workflow: Workflow) =>
    `Workflow ${workflow.name}(${workflow.id}) must have a valid ID and Name.`,
  MissingContainer: (workflow: Workflow) =>
    `Workflow ${workflow.name}(${workflow.id}) of type deferred must have a valid container.`,
  UnknownError: 'Unknown error occurred.',
};

/**
 * @class WorkflowValidationHandler
 * The WorkflowValidationHandler class ensures that workflows must have both an id and a name. If these properties
 * are missing, it returns an error with the WorkflowErrorType.ValidationFailed type. If the validation passes, it
 * allows the workflow to proceed to the next handler in the chain.
 */
export class WorkflowValidationHandler extends WorkflowHandler {
  /**
   * Validates the identification properties of a workflow (id and name).
   * @param workflow - The workflow to validate.
   * @throws WorkflowError if validation fails.
   */
  private validateWorkflowIdentification(workflow: Workflow): void {
    if (!workflow.name || !workflow.id) {
      throw new WorkflowError(
        workflow,
        WorkflowErrorType.ValidationFailed,
        ValidationErrorMessages.MissingIdentification(workflow),
      );
    }
  }

  /**
   * Validates the configuration properties of a workflow (e.g., JIT and container).
   * @param workflow - The workflow to validate.
   * @throws WorkflowError if validation fails.
   */
  private validateWorkflowConfiguration(workflow: Workflow): void {
    if (!workflow.config?.JIT && !workflow.container) {
      throw new WorkflowError(
        workflow,
        WorkflowErrorType.ValidationFailed,
        ValidationErrorMessages.MissingContainer(workflow),
      );
    }
  }

  /**
   * Handles validation for the given workflow.
   * @param workflow - The workflow to validate.
   * @returns A promise resolving to a WorkflowResponse.
   */
  async handle(workflow: Workflow): Promise<WorkflowResponse> {
    try {
      logger.info(
        `Workflow ${workflow.name}(${workflow.id}) validation has started.`,
      );

      // Perform validations
      this.validateWorkflowIdentification(workflow);
      this.validateWorkflowConfiguration(workflow);

      logger.info(
        `Workflow ${workflow.name}(${workflow.id}) has passed validation.`,
      );
      return super.handle(workflow);
    } catch (error: unknown) {
      const workflowError = new WorkflowError(
        workflow,
        WorkflowErrorType.ValidationFailed,
        error instanceof Error
          ? error.message
          : ValidationErrorMessages.UnknownError,
      );
      logger.error(
        `An unexpected error occurred during validation of workflow ${workflow.name}(${workflow.id}).`,
        workflowError,
      );
      return {
        state: WorkflowResponseState.Failure,
        error: workflowError,
      };
    }
  }
}
