import { Todo } from '../types';
import { useToggleTodo, useDeleteTodo } from '../api/todos';

interface Props {
  todo: Todo;
}

export default function TodoItem({ todo }: Props) {
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  return (
    <li className="flex items-center justify-between py-2.5 border-b border-gray-200 last:border-b-0">
      <label className="flex items-center gap-2 cursor-pointer flex-1">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleTodo.mutate(todo)}
          className="accent-indigo-500"
        />
        <span className={todo.completed ? 'line-through text-gray-400' : ''}>
          {todo.title}
        </span>
      </label>
      <button
        className="bg-transparent border-none text-red-500 cursor-pointer text-sm px-2 py-1 rounded hover:bg-red-100"
        onClick={() => deleteTodo.mutate(todo.id)}
      >
        Delete
      </button>
    </li>
  );
}
