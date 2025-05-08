"use client";

import { cn } from "@/app/lib/utils";

interface AvatarProps {
  name?: string; // optional to avoid runtime crashes
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name = '', className = '', size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  // Generate initials safely with fallback
  const initials = name && typeof name === 'string' && name.trim()
    ? name
        .trim()
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'U'; // Default fallback if name is empty or invalid

  return (
    <div
      className={cn(
        'rounded-full bg-blue-600 text-white flex items-center justify-center font-medium',
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
