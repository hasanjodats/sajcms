import { Task, TaskResponse } from '@common/pattern/batch-processing/task/task';
import { Workflow } from '@common/pattern/batch-processing/workflow/workflow';

export interface Action {
  name: string;
  execute: (task: Task, workflow: Workflow) => Promise<TaskResponse>;
  undo?: (task: Task, workflow: Workflow) => Promise<TaskResponse>;
  configure?: (config: any) => void;
}
