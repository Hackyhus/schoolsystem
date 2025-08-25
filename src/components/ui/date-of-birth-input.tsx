
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
  { value: '8', 'label': 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);


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

     const handleDateChange = React.useCallback((d: string | undefined, m: string | undefined, y: string | undefined) => {
        if (d && m && y) {
            const newDate = new Date(Number(y), Number(m), Number(d));
            if (
                newDate.getFullYear() === Number(y) &&
                newDate.getMonth() === Number(m) &&
                newDate.getDate() === Number(d)
            ) {
                 if (value?.getTime() !== newDate.getTime()) {
                    onChange(newDate);
                }
            } else if (value !== undefined) {
                onChange(undefined);
            }
        } else if (value !== undefined) {
             onChange(undefined);
        }
    }, [onChange, value]);

    const onDayChange = (newDay: string) => {
        setDay(newDay);
        handleDateChange(newDay, month, year);
    }
    const onMonthChange = (newMonth: string) => {
        setMonth(newMonth);
        handleDateChange(day, newMonth, year);
    }
    const onYearChange = (newYear: string) => {
        setYear(newYear);
        handleDateChange(day, month, newYear);
    }

  const daysInMonth = (m: number, y: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const dayOptions =
    year && month !== undefined
      ? Array.from({ length: daysInMonth(Number(month), Number(year)) }, (_, i) => i + 1)
      : Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      <Select value={day} onValueChange={onDayChange}>
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
      <Select value={month} onValueChange={onMonthChange}>
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
      <Select value={year} onValueChange={onYearChange}>
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
