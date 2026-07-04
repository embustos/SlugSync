import React from "react";
import { calendarDays, calendarPreview, upcomingEvents } from "../data/mockEvents";

function Dashboard() {
  return (
    <div className="app-shell">
      <nav className="navbar" aria-label="Main navigation">
        <a className="brand" href="/">
          SlugSync
        </a>
        <div className="nav-links">
          <a href="/">Dashboard</a>
          <a href="/">Calendar</a>
          <a href="/">Sources</a>
        </div>
      </nav>

      <main className="dashboard">
        <section className="welcome-section" aria-labelledby="welcome-title">
          <div>
            <p className="eyebrow">Event calendar</p>
            <h1 id="welcome-title">Welcome to your event dashboard.</h1>
            <p>
              Browse a mock preview of upcoming events today. Instagram and
              Discord source cards are ready for future integrations.
            </p>
          </div>
          <div className="welcome-stat" aria-label="Three mock events this week">
            <strong>3</strong>
            <span>mock events this week</span>
          </div>
        </section>

        <section className="dashboard-grid" aria-label="Dashboard overview">
          <article className="panel calendar-preview">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Preview</p>
                <h2>July calendar</h2>
              </div>
              <span>2026</span>
            </div>

            <div className="calendar-grid">
              {calendarDays.map((day) => (
                <div className="calendar-label" key={day}>
                  {day}
                </div>
              ))}
              {calendarPreview.map(({ day, hasEvent, isToday }) => (
                <div
                  className={`calendar-day${hasEvent ? " has-event" : ""}${
                    isToday ? " is-today" : ""
                  }`}
                  key={day}
                >
                  <span>{day}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel upcoming-events">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Next up</p>
                <h2>Upcoming events</h2>
              </div>
              <span>Mock data</span>
            </div>

            <ul className="event-list">
              {upcomingEvents.map((event) => (
                <li className="event-item" key={event.id}>
                  <div className="event-date">
                    <strong>{event.date}</strong>
                    <span>{event.time}</span>
                  </div>
                  <div className="event-details">
                    <h3>{event.title}</h3>
                    <p>{event.location}</p>
                  </div>
                  <span className="event-source">{event.source}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="source-grid" aria-label="Future event sources">
          <article className="source-card source-instagram">
            <p className="eyebrow">Future source</p>
            <h2>Instagram events</h2>
            <p>
              Placeholder for events discovered from posts, stories, or profile
              activity once source integrations are added.
            </p>
          </article>

          <article className="source-card source-discord">
            <p className="eyebrow">Future source</p>
            <h2>Discord events</h2>
            <p>
              Placeholder for events collected from servers, channels, and
              community announcements in a later phase.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
