
'use client';

import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockUser } from '@/lib/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalInfoForm } from './personal-info-form';
import { ProfessionalInfoForm } from './professional-info-form';
import { BankDetailsForm } from './bank-details-form';
import { useRole } from '@/context/role-context';
import { AdminProfileView } from './admin-profile-view';

export function ProfileForm({ userId }: { userId: string }) {
    const [userData, setUserData] = useState<MockUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { role, user: currentUser } = useRole();

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
       fetchUserData();
    }
    
    // Admin is viewing another user's profile
    if (role === 'Admin' && currentUser?.uid !== userId) {
        return <AdminProfileView userId={userId} />;
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
                        <div className="grid grid-cols-2 gap-4">
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

    // Regular user viewing their own profile
    return (
        <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="professional">Professional Info</TabsTrigger>
                <TabsTrigger value="bank">Bank Details</TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Update your personal details here. Click save when you're done.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PersonalInfoForm userData={userData} onUpdate={handleProfileUpdate} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="professional">
                <Card>
                    <CardHeader>
                        <CardTitle>Professional Information</CardTitle>
                        <CardDescription>
                           This information is managed by the administrator. Contact them for any changes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ProfessionalInfoForm userData={userData} onUpdate={handleProfileUpdate} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="bank">
                 <Card>
                    <CardHeader>
                        <CardTitle>Bank Details</CardTitle>
                        <CardDescription>
                           Update your bank account information for salary payments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BankDetailsForm userData={userData} onUpdate={handleProfileUpdate} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
