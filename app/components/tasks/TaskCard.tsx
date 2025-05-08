import { useState } from 'react';
import { Task } from '@/app/types/project';
import { FiEdit, FiTrash2, FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import EditTaskModal from './EditTaskModal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/redux/store/store';
import { deleteTask } from '@/app/redux/slice/projects/taskSlice';
import { toast } from 'react-hot-toast';
import { format, isBefore } from 'date-fns';

interface User {
  _id: string;
  userName: string;
  email: string;
  avatar?: string;
}

interface TaskCardProps {
  task: Task;
  projectId: string;
  members: User[];
}

const statusColors = {
  'todo': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'overdue': 'bg-red-100 text-red-800'
};

export default function TaskCard({ task, projectId, members = [] }: TaskCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await dispatch(deleteTask({ projectId, taskId: task._id })).unwrap();
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete task');
    }
  };

  const assignedUser = task.assignedTo || null;
  const createdDate = task.createdAt ? format(new Date(task.createdAt), 'PP') : 'N/A';
  const deadlineDate = task.deadline ? format(new Date(task.deadline), 'PP') : 'N/A';
  
  const isOverdue = task.deadline && isBefore(new Date(task.deadline), new Date()) && task.status !== 'completed';
  const status = isOverdue ? 'overdue' : task.status || 'todo';

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden mb-6" // Added margin-bottom here for space between task cards
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <motion.h3 
            className="text-lg font-semibold text-gray-800"
            animate={isHovered ? { x: 2 } : { x: 0 }}
          >
            {task.title || 'Untitled Task'}
          </motion.h3>
          
          <motion.div 
            className="flex space-x-2"
            animate={isHovered ? { opacity: 1 } : { opacity: 0.7 }}
          >
            <button
              onClick={() => setIsEditOpen(true)}
              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
              aria-label="Edit task"
            >
              <FiEdit size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
              aria-label="Delete task"
            >
              <FiTrash2 size={16} />
            </button>
          </motion.div>
        </div>
        
        {task.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>
        )}
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <FiUser className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500">Assigned To</p>
              <p className="text-sm">
                {assignedUser ? (
                  <span className="font-medium text-gray-700">
                    {assignedUser.userName}
                    <span className="text-gray-500 ml-1 text-xs">({assignedUser.email})</span>
                  </span>
                ) : (
                  <span className="text-gray-400">Unassigned</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500">Created</p>
              <p className="text-sm text-gray-700">{createdDate}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <FiClock className={`flex-shrink-0 ${isOverdue ? 'text-red-400' : 'text-gray-400'}`} />
            <div>
              <p className="text-xs font-medium text-gray-500">Deadline</p>
              <p className={`text-sm ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-700'}`}>
                {deadlineDate}
                {isOverdue && (
                  <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                    Overdue
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-xs px-3 py-1 rounded-full ${statusColors[status]}`}>
            {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </span>
          
          {task.priority && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              task.priority === 'high' ? 'bg-red-100 text-red-800' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {task.priority} priority
            </span>
          )}
        </div>
      </div>

      <EditTaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        task={task}
        projectId={projectId}
        members={members}
      />
    </motion.div>
  );
}
