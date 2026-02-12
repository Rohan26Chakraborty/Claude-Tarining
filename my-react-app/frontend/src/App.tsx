import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Todo App</h1>
        <AddTodo />
        <TodoList />
      </div>
    </div>
  );
}
