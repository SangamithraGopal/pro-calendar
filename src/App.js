import React, { useState, useEffect } from "react";
import "./App.css";
import dayjs from "dayjs";


     const globalHolidays = [
  // 🌍 International & Multinational
  { title: "New Year's Day", date: "2025-01-01" },
  { title: "Valentine's Day", date: "2025-02-14" },
  { title: "International Mother Language Day", date: "2025-02-21" },
  { title: "International Women's Day", date: "2025-03-08" },
  { title: "Pi Day", date: "2025-03-14" },
  { title: "April Fool's Day", date: "2025-04-01" },
  { title: "Earth Day", date: "2025-04-22" },
  { title: "Labour Day / May Day", date: "2025-05-01" },
  { title: "Europe Day", date: "2025-05-09" },
  { title: "International Day of Families", date: "2025-05-15" },
  { title: "World Environment Day", date: "2025-06-05" },
  { title: "World Oceans Day", date: "2025-06-08" },
  { title: "World Population Day", date: "2025-07-11" },
  { title: "International Youth Day", date: "2025-08-12" },
  { title: "International Literacy Day", date: "2025-09-08" },
  { title: "International Day of Peace", date: "2025-09-21" },
  { title: "World Teachers' Day", date: "2025-10-05" },
  { title: "United Nations Day", date: "2025-10-24" },
  { title: "Halloween", date: "2025-10-31" },
  { title: "World Science Day", date: "2025-11-10" },
  { title: "Universal Children's Day", date: "2025-11-20" },
  { title: "World AIDS Day", date: "2025-12-01" },
  { title: "Human Rights Day", date: "2025-12-10" },
  { title: "Christmas Day", date: "2025-12-25" },

  // 🎉 Major Indian Festivals
  { title: "Pongal", date: "2025-01-14" },
  { title: "Makar Sankranti", date: "2025-01-14" },
  { title: "Republic Day (India)", date: "2025-01-26" },
  { title: "Maha Shivratri", date: "2025-02-26" },
  { title: "Saraswati Pooja / Vasant Panchami", date: "2025-02-02" },
  { title: "Holi", date: "2025-03-13" },
  { title: "Ramadan Eid (Eid al-Fitr)", date: "2025-03-29" },
  { title: "Good Friday", date: "2025-04-18" },
  { title: "Easter Sunday", date: "2025-04-20" },
  { title: "Raksha Bandhan", date: "2025-08-18" },
  { title: "Ganesh Chaturthi", date: "2025-08-30" },
  { title: "Independence Day (India)", date: "2025-08-15" },
  { title: "Dussehra (Vijayadashami)", date: "2025-10-02" },
  { title: "Karva Chauth", date: "2025-10-30" },
  { title: "Diwali (Deepavali)", date: "2025-10-21" },
  { title: "Eid al-Adha (Bakrid)", date: "2025-06-06" },
  { title: "Guru Nanak Jayanti", date: "2025-11-05" }
];



