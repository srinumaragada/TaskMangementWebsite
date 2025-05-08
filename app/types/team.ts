export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'not-started';
  project: string;
  assignedTo: any; // Can be string or populated user object
  createdBy: any; // Can be string or populated user object
  deadline: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskInput = {
  title: string;
  description: string;
  assignedTo: string;
  deadline: string;
  status: 'todo' | 'in-progress' | 'completed';
};

  export type Team = {
    id: string;
    name: string;
    description?: string;
    members: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "member";
    }[];
  };
  
  export type Member = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "member";
  };