import {Event} from './MainCalendar'


export function getDays(year: number, month: number): number[] {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => index + 1);
  }
  
  export function getFirstDay(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
  }
  
  export function getDaysBefore(year: number, month: number, firstDayOfMonth: number): number[] {
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

  export function sortEvents(events: Event[]) {
    return events.sort((a, b) => {
      // All-day events come first
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
  
      // Sort timed events in descending order
      if (!a.allDay && !b.allDay) {
        const startA = new Date(`1970-01-01T${a.startTime || "00:00"}:00`);
        const startB = new Date(`1970-01-01T${b.startTime || "00:00"}:00`);
        return startB.getTime() - startA.getTime();
      }
  
      return 0; // If both are all-day, maintain current order
    });
  }

  export function formatTimeTo12Hour(time: string): string {
    const [hour, minute] = time.split(":");
    const ampm = Number(hour) >= 12 ? "PM" : "AM";
    const hour12 = Number(hour) % 12 || 12; // Convert hour to 12-hour format (0 becomes 12)
    const formattedMinute = minute.padStart(2, "0"); // Ensure two digits for minutes
    return `${hour12}:${formattedMinute} ${ampm}`;
  }