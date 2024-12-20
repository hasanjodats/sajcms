import { GeneralError } from '@common/error/general.error';
import { Action } from '@common/pattern/batch-processing/common/action';
import { Task, TaskResponse } from '@common/pattern/batch-processing/task/task';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';

export type StaticThis = {
  new (): MapContainer;
  providers: Map<string, Action>;
};

export default abstract class MapContainer {
  public static providers: Map<string, Action>;

  public abstract initialize(): Map<string, Action>;

  public static registerAction(
    this: StaticThis,
    action: Action,
    config?: any,
  ) {
    if (!this.providers) {
      this.providers = new this().initialize();
    }

    if (this.providers.has(action.name)) {
      throw new GeneralError(
        'ActionExists',
        `Action with name "${action.name}" already registered.`,
      );
    }

    this.providers.set(action.name, action);

    if (action.configure) {
      action.configure(config);
    }
  }

  public static async executeAction(
    this: StaticThis,
    name: string,
    task: Task,
    workflow: Workflow,
  ): Promise<TaskResponse> {
    if (!this.providers) {
      this.providers = new this().initialize();
    }

    if (!this.providers.has(name)) {
      throw new GeneralError('ActionNotFound', `Action "${name}" not found.`);
    }

    const action = this.providers.get(name);

    return await action!.execute(task, workflow, task.payload);
  }
}
