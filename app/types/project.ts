import { User } from "../redux/slice/UserSlice";

// types/project.ts
export interface Member {
  _id: string;
  name: string;
  email: string;
  projects: string[]; 
}
  export interface Task {
    updatedAt: any;
    _id: string;
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'completed';
    dueDate?: string; 
    deadline?: string;
    assignedTo?: string; 
    projectId: string;
    createdAt: string;
    project?: {    
      members: string[]; 
    };
  }
  
  export interface Project {
    _id: string;
    title: string;
    description: string;
    members?: User[]
    tasks: Task[];
    createdAt?: string;
  }