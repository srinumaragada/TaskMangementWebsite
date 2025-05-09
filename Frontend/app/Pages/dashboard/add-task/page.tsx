"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {  X, Calendar as CalendarIcon, Flag, Tag, Paperclip, Clock } from "lucide-react";
import { labels, priorities } from "@/app/utils/page";
import { useTasks } from "@/app/context/TaskContext";

export default function AddTaskPage() {
  const { addTask } = useTasks();
  const router = useRouter();
  const [task, setTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as const,
    labels: [] as string[],
    completed: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTask({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate||undefined,
        priority: task.priority,
        labels: task.labels,
        completed: task.completed
      });
      router.push("/Pages/dashboard/today");
    } catch (error: any) {
      console.error("Full error:", error); // Add this
      alert(`Failed to add task: ${error.message || 'Unknown error'}`);
    }
  };

  const toggleLabel = (labelId: string) => {
    setTask(prev => ({
      ...prev,
      labels: prev.labels.includes(labelId)
        ? prev.labels.filter(id => id !== labelId)
        : [...prev.labels, labelId]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-white/30 "
        onClick={() => router.push("/Pages/dashboard/today")}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md z-50">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Add New Task</h2>
          <button
            onClick={() => router.push("/Pages/dashboard")}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Task title"
            className="w-full p-2 border-b border-gray-300 focus:border-orange-500 focus:outline-none"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description (optional)"
            className="w-full p-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
            rows={3}
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
          />

          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              className="bg-transparent border-none focus:outline-none"
              value={task.dueDate}
              onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Flag className="h-5 w-5 text-gray-400" />
            <select
              className="bg-transparent border-none focus:outline-none"
              value={task.priority}
              onChange={(e) => setTask({ ...task, priority: e.target.value })}
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-start space-x-2">
            <Tag className="h-5 w-5 text-gray-400 mt-1" />
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className={`text-xs px-2 py-1 rounded-full ${
                    task.labels.includes(label.id)
                      ? `${label.color} text-white`
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="relative inline-block">
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  console.log("Selected file:", file);
                }}
              />
              <label
                htmlFor="fileUpload"
                className="flex items-center cursor-pointer"
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Attachment
              </label>
            </div>

            <button type="button" className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Reminder
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
