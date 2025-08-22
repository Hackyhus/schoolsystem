
'use client';

import { useEffect, useState, useCallback } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { MockUser } from '@/lib/schema';
import { useRole } from '@/context/role-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PersonalInfoForm } from '@/components/dashboard/profile/personal-info-form';
import { ProfessionalInfoForm } from '@/components/dashboard/profile/professional-info-form';
import { BankDetailsForm } from '@/components/dashboard/profile/bank-details-form';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function UserProfilePage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [personalInfoModalOpen, setPersonalInfoModalOpen] = useState(false);
  const { role: currentUserRole } = useRole();

  const userId = Array.isArray(id) ? id[0] : id;

  const fetchUser = useCallback(() => {
    setIsLoading(true);
    const docRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUser({ id: docSnap.id, ...docSnap.data() } as MockUser);
      } else {
        notFound();
      }
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching user:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    const unsubscribe = fetchUser();
    return () => unsubscribe();
  }, [fetchUser]);

  const handleUpdate = () => {
    // Re-fetch handled by onSnapshot
    setPersonalInfoModalOpen(false);
  };
  
  const canEdit =
    currentUserRole === 'Admin' ||
    (user && auth.currentUser?.uid === user.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
         <Skeleton className="h-9 w-48" />
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
             <Skeleton className="h-20 w-20 rounded-full" />
             <div className="space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-5 w-60" />
             </div>
          </CardHeader>
          <CardContent>
             <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return notFound();
  }

  const userInitials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : '';

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/dashboard/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
        </Button>
      <Card>
        <CardHeader>
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
            <Avatar className="h-20 w-20">
                <AvatarImage src={user.personalInfo?.profilePicture || undefined} />
                <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <CardTitle className="text-3xl">{user.name}</CardTitle>
                <div className={cn("text-sm text-muted-foreground", "flex items-center justify-center gap-2 md:justify-start")}>
                  {user.email} <Badge variant="outline">{user.role}</Badge>
                </div>
            </div>
             {canEdit && (
               <Dialog open={personalInfoModalOpen} onOpenChange={setPersonalInfoModalOpen}>
                  <DialogTrigger asChild>
                     <Button variant="outline">
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                     </Button>
                  </DialogTrigger>
                  <DialogContent>
                     <DialogHeader>
                        <DialogTitle>Edit Personal Information</DialogTitle>
                     </DialogHeader>
                      <PersonalInfoForm user={user} onUpdate={handleUpdate} />
                  </DialogContent>
               </Dialog>
              )}
            </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
            <Card>
                <CardHeader>
                   <CardTitle>Professional Information</CardTitle>
                   <CardDescription>Role, department, and employment details.</CardDescription>
                </CardHeader>
                <CardContent>
                   {currentUserRole === 'Admin' ? (
                     <ProfessionalInfoForm user={user} onUpdate={handleUpdate} />
                   ) : (
                     <div className="space-y-4 text-sm">
                        <p><strong>Role:</strong> {user.role}</p>
                        <p><strong>Department:</strong> {user.department}</p>
                        <p><strong>Employment Date:</strong> {user.employmentDate ? new Date(user.employmentDate.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                     </div>
                   )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                   <CardTitle>Personal Details</CardTitle>
                   <CardDescription>Contact and demographic information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                   <p><strong>Phone:</strong> {user.phone}</p>
                   <p><strong>Address:</strong> {user.personalInfo?.address}</p>
                   <p><strong>Date of Birth:</strong> {user.personalInfo?.dob ? new Date(user.personalInfo.dob.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                   <p><strong>Gender:</strong> {user.personalInfo?.gender}</p>
                   <p><strong>Next of Kin:</strong> {user.personalInfo?.nextOfKin || 'N/A'}</p>
                   <p><strong>State of Origin:</strong> {user.stateOfOrigin}</p>
                </CardContent>
            </Card>
        </div>

         <Card className="lg:col-span-1">
            <CardHeader>
               <CardTitle>Bank & Salary</CardTitle>
               <CardDescription>Financial details for salary payment.</CardDescription>
            </CardHeader>
            <CardContent>
                <BankDetailsForm user={user} onUpdate={handleUpdate} />
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
