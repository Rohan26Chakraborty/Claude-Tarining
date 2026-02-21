import { describe, it, expect, vi, afterEach } from 'vitest';
import { isOverdue, formatDueDate, nextStatus, formatDuration } from '../utils';

// Helper: YYYY-MM-DD in LOCAL timezone, offset by `days` from today
function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// ─── isOverdue ────────────────────────────────────────────────────────────────

describe('isOverdue', () => {
  it('returns false when dueDate is undefined', () => {
    expect(isOverdue(undefined, 'pending')).toBe(false);
  });

  it('returns false when status is "completed" regardless of date', () => {
    expect(isOverdue('2020-01-01', 'completed')).toBe(false);
  });

  it('returns true for a past date on a pending task', () => {
    expect(isOverdue('2020-01-01', 'pending')).toBe(true);
  });

  it('returns true for a past date on an in-progress task', () => {
    expect(isOverdue('2020-01-01', 'in-progress')).toBe(true);
  });

  it('returns false for a future date', () => {
    expect(isOverdue(dateOffset(3), 'pending')).toBe(false);
  });

  it('returns false for today (not yet overdue)', () => {
    expect(isOverdue(dateOffset(0), 'pending')).toBe(false);
  });
});

// ─── nextStatus ───────────────────────────────────────────────────────────────

describe('nextStatus', () => {
  it('pending → in-progress', () => {
    expect(nextStatus('pending')).toBe('in-progress');
  });

  it('in-progress → completed', () => {
    expect(nextStatus('in-progress')).toBe('completed');
  });

  it('completed → pending (wraps around)', () => {
    expect(nextStatus('completed')).toBe('pending');
  });

  it('full cycle returns to original status', () => {
    let s = nextStatus('pending');   // in-progress
    s = nextStatus(s);               // completed
    s = nextStatus(s);               // pending
    expect(s).toBe('pending');
  });
});

// ─── formatDuration ───────────────────────────────────────────────────────────

describe('formatDuration', () => {
  it('returns null when value is undefined', () => {
    expect(formatDuration(undefined, 'minutes')).toBeNull();
  });

  it('returns null when unit is undefined', () => {
    expect(formatDuration(30, undefined)).toBeNull();
  });

  it('returns null when value is 0 (falsy)', () => {
    expect(formatDuration(0, 'hours')).toBeNull();
  });

  it('formats minutes correctly', () => {
    expect(formatDuration(30, 'minutes')).toBe('30 minutes');
  });

  it('formats hours correctly', () => {
    expect(formatDuration(2, 'hours')).toBe('2 hours');
  });

  it('formats days correctly', () => {
    expect(formatDuration(1, 'days')).toBe('1 days');
  });
});

// ─── formatDueDate ────────────────────────────────────────────────────────────

// Timezone-safe helper: YYYY-MM-DD in local time
function localStr(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

describe('formatDueDate', () => {
  it('returns "Today" for today\'s local date', () => {
    expect(formatDueDate(localStr(new Date()))).toBe('Today');
  });

  it('returns "Tomorrow" for tomorrow\'s local date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(formatDueDate(localStr(tomorrow))).toBe('Tomorrow');
  });

  it('returns formatted month/day for a fixed far-future date', () => {
    expect(formatDueDate('2099-12-25')).toBe('Dec 25');
  });

  it('returns formatted month/day for a fixed past date', () => {
    expect(formatDueDate('2000-01-01')).toBe('Jan 1');
  });
});
