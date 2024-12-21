import { GeneralError } from '@common/error/general.error';
import { Action } from '@common/pattern/batch-processing/common/action';

/**
 * ActionContainer is an abstract class that manages the registration, configuration, and execution of actions.
 *
 * The container holds a collection of actions that can be registered and later executed based on their names.
 * It provides methods for registering actions, retrieving actions, and listing all registered actions.
 * Actions can also be configured before execution if they implement the optional `configure` method.
 */
export default abstract class ActionContainer {
  // A map to store registered actions by their names
  private providers: Map<string, Action> = new Map();

  /**
   * Registers a new action in the container.
   *
   * This method adds an action to the `providers` map, ensuring that actions are unique by their names.
   * If the action has a `configure` method, it is called to initialize the action with the provided configuration.
   *
   * @param action - The action to be registered in the container.
   * @param config - Optional configuration settings for the action.
   * @returns A promise that resolves once the action is registered and configured.
   *
   * @throws {GeneralError} If the action name already exists in the container.
   */
  public async registerAction(action: Action, config?: any): Promise<void> {
    if (!this.providers.has(action.name)) {
      // Add action to providers map
      this.providers.set(action.name, action);

      // Configure the action if a configure method is provided
      if (action.configure) {
        await action.configure(config);
      }
    }
  }

  /**
   * Retrieves a registered action by its name.
   *
   * This method searches for an action by its name in the container. If the action is found,
   * it is returned; otherwise, an error is thrown.
   *
   * @param name - The name of the action to retrieve.
   * @returns The action corresponding to the provided name.
   *
   * @throws {GeneralError} If no action with the provided name is found.
   */
  public getAction(name: string): Action {
    const action = this.providers.get(name);

    if (!action) {
      // Throw an error if the action is not found
      throw new GeneralError('ActionNotFound', `Action ${name} not found.`);
    }

    return action;
  }

  /**
   * Gets a list of all registered action names.
   *
   * This method returns an array of names of all the actions that have been registered
   * in the container.
   *
   * @returns A list of strings representing the names of all registered actions.
   */
  public getRegisteredActions(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Abstract method for initializing the container.
   *
   * This method must be implemented by subclasses to perform any necessary setup or initialization.
   * For example, it may be used to preload certain actions or perform configurations.
   *
   * @returns A promise that resolves once the container is fully initialized.
   */
  public abstract init(): Promise<void>;
}
