import { GeneralError } from '@common/error/general.error';
import {
  TaskResponseState,
  Task,
  TaskResponse,
} from '@common/pattern/batch-processing/task/task';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';

/**
 * @class TaskHandler
 * The TaskHandler class is part of a chain of responsibility that processes tasks. It allows multiple handlers
 * to be linked together, with each handler either processing the task or passing it on to the next handler. If
 * there is no handler left in the chain, it returns a failure response. The class provides a method to link
 * handlers (setNext) and a method to process the tasks (handle)
 */
export abstract class TaskHandler {
  /** This property holds the next handler in the chain. If there is another handler in the chain, it will be set
   * to that handler; otherwise, it will be undefined.
   */
  private nextHandler?: TaskHandler;

  /**
   * This method is used to link a TaskHandler to the next handler in the chain. It sets the nextHandler property
   * to the provided handler and returns the handler. This allows the handlers to be chained together
   * @param handler - An instance of TaskHandler class
   * @returns {TaskHandler}
   */
  setNext(handler: TaskHandler): TaskHandler {
    this.nextHandler = handler;
    return handler;
  }

  /**
   * This is the core method of the TaskHandler class. It processes the provided task and returns
   * a TaskResponse. If there is a next handler in the chain (i.e., nextHandler is not undefined), it
   * calls the handle method of the next handler and passes the task to it. If there is no next handler
   * (i.e., nextHandler is undefined), the method returns a failure response with a GeneralError indicating
   * that no handler is available for the task.
   * @param task - An instance of a task
   * @param workflow - An instance of a taks's workflow
   * @returns {Promise<TaskResponse>}
   */
  async handle(task: Task, workflow: Workflow): Promise<TaskResponse> {
    if (this.nextHandler) {
      return await this.nextHandler.handle(task, workflow);
    }
    return {
      state: TaskResponseState.Success,
      error: new GeneralError(
        'NoHandlerError',
        `No handler available for task ${task.name}.`,
      ),
    };
  }
}
