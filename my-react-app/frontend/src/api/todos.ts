import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Todo, ActivityLog, Priority, Status, DurationUnit } from '../types';
import { nextStatus } from '../utils';

const API_URL = '/api/todos';

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(API_URL, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

export async function addTodo(data: {
  title: string;
  description?: string;
  priority: Priority;
  durationValue?: number;
  durationUnit?: DurationUnit;
  dueDate?: string;
}): Promise<Todo> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add todo');
  return res.json();
}

export async function cycleStatusFn(todo: Todo): Promise<Todo> {
  const res = await fetch(`${API_URL}/${todo.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status: nextStatus(todo.status) }),
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

export async function updateTodo(data: {
  id: string;
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  durationValue?: number | null;
  durationUnit?: DurationUnit | null;
  dueDate?: string | null;
}): Promise<Todo> {
  const { id, ...body } = data;
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to delete todo');
}

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  const res = await fetch(`${API_URL}/activity`, { headers: authHeaders() });
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

export function useCycleStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cycleStatusFn,
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

export async function forgotPassword(email: string): Promise<{ resetToken: string | null }> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? 'Reset failed');
  }
}
