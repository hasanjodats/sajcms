import { logger } from '@common/logger/winston.logger';
import { hasCircularDependency } from '@common/pattern/batch-processing/common/common';
import { GeneralError } from '@common/error/general.error'; // Import your custom error
import { Task } from '@common/pattern/batch-processing/task/task';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';

/**
 * Validates if the provided instance (workflow or task) has any circular dependencies.
 *
 * A circular dependency occurs when an entity references itself directly or indirectly, causing an infinite loop.
 * If a circular dependency is detected, a custom error is thrown with a detailed message.
 *
 * @param instance - The instance (workflow or task) to check for circular dependencies.
 * @param type - The type of instance, either 'workflow' or 'task', used in the error message.
 * @throws {GeneralError} Throws a custom error if a circular dependency is detected.
 */
const validateCircularDependency = (
  instance: Task | Workflow,
  type: 'workflow' | 'task',
) => {
  if (hasCircularDependency(instance)) {
    const message = `Circular dependency detected in ${type} ${instance.name || 'unknown'}`;
    logger.error(message); // Log the circular dependency error
    throw new GeneralError('CircularDependencyError', message); // Throw custom error
  }
};

/**
 * Validates that the initial state for a workflow is an object.
 *
 * The initial state is expected to be an object. If it's not, a custom error is thrown.
 * Additional validation logic can be added here for specific fields or structure within the initial state.
 *
 * @param initialState - The initial state of the workflow to validate.
 * @param name - The name of the workflow for more informative error messages.
 * @throws {GeneralError} Throws a custom error if the initial state is not an object.
 */
export const validateWorkflowInitialState = (
  initialState: unknown,
  name: string,
) => {
  if (initialState !== null && typeof initialState !== 'object') {
    const message = `InitialState for workflow ${name} must be an object.`;
    logger.error(message); // Log the validation error
    throw new GeneralError('InvalidInitialState', message); // Throw custom error
  }
  // Add more specific validation for initialState here if needed
};

/**
 * Validates circular dependencies for workflows by calling the generic circular dependency check.
 *
 * This function acts as a wrapper for the `validateCircularDependency` method, providing specific logic
 * for workflows.
 *
 * @param instance - The workflow instance to check for circular dependencies.
 * @throws {GeneralError} Throws a custom error if a circular dependency is detected.
 */
export const validateWorkflowCircularDependency = (instance: Workflow) => {
  validateCircularDependency(instance, 'workflow'); // Call the generic circular dependency check for workflows
};

/**
 * Validates that the payload for a task is an object.
 *
 * The payload is expected to be an object. If it isn't, a custom error is thrown. Additional checks
 * can be added to validate specific fields within the payload.
 *
 * @param payload - The payload to validate.
 * @param name - The name of the task for more informative error messages.
 * @throws {GeneralError} Throws a custom error if the payload is not an object.
 */
export const validateTaskPayload = (payload: unknown, name: string) => {
  if (payload !== null && typeof payload !== 'object') {
    const message = `Payload for task ${name} must be an object.`;
    logger.error(message); // Log the validation error
    throw new GeneralError('InvalidTaskPayload', message); // Throw custom error
  }
  // Add more specific validation for payload here if needed
};

/**
 * Validates circular dependencies for tasks by calling the generic circular dependency check.
 *
 * This function acts as a wrapper for the `validateCircularDependency` method, providing specific logic
 * for tasks.
 *
 * @param instance - The task instance to check for circular dependencies.
 * @throws {GeneralError} Throws a custom error if a circular dependency is detected.
 */
export const validateTaskCircularDependency = (instance: Task) => {
  validateCircularDependency(instance, 'task'); // Call the generic circular dependency check for tasks
};
