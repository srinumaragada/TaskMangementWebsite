'use client';

import AuthListener from "./components/AuthListener";
import { AuthProvider } from "./components/AuthProvider";
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
        </TaskProvider>
      </AuthProvider>
    </Providers>
  );
}