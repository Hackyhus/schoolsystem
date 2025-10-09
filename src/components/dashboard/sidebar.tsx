
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart2,
  Bell,
  Book,
  BookCopy,
  BookOpen,
  Building,
  Calendar,
  CheckSquare,
  ClipboardList,
  CreditCard,
  DollarSign,
  Edit,
  Edit3,
  FileQuestion,
  FileText,
  Home,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Receipt,
  Server,
  Settings,
  Shield,
  Ticket,
  User,
  Users,
  UsersRound,
  Grid,
  Landmark,
  Wallet,
  Briefcase,
  TrendingUp,
  Award,
  GraduationCap,
  BookMarked
} from 'lucide-react';
import Image from 'next/image';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
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
  'file-invoice': Receipt,
  calendar: Calendar,
  bell: Bell,
  MessageSquare: MessageSquare,
  'file-question': FileQuestion,
  'book-copy': BookCopy,
  'ticket': Ticket,
  'grid': Grid,
  'landmark': Landmark,
  'wallet': Wallet,
  'briefcase': Briefcase,
  'trending-up': TrendingUp,
  'award': Award,
  'graduation-cap': GraduationCap,
  'book-marked': BookMarked,
};


const navConfig = {
  Admin: { 
    sidebar_extra: [
      { "icon": "trending-up", "label": "Reports & Analytics", "path": "/dashboard/reports" },
      { "icon": "shield", "label": "System Config", "path": "/dashboard/system" },
      { "icon": "users", "label": "Manage Staff", "path": "/dashboard/users" },
      { "icon": "users-round", "label": "Manage Students", "path": "/dashboard/students" },
      { "icon": "building", "label": "Departments", "path": "/dashboard/departments" },
      { "icon": "server", "label": "Database", "path": "/dashboard/db" },
      { "icon": "activity", "label": "Logs & Security", "path": "/dashboard/logs" }
    ],
  },
  SLT: {
    sidebar_extra: [
      { "icon": "trending-up", "label": "Analytics", "path": "/dashboard/reports" },
      { "icon": "users", "label": "Staff Overview", "path": "/dashboard/users" },
      { "icon": "users-round", "label": "Student Overview", "path": "/dashboard/students" },
      { "icon": "book", "label": "Lesson Approvals", "path": "/dashboard/lesson-notes" },
      { "icon": "dollar-sign", "label": "Financials", "path": "/dashboard/accountant/reports" }, // Points to accountant reports
      { "icon": "graduation-cap", "label": "Grading System", "path": "/dashboard/system/grading" },
      { "icon": "book-marked", "label": "Classes & Subjects", "path": "/dashboard/system/classes-subjects" }
    ],
  },
  HeadOfDepartment: {
     sidebar_extra: [
      { "icon": "book", "label": "Lesson Approvals", "path": "/dashboard/lesson-notes" },
      { "icon": "bar-chart", "label": "Dept. Analytics", "path": "/dashboard/hod/analytics" },
      { "icon": "users", "label": "My Teachers", "path": "/dashboard/users" },
      { "icon": "book-marked", "label": "Classes & Subjects", "path": "/dashboard/system/classes-subjects" }
    ],
  },
  Accountant: {
    sidebar_extra: [
      { "icon": "dollar-sign", "label": "System Fee Structure", "path": "/dashboard/system/fees" },
      { "icon": "file-invoice", "label": "Invoices", "path": "/dashboard/accountant/invoices" },
      { "icon": "credit-card", "label": "Payments", "path": "/dashboard/accountant/payments" },
      { "icon": "wallet", "label": "Expenses", "path": "/dashboard/accountant/expenses" },
      { "icon": "briefcase", "label": "Payroll", "path": "/dashboard/accountant/payroll" },
      { "icon": "landmark", "label": "Reconciliation", "path": "/dashboard/accountant/reconciliation" },
      { "icon": "bar-chart", "label": "Financial Reports", "path": "/dashboard/accountant/reports" },
    ],
  },
  ExamOfficer: {
    sidebar_extra: [
      { "icon": "file-question", "label": "Review Questions", "path": "/dashboard/exam-questions" },
      { "icon": "edit-3", "label": "Review Scores", "path": "/dashboard/scores" },
      { "icon": "check-square", "label": "Generate Results", "path": "/dashboard/results/generate" },
      { "icon": "award", "label": "View Results", "path": "/dashboard/results/view" },
      { "icon": "calendar", "label": "Timetable", "path": "/dashboard/timetable" },
      { "icon": "ticket", "label": "Exam Registration", "path": "/dashboard/exam-registration" },
      { "icon": "grid", "label": "Seating Plans", "path": "/dashboard/seating-plan" },
    ],
  },
  Teacher: {
    sidebar_extra: [
      { "icon": "book-copy", "label": "Lesson Plans", "path": "/dashboard/lesson-notes" },
      { "icon": "file-question", "label": "Exam Questions", "path": "/dashboard/exam-questions" },
      { "icon": "edit-3", "label": "Enter Scores", "path": "/dashboard/scores" },
      { "icon": "users-round", "label": "My Students", "path": "/dashboard/performance" }
    ],
  },
  Parent: {
    sidebar_extra: [
      { "icon": "book-open", "label": "Results", "path": "/dashboard/performance" },
      { "icon": "calendar", "label": "Timetable", "path": "/dashboard/timetable" },
      { "icon": "dollar-sign", "label": "Payments", "path": "/dashboard/pay" },
      { "icon": "bell", "label": "Announcements", "path": "/dashboard/announcements" },
      { "icon": "MessageSquare", "label": "Messaging", "path": "/dashboard/messaging" },
    ],
  },
  Student: {
    sidebar_extra: [
      { "icon": "book", "label": "Subjects", "path": "/dashboard/subjects" },
      { "icon": "file-text", "label": "Results", "path": "/dashboard/results" },
      { "icon": "calendar", "label": "Timetable", "path": "/dashboard/timetable" },
      { "icon": "bell", "label": "Notices", "path": "/dashboard/notices" }
    ],
  }
};


