import { logger } from '@common/logger/winston.logger';
import {
  Task,
  TaskResponseState,
} from '@common/pattern/batch-processing/task/task';
import { TaskDependencyCheckHandler } from '@common/pattern/batch-processing/task/task.dependency.check.handler';
import { TaskDependencyExecutionHandler } from '@common/pattern/batch-processing/task/task.dependency.execution.handler';
import {
  TaskEvent,
  TaskEventEmitter,
} from '@common/pattern/batch-processing/task/task.event-emitter';
import { TaskExecutionHandler } from '@common/pattern/batch-processing/task/task.execution.handler';
import { TaskValidationHandler } from '@common/pattern/batch-processing/task/task.validation.handler';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';
import { WorkflowDependencyExecutionHandler } from '@common/pattern/batch-processing/workflow/workflow.dependency.execution.handler';
import { WorkflowEnsureTasksCompletedHandler } from '@common/pattern/batch-processing/workflow/workflow.ensure.tasks.completed.handler';
import {
  WorkflowEvent,
  WorkflowEventEmitter,
} from '@common/pattern/batch-processing/workflow/workflow.event-emitter';
import { WorkflowExecutionHandler } from '@common/pattern/batch-processing/workflow/workflow.execution.handler';
import { WorkflowInvoker } from '@common/pattern/batch-processing/workflow/workflow.invoker';
import { WorkflowValidationHandler } from '@common/pattern/batch-processing/workflow/workflow.validation.handler';
import dataProcessingAction from '@core/actions/data.processing.action';
import { CoreActionList } from '@core/actions/action.list';
import { CoreActionContainer } from '@core/actions/action.container';

CoreActionContainer.registerAction(dataProcessingAction, { multiplier: 3 });

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
taskEvent.on(TaskEvent.Complete, (task, result) => {
  logger.info(
    `Task ${task.name}(${task.id}) completed with result: ${JSON.stringify(result)}`,
  );
});

taskEvent.on(TaskEvent.Start, (task) => {
  logger.info(`Task ${task.name}(${task.id}) has started.`);
});

taskEvent.on(TaskEvent.Failure, (task, error) => {
  logger.info(`Task ${task.name}(${task.id}) failed with error:`, error);
});

taskEvent.on(TaskEvent.Progress, (task, progress) => {
  logger.info(`Task ${task.name}(${task.id}) progress: ${progress}%`);
});
const workflowEvent: WorkflowEventEmitter = new WorkflowEventEmitter();

workflowEvent.on(WorkflowEvent.Complete, (workflow, result) => {
  logger.info(
    `Workflow ${workflow.name}(${workflow.id}) completed with result: ${JSON.stringify(result)}`,
  );
});

workflowEvent.on(WorkflowEvent.Start, (workflow) => {
  logger.info(`Workflow ${workflow.name}(${workflow.id}) has started.`);
});

workflowEvent.on(WorkflowEvent.Failure, (workflow, error) => {
  logger.error(
    `Workflow ${workflow.name}(${workflow.id}) failed with error:`,
    error,
  );
});

workflowEvent.on(WorkflowEvent.Progress, (workflow, progress) => {
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
      action: CoreActionList.DataProcessing,
      events: taskEvent,
    }),
  ],
  taskHandlerChain: taskHandlers,
  workflowHandlerChain: workflowHandlers,
  events: workflowEvent,
  container: CoreActionContainer,
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
