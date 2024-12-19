// import { WorkflowRunner } from '@common/framework/workflow/workflow.runner';
// import {
//   GeneralResponse,
//   ResponseState,
//   Task,
//   Workflow,
// } from '@common/framework/workflow/workflow.module';

import { logger } from '@common/logger/winston.logger';
import {
  Task,
  TaskResponseState,
} from '@common/pattern/batch-processing/task/task';
import { TaskDependencyCheckHandler } from '@common/pattern/batch-processing/task/task.dependency.check.handler';
import { TaskDependencyExecutionHandler } from '@common/pattern/batch-processing/task/task.dependency.execution.handler';
import { TaskEventEmitter } from '@common/pattern/batch-processing/task/task.event-emitter';
import { TaskExecutionHandler } from '@common/pattern/batch-processing/task/task.execution.handler';
import { TaskValidationHandler } from '@common/pattern/batch-processing/task/task.validation.handler';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';
import { WorkflowDependencyExecutionHandler } from '@common/pattern/batch-processing/workflow/workflow.dependency.execution.handler';
import { WorkflowEnsureTasksCompletedHandler } from '@common/pattern/batch-processing/workflow/workflow.ensure.tasks.completed.handler';
import { WorkflowEventEmitter } from '@common/pattern/batch-processing/workflow/workflow.event-emitter';
import { WorkflowExecutionHandler } from '@common/pattern/batch-processing/workflow/workflow.execution.handler';
import { WorkflowInvoker } from '@common/pattern/batch-processing/workflow/workflow.invoker';
import { WorkflowValidationHandler } from '@common/pattern/batch-processing/workflow/workflow.validation.handler';

// const workflowRunner = new WorkflowRunner();

// const workflow: Workflow = new Workflow({
//   config: {
//     JIT: true,
//     hooks: {
//       onProgress: (workflow: Workflow, progress: number): void => {
//         console.log(`${workflow.name} progress: ${progress}%`);
//       },
//       onSuccess: (workflow: Workflow, result: any): void => {
//         console.log(workflow);
//         console.log(`${workflow.name} result:`, result);
//       },
//     },
//   },

//   dependencies: [
//     new Workflow({
//       tasks: [
//         new Task({
//           action: async (
//             task: Task,
//             workflow: Workflow,
//           ): Promise<GeneralResponse> => {
//             const name: string = 'reza';
//             return {
//               state: ResponseState.Success,
//               result: name,
//             };
//           },
//         }),
//       ],
//     }),
//   ],
//   tasks: [
//     new Task({
//       order: 1,
//       action: async (
//         task: Task,
//         workflow: Workflow,
//       ): Promise<GeneralResponse> => {
//         const name: string = 'hasan';
//         return {
//           state: ResponseState.Success,
//           result: name,
//         };
//       },
//     }),
//     new Task({
//       order: 0,
//       action: async (
//         task: Task,
//         workflow: Workflow,
//       ): Promise<GeneralResponse> => {
//         const name: string = 'liana';
//         return {
//           state: ResponseState.Success,
//           result: name,
//         };
//       },
//     }),
//   ],
// });

// workflowRunner.run(workflow).then((response) => console.log(response));

// const workflow2: Workflow = new Workflow({
//   config: {
//     JIT: false,
//     hooks: {
//       onProgress: (workflow: Workflow, progress: number): void => {
//         console.log(`${workflow.name} progress: ${progress}%`);
//       },
//       onSuccess: (workflow: Workflow, result: any): void => {
//         console.log(workflow);
//         console.log(`${workflow.name} result:`, result);
//       },
//     },
//   },
//   tasks: [
//     new Task({
//       order: 1,
//       action: async (
//         task: Task,
//         workflow: Workflow,
//       ): Promise<GeneralResponse> => {
//         const name: string = 'liana';
//         return {
//           state: ResponseState.Success,
//           result: name,
//         };
//       },
//     }),
//     new Task({
//       order: 0,
//       action: async (
//         task: Task,
//         workflow: Workflow,
//       ): Promise<GeneralResponse> => {
//         if (task.config?.execution?.state?.progress === 10) {
//           return {
//             state: ResponseState.Success,
//             result: {
//               name: 'done',
//             },
//           };
//         }
//         return {
//           state: ResponseState.Pending,
//           result: {
//             progress: 10,
//             lastExecutedTime: Date.now,
//           },
//         };
//       },
//     }),
//   ],
// });

