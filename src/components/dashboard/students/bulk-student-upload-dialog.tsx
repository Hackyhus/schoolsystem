
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export function BulkStudentUploadDialog({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleDownloadTemplate = () => {
    // Define the headers for the template. This should match the fields needed for student creation.
    const headers = [
      "firstName", "lastName", "middleName", "gender",
      "dateOfBirth(YYYY-MM-DD)", "address", "guardianName", "guardianContact",
      "guardianEmail", "class", "admissionDate(YYYY-MM-DD)", "session(YYYY/YYYY)", "medicalConditions"
    ];
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Create a worksheet with the headers
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    
    // Add some example data to guide the user
    const exampleData = [
        {"firstName":"Fatima","lastName":"Abubakar","middleName":"Zahra","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2010-05-15","address":"15, Ribadu Road, Ikoyi, Lagos","guardianName":"Amina Abubakar","guardianContact":"08023456789","guardianEmail":"a.abubakar@example.com","class":"JSS 1","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"Asthma"},
        {"firstName":"Muhammad","lastName":"Sani","middleName":"Ibrahim","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2011-02-20","address":"23, Admiralty Way, Lekki, Lagos","guardianName":"Hadiza Sani","guardianContact":"08098765432","guardianEmail":"h.sani@example.com","class":"Primary 6","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"}
    ];

    XLSX.utils.sheet_add_json(worksheet, exampleData, { origin: 'A2', skipHeader: true });

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    
    // Write the workbook and trigger a download
    XLSX.writeFile(workbook, "student-upload-template.xlsx");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            setStudentData(json);
            toast({
                title: 'File Loaded',
                description: `${json.length} student records found in ${file.name}.`,
            });
        } catch (error) {
            console.error("Error parsing file:", error);
            toast({
                variant: 'destructive',
                title: 'File Read Error',
                description: 'Could not read or parse the uploaded file.',
            });
            setFileName(null);
            setStudentData([]);
        }
    };
    reader.readAsBinaryString(file);
  };


  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Bulk Student Upload</DialogTitle>
        <DialogDescription>
          Upload an Excel or CSV file to enroll multiple students at once.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 py-4">
        <div className="rounded-md border-2 border-dashed p-8 text-center">
            <h3 className="font-semibold">Step 1: Download the Template</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Use our template to ensure your data is in the correct format.
            </p>
            <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template.xlsx
            </Button>
        </div>
        
        <div className="rounded-md border-2 border-dashed p-8 text-center">
             <h3 className="font-semibold">Step 2: Upload Your File</h3>
             <p className="text-sm text-muted-foreground mb-4">
                Click to select your completed spreadsheet file.
            </p>
             <Input 
                type="file" 
                ref={fileInputRef} 
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileSelect}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                {fileName || 'Select File'}
            </Button>
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={onUploadComplete}>Cancel</Button>
        <Button disabled>Import Students</Button>
      </DialogFooter>
    </DialogContent>
  );
}
