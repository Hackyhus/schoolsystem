
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

export function BulkStudentUploadDialog({ onUploadComplete }: { onUploadComplete: () => void }) {
  // Placeholder function to generate and download the template
  const handleDownloadTemplate = () => {
    // In the next step, we'll implement this to generate a real XLSX file
    alert("Template download functionality will be implemented next.");
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
                Drag & drop your completed file here or click to select it.
            </p>
            <Button variant="outline" disabled>
                <Upload className="mr-2 h-4 w-4" />
                Select File
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
