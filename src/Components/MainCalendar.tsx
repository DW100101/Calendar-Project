import  { useState, useEffect, useRef } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { EventModal } from "./EventModal";
import { ViewEventsModal } from "./ViewEventsModal";
import "./Styles/MainCalendar.css";
import {
  getDays,
  getFirstDay,
  getDaysBefore,
  getDaysAfter,
  sortEvents,
  formatTimeTo12Hour,
} from "./HelperFunctions";


const LOCAL_STORAGE_KEY = "calendarEvents";

export interface Event {
  id: number;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  color?: string;
  date: Date;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isPast: boolean;
  isToday?: boolean;
}

export function MainCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>(() => {
    const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedEvents) {
      return JSON.parse(storedEvents).map((event: Event) => ({
        ...event,
        date: new Date(event.date),
      }));
    }
    return [];
  });
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [isViewEventsModalOpen, setIsViewEventsModalOpen] = useState(false);
  const [modalEvents, setModalEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]); 
  const [dayHeights, setDayHeights] = useState<{ [key: number]: number }>({});
  const year = date.getFullYear();
  const month = date.getMonth();
  const calendarDayRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const daysInMonth = getDays(year, month);
    const firstDayOfMonth = getFirstDay(year, month);
    const daysBefore = getDaysBefore(year, month, firstDayOfMonth);
    const totalDays = daysBefore.length + daysInMonth.length;
    const daysAfter = getDaysAfter(totalDays);
    const newCalendarDays = [
      ...daysBefore.map((day) => ({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isPast: true,
      })),
      ...daysInMonth.map((day) => ({
        date: new Date(year, month, day),
        isCurrentMonth: true,
        isPast: new Date(year, month, day) < new Date(),
        isToday:
          new Date(year, month, day).toDateString() ===
          new Date().toDateString(),
      })),
      ...daysAfter.map((day) => ({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isPast: false,
      })),
    ];
    setCalendarDays(newCalendarDays);
  }, [year, month]);

  const getEventsForDate = (date: Date) => {
    const filteredEvents = events.filter((event) =>
      datesAreEqual(event.date, date)
    );
    return sortEvents(filteredEvents);
  };

  useEffect(() => {
    updateDayHeights();
  }, [calendarDays]);

  const updateDayHeights = () => {
    const heights: { [key: number]: number } = {};
    calendarDayRefs.current.forEach((dayElement, index) => {
      if (dayElement) {
        heights[index] = dayElement.getBoundingClientRect().height;
      }
    });
    setDayHeights(heights);
  };

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

  const handleEventClick = (event: Event) => {
    setEditingEvent(event);
    setSelectedDate(event.date);
    setIsModalOpen(true);
    setIsViewEventsModalOpen(false);
  };

  const handleAddEvent = (event: Event) => {
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

  const handleViewEventsModal = (events: Event[]) => {
    setModalEvents(events);
    setIsViewEventsModalOpen(true);
  };

  const datesAreEqual = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  return (
    <>
      <div className="calendar-wrapper">
        <CalendarHeader
          month={date.toLocaleString("default", { month: "long" })}
          year={year}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />
        <div className="calendar-container">
          {calendarDays.map((dayObj, index) => {
            const { date, isCurrentMonth, isPast, isToday } = dayObj;

            const currentEvents = getEventsForDate(date);

            const dayHeight = dayHeights[index] || 0;
            const eventsHeight = dayHeight * 1;
            const eventHeight = dayHeight - 100;
            const reservedSpaceForButton = 20;
            const adjustedEventsHeight = eventsHeight - reservedSpaceForButton;
            const maxVisibleEvents = Math.floor(
              adjustedEventsHeight / eventHeight
            );

            const visibleEvents = currentEvents.slice(0, maxVisibleEvents);
            const hasMoreEvents = currentEvents.length > maxVisibleEvents;

            return (
              <div
                key={index}
                className={`calendar-day ${
                  isCurrentMonth ? "current-month" : "non-current-month"
                } ${datesAreEqual(date, new Date()) ? "current-day" : ""} ${
                  isPast ? "past-day" : ""
                }`}
                onMouseEnter={() => setHoveredDay(date)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => handleDayClick(date)}
                ref={(el) => (calendarDayRefs.current[index] = el)}
              >
                {index < daysOfWeek.length && (
                  <span className="day-name">{daysOfWeek[date.getDay()]}</span>
                )}

                <span className={`day-number ${isToday ? "current-day" : ""}`}>
                  {date.getDate()}
                </span>

                <div className="events">
                  {visibleEvents.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`event ${event.allDay ? "all-day" : "timed"}`}
                      style={{
                        backgroundColor: event.allDay
                          ? event.color
                          : "transparent",
                        borderLeft: "none",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      {event.allDay ? (
                        <span className="event-title">{event.title}</span>
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
                          <span className="event-title">{event.title}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {hasMoreEvents && (
                  <div className="show-more-container">
                    <button
                      className="show-more-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEventsModal(currentEvents);
                      }}
                    >
                      +{currentEvents.length - visibleEvents.length} More
                    </button>
                  </div>
                )}

                {hoveredDay?.getTime() === date.getTime() && (
                  <button
                    className="add-event-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(date);
                    }}
                  >
                    +
                  </button>
                )}
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
        <div className="modal">
          <ViewEventsModal
            events={modalEvents}
            onClose={() => setIsViewEventsModalOpen(false)}
            onEditEvent={handleEventClick}
          />
        </div>
      )}
    </>
  );
}
