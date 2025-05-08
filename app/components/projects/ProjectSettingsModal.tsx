"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/app/types/project';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/redux/store/store';
import { deleteProject, fetchProjects, updateProject } from '@/app/redux/slice/projects/projectsSlice';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export default function ProjectSettingsModal({ 
  isOpen, 
  onClose, 
  project 
}: ProjectSettingsModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await dispatch(updateProject({
        id: project._id,
        projectData: { title, description }
      })).unwrap();
    
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await dispatch(deleteProject(project._id)).unwrap();
      router.push('/Pages/dashboard/AddTeam');
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Settings">
      <div className="space-y-4">
        <Input
          label="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <TextArea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        
        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Project
          </Button>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSave}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}