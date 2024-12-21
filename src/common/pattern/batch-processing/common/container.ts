import { GeneralError } from '@common/error/general.error';
import { Action } from '@common/pattern/batch-processing/common/action';

export default class ActionContainer {
  private providers: Map<string, Action> = new Map();

  /**
   * Register a new action.
   * @param action The action to register.
   * @param config Optional configuration for the action.
   */
  public registerAction(action: Action, config?: any): void {
    if (this.providers.has(action.name)) {
      throw new GeneralError(
        'ActionExists',
        `Action with name "${action.name}" is already registered.`,
      );
    }

    // Add action to providers
    this.providers.set(action.name, action);

    // Configure the action if a configure method exists
    if (action.configure) {
      action.configure(config);
    }
  }

  /**
   * Execute a registered action by name.
   * @param name The name of the action to execute.
   * @param task The task object.
   * @param workflow The workflow object.
   * @returns TaskResponse
   */
  public getAction(name: string): Action {
    const action = this.providers.get(name);

    if (!action) {
      throw new GeneralError('ActionNotFound', `Action "${name}" not found.`);
    }

    return action;
  }

  /**
   * Get the list of all registered actions.
   * @returns List of registered action names.
   */
  public getRegisteredActions(): string[] {
    return Array.from(this.providers.keys());
  }
}
