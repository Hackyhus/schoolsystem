
'use client';

import { useRole } from '@/context/role-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { dbService } from '@/lib/firebase';

export default function ProfilePage() {
    const { user, isLoading } = useRole();
    const router = useRouter();

    useEffect(() => {
        const redirectUser = async () => {
            if (!isLoading) {
                if (user) {
                    // Fetch user document to get staffId
                    try {
                        const userDoc = await dbService.getDoc<{ staffId: string }>('users', user.uid);
                        if (userDoc?.staffId) {
                            router.push(`/dashboard/users/${userDoc.staffId}`);
                        } else {
                            // Fallback or handle error if staffId is not found
                            console.error("User profile does not have a staffId.");
                            router.push('/dashboard');
                        }
                    } catch (e) {
                         console.error("Failed to fetch user document:", e);
                         router.push('/dashboard');
                    }
                } else {
                    // If not logged in, go to the login page
                    router.push('/');
                }
            }
        };
        
        redirectUser();
    }, [isLoading, user, router]);

    // Display a loading state while redirecting
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="w-full max-w-lg space-y-4 p-4">
                <h2 className="text-xl font-semibold">Redirecting to your profile...</h2>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-3/4" />
                <div className="space-y-2 pt-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </div>
            </div>
        </div>
    );
}

    
