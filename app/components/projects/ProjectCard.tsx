"use client";

import { Project } from '@/app/types/project';
import { FiUsers, FiCheckCircle } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { getTasks } from '@/app/redux/slice/projects/taskSlice';
import { AppDispatch } from '@/app/redux/store/store'; // Ensure AppDispatch is imported
import { updateProject } from '@/app/redux/slice/projects/projectsSlice';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const dispatch = useDispatch<AppDispatch>(); 
  const router = useRouter();

  const handleClick = () => {
  
    dispatch(getTasks({ projectId: project._id }));
    router.push(`/Pages/dashboard/AddTeam/${project._id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full border border-gray-200"
      onClick={handleClick} 
    >
      {/* Instructional Click Me text */}
      <p className="text-xs text-gray-500 italic mb-2">Click Me to view or manage this project</p>
      
      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <FiUsers className="h-4 w-4" />
          <span>{project.members?.length || 0} members</span>
        </div>
        <div className="flex items-center gap-2">
          <FiCheckCircle className="h-4 w-4" />
          <span>{project.tasks?.length || 0} tasks</span>
        </div>
      </div>
    </div>
  );
}
