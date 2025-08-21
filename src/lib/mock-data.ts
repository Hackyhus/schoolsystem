
import type { MockUser, MockLessonNote } from './schema';

export const users: MockUser[] = [];


export const lessonNotes: MockLessonNote[] = [
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
];
