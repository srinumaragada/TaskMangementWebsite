// components/Layout.tsx
"use client";

import { ReactNode } from "react";
import Head from "next/head";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title || "TaskSphere"}</title>
        <meta name="description" content="Task Management Application" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* You can add a navbar here if needed */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </>
  );
};