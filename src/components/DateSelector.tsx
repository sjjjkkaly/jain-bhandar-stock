'use client';

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    onSelectDate(todayStr);
  };

  // Formatted date string for humans
  const formattedDisplay = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm mb-6">
      
      {/* Date Navigation */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={handlePrevDay}
          title="Previous Day"
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-slate-900 text-sm">{formattedDisplay}</span>
          {isToday && (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Today
            </span>
          )}
        </div>

        <button
          onClick={handleNextDay}
          title="Next Day"
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Jump Buttons & Datepicker Input */}
      <div className="flex items-center gap-2">
        {!isToday && (
          <button
            onClick={handleSetToday}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Jump to Today</span>
          </button>
        )}

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <label htmlFor="custom-date-picker" className="hidden sm:inline font-medium">Pick Date:</label>
          <input
            id="custom-date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) onSelectDate(e.target.value);
            }}
            className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-amber-500"
          />
        </div>
      </div>

    </div>
  );
};
