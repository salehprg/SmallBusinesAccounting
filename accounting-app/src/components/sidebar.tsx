"use client";

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Calendar, Plus, UserPlus, FileText, Settings, HelpCircle, MessageSquare } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="h-screen w-64 bg-sidebar text-sidebar-foreground border-e border-sidebar-border">
      <div className="flex flex-col h-full py-4 px-3 space-y-6">
        <nav className="flex-1 space-y-2">
          <SidebarItem href="/" icon={<Calendar className="h-5 w-5" />}>
            کارتابل
          </SidebarItem>
          
          <SidebarItem href="/add-expense" icon={<Plus className="h-5 w-5" />}>
            افزودن هزینه
          </SidebarItem>
          
          <SidebarItem href="/add-income" icon={<Plus className="h-5 w-5" />}>
            افزودن درآمد
          </SidebarItem>
          
          <SidebarItem href="/add-person" icon={<UserPlus className="h-5 w-5" />}>
            افزودن شخص
          </SidebarItem>
          
          <SidebarItem href="/financial-report" icon={<FileText className="h-5 w-5" />}>
            گزارش مالی
          </SidebarItem>
        </nav>
        
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function SidebarItem({ href, icon, children, className }: SidebarItemProps) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
        className
      )}
    >
      {icon}
      <span className="flex-1 text-end">{children}</span>
    </Link>
  );
} 