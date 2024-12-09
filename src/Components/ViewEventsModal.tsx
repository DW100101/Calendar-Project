import { useState } from "react";
import { Event } from "./MainCalendar";
import "./Styles/EventModal.css";

interface ViewEventsModalProps {
  events: Event[];
  onClose: () => void;
  onEditEvent: (event: Event) => void;
}

export function ViewEventsModal({
  events,
  onClose,
  onEditEvent,
}: ViewEventsModalProps) {
  const allDayEvents = events.filter((event) => event.allDay);
  const timedEvents = events.filter((event) => !event.allDay);
  const [isClosing, setIsClosing] = useState(false);

  const date = events.length > 0 ? events[0].date : null;

  const handleModalClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleEventClick = (event: Event) => {
    onClose();
    onEditEvent(event);
  };

  return (
    <div className={`modal ${isClosing ? "closing" : ""}`}>
      <div className="modal-content">
        <div className="view-more-header">
          <h3 className="modal-date">
            {date
              ? new Date(date).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "2-digit",
                })
              : "No Date Selected"}
          </h3>
          <button className="close-btn" onClick={handleModalClose}>
            x
          </button>
        </div>

        {allDayEvents.length > 0 && (
          <div className="events-list">
            {allDayEvents.map((event) => (
              <div
                key={event.id}
                className="event"
                style={{ backgroundColor: event.color }}
                onClick={() => handleEventClick(event)}
              >
                <h4>{event.title}</h4>
              </div>
            ))}
          </div>
        )}

        {timedEvents.length > 0 && (
          <div className="events-list">
            {timedEvents.map((event) => {
              const startTime = new Date(
                `1970-01-01T${event.startTime}`
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <div
                  key={event.id}
                  className="event"
                  style={{ backgroundColor: event.color }}
                  onClick={() => handleEventClick(event)}
                >
                  <h4>{event.title}- </h4>

                  <h4>{startTime}</h4>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
