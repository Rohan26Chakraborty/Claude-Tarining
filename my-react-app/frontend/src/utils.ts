import type { Status } from './types';

// Returns YYYY-MM-DD in the LOCAL timezone for a given Date
function localDateStr(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function isOverdue(dueDate?: string, status?: Status): boolean {
  if (!dueDate || status === 'completed') return false;
  return dueDate < localDateStr(new Date());
}

export function formatDueDate(dueDate: string): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dueDate === localDateStr(now)) return 'Today';
  if (dueDate === localDateStr(tomorrow)) return 'Tomorrow';
  // Parse as local midnight to avoid UTC shift in toLocaleDateString
  const date = new Date(dueDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function nextStatus(current: Status): Status {
  if (current === 'pending') return 'in-progress';
  if (current === 'in-progress') return 'completed';
  return 'pending';
}

export function formatDuration(value?: number, unit?: string): string | null {
  if (!value || !unit) return null;
  return `${value} ${unit}`;
}
