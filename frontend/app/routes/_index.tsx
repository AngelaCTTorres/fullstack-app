import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { apiService, type Task, type CreateTaskRequest } from "~/services/api";

export const meta: MetaFunction = () => {
  return [
    { title: "Fullstack Task Manager" },
    { name: "description", content: "Remix + .NET 9 Full Stack Application" },
  ];
};

export default function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<CreateTaskRequest>({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar tareas y estadísticas en paralelo
      const [tasksData, statsData] = await Promise.all([
        apiService.getTasks(),
        apiService.getTaskStats().catch(() => ({ total: 0, completed: 0, pending: 0 }))
      ]);
      
      setTasks(tasksData);
      setStats(statsData);
    } catch (err) {
      setError('Error loading data from server');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      setLoading(true);
      const createdTask = await apiService.createTask(newTask);
      setTasks(prev => [...prev, createdTask]);
      setNewTask({ title: "", description: "" });
      
      // Actualizar estadísticas
      setStats(prev => ({ 
        ...prev, 
        total: prev.total + 1, 
        pending: prev.pending + 1 
      }));
    } catch (err) {
      setError('Error creating task');
      console.error('Error adding task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      const updatedTask = {
        title: task.title,
        description: task.description,
        isCompleted: !task.isCompleted,
      };

      await apiService.updateTask(task.id, updatedTask);
      
      setTasks(prev => 
        prev.map(t => 
          t.id === task.id 
            ? { ...t, isCompleted: !t.isCompleted }
            : t
        )
      );

      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        completed: task.isCompleted ? prev.completed - 1 : prev.completed + 1,
        pending: task.isCompleted ? prev.pending + 1 : prev.pending - 1,
      }));
    } catch (err) {
      setError('Error updating task');
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    try {
      await apiService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      // Actualizar estadísticas
      setStats(prev => ({
        total: prev.total - 1,
        completed: taskToDelete.isCompleted ? prev.completed - 1 : prev.completed,
        pending: taskToDelete.isCompleted ? prev.pending : prev.pending - 1,
      }));
    } catch (err) {
      setError('Error deleting task');
      console.error('Error deleting task:', err);
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Task Manager</h1>
        <p className="text-gray-600">Fullstack App: Remix + .NET 8 + PostgreSQL por Angela Torres</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Tasks</h3>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Completed</h3>
          <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Form para agregar tareas */}
      <form onSubmit={handleAddTask} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              placeholder="Enter task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Enter task description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newTask.title.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </form>

      {/* Lista de tareas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tasks ({tasks.length})</h2>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No tasks yet. Create your first task above!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className={`bg-white border rounded-lg p-4 shadow-sm transition-all ${
                task.isCompleted ? 'opacity-75 bg-gray-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${
                    task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`text-gray-600 mt-1 ${
                      task.isCompleted ? 'line-through' : ''
                    }`}>
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.isCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      task.isCompleted
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {task.isCompleted ? 'Reopen' : 'Complete'}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}