

export interface Task {
  daysOverdue: number;
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: PriorityType;  
  labels: string[];
  completed: boolean;
  createdAt: string;
  assignee?: string;
}

export interface ViewSettings {
  view: 'list' | 'board' | 'calendar';
  grouping: GroupingType;
  sorting: 'name' | 'priority' | 'dueDate' | 'createdAt';
  direction: 'asc' | 'desc';
  filter: PriorityType | 'all';
}

  export type PriorityType = 'low' | 'medium' | 'high';
  export type GroupingType = 'none' | 'priority' | 'label' | 'dueDate' | 'assignee';
  
  export type NewTask = Omit<Task, 'id' | 'completed' | 'createdAt'>;
export type ViewType = "list" | "board" | "calendar";
export type SortingType = "name" | "priority" | "dueDate" | "createdAt";
export type DirectionType = "asc" | "desc";
export type FilterType = "all" | "completed" | "pending";


