import { GeneralError } from '@common/error/general.error';
import { ActionPlugin } from '@common/pattern/plugin/action.plugin';
import { Task, TaskResponse } from '../task/task';
import { Workflow } from '../workflow/workflow';

// export type StaticThis<T, K> = { new (): T; providers: K };

export type StaticThis = {
  new (): MapContainer;
  providers: Map<string, ActionPlugin>;
};

export default abstract class MapContainer {
  public static providers: Map<string, ActionPlugin>;

  public abstract initialize(): Map<string, ActionPlugin>;

  public static registerPlugin(
    this: StaticThis,
    plugin: ActionPlugin,
    config?: any,
  ) {
    if (!this.providers) {
      this.providers = new this().initialize();
    }

    if (this.providers.has(plugin.name)) {
      throw new GeneralError(
        'PluginExists',
        `Plugin with name "${plugin.name}" already registered.`,
      );
    }

    this.providers.set(plugin.name, plugin);

    if (plugin.configure) {
      plugin.configure(config);
    }
  }

  public static async executePlugin(
    this: StaticThis,
    name: string,
    task: Task,
    workflow: Workflow,
  ): Promise<TaskResponse> {
    if (!this.providers) {
      this.providers = new this().initialize();
    }

    if (!this.providers.has(name)) {
      throw new GeneralError('PluginNotFound', `Plugin "${name}" not found.`);
    }

    const plugin = this.providers.get(name);

    return await plugin!.execute(task, workflow, task.payload);
  }
}
