
'use client';

import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { MockUser } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PersonalInfoForm } from './personal-info-form';
import { ProfessionalInfoForm } from './professional-info-form';
import { BankDetailsForm } from './bank-details-form';
import { useRole } from '@/context/role-context';
import { format } from 'date-fns';

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) => (
  <div className="py-2">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-base font-semibold">{value || 'N/A'}</p>
  </div>
);

export function AdminProfileView({ userId }: { userId: string }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { role: currentUserRole } = useRole();
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isProfessionalInfoOpen, setIsProfessionalInfoOpen] = useState(false);
  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Firestore Timestamps to JS Dates
        const userData = {
          ...data,
          id: docSnap.id,
          employmentDate: data.employmentDate?.toDate(),
          personalInfo: {
            ...data.personalInfo,
            dob: data.personalInfo?.dob?.toDate(),
          },
        } as MockUser;
        setUser(userData);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'User not found.',
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch user data.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleUpdate = () => {
    fetchUser(); // Re-fetch user data after an update
    setIsPersonalInfoOpen(false);
    setIsProfessionalInfoOpen(false);
    setIsBankDetailsOpen(false);
  };
  
  const canEditAdminFields = currentUserRole === 'Admin' || currentUserRole === 'Super Admin';
  const canEditPersonalFields = canEditAdminFields || (user && auth.currentUser?.uid === user.id);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-muted-foreground">User not found.</div>
    );
  }

  const userInitials =
    user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('') || '..';

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <Dialog open={isPersonalInfoOpen} onOpenChange={setIsPersonalInfoOpen}>
              <div className="relative">
                <Avatar className="h-24 w-24 text-4xl">
                  <AvatarImage
                    src={user.personalInfo?.profilePicture || ''}
                    alt={user.name || ''}
                  />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <DialogTrigger asChild>
                   <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full"
                      disabled={!canEditPersonalFields}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
              </div>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Personal Information</DialogTitle>
                </DialogHeader>
                <PersonalInfoForm user={user} onUpdate={handleUpdate} />
              </DialogContent>
            </Dialog>

            <div className="space-y-1">
              <CardTitle className="text-3xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>
              Employment and role details. This information is managed by the
              administrator.
            </CardDescription>
          </div>
          <Dialog
            open={isProfessionalInfoOpen}
            onOpenChange={setIsProfessionalInfoOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" disabled={!canEditAdminFields}>
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Professional Information</DialogTitle>
              </DialogHeader>
              <ProfessionalInfoForm user={user} onUpdate={handleUpdate} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Staff ID" value={user.staffId} />
            <InfoItem label="Role" value={user.role} />
            <InfoItem label="Department" value={user.department} />
            <InfoItem
              label="Employment Date"
              value={
                user.employmentDate
                  ? format(user.employmentDate, 'PPP')
                  : 'N/A'
              }
            />
            <InfoItem label="Status" value={user.status} />
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your personal contact and demographic details.
            </CardDescription>
          </div>
           <Dialog
            open={isPersonalInfoOpen}
            onOpenChange={setIsPersonalInfoOpen}
          >
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" disabled={!canEditPersonalFields}>
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Personal Information</DialogTitle>
              </DialogHeader>
              <PersonalInfoForm user={user} onUpdate={handleUpdate} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Full Name" value={user.name} />
            <InfoItem label="Phone Number" value={user.phone} />
            <InfoItem
              label="Date of Birth"
              value={
                user.personalInfo?.dob
                  ? format(user.personalInfo.dob, 'PPP')
                  : 'N/A'
              }
            />
            <InfoItem label="Gender" value={user.personalInfo?.gender} />
            <InfoItem label="State of Origin" value={user.stateOfOrigin} />
            <InfoItem
              label="Address"
              value={user.personalInfo?.address}
              />
          </div>
        </CardContent>
      </Card>

      {/* Bank & Salary Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bank & Salary Details</CardTitle>
            <CardDescription>
              Your salary and bank account information.
            </CardDescription>
          </div>
          <Dialog
            open={isBankDetailsOpen}
            onOpenChange={setIsBankDetailsOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" disabled={!canEditPersonalFields}>
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Bank & Salary Details</DialogTitle>
                <DialogDescription>
                    Salary can only be changed by an administrator.
                </DialogDescription>
              </DialogHeader>
              <BankDetailsForm user={user} onUpdate={handleUpdate} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Salary"
              value={
                user.salary?.amount
                  ? `₦${user.salary.amount.toLocaleString()}`
                  : 'N/A'
              }
            />
             <InfoItem
              label="Bank Name"
              value={user.salary?.bankName}
            />
             <InfoItem
              label="Account Number"
              value={user.salary?.accountNumber}
            />
            <InfoItem
              label="Account Name"
              value={user.salary?.accountName}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    