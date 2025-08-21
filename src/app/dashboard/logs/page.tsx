'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const logs = [
    { id: 1, level: 'info', message: 'Admin logged in successfully', timestamp: '2024-05-28 10:00:15', user: 'admin@giia.com.ng' },
    { id: 2, level: 'warning', message: 'Failed login attempt for user: teacher@giia.com.ng', timestamp: '2024-05-28 09:45:30', user: 'system' },
    { id: 3, level: 'info', message: 'Lesson note "Algebraic Equations" approved by HOD', timestamp: '2024-05-28 09:30:00', user: 'hod.science@giia.com.ng' },
    { id: 4, level: 'error', message: 'Failed to connect to payment gateway', timestamp: '2024-05-28 09:15:22', user: 'system' },
    { id: 5, level: 'info', message: 'New staff "Bello Musa" created', timestamp: '2024-05-27 15:20:10', user: 'admin@giia.com.ng' },
]

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
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <Badge variant={levelVariant(log.level)} className="capitalize">{log.level}</Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                                    <TableCell>{log.user}</TableCell>
                                    <TableCell>{log.message}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
