
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useState, useRef, Fragment } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { bulkCreateStudents } from '@/actions/student-actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type ImportResult = {
    importedCount: number;
    errorCount: number;
    invalidRecords: any[];
} | null;

export function BulkStudentUploadDialog({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleDownloadTemplate = () => {
    const headers = [
      "firstName", "lastName", "middleName", "gender",
      "dateOfBirth(YYYY-MM-DD)", "address", "guardianName", "guardianContact",
      "guardianEmail", "class", "admissionDate(YYYY-MM-DD)", "session(YYYY/YYYY)", "medicalConditions"
    ];
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    
    const exampleData = [
      {"firstName":"Fatima","lastName":"Abubakar","middleName":"Zahra","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2010-05-15","address":"15, Ribadu Road, Ikoyi, Lagos","guardianName":"Amina Abubakar","guardianContact":"08023456789","guardianEmail":"a.abubakar@example.com","class":"JSS 1","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"Asthma"},
      {"firstName":"Muhammad","lastName":"Sani","middleName":"Ibrahim","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2011-02-20","address":"23, Admiralty Way, Lekki, Lagos","guardianName":"Hadiza Sani","guardianContact":"08098765432","guardianEmail":"h.sani@example.com","class":"Primary 6","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Aisha","lastName":"Bello","middleName":"Hassan","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2009-08-10","address":"10, Glover Road, Ikoyi, Lagos","guardianName":"Fatima Bello","guardianContact":"08031234567","guardianEmail":"f.bello@example.com","class":"JSS 2","admissionDate(YYYY-MM-DD)":"2022-09-01","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Aliyu","lastName":"Umar","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2012-11-05","address":"5, Bourdillon Road, Ikoyi, Lagos","guardianName":"Zainab Umar","guardianContact":"08055556666","guardianEmail":"z.umar@example.com","class":"Primary 5","admissionDate(YYYY-MM-DD)":"2021-09-03","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Zainab","lastName":"Adamu","middleName":"Garba","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2008-01-25","address":"12, Alexander Avenue, Ikoyi, Lagos","guardianName":"Hajiya Adamu","guardianContact":"08087654321","guardianEmail":"h.adamu@example.com","class":"SS 1","admissionDate(YYYY-MM-DD)":"2020-09-07","session(YYYY/YYYY)":"2023/2024","medicalConditions":"Allergy to nuts"},
      {"firstName":"Hassan","lastName":"Musa","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2013-07-12","address":"8, Osborne Road, Ikoyi, Lagos","guardianName":"Aisha Musa","guardianContact":"08011223344","guardianEmail":"a.musa@example.com","class":"Primary 4","admissionDate(YYYY-MM-DD)":"2020-09-07","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Khadija","lastName":"Shehu","middleName":"Bala","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2007-03-30","address":"30, Lugard Avenue, Ikoyi, Lagos","guardianName":"Maryam Shehu","guardianContact":"08044332211","guardianEmail":"m.shehu@example.com","class":"SS 2","admissionDate(YYYY-MM-DD)":"2019-09-02","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Ibrahim","lastName":"Lawal","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2014-09-18","address":"1, Second Avenue, Ikoyi, Lagos","guardianName":"Amina Lawal","guardianContact":"08066778899","guardianEmail":"a.lawal@example.com","class":"Primary 3","admissionDate(YYYY-MM-DD)":"2019-09-02","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Amina","lastName":"Dauda","middleName":"Yusuf","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2006-12-01","address":"45, Ikoyi Crescent, Ikoyi, Lagos","guardianName":"Hauwa Dauda","guardianContact":"08099887766","guardianEmail":"h.dauda@example.com","class":"SS 3","admissionDate(YYYY-MM-DD)":"2018-09-04","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Usman","lastName":"Jibril","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2015-04-22","address":"2, Club Road, Ikoyi, Lagos","guardianName":"Fatima Jibril","guardianContact":"08077665544","guardianEmail":"f.jibril@example.com","class":"Primary 2","admissionDate(YYYY-MM-DD)":"2018-09-04","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Maryam","lastName":"Abdullahi","middleName":"Isa","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2016-06-14","address":"18, Cameron Road, Ikoyi, Lagos","guardianName":"Zainab Abdullahi","guardianContact":"08022334455","guardianEmail":"z.abdullahi@example.com","class":"Primary 1","admissionDate(YYYY-MM-DD)":"2022-09-01","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Ahmed","lastName":"Idris","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2017-10-09","address":"7, First Avenue, Ikoyi, Lagos","guardianName":"Aisha Idris","guardianContact":"08055667788","guardianEmail":"a.idris@example.com","class":"Nursery 2","admissionDate(YYYY-MM-DD)":"2022-09-01","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Hauwa","lastName":"Garba","middleName":"Sule","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2018-08-03","address":"9, Temple Road, Ikoyi, Lagos","guardianName":"Khadija Garba","guardianContact":"08033445566","guardianEmail":"k.garba@example.com","class":"Nursery 1","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Yusuf","lastName":"Haruna","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2019-01-11","address":"21, Milverton Road, Ikoyi, Lagos","guardianName":"Halima Haruna","guardianContact":"08099887766","guardianEmail":"h.haruna@example.com","class":"Pre-Nursery","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Nafisa","lastName":"Bala","middleName":"Tanimu","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2010-09-21","address":"3, Bank Road, Ikoyi, Lagos","guardianName":"Saudat Bala","guardianContact":"08012345678","guardianEmail":"s.bala@example.com","class":"JSS 1","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Mustapha","lastName":"Rilwan","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2011-05-18","address":"4, Ilabere Avenue, Ikoyi, Lagos","guardianName":"Amina Rilwan","guardianContact":"08087654321","guardianEmail":"a.rilwan@example.com","class":"Primary 6","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Safiya","lastName":"Ismail","middleName":"Abbas","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2009-12-11","address":"6, Oyinkan Abayomi Drive, Ikoyi, Lagos","guardianName":"Zainab Ismail","guardianContact":"08022334455","guardianEmail":"z.ismail@example.com","class":"JSS 2","admissionDate(YYYY-MM-DD)":"2022-09-01","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Bashir","lastName":"Saleh","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2012-02-08","address":"14, Mobolaji Johnson Avenue, Ikoyi, Lagos","guardianName":"Fatima Saleh","guardianContact":"08055667788","guardianEmail":"f.saleh@example.com","class":"Primary 5","admissionDate(YYYY-MM-DD)":"2021-09-03","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Rukayya","lastName":"Abbas","middleName":"Tijjani","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2008-06-19","address":"22, Norman Williams Street, Ikoyi, Lagos","guardianName":"Hauwa Abbas","guardianContact":"08033445566","guardianEmail":"h.abbas@example.com","class":"SS 1","admissionDate(YYYY-MM-DD)":"2020-09-07","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Salisu","lastName":"Abdulkadir","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2013-11-28","address":"11, Awolowo Road, Ikoyi, Lagos","guardianName":"Aisha Abdulkadir","guardianContact":"08099887766","guardianEmail":"a.abdulkadir@example.com","class":"Primary 4","admissionDate(YYYY-MM-DD)":"2020-09-07","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Jamila","lastName":"Ibrahim","middleName":"Musa","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2007-07-07","address":"19, Gerrard Road, Ikoyi, Lagos","guardianName":"Fatima Ibrahim","guardianContact":"08012345678","guardianEmail":"f.ibrahim@example.com","class":"SS 2","admissionDate(YYYY-MM-DD)":"2019-09-02","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Kabir","lastName":"Yusuf","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2014-01-01","address":"25, Queens Drive, Ikoyi, Lagos","guardianName":"Amina Yusuf","guardianContact":"08087654321","guardianEmail":"a.yusuf@example.com","class":"Primary 3","admissionDate(YYYY-MM-DD)":"2019-09-02","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Farida","lastName":"Mohammed","middleName":"Ali","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2006-04-12","address":"28, Alexander Avenue, Ikoyi, Lagos","guardianName":"Hadiza Mohammed","guardianContact":"08022334455","guardianEmail":"h.mohammed@example.com","class":"SS 3","admissionDate(YYYY-MM-DD)":"2018-09-04","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Tahir","lastName":"Shehu","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2015-08-16","address":"16, Bourdillon Road, Ikoyi, Lagos","guardianName":"Zainab Shehu","guardianContact":"08055667788","guardianEmail":"z.shehu@example.com","class":"Primary 2","admissionDate(YYYY-MM-DD)":"2018-09-04","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Habiba","lastName":"Umar","middleName":"Sani","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2016-10-25","address":"17, Glover Road, Ikoyi, Lagos","guardianName":"Fatima Umar","guardianContact":"08033445566","guardianEmail":"f.umar@example.com","class":"Primary 1","admissionDate(YYYY-MM-DD)":"2022-09-01","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Nasir","lastName":"Adamu","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2017-12-30","address":"33, Osborne Road, Ikoyi, Lagos","guardianName":"Aisha Adamu","guardianContact":"08099887766","guardianEmail":"a.adamu@example.com","class":"Nursery 2","admissionDate(YYYY-MM-DD)":"2022-09-01","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Samira","lastName":"Musa","middleName":"Bello","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2018-02-14","address":"41, Lugard Avenue, Ikoyi, Lagos","guardianName":"Hauwa Musa","guardianContact":"08012345678","guardianEmail":"h.musa@example.com","class":"Nursery 1","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Sadiq","lastName":"Ibrahim","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2019-05-20","address":"50, First Avenue, Ikoyi, Lagos","guardianName":"Amina Ibrahim","guardianContact":"08087654321","guardianEmail":"a.ibrahim@example.com","class":"Pre-Nursery","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Rahma","lastName":"Lawal","middleName":"Garba","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2010-11-12","address":"60, Ikoyi Crescent, Ikoyi, Lagos","guardianName":"Zainab Lawal","guardianContact":"08022334455","guardianEmail":"z.lawal@example.com","class":"JSS 1","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Ismail","lastName":"Dauda","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2011-08-08","address":"7, Club Road, Ikoyi, Lagos","guardianName":"Fatima Dauda","guardianContact":"08055667788","guardianEmail":"f.dauda@example.com","class":"Primary 6","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Asmau","lastName":"Jibril","middleName":"Bello","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2009-04-04","address":"13, Cameron Road, Ikoyi, Lagos","guardianName":"Aisha Jibril","guardianContact":"08033445566","guardianEmail":"a.jibril@example.com","class":"JSS 2","admissionDate(YYYY-MM-DD)":"2022-09-01","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Aminu","lastName":"Abdullahi","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2012-07-01","address":"24, Temple Road, Ikoyi, Lagos","guardianName":"Hauwa Abdullahi","guardianContact":"08099887766","guardianEmail":"h.abdullahi@example.com","class":"Primary 5","admissionDate(YYYY-MM-DD)":"2021-09-03","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Zahra","lastName":"Idris","middleName":"Musa","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2008-10-10","address":"32, Milverton Road, Ikoyi, Lagos","guardianName":"Khadija Idris","guardianContact":"08012345678","guardianEmail":"k.idris@example.com","class":"SS 1","admissionDate(YYYY-MM-DD)":"2020-09-07","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Umar","lastName":"Garba","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2013-03-03","address":"44, Bank Road, Ikoyi, Lagos","guardianName":"Amina Garba","guardianContact":"08087654321","guardianEmail":"a.garba@example.com","class":"Primary 4","admissionDate(YYYY-MM-DD)":"2020-09-07","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Fatimah","lastName":"Sule","middleName":"Bala","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2007-09-17","address":"8, Ilabere Avenue, Ikoyi, Lagos","guardianName":"Zainab Sule","guardianContact":"08022334455","guardianEmail":"z.sule@example.com","class":"SS 2","admissionDate(YYYY-MM-DD)":"2019-09-02","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Mubarak","lastName":"Rilwan","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2014-06-23","address":"14, Oyinkan Abayomi Drive, Ikoyi, Lagos","guardianName":"Fatima Rilwan","guardianContact":"08055667788","guardianEmail":"f.rilwan@example.com","class":"Primary 3","admissionDate(YYYY-MM-DD)":"2019-09-02","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Aisha","lastName":"Ismail","middleName":"Abbas","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2006-01-01","address":"20, Mobolaji Johnson Avenue, Ikoyi, Lagos","guardianName":"Hauwa Ismail","guardianContact":"08033445566","guardianEmail":"h.ismail@example.com","class":"SS 3","admissionDate(YYYY-MM-DD)":"2018-09-04","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Jafar","lastName":"Saleh","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2015-10-30","address":"27, Norman Williams Street, Ikoyi, Lagos","guardianName":"Amina Saleh","guardianContact":"08099887766","guardianEmail":"a.saleh@example.com","class":"Primary 2","admissionDate(YYYY-MM-DD)":"2018-09-04","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Amina","lastName":"Abbas","middleName":"Tijjani","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2016-02-18","address":"35, Awolowo Road, Ikoyi, Lagos","guardianName":"Zainab Abbas","guardianContact":"08012345678","guardianEmail":"z.abbas@example.com","class":"Primary 1","admissionDate(YYYY-MM-DD)":"2022-09-01","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Nuhu","lastName":"Abdulkadir","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2017-05-14","address":"42, Gerrard Road, Ikoyi, Lagos","guardianName":"Fatima Abdulkadir","guardianContact":"08087654321","guardianEmail":"f.abdulkadir@example.com","class":"Nursery 2","admissionDate(YYYY-MM-DD)":"2022-09-01","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Sumayyah","lastName":"Ibrahim","middleName":"Musa","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2018-11-01","address":"55, Queens Drive, Ikoyi, Lagos","guardianName":"Aisha Ibrahim","guardianContact":"08022334455","guardianEmail":"a.ibrahim@example.com","class":"Nursery 1","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Harun","lastName":"Yusuf","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2019-03-25","address":"63, Alexander Avenue, Ikoyi, Lagos","guardianName":"Hauwa Yusuf","guardianContact":"08055667788","guardianEmail":"h.yusuf@example.com","class":"Pre-Nursery","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Layla","lastName":"Mohammed","middleName":"Ali","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2010-07-02","address":"70, Bourdillon Road, Ikoyi, Lagos","guardianName":"Zainab Mohammed","guardianContact":"08033445566","guardianEmail":"z.mohammed@example.com","class":"JSS 1","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Bilal","lastName":"Shehu","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2011-04-19","address":"31, Glover Road, Ikoyi, Lagos","guardianName":"Fatima Shehu","guardianContact":"08099887766","guardianEmail":"f.shehu@example.com","class":"Primary 6","admissionDate(YYYY-MM-DD)":"2023-09-05","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Safura","lastName":"Umar","middleName":"Sani","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2009-01-16","address":"40, Osborne Road, Ikoyi, Lagos","guardianName":"Aisha Umar","guardianContact":"08012345678","guardianEmail":"a.umar@example.com","class":"JSS 2","admissionDate(YYYY-MM-DD)":"2022-09-01","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Idris","lastName":"Adamu","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2012-10-13","address":"48, Lugard Avenue, Ikoyi, Lagos","guardianName":"Hauwa Adamu","guardianContact":"08087654321","guardianEmail":"h.adamu@example.com","class":"Primary 5","admissionDate(YYYY-MM-DD)":"2021-09-03","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Ruqayyah","lastName":"Musa","middleName":"Bello","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2008-03-29","address":"58, First Avenue, Ikoyi, Lagos","guardianName":"Zainab Musa","guardianContact":"08022334455","guardianEmail":"z.musa@example.com","class":"SS 1","admissionDate(YYYY-MM-DD)":"2020-09-07","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Khalid","lastName":"Ibrahim","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2013-09-05","address":"65, Ikoyi Crescent, Ikoyi, Lagos","guardianName":"Fatima Ibrahim","guardianContact":"08055667788","guardianEmail":"f.ibrahim@example.com","class":"Primary 4","admissionDate(YYYY-MM-DD)":"2020-09-07","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Naima","lastName":"Lawal","middleName":"Garba","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2007-02-11","address":"72, Club Road, Ikoyi, Lagos","guardianName":"Aisha Lawal","guardianContact":"08033445566","guardianEmail":"a.lawal@example.com","class":"SS 2","admissionDate(YYYY-MM-DD)":"2019-09-02","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Zayd","lastName":"Dauda","middleName":"","gender":"Male","dateOfBirth(YYYY-MM-DD)":"2014-12-08","address":"80, Cameron Road, Ikoyi, Lagos","guardianName":"Hauwa Dauda","guardianContact":"08099887766","guardianEmail":"h.dauda@example.com","class":"Primary 3","admissionDate(YYYY-MM-DD)":"2019-09-02","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"},
      {"firstName":"Yasmin","lastName":"Jibril","middleName":"Bello","gender":"Female","dateOfBirth(YYYY-MM-DD)":"2006-06-06","address":"88, Temple Road, Ikoyi, Lagos","guardianName":"Zainab Jibril","guardianContact":"08012345678","guardianEmail":"z.jibril@example.com","class":"SS 3","admissionDate(YYYY-MM-DD)":"2018-09-04","session(YYYY/YYYY)":"2023/2024","medicalConditions":"N/A"}
    ];

    XLSX.utils.sheet_add_json(worksheet, exampleData, { origin: 'A2', skipHeader: true });

    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "student-upload-template.xlsx");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportResult(null);
    setFileName(file.name);
    setIsParsing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            // Ensure data is plain JSON
            const plainJson = JSON.parse(JSON.stringify(json));
            
            setStudentData(plainJson);
            toast({
                title: 'File Ready for Import',
                description: `${plainJson.length} student records found in ${file.name}.`,
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
        } finally {
            setIsParsing(false);
        }
    };
    reader.readAsBinaryString(file);
  };
  
  const handleImport = async () => {
    if (studentData.length === 0) {
        toast({ variant: 'destructive', title: 'No Data', description: 'No student data to import.' });
        return;
    }
    setIsSubmitting(true);
    setImportResult(null);
    try {
        const result = await bulkCreateStudents(studentData);
        if (result.error) {
            throw new Error(result.error);
        }

        setImportResult({
            importedCount: result.importedCount,
            errorCount: result.errorCount,
            invalidRecords: result.invalidRecords
        });

        toast({
            title: 'Import Process Completed',
            description: `${result.importedCount} students imported. ${result.errorCount} records had errors.`,
        });

        if (result.errorCount === 0) {
            onUploadComplete();
        }
    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: error.message || 'An unexpected error occurred during import.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const renderResult = () => {
      if (!importResult) return null;
      
      return (
          <div className='mt-6 space-y-4'>
            {importResult.importedCount > 0 && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Import Successful</AlertTitle>
                    <AlertDescription>
                        {importResult.importedCount} student records were successfully created.
                    </AlertDescription>
                </Alert>
            )}
             {importResult.errorCount > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{importResult.errorCount} Records Failed</AlertTitle>
                    <AlertDescription>
                       The following records could not be imported. Please correct them in your spreadsheet and re-upload the file.
                    </AlertDescription>
                     <ScrollArea className="mt-4 h-48">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Error</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {importResult.invalidRecords.map((record, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{record.firstName || 'N/A'} {record.lastName || ''}</TableCell>
                                        <TableCell><Badge variant="outline">{record.error}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </ScrollArea>
                </Alert>
            )}
          </div>
      )
  }

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Bulk Student Upload</DialogTitle>
        <DialogDescription>
          Upload an Excel or spreadsheet file to enroll multiple students at once.
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
                disabled={isParsing || isSubmitting}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isParsing || isSubmitting}>
                {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {fileName || 'Select File'}
            </Button>
        </div>

        {renderResult()}
      </div>

      <DialogFooter>
        <DialogClose asChild>
            <Button variant="secondary">Close</Button>
        </DialogClose>
        <Button onClick={handleImport} disabled={isSubmitting || isParsing || studentData.length === 0}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Import {studentData.length > 0 && !importResult ? `${studentData.length} Students` : 'Students'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

    