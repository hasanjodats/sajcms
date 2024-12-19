import { GeneralError } from '@common/error/general.error';

/**
 * Custom error for timeout situations.
 */
export class TimeoutError extends GeneralError {
  constructor(
    message: string,
    public timeout: number,
  ) {
    super('TimeoutError', message);
  }
}

/**
 * Custom error for retry failures.
 */
export class RetryError extends GeneralError {
  constructor(
    public attempt: number,
    public totalAttempts: number,
    message?: string,
  ) {
    super(
      'RetryError',
      message ||
        `Retry attempts failed (Attempt ${attempt} of ${totalAttempts})`,
    );
  }
}

/**
 * Check if error is instance of TimeoutError or not
 *
 * @returns A TimeoutError instance
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof GeneralError && error.name === 'TimeoutError';
}

/**
 * Check if error is instance of RetryError or not
 *
 * @returns A RetryError instance
 */
export function isRetryError(error: unknown): error is RetryError {
  return error instanceof GeneralError && error.name === 'RetryError';
}

/**
 * Utility class providing helper methods for asynchronous operations.
 */
export class Utility {
  /**
   * This method wraps a given asynchronous function (fn) and implements a timeout feature. If fn does not resolve within the specified time, it rejects the promise with the provided error.
   * @typeParam T - The type of the resolved value from the promise.
   * @param {() => Promise<T>} fn The function to be wrapped, which returns a promise.
   * @param {number} timeout The maximum time (in milliseconds) to wait for fn to resolve.
   * @returns {() => Promise<T>} A new function that, when called, will execute fn and manage the timeout.
   * @throws {TimeoutError} Throws a TimeoutError on timeout.
   * @example
   * const fetchDataWithTimeout = Utility.withTimeout(fetchData, 5000);
   */
  public static withTimeout<T>(
    fn: () => Promise<T>,
    timeout: number,
  ): () => Promise<T> {
    return function () {
      const validTimeout = Math.min(Math.max(timeout || 0, 1), 2147483647); // Validate timeout range

      return Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new TimeoutError('The operation timed out', timeout)),
            validTimeout,
          ),
        ),
      ]);
    };
  }

  /**
   * This method attempts to execute a given asynchronous function multiple times, retrying if it fails. It can optionally implement exponential backoff for the delay between attempts.
   * @typeParam T - The type of the resolved value from the promise.
   * @param {() => Promise<T>} fn - The asynchronous function to execute.
   * @param {number} attempts - The maximum number of retry attempts.
   * @param {number} delay - The delay (in ms) between retry attempts.
   * @param {boolean} exponentialBackoff - Whether to use exponential backoff for retry delay.
   * @param {onRetry} onRetry - Optional callback for each retry attempt.
   * @returns {() => Promise<T>} A new function that manages the retry logic.
   * @throws {RetryError} Throws a RetryError after all attempts fail.
   * @example
   * const fetchDataWithRetry = Utility.withRetry(fetchData, 3, 1000);
   */
  public static withRetry<T>(
    fn: () => Promise<T>,
    attempts: number,
    delay: number,
    exponentialBackoff: boolean = false,
    onRetry?: (attempt: number, delay: number, remainder: number) => void, // New callback for logging
  ): () => Promise<T> {
    return async function tryFn(): Promise<T> {
      let currentDelay = delay;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          return await fn();
        } catch {
          if (onRetry) onRetry?.(attempt, currentDelay, attempts - attempt); // Log each retry

          if (attempt === attempts) {
            throw new RetryError(attempt, attempts); // Provide the attempt context in the error
          }
          if (exponentialBackoff) {
            currentDelay *= 2; // Exponential backoff
          }
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
        }
      }
      throw new GeneralError(
        'WithRetryError',
        'Error in execution of withRetry',
      ); // This line is technically unreachable due to the previous throw
    };
  }
}
