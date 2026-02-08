import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AvailabilityCalendar({ availableDates = [], bookedDates = [], onSelectDate, mode = 'book', selectedDate }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const formatDate = (day) => {
        const d = new Date(year, month, day);
        return d.toISOString().split('T')[0];
    };

    const isAvailable = (day) => availableDates.includes(formatDate(day));
    const isBooked = (day) => bookedDates.includes(formatDate(day));
    const isPast = (day) => new Date(year, month, day) < today;
    const isSelected = (day) => selectedDate === formatDate(day);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
                    <ChevronLeft size={18} />
                </button>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    {monthNames[month]} {year}
                </h3>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = formatDate(day);
                    const past = isPast(day);
                    const available = isAvailable(day);
                    const booked = isBooked(day);
                    const selected = isSelected(day);

                    let className = 'size-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all ';

                    if (past) {
                        className += 'text-gray-300 dark:text-gray-600 cursor-not-allowed';
                    } else if (booked) {
                        className += 'bg-red-50 dark:bg-red-500/10 text-red-400 cursor-not-allowed';
                    } else if (selected) {
                        className += 'bg-[#FF6600] text-white shadow-lg';
                    } else if (mode === 'book' && available) {
                        className += 'bg-green-50 dark:bg-green-500/10 text-green-600 cursor-pointer hover:bg-green-100 dark:hover:bg-green-500/20';
                    } else if (mode === 'manage' && available) {
                        className += 'bg-green-50 dark:bg-green-500/10 text-green-600 cursor-pointer hover:bg-green-100';
                    } else if (mode === 'manage') {
                        className += 'text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5';
                    } else {
                        className += 'text-gray-400 dark:text-gray-500';
                    }

                    const canClick = !past && !booked && (mode === 'manage' || (mode === 'book' && available));

                    return (
                        <button
                            key={day}
                            type="button"
                            disabled={!canClick}
                            onClick={() => canClick && onSelectDate?.(date)}
                            className={className}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded bg-green-100 dark:bg-green-500/20" />
                    <span className="text-gray-400">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded bg-red-100 dark:bg-red-500/20" />
                    <span className="text-gray-400">Booked</span>
                </div>
                {mode === 'book' && (
                    <div className="flex items-center gap-1.5">
                        <div className="size-3 rounded bg-[#FF6600]" />
                        <span className="text-gray-400">Selected</span>
                    </div>
                )}
            </div>
        </div>
    );
}
