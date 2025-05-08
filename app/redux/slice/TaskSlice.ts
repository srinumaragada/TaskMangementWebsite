import { Task } from '@/app/types/tasks';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';



type TaskState = {
  tasks: Task[];
  currentTask: Task | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  operation: 'add' | 'fetchAll' | 'fetchOne' | 'update' | 'delete' | null;
};

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  status: 'idle',
  error: null,
  operation: null
};


export const addTask = createAsyncThunk<Task, Partial<Task>, { rejectValue: { message: string } }>(
    'tasks/addTask',
    async (taskData, { rejectWithValue }) => {
      try {
        const response = await axios.post('http://localhost:4000/api/tasks/createTask', taskData,{
            withCredentials:true
        },);
        
        if (!response.data.task || !response.data.task._id) {
          return rejectWithValue({ message: 'Invalid task object returned from backend' });
        }
  
        return response.data.task;
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        return rejectWithValue(error.response?.data ?? { message: 'Failed to add task' });
      }
    }
  );
  

export const fetchTasks = createAsyncThunk<Task[], void, { rejectValue: { message: string } }>(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:4000/api/tasks/getTasks',{
        withCredentials:true
    });
      return response.data.tasks;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data ?? { message: 'Failed to fetch tasks' });
    }
  }
);

export const fetchTask = createAsyncThunk<Task, string, { rejectValue: { message: string } }>(
  'tasks/fetchTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/tasks/getTask/${taskId}`,{
        withCredentials:true
    });
      return response.data.task;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data ?? { message: 'Failed to fetch task' },);
    }
  }
);

export const updateTask = createAsyncThunk<
  Task,
  { taskId: string; taskData: Partial<Task> },
  { rejectValue: { message: string } }
>(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    
    try {
      const response = await axios.put(`http://localhost:4000/api/tasks/updateTask/${taskId}`, taskData,{
        withCredentials:true
    });
    console.log('Updated Task Response:', response);
      return response.data.task;

    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data ?? { message: 'Failed to update task' });
    }
  }
);

export const deleteTask = createAsyncThunk<string, string, { rejectValue: { message: string } }>(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:4000/api/tasks/deleteTask/${taskId}`,{
        withCredentials:true
    });
      return taskId;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data ?? { message: 'Failed to delete task' });
    }
  }
);
export const completeTask = createAsyncThunk<
  Task,
  { taskId: string; taskData: Partial<Task> },
  { rejectValue: { message: string } }
>(
  'tasks/completeTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      let response;

      if (taskData.completed === true && Object.keys(taskData).length === 1) {
        // Special case: only updating completed flag -> call /complete endpoint
        response = await axios.put(`http://localhost:4000/api/tasks/complete/${taskId}`,taskData,{
          withCredentials:true
        });
      } else {
        // General update
        response = await axios.put(`http://localhost:4000/api/tasks/updateTask/${taskId}`, taskData,{
          withCredentials:true
        });
      }

      return response.data.task;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data ?? { message: 'Failed to update task' });
    }
  }
);


// Slice

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearCurrentTask: (state) => {
      state.currentTask = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add Task
      .addCase(addTask.pending, (state) => {
        state.status = 'loading';
        state.operation = 'add';
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.operation = null;
        state.tasks.push(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.status = 'failed';
        state.operation = null;
        state.error = (action.payload as { message: string })?.message || 'Failed to add task';
      })

      // Fetch All
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.operation = 'fetchAll';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.operation = null;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.operation = null;
        state.error = (action.payload as { message: string })?.message || 'Failed to fetch tasks';
      })

      // Fetch One
      .addCase(fetchTask.pending, (state) => {
        state.status = 'loading';
        state.operation = 'fetchOne';
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.operation = null;
        state.currentTask = action.payload;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.status = 'failed';
        state.operation = null;
        state.error = (action.payload as { message: string })?.message || 'Failed to fetch task';
      })

      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.status = 'loading';
        state.operation = 'update';
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        if (!action.payload) return;
      
        state.status = 'succeeded';
        state.operation = null;
        state.tasks = state.tasks.map(task =>
          task._id === action.payload._id ? action.payload : task
        );
        state.currentTask = action.payload;
      })
      
      .addCase(updateTask.rejected, (state, action) => {
        state.status = 'failed';
        state.operation = null;
        state.error = (action.payload as { message: string })?.message || 'Failed to update task';
      })

      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.status = 'loading';
        state.operation = 'delete';
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.operation = null;
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        state.currentTask = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.status = 'failed';
        state.operation = null;
        state.error = (action.payload as { message: string })?.message || 'Failed to delete task';
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
  }
});

export const { clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;
