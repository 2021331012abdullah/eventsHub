import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPendingInvitations } from "@/lib/actions/invitations";
import InvitationActions from "@/components/InvitationActions";
import Link from "next/link";
import "./dashboard.css";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const [stats, recentEvents, pendingInvitations] = await Promise.all([
    // Stats
    Promise.all([
      prisma.event.count({ where: { creatorId: session.user.id } }),
      prisma.teamMember.count({ where: { userId: session.user.id } }),
      prisma.invitation.count({
        where: { inviteeId: session.user.id, status: "PENDING" },
      }),
    ]),
    // Recent events (user created + events user is part of via teams)
    prisma.event.findMany({
      where: {
        OR: [
          { creatorId: session.user.id },
          { teams: { some: { members: { some: { userId: session.user.id } } } } },
        ],
      },
      include: {
        creator: { select: { name: true, image: true } },
        _count: { select: { teams: true } },
      },
      orderBy: { date: "asc" },
      take: 6,
    }),
    // Pending invitations
    getPendingInvitations(),
  ]);

  const [eventsCreated, teamsJoined, pendingCount] = stats;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Welcome */}
        <div className="dashboard-welcome animate-fade-in">
          <h1 className="welcome-title">
            Welcome back,{" "}
            <span className="title-gradient">
              {session.user.name?.split(" ")[0]}
            </span>
            ! 👋
          </h1>
          <p className="welcome-subtitle">
            Here&apos;s what&apos;s happening with your events and teams.
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid animate-fade-in">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <span className="stat-value">{eventsCreated}</span>
              <span className="stat-label">Events Created</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <span className="stat-value">{teamsJoined}</span>
              <span className="stat-label">Teams Joined</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✉️</div>
            <div className="stat-info">
              <span className="stat-value">{pendingCount}</span>
              <span className="stat-label">Pending Invites</span>
            </div>
          </div>
        </div>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <section className="dashboard-section animate-fade-in">
            <div className="section-header">
              <div>
                <h2 className="section-title">Pending Invitations</h2>
                <p className="section-subtitle">
                  You&apos;ve been invited to join these teams
                </p>
              </div>
            </div>
            <div className="invitations-list">
              {pendingInvitations.map((inv) => (
                <div key={inv.id} className="invitation-card glass-card">
                  <div className="invitation-info">
                    <div className="invitation-from">
                      {inv.inviter.image ? (
                        <img
                          src={inv.inviter.image}
                          alt={inv.inviter.name || ""}
                          className="avatar avatar-sm"
                        />
                      ) : (
                        <span className="avatar avatar-sm avatar-fallback">
                          {inv.inviter.name?.[0]}
                        </span>
                      )}
                      <span>
                        <strong>{inv.inviter.name}</strong> invited you to
                      </span>
                    </div>
                    <div className="invitation-detail">
                      <span className="invitation-team">{inv.team.name}</span>
                      <span className="invitation-event">
                        for {inv.team.event.name}
                      </span>
                    </div>
                  </div>
                  <InvitationActions invitationId={inv.id} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Events */}
        <section className="dashboard-section animate-fade-in">
          <div className="section-header">
            <div>
              <h2 className="section-title">Your Events</h2>
              <p className="section-subtitle">Events you&apos;ve created or joined</p>
            </div>
            <Link href="/events/create" className="btn btn-primary">
              + Create Event
            </Link>
          </div>
          {recentEvents.length > 0 ? (
            <div className="grid-cards">
              {recentEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="event-card glass-card"
                >
                  <div className="event-card-header">
                    <span
                      className={`badge ${
                        event.privacy === "PUBLIC"
                          ? "badge-public"
                          : "badge-private"
                      }`}
                    >
                      {event.privacy}
                    </span>
                    <span className="event-date">{formatDate(event.date)}</span>
                  </div>
                  <h3 className="event-card-title">{event.name}</h3>
                  <div className="event-card-meta">
                    <span>⏱ {event.time}</span>
                    <span>👥 {event._count.teams} teams</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p className="empty-state-title">No events yet</p>
              <p className="empty-state-text">
                Create your first event to get started!
              </p>
              <Link href="/events/create" className="btn btn-primary btn-lg">
                Create Event
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
