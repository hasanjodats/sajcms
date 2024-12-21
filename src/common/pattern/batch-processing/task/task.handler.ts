import { GeneralError } from '@common/error/general.error';
import {
  TaskResponseState,
  Task,
  TaskResponse,
} from '@common/pattern/batch-processing/task/task';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';

/**
 * @class TaskHandler
 * The TaskHandler class is part of the Chain of Responsibility pattern. It allows tasks to be processed
 * by multiple handlers in a sequence. Each handler either processes the task or passes it on to the next handler
 * in the chain. If no handler is available, a success response is returned.
 *
 * Handlers can be linked using the setNext method, and tasks can be processed using the handle method.
 */
export abstract class TaskHandler {
  /** Holds the next handler in the chain. If there is another handler, it will be set to that handler; otherwise, it is undefined. */
  private nextHandler?: TaskHandler;

  /**
   * Links the current handler to the next handler in the chain.
   *
   * This method sets the nextHandler property to the provided handler and returns the handler itself.
   * This allows the handlers to be chained together in a sequence.
   *
   * @param handler - An instance of the TaskHandler class to be linked as the next handler in the chain.
   * @returns {TaskHandler} - Returns the handler that was set as the next handler.
   */
  setNext(handler: TaskHandler): TaskHandler {
    this.nextHandler = handler;
    return handler;
  }

  /**
   * Processes the provided task by passing it through the chain of handlers.
   *
   * This is the core method that checks if there is a next handler in the chain. If there is, it calls
   * the handle method of the next handler and passes the task along. If no handler is available (i.e., nextHandler is undefined),
   * it returns a success response with a GeneralError indicating that no handler is available for the task.
   *
   * @param task - The task instance that needs to be processed.
   * @param workflow - The workflow that contains the context for the task.
   * @returns {Promise<TaskResponse>} - A promise that resolves to a TaskResponse object, indicating the success or failure of task processing.
   */
  async handle(task: Task, workflow: Workflow): Promise<TaskResponse> {
    if (this.nextHandler) {
      // Pass the task to the next handler in the chain.
      return await this.nextHandler.handle(task, workflow);
    }

    // If there is no next handler, return a success response with an error.
    return {
      state: TaskResponseState.Success, // Keeping the state as Success
      error: new GeneralError(
        'NoHandlerError',
        `No handler available for task ${task.name}.`, // The error message indicating no handler is found.
      ),
    };
  }
}
