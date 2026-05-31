import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEvent } from "@/lib/actions/events";
import { deleteEvent } from "@/lib/actions/events";
import Link from "next/link";
import EventDetailClient from "@/components/EventDetailClient";
import "../events.css";

type Params = Promise<{ id: string }>;

export default async function EventDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const event = await getEvent(id);
  if (!event) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🔒</div>
            <p className="empty-state-title">Event not found</p>
            <p className="empty-state-text">
              This event may be private or doesn&apos;t exist.
            </p>
            <Link href="/events" className="btn btn-primary">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCreator = event.creatorId === session.user!.id;
  const userTeam = event.teams.find((t: { members: { userId: string }[] }) =>
    t.members.some((m: { userId: string }) => m.userId === session.user!.id)
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // Filter visible teams
  const visibleTeams = event.teams.filter((team: { visibility: string; members: { userId: string }[] }) => {
    if (team.visibility === "PUBLIC") return true;
    // Private teams: only visible to members
    return team.members.some((m: { userId: string }) => m.userId === session.user!.id);
  });

  const durationStr = formatDuration(event.durationMinutes);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="event-detail animate-fade-in">
          {/* Header */}
          <div className="event-detail-header">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", marginBottom: "var(--space-md)" }}>
              <span
                className={`badge ${
                  event.privacy === "PUBLIC" ? "badge-public" : "badge-private"
                }`}
              >
                {event.privacy}
              </span>
              {isCreator && <span className="badge badge-leader">Creator</span>}
            </div>
            <h1 className="event-detail-title">{event.name}</h1>
            <div className="event-detail-meta">
              <span>📅 {formatDate(event.date)}</span>
              {event.time && <span>⏱ {event.time}</span>}
              {durationStr && <span>⏳ {durationStr}</span>}
              {event.website && (
                <span>
                  🔗{" "}
                  <a
                    href={event.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--accent-primary-light)", textDecoration: "underline" }}
                  >
                    Website
                  </a>
                </span>
              )}
              <span>👥 {event.teams.length} teams</span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="event-description">{event.description}</div>
          )}

          {/* Creator */}
          <div className="event-creator">
            {event.creator.image ? (
              <img
                src={event.creator.image}
                alt={event.creator.name || ""}
                className="avatar"
              />
            ) : (
              <span className="avatar avatar-fallback">
                {event.creator.name?.[0]}
              </span>
            )}
            <div className="event-creator-info">
              <span className="event-creator-label">Created by</span>
              <span className="event-creator-name">
                {isCreator ? "You" : event.creator.name}
              </span>
            </div>
          </div>

          {/* Creator actions */}
          {isCreator && (
            <div className="event-actions">
              <form
                action={async () => {
                  "use server";
                  await deleteEvent(id);
                  redirect("/events");
                }}
              >
                <button type="submit" className="btn btn-danger btn-sm">
                  🗑 Delete Event
                </button>
              </form>
            </div>
          )}

          {/* Teams Section */}
          <EventDetailClient
            event={JSON.parse(JSON.stringify(event))}
            visibleTeams={JSON.parse(JSON.stringify(visibleTeams))}
            userTeam={userTeam ? JSON.parse(JSON.stringify(userTeam)) : null}
            currentUserId={session.user!.id}
            isCreator={isCreator}
          />
        </div>
      </div>
    </div>
  );
}
