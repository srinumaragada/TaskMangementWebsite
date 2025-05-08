"use client";

import React from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { useTasks } from '@/app/context/TaskContext';
import Demo from './demo';
import TaskItem from '@/app/components/TaskItem';
import ViewSettings from '@/app/components/ViewSettings';
import BoardView from '@/app/components/BoardView';
import Toast from '@/app/components/Toast';

import type { Task, ViewSettings as ViewSettingsType, PriorityType, GroupingType } from '@/app/types/tasks';
import { labels } from '@/app/utils/page';

const Today = () => {
  const { displayName } = useAuth();
  const { tasks: contextTasks, completeTask, deleteTask, updateTask } = useTasks();

  const tasks: Task[] = contextTasks.map(task => ({
    ...task,
    priority: ['low', 'medium', 'high'].includes(task.priority)
      ? task.priority as PriorityType
      : 'medium'
  }));

  const [viewSettings, setViewSettings] = React.useState<ViewSettingsType>({
    view: 'list',
    grouping: 'none',
    sorting: 'dueDate',
    direction: 'asc',
    filter: 'all'
  });

  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  const today = new Date().toISOString().split('T')[0];

  const groupTasks = (tasksToGroup: Task[], grouping: GroupingType) => {
    switch (grouping) {
      case 'priority':
        return {
          'High Priority': tasksToGroup.filter(task => task.priority === 'high'),
          'Medium Priority': tasksToGroup.filter(task => task.priority === 'medium'),
          'Low Priority': tasksToGroup.filter(task => task.priority === 'low')
        };
      case 'label':
        const labelGroups: Record<string, Task[]> = {};
        labels.forEach(label => {
          labelGroups[label.name] = tasksToGroup.filter(task =>
            task.labels.includes(label.id)
          );
        });
        labelGroups['Unlabeled'] = tasksToGroup.filter(task =>
          task.labels.length === 0
        );
        return labelGroups;
      case 'dueDate':
        const dateGroups: Record<string, Task[]> = {};
        tasksToGroup.forEach(task => {
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
        tasksToGroup.forEach(task => {
          const assignee = task.assignee || 'Unassigned';
          if (!assigneeGroups[assignee]) {
            assigneeGroups[assignee] = [];
          }
          assigneeGroups[assignee].push(task);
        });
        return assigneeGroups;
      default:
        return { 'All Tasks': tasksToGroup };
    }
  };

  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks.filter(task => {
      if (!task.dueDate) return true;
      const taskDueDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDueDate === today && !task.completed;
    });

    if (viewSettings.filter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === viewSettings.filter);
    }

    const priorityOrder: Record<PriorityType, number> = {
      high: 3,
      medium: 2,
      low: 1
    };

    const sortedTasks = [...filteredTasks].sort((a, b) => {
      let comparison = 0;
      switch (viewSettings.sorting) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = 0;
      }
      return viewSettings.direction === 'asc' ? comparison : -comparison;
    });

    return groupTasks(sortedTasks, viewSettings.grouping);
  };

  const groupedTasks = getFilteredAndSortedTasks();

  const handleViewSettingsChange = (setting: keyof ViewSettingsType, value: string) => {
    setViewSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleComplete = (taskId: string) => {
    completeTask(taskId);
    setToastMessage('✅ Great job! Task completed.');
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  if (Object.values(groupedTasks).flat().length === 0) {
    return <Demo displayName={displayName} />;
  }

  return (
    <div className="flex-1 p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-bold text-lg select-text">Today</h1>
        <ViewSettings
          settings={viewSettings}
          onChange={handleViewSettingsChange}
        />
      </div>

      {viewSettings.view === 'list' && (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([groupName, tasks]) => (
            <div key={groupName}>
              {viewSettings.grouping !== 'none' && (
                <h2 className="font-semibold text-md mb-3 sticky top-0 bg-white py-2 z-10">
                  {groupName} <span className="text-gray-500 text-sm">({tasks.length})</span>
                </h2>
              )}
              <div className="space-y-3">
                {tasks.map(task => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    onComplete={handleComplete}
                    onDelete={deleteTask}
                    onUpdate={updateTask}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewSettings.view === 'board' && (
        <BoardView
          tasks={Object.values(groupedTasks).flat()}
          grouping={viewSettings.grouping}
          onComplete={handleComplete}
          onDelete={deleteTask}
          onUpdate={updateTask}
        />
      )}

      {viewSettings.view === 'calendar' && (
        <div className="text-center py-8">
          <p className="text-gray-500">Calendar view coming soon</p>
        </div>
      )}

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
};

export default Today;
