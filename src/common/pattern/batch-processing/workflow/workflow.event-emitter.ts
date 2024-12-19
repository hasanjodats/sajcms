import { EventEmitter } from 'events';

// Define event names as constants or an enum
export enum WorkflowEvent {
  Start = 'START',
  Progress = 'PROGRESS',
  Failure = 'FAILURE',
  Complete = 'COMPLETE',
}

// /**
//  * The WorkflowEventEmitter fire event in each step of workflow execution.
//  */
export class WorkflowEventEmitter extends EventEmitter {
  // Add type-safe emit methods for better type checking
  emit(event: WorkflowEvent.Start, ...args: any[]): boolean;
  emit(event: WorkflowEvent.Progress, ...args: any[]): boolean;
  emit(event: WorkflowEvent.Failure, ...args: any[]): boolean;
  emit(event: WorkflowEvent.Complete, ...args: any[]): boolean;
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  on(event: WorkflowEvent.Start, listener: (...args: any[]) => void): this;
  on(event: WorkflowEvent.Progress, listener: (...args: any[]) => void): this;
  on(event: WorkflowEvent.Failure, listener: (...args: any[]) => void): this;
  on(event: WorkflowEvent.Complete, listener: (...args: any[]) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  once(event: WorkflowEvent.Start, listener: (...args: any[]) => void): this;
  once(event: WorkflowEvent.Progress, listener: (...args: any[]) => void): this;
  once(event: WorkflowEvent.Failure, listener: (...args: any[]) => void): this;
  once(event: WorkflowEvent.Complete, listener: (...args: any[]) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }
}
