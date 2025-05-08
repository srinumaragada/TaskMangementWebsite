"use client";

import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { AppDispatch, RootState } from '@/app/redux/store/store';
import { clearTasks, getTasks } from '@/app/redux/slice/projects/taskSlice';
import { fetchProjects } from '@/app/redux/slice/projects/projectsSlice';
import ProjectHeader from '@/app/components/projects/ProjectHeader';
import { Tabs } from '@/app/components/ui/Tabs';
import TaskBoard from '@/app/components/tasks/TaskBoard';
import TeamManagement from '@/app/components/team/TeamManagement';
import AddTaskModal from '@/app/components/tasks/AddTaskModal';
import { useAuth } from '@/app/hooks/authstate';
import { Button } from '@/app/components/ui/Button';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id || '';

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { tasks, loading: tasksLoading, error: tasksError } = useSelector(
    (state: RootState) => state.Projecttasks
  );

  const { projects, loading: projectsLoading, error: projectsError } = useSelector(
    (state: RootState) => state.projects
  );

  useEffect(() => {
    if (projectId) {
      dispatch(clearTasks()); // Clear previous tasks
      dispatch(getTasks({ projectId })); // Fetch tasks for the selected project

      // Fetch projects if none exist
      if (projects.length === 0) {
        dispatch(fetchProjects());
      }
    }
  }, [projectId, dispatch, projects.length]);

  const project = useMemo(() => {
    return Array.isArray(projects)
      ? projects.find(p => p && p._id === projectId)
      : undefined;
  }, [projects, projectId]);

  const { processedTasks, tasksByStatus } = useMemo(() => {
    const validTasks = Array.isArray(tasks)
      ? tasks.filter(task => task && task._id)
      : [];

    const processed = validTasks.map(task => {
      let status = (task.status || 'todo').toString().trim().toLowerCase();

      if (status.includes('progress') || status.includes('inprogress')) {
        status = 'in-progress';
      } else if (status.includes('done') || status.includes('complete')) {
        status = 'completed';
      } else {
        status = 'todo';
      }

      return {
        ...task,
        id: task._id,
        status: status as 'todo' | 'in-progress' | 'completed',
        title: task.title || 'Untitled Task',
        description: task.description || ''
      };
    });

    return {
      processedTasks: processed,
      tasksByStatus: {
        todo: processed.filter(t => t.status === 'todo'),
        'in-progress': processed.filter(t => t.status === 'in-progress'),
        completed: processed.filter(t => t.status === 'completed')
      }
    };
  }, [tasks]);

  // Loading state
  if (projectsLoading || tasksLoading) {
    return <div className="p-6">Loading...</div>;
  }

  // Error handling for project loading
  if (projectsError) {
    console.error('Error loading projects:', projectsError);
  }

  // Don't return anything here for tasksError
  // We'll handle the task error inside the modal
  // If project is not found, display an error message
  if (!project) return <div className="p-6 text-red-500">Project not found</div>;

  return (
    <div className="p-6">
      <ProjectHeader project={project} />

      <Tabs defaultValue="tasks" className="mt-6">
        <Tabs.List>
          <Tabs.Trigger value="tasks">Tasks ({processedTasks.length})</Tabs.Trigger>
          <Tabs.Trigger value="team">Team ({(project.members || []).length})</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="tasks">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsAddModalOpen(true)}>+ Add Task</Button>
          </div>

          {processedTasks.length > 0 ? (
            <TaskBoard
            userId={user.id}
              tasksByStatus={tasksByStatus}
              projectId={projectId}
              members={project.members || []}
            />
          ) : (
            <div>No tasks available for this project</div>
          )}
        </Tabs.Content>

        <Tabs.Content value="team">
          <TeamManagement
          userId={user.id}
            projectId={projectId}
            members={project.members || []}
          />
        </Tabs.Content>
      </Tabs>

      {/* Add Task Modal */}
      {user && (
        <AddTaskModal
        members={project.members || []}
        userId={user.id}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          projectId={projectId}
          tasksError={tasksError} // Pass error directly to modal
        />
      )}
    </div>
  );
}
