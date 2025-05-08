// components/tasks/TaskBoard.tsx
"use client";

import { Task } from '@/app/types/project';
import TaskCard from './TaskCard';

interface TaskBoardProps {
  userId: string;
  projectId: string;
  tasksByStatus: {
    todo: Task[];
    'in-progress': Task[];
    completed: Task[];
  };
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export default function TaskBoard({ 
  userId,
  projectId,
  tasksByStatus, 
  onEditTask, 
  onDeleteTask 
}: TaskBoardProps) {
  
  // Ensure we have valid arrays even if props are undefined
  const todoTasks = Array.isArray(tasksByStatus?.todo) ? tasksByStatus.todo : [];
  const inProgressTasks = Array.isArray(tasksByStatus?.['in-progress']) ? tasksByStatus['in-progress'] : [];
  const completedTasks = Array.isArray(tasksByStatus?.completed) ? tasksByStatus.completed : [];



  const statusColumns = [
    { id: 'todo', title: 'To Do', tasks: todoTasks },
    { id: 'in-progress', title: 'In Progress', tasks: inProgressTasks },
    { id: 'completed', title: 'Completed', tasks: completedTasks },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statusColumns.map((column) => (
        <div key={column.id} className="bg-gray-50 rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-4">
            {column.title} ({column.tasks.length})
          </h2>
          
          {column.tasks.length > 0 ? (
            column.tasks.map((task) => (
              <TaskCard
              projectId={projectId}
                key={task?._id || Math.random().toString(36).substring(2, 9)}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No tasks in this category</p>
          )}
        </div>
      ))}
    </div>
  );
}