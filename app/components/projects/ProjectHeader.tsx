"use client";

import { Project } from '@/app/types/project';
import { useState } from 'react';
import { Button } from '../ui/Button';
import ProjectSettingsModal from './ProjectSettingsModal';

interface ProjectHeaderProps {
  project: Project;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <p className="text-gray-600">{project.description}</p>
      </div>
      <Button 
        variant="outline" 
        onClick={() => setIsSettingsOpen(true)}
      >
        Project Settings
      </Button>

      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        project={project}
      />
    </div>
  );
}