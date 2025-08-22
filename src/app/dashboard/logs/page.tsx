
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// This data is now empty as per the requirement to remove mock data.
// This component should be connected to a live logging backend.
const logs: { id: number; level: string; message: string; timestamp: string; user: string; }[] = []

export default function LogsPage() {

    const levelVariant = (level: string) => {
        if (level === 'error') return 'destructive';
        if (level === 'warning') return 'secondary';
        return 'outline';
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Logs & Security</h1>
                <p className="text-muted-foreground">
                    Monitor system activity and security events.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>System Event Log</CardTitle>
                    <CardDescription>
                        A real-time log of all significant events occurring within the portal.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Level</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Message</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length > 0 ? logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <Badge variant={levelVariant(log.level)} className="capitalize">{log.level}</Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                                    <TableCell>{log.user}</TableCell>
                                    <TableCell>{log.message}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No log entries found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
