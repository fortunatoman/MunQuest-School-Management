import React, { useState, useEffect, useRef } from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onClose: () => void;
  maxDays?: number;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
  onClose,
  maxDays = 7
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(
    startDate ? new Date(startDate) : null
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(
    endDate ? new Date(endDate) : null
  );
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [error, setError] = useState<string>('');
  const [isSelecting, setIsSelecting] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
        isToday: false,
        isPast: true
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isPast
      });
    }

    // Add next month's leading days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false,
        isPast: false
      });
    }

    return days;
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isDateSelected = (date: Date) => {
    if (selectedStartDate && date.getTime() === selectedStartDate.getTime()) return true;
    if (selectedEndDate && date.getTime() === selectedEndDate.getTime()) return true;
    return false;
  };

  const isDateHovered = (date: Date) => {
    if (!hoveredDate) return false;
    if (!selectedStartDate) return false;
    
    const start = selectedStartDate < hoveredDate ? selectedStartDate : hoveredDate;
    const end = selectedStartDate < hoveredDate ? hoveredDate : selectedStartDate;
    
    return date >= start && date <= end;
  };

  const handleDateClick = (date: Date) => {
    if (date < today) {
      setError('Past dates cannot be selected');
      return;
    }

    setError('');

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setIsSelecting(true);
    } else {
      // Complete selection
      if (date < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      } else {
        setSelectedEndDate(date);
      }
      setIsSelecting(false);
    }
  };

  const handleDateHover = (date: Date) => {
    if (isSelecting && selectedStartDate) {
      setHoveredDate(date);
    }
  };

  const handleApply = () => {
    if (selectedStartDate && selectedEndDate) {
      const daysDiff = Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      if (daysDiff > maxDays) {
        setError(`Maximum event length is ${maxDays} consecutive days`);
        return;
      }

      const startDateStr = selectedStartDate.toISOString().split('T')[0];
      const endDateStr = selectedEndDate.toISOString().split('T')[0];
      
      onDateRangeChange(startDateStr, endDateStr);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div 
      ref={pickerRef}
      className="absolute top-full left-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 mt-2"
      style={{ minWidth: '320px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {getMonthName(currentMonth)}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isSelected = isDateSelected(day.date);
          const isInRange = isDateInRange(day.date);
          const isHovered = isDateHovered(day.date);
          const isDisabled = day.isPast && !day.isCurrentMonth;

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day.date)}
              onMouseEnter={() => handleDateHover(day.date)}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={isDisabled}
              className={`
                relative h-8 w-8 text-sm rounded-full transition-colors
                ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}
                ${isSelected ? 'bg-purple-600 text-white' : ''}
                ${isInRange && !isSelected ? 'bg-purple-100' : ''}
                ${isHovered && !isSelected && !isInRange ? 'bg-purple-50' : ''}
                ${day.isToday ? 'font-bold' : ''}
              `}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Date Input Fields */}
      <div className="flex gap-4 mt-4">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
          <input
            type="text"
            value={selectedStartDate ? formatDate(selectedStartDate) : ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
            placeholder="DD / MM / YYYY"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">End Date</label>
          <input
            type="text"
            value={selectedEndDate ? formatDate(selectedEndDate) : ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
            placeholder="DD / MM / YYYY"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleCancel}
          className="flex-1 px-4 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          disabled={!selectedStartDate || !selectedEndDate}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;
