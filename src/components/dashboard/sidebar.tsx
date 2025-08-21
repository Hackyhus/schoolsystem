'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  BookCopy,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  School,
  Settings,
  Users,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useRole } from '@/context/role-context';

const adminNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/lesson-notes', label: 'Lesson Notes', icon: BookCopy },
  { href: '/dashboard/users', label: 'User Management', icon: Users },
  { href: '/dashboard/messaging', label: 'Messaging', icon: MessageSquare },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart2 },
];

const hodNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/lesson-notes', label: 'Lesson Notes', icon: BookCopy },
  { href: '/dashboard/messaging', label: 'Messaging', icon: MessageSquare },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart2 },
];

const teacherNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/lesson-notes', label: 'Lesson Notes', icon: BookCopy },
  { href: '/dashboard/performance', label: 'Student Performance', icon: FileText },
  { href: '/dashboard/messaging', label: 'Messaging', icon: MessageSquare },
];

const parentNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/performance', label: 'Student Performance', icon: FileText },
  { href: '/dashboard/messaging', label: 'Messaging', icon: MessageSquare },
];

const navItems: { [key: string]: typeof adminNav } = {
  Admin: adminNav,
  HeadOfDepartment: hodNav,
  Teacher: teacherNav,
  Parent: parentNav,
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const { role, logout } = useRole();

  const currentNav = role ? navItems[role] : [];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <School className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-headline text-lg font-semibold text-sidebar-foreground">
              InsightConnect
            </h2>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {currentNav.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Log Out">
              <LogOut />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
