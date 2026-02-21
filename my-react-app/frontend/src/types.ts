export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'pending' | 'in-progress' | 'completed';
export type DurationUnit = 'minutes' | 'hours' | 'days';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  durationValue?: number;
  durationUnit?: DurationUnit;
  dueDate?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: 'created' | 'in-progress' | 'completed' | 'uncompleted' | 'deleted';
  todoTitle: string;
  timestamp: string;
}
