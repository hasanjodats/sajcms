import { logger } from '@common/logger/winston.logger';
import {
  Task,
  TaskResponse,
  TaskResponseState,
} from '@common/pattern/batch-processing/task/task';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';
import { Action } from '@common/pattern/batch-processing/common/action';
import { CoreActionList } from '@core/actions/action.list';

interface DataProcessingActionConfig {
  multiplier: number;
}

const DataProcessingAction: Action = {
  name: CoreActionList.DataProcessing,
  configure: (config: unknown): void => {
    const dataProcessingConfig = config as DataProcessingActionConfig;
    logger.info(
      'Configuring data processing action with',
      dataProcessingConfig,
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute: async (task: Task, _workflow: Workflow): Promise<TaskResponse> => {
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
};

export default DataProcessingAction;
