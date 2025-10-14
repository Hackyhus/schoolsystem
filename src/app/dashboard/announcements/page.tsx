
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Rss } from "lucide-react";
import { useRole } from '@/context/role-context';
import { dbService } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AnnouncementForm } from '@/components/dashboard/announcements/announcement-form';
import usePersistentState from '@/hooks/use-persistent-state';
import Link from 'next/link';

type Announcement = {
    id: string;
    title: string;
    content: string;
    authorName: string;
    createdAt: { seconds: number, nanoseconds: number };
}

export default function AnnouncementsPage() {
    const { role } = useRole();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = usePersistentState('announcement-form-open', false);

    const canCreate = role === 'Admin' || role === 'SLT';

    const fetchAnnouncements = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedAnnouncements = await dbService.getDocs<Announcement>('announcements', [{ type: 'orderBy', fieldPath: 'createdAt', direction: 'desc' }]);
            setAnnouncements(fetchedAnnouncements);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const handleFormSubmit = (success: boolean) => {
        setIsFormOpen(false);
        if (success) {
            fetchAnnouncements();
        }
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Announcements</h1>
                <p className="text-muted-foreground">
                    View important updates and news from the school.
                </p>
            </div>
            
             <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>School-wide Announcements</CardTitle>
                            <CardDescription>
                                Official announcements from the school administration.
                            </CardDescription>
                        </div>
                        {canCreate && (
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Create Announcement
                                </Button>
                            </DialogTrigger>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-64 w-full" />
                        ) : announcements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Rss className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold">No Announcements Yet</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Check back later for important updates.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {announcements.map((ann) => (
                                     <Card key={ann.id} className="shadow-none border hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <Link href={`/dashboard/announcements/${ann.id}`} className="hover:underline">
                                                <CardTitle>{ann.title}</CardTitle>
                                            </Link>
                                            <CardDescription>
                                                Posted by {ann.authorName} on {format(new Date(ann.createdAt.seconds * 1000), 'PPP')}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm whitespace-pre-wrap line-clamp-3">{ann.content}</p>
                                        </CardContent>
                                     </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Announcement</DialogTitle>
                    </DialogHeader>
                    <AnnouncementForm onFormSubmit={handleFormSubmit} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
