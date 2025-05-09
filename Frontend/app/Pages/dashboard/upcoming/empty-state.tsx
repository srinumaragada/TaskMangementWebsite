"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  displayName?: string|null;
  filter?: string;
  grouping?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({  filter = 'all', grouping = 'none' }) => {
  return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold mb-2">
          {filter !== 'all' 
            ? `No ${filter === 'high' ? 'High' : filter === 'medium' ? 'Medium' : 'Low'} Priority Tasks`
            : grouping !== 'none'
              ? `No Upcoming Tasks in This Group`
              : `No Upcoming Tasks`}
        </h2>
        <p className="text-gray-500 mb-6">
          {filter !== 'all'
            ? `You don't have any ${filter} priority tasks coming up.`
            : `You're all caught up with no upcoming tasks. Enjoy your day!`}
        </p>
        <Link 
          href="/inbox" 
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Link>
      </div>
    </div>
  );
};

export default EmptyState;