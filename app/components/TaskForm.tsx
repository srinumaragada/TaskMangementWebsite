'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';

interface TaskFormProps {
  projectId: string;
  onSubmit: (taskData: any) => Promise<void>;
  initialData?: any;
}

export default function TaskForm({ projectId, onSubmit, initialData }: TaskFormProps) {
  const { members } = useSelector((state: RootState) => state.members);
  const [taskData, setTaskData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    assignedTo: initialData?.assignedTo || (members.length > 0 ? members[0]._id : ''),
    deadline: initialData?.deadline || new Date().toISOString().split('T')[0],
    status: initialData?.status || 'not-started',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        ...taskData,
        project: projectId
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
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
        <label className="block text-sm font-medium text-gray-700">Assigned To</label>
        <select
          value={taskData.assignedTo}
          onChange={(e) => setTaskData({...taskData, assignedTo: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        >
          {members.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Deadline</label>
        <input
          type="date"
          value={taskData.deadline}
          onChange={(e) => setTaskData({...taskData, deadline: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          value={taskData.status}
          onChange={(e) => setTaskData({...taskData, status: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        >
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? 'Saving...' : 'Save Task'}
      </button>
    </form>
  );
}