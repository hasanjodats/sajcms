import { describe, expect, it } from '@jest/globals';
import { GeneralError, isGeneralError } from '@common/error/general.error';

describe('GeneralError', () => {
  it('should create a GeneralError instance with default values', () => {
    const error = new GeneralError();
    expect(error.name).toBe('GeneralError');
    expect(error.message).toBe('An error occurred');
    expect(error.cause).toBe('No additional cause');
    expect(error.stack).toBeDefined();
  });

  it('should create a GeneralError instance with custom values', () => {
    const cause = { detail: 'Invalid input' };
    const error = new GeneralError(
      'ValidationError',
      'The input data is invalid',
      cause,
    );
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('The input data is invalid');
    expect(error.cause).toEqual(cause);
  });

  it('should return a detailed string representation', () => {
    const cause = { field: 'email', issue: 'Invalid format' };
    const error = new GeneralError(
      'ValidationError',
      'Invalid email address',
      cause,
    );
    const errorString = error.toString();
    expect(errorString).toContain('ValidationError');
    expect(errorString).toContain('Invalid email address');
    expect(errorString).toContain(JSON.stringify(cause, null, 2));
  });

  it('should handle non-object causes in the string representation', () => {
    const error = new GeneralError(
      'CustomError',
      'An error occurred',
      'Cause of the error',
    );
    const errorString = error.toString();
    expect(errorString).toContain('CustomError');
    expect(errorString).toContain('An error occurred');
    expect(errorString).toContain('Cause of the error');
  });

  it('should identify an error as GeneralError', () => {
    const error = new GeneralError();
    expect(isGeneralError(error)).toBe(true);
    expect(isGeneralError(new Error())).toBe(false);
  });

  it('should work with stack trace', () => {
    const error = new GeneralError('StackError', 'Error with stack');
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('StackError');
  });
});
