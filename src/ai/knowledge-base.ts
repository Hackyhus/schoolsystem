
// This file serves as a text-based knowledge base for the AI support bot.
// It describes the application's routes, features, and permissions.

export const KNOWLEDGE_BASE = `
## Application Overview
The GIIA Portal is a role-based school management system for Great Insight International Academy.

## User Roles and General Permissions
- Admin: Has full access to all features, including system configuration and user management.
- SLT (Senior Leadership Team): Has oversight of academic and operational data. Can view most reports and manage staff/students.
- HeadOfDepartment (HOD): Manages their specific academic department, approves lesson plans, and views department analytics.
- Teacher: Manages their own lesson plans, exam questions, and enters student scores.
- Accountant: Manages all financial aspects of the school, including fees, invoices, payments, and payroll.
- ExamOfficer: Manages the examination process, including reviewing questions, generating results, and timetabling.
- Parent: Can view their child's academic performance, announcements, and fee information.

## Feature Breakdown by Route

- Route: /dashboard
  - Purpose: The main landing page after login. Displays a summary of relevant information for the user's role.
  - Accessible by: All roles.

- Route: /dashboard/users
  - Purpose: Staff management. Admins can add, view, and manage all staff profiles.
  - Accessible by: Admin, SLT, HeadOfDepartment.

- Route: /dashboard/students
  - Purpose: Student management. Admins can enroll new students, view profiles, and manage student records.
  - Accessible by: Admin, SLT.

- Route: /dashboard/departments
  - Purpose: Manage academic departments and assign Heads of Department (HODs).
  - Accessible by: Admin.

- Route: /dashboard/system/*
  - Purpose: System-wide configuration. Includes settings for school info, grading scales, academic year, roles, and maintenance mode.
  - Accessible by: Admin. SLT has access to some sub-sections.

- Route: /dashboard/lesson-notes
  - Purpose: For teachers to submit lesson plans. For HODs and Admins to review, approve, or reject these submissions.
  - Accessible by: Admin, SLT, HeadOfDepartment, Teacher.

- Route: /dashboard/exam-questions
  - Purpose: For teachers to submit test and exam questions. For Exam Officers to review and approve them.
  - Accessible by: Admin, ExamOfficer, Teacher.

- Route: /dashboard/scores
  - Purpose: For teachers to enter student scores (CAs and Exams). For Exam Officers to review and approve scores.
  - Accessible by: Admin, ExamOfficer, Teacher.

- Route: /dashboard/results/*
  - Purpose: For Exam Officers to generate final report cards from approved scores. All academic roles can view generated results.
  - Accessible by: Admin, SLT, HeadOfDepartment, ExamOfficer, Teacher.

- Route: /dashboard/accountant/*
  - Purpose: A suite of tools for the Accountant role.
  - Sub-routes:
    - /fees: Create and manage fee structures for different class groups.
    - /invoices: Generate and track student invoices.
    - /payments: Record fee payments against invoices.
    - /expenses: Log all school expenditures.
    - /payroll: Run monthly payroll for staff.
    - /reconciliation: Reconcile bank statements with portal records.
  - Accessible by: Accountant, Admin.

- Route: /dashboard/performance
  - Purpose: A portal for parents to view their child's results and performance. Also used by teachers to see their student list.
  - Accessible by: Parent, Teacher.

- Route: /profile
  - Purpose: Allows users to view their own profile information.
  - Accessible by: All roles.

- Route: /dashboard/notifications
  - Purpose: Displays a list of all notifications for the user, such as submission approvals or rejections.
  - Accessible by: All roles.
`;
