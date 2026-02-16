import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Todo, ActivityLog, Priority } from '../types';

const API_URL = '/api/todos';

async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

async function addTodo(data: { title: string; priority: Priority; dueDate?: string }): Promise<Todo> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add todo');
  return res.json();
}

async function toggleTodo(todo: Todo): Promise<Todo> {
  const res = await fetch(`${API_URL}/${todo.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !todo.completed }),
  });
  if (!res.ok) throw new Error('Failed to toggle todo');
  return res.json();
}

async function updateTodo(data: { id: string; title?: string; priority?: Priority; dueDate?: string | null }): Promise<Todo> {
  const { id, ...body } = data;
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete todo');
}

async function fetchActivityLogs(): Promise<ActivityLog[]> {
  const res = await fetch(`${API_URL}/activity`);
  if (!res.ok) throw new Error('Failed to fetch activity logs');
  return res.json();
}

export function useTodos() {
  return useQuery({ queryKey: ['todos'], queryFn: fetchTodos });
}

export function useAddTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useToggleTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useActivityLogs() {
  return useQuery({ queryKey: ['activity'], queryFn: fetchActivityLogs });
}
