"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type MenuItem = {
  name: string;
  href?: string;
  icon?: string;
  dropdown?: Array<{
    name: string;
    href: string;
    icon?: string;
  }>;
};

const Navbar: React.FC = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const menuItems: MenuItem[] = [
    { name: "Home", href: "/" },
    {
      name: "Features",
      dropdown: [
        { name: "Task Management", href: "#task-management" },
        { name: "Project Tracking", href: "#project-tracking" },
        { name: "Team Collaboration", href: "#team-collab" },
        { name: "Time Analytics", href: "#time-analytics" },
      ],
    },
    {
      name: "Templates",
      dropdown: [
        { name: "Personal Productivity", icon: "📝", href: "/Pages/templates" },
        { name: "Business Projects", icon: "💼", href: "#business-templates" },
        { name: "Education", icon: "🎓", href: "#education-templates" },
        { name: "All Templates", icon: "📂", href: "#all-templates" },
      ],
    },
    { name: "Contact", href: "Pages/contact" },
    { name: "About", href: "Pages/about" },
  ];

  const handleMouseEnter = (menuName: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menuName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setActiveDropdown(null);
  };

  const toggleMobileDropdown = (menuName: string) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50" ref={dropdownRef}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <Link href="/">
        <div className="flex items-center">
          <div className="flex-shrink-0 flex items-center gap-4">
            <Image className="rounded-2xl " src="/logo.png" alt='logo' width={50} height={50}/>
            <span className="text-3xl font-bold text-orange-600 ">TaskSphere</span>
          </div>
        </div>
        </Link>
        {/* Desktop Navigation */}
        <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
          {menuItems.map((item) => (
            <div 
              key={item.name}
              className="relative"
              onMouseEnter={() => item.dropdown && handleMouseEnter(item.name)}
              onMouseLeave={handleMouseLeave}
            >
              {item.dropdown ? (
                <>
                  <button
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      activeDropdown === item.name 
                        ? 'text-orange-500 font-semibold' 
                        : 'text-gray-700 hover:text-orange-500 hover:font-semibold'
                    }`}
                  >
                    {item.name}
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {activeDropdown === item.name && (
                    <div
                      className="absolute left-0 mt-0 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="py-1">
                        {item.dropdown.map((subItem) => (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 font-medium"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <span className="mr-2">{subItem.icon}</span>
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <a
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-orange-500 hover:font-semibold"
                >
                  {item.name}
                </a>
              )}
            </div>
          ))}
        </div>

        
        <div className="hidden md:flex items-center space-x-4">
          <a
            href="/login"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-orange-500 hover:font-semibold"
          >
            Login
          </a>
          <a
            href="/register"
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Sign up free
          </a>
        </div>

        {/* Mobile buttons (always visible on mobile) */}
        <div className="flex md:hidden items-center space-x-2">
          
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-gray-700 hover:text-orange-500 focus:outline-none"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>

    {/* Mobile menu */}
    {mobileMenuOpen && (
      <div className="md:hidden bg-white shadow-lg">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {menuItems.map((item) => (
            <div key={`mobile-${item.name}`}>
              {item.dropdown ? (
                <>
                  <button
                    onClick={() => toggleMobileDropdown(item.name)}
                    className={`flex justify-between items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                      activeDropdown === item.name
                        ? 'text-orange-500 font-semibold'
                        : 'text-gray-700 hover:text-orange-500 hover:font-semibold'
                    }`}
                  >
                    {item.name}
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {activeDropdown === item.name && (
                    <div className="pl-4">
                      {item.dropdown.map((subItem) => (
                        <a
                          key={`mobile-${subItem.name}`}
                          href={subItem.href}
                          className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:font-semibold"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="mr-2">{subItem.icon}</span>
                          {subItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <a
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              )}
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2">
            <a
              href="/login"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </a>
            <a
              href="/register"
              className="block px-3 py-2 text-base font-medium text-white bg-orange-600 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign up free
            </a>
          </div>
        </div>
      </div>
    )}
  </nav>
  );
};

export default Navbar;
