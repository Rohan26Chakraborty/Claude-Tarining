import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';
import ActivityLog from './components/ActivityLog';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-gray-800 font-sans">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 p-8 sm:p-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
              Tasks
            </h1>
            <p className="text-center text-gray-500 text-sm">Organize your day, one task at a time</p>
          </div>
          <AddTodo />
          <TodoList />
          <ActivityLog />
        </div>
      </div>
    </div>
  );
}
