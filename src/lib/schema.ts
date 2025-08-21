export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'admin' | 'hod' | 'teacher' | 'parent';
  profilePic?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Department = {
  _id: string;
  name: string;
  hodId: string; // ObjectId -> users._id
  createdAt: Date;
};

export type Class = {
  _id: string;
  name: string;
  teacherId: string; // ObjectId -> users._id (class teacher)
  departmentId: string; // ObjectId -> departments._id
  createdAt: Date;
};

export type Subject = {
  _id: string;
  name: string;
  classId: string; // ObjectId -> classes._id
  teacherId: string; // ObjectId -> users._id
  createdAt: Date;
};

export type LessonNote = {
  _id: string;
  title: string;
  subjectId: string; // ObjectId -> subjects._id
  teacherId: string; // ObjectId -> users._id
  fileUrl: string;
  content?: string; // Keeping content for existing functionality
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string; // ObjectId -> users._id (HOD/Admin)
  hod_review?: string | null;
  admin_review?: string | null;
  submissionDate: string; // From previous mock data
  createdAt: Date;
  updatedAt: Date;
};

export type Announcement = {
  _id: string;
  title: string;
  message: string;
  audience: 'all' | 'staff' | 'parents';
  postedBy: string; // ObjectId -> users._id
  createdAt: Date;
};

export type Student = {
  _id: string;
  firstName: string;
  lastName:string;
  classId: string; // ObjectId -> classes._id
  parentId: string; // ObjectId -> users._id (role=parent)
  createdAt: Date;
};

// Merging old and new mock data structures for compatibility
// This will be updated as we build out the full application
export type MockUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  subject?: string;
  children?: string[];
};

export type MockLessonNote = {
    id: string;
    title: string;
    subject: string;
    teacherId: number;
    teacherName: string;
    status: string;
    submissionDate: string;
    content: string;
    hod_review: string | null;
    admin_review: string | null;
};
