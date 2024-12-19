import { EventEmitter } from 'events';

export enum TaskEvent {
  Start = 'START',
  Progress = 'PROGRESS',
  Failure = 'FAILURE',
  Complete = 'COMPLETE',
}

// /**
//  * The TaskEventEmitter fire event in each step of task execution.
//  */
export class TaskEventEmitter extends EventEmitter {
  emit(event: TaskEvent.Start, ...args: any[]): boolean;
  emit(event: TaskEvent.Progress, ...args: any[]): boolean;
  emit(event: TaskEvent.Failure, ...args: any[]): boolean;
  emit(event: TaskEvent.Complete, ...args: any[]): boolean;
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  on(event: TaskEvent.Start, listener: (...args: any[]) => void): this;
  on(event: TaskEvent.Progress, listener: (...args: any[]) => void): this;
  on(event: TaskEvent.Failure, listener: (...args: any[]) => void): this;
  on(event: TaskEvent.Complete, listener: (...args: any[]) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  once(event: TaskEvent.Start, listener: (...args: any[]) => void): this;
  once(event: TaskEvent.Progress, listener: (...args: any[]) => void): this;
  once(event: TaskEvent.Failure, listener: (...args: any[]) => void): this;
  once(event: TaskEvent.Complete, listener: (...args: any[]) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }
}
