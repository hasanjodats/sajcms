/**
 * Represents a general error that can occur in the application.
 */
export class GeneralError extends Error {
  /** Representing the type of error. */
  public name: string;
  /** Additional details about the error's cause. */
  public cause?: unknown;
  /** Stack trace of the error */
  public stack?: string;

  /**
   * Initializes an instance of the GeneralError class.
   *
   * @param name - The name/type of the error. Defaults to 'GeneralError'.
   * @param message - A detailed explanation of the error. Defaults to 'An error occurred'.
   * @param cause - Optional cause of the error.
   */
  constructor(
    name: string = 'GeneralError',
    message: string = 'An error occurred',
    cause?: unknown,
  ) {
    super(message); // Call the parent constructor with message

    // Manually set the prototype to ensure instanceof works correctly
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name; // Set the error name
    this.cause = cause || 'No additional cause'; // Set the cause of the error

    // Ensure stack trace is captured
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GeneralError);
    }

    this.stack = this.stack || new Error().stack; // Ensure stack trace exists
  }

  /**
   * Returns a detailed string representation of the error.
   *
   * @returns A formatted string containing error details.
   */
  public toString(): string {
    const causeInfo =
      this.cause !== undefined
        ? `\nCaused by: ${typeof this.cause === 'object' ? JSON.stringify(this.cause, null, 2) : this.cause}`
        : '';
    return `${this.name}: ${this.message}${causeInfo}\nStack: ${this.stack || 'N/A'}`;
  }
}

/**
 * Check if the provided error is an instance of GeneralError.
 *
 * @param error - The error object to check.
 * @returns True if the error is an instance of GeneralError; otherwise, false.
 */
export function isGeneralError(error: unknown): error is GeneralError {
  return error instanceof GeneralError;
}