function App() {
  const [current, setCurrent] = useState(dayjs());
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem("userEvents") || "[]"));
  const [page, setPage] = useState("calendar");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("🎉 Personal");
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem("userEvents", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
    const interval = setInterval(() => {
      const now = dayjs();
      events.forEach(e => {
        const eventTime = dayjs(`${e.date}T${e.time}`);
        const oneDayBefore = eventTime.subtract(1, "day").hour(9).minute(0);
        if (now.isSame(oneDayBefore, "minute")) {
          new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();
          if (Notification.permission === "granted") {
            new Notification("Reminder", { body: `${e.title} is tomorrow at ${e.time}` });
          } else {
            alert(`Reminder: ${e.title} is tomorrow at ${e.time}`);
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [events]);

  const addOrUpdateEvent = (e) => {
    e.preventDefault();
    const newEvent = { title, date, time, category };
    if (editIndex !== null) {
      const updated = [...events];
      updated[editIndex] = newEvent;
      setEvents(updated);
      setEditIndex(null);
    } else {
      setEvents([...events, newEvent]);
    }
    setTitle("");
    setDate("");
    setTime("");
    setCategory("🎉 Personal");
  };

  const deleteEvent = (i) => {
    if (window.confirm("Delete this event?")) {
      const updated = [...events];
      updated.splice(i, 1);
      setEvents(updated);
    }
  };

  const showInlineEdit = (i) => {
    const e = events[i];
    setTitle(e.title);
    setDate(e.date);
    setTime(e.time);
    setCategory(e.category);
    setEditIndex(i);
    setPage("calendar");
  };

  const downloadCSV = () => {
    let csv = "Title,Date,Time,Category\n";
    events.forEach(e => {
      const plain = e.category.replace(/[^a-zA-Z ]/g, "");
      csv += `"${e.title}","${e.date}","${e.time}","${plain}"\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "my_events.csv";
    link.click();
  };

  const clearAll = () => {
    if (window.confirm("Clear all events?")) {
      setEvents([]);
    }
  };

  const renderDays = () => {
    const start = current.startOf("month").startOf("week");
    const end = current.endOf("month").endOf("week");
    const days = [];
    let date = start.clone();
    while (date.isBefore(end, "day")) {
      const isToday = date.isSame(dayjs(), "day");
      const holidays = globalHolidays.filter(h => date.isSame(h.date, "day"));
      const dailyEvents = events.filter(e => date.isSame(e.date, "day"));
      days.push(
        <div key={date} className={`calendar-cell ${isToday ? "today" : ""}`}>
          <div style={{ position: "absolute", top: "5px", right: "5px", fontSize: "12px" }}>{date.date()}</div>
          {holidays.map((h, i) => (
            <span key={i} className="badge">{h.title}</span>
          ))}
          {dailyEvents.map((e, i) => (
            <span key={i} className="event-badge">{`${e.category} ${e.title} (${e.time})`}</span>
          ))}
        </div>
      );
      date = date.add(1, "day");
    }
    return days;
  };

  return (
    <div className="App">
      <aside className="sidebar">
        <button onClick={() => setPage("calendar")}>📅 Calendar</button>
        <button onClick={() => setPage("events")}>📋 My Events</button>
        <button onClick={downloadCSV}>⬇️ Download CSV</button>
        <button onClick={clearAll}>🗑️ Clear All</button>
      </aside>

      <main className="main">
        <div className="upcoming">
          <h2>Upcoming Events</h2>
          <ul>
            {events
              .filter(e => dayjs(`${e.date}T${e.time}`).isAfter(dayjs()))
              .sort((a,b) => dayjs(`${a.date}T${a.time}`).diff(dayjs(`${b.date}T${b.time}`)))
              .slice(0, 3)
              .map((e, i) => (
                <li key={i}>{`${e.category} ${e.title} — ${e.date} ${e.time}`}</li>
              ))}
          </ul>
        </div>

        {page === "calendar" && (
          <div className="calendar-container">
            <div className="calendar-header">
              <button onClick={() => setCurrent(current.subtract(1, "month"))}>Prev</button>
              <h1>{current.format("MMMM YYYY")}</h1>
              <button onClick={() => setCurrent(current.add(1, "month"))}>Next</button>
            </div>

            <form onSubmit={addOrUpdateEvent}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>🎉 Personal</option>
                <option>💼 Work</option>
                <option>💪 Health</option>
              </select>
              <button type="submit">{editIndex !== null ? "Update" : "Add"}</button>
            </form>

            <div className="calendar-grid">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} style={{textAlign:"center", fontWeight:"bold"}}>{d}</div>)}
              {renderDays()}
            </div>
          </div>
        )}

        {page === "events" && (
          <div className="events-container">
            <h2>My Events</h2>
            {events.map((e, i) => (
              <div key={i} className="event-item">
                <b>{`${e.category} ${e.title}`}</b> — {`${e.date} ${e.time}`}
                <button onClick={() => showInlineEdit(i)}>Edit</button>
                <button onClick={() => deleteEvent(i)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
