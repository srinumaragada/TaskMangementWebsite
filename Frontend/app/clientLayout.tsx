'use client';

import AuthListener from "./components/AuthListener";
import { AuthProvider } from "./components/AuthProvider";
import NotificationToast from "./components/NotificationToast";
import { TaskProvider } from "./context/TaskContext";
import { Providers } from "./Providers";


export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <AuthProvider>
        <TaskProvider>
          <AuthListener/>
          {children}
          <NotificationToast/>
        </TaskProvider>
      </AuthProvider>
    </Providers>
  );
}