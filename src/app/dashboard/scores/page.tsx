'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function ScoresPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Enter Student Scores</h1>
        <p className="text-muted-foreground">
          Input Continuous Assessment (CA) and exam scores for your students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Class & Subject</CardTitle>
          <div className="mt-4 flex gap-4">
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {/* Populate with teacher's classes */}
                <SelectItem value="jss1">JSS 1</SelectItem>
                <SelectItem value="ss2">SS 2</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                 {/* Populate with teacher's subjects */}
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="eng">English</SelectItem>
              </SelectContent>
            </Select>
             <Button>Load Students</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>CA 1 (20%)</TableHead>
                <TableHead>CA 2 (20%)</TableHead>
                <TableHead>Exam (60%)</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* This will be populated after loading students */}
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Select a class and subject to load students.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
           <div className="mt-6 flex justify-end">
              <Button>Save Scores</Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
