
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

- Feature: Dashboard
  - Purpose: The main landing page after login. Displays a summary of relevant information for the user's role.
  - Accessible by: All roles.

- Feature: Manage Staff
  - Navigation: Users
  - Purpose: Staff management. Admins can add, view, and manage all staff profiles.
  - Accessible by: Admin, SLT, HeadOfDepartment.

- Feature: Manage Students
  - Navigation: Students
  - Purpose: Student management. Admins can enroll new students, view profiles, and manage student records.
  - Accessible by: Admin, SLT.

- Feature: Departments
  - Navigation: Departments
  - Purpose: Manage academic departments and assign Heads of Department (HODs).
  - Accessible by: Admin.

- Feature: System Configuration
  - Navigation: System
  - Purpose: System-wide configuration. Includes settings for school info, grading scales, academic year, roles, and maintenance mode.
  - Accessible by: Admin. SLT has access to some sub-sections.

- Feature: Lesson Plans
  - Navigation: Lesson Plans
  - Purpose: For teachers to submit lesson plans. For HODs and Admins to review, approve, or reject these submissions.
  - Accessible by: Admin, SLT, HeadOfDepartment, Teacher.

- Feature: Question Bank
  - Navigation: Question Bank
  - Purpose: For teachers to submit test and exam questions. For Exam Officers to review and approve them.
  - Accessible by: Admin, ExamOfficer, Teacher.

- Feature: Scores
  - Navigation: Enter Scores
  - Purpose: For teachers to enter student scores (CAs and Exams). For Exam Officers to review and approve scores.
  - Accessible by: Admin, ExamOfficer, Teacher.

- Feature: Results
  - Navigation: Generate Results / View Results
  - Purpose: For Exam Officers to generate final report cards from approved scores. All academic roles can view generated results.
  - Accessible by: Admin, SLT, HeadOfDepartment, ExamOfficer, Teacher.

- Feature: Accountant Tools
  - Purpose: A suite of tools for the Accountant role.
  - Sections:
    - Fee Structures: Create and manage fee structures for different class groups.
    - Invoices: Generate and track student invoices.
    - Payments: Record fee payments against invoices.
    - Expenses: Log all school expenditures.
    - Payroll: Run monthly payroll for staff.
    - Reconciliation: Reconcile bank statements with portal records.
  - Accessible by: Accountant, Admin.

- Feature: Student Performance
  - Navigation: My Students (for Teachers) / Results (for Parents)
  - Purpose: A portal for parents to view their child's results and performance. Also used by teachers to see their student list.
  - Accessible by: Parent, Teacher.

- Feature: Profile
  - Navigation: Click your name in the top-right corner, then Profile.
  - Purpose: Allows users to view and edit their own profile information.
  - Accessible by: All roles.

- Feature: Notifications
  - Navigation: Notifications (bell icon in the header)
  - Purpose: Displays a list of all notifications for the user, such as submission approvals or rejections.
  - Accessible by: All roles.
`;
