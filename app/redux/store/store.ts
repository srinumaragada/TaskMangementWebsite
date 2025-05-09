
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/UserSlice";
import TaskReducer from "../slice/TaskSlice"
import projectsReducer from "../slice/projects/projectsSlice"
import tasksReducer from "../slice/projects/taskSlice"
import notificationReducer from "../slice/notificationSlice"
export const store = configureStore({
  reducer: {
    Auth: authReducer,
    Tasks:TaskReducer,
    projects: projectsReducer,
    Projecttasks: tasksReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.data'],
      },
    }),

});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;