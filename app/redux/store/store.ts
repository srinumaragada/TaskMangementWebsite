
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/UserSlice";
import TaskReducer from "../slice/TaskSlice"
import projectsReducer from "../slice/projects/projectsSlice"
import tasksReducer from "../slice/projects/taskSlice"
export const store = configureStore({
  reducer: {
    Auth: authReducer,
    Tasks:TaskReducer,
    projects: projectsReducer,
    Projecttasks: tasksReducer
  }
  
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;