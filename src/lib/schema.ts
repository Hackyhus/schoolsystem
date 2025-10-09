



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
  id: string;
  name: string;
  teacherId?: string; // Class teacher
  subjectIds?: string[];
  subjectTeachers?: { [subjectId: string]: string }; // Map subjectId to teacherId
};


export type Subject = {
  id: string;
  name: string;
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

// New, detailed Student Schema
export type Student = {
    id: string;
    studentId: string; // GIIA/STU/24/0001
    firstName: string;
    lastName: string;
    middleName?: string;
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth: any; // Firestore Timestamp
    classLevel: string;
    sessionYear: string;
    profilePicture?: string;
    guardians: Guardian[];
    contacts: EmergencyContact[];
    documents?: StudentDocument[];
    health: HealthInfo;
    status: 'Active' | 'Inactive' | 'Graduated';
    createdAt: any; // Firestore Timestamp
}

export type Guardian = {
    fullName: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
    occupation?: string;
    isPrimary: boolean; // To identify the main contact
    userId?: string; // Firestore UID for parent login
}

export type EmergencyContact = {
    emergencyContactName: string;
    emergencyContactPhone: string;
    relationToStudent: string;
}

export type StudentDocument = {
    documentType: string;
    fileUrl: string;
    storagePath: string;
}

export type HealthInfo = {
    bloodGroup?: string;
    genotype?: string;
    allergies?: string;
    medicalConditions?: string;
}

export type Score = {
  id: string;
  studentId: string;
  subject: string;
  class: string;
  teacherId: string;
  term: string;
  caScore: number;
  examScore: number;
  totalScore: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
};

export type ReportCard = {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  term: string;
  session: string;
  generatedAt: any; // Firestore Timestamp
  subjects: {
    name: string;
    caScore: number;
    examScore: number;
    totalScore: number;
    grade: string;
  }[];
  totalMarks: number;
  average: number;
  overallGrade: string;
  classRank: number;
  principalComment?: string;
  teacherComment?: string;
};

export type FeeItem = {
    name: string;
    amount: number;
};

export type FeeStructure = {
    id: string;
    className: string;
    session: string;
    term: string;
    totalAmount: number;
    items: FeeItem[];
    createdAt: any; // Firestore timestamp
};

export type InvoiceItem = {
    name: string;
    amount: number;
};

export type Invoice = {
    id: string;
    invoiceId: string; // e.g., INV-2024-0001
    studentId: string;
    studentName: string;
    class: string;
    session: string;
    term: string;
    items: InvoiceItem[];
    totalAmount: number;
    amountPaid: number;
    balance: number;
    status: 'Paid' | 'Unpaid' | 'Overdue';
    createdAt: any; // Firestore timestamp
    dueDate: any; // Firestore timestamp
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
  className?: string; // Optional for students
  classLevel?: string;
  role: string;
  employmentDate: any; // Can be a Firestore Timestamp
  salary?: {
    amount: number;
    bankName: string | null;
    accountNumber: string | null;
    accountName: string | null;
    paymentStatus: string;
  };
  personalInfo?: {
    address: string;
    gender: string;
    dob: any; // Can be a Firestore Timestamp
    nextOfKin: string | null;
    profilePicture: string | null;
  };
  permissions?: {
    canUploadLessonNotes: boolean;
    canViewSalary: boolean;
    canAccessPortal: boolean;
  };
  status: string;
  createdAt: any; // Can be a Firestore Timestamp
};


export type MockLessonNote = {
    id: string;
    title: string;
    subject: string;
    class: string;
    teacherId: string;
    teacherName: string;
    status: string;
    submissionDate: string;
    fileUrl: string;
    content: string; // this is legacy, should be removed later
    hod_review: string | null;
    admin_review: string | null;
    submittedOn?: any;
};

export type SchoolInfo = {
    name: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string;
}
