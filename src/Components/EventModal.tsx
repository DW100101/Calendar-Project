import { useState, useEffect } from "react";
import "./Styles/EventModal.css";

interface EventModalProps {
  date: Date;
  onClose: () => void;
  onSave: (event: Event) => void;
  onDelete: () => void;
  editingEvent: Event | null;
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
    "	hsl(150, 80%, 30%)",
    "	hsl(200, 80%, 50%)",
  ];

  const [title, setTitle] = useState<string>(editingEvent?.title || "");
  const [allDay, setAllDay] = useState<boolean>(editingEvent?.allDay || false);
  const [startTime, setStartTime] = useState<string>(
    editingEvent?.startTime || ""
  );
  const [endTime, setEndTime] = useState<string>(editingEvent?.endTime || "");
  const [selectedColor, setSelectedColor] = useState<string>(
    editingEvent?.color || colorOptions[0]
  );
  const [timeError, setTimeError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleModalClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setAllDay(editingEvent.allDay || false);
      setStartTime(editingEvent.startTime || "00:00");
      setEndTime(editingEvent.endTime || "00:00");
      setSelectedColor(editingEvent.color || colorOptions[0]);
    }
  }, [editingEvent]);

  const validateTimes = () => {
    if (!allDay) {
      if (!startTime || !endTime) {
        setTimeError("Both start time and end time are required.");
        return false;
      }
      const start = new Date(`1970-01-01T${startTime}:00`);
      const end = new Date(`1970-01-01T${endTime}:00`);
      if (end <= start) {
        setTimeError("End time must be after start time.");
        return false;
      }
    }
    setTimeError(null);
    return true;
  };

  const handleSave = () => {
    if (!validateTimes()) return;
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

  return (
    <div className={`modal ${isClosing ? "closing" : ""}`}>
      <div className="modal-content">
        <div className="modal-header" style={{}}>
          <h2 className="modal-title">
            {editingEvent ? "Edit Event" : "Add Event"}
          </h2>
          <h2 className="modal-date">
            {(editingEvent?.date || date)?.toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "2-digit",
            })}
          </h2>
          <button className="close-btn" onClick={handleModalClose}>
            x
          </button>
        </div>
        <label className="name-input">
          Name
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", width: "100%" }}
          />
        </label>

        <div style={{ display: "flex", alignItems: "center" }}></div>

        <label>
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
          />
          All Day?
        </label>
        {!allDay && (
          <>
            <div className="modal-time">
              <label className="time-input">
                Start Time:
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={timeError ? "error-input" : ""}
                  style={{ display: "block" }}
                />
              </label>
              <label className="time-input">
                End Time:
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={timeError ? "error-input" : ""}
                  style={{ display: "block" }}
                />
                {timeError && (
                  <span className="error-message" style={{ color: "red" }}>
                    {timeError}
                  </span>
                )}
              </label>
            </div>
          </>
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
          <button className="add-btn" onClick={handleSave}>
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
  );
}
