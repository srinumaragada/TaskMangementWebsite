"use client";
import { RootState } from '@/app/redux/store/store';
import React from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle } from 'lucide-react';

const CompletedTasks = () => {
  const { tasks = [] } = useSelector((state: RootState) => state.Tasks);

  const completedTasks = Array.isArray(tasks)
    ? tasks.filter(task => task.completed === true)
    : [];

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
        <h1 className="text-xl font-bold">Completed Tasks</h1>
        <span className="ml-2 text-gray-500">({completedTasks.length})</span>
      </div>

      {completedTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No completed tasks yet
        </div>
      ) : (
        <div className="space-y-4">
          {completedTasks.map((task) => (
            <div 
              key={task._id}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 mt-1 mr-3 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium line-through text-gray-600">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-500 mt-1 line-through">{task.description}</p>
                  )}
                  <div className="flex items-center mt-2 text-sm text-gray-400">
                    {task.dueDate && (
                      <span className="flex items-center mr-3">
                        <span className="mr-1">📅</span>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center">
                      <span className="mr-1">🏷️</span>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default CompletedTasks