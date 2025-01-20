import { useState, useEffect, useRef, useMemo } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { EventModal } from "./EventModal";
import { ViewEventsModal } from "./ViewEventsModal";
import { CalendarEvent } from "./CalendarEvent";
import "./Styles/MainCalendar.css";
import {
  getDays,
  updateDayHeights,
  getFirstDay,
  getDaysBefore,
  getDaysAfter,
  sortEvents,
  datesAreEqual,
} from "./HelperFunctions";

const LOCAL_STORAGE_KEY = "calendarEvents";

export interface CalendarEventType {
  id: number;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  color?: string;
  date: Date;
}

export function MainCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEventType[]>(() => {
    const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedEvents) {
      return JSON.parse(storedEvents).map((event: CalendarEventType) => ({
        ...event,
        date: new Date(event.date),
      }));
    }
    return [];
  });

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [isViewEventsModalOpen, setIsViewEventsModalOpen] = useState(false);
  const [modalEvents, setModalEvents] = useState<CalendarEventType[]>([]);
  const [editingEvent, setEditingEvent] = useState<CalendarEventType | null>(
    null
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | null>(
    null
  );
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [dayHeights, setDayHeights] = useState<{ [key: number]: number }>({});
  const year = date.getFullYear();
  const month = date.getMonth();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const calendarDayRefs = useRef<(HTMLDivElement | null)[]>([]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDays(year, month);
    const firstDayOfMonth = getFirstDay(year, month);
    const daysBefore = getDaysBefore(year, month, firstDayOfMonth);
    const totalDays = daysBefore.length + daysInMonth.length;
    const daysAfter = getDaysAfter(totalDays);

    const normalizeDate = (date: Date): Date => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const today = normalizeDate(new Date());

    return [
      ...daysBefore.map((day) => {
        const date = new Date(year, month - 1, day);
        return {
          date,
          isPast: date < today,
          isCurrentMonth: false,
        };
      }),
      ...daysInMonth.map((day) => {
        const date = new Date(year, month, day);
        return {
          date,
          isPast: date < today,
          isCurrentMonth: true,
        };
      }),
      ...daysAfter.map((day) => {
        const date = new Date(year, month + 1, day);
        return {
          date,
          isPast: date < today,
          isCurrentMonth: false,
        };
      }),
    ];
  }, [year, month]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getEventsForDate = (date: Date) => {
    const filteredEvents = events.filter((event) =>
      datesAreEqual(event.date, date)
    );
    return sortEvents(filteredEvents);
  };

  useEffect(() => {
    updateDayHeights(calendarDayRefs, setDayHeights);
  }, [calendarDays, windowWidth]);

  useEffect(() => {
    console.log("isViewEventsModalOpen:", isViewEventsModalOpen);
  }, [isViewEventsModalOpen]);

  useEffect(() => {
    try {
      const eventsToSave = events.map((event) => ({
        ...event,
        date: event.date.toISOString(),
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(eventsToSave));
    } catch (error) {
      console.error("Error saving events to local storage:", error);
    }
  }, [events]);

  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setDate(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEventType) => {
    setEditingEvent(event);
    setSelectedDate(event.date);
    setSelectedEvent(event);
    setIsModalOpen(true);
    setIsViewEventsModalOpen(false);
  };

  const handleAddEvent = (event: CalendarEventType) => {
    if (editingEvent) {
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === editingEvent.id ? { ...e, ...event } : e
        )
      );
    } else {
      setEvents((prevEvents) => [
        ...prevEvents,
        { ...event, id: new Date().getTime() },
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      setEvents((prevEvents) =>
        prevEvents.filter((ev) => ev.id !== editingEvent.id)
      );
      setIsModalOpen(false);
    }
  };

  const handleViewEventsModal = (events: CalendarEventType[]) => {
    setModalEvents(events);
    setIsViewEventsModalOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const focusedDayIndex = calendarDayRefs.current.findIndex(
      (dayElement) => dayElement === document.activeElement
    );
    if (focusedDayIndex === -1) return;

    switch (e.key) {
      case "ArrowLeft":
        if (focusedDayIndex > 0) {
          calendarDayRefs.current[focusedDayIndex - 1]?.focus();
        }
        break;
      case "ArrowRight":
        if (focusedDayIndex < calendarDayRefs.current.length - 1) {
          calendarDayRefs.current[focusedDayIndex + 1]?.focus();
        }
        break;
      case "ArrowUp":
        if (focusedDayIndex >= 7) {
          calendarDayRefs.current[focusedDayIndex - 7]?.focus();
        }
        break;
      case "ArrowDown":
        if (focusedDayIndex + 7 < calendarDayRefs.current.length) {
          calendarDayRefs.current[focusedDayIndex + 7]?.focus();
        }
        break;
      case "Enter":
        if (calendarDayRefs.current[focusedDayIndex]) {
          const selectedDate =
            calendarDayRefs.current[focusedDayIndex]?.dataset.date;
          setSelectedDate(new Date(selectedDate!));
          setIsModalOpen(true);
        }
        break;
      case "Escape":
        setIsModalOpen(false);
        break;
    }
  };

  const [, setFocusedDay] = useState<Date | null>(null);

  const handleDayFocus = (date: Date) => {
    setFocusedDay(date);
  };

  return (
    <>
      <div
        className="calendar-wrapper"
        aria-hidden={isModalOpen ? "true" : "false"}
        tabIndex={isModalOpen ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        <CalendarHeader
          month={date.toLocaleString("default", { month: "long" })}
          year={year}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />
        <div className="calendar-container">
          {calendarDays.map((dayObj, index) => {
            const { date, isCurrentMonth, isPast } = dayObj;

            const currentEvents = getEventsForDate(date);

            const dayHeight = dayHeights[index] || 0;
            const adjustedEventsHeight = dayHeight - 10;
            const maxVisibleEvents = Math.floor(adjustedEventsHeight / 40);

            const visibleEvents = currentEvents.slice(0, maxVisibleEvents);
            const hasMoreEvents = currentEvents.length > maxVisibleEvents;

            return (
              <div
                key={index}
                className={`calendar-day 
                 ${isPast ? "past-day" : ""} 
                 ${datesAreEqual(date, new Date()) ? "current-day" : ""} 
                 ${isCurrentMonth ? "" : "non-current-month"}`}
                ref={(el) => (calendarDayRefs.current[index] = el)}
                tabIndex={0}
                data-date={date.toISOString()}
                onFocus={() => handleDayFocus(date)}
              >
                {index < daysOfWeek.length && (
                  <span className="day-name">{daysOfWeek[date.getDay()]}</span>
                )}

                <span className="day-number">{date.getDate()}</span>

                <div className="events-container">
                  <div className="events">
                    {visibleEvents.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`event ${
                          event.allDay ? "all-day" : "timed"
                        }`}
                        style={{
                          backgroundColor: event.allDay
                            ? event.color
                            : "transparent",
                          borderLeft: "none",
                        }}
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleEventClick(event);
                          }
                        }}
                      >
                        <CalendarEvent
                          key={eventIndex}
                          event={event}
                          onClick={handleEventClick}
                        />
                      </div>
                    ))}
                  </div>

                  {hasMoreEvents && (
                    <div className="show-more-container">
                      <button
                        className="show-more-btn"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewEventsModal(currentEvents);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleViewEventsModal(currentEvents);
                          }
                        }}
                      >
                        +{currentEvents.length - visibleEvents.length} More
                      </button>
                    </div>
                  )}
                </div>

                {/* Add Event Button */}

                <button
                  className="add-event-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDayClick(date);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleDayClick(date);
                    }
                  }}
                  tabIndex={0}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && selectedDate && (
        <EventModal
          date={selectedDate}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddEvent}
          onDelete={handleDeleteEvent}
          editingEvent={editingEvent}
        />
      )}

      {isEventModalOpen && selectedEvent && (
        <EventModal
          date={selectedEvent.date}
          editingEvent={selectedEvent}
          onClose={() => setIsEventModalOpen(false)}
          onSave={(updatedEvent) => {
            setEvents((prevEvents) =>
              prevEvents.map((e) =>
                e.id === updatedEvent.id ? updatedEvent : e
              )
            );
            setIsEventModalOpen(false);
          }}
          onDelete={() => {
            setEvents((prevEvents) =>
              prevEvents.filter((e) => e.id !== selectedEvent.id)
            );
            setIsEventModalOpen(false);
          }}
        />
      )}

      {isViewEventsModalOpen && (
        <ViewEventsModal
          events={modalEvents}
          onClose={() => setIsViewEventsModalOpen(false)}
          onEditEvent={handleEventClick}
        />
      )}
    </>
  );
}
