import { useState, useEffect, useRef } from "react";
import { CalendarEvent } from "./CalendarEvent";
import { CalendarEventType } from "./MainCalendar";
import "./Styles/EventModal.css";

interface ViewEventsModalProps {
  events: CalendarEventType[];
  onClose: () => void;
  onEditEvent: (event: CalendarEventType) => void;
}

export function ViewEventsModal({
  events,
  onClose,
  onEditEvent,
}: ViewEventsModalProps) {
  const allDayEvents = events.filter((event) => event.allDay);
  const timedEvents = events.filter((event) => !event.allDay);
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const date = events.length > 0 ? events[0].date : null;

  const modalRef = useRef<HTMLDivElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  const handleModalClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = () => {
    if (isClosing) {
      setIsVisible(false);
      onClose();
      setIsClosing(false);
    }
  };

  const handleEventClick = (event: CalendarEventType) => {
    onEditEvent(event);
    handleModalClose();
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(e.target as Node)
    ) {
      handleModalClose();
    }
  };

  const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const handleOutsideClickNative = (e: MouseEvent) => {
      handleOutsideClick(e);
    };

    window.addEventListener("mousedown", handleOutsideClickNative);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClickNative);
    };
  }, []);

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleModalClose();
    }
  };

  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.addEventListener("animationend", handleAnimationEnd);
    }

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      if (modalElement) {
        modalElement.removeEventListener("animationend", handleAnimationEnd);
      }
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isClosing]);

  const firstFocusableElementRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusableElementRef = useRef<HTMLDivElement | null>(null);

  const trapFocus = (e: KeyboardEvent) => {
    if (!modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  useEffect(() => {
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements?.[0]?.focus();

    window.addEventListener("keydown", trapFocus);

    return () => {
      window.removeEventListener("keydown", trapFocus);
    };
  }, [events]);

  return (
    isVisible && (
      <div
        ref={modalRef}
        className={`view-more-events-modal ${isClosing ? "closing" : ""}`}
        onMouseDown={
          handleOutsideClick as unknown as React.MouseEventHandler<HTMLDivElement>
        }
      >
        <div
          ref={modalContentRef}
          className={`view-more-modal-content ${isClosing ? "closing" : ""}`}
          onMouseDown={stopPropagation}
        >
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
            <button
              className="close-btn"
              onClick={handleModalClose}
              ref={firstFocusableElementRef}
            >
              x
            </button>
          </div>

          <div className="events-list" ref={lastFocusableElementRef}>
  {allDayEvents.concat(timedEvents).map((event) => (
    <div
      key={event.id}
      className="event-item"
      tabIndex={0} 
      onClick={() => handleEventClick(event)} 
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault(); // 
          handleEventClick(event); 
        }
      }}
    >
      <CalendarEvent event={event} onClick={handleEventClick} />
    </div>
  ))}
</div>
        </div>
      </div>
    )
  );
}
