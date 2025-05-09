import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Task Type
interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'not-started';
  project: string;
  assignedTo: any; 
  createdBy: any;  
  deadline: string;
  createdAt?: string;
  updatedAt?: string;
}

// Response Type for API
interface TasksApiResponse {
  success: boolean;
  message?: string;
  task?: Task;
  tasks?: Task[];
}

// Initial State Type
interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  lastFetchedProjectId: string | null;
}

// Initial State
const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  lastFetched: null,
  lastFetchedProjectId: null,
};

// Base API URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

// Helper type for rejectValue
interface KnownError {
  message: string;
}

// Fetch tasks
export const getTasks = createAsyncThunk<
  Task[],
  { projectId: string },
  { rejectValue: KnownError }
>(
  'tasks/getTasks',
  async ({ projectId }, { rejectWithValue }) => {
    try {
      const response = await axios.get<TasksApiResponse>(
        `${API_BASE}/projects/${projectId}/tasks`,
        { withCredentials: true }
      );
      return response.data.tasks || [];
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue({
          message: err.response?.data?.message || err.message
        });
      }
      return rejectWithValue({
        message: 'An unknown error occurred'
      });
    }
  }
);

// Create task
export const createTask = createAsyncThunk<
  Task,
  { projectId: string; taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'> },
  { rejectValue: KnownError }
>(
  'tasks/createTask',
  async ({ projectId, taskData }, { rejectWithValue }) => {
    try {
      const response = await axios.post<TasksApiResponse>(
        `${API_BASE}/projects/${projectId}/tasks`,
        taskData,
        { withCredentials: true }
      );
      if (!response.data.task) {
        throw new Error('No task returned from server');
      }
      return response.data.task;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue({
          message: err.response?.data?.message || err.message
        });
      }
      return rejectWithValue({
        message: 'An unknown error occurred'
      });
    }
  }
);

// Update task
export const updateTask = createAsyncThunk<
  Task,
  { projectId: string; taskId: string; taskData: Partial<Task> },
  { rejectValue: KnownError }
>(
  'tasks/updateTask',
  async ({ projectId, taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await axios.put<TasksApiResponse>(
        `${API_BASE}/projects/${projectId}/tasks/${taskId}`,
        taskData,
        { withCredentials: true }
      );
      if (!response.data.task) {
        throw new Error('No task returned from server');
      }
      return response.data.task;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue({
          message: err.response?.data?.message || err.message
        });
      }
      return rejectWithValue({
        message: 'An unknown error occurred'
      });
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk<
  string,
  { projectId: string; taskId: string },
  { rejectValue: KnownError }
>(
  'tasks/deleteTask',
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_BASE}/projects/${projectId}/tasks/${taskId}`,
        { withCredentials: true }
      );
      return taskId;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue({
          message: err.response?.data?.message || err.message
        });
      }
      return rejectWithValue({
        message: 'An unknown error occurred'
      });
    }
  }
);

// Update task status
export const updateTaskStatus = createAsyncThunk<
  Task,
  { projectId: string; taskId: string; status: Task['status'] },
  { rejectValue: KnownError }
>(
  'tasks/updateStatus',
  async ({ projectId, taskId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put<TasksApiResponse>(
        `${API_BASE}/projects/${projectId}/tasks/${taskId}/status`,
        { status },
        { withCredentials: true }
      );
      if (!response.data.task) {
        throw new Error('No task returned from server');
      }
      return response.data.task;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue({
          message: err.response?.data?.message || err.message
        });
      }
      return rejectWithValue({
        message: 'An unknown error occurred'
      });
    }
  }
);

const taskSlice = createSlice({
  name: 'projecttasks',
  initialState,
  reducers: {
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.currentTask = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(getTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch tasks';
      })

      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create task';
      })

      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update task';
      })

      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        if (state.currentTask?._id === action.payload) {
          state.currentTask = null;
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete task';
      })

      // Update task status
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index].status = action.payload.status;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask.status = action.payload.status;
        }
      });
  },
});

// Export Actions
export const { setCurrentTask, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;