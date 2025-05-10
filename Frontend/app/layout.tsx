import '@fontsource/inter/400.css'; 
import './globals.css';
import ClientLayout from './clientLayout';
import NotificationListener from './components/NotificationListener';
import { ReactNode } from 'react';

export const metadata = {
  title: 'TaskSphere - Task Management App',
  description: 'Organize your work and life, finally.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="font-inter antialiased">
        <ClientLayout>
          <NotificationListener />
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
