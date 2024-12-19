import { describe, expect, it } from '@jest/globals';
import { GeneralError, isGeneralError } from '@common/error/general.error';

describe('GeneralError Class', () => {
  it('should create an instance with the correct properties', () => {
    const cause = { input: 'test@example.com' };
    const error = new GeneralError(
      'ValidationError',
      'The input is invalid',
      cause,
    );

    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('The input is invalid');
    expect(error.cause).toEqual(cause);
    expect(error.stack).toBeDefined();
  });

  it('should default the cause to "No additional cause" if not provided', () => {
    const error = new GeneralError('CustomError', 'An error occurred');

    expect(error.name).toBe('CustomError');
    expect(error.message).toBe('An error occurred');
    expect(error.cause).toBe('No additional cause');
    expect(error.stack).toBeDefined();
  });

  it('should return a formatted string from toString method', () => {
    const cause = { input: 'test@example.com' };
    const error = new GeneralError(
      'ValidationError',
      'The input is invalid',
      cause,
    );
    const expectedString = `ValidationError: The input is invalid\nCaused by: ${JSON.stringify(cause)}\nStack: ${error.stack || 'N/A'}`;

    expect(error.toString()).toBe(expectedString);
  });

  it('should handle missing stack trace correctly', () => {
    const error = new GeneralError(
      'CustomError',
      'An error occurred without stack trace',
    );

    const result = error.toString();
    expect(result).toContain(
      'CustomError: An error occurred without stack trace',
    );
    expect(result).toContain('Stack:');
  });

  it('should identify a GeneralError instance using isGeneralError', () => {
    const error = new GeneralError('TestError', 'Test message');
    expect(isGeneralError(error)).toBe(true);
  });

  it('should return false when error is not an instance of GeneralError', () => {
    const error = new Error('Regular error');
    expect(isGeneralError(error)).toBe(false);
  });
});
