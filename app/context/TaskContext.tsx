// context/TaskContext.tsx
"use client";

import { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addTask as addTaskAction,
  fetchTasks,
  completeTask as completeTaskAction,
  deleteTask as deleteTaskAction,
  updateTask as updateTaskAction
} from '../redux/slice/TaskSlice';

import { Task } from '../types/tasks';
import { AppDispatch, RootState } from '../redux/store/store';

interface TaskContextType {
  tasks: Task[];
  
  addTask: (taskData: Omit<Task, '_id' | 'userId' | 'createdAt'>) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, status, error } = useSelector((state: RootState) => state.Tasks);
 
  
  useEffect(() => {
    if ((!Array.isArray(tasks) || tasks.length === 0) && status !== 'loading') {
      dispatch(fetchTasks());
    }
  }, [dispatch, tasks, status]);
  

  const addTask = async (taskData: Omit<Task, '_id' | 'userId' | 'createdAt'>) => {   
    await dispatch(addTaskAction(taskData)).unwrap();
  };

  const completeTask = async (taskId: string) => {
    await dispatch(completeTaskAction({ 
      taskId, 
      taskData: { completed: true } 
    })).unwrap();
  };

  const deleteTask = async (taskId: string) => {
    await dispatch(deleteTaskAction(taskId)).unwrap();
  };

  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    await dispatch(updateTaskAction({ taskId, taskData })).unwrap();
  };

  return (
    <TaskContext.Provider
      value={{
        tasks: Array.isArray(tasks) ? tasks : [],
        addTask,
        completeTask,
        deleteTask,
        updateTask,
        loading: status === 'loading',
        error: error
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return {
    ...context,
    tasks: Array.isArray(context.tasks) ? context.tasks : [],
  };
};