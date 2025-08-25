
'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DateOfBirthInputProps {
  value?: Date;
  onChange: (date?: Date) => void;
  className?: string;
}

const months = [
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i - 18); // For users 18+

export function DateOfBirthInput({ value, onChange, className }: DateOfBirthInputProps) {
  const [day, setDay] = React.useState<string | undefined>(
    value ? String(value.getDate()) : undefined
  );
  const [month, setMonth] = React.useState<string | undefined>(
    value ? String(value.getMonth()) : undefined
  );
  const [year, setYear] = React.useState<string | undefined>(
    value ? String(value.getFullYear()) : undefined
  );

  // This effect will run only when one of the date parts changes.
  // It constructs the date and calls the parent's onChange.
  React.useEffect(() => {
    // Only attempt to create a date if all parts are selected
    if (day && month && year) {
      const newDate = new Date(Number(year), Number(month), Number(day));
      // Ensure the created date is valid (e.g., handles Feb 30)
      if (
        newDate.getFullYear() === Number(year) &&
        newDate.getMonth() === Number(month) &&
        newDate.getDate() === Number(day)
      ) {
        // Only call onChange if the new date is different from the prop value
        if (value?.getTime() !== newDate.getTime()) {
          onChange(newDate);
        }
      } else {
        // If the date is invalid (e.g. Feb 31), clear the parent state
        if (value) onChange(undefined);
      }
    } else {
        // If any part is missing, clear the parent state
        if (value) onChange(undefined);
    }
  }, [day, month, year, onChange, value]);

  const daysInMonth = (m: number, y: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const dayOptions =
    year && month !== undefined
      ? Array.from({ length: daysInMonth(Number(month), Number(year)) }, (_, i) => i + 1)
      : Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      <Select value={day} onValueChange={setDay}>
        <SelectTrigger>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {dayOptions.map((d) => (
            <SelectItem key={d} value={String(d)}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={String(m.value)}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
