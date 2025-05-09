import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Project {
  _id: string;
  title: string;
  description: string;
  createdBy: string;
  members: string[];
  tasks: string[];
}

interface ProjectsState {
  status: "loading" | "failed" | "succeeded";
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  status: "loading"
};


const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type KnownError = {
  message: string;
};

// Async Thunks
export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: KnownError }
>(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/projects`, {
        withCredentials: true
      });
      return res.data.projects;
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

export const createProject = createAsyncThunk<
  Project,
  { title: string; description: string },
  { rejectValue: KnownError }
>(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE}/projects`, projectData, {
        withCredentials: true
      });
      return res.data;
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

export const updateProject = createAsyncThunk<
  Project,
  { id: string; projectData: { title: string; description: string } },
  { rejectValue: KnownError }
>(
  'projects/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_BASE}/projects/${id}`, projectData, {
        withCredentials: true
      });
      return res.data;
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

export const deleteProject = createAsyncThunk<
  string,
  string,
  { rejectValue: KnownError }
>(
  'projects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/projects/${id}`, {
        withCredentials: true
      });
      return id;
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

export const addProjectMember = createAsyncThunk<
  Project,
  { projectId: string; email: string },
  { rejectValue: KnownError }
>(
  'projects/addMember',
  async ({ projectId, email }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_BASE}/projects/${projectId}/members`,
        { email },
        { withCredentials: true }
      );
      return res.data.project;
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

export const removeProjectMember = createAsyncThunk<
  { projectId: string; memberId: string },
  { projectId: string; memberId: string },
  { rejectValue: KnownError }
>(
  'projects/removeMember',
  async ({ projectId, memberId }, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `${API_BASE}/projects/${projectId}/members/${memberId}`,
        { withCredentials: true }
      );
      return { projectId, memberId, project: res.data.project };
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

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    clearProjects: (state) => {
      state.projects = [];
      state.currentProject = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch projects';
      })

      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;

        if (Array.isArray(state.projects)) {
          state.projects.push(action.payload);
        } else {
          state.projects = [action.payload];
        }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create project';
      })

      .addCase(updateProject.fulfilled, (state, action) => {
        const updatedProject = action.payload;
        const index = state.projects.findIndex(p => p._id === updatedProject._id);

        if (index !== -1) {
          state.projects = [
            ...state.projects.slice(0, index),
            updatedProject,
            ...state.projects.slice(index + 1),
          ];
        }
      })

      // Delete Project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p._id !== action.payload);
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(addProjectMember.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addProjectMember.fulfilled, (state, action) => {
        const projectIndex = state.projects.findIndex(
          p => p._id === action.payload._id
        );
        if (projectIndex !== -1) {
          state.projects[projectIndex] = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(addProjectMember.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to add member';
      })
      .addCase(removeProjectMember.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        const projectIndex = state.projects.findIndex(
          p => p._id === action.payload.projectId
        );
        if (projectIndex !== -1) {
          state.projects[projectIndex].members = state.projects[projectIndex].members.filter(
            m => m._id !== action.payload.memberId
          );
        }
        state.status = 'succeeded';
      })
      .addCase(removeProjectMember.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to remove member';
      });
  }
});

export const { setCurrentProject, clearProjects } = projectSlice.actions;
export default projectSlice.reducer;
