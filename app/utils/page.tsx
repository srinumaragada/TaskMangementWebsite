import {
  Plus,
  Search,
  Inbox,
  Calendar,
  CalendarDays,
  Filter,
  CheckCircle,
} from 'lucide-react';

export const dashboardSidebarList = [
  {
    icon: <Plus className="h-4 w-4" />,
    label: "Add task",
    tab: "add-task",
  },
  {
    icon: <Search className="h-4 w-4" />,
    label: "Search",
    tab: "search",
    path:"/Pages/dashboard/search"
  },
  {
    icon: <Inbox className="h-4 w-4" />,
    label: "Inbox",
    tab: "inbox",
    path:"/Pages/dashboard/inbox"
  },
  {
    icon: <CalendarDays className="h-4 w-4" />,
    label: "Today",
    tab: "today",
    path:"/Pages/dashboard/today"
  },
  {
    icon: <Calendar className="h-4 w-4" />,
    label: "Upcoming",
    tab: "upcoming",
    path:"/Pages/dashboard/upcoming",
    
  },
  {
    icon: <Filter className="h-4 w-4" />,
    label: "Filters & Labels",
    tab: "filters",
    path:"/Pages/dashboard/filters"
  },
  {
    icon: <CheckCircle className="h-4 w-4" />,
    label: "Completed",
    tab: "completed",
    path:"/Pages/dashboard/completed"
  },
];

export const labels = [
  { id: 'work', name: 'Work', color: 'bg-blue-500' },
  { id: 'personal', name: 'Personal', color: 'bg-green-500' },
  { id: 'urgent', name: 'Urgent', color: 'bg-red-500' }
];

export const priorities = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
] as const;
