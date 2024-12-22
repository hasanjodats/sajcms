import { EventEmitter } from 'events';

/**
 * @enum WorkflowEvent
 * Enum for different workflow events that can occur during workflow execution.
 * The workflow can emit events at various stages of its lifecycle.
 */
export enum WorkflowEvent {
  Start = 'START', // Emitted when the workflow starts.
  Progress = 'PROGRESS', // Emitted to indicate the ongoing progress of the workflow.
  Failure = 'FAILURE', // Emitted when the workflow fails.
  Complete = 'COMPLETE', // Emitted when the workflow completes successfully.
}

/**
 * The WorkflowEventEmitter class is an extension of the EventEmitter that is specifically designed
 * to handle workflow-related events such as start, progress, failure, and completion. It provides
 * methods to emit and listen to these events during the workflow execution lifecycle.
 *
 * It allows users to listen for and handle different stages of a workflow, making it easier to
 * track and respond to workflow status changes.
 */
export class WorkflowEventEmitter extends EventEmitter {
  /**
   * Emits an event indicating the start of the workflow.
   *
   * @param event - The event type, such as `START`.
   * @param args - The arguments to pass with the event.
   * @returns boolean - Returns true if the event was successfully emitted.
   */
  emit(event: WorkflowEvent.Start, ...args: unknown[]): boolean;

  /**
   * Emits an event indicating the progress of the workflow.
   *
   * @param event - The event type, such as `PROGRESS`.
   * @param args - The arguments to pass with the event.
   * @returns boolean - Returns true if the event was successfully emitted.
   */
  emit(event: WorkflowEvent.Progress, ...args: unknown[]): boolean;

  /**
   * Emits an event indicating a failure in the workflow.
   *
   * @param event - The event type, such as `FAILURE`.
   * @param args - The arguments to pass with the event.
   * @returns boolean - Returns true if the event was successfully emitted.
   */
  emit(event: WorkflowEvent.Failure, ...args: unknown[]): boolean;

  /**
   * Emits an event indicating the completion of the workflow.
   *
   * @param event - The event type, such as `COMPLETE`.
   * @param args - The arguments to pass with the event.
   * @returns boolean - Returns true if the event was successfully emitted.
   */
  emit(event: WorkflowEvent.Complete, ...args: unknown[]): boolean;

  /**
   * Emits a generic event. This is the underlying implementation that is called by the other emit methods.
   *
   * @param event - The event name or symbol to emit.
   * @param args - The arguments to pass with the event.
   * @returns boolean - Returns true if the event was successfully emitted.
   */
  emit(event: string | symbol, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Registers a listener for the specified event. The listener is called whenever
   * the event is emitted.
   *
   * @param event - The event type to listen for, such as `START`, `PROGRESS`, `FAILURE`, or `COMPLETE`.
   * @param listener - The function to call when the event is emitted.
   * @returns this - The current instance of WorkflowEventEmitter for method chaining.
   */
  on(event: WorkflowEvent.Start, listener: (...args: unknown[]) => void): this;
  on(event: WorkflowEvent.Progress, listener: (...args: unknown[]) => void): this;
  on(event: WorkflowEvent.Failure, listener: (...args: unknown[]) => void): this;
  on(event: WorkflowEvent.Complete, listener: (...args: unknown[]) => void): this;
  /**
   * Registers a listener for a generic event. This method is called by the other `on` and `once` methods
   * for more specific event types.
   *
   * @param event - The event type or symbol to listen for.
   * @param listener - The function to call when the event is emitted.
   * @returns this - The current instance of WorkflowEventEmitter for method chaining.
   */
  on(event: string | symbol, listener: (...args: unknown[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * Registers a listener for the specified event, but the listener will only be called once.
   * After the first time the event is emitted, the listener is automatically removed.
   *
   * @param event - The event type to listen for, such as `START`, `PROGRESS`, `FAILURE`, or `COMPLETE`.
   * @param listener - The function to call when the event is emitted.
   * @returns this - The current instance of WorkflowEventEmitter for method chaining.
   */
  once(event: WorkflowEvent.Start, listener: (...args: unknown[]) => void): this;
  once(event: WorkflowEvent.Progress, listener: (...args: unknown[]) => void): this;
  once(event: WorkflowEvent.Failure, listener: (...args: unknown[]) => void): this;
  once(event: WorkflowEvent.Complete, listener: (...args: unknown[]) => void): this;
  /**
   * Registers a listener for a generic event that will only be triggered once.
   * This method is called by the other `once` methods for more specific event types.
   *
   * @param event - The event type or symbol to listen for.
   * @param listener - The function to call when the event is emitted.
   * @returns this - The current instance of WorkflowEventEmitter for method chaining.
   */
  once(event: string | symbol, listener: (...args: unknown[]) => void): this {
    return super.once(event, listener);
  }
}
