import { logger } from '@common/logger/winston.logger';
import {
  Task,
  TaskResponse,
  TaskResponseState,
} from '@common/pattern/batch-processing/task/task';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';
import { ActionPlugin } from '@common/pattern/plugin/action.plugin';
import { CorePluginList } from '@core/plugins/plugin.list';

interface DataProcessingPluginConfig {
  multiplier: number;
}

const DataProcessingPlugin: ActionPlugin = {
  name: CorePluginList.DataProcessing,
  configure: (config: any) => {
    const dataProcessingConfig = config as DataProcessingPluginConfig;
    logger.info(
      'Configuring data processing plugin with',
      dataProcessingConfig,
    );
  },
  execute: async (
    task: Task,
    workflow: Workflow,
    payload: any,
  ): Promise<TaskResponse> => {
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

export default DataProcessingPlugin;
