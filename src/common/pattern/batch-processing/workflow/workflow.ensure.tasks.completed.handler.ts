import { WorkflowError, WorkflowErrorType } from '@common/error/workflow.error';
import { logger } from '@common/logger/winston.logger';
import { TaskState } from '@common/pattern/batch-processing/task/task';
import {
  Workflow,
  WorkflowResponse,
  WorkflowResponseState,
} from '@common/pattern/batch-processing/workflow/workflow';
import { WorkflowHandler } from '@common/pattern/batch-processing/workflow/workflow.handler';

/**
 * The WorkflowExecutionHandler ensures that all taks of a workflow are successfully executed.
 */
export class WorkflowEnsureTasksCompletedHandler extends WorkflowHandler {
  async handle(workflow: Workflow): Promise<WorkflowResponse> {
    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) has started ensure all tasks completed.`,
    );
    if (!workflow.tasks.every((task) => task.state === TaskState.Completed)) {
      return {
        state: WorkflowResponseState.Failure,
        error: new WorkflowError(
          workflow,
          WorkflowErrorType.NotTasksCompleted,
          'One or more tasks are still in progress.',
        ),
      };
    }
    logger.info(
      `Workflow ${workflow.name}(${workflow.id}) has passed ensure tasks completed check.`,
    );
    return super.handle(workflow);
  }
}
