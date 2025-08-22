
'use client';

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function TimetablePage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Exam Timetable</h1>
                <p className="text-muted-foreground">
                    Manage and view the examination schedule.
                </p>
            </div>
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Exam Schedule</CardTitle>
                        <CardDescription>
                           Upcoming exams are displayed on the calendar.
                        </CardDescription>
                    </div>
                     <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Exam
                    </Button>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="multiple"
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
