import { EventEmitter } from 'events';

/**
 * @enum TaskEvent
 * Enum for different task events that can occur during task execution.
 * The task can emit events at various stages of its lifecycle.
 */
export enum TaskEvent {
  Start = 'START', // Emitted when the task starts.
  Progress = 'PROGRESS', // Emitted to indicate the ongoing progress of the task.
  Failure = 'FAILURE', // Emitted when the task fails.
  Complete = 'COMPLETE', // Emitted when the task completes successfully.
}

/**
 * The TaskEventEmitter class is an extension of the EventEmitter that is specifically designed
 * to handle task-related events such as start, progress, failure, and completion. It provides
 * methods to emit and listen to these events during the task execution lifecycle.
 *
 * It allows users to listen for and handle different stages of a task, making it easier to
 * track and respond to task status changes in a workflow.
 */
export class TaskEventEmitter extends EventEmitter {
  /**
   * Emits an event indicating the start of the task.
   *
   * @param event - The event type, such as `START`.
   * @param args - The arguments to pass with the event.
   * @returns boolean - Returns true if the event was successfully emitted.
   */
  emit(event: TaskEvent.Start, ...args: any[]): boolean;

  /**
   * Emits an event indicating the progress of the task.
   *
   * @param event - The event type, such as `PROGRESS`.
   * @param args - The arguments to pass with the event.
   * @returns boolean - Returns true if the event was successfully emitted.
   */
  emit(event: TaskEvent.Progress, ...args: any[]): boolean;

  /**
   * Emits an event indicating a failure in the task.
   *
   * @param event - The event type, such as `FAILURE`.
   * @param args - The arguments to pass with the event.
   * @returns boolean - Returns true if the event was successfully emitted.
   */
  emit(event: TaskEvent.Failure, ...args: any[]): boolean;

  /**
   * Emits an event indicating the completion of the task.
   *
   * @param event - The event type, such as `COMPLETE`.
   * @param args - The arguments to pass with the event.
   * @returns boolean - Returns true if the event was successfully emitted.
   */
  emit(event: TaskEvent.Complete, ...args: any[]): boolean;

  /**
   * Emits a generic event. This is the underlying implementation that is called by the other emit methods.
   *
   * @param event - The event name or symbol to emit.
   * @param args - The arguments to pass with the event.
   * @returns boolean - Returns true if the event was successfully emitted.
   */
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Registers a listener for the specified event. The listener is called whenever
   * the event is emitted.
   *
   * @param event - The event type to listen for, such as `START`, `PROGRESS`, `FAILURE`, or `COMPLETE`.
   * @param listener - The function to call when the event is emitted.
   * @returns this - The current instance of TaskEventEmitter for method chaining.
   */
  on(event: TaskEvent.Start, listener: (...args: any[]) => void): this;
  on(event: TaskEvent.Progress, listener: (...args: any[]) => void): this;
  on(event: TaskEvent.Failure, listener: (...args: any[]) => void): this;
  on(event: TaskEvent.Complete, listener: (...args: any[]) => void): this;
  /**
   * Registers a listener for a generic event. This method is called by the other `on` and `once` methods
   * for more specific event types.
   *
   * @param event - The event type or symbol to listen for.
   * @param listener - The function to call when the event is emitted.
   * @returns this - The current instance of TaskEventEmitter for method chaining.
   */
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * Registers a listener for the specified event, but the listener will only be called once.
   * After the first time the event is emitted, the listener is automatically removed.
   *
   * @param event - The event type to listen for, such as `START`, `PROGRESS`, `FAILURE`, or `COMPLETE`.
   * @param listener - The function to call when the event is emitted.
   * @returns this - The current instance of TaskEventEmitter for method chaining.
   */
  once(event: TaskEvent.Start, listener: (...args: any[]) => void): this;
  once(event: TaskEvent.Progress, listener: (...args: any[]) => void): this;
  once(event: TaskEvent.Failure, listener: (...args: any[]) => void): this;
  once(event: TaskEvent.Complete, listener: (...args: any[]) => void): this;
  /**
   * Registers a listener for a generic event that will only be triggered once.
   * This method is called by the other `once` methods for more specific event types.
   *
   * @param event - The event type or symbol to listen for.
   * @param listener - The function to call when the event is emitted.
   * @returns this - The current instance of TaskEventEmitter for method chaining.
   */
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }
}
