import type { MockUser, MockLessonNote } from './schema';

export const users: MockUser[] = [
  { id: 1, name: 'Admin User', email: 'admin@giia.com.ng', role: 'Admin' },
  { id: 2, name: 'Dr. Evelyn Reed', email: 'hod.science@giia.com.ng', role: 'HeadOfDepartment', department: 'Science' },
  { id: 3, name: 'Mr. David Chen', email: 'd.chen@giia.com.ng', role: 'Teacher', subject: 'Physics' },
  { id: 4, name: 'Mrs. Aisha Bello', email: 'a.bello@giia.com.ng', role: 'Teacher', subject: 'Chemistry' },
  { id: 5, name: 'Mr. & Mrs. Okoro', email: 'parent.okoro@email.com', role: 'Parent', children: ['Ada Okoro'] },
];

export const lessonNotes: MockLessonNote[] = [
  {
    id: 'LN001',
    title: 'Introduction to Thermodynamics',
    subject: 'Physics',
    teacherId: 3,
    teacherName: 'Mr. David Chen',
    status: 'Approved',
    submissionDate: '2023-10-26',
    content: 'This lesson introduces the fundamental laws of thermodynamics. Key topics include thermal equilibrium, the Zeroth Law, the First Law (conservation of energy), and the concepts of heat and work. Students will engage in practical examples to understand energy transfer.',
    hod_review: 'Well-structured. Approved.',
    admin_review: 'Excellent. Approved.',
  },
  {
    id: 'LN002',
    title: 'Chemical Bonding and Molecular Structure',
    subject: 'Chemistry',
    teacherId: 4,
    teacherName: 'Mrs. Aisha Bello',
    status: 'Pending HOD Approval',
    submissionDate: '2023-10-28',
    content: 'This lesson explores the different types of chemical bonds: ionic, covalent, and metallic. We will use Lewis structures to represent molecular bonding and VSEPR theory to predict the geometry of molecules. The lesson includes interactive model building.',
    hod_review: null,
    admin_review: null,
  },
  {
    id: 'LN003',
    title: 'Newtonian Mechanics: Forces',
    subject: 'Physics',
    teacherId: 3,
    teacherName: 'Mr. David Chen',
    status: 'Rejected by HOD',
    submissionDate: '2023-10-29',
    content: 'A deep dive into Newton\'s three laws of motion. This lesson covers concepts like inertia, force, mass, acceleration, and action-reaction pairs.',
    hod_review: 'Please include more real-world examples and a practical lab guide.',
    admin_review: null,
  },
];

export const studentPerformance = {
  studentId: 'GIIA-0123',
  studentName: 'Ada Okoro',
  class: 'SS2',
  attendance: [
    { month: 'Sep', percentage: 98 },
    { month: 'Oct', percentage: 95 },
  ],
  grades: [
    { subject: 'Mathematics', score: 88, grade: 'A' },
    { subject: 'English', score: 92, grade: 'A' },
    { subject: 'Physics', score: 85, grade: 'A' },
    { subject: 'Chemistry', score: 90, grade: 'A' },
    { subject: 'Biology', score: 81, grade: 'B' },
  ],
  recentReport: '/path/to/report-card.pdf',
};

export const announcements = [
  { id: 1, title: 'Mid-Term Break', content: 'The school will be on mid-term break from October 30th to November 3rd. Classes resume on November 6th.', date: '2023-10-25', audience: 'All' },
  { id: 2, title: 'Parent-Teacher Conference', content: 'The termly Parent-Teacher Conference is scheduled for November 18th, 2023. Please book your slots.', date: '2023-10-22', audience: 'Parents' },
];

export const messages = [
  { id: 1, from: 'Mr. David Chen', to: 'Dr. Evelyn Reed', subject: 'Query on LN003', date: '2023-10-29' },
  { id: 2, from: 'Admin', to: 'All Staff', subject: 'Staff Meeting Reminder', date: '2023-10-27' },
];

export const departmentStaff = [
    { id: 3, name: 'Mr. David Chen', subject: 'Physics', class: 'SS2' },
    { id: 4, name: 'Mrs. Aisha Bello', subject: 'Chemistry', class: 'SS2' },
    { id: 6, name: 'Mr. Femi Adeboye', subject: 'Biology', class: 'SS1' },
];