const baseNav = [
  { "group": "Main", "links": [{ "icon": "home", "label": "Dashboard", "path": "/dashboard" }] },
  { "group": "User", "links": [
      { "icon": "user", "label": "Profile", "path": "/profile" },
      { "icon": "bell", "label": "Notifications", "path": "/dashboard/notifications" }
  ]}
];


export function DashboardSidebar() {
  const pathname = usePathname();
  const { role, logout } = useRole();
  const { setOpenMobile } = useSidebar();

  React.useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);
  
  const renderNav = () => {
    const roleSpecificNav = role ? (navConfig as any)[role]?.sidebar_extra || [] : [];
    
    // Combine base navigation with role-specific navigation
    const navSections = [...baseNav];
    if (roleSpecificNav.length > 0) {
      navSections.splice(1, 0, { group: "Tools", links: roleSpecificNav });
    }

    return navSections.map((section, index) => (
       <React.Fragment key={`${section.group}-${index}`}>
          <p className="px-4 pt-4 text-xs font-semibold text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">{section.group}</p>
          <SidebarMenu>
            {section.links.map((item: any) => {
              const Icon = iconMap[item.icon] || Home;
              return (
                 <SidebarMenuItem key={item.path}>
                    <Link href={item.path}>
                      <SidebarMenuButton isActive={pathname.startsWith(item.path) && (item.path !== '/dashboard' || pathname === '/dashboard')} tooltip={item.label}>
                        <Icon />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
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
          <div className="bg-background/10 p-2 rounded-md group-data-[collapsible=icon]:p-1">
            <Link href="/dashboard" className="flex items-center justify-center">
              <Image
                src="/school-logo.png"
                alt="Great Insight International Academy Logo"
                width={200}
                height={48}
                className="w-auto h-10 group-data-[collapsible=icon]:h-8"
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
            <Link href="/dashboard/settings">
              <SidebarMenuButton isActive={pathname === '/dashboard/settings'} tooltip="Settings">
                <Settings />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Log Out">
              <LogOut />
              <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
