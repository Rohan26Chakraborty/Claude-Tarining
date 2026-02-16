export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: 'created' | 'completed' | 'uncompleted' | 'deleted';
  todoTitle: string;
  timestamp: string;
}
