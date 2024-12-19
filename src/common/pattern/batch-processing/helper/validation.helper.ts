import { logger } from '@common/logger/winston.logger';
import { hasCircularDependency } from '../common/common';

/**
 * Validate initial state input
 * @param initialState - The initial state of workflow.
 * @param name - The name of the workflow.
 * @returns {void}.
 */
export const validateWorkflowInitialState = (
  initialState: any,
  name: string,
): void => {
  if (typeof initialState !== 'object') {
    logger.error(`InitialState for workflow ${name} must be an object.`);
    throw new Error(`InitialState for workflow ${name} must be an object.`);
  }
};

/**
 * Validate circular dependency
 * @param instance - The workflow object.
 * @param name - The name of  the workflow.
 * @returns {void}.
 */
export const validateWorkflowCircularDependency = (
  instance: any,
  name: string,
): void => {
  if (hasCircularDependency(instance)) {
    logger.error(`Circular dependency detected in workflow ${name}`);
    throw new Error(`Circular dependency detected in workflow ${name}`);
  }
};

/**
 * Validate payload input
 * @param payload - The payload of task.
 * @param name - The name of the task.
 * @returns {void}.
 */
export const validateTaskPayload = (payload: any, name: string) => {
  if (typeof payload !== 'object') {
    logger.error(`Payload for task ${name} must be an object.`);
    throw new Error(`Payload for task ${name} must be an object.`);
  }
};

/**
 * Validate circular dependency
 * @param instance - The workflow object.
 * @param name - The name of  the workflow.
 * @returns {void}.
 */
export const validateTaskCircularDependency = (instance: any, name: string) => {
  if (hasCircularDependency(instance)) {
    logger.error(`Circular dependency detected in task ${name}`);
    throw new Error(`Circular dependency detected in task ${name}`);
  }
};
