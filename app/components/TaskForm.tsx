// components/TaskForm.tsx
import { useState, useEffect } from 'react';

interface TaskFormProps {
  onSubmit: (taskData: any) => Promise<void>;
  initialTask?: any; // Changed from initialData to initialTask for clarity
  onClose?: () => void; // Added optional close handler
}

export default function TaskForm({ onSubmit, initialTask, onClose }: TaskFormProps) {
  // Map your task data structure to form fields
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0], // Changed from deadline to dueDate
    priority: 'medium', // Added priority field
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update form state when initialTask changes
  useEffect(() => {
    if (initialTask) {
      setTaskData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        dueDate: initialTask.dueDate 
          ? new Date(initialTask.dueDate).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
        priority: initialTask.priority || 'medium',
      });
    } else {
      // Reset form when creating new task
      setTaskData({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'medium',
      });
    }
  }, [initialTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        ...taskData,
        // Convert date string back to ISO format if needed
        dueDate: new Date(taskData.dueDate).toISOString()
      });
      if (onClose) onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title*</label>
          <input
            type="text"
            value={taskData.title}
            onChange={(e) => setTaskData({...taskData, title: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={taskData.description}
            onChange={(e) => setTaskData({...taskData, description: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date*</label>
          <input
            type="date"
            value={taskData.dueDate}
            onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority*</label>
          <select
            value={taskData.priority}
            onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </form>
    </div>
  );
}