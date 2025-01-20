import { formatTimeTo12Hour } from "./HelperFunctions";
import { CalendarEventType } from "./MainCalendar";

interface CalendarEventProps {
  event: CalendarEventType;
  onClick: (event: CalendarEventType) => void;
}

export function CalendarEvent({ event, onClick }: CalendarEventProps) {
  return (
    <div
      className={`calendar-event ${event.allDay ? "all-day" : "timed"}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      style={{ backgroundColor: event.allDay ? event.color : "transparent" }}
      tabIndex={0} 
    >
      {event.allDay ? (
        <span className="event-title">
          {event.title}
        </span>
      ) : (
        <>
          <span
            className="event-bullet"
            style={{
              backgroundColor: event.color || "#000",
            }}
          ></span>
          <span className="event-time">
            {formatTimeTo12Hour(event.startTime || "00:00")}
          </span>
          <span className="event-title">
            {event.title}
          </span>
        </>
      )}
    </div>
  );
}
