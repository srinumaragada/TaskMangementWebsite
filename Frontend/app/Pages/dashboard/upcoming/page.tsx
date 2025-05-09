"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { useTasks } from '@/app/context/TaskContext';
import EmptyState from './empty-state';
import { Calendar as CalendarIcon, Plus, Clock, Check, Trash2, Edit } from 'lucide-react';
import type { Task } from '@/app/types/tasks';
import { motion, AnimatePresence } from 'framer-motion';
import AddTaskModal from '@/app/components/AddTaskModal';
import {
  format,
  addDays,
  isSameDay,
  startOfDay,
  differenceInDays,
  isToday,
  isYesterday,
  isTomorrow,
  parseISO,
  addMonths,
} from 'date-fns';

const UpcomingPage = () => {
  const { displayName } = useAuth();
  const { tasks, addTask, updateTask, deleteTask, completeTask } = useTasks();
  const today = startOfDay(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Set date range to show from today onwards
  const [dateRange, setDateRange] = useState({
    start: today,
    end: addDays(today, 30),
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [activeDateElement, setActiveDateElement] = useState<HTMLElement | null>(null);

  const dates = Array.from({ length: differenceInDays(dateRange.end, dateRange.start) + 1 }, (_, i) =>
    addDays(dateRange.start, i)
  );

  // Get overdue tasks (before today and not completed)
  const overdueTasks = tasks
    .filter(task => {
      if (!task.dueDate || task.completed) return false;
      const taskDate = startOfDay(parseISO(task.dueDate));
      return taskDate < today;
    })
    .map(task => {
      const taskDate = startOfDay(parseISO(task.dueDate));
      return {
        ...task,
        daysOverdue: differenceInDays(today, taskDate),
      };
    })
    .sort((a, b) => differenceInDays(parseISO(b.dueDate), parseISO(a.dueDate)));

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      return isSameDay(parseISO(task.dueDate), date);
    });
  };

  const formatDateDisplay = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      if (!taskId) {
        console.error('Cannot delete task - no task ID provided');
        return;
      }
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    if (task.completed) return; // Don't allow editing completed tasks
    setEditingTask(task);
    setSelectedDate(task.dueDate ? parseISO(task.dueDate) : null);
    setShowModal(true);
  };

  const handleDateClick = (date: Date, element: HTMLElement) => {
    setSelectedDate(date);
    setEditingTask(null);

    const rect = element.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    const top = rect.bottom - (containerRect?.top || 0) + (containerRef.current?.scrollTop || 0);
    const left = rect.left - (containerRect?.left || 0);

    setModalPosition({ top, left });
    setActiveDateElement(element);
    setShowModal(true);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPosition = scrollTop + clientHeight;
    const loadThreshold = 200;

    if (scrollHeight - scrollPosition < loadThreshold) {
      setDateRange(prev => ({
        ...prev,
        end: addMonths(prev.end, 1),
      }));
    }

    if (scrollTop < loadThreshold) {
      setDateRange(prev => ({
        start: addMonths(prev.start, -1),
        end: prev.end,
      }));
    }
  };

  const groupedDates: { [monthYear: string]: Date[] } = {};
  dates.forEach(date => {
    const key = format(date, 'MMMM yyyy');
    if (!groupedDates[key]) groupedDates[key] = [];
    groupedDates[key].push(date);
  });

  const totalTasks = tasks.filter(t => t.dueDate && !t.completed).length + overdueTasks.length;

  return (
    <div className="h-full flex flex-col relative">
      <div className="p-6 pb-0 flex-shrink-0">
        <h1 className="text-2xl font-bold mb-6">Upcoming</h1>

        {overdueTasks.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <div className="flex items-center text-red-500 mb-3">
              <Clock className="h-5 w-5 mr-2" />
              <h2 className="font-semibold">Overdue</h2>
              <span className="ml-2 text-sm">({overdueTasks.length})</span>
            </div>
            <div className="space-y-2">
              {overdueTasks.map(task => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center p-4 bg-red-50 rounded-xl border border-red-100"
                >
                  <button
                    onClick={() => handleCompleteTask(task._id)}
                    className={`mr-3 flex-shrink-0 h-5 w-5 rounded-full border ${
                      task.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    } flex items-center justify-center`}
                  >
                    {task.completed && <Check className="h-3 w-3" />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-red-500 mt-1">
                      {task.daysOverdue === 1 ? '1 day overdue' : `${task.daysOverdue} days overdue`}
                    </p>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditTask(task)} 
                      className="p-1 text-gray-500 hover:text-blue-500"
                      disabled={task.completed}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task._id)} 
                      className="p-1 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 pb-6">
        {Object.entries(groupedDates).map(([monthYear, monthDates]) => (
          <div key={monthYear} className="mb-10">
            <h2 className="text-xl font-semibold mb-4">{monthYear}</h2>
            {monthDates.map(date => {
              const dateTasks = getTasksForDate(date);
              const isTodayDate = isToday(date);
              return (
                <div
                  key={date.toString()}
                  className="mb-6"
                  ref={el => {
                    if (el && selectedDate && isSameDay(date, selectedDate) && !activeDateElement) {
                      setActiveDateElement(el);
                    }
                  }}
                >
                  <div className={`flex items-center mb-2 ${isTodayDate ? 'text-blue-600' : 'text-gray-700'}`}>
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">{formatDateDisplay(date)}</span>
                    <button
                      onClick={e => handleDateClick(date, e.currentTarget.closest('.mb-6') as HTMLElement)}
                      className="ml-auto p-1 rounded-full hover:bg-gray-100"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  {dateTasks.length > 0 ? (
                    <div className="space-y-2 ml-7">
                      {dateTasks.map(task => (
                        <motion.div
                          key={task._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center p-3 rounded-lg border shadow-sm ${
                            task.daysOverdue > 0
                              ? 'bg-red-50 border-red-200'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <button
                            onClick={() => handleCompleteTask(task._id)}
                            className={`mr-3 flex-shrink-0 h-5 w-5 rounded-full border ${
                              task.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            } flex items-center justify-center`}
                          >
                            {task.completed && <Check className="h-3 w-3" />}
                          </button>
                          <div className="flex-1">
                            <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-1 text-gray-500 hover:text-blue-500"
                              disabled={task.completed}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="p-1 text-gray-500 hover:text-red-500"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="ml-7 text-sm text-gray-400 py-2">No tasks scheduled</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && activeDateElement && (
          <div
            className="absolute z-50"
            style={{
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              width: 'calc(100% - 48px)',
              maxWidth: '400px',
            }}
          >
            <AddTaskModal
              initialDate={selectedDate}
              editingTask={editingTask}
              onClose={() => {
                setShowModal(false);
                setSelectedDate(null);
                setEditingTask(null);
                setActiveDateElement(null);
              }}
              onSubmit={newTask => {
                if (editingTask) {
                  updateTask(editingTask._id, newTask);
                } else {
                  addTask(newTask);
                }
                setShowModal(false);
                setSelectedDate(null);
                setEditingTask(null);
                setActiveDateElement(null);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {totalTasks === 0 && <EmptyState displayName={displayName} />}
    </div>
  );
};

export default UpcomingPage;