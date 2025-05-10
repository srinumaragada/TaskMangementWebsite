'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar as CalendarIcon, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { priorities } from '@/app/utils/page';
import type { Task } from '@/app/types/tasks';
import DatePicker from './DatePicker';

interface AddTaskModalProps {
  initialDate?: Date | null;
  editingTask?: Task | null;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  initialDate,
  editingTask,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  const priorityMenuRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Fill form if editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDueDate(editingTask.dueDate ? new Date(editingTask.dueDate) : null);
      setPriority(editingTask.priority);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(initialDate || null);
      setPriority('medium');
    }
  }, [editingTask, initialDate]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        datePickerRef.current && !datePickerRef.current.contains(e.target as Node)
      ) {
        setShowDatePicker(false);
      }
      if (
        priorityMenuRef.current && !priorityMenuRef.current.contains(e.target as Node)
      ) {
        setShowPriorityMenu(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowDatePicker(false);
        setShowPriorityMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      description,
      dueDate: dueDate?.toISOString(),
      priority,
      labels: editingTask?.labels || [],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-w-lg w-full mx-auto mb-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 id="modal-title" className="text-lg font-semibold">
            {editingTask ? 'Edit Task' : 'Add Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full p-2 border-b border-gray-200 focus:border-blue-500 focus:outline-none text-sm"
              autoFocus
              required
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 min-h-[80px] text-sm"
            />

            <div className="flex space-x-2">
              {/* Date Picker Button */}
              <div className="relative flex-1" ref={datePickerRef}>
                <button
                  type="button"
                  onClick={() => setShowDatePicker((prev) => !prev)}
                  className="w-full flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                  aria-haspopup="dialog"
                  aria-expanded={showDatePicker}
                >
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {dueDate
                        ? dueDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'No date'}
                    </span>
                  </div>
                </button>

                {showDatePicker && (
                  <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                    <DatePicker
                      selected={dueDate}
                      onSelect={(date) => {
                        setDueDate(date);
                        setShowDatePicker(false);
                      }}
                    />
                    <div className="flex justify-between p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDueDate(null);
                          setShowDatePicker(false);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(false)}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Dropdown */}
              <div className="relative" ref={priorityMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowPriorityMenu((prev) => !prev)}
                  className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  aria-haspopup="menu"
                  aria-expanded={showPriorityMenu}
                >
                  <Flag
                    className={`h-4 w-4 ${
                      priority === 'high'
                        ? 'text-red-500'
                        : priority === 'medium'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }`}
                  />
                </button>

                {showPriorityMenu && (
                  <div className="absolute z-10 right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                    {priorities.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => {
                          setPriority(p.value as 'low' | 'medium' | 'high');
                          setShowPriorityMenu(false);
                        }}
                        className={`flex items-center w-full px-3 py-1.5 text-left text-sm ${
                          priority === p.value
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <Flag
                          className={`h-3 w-3 mr-2 ${
                            p.value === 'high'
                              ? 'text-red-500'
                              : p.value === 'medium'
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }`}
                        />
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingTask ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddTaskModal;
