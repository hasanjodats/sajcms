import { Task } from '@common/pattern/batch-processing/task/task';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';

/**
 * @interface RetryOption
 * Configuration options for retrying tasks, including maximum attempts, delay between attempts, and timeouts.
 *
 * This interface defines how task retries should behave, allowing you to configure the number of retry attempts,
 * the delay between attempts, and the timeout for each operation.
 */
export type RetryOption = {
  /**
   * The maximum number of attempts to retry the task.
   * If not specified, the default value is 1.
   */
  maximumAttempts?: number;

  /**
   * The delay between each retry attempt in milliseconds.
   * If not specified, the default delay is 1000 milliseconds (1 second).
   */
  attemptDelay?: number;

  /**
   * The timeout duration in milliseconds for each retry attempt.
   * If not specified, the default value is `Infinity`, meaning no timeout will be applied.
   */
  timeout?: number;
};

/**
 * Checks if there is a circular dependency within a task or workflow graph.
 *
 * A circular dependency occurs when a task or workflow depends on itself directly or indirectly,
 * which can lead to an infinite loop and failure in execution. This function traverses the graph
 * of dependencies and detects any cycles.
 *
 * @param taskOrWorkflow - The task or workflow object to check for circular dependencies.
 * @param visited - A set that tracks the IDs of tasks or workflows that have already been visited.
 * @param stack - A set that tracks the tasks currently being processed in the current call stack.
 *
 * @returns {boolean} - Returns `true` if a circular dependency is detected, otherwise returns `false`.
 */
export function hasCircularDependency(
  taskOrWorkflow: Task | Workflow,
  visited = new Set<string>(),
  stack = new Set<string>(),
): boolean {
  const id = taskOrWorkflow.id;

  // If the current task/workflow is already in the stack, a circular dependency is found
  if (stack.has(id)) return true; /** Found circular dependency */

  // If the current task/workflow has been visited before, no cycle exists in this branch
  if (visited.has(id)) return false;

  // Mark the task/workflow as visited and add it to the current stack
  visited.add(id);
  stack.add(id);

  // Recursively check dependencies for circular references
  for (const dependency of taskOrWorkflow.dependencies || []) {
    if (hasCircularDependency(dependency, visited, stack)) {
      return true;
    }
  }

  // Remove the current task/workflow from the stack as we've finished processing it
  stack.delete(id);

  // No circular dependency was found
  return false;
}
