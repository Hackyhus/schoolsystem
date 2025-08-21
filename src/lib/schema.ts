

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

export type AppNotification = {
  id: string;
  toUserId: string;
  type: 'APPROVAL' | 'REJECTION' | 'INFO';
  title: string;
  body: string;
  ref: {
    collection: string;
    id: string;
  };
  read: boolean;
  createdAt: { seconds: number; nanoseconds: number };
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


export type MockUser = {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  stateOfOrigin: string;
  department: string;
  role: string;
  employmentDate: Date;
  salary: {
    amount: number;
    bankAccount: string | null;
    paymentStatus: string;
  };
  personalInfo: {
    address: string;
    gender: string;
    dob: Date;
    nextOfKin: string | null;
    profilePicture: string | null;
  };
  permissions: {
    canUploadLessonNotes: boolean;
    canViewSalary: boolean;
    canAccessPortal: boolean;
  };
  status: string;
  createdAt: Date;
};


export type MockLessonNote = {
    id: string;
    title: string;
    subject: string;
    teacherId: string;
    teacherName: string;
    status: string;
    submissionDate: string;
    fileUrl: string;
    content: string; // this is legacy, should be removed later
    hod_review: string | null;
    admin_review: string | null;
};
