
'use client';

import type { ReportCard } from '@/lib/schema';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';


interface ReportCardTemplateProps {
  reportCard: ReportCard;
}

export function ReportCardTemplate({ reportCard }: ReportCardTemplateProps) {
  const gradeColor = (grade: string) => {
    if (['A'].includes(grade)) return 'text-green-600 dark:text-green-500';
    if (['B'].includes(grade)) return 'text-blue-600 dark:text-blue-500';
    if (['C'].includes(grade)) return 'text-yellow-600 dark:text-yellow-500';
    if (['D', 'E'].includes(grade)) return 'text-orange-600 dark:text-orange-500';
    return 'text-red-600 dark:text-red-500';
  };

  return (
    <div style={{ width: '8.27in' }}>
        <Card id="pdf-content" className="report-card-container w-full mx-auto my-8 p-4 shadow-lg print:shadow-none print:border-0 break-inside-avoid bg-white text-black dark:bg-white rounded-none border-0">
        <CardHeader className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between border-b-4 border-black pb-4 text-center md:text-left">
            <div className="flex items-center gap-4">
                <Image src="/school-logo.png" alt="School Logo" width={200} height={50} className="h-12 w-auto" />
            </div>
            <div className="mt-4 md:mt-0 md:text-right">
                <h2 className="text-2xl font-bold text-black">Great Insight International Academy</h2>
                <p className="text-sm text-gray-500 dark:text-gray-500">123 Education Lane, Knowledge City</p>
            </div>
            </div>
            <div className="text-center py-2">
                <h3 className="text-xl font-bold uppercase tracking-wider text-black">Student Report Card</h3>
                <p className="font-medium text-gray-800 dark:text-gray-800">{reportCard.term} - {reportCard.session} Session</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-4">
                <div><strong className="text-gray-600 dark:text-gray-600">Student Name:</strong> {reportCard.studentName}</div>
                <div><strong className="text-gray-600 dark:text-gray-600">Student ID:</strong> {reportCard.studentId}</div>
                <div><strong className="text-gray-600 dark:text-gray-600">Class:</strong> {reportCard.class}</div>
            </div>
        </CardHeader>
        <CardContent className="p-4">
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="font-bold text-black dark:text-black">Subject</TableHead>
                    <TableHead className="text-center font-bold text-black dark:text-black">CA (40%)</TableHead>
                    <TableHead className="text-center font-bold text-black dark:text-black">Exam (60%)</TableHead>
                    <TableHead className="text-center font-bold text-black dark:text-black">Total (100%)</TableHead>
                    <TableHead className="text-center font-bold text-black dark:text-black">Grade</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reportCard.subjects.map((subject, index) => (
                    <TableRow key={index} className="dark:hover:bg-gray-100">
                        <TableCell className="font-medium text-black dark:text-black">{subject.name}</TableCell>
                        <TableCell className="text-center text-black dark:text-black">{subject.caScore}</TableCell>
                        <TableCell className="text-center text-black dark:text-black">{subject.examScore}</TableCell>
                        <TableCell className="text-center font-semibold text-black dark:text-black">{subject.totalScore}</TableCell>
                        <TableCell className={`text-center font-bold ${gradeColor(subject.grade)}`}>
                        {subject.grade}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>

            <Separator className="my-6 bg-gray-200 dark:bg-gray-200" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-100">
                    <p className="text-sm text-gray-600 dark:text-gray-600">Total Marks</p>
                    <p className="text-2xl font-bold text-black dark:text-black">{reportCard.totalMarks} / {reportCard.subjects.length * 100}</p>
                </div>
                <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-100">
                    <p className="text-sm text-gray-600 dark:text-gray-600">Overall Average</p>
                    <p className={`text-2xl font-bold ${gradeColor(reportCard.overallGrade)}`}>{reportCard.average.toFixed(1)}%</p>
                </div>
                <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-100">
                    <p className="text-sm text-gray-600 dark:text-gray-600">Class Rank</p>
                    <p className="text-2xl font-bold text-black dark:text-black">{reportCard.classRank}</p>
                </div>
            </div>
            
            <div className="mt-8 space-y-4 text-black dark:text-black">
                <div>
                    <h4 className="font-semibold">Teacher's Comment:</h4>
                    <p className="text-sm border-b border-gray-300 pb-2 dark:border-gray-300">{reportCard.teacherComment || "Shows great potential and is encouraged to participate more in class discussions."}</p>
                </div>
                <div>
                    <h4 className="font-semibold">Principal's Comment:</h4>
                    <p className="text-sm border-b border-gray-300 pb-2 dark:border-gray-300">{reportCard.principalComment || "A satisfactory performance. Keep up the good work."}</p>
                </div>
            </div>

            <div className="mt-12 flex justify-between items-end text-sm text-black dark:text-black">
                <div className="text-center">
                    <div className="border-t-2 border-dashed border-gray-400 w-32 mx-auto mb-1"></div>
                    <p>Teacher's Signature</p>
                </div>
                <div className="text-center">
                    <div className="border-t-2 border-dashed border-gray-400 w-32 mx-auto mb-1"></div>
                    <p>Principal's Signature</p>
                </div>
            </div>

            <div id="pdf-footer" className="mt-12 text-center text-xs text-gray-500 dark:text-gray-500 border-t pt-4">
                <p className="font-bold">Great Insight International Academy</p>
                <p>123 Education Lane, Knowledge City</p>
                <p>Phone: (123) 456-7890 | Email: info@giia.com.ng</p>
            </div>
            
        </CardContent>
        </Card>
        <style jsx global>{`
            @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .print\\:hidden {
                display: none;
            }
            .print\\:shadow-none {
                box-shadow: none;
            }
            .print\\:border-0 {
                border: 0;
            }
            .break-inside-avoid {
                break-inside: avoid;
            }
            }
        `}</style>
    </div>
  );
}
