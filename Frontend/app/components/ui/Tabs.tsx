"use client";
import { useState, ReactNode } from 'react';

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

function TabsRoot({ defaultValue, children, className = '' }: TabsProps) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
}

function TabsTrigger({  children }: TabsTriggerProps) {
  return (
    <button
      className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

function TabsContent({ value, children, className = '' }: TabsContentProps) {
  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
}

// ✅ Proper export as an object with subcomponents
const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

export { Tabs };
