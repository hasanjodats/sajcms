import { logger } from '@common/logger/winston.logger';
import { hasCircularDependency } from '@common/pattern/batch-processing/common/common';
import { GeneralError } from '@common/error/general.error'; // Import your custom error

const validateCircularDependency = (
  instance: any,
  type: 'workflow' | 'task',
) => {
  if (hasCircularDependency(instance)) {
    const message = `Circular dependency detected in ${type} ${instance.name || 'unknown'}`;
    logger.error(message);
    throw new GeneralError('CircularDependencyError', message); // Throw custom error
  }
};

export const validateWorkflowInitialState = (
  initialState: any,
  name: string,
) => {
  if (typeof initialState !== 'object') {
    const message = `InitialState for workflow ${name} must be an object.`;
    logger.error(message);
    throw new GeneralError('InvalidInitialState', message); // Throw custom error
  }
  // Add more specific validation for initialState here if needed
};

export const validateWorkflowCircularDependency = (instance: any) => {
  validateCircularDependency(instance, 'workflow');
};

export const validateTaskPayload = (payload: any, name: string) => {
  if (typeof payload !== 'object') {
    const message = `Payload for task ${name} must be an object.`;
    logger.error(message);
    throw new GeneralError('InvalidTaskPayload', message); // Throw custom error
  }
  // Add more specific validation for payload here if needed
};

export const validateTaskCircularDependency = (instance: any) => {
  validateCircularDependency(instance, 'task');
};
