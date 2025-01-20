import { useState, useEffect, useRef } from "react";
import "./Styles/EventModal.css";
import { CalendarEventType } from "./MainCalendar";

interface EventModalProps {
  date: Date;
  onClose: () => void;
  onSave: (event: CalendarEventType) => void;
  onDelete: () => void;
  editingEvent: CalendarEventType | null;
}

interface Event {
  id: number;
  title: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  color?: string;
  date: Date;
}

export function EventModal({
  date,
  onClose,
  onSave,
  onDelete,
  editingEvent,
}: EventModalProps) {
  const colorOptions = [
    "hsl(0, 75%, 60%)",
    "hsl(150, 80%, 30%)",
    "hsl(200, 80%, 50%)",
  ];
  const [title, setTitle] = useState(editingEvent?.title || "");
  const [allDay, setAllDay] = useState(editingEvent?.allDay || false);
  const [startTime, setStartTime] = useState(editingEvent?.startTime || "");
  const [endTime, setEndTime] = useState(editingEvent?.endTime || "");
  const [selectedColor, setSelectedColor] = useState(
    editingEvent?.color || colorOptions[0]
  );
  const [timeError, setTimeError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

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

  const handleSave = () => {
    setTitleError(null);
    setTimeError(null);

    if (!title.trim()) {
      setTitleError("Event name is required.");
      return;
    }

    if (!allDay) {
      if (!startTime || !endTime) {
        setTimeError("Start time and end time are required.");
        return;
      }

      if (startTime >= endTime) {
        setTimeError("End time must be after start time.");
        return;
      }
    }

    const newEvent: Event = {
      id: editingEvent?.id || Date.now(),
      date,
      title,
      allDay,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      color: selectedColor,
    };

    onSave(newEvent);
  };


  const firstFocusableElementRef = useRef<HTMLButtonElement | null>(null);
const lastFocusableElementRef = useRef<HTMLButtonElement | null>(null);

  const trapFocus = (e: KeyboardEvent) => {
    if (!modalRef.current) return;
    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        
        e.preventDefault();
        lastFocusable?.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  useEffect(() => {
    
    window.addEventListener("keydown", trapFocus);

    
    if (modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      focusableElements[0]?.focus();
    }

    return () => {
      window.removeEventListener("keydown", trapFocus);
    };
  }, []);

  return (
    isVisible && (
      <div
        ref={modalRef}
        className={`modal ${isClosing ? "closing" : ""}`}
        onMouseDown={
          handleOutsideClick as unknown as React.MouseEventHandler<HTMLDivElement>
        }
      >
        <div
          ref={modalContentRef}
          className={`modal-content ${isClosing ? "closing" : ""}`}
          onMouseDown={stopPropagation}
        >
          <div className="modal-header" tabIndex={-1} >
            <h2 className="modal-title">
              {editingEvent ? "Edit Event" : "Add Event"}
            </h2>
            <button className="close-btn" onClick={handleModalClose} ref={firstFocusableElementRef}>
              x
            </button>
          </div>

          <label className="name-input">
            Name
            <div className="input-container">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) {
                    setTitleError(null);
                  }
                }}
                className={titleError ? "error-input error-border" : ""}
              />
              {titleError && <div className="error-tooltip">{titleError}</div>}
            </div>
          </label>

          {/* All Day Option */}
          <label className="all-day-checkbox">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => {
                setAllDay(e.target.checked);
                if (e.target.checked) {
                  setStartTime("");
                  setEndTime("");
                  setTimeError(null);
                }
              }}
            />
            All Day?
          </label>

          {!allDay && (
            <div className="modal-time">
              <label className="time-input">
                Start Time:
                <div className="input-container">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      if (endTime && e.target.value >= endTime) {
                        setTimeError("End time must be after start time.");
                      } else {
                        setTimeError(null);
                      }
                    }}
                    className={timeError ? "error-input error-border" : ""}
                  />
                </div>
              </label>

              <label className="time-input">
                End Time:
                <div className="input-container">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      if (startTime && e.target.value <= startTime) {
                        setTimeError("End time must be after start time.");
                      } else {
                        setTimeError(null);
                      }
                    }}
                    className={timeError ? "error-input error-border" : ""}
                  />
                  {timeError && (
                    <div className="error-tooltip">{timeError}</div>
                  )}
                </div>
              </label>
            </div>
          )}

          <div className="color-picker-container">
            <label className="color-label">Color</label>
            <div className="color-options">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`color-picker ${
                    selectedColor === color ? "selected" : "unselected"
                  }`}
                  style={{
                    backgroundColor: color,
                  }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="add-delete-btn-container">
            <button className="add-btn" onClick={handleSave}  ref={lastFocusableElementRef}>
              {editingEvent ? "Edit" : "Add"}
            </button>
            {editingEvent && (
              <button className="delete-btn" onClick={onDelete}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );
}
