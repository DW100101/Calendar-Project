import { CalendarEventType } from "./MainCalendar";

export function getDays(year: number, month: number): number[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => index + 1);
}

export function getFirstDay(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function getDaysBefore(
  year: number,
  month: number,
  firstDayOfMonth: number
): number[] {
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  return Array.from(
    { length: firstDayOfMonth },
    (_, index) => daysInPreviousMonth - firstDayOfMonth + index + 1
  );
}

export function getDaysAfter(totalDays: number): number[] {
  const daysAfter = (7 - (totalDays % 7)) % 7;
  return Array.from({ length: daysAfter }, (_, index) => index + 1);
}

export function sortEvents(events: CalendarEventType[]) {
  return events.sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;

    if (!a.allDay && !b.allDay) {
      const startA = new Date(`1970-01-01T${a.startTime || "00:00"}:00`);
      const startB = new Date(`1970-01-01T${b.startTime || "00:00"}:00`);
      return startA.getTime() - startB.getTime();
    }

    return 0;
  });
}

export function formatTimeTo12Hour(time: string): string {
  const [hour, minute] = time.split(":");
  const ampm = Number(hour) >= 12 ? "PM" : "AM";
  const hour12 = Number(hour) % 12 || 12;
  const formattedMinute = minute.padStart(2, "0");
  return `${hour12}:${formattedMinute} ${ampm}`;
}

export const datesAreEqual = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export const updateDayHeights = (
  calendarDayRefs: React.RefObject<(HTMLDivElement | null)[]>,
  setDayHeights: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>
) => {
  const heights: { [key: number]: number } = {};
  calendarDayRefs.current?.forEach((dayElement, index) => {
    if (dayElement) {
      heights[index] = dayElement.getBoundingClientRect().height;
    }
  });
  setDayHeights(heights);
};
