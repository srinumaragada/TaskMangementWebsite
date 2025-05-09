"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/redux/store/store";
import { updateTask } from "@/app/redux/slice/projects/taskSlice";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { Select } from "../ui/select";
import { Button } from "../ui/Button";
import { Task } from "@/app/types/project";

interface User {
  _id: string;
  userName: string;
  email: string;
}

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projectId: string;
  members: User[];
}

export default function EditTaskModal({ 
  isOpen, 
  onClose, 
  task, 
  projectId,
  members = []
}: EditTaskModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  console.log(members);
  
  // Default form data initialization
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    assignedTo: task.assignedTo ? (typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo) : '',
    deadline: task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Re-initialize form data when modal opens or task changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        assignedTo: task.assignedTo ? (typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo) : '',
        deadline: task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : ''
      });
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Prepare the update data
      const updateData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined
      };

      // Only include assignedTo if it's changed and valid
      if (formData.assignedTo && formData.assignedTo !== task.assignedTo?._id?.toString()) {
        updateData.assignedTo = formData.assignedTo;
      }

      await dispatch(updateTask({
        projectId,
        taskId: task._id,
        taskData: updateData
      })).unwrap();
      
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
      // Error will be handled by Redux and shown in UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
        
        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            options={[
              { value: 'todo', label: 'To Do' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' }
            ]}
          />
          
          <Select
  label="Assign To"
  value={formData.assignedTo}
  onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
  options={[
    { value: '', label: 'Unassigned' },
    ...members.map(member => ({
      value: member._id,
      label: member.email  // 👈 Change this to show email instead of userName
    }))
  ]}
/>

        </div>
        
        <Input
          type="date"
          label="Deadline"
          value={formData.deadline}
          onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          min={new Date().toISOString().split("T")[0]}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
