"use client";

import { updateTask } from "@/app/redux/slice/projects/taskSlice";
import { AppDispatch } from "@/app/redux/store/store";
import { Task } from "@/app/types/project";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { Select } from "../ui/select";
import { Button } from "../ui/Button";

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
  members = [] // default to empty array
}: EditTaskModalProps) {
    
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [assignedTo, setAssignedTo] = useState(
    typeof task.assignedTo === 'object' ? task.assignedTo.email : task.assignedTo || ''
  );
  const [deadline, setDeadline] = useState(() => {
    if (task.deadline || task.dueDate) {
      return new Date(task.deadline || task.dueDate).toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0]; // default to today
  });
  
    
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setAssignedTo(
        typeof task.assignedTo === 'object' ? task.assignedTo.email : task.assignedTo || ''
      );
      
      setDeadline(
        task.deadline || task.dueDate
          ? new Date(task.deadline || task.dueDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await dispatch(updateTask({
        projectId,
        taskId: task.id,
        taskData: {
          title,
          description,
          status,
          assignedTo: assignedTo || undefined,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
        }
      })).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
  <Input
    label="Task Title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    required
  />
  
  <TextArea
    label="Description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    rows={3}
  />
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Select
      label="Status"
      value={status}
      onChange={(e) => setStatus(e.target.value as Task['status'])}
      options={[
        { value: 'todo', label: 'To Do' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' }
      ]}
    />
    
    <Input
      label="Assign To (email or user ID)"
      value={assignedTo}
      onChange={(e) => setAssignedTo(e.target.value)}
      placeholder="Enter user email or ID"
    />
  </div>
  
  <Input
  type="date"
  label="Deadline (Optional)"
  value={deadline}
  onChange={(e) => setDeadline(e.target.value)}
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
