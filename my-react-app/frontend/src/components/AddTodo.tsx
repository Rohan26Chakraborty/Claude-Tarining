import { useState, FormEvent } from 'react';
import { useAddTodo } from '../api/todos';
import type { Priority } from '../types';

export default function AddTodo() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const addTodo = useAddTodo();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addTodo.mutate(
      { title: trimmed, priority, dueDate: dueDate || undefined },
      {
        onSuccess: () => {
          setTitle('');
          setPriority('medium');
          setDueDate('');
          setShowOptions(false);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-base placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className={`px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 ${
            showOptions
              ? 'border-indigo-400 text-indigo-600 bg-indigo-50'
              : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
          }`}
          title="More options"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          type="submit"
          disabled={addTodo.isPending}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {addTodo.isPending ? 'Adding...' : 'Add'}
        </button>
      </div>
      {showOptions && (
        <div className="flex flex-wrap gap-3 mt-3 p-4 bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl border border-gray-200/50">
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Priority</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Due Date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
            />
          </label>
        </div>
      )}
    </form>
  );
}
