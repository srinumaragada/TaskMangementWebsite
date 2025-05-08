"use client";
import { useTasks } from "@/app/context/TaskContext";
import { useRouter } from "next/navigation";
import { dashboardSidebarList } from "@/app/utils/page";

interface Task {
  id: string;
  completed: boolean;
  dueDate?: string;
  [key: string]: any;
}

export function SidebarWithCounts({
  activeTab,
  setActiveTab
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const { tasks = [] } = useTasks(); // Default to empty array
  const router = useRouter();

  // Ensure tasks is always an array
  const safeTasks: Task[] = Array.isArray(tasks) ? tasks : [];

  // Calculate counts with proper type safety
  const counts = {
    inbox: safeTasks.filter((task: Task) => !task.completed).length,
    today: safeTasks.filter((task: Task) => {
      const today = new Date().toISOString().split('T')[0];
      return (
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate).toISOString().split('T')[0] === today
      );
    }).length,
    completed: safeTasks.filter((task: Task) => task.completed).length
  };

  return (
    <nav className="flex flex-col mt-4 px-2 space-y-1">
      {dashboardSidebarList.map(({ icon, label, tab, path }) => {
        const count = counts[tab as keyof typeof counts] || 0;

        return (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              router.push(path || `/Pages/dashboard/${tab === "today" ? "" : tab}`);
            }}
            className={`flex items-center justify-between w-full px-3 py-1 rounded focus:outline-none transition ${
              activeTab === tab
                ? "bg-[#ffefe6] text-[#d35400] font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {icon} {label}
            </div>
            {count > 0 && (
              <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}