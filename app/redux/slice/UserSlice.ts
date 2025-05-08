import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface User {
  id: string;
  userName: string;
  email: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

// Register User
export const registerUser = createAsyncThunk<
  any, 
  { userName: string; email: string; password: string } 
>('auth/register', async (formData, thunkAPI) => {
  try {
    const response = await axios.post(
      'http://localhost:4000/api/auth/register',
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data || 'Registration failed');
  }
});

// Login User
export const loginUser = createAsyncThunk<
  any,
  { email: string; password: string }
>('auth/login', async (formData, thunkAPI) => {
  try {
    const response = await axios.post(
      'http://localhost:4000/api/auth/login',
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data || 'Login failed');
  }
});

// Logout User
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  const response = await axios.post(
    'http://localhost:4000/api/auth/logout',
    {},
    { withCredentials: true }
  );
  return response.data;
});

// Check Auth
export const checkAuth = createAsyncThunk('auth/checkauth', async () => {
  const response = await axios.get('http://localhost:4000/api/auth/check-auth', {
    withCredentials: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
  return response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null; // Or set actual user if returned
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('Login payload:', action.payload); // Debug log
        state.isLoading = false;
        if (action.payload?.success) {
          console.log('Setting user in state:', action.payload.user); // Debug log
          state.user = {
            id: action.payload.user.id,
            email: action.payload.user.email,
            userName: action.payload.user.userName,
            role: action.payload.user.role
          };
          state.isAuthenticated = true;
        }
      })
      
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
