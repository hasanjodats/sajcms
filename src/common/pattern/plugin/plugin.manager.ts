import { GeneralError } from '@common/error/general.error';
import { Task, TaskResponse } from '@common/pattern/batch-processing/task/task';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';
import { ActionPlugin } from '@common/pattern/plugin/action.plugin';

export default class PluginManager {
  private plugins: { [name: string]: ActionPlugin } = {};

  registerPlugin(plugin: ActionPlugin, config?: any) {
    if (this.plugins[plugin.name]) {
      throw new GeneralError(
        'PluginExists',
        `Plugin with name "${plugin.name}" already registered.`,
      );
    }
    this.plugins[plugin.name] = plugin;
    if (plugin.configure) {
      plugin.configure(config);
    }
  }

  async executePlugin(
    name: string,
    task: Task,
    workflow: Workflow,
    payload: any,
  ): Promise<TaskResponse> {
    if (!this.plugins[name]) {
      throw new GeneralError('PluginNotFound', `Plugin "${name}" not found.`);
    }

    return this.plugins[name].execute(task, workflow, payload);
  }

  getPlugins(): { [name: string]: ActionPlugin } {
    return this.plugins;
  }
}
