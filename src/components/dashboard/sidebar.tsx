

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart2,
  Bell,
  Book,
  Building,
  Calendar,
  DollarSign,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Server,
  Settings,
  Shield,
  User,
  Users,
  UsersRound,
  FileQuestion,
  BookCopy,
  Edit3,
  CheckSquare,
  Award,
  BookOpen,
  TrendingUp,
  Landmark,
  Wallet,
  Briefcase,
  FileText,
  CreditCard,
  Receipt,
  Ticket,
  Grid,
  BookMarked,
  Wrench,
  GraduationCap,
  Sparkles,
  UploadCloud,
  CalendarCheck,
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
  LayoutDashboard, User, Users, UsersRound, Building, Server, Activity, Book,
  FileText, BarChart2, BookOpen, Edit3, DollarSign, Calendar, Bell, MessageSquare,
  FileQuestion, BookCopy, CheckSquare, Award, Shield, Settings, LogOut,
  TrendingUp, Landmark, Wallet, Briefcase, Receipt, CreditCard, Ticket, Grid,
  BookMarked, Wrench, GraduationCap, Sparkles, UploadCloud, CalendarCheck
};

const allNavLinks = {
  // Main
  dashboard: { icon: 'LayoutDashboard', label: 'Dashboard', path: '/dashboard' },
  profile: { icon: 'User', label: 'Profile', path: '/profile' },
  notifications: { icon: 'Bell', label: 'Notifications', path: '/dashboard/notifications' },
  messaging: { icon: 'MessageSquare', label: 'Messaging', path: '/dashboard/messaging' },
  announcements: { icon: 'Bell', label: 'Announcements', path: '/dashboard/announcements' },
  
  // Admin & SLT
  reports: { icon: 'TrendingUp', label: 'Reports & Analytics', path: '/dashboard/reports' },
  system: { icon: 'Shield', label: 'System Config', path: '/dashboard/system',
    subLinks: [
      { label: 'School Info', path: '/dashboard/system/school-info' },
      { label: 'Grading', path: '/dashboard/system/grading' },
      { label: 'Academic Year', path: '/dashboard/system/academic-year' },
      { label: 'AI Settings', path: '/dashboard/system/ai-settings' },
      { label: 'Roles', path: '/dashboard/system/roles' },
      { label: 'Classes & Subjects', path: '/dashboard/system/classes-subjects' },
      { label: 'Maintenance', path: '/dashboard/system/maintenance' },
    ]
  },
  manageStaff: { icon: 'Users', label: 'Manage Staff', path: '/dashboard/users' },
  manageStudents: { icon: 'UsersRound', label: 'Manage Students', path: '/dashboard/students' },
  departments: { icon: 'Building', label: 'Departments', path: '/dashboard/departments' },
  database: { icon: 'Server', label: 'Database', path: '/dashboard/db' },
  logs: { icon: 'Activity', label: 'Logs & Security', path: '/dashboard/logs' },

  // HOD
  lessonApprovals: { icon: 'Book', label: 'Lesson Approvals', path: '/dashboard/lesson-notes' },
  hodAnalytics: { icon: 'BarChart2', label: 'Dept. Analytics', path: '/dashboard/hod/analytics' },

  // Teacher
  lessonPlans: { icon: 'BookCopy', label: 'Lesson Plans', path: '/dashboard/lesson-notes' },
  questionBank: { icon: 'FileQuestion', label: 'Question Bank', path: '/dashboard/exam-questions' },
  bulkUpload: { icon: 'UploadCloud', label: 'Bulk Upload', path: '/dashboard/teacher/bulk-upload' },
  enterScores: { icon: 'Edit3', label: 'Enter Scores', path: '/dashboard/scores' },
  myStudents: { icon: 'UsersRound', label: 'My Students', path: '/dashboard/performance' },
  attendance: { icon: 'CalendarCheck', label: 'Take Attendance', path: '/dashboard/teacher/attendance' },


  // Exam Officer
  reviewQuestions: { icon: 'FileQuestion', label: 'Review Questions', path: '/dashboard/exam-questions' },
  generateResults: { icon: 'CheckSquare', label: 'Generate Results', path: '/dashboard/results/generate' },
  viewResults: { icon: 'Award', label: 'View Results', path: '/dashboard/results/view' },
  timetable: { icon: 'Calendar', label: 'Timetable', path: '/dashboard/timetable' },
  examRegistration: { icon: 'Ticket', label: 'Exam Registration', path: '/dashboard/exam-registration' },
  seatingPlans: { icon: 'Grid', label: 'Seating Plans', path: '/dashboard/seating-plan' },

  // Accountant
  feeSystem: { icon: 'DollarSign', label: 'System Fee Structure', path: '/dashboard/accountant/fees' },
  invoices: { icon: 'FileText', label: 'Invoices', path: '/dashboard/accountant/invoices' },
  payments: { icon: 'CreditCard', label: 'Payments', path: '/dashboard/accountant/payments' },
  expenses: { icon: 'Wallet', label: 'Expenses', path: '/dashboard/accountant/expenses' },
  payroll: { icon: 'Briefcase', label: 'Payroll', path: '/dashboard/accountant/payroll' },
  reconciliation: { icon: 'Landmark', label: 'Reconciliation', path: '/dashboard/accountant/reconciliation' },
  financialReports: { icon: 'BarChart2', label: 'Financial Reports', path: '/dashboard/accountant/reports' },

  // Parent
  parentResults: { icon: 'BookOpen', label: 'Results', path: '/dashboard/performance' },
  parentPayments: { icon: 'DollarSign', label: 'Payments', path: '/dashboard/pay' },
  parentAnnouncements: { icon: 'Bell', label: 'Announcements', path: '/dashboard/announcements' },

  // Common Academic
  classesAndSubjects: { icon: 'BookMarked', label: 'Classes & Subjects', path: '/dashboard/system/classes-subjects' },
  gradingSystem: { icon: 'GraduationCap', label: 'Grading System', path: '/dashboard/system/grading' },
  aiSettings: { icon: 'Sparkles', label: 'AI Settings', path: '/dashboard/system/ai-settings' },
};

