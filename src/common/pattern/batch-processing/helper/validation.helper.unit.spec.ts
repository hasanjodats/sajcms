import { describe, expect, jest, it, beforeEach } from '@jest/globals';
import { hasCircularDependency } from '@common/pattern/batch-processing/common/common';
import { GeneralError } from '@common/error/general.error';
import { logger } from '@common/logger/winston.logger';

jest.mock('@common/pattern/batch-processing/common/common', () => ({
  hasCircularDependency: jest.fn(),
}));

jest.mock('@common/logger/winston.logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

const mockHasCircularDependency = jest.mocked(hasCircularDependency);
const mockLoggerError = jest.mocked(logger.error);

const validateCircularDependency = (
  instance: any,
  type: 'workflow' | 'task',
) => {
  if (hasCircularDependency(instance)) {
    const message = `Circular dependency detected in ${type} ${instance.name || 'unknown'}`;
    logger.error(message);
    throw new GeneralError('CircularDependencyError', message);
  }
};

export const validateWorkflowInitialState = (
  initialState: any,
  name: string,
) => {
  if (typeof initialState !== 'object') {
    const message = `InitialState for workflow ${name} must be an object.`;
    logger.error(message);
    throw new GeneralError('InvalidInitialState', message);
  }
};

export const validateWorkflowCircularDependency = (instance: any) => {
  validateCircularDependency(instance, 'workflow');
};

export const validateTaskPayload = (payload: any, name: string) => {
  if (typeof payload !== 'object') {
    const message = `Payload for task ${name} must be an object.`;
    logger.error(message);
    throw new GeneralError('InvalidTaskPayload', message);
  }
};

export const validateTaskCircularDependency = (instance: any) => {
  validateCircularDependency(instance, 'task');
};

describe('Validation Functions', () => {
  beforeEach(() => {
    mockHasCircularDependency.mockClear();
    mockLoggerError.mockClear();
  });

  describe('validateWorkflowInitialState', () => {
    it('should throw error for non-object initialState', () => {
      expect(() =>
        validateWorkflowInitialState('not an object', 'MyWorkflow'),
      ).toThrowError(
        new GeneralError(
          'InvalidInitialState',
          'InitialState for workflow MyWorkflow must be an object.',
        ),
      );
      expect(mockLoggerError).toHaveBeenCalledWith(
        'InitialState for workflow MyWorkflow must be an object.',
      );
    });

    it('should not throw error for valid object initialState', () => {
      expect(() =>
        validateWorkflowInitialState({}, 'MyWorkflow'),
      ).not.toThrowError();
      expect(mockLoggerError).not.toHaveBeenCalled();
    });
  });

  describe('validateTaskPayload', () => {
    it('should throw error for non-object payload', () => {
      expect(() => validateTaskPayload('not an object', 'MyTask')).toThrowError(
        new GeneralError(
          'InvalidTaskPayload',
          'Payload for task MyTask must be an object.',
        ),
      );
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Payload for task MyTask must be an object.',
      );
    });

    it('should not throw error for valid object payload', () => {
      expect(() => validateTaskPayload({}, 'MyTask')).not.toThrowError();
      expect(mockLoggerError).not.toHaveBeenCalled();
    });
  });

  describe('validateCircularDependency', () => {
    it('should throw error if hasCircularDependency returns true (workflow)', () => {
      mockHasCircularDependency.mockReturnValueOnce(true);
      expect(() => validateCircularDependency({}, 'workflow')).toThrowError(
        new GeneralError(
          'CircularDependencyError',
          'Circular dependency detected in workflow unknown',
        ),
      );
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Circular dependency detected in workflow unknown',
      );
    });

    it('should not throw error if hasCircularDependency returns false (workflow)', () => {
      mockHasCircularDependency.mockReturnValueOnce(false);
      expect(() =>
        validateCircularDependency({ name: 'MyWorkflow' }, 'workflow'),
      ).not.toThrowError();
      expect(mockLoggerError).not.toHaveBeenCalled();
    });

    it('should throw error if hasCircularDependency returns true (task)', () => {
      mockHasCircularDependency.mockReturnValueOnce(true);
      expect(() => validateCircularDependency({}, 'task')).toThrowError(
        new GeneralError(
          'CircularDependencyError',
          'Circular dependency detected in task unknown',
        ),
      );
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Circular dependency detected in task unknown',
      );
    });

    it('should not throw error if hasCircularDependency returns false (task)', () => {
      mockHasCircularDependency.mockReturnValueOnce(false);
      expect(() =>
        validateCircularDependency({ name: 'MyTask' }, 'task'),
      ).not.toThrowError();
      expect(mockLoggerError).not.toHaveBeenCalled();
    });
  });

  describe('validateWorkflowCircularDependency', () => {
    it('should call hasCircularDependency with correct arguments (workflow)', () => {
      const instance = { name: 'MyWorkflow', id: '123' };
      validateWorkflowCircularDependency(instance);
      expect(mockHasCircularDependency).toHaveBeenCalledWith(instance);
      expect(mockLoggerError).not.toHaveBeenCalled();
    });
  });

  describe('validateTaskCircularDependency', () => {
    it('should call hasCircularDependency with correct arguments (task)', () => {
      const instance = { name: 'MyTask', id: '456' };
      validateTaskCircularDependency(instance);
      expect(mockHasCircularDependency).toHaveBeenCalledWith(instance);
      expect(mockLoggerError).not.toHaveBeenCalled();
    });
  });
});
