
'use client';

import { useEffect, useState, useCallback }from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockUser } from '@/lib/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PersonalInfoForm } from './personal-info-form';
import { ProfessionalInfoForm } from './professional-info-form';
import { BankDetailsForm } from './bank-details-form';
import { useRouter } from 'next/navigation';
import { useRole } from '@/context/role-context';

const InfoItem = ({ label, value, isCurrency = false }: { label: string; value?: string | number | null; isCurrency?: boolean }) => {
    const displayValue = value === null || value === undefined || value === '' ? 'N/A' : value;
    const formattedValue = isCurrency && typeof displayValue === 'number'
        ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(displayValue)
        : displayValue;

    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base font-semibold">{formattedValue}</p>
        </div>
    );
};


export function AdminProfileView({ userId }: { userId: string }) {
    const [userData, setUserData] = useState<MockUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPersonalInfoOpen, setPersonalInfoOpen] = useState(false);
    const [isProfessionalInfoOpen, setProfessionalInfoOpen] = useState(false);
    const [isBankDetailsOpen, setBankDetailsOpen] = useState(false);
    const router = useRouter();
    const { role: currentUserRole, user: currentUser } = useRole();
    const isAdminViewing = currentUserRole === 'Admin' && currentUser?.uid !== userId;

    const fetchUserData = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            setUserData({ id: userDocSnap.id, ...userDocSnap.data() } as MockUser);
        }
        setIsLoading(false);
    }, [userId]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);


    const handleProfileUpdate = (updatedData: Partial<MockUser>) => {
        setUserData(prevData => prevData ? { ...prevData, ...updatedData } : null);
        // Close all dialogs
        setPersonalInfoOpen(false);
        setProfessionalInfoOpen(false);
        setBankDetailsOpen(false);
        // Optionally re-fetch to ensure data is consistent
        fetchUserData();
    }

    if (isLoading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!userData) {
        return <div>User data could not be loaded.</div>
    }

    const userInitials = userData.name ? userData.name.split(' ').map(n => n[0]).join('') : '..';
    const formattedEmploymentDate = userData.employmentDate
        ? format(new Date((userData.employmentDate as any).seconds * 1000), 'PPP')
        : 'N/A';
    const formattedDob = userData.personalInfo?.dob
        ? format(new Date((userData.personalInfo.dob as any).seconds * 1000), 'PPP')
        : 'N/A';


    return (
        <div className="space-y-8">
             <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-headline text-3xl font-bold">{isAdminViewing ? 'Staff Profile' : 'My Profile'}</h1>
                    <p className="text-muted-foreground">
                         {isAdminViewing ? `Viewing details for ${userData.name}.` : 'View and update your personal information.'}
                    </p>
                </div>
                 {isAdminViewing && (
                     <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Users
                     </Button>
                )}
            </div>
            
            <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={userData.personalInfo?.profilePicture || ''} alt={userData.name} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-2xl font-bold">{userData.name}</h2>
                    <p className="text-muted-foreground">{userData.email}</p>
                    <p className="text-sm text-muted-foreground">{userData.role} - {userData.department}</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Professional Information</CardTitle>
                        <CardDescription>
                            {isAdminViewing ? 'Official staff details and role.' : 'This information is managed by the administrator.'}
                        </CardDescription>
                    </div>
                     {isAdminViewing && (
                        <Dialog open={isProfessionalInfoOpen} onOpenChange={setProfessionalInfoOpen}>
                            <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Professional Information</DialogTitle>
                                </DialogHeader>
                                <ProfessionalInfoForm userData={userData} onUpdate={handleProfileUpdate} />
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                         <InfoItem label="Staff ID" value={userData.staffId} />
                         <InfoItem label="Date of Employment" value={formattedEmploymentDate} />
                         <InfoItem label="Status" value={userData.status} />
                         <InfoItem label="State of Origin" value={userData.stateOfOrigin} />
                     </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Contact and personal staff details.</CardDescription>
                    </div>
                     <Dialog open={isPersonalInfoOpen} onOpenChange={setPersonalInfoOpen}>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Personal Information</DialogTitle>
                            </DialogHeader>
                            <PersonalInfoForm userData={userData} onUpdate={handleProfileUpdate} />
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoItem label="Phone Number" value={userData.phone} />
                        <InfoItem label="Date of Birth" value={formattedDob} />
                        <InfoItem label="Gender" value={userData.personalInfo?.gender} />
                        <InfoItem label="Next of Kin" value={userData.personalInfo?.nextOfKin} />
                        <div className="sm:col-span-2 lg:col-span-3">
                           <InfoItem label="Address" value={userData.personalInfo?.address} />
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Bank & Salary Details</CardTitle>
                        <CardDescription>Financial information for salary payment.</CardDescription>
                    </div>
                    <Dialog open={isBankDetailsOpen} onOpenChange={setBankDetailsOpen}>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Bank & Salary</DialogTitle>
                            </DialogHeader>
                            <BankDetailsForm userData={userData} onUpdate={handleProfileUpdate} />
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                         <InfoItem label="Salary" value={userData.salary?.amount} isCurrency />
                         <InfoItem label="Bank Details" value={userData.salary?.bankAccount} />
                         <InfoItem label="Payment Status" value={userData.salary?.paymentStatus} />
                     </div>
                </CardContent>
            </Card>
        </div>
    )
}
