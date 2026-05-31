"use client";

import Link from "next/link";
import { useState } from "react";

type EventItem = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  time: string | null;
  durationMinutes: number | null;
  privacy: "PUBLIC" | "PRIVATE";
  creator: { id: string; name: string | null; image: string | null };
  _count: { teams: number };
};

export default function EventsClient({
  publicEvents,
  myEvents,
  currentUserId,
}: {
  publicEvents: EventItem[];
  myEvents: EventItem[];
  currentUserId: string;
}) {
  const [tab, setTab] = useState<"public" | "mine">("public");
  const [search, setSearch] = useState("");

  const events = tab === "public" ? publicEvents : myEvents;
  const filtered = search
    ? events.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
      )
    : events;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="events-tabs">
        <div className="toggle-group">
          <button
            className={`toggle-option ${tab === "public" ? "active" : ""}`}
            onClick={() => setTab("public")}
          >
            🌐 Public Events
          </button>
          <button
            className={`toggle-option ${tab === "mine" ? "active" : ""}`}
            onClick={() => setTab("mine")}
          >
            📋 My Events
          </button>
        </div>
      </div>

      <div className="events-search">
        <input
          type="text"
          className="form-input"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid-cards animate-fade-in">
          {filtered.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="event-card glass-card"
            >
              <div className="event-card-header">
                <span
                  className={`badge ${
                    event.privacy === "PUBLIC" ? "badge-public" : "badge-private"
                  }`}
                >
                  {event.privacy}
                </span>
                <span className="event-date">{formatDate(event.date)}</span>
              </div>
              <h3 className="event-card-title">{event.name}</h3>
              {event.description && (
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-tertiary)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {event.description}
                </p>
              )}
              <div className="event-card-meta">
                {event.time && <span>⏱ {event.time}</span>}
                {event.durationMinutes && <span>⏳ {event.durationMinutes} min</span>}
                <span>👥 {event._count.teams} teams</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  marginTop: "auto",
                  paddingTop: "var(--space-md)",
                  borderTop: "1px solid var(--border-subtle)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-tertiary)",
                }}
              >
                {event.creator.image && (
                  <img
                    src={event.creator.image}
                    alt=""
                    className="avatar avatar-sm"
                    style={{ width: 20, height: 20 }}
                  />
                )}
                <span>
                  {event.creator.id === currentUserId
                    ? "You"
                    : event.creator.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            {tab === "public" ? "🌐" : "📋"}
          </div>
          <p className="empty-state-title">
            {tab === "public" ? "No public events found" : "No events yet"}
          </p>
          <p className="empty-state-text">
            {tab === "public"
              ? "Check back later or create your own event!"
              : "Create your first event to get started."}
          </p>
          <Link href="/events/create" className="btn btn-primary btn-lg">
            Create Event
          </Link>
        </div>
      )}
    </>
  );
}
