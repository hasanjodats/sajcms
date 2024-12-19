import { describe, expect, jest, it } from '@jest/globals';
import {
  validateWorkflowInitialState,
  validateWorkflowCircularDependency,
  validateTaskPayload,
  validateTaskCircularDependency,
} from './validation.helper';
import { logger } from '@common/logger/winston.logger';
import { hasCircularDependency } from '../common/common';

// Mocking the logger to suppress console output in tests
jest.mock('@common/logger/winston.logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mocking the hasCircularDependency function
jest.mock('../common/common', () => ({
  hasCircularDependency: jest.fn(),
}));

describe('Validation Helper Tests', () => {
  describe('validateWorkflowInitialState', () => {
    it('should throw an error if initialState is not an object', () => {
      const name = 'Test Workflow';
      const initialState = 'invalid state'; // Not an object

      expect(() =>
        validateWorkflowInitialState(initialState, name),
      ).toThrowError(`InitialState for workflow ${name} must be an object.`);
      expect(logger.error).toHaveBeenCalledWith(
        `InitialState for workflow ${name} must be an object.`,
      );
    });

    it('should not throw an error if initialState is an object', () => {
      const name = 'Test Workflow';
      const initialState = { progress: 0 }; // Object

      expect(() =>
        validateWorkflowInitialState(initialState, name),
      ).not.toThrow();
    });
  });

  describe('validateWorkflowCircularDependency', () => {
    it('should throw an error if circular dependency is detected', () => {
      const name = 'Test Workflow';
      const workflowInstance = {}; // Mock instance of the workflow
      (hasCircularDependency as jest.Mock).mockReturnValue(true); // Mocking circular dependency

      expect(() =>
        validateWorkflowCircularDependency(workflowInstance, name),
      ).toThrowError(`Circular dependency detected in workflow ${name}`);
      expect(logger.error).toHaveBeenCalledWith(
        `Circular dependency detected in workflow ${name}`,
      );
    });

    it('should not throw an error if circular dependency is not detected', () => {
      const name = 'Test Workflow';
      const workflowInstance = {}; // Mock instance of the workflow
      (hasCircularDependency as jest.Mock).mockReturnValue(false); // No circular dependency

      expect(() =>
        validateWorkflowCircularDependency(workflowInstance, name),
      ).not.toThrow();
    });
  });

  describe('validateTaskPayload', () => {
    it('should throw an error if payload is not an object', () => {
      const name = 'Test Task';
      const payload = 'invalid payload'; // Not an object

      expect(() => validateTaskPayload(payload, name)).toThrowError(
        `Payload for task ${name} must be an object.`,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Payload for task ${name} must be an object.`,
      );
    });

    it('should not throw an error if payload is an object', () => {
      const name = 'Test Task';
      const payload = { key: 'value' }; // Object

      expect(() => validateTaskPayload(payload, name)).not.toThrow();
    });
  });

  describe('validateTaskCircularDependency', () => {
    it('should throw an error if circular dependency is detected', () => {
      const name = 'Test Task';
      const taskInstance = {}; // Mock instance of the task
      (hasCircularDependency as jest.Mock).mockReturnValue(true); // Mocking circular dependency

      expect(() =>
        validateTaskCircularDependency(taskInstance, name),
      ).toThrowError(`Circular dependency detected in task ${name}`);
      expect(logger.error).toHaveBeenCalledWith(
        `Circular dependency detected in task ${name}`,
      );
    });

    it('should not throw an error if circular dependency is not detected', () => {
      const name = 'Test Task';
      const taskInstance = {}; // Mock instance of the task
      (hasCircularDependency as jest.Mock).mockReturnValue(false); // No circular dependency

      expect(() =>
        validateTaskCircularDependency(taskInstance, name),
      ).not.toThrow();
    });
  });
});
