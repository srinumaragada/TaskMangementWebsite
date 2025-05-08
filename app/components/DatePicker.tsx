"use client";

import React from 'react';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  selected?: Date | null;
  onSelect: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selected, onSelect }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const today = new Date();

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  };

  const weeks = [
    getWeekDays(currentMonth),
    getWeekDays(addDays(currentMonth, 7)),
    getWeekDays(addDays(currentMonth, 14)),
    getWeekDays(addDays(currentMonth, 21)),
    getWeekDays(addDays(currentMonth, 28)),
  ];

  return (
    <div className="w-64">
      <div className="flex items-center justify-between px-2 py-2">
        <button
          onClick={() => setCurrentMonth(addDays(currentMonth, -28))}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button
          onClick={() => setCurrentMonth(addDays(currentMonth, 28))}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 px-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 px-2">
        {weeks.flat().map((date, i) => {
          const isSelected = selected && isSameDay(date, selected);
          const isToday = isSameDay(date, today);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(date)}
              className={`h-8 w-8 rounded-full text-sm flex items-center justify-center ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : isToday
                    ? 'bg-blue-100 text-blue-600'
                    : !isCurrentMonth
                      ? 'text-gray-300'
                      : 'hover:bg-gray-100'
              }`}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;