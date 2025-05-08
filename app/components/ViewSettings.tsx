"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Sliders } from 'lucide-react';
import type { ViewSettings as ViewSettingsType } from '@/app/types/tasks';

interface ViewSettingsProps {
  settings: ViewSettingsType;
  onChange: (setting: keyof ViewSettingsType, value: string) => void;
}

const ViewSettings: React.FC<ViewSettingsProps> = ({ settings, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <Sliders className="h-5 w-5" />
        <span>View Settings</span>
      </button>

      {isOpen && (
        <div 
          ref={settingsRef}
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
        >
          <div className="p-4 space-y-4">
            {/* View Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 text-sm">View</span>
              </div>
              <div className="flex space-x-2 bg-gray-100 rounded-lg p-1 text-xs font-semibold text-gray-600 select-none">
                <button 
                  className={`flex-1 rounded-lg py-2 px-3 text-left ${
                    settings.view === 'list' ? 'bg-white border border-gray-300 shadow-sm text-gray-900' : 'text-gray-400'
                  }`}
                  onClick={() => onChange('view', 'list')}
                >
                  <span className="fas fa-list-ul mr-2"></span>
                  List
                </button>
                <button 
                  className={`flex-1 rounded-lg py-2 px-3 ${
                    settings.view === 'board' ? 'bg-white border border-gray-300 shadow-sm text-gray-900' : 'text-gray-400'
                  } flex items-center justify-center space-x-2`}
                  onClick={() => onChange('view', 'board')}
                >
                  <span className="fas fa-th-large"></span>
                  <span>Board</span>
                </button>
              </div>
            </div>

            {/* Grouping Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 text-sm">Group By</span>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-gray-100 rounded-lg p-1 text-xs font-semibold text-gray-600 select-none">
                <button 
                  className={`rounded-lg py-2 px-2 text-center ${
                    settings.grouping === 'none' ? 'bg-white border border-gray-300 shadow-sm text-gray-900' : 'text-gray-400'
                  }`}
                  onClick={() => onChange('grouping', 'none')}
                >
                  None
                </button>
                <button 
                  className={`rounded-lg py-2 px-2 text-center ${
                    settings.grouping === 'priority' ? 'bg-white border border-gray-300 shadow-sm text-gray-900' : 'text-gray-400'
                  }`}
                  onClick={() => onChange('grouping', 'priority')}
                >
                  Priority
                </button>
                <button 
                  className={`rounded-lg py-2 px-2 text-center ${
                    settings.grouping === 'label' ? 'bg-white border border-gray-300 shadow-sm text-gray-900' : 'text-gray-400'
                  }`}
                  onClick={() => onChange('grouping', 'label')}
                >
                  Label
                </button>
                <button 
                  className={`rounded-lg py-2 px-2 text-center ${
                    settings.grouping === 'dueDate' ? 'bg-white border border-gray-300 shadow-sm text-gray-900' : 'text-gray-400'
                  }`}
                  onClick={() => onChange('grouping', 'dueDate')}
                >
                  Deadline
                </button>
                <button 
                  className={`rounded-lg py-2 px-2 text-center ${
                    settings.grouping === 'assignee' ? 'bg-white border border-gray-300 shadow-sm text-gray-900' : 'text-gray-400'
                  }`}
                  onClick={() => onChange('grouping', 'assignee')}
                >
                  Assignee
                </button>
              </div>
            </div>

            {/* Filter Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 text-sm">Filter</span>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 rounded-lg p-1 text-xs font-semibold text-gray-600 select-none">
                <button 
                  className={`rounded-lg py-2 px-2 text-center ${
                    settings.filter === 'all' ? 'bg-white border border-gray-300 shadow-sm text-gray-900' : 'text-gray-400'
                  }`}
                  onClick={() => onChange('filter', 'all')}
                >
                  All Tasks
                </button>
                <button 
                  className={`rounded-lg py-2 px-2 text-center ${
                    settings.filter === 'high' ? 'bg-white border border-gray-300 shadow-sm text-gray-900' : 'text-gray-400'
                  }`}
                  onClick={() => onChange('filter', 'high')}
                >
                  High
                </button>
                <button 
                  className={`rounded-lg py-2 px-2 text-center ${
                    settings.filter === 'medium' ? 'bg-white border border-gray-300 shadow-sm text-gray-900' : 'text-gray-400'
                  }`}
                  onClick={() => onChange('filter', 'medium')}
                >
                  Medium
                </button>
                <button 
                  className={`rounded-lg py-2 px-2 text-center ${
                    settings.filter === 'low' ? 'bg-white border border-gray-300 shadow-sm text-gray-900' : 'text-gray-400'
                  }`}
                  onClick={() => onChange('filter', 'low')}
                >
                  Low
                </button>
              </div>
            </div>

            {/* Sort Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 text-sm">Sort</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="sorting" className="text-gray-700">Sort by</label>
                  <select
                    id="sorting"
                    value={settings.sorting}
                    onChange={(e) => onChange('sorting', e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="name">Name</option>
                    <option value="priority">Priority</option>
                    <option value="dueDate">Due Date</option>
                    <option value="createdAt">Created Date</option>
                  </select>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="direction" className="text-gray-700">Direction</label>
                  <select
                    id="direction"
                    value={settings.direction}
                    onChange={(e) => onChange('direction', e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSettings;