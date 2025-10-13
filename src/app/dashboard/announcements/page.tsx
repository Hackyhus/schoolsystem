'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Announcements</h1>
                <p className="text-muted-foreground">
                    View important updates and news from the school.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>School-wide Announcements</CardTitle>
                    <CardDescription>
                       This section will display all official announcements from the school administration, including information about upcoming events, holidays, policy changes, and other important news.
                       <br /><br />
                        <strong className="text-primary">This feature is currently in development and will be available once the project is approved.</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                         <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                             <Megaphone className="h-8 w-8 text-primary" />
                         </div>
                        <h3 className="text-lg font-semibold">Announcements Board is Coming Soon</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                           All school announcements will be listed here.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
