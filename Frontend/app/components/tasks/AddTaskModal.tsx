"use client";

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/redux/store/store';
import { TaskInput } from '@/app/types/team';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Select } from '../ui/select';
import { useAuth } from '@/app/hooks/authstate';
import { toast } from 'react-hot-toast';
import { createTask } from '@/app/redux/slice/projects/taskSlice';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  userId: string;
  members: Array<{ email: string; name: string }>; // Add members prop
  tasksError: any;
}

export default function AddTaskModal({
  isOpen,
  onClose,
  projectId,
  userId,
  members = [],
  tasksError
}: AddTaskModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  const [formData, setFormData] = useState<TaskInput>({
    title: '',
    description: '',
    assignedTo: user?.email ?? userId ?? '', 
    deadline: new Date().toISOString().split('T')[0],
    status: 'todo',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof TaskInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when field changes
  };

  const validateForm = () => {
    console.log('Title:', formData.title);  // Log the title
    console.log('Description:', formData.description);  // Log the description
    console.log('Members:', members);  // Log the list of members

    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (formData.assignedTo && !members.some(m => m.email === formData.assignedTo)) {
      setError('Assigned user must be a project member');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted");

    if (!validateForm()) return console.log("not a valid form");

    setIsLoading(true);

    try {
      const result = await dispatch(
        createTask({
          projectId,
          taskData: {
            title: formData.title,
            description: formData.description,
            assignedTo: formData.assignedTo || userId,
            deadline: formData.deadline,
            status: formData.status,
            project: '',
            createdBy: undefined
          }
        })
      );

      console.log("Result of createTask:", result); // Check if result is returned from dispatch

      if (createTask.fulfilled.match(result)) {
        toast.success('Task created successfully');
        resetForm();
        onClose();
      } else if (createTask.rejected.match(result)) {
        throw new Error(result.payload?.message || 'Failed to create task');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
};



  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: user?.email || '',
      deadline: new Date().toISOString().split('T')[0],
      status: 'todo',
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const displayError = error || tasksError?.message;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        {displayError && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            {displayError}
          </div>
        )}

        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
        />

        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
          rows={3}
        />

        <div className="space-y-2">
        <Input
  label="Assign To"
  value={formData.assignedTo}
  onChange={(e) => handleChange('assignedTo', e.target.value)}
  list="memberEmails"
  required
/>
<datalist id="memberEmails">
  {members.map((member) => (
    <option key={member.email} value={member.email}>
      {member.name}
    </option>
  ))}
</datalist>
        </div>

        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: 'todo', label: 'To Do' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ]}
        />

        <Input
          type="date"
          label="Deadline"
          value={formData.deadline}
          onChange={(e) => handleChange('deadline', e.target.value)}
          required
          min={new Date().toISOString().split('T')[0]}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}