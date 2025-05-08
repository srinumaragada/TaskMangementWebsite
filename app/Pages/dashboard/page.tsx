'use client';
import { useState } from 'react';
import { Plus, Check, Calendar, List, Users, Settings } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('tasks');
  const tasks = [
    { id: 1, title: 'Complete project proposal', project: 'Work', due: 'Today', completed: false },
    { id: 2, title: 'Team meeting', project: 'Work', due: 'Tomorrow', completed: false },
    { id: 3, title: 'Buy groceries', project: 'Personal', due: 'Today', completed: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm h-screen sticky top-0">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">TaskSphere</h1>
          </div>
          <nav className="p-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center w-full p-2 rounded-md mb-1 ${activeTab === 'tasks' ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <List className="h-5 w-5 mr-3" />
              My Tasks
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center w-full p-2 rounded-md mb-1 ${activeTab === 'calendar' ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Calendar className="h-5 w-5 mr-3" />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center w-full p-2 rounded-md mb-1 ${activeTab === 'team' ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Users className="h-5 w-5 mr-3" />
              Team
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === 'settings' ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'tasks' && 'My Tasks'}
              {activeTab === 'calendar' && 'Calendar'}
              {activeTab === 'team' && 'Team'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center">
              <Plus className="h-5 w-5 mr-1" />
              Add Task
            </button>
          </div>

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 flex items-start">
                    <button className={`mt-1 h-5 w-5 rounded border ${task.completed ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300'}`}>
                      {task.completed && <Check className="h-4 w-4" />}
                    </button>
                    <div className="ml-3 flex-1">
                      <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {task.project} • Due {task.due}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Calendar view coming soon</p>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Team management coming soon</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Settings coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
