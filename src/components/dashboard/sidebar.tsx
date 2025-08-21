
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart2,
  Bell,
  Book,
  BookOpen,
  Building,
  Calendar,
  CheckSquare,
  ClipboardList,
  CreditCard,
  DollarSign,
  Edit,
  Edit3,
  FileInvoice,
  FileText,
  Home,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Server,
  Settings,
  Shield,
  User,
  Users,
  UsersRound,
} from 'lucide-react';
import Image from 'next/image';

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

const iconMap: { [key: string]: React.ElementType } = {
  home: LayoutDashboard,
  user: User,
  lock: Lock,
  shield: Shield,
  users: Users,
  'users-round': UsersRound,
  building: Building,
  server: Server,
  activity: Activity,
  book: Book,
  'clipboard-list': ClipboardList,
  'file-text': FileText,
  'bar-chart': BarChart2,
  'book-open': BookOpen,
  edit: Edit,
  'check-square': CheckSquare,
  'edit-3': Edit3,
  'dollar-sign': DollarSign,
  'credit-card': CreditCard,
  'file-invoice': FileInvoice,
  calendar: Calendar,
  bell: Bell,
  MessageSquare: MessageSquare,
};


const navConfig = {
  Admin: { // mapped from developer_admin
    sidebar_extra: [
      { "icon": "shield", "label": "System Config", "path": "/system" },
      { "icon": "users", "label": "Manage Staff", "path": "/dashboard/users" },
      { "icon": "users-round", "label": "Manage Students", "path": "/students" },
      { "icon": "building", "label": "Departments", "path": "/departments" },
      { "icon": "server", "label": "Database", "path": "/db" },
      { "icon": "activity", "label": "Logs & Security", "path": "/logs" }
    ],
  },
  Principal: {
    sidebar_extra: [
      { "icon": "users", "label": "Teachers", "path": "/teachers" },
      { "icon": "book", "label": "Classes", "path": "/classes" },
      { "icon": "clipboard-list", "label": "Attendance", "path": "/attendance" },
      { "icon": "file-text", "label": "Reports", "path": "/dashboard/reports" }
    ],
  },
  HeadOfDepartment: { // Using Principal for HOD
    sidebar_extra: [
      { "icon": "users", "label": "Teachers", "path": "/teachers" },
      { "icon": "book", "label": "Classes", "path": "/classes" },
      { "icon": "clipboard-list", "label": "Attendance", "path": "/attendance" },
      { "icon": "file-text", "label": "Reports", "path": "/dashboard/reports" }
    ],
  },
  Director: {
    sidebar_extra: [
      { "icon": "bar-chart", "label": "Analytics", "path": "/analytics" },
      { "icon": "users", "label": "Staff Overview", "path": "/staff-overview" },
      { "icon": "file-text", "label": "School Reports", "path": "/school-reports" }
    ],
  },
  ExamOfficer: {
    sidebar_extra: [
      { "icon": "edit", "label": "Enter Results", "path": "/results-entry" },
      { "icon": "check-square", "label": "Approve Grades", "path": "/grade-approval" },
      { "icon": "book-open", "label": "Exams", "path": "/exams" }
    ],
  },
  Teacher: {
    sidebar_extra: [
      { "icon": "clipboard-list", "label": "Attendance", "path": "/teacher-attendance" },
      { "icon": "book", "label": "Lesson Notes", "path": "/dashboard/lesson-notes" },
      { "icon": "edit-3", "label": "Enter Scores", "path": "/scores" },
      { "icon": "users", "label": "My Students", "path": "/dashboard/performance" }
    ],
  },
  Accountant: {
    sidebar_extra: [
      { "icon": "dollar-sign", "label": "Fees", "path": "/fees" },
      { "icon": "credit-card", "label": "Payments", "path": "/payments" },
      { "icon": "file-invoice", "label": "Invoices", "path": "/invoices" }
    ],
  },
  Parent: {
    sidebar_extra: [
      { "icon": "book-open", "label": "Results", "path": "/dashboard/performance" },
      { "icon": "calendar", "label": "Timetable", "path": "/timetable" },
      { "icon": "dollar-sign", "label": "Payments", "path": "/pay" },
      { "icon": "bell", "label": "Announcements", "path": "/announcements" },
      { "icon": "MessageSquare", "label": "Messaging", "path": "/dashboard/messaging" },
    ],
  },
  Student: {
    sidebar_extra: [
      { "icon": "book", "label": "Subjects", "path": "/subjects" },
      { "icon": "file-text", "label": "Results", "path": "/results" },
      { "icon": "calendar", "label": "Timetable", "path": "/timetable" },
      { "icon": "bell", "label": "Notices", "path": "/notices" }
    ],
  }
};


const baseNav = [
  { "group": "Main", "links": [{ "icon": "home", "label": "Dashboard", "path": "/dashboard" }] },
  { "group": "User", "links": [
      { "icon": "user", "label": "Profile", "path": "/profile" },
      { "icon": "lock", "label": "Change Password", "path": "/settings" }
  ]}
];


export function DashboardSidebar() {
  const pathname = usePathname();
  const { role, logout } = useRole();

  const currentNav = role ? (navConfig as any)[role]?.sidebar_extra || [] : [];
  
  const renderNav = () => {
    const roleSpecificNav = role ? (navConfig as any)[role]?.sidebar_extra || [] : [];
    
    // Combine base navigation with role-specific navigation
    const navSections = [...baseNav];
    if (roleSpecificNav.length > 0) {
      navSections.splice(1, 0, { group: "Tools", links: roleSpecificNav });
    }

    return navSections.map((section, index) => (
       <React.Fragment key={`${section.group}-${index}`}>
          <p className="px-4 pt-4 text-xs font-semibold text-sidebar-foreground/50">{section.group}</p>
          <SidebarMenu>
            {section.links.map((item) => {
              const Icon = iconMap[item.icon] || Home;
              return (
                 <SidebarMenuItem key={item.path}>
                    <Link href={item.path}>
                      <SidebarMenuButton isActive={pathname === item.path} tooltip={item.label}>
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
       </React.Fragment>
    ))

  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
             <Image
              src="/school-logo.png"
              alt="Great Insight International Academy Logo"
              width={200}
              height={48}
            />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        {renderNav()}
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
