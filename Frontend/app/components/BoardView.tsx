"use client";

import React from 'react';
import TaskItem from './TaskItem';
import type { Task, GroupingType } from '@/app/types/tasks';
import { labels } from '@/app/utils/page';

interface BoardViewProps {
  tasks: Task[];
  grouping: GroupingType;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const BoardView: React.FC<BoardViewProps> = ({ 
  tasks, 
  grouping, 
  onComplete, 
  onDelete, 
  onUpdate 
}) => {
  // Helper function to group tasks
  const groupTasks = () => {
    switch (grouping) {
      case 'priority':
        return {
          'High Priority': tasks.filter(task => task.priority === 'high'),
          'Medium Priority': tasks.filter(task => task.priority === 'medium'),
          'Low Priority': tasks.filter(task => task.priority === 'low')
        };
      
      case 'label':
        const labelGroups: Record<string, Task[]> = {};
        labels.forEach(label => {
          labelGroups[label.name] = tasks.filter(task => 
            task.labels.includes(label.id)
          );
        });
        labelGroups['Unlabeled'] = tasks.filter(task => 
          task.labels.length === 0
        );
        return labelGroups;
      
      case 'dueDate':
        const dateGroups: Record<string, Task[]> = {};
        tasks.forEach(task => {
          const dateKey = task.dueDate 
            ? new Date(task.dueDate).toLocaleDateString() 
            : 'No Deadline';
          if (!dateGroups[dateKey]) {
            dateGroups[dateKey] = [];
          }
          dateGroups[dateKey].push(task);
        });
        return dateGroups;
      
      case 'assignee':
        const assigneeGroups: Record<string, Task[]> = {};
        tasks.forEach(task => {
          const assignee = task.assignee || 'Unassigned';
          if (!assigneeGroups[assignee]) {
            assigneeGroups[assignee] = [];
          }
          assigneeGroups[assignee].push(task);
        });
        return assigneeGroups;
      
      default: // 'none'
        return { 'All Tasks': tasks };
    }
  };

  const groupedTasks = groupTasks();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
        <div key={groupName} className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-4">
            {groupName}
            <span className="ml-2 text-sm text-gray-500">
              ({groupTasks.length})
            </span>
          </h3>
          <div className="space-y-3">
            {groupTasks.length > 0 ? (
              groupTasks.map(task => (
                <TaskItem 
                  key={task._id}
                  task={task}
                  onComplete={onComplete}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                No tasks in this group
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoardView;