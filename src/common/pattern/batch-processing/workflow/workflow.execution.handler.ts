import { WorkflowError, WorkflowErrorType } from '@common/error/workflow.error';
import { logger } from '@common/logger/winston.logger';
import {
  TaskResponseState,
  TaskState,
} from '@common/pattern/batch-processing/task/task';
import {
  Workflow,
  WorkflowResponse,
  WorkflowResponseState,
  WorkflowState,
} from '@common/pattern/batch-processing/workflow/workflow';
import { WorkflowHandler } from '@common/pattern/batch-processing/workflow/workflow.handler';
import { WorkflowEvent } from '@common/pattern/batch-processing/workflow/workflow.event-emitter';

/**
 * The WorkflowExecutionHandler execute all taks of the workflow.
 */
export class WorkflowExecutionHandler extends WorkflowHandler {
  public async handle(workflow: Workflow): Promise<WorkflowResponse> {
    workflow.events.emit(WorkflowEvent.Start, workflow);
    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) has started execution.`,
    );
    workflow.startTime = Date.now();
    try {
      workflow.events.emit(WorkflowEvent.Progress, workflow, 0);

      let index = 1;

      // Execute tasks
      for (const task of workflow.tasks) {
        if (task.state !== TaskState.Completed) {
          logger.info(
            `Workflow ${workflow.name}(${workflow.id}) has started execute task ${task.name}(${task.id}).`,
          );
          const response = await workflow.taskHandlerChain.handle(
            task,
            workflow,
          );
          logger.info(
            `Workflow ${workflow.name}(${workflow.id}) has executed task ${task.name}(${task.id}) and the response state is ${response.state}.`,
          );

          let progress = Math.round((index / workflow.tasks.length) * 100);
          workflow.events.emit(WorkflowEvent.Progress, workflow, progress);

          index = index + 1;

          if (response.state === TaskResponseState.Pending) {
            return {
              state: WorkflowResponseState.Pending,
            };
          } else if (response.state === TaskResponseState.Failure) {
            return {
              state: WorkflowResponseState.Failure,
              error: new WorkflowError(
                workflow,
                WorkflowErrorType.ExecutionFailed,
                'Not all tasks were completed successfully.',
              ),
            };
          }
        }
      }

      workflow.state = WorkflowState.Completed;
      logger.info(
        `Workflow ${workflow.name}(${workflow.id}) has executed all tasks successfully.`,
      );
      return super.handle(workflow);
    } catch (error: any) {
      const workflowError = new WorkflowError(
        workflow,
        WorkflowErrorType.ExecutionFailed,
        error,
      );
      workflow.events.emit(WorkflowEvent.Failure, workflow, workflowError);
      logger.error(
        `Workflow ${workflow.name}(${workflow.id}) execution has failed.`,
        error,
      );
      return {
        state: WorkflowResponseState.Failure,
        error: workflowError,
      };
    } finally {
      const elapsedTime = Date.now() - (workflow.startTime || 0);
      logger.info(
        `Workflow ${workflow.name}(${workflow.id}) has executed in ${elapsedTime} ms`,
      );
    }
  }
}
