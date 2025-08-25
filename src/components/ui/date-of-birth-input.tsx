
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
const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);


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

    const handleDateChange = React.useCallback((newDate?: Date) => {
        onChange(newDate);
    }, [onChange]);
    
    // This effect ensures the parent form's state is updated whenever a valid date
    // can be constructed from the component's internal state.
    React.useEffect(() => {
        if (day && month && year) {
            const newDate = new Date(Number(year), Number(month), Number(day));
             if (
                newDate.getFullYear() === Number(year) &&
                newDate.getMonth() === Number(month) &&
                newDate.getDate() === Number(day)
            ) {
                // Only call onChange if the new date is different from the parent's state
                if (value?.getTime() !== newDate.getTime()) {
                    handleDateChange(newDate);
                }
            } else {
                 if (value !== undefined) {
                    handleDateChange(undefined);
                }
            }
        } else {
            // If any part is missing, ensure the parent state is also cleared
            if (value !== undefined) {
                handleDateChange(undefined);
            }
        }
    }, [day, month, year, value, handleDateChange]);

    // This effect syncs internal state with the external `value` prop.
    // This is important for form resets or programmatic changes.
     React.useEffect(() => {
        if (value) {
            const newDay = String(value.getDate());
            const newMonth = String(value.getMonth());
            const newYear = String(value.getFullYear());
            if (newDay !== day) setDay(newDay);
            if (newMonth !== month) setMonth(newMonth);
            if (newYear !== year) setYear(newYear);
        } else {
            setDay(undefined);
            setMonth(undefined);
            setYear(undefined);
        }
    // We only want this to run when the EXTERNAL value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);


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
