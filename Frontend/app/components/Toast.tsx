"use client";

import React from "react";
import { CheckCircle } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, visible }) => {
  return (
    <div className={`fixed top-6 right-6 z-50 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} pointer-events-none`}>
      <div className="bg-green-500 text-white px-4 py-2 rounded shadow-lg flex items-center space-x-2">
        <CheckCircle className="w-5 h-5" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
