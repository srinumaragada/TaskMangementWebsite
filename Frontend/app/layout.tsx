import { Inter } from "next/font/google";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import ClientLayout from "./clientLayout";
import NotificationListener from "./components/NotificationListener";
import { ReactNode } from "react";

// Initialize fonts
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata = {
  title: 'TaskSphere - Task Management App',
  description: 'Organize your work and life, finally.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable}`}>
      <body className="antialiased">
        <ClientLayout>
          <NotificationListener />
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}