"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useTasks } from '@/app/context/TaskContext';
import { Task, PriorityType, ViewType, SortingType, DirectionType, FilterType } from '@/app/types/tasks';

// Replace with your actual TaskCard component or create a simple one
const TaskCard = ({ task }: { task: Task }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="font-medium">{task.title}</h3>
      <p className="text-sm text-gray-600">{task.description}</p>
      <div className="flex items-center mt-2">
        <span className={`px-2 py-1 text-xs rounded-full ${
          task.priority === 'high' ? 'bg-red-100 text-red-800' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="ml-2 text-xs text-gray-500">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

// Simple UI components to replace the missing ones
const Input = ({
  type,
  placeholder,
  value,
  onChange,
  className,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`p-2 border rounded ${className}`}
    />
  );
};

const Select = ({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`p-2 border rounded ${className}`}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const Checkbox = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => {
  return (
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4"
      />
      <span>{label}</span>
    </label>
  );
};

const Button = ({
  children,
  onClick,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}) => {
  const variantClasses = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const SearchPage = () => {
  const { tasks } = useTasks();
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priority: [] as PriorityType[],
    completed: 'all' as FilterType,
    dueDateFrom: '',
    dueDateTo: '',
    assignee: '',
    labels: [] as string[],
  });
  const [sorting, setSorting] = useState<{
    field: SortingType;
    direction: DirectionType;
  }>({ field: 'dueDate', direction: 'asc' });

  // Available options for filters
  const priorityOptions: PriorityType[] = ['low', 'medium', 'high'];
  const statusOptions: FilterType[] = ['all', 'completed', 'pending'];
  const sortFields: SortingType[] = ['name', 'priority', 'dueDate', 'createdAt'];
  const sortDirections: DirectionType[] = ['asc', 'desc'];

  // Perform search whenever filters or search term changes
  useEffect(() => {
    const results = tasks.filter(task => {
      // Text search
      const matchesSearchTerm =
        searchTerm === '' ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Priority filter
      const matchesPriority =
        filters.priority.length === 0 || filters.priority.includes(task.priority);

      // Completion status
      const matchesCompletion =
        filters.completed === 'all' ||
        (filters.completed === 'completed' && task.completed) ||
        (filters.completed === 'pending' && !task.completed);

      // Due date range
      const matchesDueDate =
        (filters.dueDateFrom === '' || task.dueDate >= filters.dueDateFrom) &&
        (filters.dueDateTo === '' || task.dueDate <= filters.dueDateTo);

      // Assignee
      const matchesAssignee =
        filters.assignee === '' ||
        (task.assignee && task.assignee.toLowerCase().includes(filters.assignee.toLowerCase()));

      // Labels
      const matchesLabels =
        filters.labels.length === 0 ||
        filters.labels.some(label => task.labels.includes(label));

      return (
        matchesSearchTerm &&
        matchesPriority &&
        matchesCompletion &&
        matchesDueDate &&
        matchesAssignee &&
        matchesLabels
      );
    });

    // Sort results
    const sortedResults = [...results].sort((a, b) => {
      let comparison = 0;

      switch (sorting.field) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          const priorityOrder: Record<PriorityType, number> = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sorting.direction === 'asc' ? comparison : -comparison;
    });

    setSearchResults(sortedResults);
  }, [tasks, searchTerm, filters, sorting]);

  const handlePriorityChange = (priority: PriorityType) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority],
    }));
  };

  const handleLabelChange = (label: string) => {
    setFilters(prev => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter(l => l !== label)
        : [...prev.labels, label],
    }));
  };

  // Extract all unique labels from tasks for filter options
  const allLabels = Array.from(new Set(tasks.flatMap(task => task.labels)));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search Tasks</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          
          {/* Search input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Priority filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Priority</label>
            <div className="space-y-2">
              {priorityOptions.map(priority => (
                <Checkbox
                  key={priority}
                  label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                  checked={filters.priority.includes(priority)}
                  onChange={() => handlePriorityChange(priority)}
                />
              ))}
            </div>
          </div>
          
          {/* Status filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              options={statusOptions.map(option => ({
                value: option,
                label: option.charAt(0).toUpperCase() + option.slice(1),
              }))}
              value={filters.completed}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                setFilters({ ...filters, completed: e.target.value as FilterType })
              }
              className="w-full"
            />
          </div>
          
          {/* Due date range */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Due Date Range</label>
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="From"
                value={filters.dueDateFrom}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  setFilters({ ...filters, dueDateFrom: e.target.value })
                }
                className="w-full"
              />
              <Input
                type="date"
                placeholder="To"
                value={filters.dueDateTo}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  setFilters({ ...filters, dueDateTo: e.target.value })
                }
                className="w-full"
              />
            </div>
          </div>
          
          {/* Assignee */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Assignee</label>
            <Input
              type="text"
              placeholder="Filter by assignee"
              value={filters.assignee}
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                setFilters({ ...filters, assignee: e.target.value })
              }
              className="w-full"
            />
          </div>
          
          {/* Labels */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Labels</label>
            <div className="space-y-2">
              {allLabels.map(label => (
                <Checkbox
                  key={label}
                  label={label}
                  checked={filters.labels.includes(label)}
                  onChange={() => handleLabelChange(label)}
                />
              ))}
            </div>
          </div>
          
          <Button
            onClick={() => {
              setSearchTerm('');
              setFilters({
                priority: [],
                completed: 'all',
                dueDateFrom: '',
                dueDateTo: '',
                assignee: '',
                labels: [],
              });
            }}
            variant="outline"
            className="w-full"
          >
            Clear All Filters
          </Button>
        </div>
        
        {/* Results */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {searchResults.length} {searchResults.length === 1 ? 'Task' : 'Tasks'} Found
            </h2>
            
            <div className="flex space-x-4">
              <Select
                options={sortFields.map(field => ({
                  value: field,
                  label: field === 'dueDate' ? 'Due Date' : 
                         field === 'createdAt' ? 'Created At' :
                         field.charAt(0).toUpperCase() + field.slice(1),
                }))}
                value={sorting.field}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                  setSorting({ ...sorting, field: e.target.value as SortingType })
                }
                className="w-40"
              />
              
              <Select
                options={sortDirections.map(direction => ({
                  value: direction,
                  label: direction === 'asc' ? 'Ascending' : 'Descending',
                }))}
                value={sorting.direction}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                  setSorting({ ...sorting, direction: e.target.value as DirectionType })
                }
                className="w-32"
              />
            </div>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">No tasks found matching your criteria.</p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    priority: [],
                    completed: 'all',
                    dueDateFrom: '',
                    dueDateTo: '',
                    assignee: '',
                    labels: [],
                  });
                }}
                variant="ghost"
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;