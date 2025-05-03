"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Calendar, Plus, UserPlus, FileText, Menu, X, LogOut, Layers, Layers2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuth();
  
  // Close sidebar by default on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-sidebar-accent rounded-md p-2 text-sidebar-foreground"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      
      <aside className={cn(
        "fixed md:static h-screen bg-sidebar text-sidebar-foreground border-e border-sidebar-border z-40 transition-all duration-300",
        isOpen ? "w-64 left-0" : "w-0 -left-64 md:w-16 md:left-0"
      )}>
        <div className="flex flex-col h-full py-4 px-3 space-y-6 overflow-hidden">
          {/* User information */}
          {user && isOpen && (
            <div className="border-b border-sidebar-border pb-4 text-center">
              <p className="text-sm font-medium">{`${user.firstName} ${user.lastName}`}</p>
              <p className="text-xs text-sidebar-foreground/70">{user.email}</p>
            </div>
          )}
          
          <nav className="flex-1 space-y-2">
            <SidebarItem href="/" icon={<Calendar className="h-5 w-5" />} isCollapsed={!isOpen}>
              کارتابل
            </SidebarItem>
            
            <SidebarItem href="/add-expense" icon={<Plus className="h-5 w-5" />} isCollapsed={!isOpen}>
              افزودن هزینه
            </SidebarItem>
            
            <SidebarItem href="/add-income" icon={<Plus className="h-5 w-5" />} isCollapsed={!isOpen}>
              افزودن درآمد
            </SidebarItem>

            <SidebarItem href="/add-cost-type" icon={<Layers2 className="h-5 w-5" />} isCollapsed={!isOpen}>
              افزودن نوع هزینه
            </SidebarItem>
            
            <SidebarItem href="/add-person" icon={<UserPlus className="h-5 w-5" />} isCollapsed={!isOpen}>
              افزودن شخص
            </SidebarItem>
            
            <SidebarItem href="/financial-report" icon={<FileText className="h-5 w-5" />} isCollapsed={!isOpen}>
              گزارش مالی
            </SidebarItem>
          </nav>
          
          {/* Logout button */}
          <div className="mt-auto border-t border-sidebar-border pt-4">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                !isOpen && "justify-center"
              )}
              title={!isOpen ? "خروج" : undefined}
            >
              <LogOut className="h-5 w-5" />
              {isOpen && <span className="flex-1 text-end">خروج</span>}
            </button>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  isCollapsed?: boolean;
}

function SidebarItem({ href, icon, children, className, isCollapsed }: SidebarItemProps) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
        isCollapsed && "justify-center",
        className
      )}
      title={isCollapsed ? String(children) : undefined}
    >
      {icon}
      {!isCollapsed && <span className="flex-1 text-end">{children}</span>}
    </Link>
  );
} 