'use client'
import { useTasks } from '@/app/context/TaskContext'
import React, { useState } from 'react'
import { CheckCircle, Circle, MoreVertical, Flag, Calendar, Trash2, Edit, Plus } from 'lucide-react'
import { priorities } from '@/app/utils/page'
import { Task, PriorityType } from '@/app/types/tasks'
import { format, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import TaskForm from '@/app/components/TaskForm'
import EmptyState from '../upcoming/empty-state'

const Inbox = () => {
  const { 
    tasks, 
    addTask, 
    completeTask, 
    deleteTask, 
    updateTask, 
    loading, 
    error 
  } = useTasks()
  
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'active' && !task.completed) || 
        (filter === 'completed' && task.completed)
      
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      
      return matchesFilter && matchesSearch
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      return 0
    })

    const handleCreateTask = async (taskData: Partial<Task>) => {
      try {
        await addTask({
          title: taskData.title || '', // Required field
          description: taskData.description,
          dueDate: taskData.dueDate,
          priority: taskData.priority || 'medium', // Default value
          completed: false // New tasks are always incomplete
        });
        setShowTaskForm(false);
      } catch (err) {
        console.error('Create task failed:', err);
      }
    };
  
    const handleUpdateTask = async (taskData: Partial<Task>) => {
      if (!editingTaskId) return;
      
      try {
        await updateTask(editingTaskId, {
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate,
          priority: taskData.priority
        });
        setShowTaskForm(false);
        setEditingTaskId(null);
      } catch (err) {
        console.error('Update task failed:', err);
      }
    };
    
  const handleToggleCompletion = async (taskId: string, completed: boolean) => {
    await completeTask(taskId, completed)
  }

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId)
    setActiveMenu(null)
  }

  const handlePriorityChange = async (taskId: string, priority: PriorityType) => {
    await updateTask(taskId, { priority })
    setActiveMenu(null)
  }

  if (loading && tasks.length === 0) {
    return <div className="p-6 flex justify-center items-center h-full">Loading...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header and controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <button
          onClick={() => {
            setEditingTaskId(null)
            setShowTaskForm(true)
          }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md ${filter === f ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
    <TaskForm 
      onClose={() => {
        setShowTaskForm(false);
        setEditingTaskId(null);
      }}
      initialTask={editingTaskId ? tasks.find(t => t._id === editingTaskId) : undefined}
      onSubmit={editingTaskId ? handleUpdateTask : handleCreateTask}
    />
  )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState 
          title={searchQuery ? "No matching tasks" : `No ${filter === 'all' ? '' : filter} tasks`}
          description={!searchQuery && filter === 'all' ? "Create your first task to get started" : undefined}
          action={!searchQuery && filter === 'all' ? (
            <button
              onClick={() => {
                setEditingTaskId(null)
                setShowTaskForm(true)
              }}
              className="mt-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={18} />
              Add Task
            </button>
          ) : undefined}
        />
      ) : (
        <motion.div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <motion.div
                key={task._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  {/* Checkbox */}
                  <button 
                    onClick={() => handleToggleCompletion(task._id, !task.completed)}
                    className="mr-3 mt-1 text-gray-300 hover:text-green-500"
                  >
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  {/* Task Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Task metadata */}
                    <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-x-4 gap-y-2">
                      {task.dueDate && (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(parseISO(task.dueDate), 'MMM dd, yyyy')}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        Created: {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Three-dot menu */}
                  {!task.completed && (
  <div className="relative">
    <button 
      onClick={() => setActiveMenu(activeMenu === task._id ? null : task._id)}
      className="text-gray-400 hover:text-gray-600 p-1"
      disabled={loading}
    >
      <MoreVertical className="h-5 w-5" />
    </button>

                    {activeMenu === task._id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 z-10 mt-2 w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200"
                      >
                        <button
                          onClick={() => {
                            setEditingTaskId(task._id)
                            setShowTaskForm(true)
                            setActiveMenu(null)
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Task
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Task
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">Priority</div>
                        {priorities.map((priority) => (
                          <button
                            key={priority.value}
                            onClick={() => handlePriorityChange(task._id, priority.value as PriorityType)}
                            className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                              task.priority === priority.value 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Flag className={`h-4 w-4 mr-2 ${
                              priority.value === 'high' ? 'text-red-500' :
                              priority.value === 'medium' ? 'text-yellow-500' :
                              'text-green-500'
                            }`} />
                            {priority.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

export default Inbox