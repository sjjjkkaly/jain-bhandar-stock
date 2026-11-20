'use client';

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateBarProps {
  selectedDate: string;
  onSelectDate: (d: string) => void;
}

export const DateBar: React.FC<DateBarProps> = ({ selectedDate, onSelectDate }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  const handlePrev = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-5 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          title="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-green-600" />
          <span className="font-bold text-gray-900 text-sm">{selectedDate}</span>
          {isToday && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
              Today
            </span>
          )}
        </div>

        <button
          onClick={handleNext}
          className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          title="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {!isToday && (
          <button
            onClick={() => onSelectDate(todayStr)}
            className="text-xs font-semibold text-green-700 hover:underline"
          >
            Today
          </button>
        )}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && onSelectDate(e.target.value)}
          className="text-xs font-medium text-gray-700 border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-green-600 bg-white"
        />
      </div>
    </div>
  );
};