const navConfig: Record<string, { group: string; links: (keyof typeof allNavLinks)[] }[]> = {
  Admin: [
    { group: 'Main', links: ['dashboard', 'profile', 'notifications'] },
    { group: 'Communication', links: ['announcements', 'messaging'] },
    { group: 'Management', links: ['reports', 'system', 'manageStaff', 'manageStudents', 'departments'] },
    { group: 'Finance', links: ['feeSystem', 'invoices', 'payments', 'expenses', 'payroll', 'reconciliation', 'financialReports'] },
    { group: 'Academics', links: ['lessonApprovals', 'reviewQuestions', 'enterScores', 'generateResults', 'viewResults'] },
    { group: 'Infrastructure', links: ['database', 'logs'] }
  ],
  SLT: [
    { group: 'Main', links: ['dashboard', 'profile', 'notifications'] },
    { group: 'Communication', links: ['announcements', 'messaging'] },
    { group: 'Oversight', links: ['reports', 'manageStaff', 'manageStudents'] },
    { group: 'Academics', links: ['lessonApprovals', 'gradingSystem', 'classesAndSubjects', 'aiSettings'] },
    { group: 'Finance', links: ['financialReports'] },
  ],
  HeadOfDepartment: [
    { group: 'Main', links: ['dashboard', 'profile', 'notifications'] },
    { group: 'Communication', links: ['announcements', 'messaging'] },
    { group: 'Department', links: ['lessonApprovals', 'hodAnalytics', 'manageStaff'] },
    { group: 'Academics', links: ['classesAndSubjects'] },
  ],
  Accountant: [
    { group: 'Main', links: ['dashboard', 'profile', 'notifications'] },
    { group: 'Communication', links: ['announcements', 'messaging'] },
    { group: 'Finance', links: ['feeSystem', 'invoices', 'payments', 'expenses', 'payroll', 'reconciliation', 'financialReports'] },
  ],
  ExamOfficer: [
    { group: 'Main', links: ['dashboard', 'profile', 'notifications'] },
    { group: 'Communication', links: ['announcements', 'messaging'] },
    { group: 'Examinations', links: ['reviewQuestions', 'enterScores', 'generateResults', 'viewResults', 'timetable', 'examRegistration', 'seatingPlans'] },
  ],
  Teacher: [
    { group: 'Main', links: ['dashboard', 'profile', 'notifications'] },
    { group: 'Communication', links: ['announcements', 'messaging'] },
    { group: 'My Work', links: ['lessonPlans', 'questionBank', 'bulkUpload', 'enterScores', 'attendance', 'myStudents'] },
  ],
  Parent: [
    { group: 'Main', links: ['dashboard', 'profile', 'notifications'] },
    { group: 'My Child', links: ['parentResults', 'parentPayments', 'parentAnnouncements', 'timetable', 'messaging'] },
  ],
};


export function DashboardSidebar() {
  const pathname = usePathname();
  const { role, logout } = useRole();
  const { setOpenMobile } = useSidebar();

  React.useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);
  
  const renderNav = () => {
    const roleNav = role ? (navConfig[role] || []) : [];
    
    return roleNav.map((section, index) => (
       <React.Fragment key={`${section.group}-${index}`}>
          <p className="px-4 pt-4 text-xs font-semibold text-sidebar-foreground/50 group-data-[state=collapsed]:hidden">{section.group}</p>
          <SidebarMenu>
            {section.links.map((key) => {
              const item = allNavLinks[key];
              if (!item) return null;

              const Icon = iconMap[item.icon] || LayoutDashboard;
              return (
                 <SidebarMenuItem key={item.path}>
                    <Link href={item.path}>
                      <SidebarMenuButton isActive={pathname.startsWith(item.path) && (item.path !== '/dashboard' || pathname === '/dashboard')} tooltip={item.label}>
                        <Icon />
                        <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
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
    <Sidebar>
       <SidebarHeader className="border-b border-sidebar-border">
          <div className="bg-background/10 p-2 rounded-md group-data-[state=collapsed]:p-1">
            <Link href="/dashboard" className="flex items-center justify-center">
              <Image
                src="/school-logo.png"
                alt="Great Insight International Academy Logo"
                width={200}
                height={48}
                className="w-auto h-10 group-data-[state=collapsed]:hidden"
              />
               <Image
                src="/favicon.ico"
                alt="Great Insight International Academy Logo"
                width={32}
                height={32}
                className="w-auto h-8 hidden group-data-[state=collapsed]:block"
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
                <span className="group-data-[state=collapsed]:hidden">Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Log Out">
              <LogOut />
              <span className="group-data-[state=collapsed]:hidden">Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
