import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Todo, Priority } from '../types';
import { useToggleTodo, useDeleteTodo, useUpdateTodo } from '../api/todos';

interface Props {
  todo: Todo;
}

const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
  high: { label: 'High', color: 'text-red-600', dot: 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-200' },
  medium: { label: 'Med', color: 'text-yellow-600', dot: 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200' },
  low: { label: 'Low', color: 'text-green-600', dot: 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-200' },
};

function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  const today = new Date(new Date().toDateString());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TodoItem({ todo }: Props) {
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const updateTodo = useUpdateTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== todo.title) {
      updateTodo.mutate({ id: todo.id, title: trimmed });
    }
    setIsEditing(false);
    setEditTitle(todo.title);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(todo.title);
    }
  };

  const prio = priorityConfig[todo.priority];
  const overdue = isOverdue(todo.dueDate) && !todo.completed;

  return (
    <li className="flex items-center justify-between py-3.5 px-3 -mx-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-violet-50/50 border-b border-gray-100 last:border-b-0 group transition-all duration-150">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleTodo.mutate(todo)}
          className="w-5 h-5 accent-indigo-500 rounded-md cursor-pointer shrink-0 transition-transform hover:scale-110"
        />
        <span className={`w-3 h-3 rounded-full shrink-0 ${prio.dot}`} title={prio.label} />
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-1.5 border-2 border-indigo-300 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        ) : (
          <span
            className={`truncate cursor-pointer font-medium transition-colors ${
              todo.completed ? 'line-through text-gray-400' : 'text-gray-700 hover:text-indigo-600'
            }`}
            onDoubleClick={() => {
              setEditTitle(todo.title);
              setIsEditing(true);
            }}
            title="Double-click to edit"
          >
            {todo.title}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 ml-3 shrink-0">
        {todo.dueDate && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-lg transition-all ${
              overdue
                ? 'bg-red-100 text-red-600 ring-1 ring-red-200'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {overdue && '!'} {formatDueDate(todo.dueDate)}
          </span>
        )}
        <button
          className="text-red-500 cursor-pointer text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:scale-105"
          onClick={() => deleteTodo.mutate(todo.id)}
          title="Delete todo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  );
}
