
import type { MockUser, MockLessonNote } from './schema';

export const users: MockUser[] = [
    {
        id: 'user-001',
        staffId: 'GIIA24SCI0001',
        firstName: 'David',
        lastName: 'Chen',
        name: 'David Chen',
        email: 'david.chen@giia.com.ng',
        phone: '08012345678',
        stateOfOrigin: 'Lagos',
        department: 'Science',
        role: 'Teacher',
        employmentDate: new Date('2022-01-15'),
        salary: { amount: 150000, bankAccount: '0123456789', paymentStatus: 'Paid' },
        personalInfo: { address: '123 Science Rd, Lagos', gender: 'Male', dob: new Date('1990-05-20'), nextOfKin: 'Jane Chen', profilePicture: null },
        permissions: { canUploadLessonNotes: true, canViewSalary: true, canAccessPortal: true },
        status: 'Active',
        createdAt: new Date('2022-01-15'),
    },
    {
        id: 'user-002',
        staffId: 'GIIA22ART0001',
        firstName: 'Aisha',
        lastName: 'Bello',
        name: 'Aisha Bello',
        email: 'aisha.bello@giia.com.ng',
        phone: '08023456789',
        stateOfOrigin: 'Kano',
        department: 'Arts & Humanities',
        role: 'HeadOfDepartment',
        employmentDate: new Date('2020-08-01'),
        salary: { amount: 250000, bankAccount: '0987654321', paymentStatus: 'Paid' },
        personalInfo: { address: '456 Arts Ave, Kano', gender: 'Female', dob: new Date('1985-11-10'), nextOfKin: 'Musa Bello', profilePicture: null },
        permissions: { canUploadLessonNotes: true, canViewSalary: true, canAccessPortal: true },
        status: 'Active',
        createdAt: new Date('2020-08-01'),
    },
     {
        id: 'user-003',
        staffId: 'GIIA21ADM0001',
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@giia.com.ng',
        phone: '08034567890',
        stateOfOrigin: 'FCT',
        department: 'Administration',
        role: 'Admin',
        employmentDate: new Date('2021-03-10'),
        salary: { amount: 350000, bankAccount: '1122334455', paymentStatus: 'Paid' },
        personalInfo: { address: '1 Admin Way, Abuja', gender: 'Male', dob: new Date('1980-01-01'), nextOfKin: 'Super Admin', profilePicture: null },
        permissions: { canUploadLessonNotes: true, canViewSalary: true, canAccessPortal: true },
        status: 'Active',
        createdAt: new Date('2021-03-10'),
    }
];


export const lessonNotes: MockLessonNote[] = [
    {
        id: 'note-001',
        title: 'Introduction to Photosynthesis',
        subject: 'Biology',
        teacherId: 'user-001',
        teacherName: 'David Chen',
        status: 'Approved',
        submissionDate: '2024-05-20',
        content: 'This lesson covers the basics of photosynthesis, including the chemical equation, the roles of chlorophyll, sunlight, water, and carbon dioxide.',
        hod_review: 'Excellent work, approved.',
        admin_review: null,
    },
    {
        id: 'note-002',
        title: 'The Renaissance Period',
        subject: 'History',
        teacherId: 'user-002',
        teacherName: 'Aisha Bello',
        status: 'Pending Admin Approval',
        submissionDate: '2024-05-22',
        content: 'An overview of the cultural, artistic, political, and economic rebirth that occurred in Europe from the 14th to the 17th century.',
        hod_review: 'Good content, please add more visual aids for students.',
        admin_review: null,
    },
    {
        id: 'note-003',
        title: 'Algebraic Equations',
        subject: 'Mathematics',
        teacherId: 'user-001',
        teacherName: 'David Chen',
        status: 'Rejected by HOD',
        submissionDate: '2024-05-21',
        content: 'Solving linear equations with one variable. Includes examples and practice problems.',
        hod_review: 'The examples are not clear enough. Please provide step-by-step solutions.',
        admin_review: null,
    },
    {
        id: 'note-004',
        title: 'Introduction to Programming',
        subject: 'Computer Science',
        teacherId: 'user-001',
        teacherName: 'David Chen',
        status: 'Pending HOD Approval',
        submissionDate: '2024-05-24',
        content: 'This lesson will introduce students to the basic concepts of programming using Python. We will cover variables, data types, and basic operators.',
        hod_review: null,
        admin_review: null,
    }
];

