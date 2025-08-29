// Combined task definitions for the questionnaire
import { physicalTasks, PhysicalTask, PHYSICAL_TASK_CATEGORIES } from './physicalTasks';
import { cognitiveTasks, CognitiveTask, TASK_CATEGORIES } from './tasks';

// Union type for all tasks
export type AllTask = PhysicalTask | CognitiveTask;

// Combined task categories
export const ALL_CATEGORIES = {
  ...PHYSICAL_TASK_CATEGORIES,
  ...TASK_CATEGORIES
} as const;

// Combined tasks array
export const allTasks: AllTask[] = [
  ...physicalTasks,
  ...cognitiveTasks
];

// Task lookup objects
export const physicalTaskLookup = physicalTasks.reduce((acc, task) => {
  acc[task.id] = task;
  return acc;
}, {} as Record<string, PhysicalTask>);

export const cognitiveTaskLookup = cognitiveTasks.reduce((acc, task) => {
  acc[task.id] = task;
  return acc;
}, {} as Record<string, CognitiveTask>);

export const allTaskLookup = allTasks.reduce((acc, task) => {
  acc[task.id] = task;
  return acc;
}, {} as Record<string, AllTask>);

// Category organization
export const getTasksByCategory = () => {
  const tasksByCategory: Record<string, AllTask[]> = {};
  
  allTasks.forEach(task => {
    if (!tasksByCategory[task.category]) {
      tasksByCategory[task.category] = [];
    }
    tasksByCategory[task.category].push(task);
  });
  
  return tasksByCategory;
};

// Helper functions
export const isPhysicalTask = (task: AllTask): task is PhysicalTask => {
  return (task as PhysicalTask).measurementType === 'time';
};

export const isCognitiveTask = (task: AllTask): task is CognitiveTask => {
  return (task as CognitiveTask).measurementType === 'likert';
};