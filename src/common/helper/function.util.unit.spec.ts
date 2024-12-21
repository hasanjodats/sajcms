import { describe, expect, it, jest } from '@jest/globals';
import {
  Utility,
  TimeoutError,
  RetryError,
  isTimeoutError,
  isRetryError,
} from '@common/helper/function.util';

describe('Utility Tests', () => {
  describe('TimeoutError', () => {
    it('should create a TimeoutError with correct properties', () => {
      const error = new TimeoutError('Operation timed out', 5000);
      expect(error.name).toBe('TimeoutError');
      expect(error.message).toBe('Operation timed out');
      expect(error.timeout).toBe(5000);
    });
  });

  describe('RetryError', () => {
    it('should create a RetryError with correct properties', () => {
      const error = new RetryError(2, 3);
      expect(error.name).toBe('RetryError');
      expect(error.message).toBe('Retry attempts failed (Attempt 2 of 3)');
      expect(error.attempt).toBe(2);
      expect(error.totalAttempts).toBe(3);
    });
  });

  describe('isTimeoutError', () => {
    it('should correctly identify TimeoutError', () => {
      const error = new TimeoutError('Operation timed out', 5000);
      expect(isTimeoutError(error)).toBe(true);
    });

    it('should return false for non-TimeoutError instances', () => {
      const error = new Error('General error');
      expect(isTimeoutError(error)).toBe(false);
    });
  });

  describe('isRetryError', () => {
    it('should correctly identify RetryError', () => {
      const error = new RetryError(1, 3);
      expect(isRetryError(error)).toBe(true);
    });

    it('should return false for non-RetryError instances', () => {
      const error = new Error('General error');
      expect(isRetryError(error)).toBe(false);
    });
  });

  describe('Utility.withTimeout', () => {
    it('should resolve if the function completes within the timeout', async () => {
      const mockFn = jest.fn(() => Promise.resolve('success'));
      const wrappedFn = Utility.withTimeout(mockFn, 1000);

      await expect(wrappedFn()).resolves.toBe('success');
      expect(mockFn).toHaveBeenCalled();
    });

    it('should reject with TimeoutError if the function exceeds the timeout', async () => {
      const mockFn = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 2000)),
      );
      const wrappedFn = Utility.withTimeout(mockFn, 1000);

      await expect(wrappedFn()).rejects.toThrow(TimeoutError);
    });
  });

  describe('Utility.withRetry', () => {
    it('should resolve if the function succeeds within the allowed attempts', async () => {
      let attempt = 0;
      const mockFn = jest.fn(() =>
        ++attempt === 2 ? Promise.resolve('success') : Promise.reject(),
      );
      const wrappedFn = Utility.withRetry(mockFn, 3, 100);

      await expect(wrappedFn()).resolves.toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should reject with RetryError after exceeding retry attempts', async () => {
      const mockFn = jest.fn(() => Promise.reject());
      const wrappedFn = Utility.withRetry(mockFn, 3, 100);

      await expect(wrappedFn()).rejects.toThrow(RetryError);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff if enabled', async () => {
      let attempt = 0;
      const mockFn = jest.fn(() =>
        ++attempt === 3 ? Promise.resolve('success') : Promise.reject(),
      );
      const wrappedFn = Utility.withRetry(mockFn, 3, 100, true);

      const startTime = Date.now();
      await expect(wrappedFn()).resolves.toBe('success');
      const elapsedTime = Date.now() - startTime;

      // Exponential backoff delay: 100ms + 200ms + 400ms
      expect(elapsedTime).toBeGreaterThanOrEqual(600);
    });

    it('should invoke onRetry callback on each retry', async () => {
      const onRetry = jest.fn();
      const mockFn = jest.fn(() => Promise.reject());
      const wrappedFn = Utility.withRetry(mockFn, 2, 100, false, onRetry);

      await expect(wrappedFn()).rejects.toThrow(RetryError);
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(1, 100, 1);
      expect(onRetry).toHaveBeenCalledWith(2, 100, 0);
    });
  });
});
