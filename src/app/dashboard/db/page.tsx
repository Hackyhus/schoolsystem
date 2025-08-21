'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

export default function DatabasePage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Database Management</h1>
                <p className="text-muted-foreground">
                    Perform database backups and manage data restoration.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Data Backup</CardTitle>
                    <CardDescription>
                        It is recommended to perform regular backups of the school's data. Backups will be downloaded as a secure file.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Backup Database
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Data Restore</CardTitle>
                    <CardDescription>
                       Restore the database from a backup file. This is a critical action and should only be performed by authorized personnel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Button variant="destructive">
                        <Upload className="mr-2 h-4 w-4" />
                        Restore from Backup
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
