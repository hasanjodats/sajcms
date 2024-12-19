/**
 * @interface RetryOption
 * Defines the configuration for retrying tasks, including maximum attempts and timeouts.
 */
export type RetryOption = {
  /** Maximum number of attempts to run (Default is 1) */
  maximumAttempts?: number;
  /** Delay between each execution in milliseconds (Default is 1000) */
  attemptDelay?: number;
  /** Timeout of operation execution in milliseconds (Default is Infinity) */
  timeout?: number;
};

/**
 * Checks for circular dependencies in a task or workflow graph.
 * @param taskOrWorkflow - The workflow or task object.
 * @param visited -
 * @param stack -
 * @returns {void}.
 */
export function hasCircularDependency(
  taskOrWorkflow: any,
  visited = new Set<string>(),
  stack = new Set<string>(),
): boolean {
  const id = taskOrWorkflow.id;

  if (stack.has(id)) return true; /** Found circular dependency */
  if (visited.has(id)) return false;

  visited.add(id);
  stack.add(id);

  for (const dependency of taskOrWorkflow.dependencies || []) {
    if (hasCircularDependency(dependency, visited, stack)) {
      return true;
    }
  }

  stack.delete(id);
  return false;
}
