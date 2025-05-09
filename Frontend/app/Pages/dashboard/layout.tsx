"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Plus, ChevronDown, Gem, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/app/components/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { TaskProvider } from "@/app/context/TaskContext";
import { SidebarWithCounts } from "@/app/components/SidebarWithCounts";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store/store";
import { logoutUser } from "@/app/redux/slice/UserSlice";
import { AnyAction } from "@reduxjs/toolkit";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const { user: authUser, displayName, isLoading: authLoading } = useAuth();
  const reduxAuthState = useSelector((state: RootState) => state.Auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const reduxUser = reduxAuthState.user;
  const user = authUser || reduxUser;

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Check authentication status
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user) {
      setAuthChecked(true);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    if (window.innerWidth < 768) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await dispatch(logoutUser() as unknown as AnyAction);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getUserInitial = () => {
    if (displayName) return displayName.charAt(0).toUpperCase();
    if (user && "userName" in user) return user.userName.charAt(0).toUpperCase();
    return "?";
  };

  const getDisplayName = () => {
    if (displayName) return displayName;
    if (user && "userName" in user) return user.userName;
    return "User";
  };

  const getUserEmail = () => {
    if (user && "email" in user) return user.email;
    if (authUser?.email) return authUser.email;
    return "";
  };

  // Don't render anything until auth is checked
  if (!authChecked || authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <TaskProvider>
      <div className="flex min-h-screen font-sans text-gray-900 bg-white">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`fixed md:static top-0 z-30 bg-[#faf9f5] border-r border-gray-200 w-64 transform transition-transform duration-200 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <div className="flex flex-col h-full text-sm select-none">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="relative w-full">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="rounded-full font-semibold text-white text-lg w-10 h-10 bg-orange-500 flex items-center justify-center">
                    {getUserInitial()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{getDisplayName()}</span>
                    <span className="text-xs text-gray-500 truncate w-32">{getUserEmail()}</span>
                  </div>
                  <ChevronDown
                    className={`ml-1 h-4 w-4 text-gray-500 transition-transform ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {userDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium text-gray-900">
                          {getDisplayName()}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {getUserEmail()}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex flex-col mt-4 px-2 space-y-1">
              <SidebarWithCounts
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
              />
            </nav>

            <div className="mt-8 px-4 flex items-center justify-between">
              <span className="text-md text-gray-500 font-semibold select-text">
                My Projects
              </span>
              <button 
                onClick={() => router.push("/Pages/dashboard/AddTeam")}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Add new project"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-1 mt-2 text-gray-700 hover:bg-gray-100 rounded">
              <span className="text-gray-400">#</span>
              <span className="truncate">Getting Started Guide</span>
              <span className="ml-auto text-xs text-gray-400 font-normal">16</span>
            </button>

            <div className="mt-auto px-4 py-4 text-md text-gray-600 space-y-2">
              <button onClick={() => router.push("/Pages/dashboard/AddTeam")} className="flex items-center gap-2 hover:text-gray-700">
                <Plus className="h-3 w-3" /> Add a team
              </button>
              <button className="flex items-center gap-2 hover:text-gray-700">
                <Gem className="h-3 w-3" /> Browse templates
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <button
          className="absolute top-4 left-4 md:hidden z-40 text-gray-700"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Main Content */}
        <main className="flex-1 mt-16 md:mt-0">{children}</main>
      </div>
    </TaskProvider>
  );
}