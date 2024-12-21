import { GeneralError } from '@common/error/general.error';

/**
 * Custom error class for timeout situations
 */
export class TimeoutError extends GeneralError {
  constructor(
    message: string,
    public timeout: number,
  ) {
    super('TimeoutError', message); // Register the error with a specific name
  }
}

/**
 * Custom error class for retry failure scenarios
 */
export class RetryError extends GeneralError {
  constructor(
    public attempt: number, // The current attempt number
    public totalAttempts: number, // Total number of retry attempts
    message?: string, // Optional error message
  ) {
    super(
      'RetryError',
      message ||
        `Retry attempts failed (Attempt ${attempt} of ${totalAttempts})`, // Default message if no message is provided
    );
  }
}

/**
 * Checks if the error is an instance of TimeoutError
 *
 * @returns True if the error is a TimeoutError instance
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof GeneralError && error.name === 'TimeoutError';
}

/**
 * Checks if the error is an instance of RetryError
 *
 * @returns True if the error is a RetryError instance
 */
export function isRetryError(error: unknown): error is RetryError {
  return error instanceof GeneralError && error.name === 'RetryError';
}

/**
 * Utility class providing helper methods for asynchronous operations
 */
export class Utility {
  /**
   * This method wraps an asynchronous function (fn) and adds a timeout feature.
   * If fn does not resolve within the given time, it rejects with a TimeoutError.
   *
   * @param {() => Promise<T>} fn The function to be wrapped, returning a promise.
   * @param {number} timeout The maximum time (in milliseconds) to wait for fn to resolve.
   * @returns {() => Promise<T>} A new function that executes fn with timeout management.
   * @throws {TimeoutError} Throws a TimeoutError if the operation takes too long.
   * @example
   * const fetchDataWithTimeout = Utility.withTimeout(fetchData, 5000);
   */
  public static withTimeout<T>(
    fn: () => Promise<T>,
    timeout: number,
  ): () => Promise<T> {
    return function () {
      const validTimeout = Math.min(Math.max(timeout || 0, 1), 2147483647); // Ensure timeout is within a valid range

      return Promise.race([
        fn(), // Execute the main function
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new TimeoutError('The operation timed out', timeout)),
            validTimeout, // If the timeout is reached, reject with TimeoutError
          ),
        ),
      ]);
    };
  }

  /**
   * This method attempts to execute the given asynchronous function multiple times, retrying on failure.
   * Optionally, it can implement exponential backoff for retry delay.
   *
   * @param {() => Promise<T>} fn The function to execute.
   * @param {number} attempts The maximum number of retry attempts.
   * @param {number} delay The delay (in ms) between each retry attempt.
   * @param {boolean} exponentialBackoff Whether to use exponential backoff for retries.
   * @param {onRetry} onRetry Optional callback to be executed on each retry.
   * @returns {() => Promise<T>} A new function that handles retry logic.
   * @throws {RetryError} Throws a RetryError after all attempts fail.
   * @example
   * const fetchDataWithRetry = Utility.withRetry(fetchData, 3, 1000);
   */
  public static withRetry<T>(
    fn: () => Promise<T>,
    attempts: number,
    delay: number,
    exponentialBackoff: boolean = false,
    onRetry?: (attempt: number, delay: number, remainder: number) => void, // Optional callback for each retry
  ): () => Promise<T> {
    return async function tryFn(): Promise<T> {
      let currentDelay = delay; // Initial delay for retries
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          return await fn(); // Try executing the function
        } catch {
          if (onRetry) onRetry?.(attempt, currentDelay, attempts - attempt); // Call the retry callback if provided

          if (attempt === attempts) {
            throw new RetryError(attempt, attempts); // Throw RetryError after the final attempt fails
          }
          if (exponentialBackoff) {
            currentDelay *= 2; // Apply exponential backoff if specified
          }
          await new Promise((resolve) => setTimeout(resolve, currentDelay)); // Wait for the current delay
        }
      }
      throw new GeneralError(
        'WithRetryError',
        'Error in execution of withRetry',
      ); // This line will not usually execute because of the prior throw statements
    };
  }
}
