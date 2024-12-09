

interface CalendarHeaderProps {
  month: string;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}
export function CalendarHeader({
  month,
  year,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="calendar-header">
      <button onClick={onToday} className="today-button">
        Today
      </button>
      <button onClick={onPrevMonth} className="previous-month">
        &lt;
      </button>

      <button onClick={onNextMonth} className="next-month">
        &gt;
      </button>
      <div className="header-date">
        <strong>
          {month} {year}
        </strong>
      </div>
    </div>
  );
}
