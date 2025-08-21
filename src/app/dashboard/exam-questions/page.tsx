'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRole } from '@/context/role-context';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const mockQuestions = [
    { id: 1, subject: 'Biology', class: 'SS1', status: 'Pending Review', submittedOn: '2024-05-27' },
    { id: 2, subject: 'Physics', class: 'SS3', status: 'Approved', submittedOn: '2024-05-26' },
    { id: 3, subject: 'Chemistry', class: 'SS1', status: 'Rejected', submittedOn: '2024-05-25' },
];


export default function ExamQuestionsPage() {
  const { role } = useRole();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected')) return 'destructive';
    return 'outline';
  };

  const getActionText = () => {
    if (role === 'Teacher') return 'View';
    if (role === 'ExamOfficer') return 'Review';
    return 'View';
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Test & Exam Questions</h1>
        <p className="text-muted-foreground">
          {role === 'Teacher' ? 'Manage and track your question submissions.' : 'Review and manage all exam questions.'}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Submissions</CardTitle>
            <CardDescription>
              A complete list of all submitted questions.
            </CardDescription>
          </div>
          {role === 'Teacher' && (
             <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" /> Upload Questions
                </Button>
              </DialogTrigger>
              <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Upload Exam Questions</DialogTitle>
                    <DialogDescription>
                      Select the class, subject, and upload your questions file.
                    </DialogDescription>
                 </DialogHeader>
                 {/* Add form component here */}
                 <p className="text-center text-muted-foreground py-8">Exam question upload form will be here.</p>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockQuestions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.subject}</TableCell>
                  <TableCell>{q.class}</TableCell>
                  <TableCell>{q.submittedOn}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(q.status)}>{q.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                       {/* This will link to a dynamic page later */}
                      <Link href="#">{getActionText()}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
               {mockQuestions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No questions found.
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
