
import type { MockUser, MockLessonNote } from './schema';

export const users: MockUser[] = [];

export const lessonNotes: MockLessonNote[] = [];

// All mock data has been removed to transition to live data fetching.
// Components will now fetch data directly from Firestore.

export const studentPerformance = {
  studentId: '',
  studentName: '',
  class: '',
  attendance: [],
  grades: [],
  recentReport: ''
};

export const announcements: { id: number; title: string; content: string; date: string; audience: string; }[] = [];

export const messages: { id: number; from: string; to: string; subject: string; date: string; content: string; unread: boolean; }[] = [];

export const departmentStaff: { id: number; name: string; subject: string; class: string; }[] = [];

export const departments = [];