// workflowRunner.run(workflow2).then((response) => console.log(response));

const taskHandlers = new TaskValidationHandler();
const workflowHandlers = new WorkflowValidationHandler();
taskHandlers
  .setNext(new TaskDependencyExecutionHandler())
  .setNext(new TaskDependencyCheckHandler())
  .setNext(new TaskExecutionHandler());

workflowHandlers
  .setNext(new WorkflowDependencyExecutionHandler())
  .setNext(new WorkflowExecutionHandler())
  .setNext(new WorkflowEnsureTasksCompletedHandler());

const taskEvent: TaskEventEmitter = new TaskEventEmitter();
taskEvent.on('success', (task, result) => {
  logger.info(
    `Task ${task.name}(${task.id}) succeeded with result: ${JSON.stringify(result)}`,
  );
});

taskEvent.on('failure', (task, error) => {
  logger.error(`Task ${task.name}(${task.id}) failed with error:`, error);
});

taskEvent.on('progress', (task, progress) => {
  logger.info(`Task ${task.name}(${task.id}) progress: ${progress}%`);
});
const workflowEvent: WorkflowEventEmitter = new WorkflowEventEmitter();

workflowEvent.on('success', (workflow, result) => {
  logger.info(
    `Workflow ${workflow.name}(${workflow.id}) succeeded with result: ${JSON.stringify(result)}`,
  );
});

workflowEvent.on('failure', (workflow, error) => {
  logger.error(
    `Workflow ${workflow.name}(${workflow.id}) failed with error:`,
    error,
  );
});

workflowEvent.on('progress', (workflow, progress) => {
  logger.info(
    `Workflow ${workflow.name}(${workflow.id}) progress: ${progress}%`,
  );
});

const workflow1 = new Workflow({
  name: 'Workflow1',
  id: 'W_1',
  config: { JIT: false },
  tasks: [
    new Task({
      name: 'Task1',
      id: 'T_1',
      action: async (task, workflow) => {
        if (task.config?.execution?.state?.progress === 10) {
          return {
            state: TaskResponseState.Success,
            result: 'Task 1 completed.',
          };
        } else {
          task.progress(10);
          return {
            state: TaskResponseState.Pending,
            result: 'Task 1 Pending.',
          };
        }
      },
      events: taskEvent,
    }),
    new Task({
      name: 'Task2',
      id: 'T_2',
      action: async (task, workflow) => ({
        state: TaskResponseState.Success,
        result: 'Task 2 completed.',
      }),
      events: taskEvent,
    }),
  ],
  taskHandlerChain: taskHandlers,
  workflowHandlerChain: workflowHandlers,
  events: workflowEvent,
});

const workflow2 = new Workflow({
  name: 'Workflow2',
  id: 'W_2',
  config: { JIT: true },
  tasks: [
    new Task({
      name: 'Task3',
      id: 'T_3',
      action: async (task, workflow) => ({
        state: TaskResponseState.Success,
        result: 'Task 3 completed.',
      }),
      events: taskEvent,
      dependencies: [workflow1],
    }),
    new Task({
      name: 'Task4',
      id: 'T_4',
      action: async (task, workflow) => ({
        state: TaskResponseState.Success,
        result: 'Task 4 completed.',
      }),
      events: taskEvent,
    }),
  ],
  taskHandlerChain: taskHandlers,
  workflowHandlerChain: workflowHandlers,
  events: workflowEvent,
});

// تعریف Invoker
const invoker = new WorkflowInvoker();

// اجرای Workflow
invoker.run(workflow1);