export const studentPerformance = {
  studentId: 'ST-001',
  studentName: 'Adekunle Gold',
  class: 'JSS 2',
  attendance: [
    { month: 'Jan', percentage: 95 },
    { month: 'Feb', percentage: 92 },
    { month: 'Mar', percentage: 98 },
  ],
  grades: [
      { subject: 'Mathematics', score: 85, grade: 'A' },
      { subject: 'English', score: 92, grade: 'A' },
      { subject: 'Basic Science', score: 78, grade: 'B' },
      { subject: 'Social Studies', score: 88, grade: 'A' },
      { subject: 'Computer Science', score: 75, grade: 'B' },
      { subject: 'Physical Education', score: 95, grade: 'A' },
  ],
  recentReport: 'Adekunle is a diligent student with excellent performance in all subjects. He should be encouraged to participate more in class discussions.'
};

export const announcements: { id: number; title: string; content: string; date: string; audience: string; }[] = [
    {
        id: 1,
        title: 'Mid-Term Break',
        content: 'The school will be on mid-term break from the 28th of October to the 5th of November.',
        date: '2023-10-20',
        audience: 'all'
    },
    {
        id: 2,
        title: 'PTA Meeting',
        content: 'The termly PTA meeting will hold on the 25th of November, 2023.',
        date: '2023-10-18',
        audience: 'parents'
    }
];

export const messages: { id: number; from: string; to: string; subject: string; date: string; content: string; unread: boolean; }[] = [
    {
        id: 1,
        from: 'Admin',
        to: 'All Staff',
        subject: 'Staff Meeting Notification',
        date: '2023-10-25',
        content: 'This is to notify all staff of a mandatory meeting scheduled for Friday, 27th October 2023 at 2:00 PM. Venue is the staff room. Agenda will be circulated shortly. Your attendance is compulsory.',
        unread: true
    },
    {
        id: 2,
        from: 'Mrs. Funke Ojo (Parent)',
        to: 'Mr. David Chen',
        subject: 'Inquiry about Adekunle\'s Performance',
        date: '2023-10-24',
        content: 'Dear Mr. Chen, I hope this message finds you well. I wanted to follow up on our discussion regarding Adekunle\'s progress in Mathematics. Do you have any further recommendations for him? Thank you.',
        unread: false
    },
    {
        id: 3,
        from: 'HOD Science',
        to: 'Mr. David Chen',
        subject: 'Re: Lesson Note Submission',
        date: '2023-10-23',
        content: 'Your lesson note on "The Water Cycle" has been reviewed. Please see my comments and make the necessary adjustments before final approval. Good work overall.',
        unread: false
    }
];

export const departmentStaff: { id: number; name: string; subject: string; class: string; }[] = [
    { id: 1, name: 'David Chen', subject: 'Physics', class: 'SS 2' },
    { id: 2, name: 'Blessing Adebayo', subject: 'Chemistry', class: 'SS 1' },
    { id: 3, 'name': 'Emeka Okafor', subject: 'Biology', class: 'SS 2' }
];

export const departments = [
    { id: 1, name: 'Science', hod: 'Mr. David Chen', teachers: 8, students: 120 },
    { id: 2, name: 'Arts & Humanities', hod: 'Mrs. Aisha Bello', teachers: 6, students: 95 },
    { id: 3, name: 'Technology', hod: 'Mr. John Adebayo', teachers: 4, students: 60 },
    { id: 4, name: 'Vocational Studies', hod: 'Ms. Grace Eze', teachers: 3, students: 45 },
];
