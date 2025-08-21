
'use client';

import { useRole } from '@/context/role-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
    const { user, isLoading } = useRole();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                // Redirect to the detailed user profile page for the current user
                router.push(`/dashboard/users/${user.uid}`);
            } else {
                // If not logged in, go to the login page
                router.push('/');
            }
        }
    }, [isLoading, user, router]);

    // Display a loading state while redirecting
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="w-full max-w-lg space-y-4 p-4">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-8 w-3/4" />
                <div className="space-y-2 pt-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-10 w-full mt-4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}
