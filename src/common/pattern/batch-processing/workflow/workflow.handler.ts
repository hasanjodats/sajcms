import { GeneralError } from '@common/error/general.error';
import {
  Workflow,
  WorkflowResponse,
  WorkflowResponseState,
} from '@common/pattern/batch-processing/workflow/workflow';

/**
 * @class WorkflowHandler
 * The WorkflowHandler class is part of a chain of responsibility that processes workflows. It allows multiple handlers
 * to be linked together, with each handler either processing the workflow or passing it on to the next handler. If
 * there is no handler left in the chain, it returns a failure response. The class provides a method to link
 * handlers (setNext) and a method to process the workflow (handle)
 */
export abstract class WorkflowHandler {
  /** This property holds the next handler in the chain. If there is another handler in the chain, it will be set
   * to that handler; otherwise, it will be undefined.
   */
  private nextHandler?: WorkflowHandler;

  /**
   * This method is used to link a WorkflowHandler to the next handler in the chain. It sets the nextHandler property
   * to the provided handler and returns the handler. This allows the handlers to be chained together
   * @param handler - An instance of WorkflowHandler class
   * @returns {WorkflowHandler}
   */
  setNext(handler: WorkflowHandler): WorkflowHandler {
    this.nextHandler = handler;
    return handler;
  }

  /**
   * This is the core method of the WorkflowHandler class. It processes the provided workflow and returns
   * a WorkflowResponse. If there is a next handler in the chain (i.e., nextHandler is not undefined), it
   * calls the handle method of the next handler and passes the workflow to it. If there is no next handler
   * (i.e., nextHandler is undefined), the method returns a failure response with a GeneralError indicating
   * that no handler is available for the workflow.
   * @param workflow - An instance of a workflow
   * @returns {Promise<WorkflowResponse>}
   */
  async handle(workflow: Workflow): Promise<WorkflowResponse> {
    if (this.nextHandler) {
      return await this.nextHandler.handle(workflow);
    }
    return {
      state: WorkflowResponseState.Success,
      error: new GeneralError(
        'NoHandlerError',
        `No handler available for workflow ${workflow.name}.`,
      ),
    };
  }
}
