/**
 * Represents a general error that can occur in the application.
 * This class extends the built-in Error class and includes additional properties.
 *
 * @class GeneralError
 * @remarks
 * This class is used to provide a standardized way of handling and reporting errors
 * throughout the application.
 * @example
 * try {
 *  throw new GeneralError('ValidationError', 'The input data is invalid', { input: 'example@example.com' });
 * } catch (error) {
 *  console.error(error.toString());
 * }
 */
export class GeneralError extends Error {
  /** Representing the type of error. */
  public name: string;
  /** Additional details about the error's cause, which is optional. */
  public cause?: unknown;
  /** Stack trace of the error */
  public stack?: string;

  /**
   * Initializes an instance of the GeneralError class.
   *
   * @param name - The name/type of the error. Defaults to 'GeneralError'.
   * @param message - A detailed explanation of the error. Defaults to 'An error occurred'.
   * @param cause - Optional cause of the error, which can be any value.
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

    // Ensuring that stack trace is captured correctly
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GeneralError);
    }
    this.stack = this.stack || new Error().stack; // Ensure stack trace exists
  }

  /**
   * Returns a string representation of the error.
   *
   * @returns A formatted string containing error details.
   */
  public toString(): string {
    const causeInfo =
      this.cause !== undefined
        ? `\nCaused by: ${typeof this.cause === 'object' ? JSON.stringify(this.cause) : this.cause}`
        : '';
    return `${this.name}: ${this.message}${causeInfo}\nStack: ${this.stack || 'N/A'}`;
  }
}

/**
 * Check if error is instance of GeneralError or not
 *
 * @returns A GeneralError instance
 */
export function isGeneralError(error: unknown): error is GeneralError {
  return error instanceof GeneralError;
}
