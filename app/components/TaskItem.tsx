'use client';

import React, { useState } from 'react';
import { CalendarIcon, Flag, Circle, MoreVertical, Trash2, Edit } from 'lucide-react';
import { labels, priorities } from '@/app/utils/page';
import type { Task, PriorityType } from '@/app/types/tasks';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete, onUpdate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    dueDate: task.dueDate || '',
    priority: task.priority
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const handleEditSubmit = () => {
    const updates: Partial<Task> = {
      title: editForm.title,
      dueDate: editForm.dueDate || undefined,
      priority: editForm.priority
    };
    onUpdate(task._id, updates);
    setIsEditing(false);
  };

  const handlePriorityChange = (priority: PriorityType) => {
    onUpdate(task._id, { priority });
    setIsMenuOpen(false);
  };

  const handleComplete = () => {
    onComplete(task._id);
    setIsCompleted(true);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 10000);
  };

  if (isCompleted && !showMessage) return null;


  return (
    <div className="bg-white rounded-lg shadow p-4 relative">
      <div className="flex items-start">
        <button 
          onClick={handleComplete}
          className="mr-3 mt-1 text-gray-300 hover:text-green-500 transition-colors"
        >
          <Circle className="h-5 w-5" />
        </button>

        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <div className="flex space-x-2">
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({...editForm, priority: e.target.value as PriorityType})}
                  className="p-1 border rounded text-sm"
                >
                  {priorities.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
                  className="p-1 border rounded text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-sm text-gray-600"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEditSubmit}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-medium">{task.title}</h3>
              {task.description && (
                <p className="text-gray-600 mt-1">{task.description}</p>
              )}
              <div className="flex items-center mt-2 text-sm text-gray-500">
                {task.dueDate && (
                  <span className="flex items-center mr-3">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                <span className="flex items-center">
                  <Flag className="h-4 w-4 mr-1" />
                  {task.priority}
                </span>
              </div>
              {task.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {task.labels.map((labelId) => {
                    const label = labels.find((l) => l.id === labelId);
                    return label ? (
                      <span
                        key={labelId}
                        className={`text-xs px-2 py-1 rounded-full ${label.color} text-white`}
                      >
                        {label.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {!isEditing && (
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(task._id);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
                <div className="border-t border-gray-100"></div>
                <div className="px-4 py-2 text-xs text-gray-500">Set Priority</div>
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    onClick={() => handlePriorityChange(priority.value as PriorityType)}
                    className={`flex items-center px-4 py-1 text-sm w-full text-left ${
                      task.priority === priority.value 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {priority.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showMessage && (
        <div className="mt-2 text-green-600 text-sm font-medium">
          ✅ Great job!
        </div>
      )}
    </div>
  );
};

export default TaskItem;
