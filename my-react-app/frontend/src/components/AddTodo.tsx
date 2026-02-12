import { useState, FormEvent } from 'react';
import { useAddTodo } from '../api/todos';

export default function AddTodo() {
  const [title, setTitle] = useState('');
  const addTodo = useAddTodo();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addTodo.mutate(trimmed, { onSuccess: () => setTitle('') });
  };

  return (
    <form className="flex gap-2 mb-6" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 text-base"
      />
      <button
        type="submit"
        disabled={addTodo.isPending}
        className="px-5 py-2 bg-indigo-500 text-white rounded text-base cursor-pointer hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Add
      </button>
    </form>
  );
}
