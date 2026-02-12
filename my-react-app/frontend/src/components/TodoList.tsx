import { useTodos } from '../api/todos';
import TodoItem from './TodoItem';

export default function TodoList() {
  const { data: todos, isLoading, error } = useTodos();

  if (isLoading) return <p className="text-center text-gray-500">Loading todos...</p>;
  if (error) return <p className="text-center text-red-500">Error loading todos: {error.message}</p>;
  if (!todos || todos.length === 0) return <p className="text-center text-gray-400 italic">No todos yet. Add one above!</p>;

  return (
    <ul className="list-none">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
