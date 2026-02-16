import { useState } from 'react';
import { useTodos } from '../api/todos';
import TodoItem from './TodoItem';

type Filter = 'all' | 'active' | 'completed';

export default function TodoList() {
  const { data: todos, isLoading, error } = useTodos();
  const [filter, setFilter] = useState<Filter>('all');

  if (isLoading) return (
    <div className="text-center py-8">
      <div className="inline-flex items-center gap-2 text-indigo-500">
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-medium">Loading todos...</span>
      </div>
    </div>
  );
  if (error) return (
    <div className="text-center py-8 px-4 bg-red-50 rounded-xl border border-red-200">
      <p className="text-red-600 font-medium">Error loading todos: {error.message}</p>
    </div>
  );
  if (!todos || todos.length === 0) return (
    <div className="text-center py-12 px-4 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 rounded-xl border border-gray-200/50">
      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p className="text-gray-500 font-medium text-lg mb-1">No tasks yet</p>
      <p className="text-gray-400 text-sm">Create your first task to get started</p>
    </div>
  );

  const filtered = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const remaining = todos.filter((t) => !t.completed).length;

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">
            {remaining}
          </span>
          <span className="text-sm text-gray-400">
            {remaining === 1 ? 'item' : 'items'} remaining
          </span>
        </div>
        <div className="inline-flex gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                filter === f.key
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <ul className="list-none bg-white rounded-xl border border-gray-100 p-3">
        {filtered.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
      {filtered.length === 0 && (
        <div className="text-center py-8 px-4 bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl border border-gray-100 mt-3">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-500 font-medium">No {filter} tasks</p>
        </div>
      )}
    </div>
  );
}
