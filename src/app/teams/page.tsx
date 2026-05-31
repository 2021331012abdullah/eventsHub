import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyTeams } from "@/lib/actions/teams";
import Link from "next/link";
import "./my-teams.css";

export default async function MyTeamsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const memberships = await getMyTeams();

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
        <div className="section-header animate-fade-in">
          <div>
            <h1 className="section-title">My Teams</h1>
            <p className="section-subtitle">
              All teams you&apos;re a member of across events
            </p>
          </div>
        </div>

        {memberships.length > 0 ? (
          <div className="grid-cards animate-fade-in">
            {memberships.map((membership) => (
              <Link
                key={membership.id}
                href={`/events/${membership.team.event.id}/teams/${membership.team.id}`}
                className="my-team-card glass-card"
              >
                <div className="team-card-header">
                  <h3 className="team-card-name">{membership.team.name}</h3>
                  <span
                    className={`badge ${
                      membership.role === "LEADER"
                        ? "badge-leader"
                        : "badge-public"
                    }`}
                  >
                    {membership.role}
                  </span>
                </div>
                <div className="my-team-event">
                  <span className="my-team-event-icon">📅</span>
                  <div>
                    <span className="my-team-event-name">
                      {membership.team.event.name}
                    </span>
                    <span className="my-team-event-date">
                      {formatDate(membership.team.event.date)}
                    </span>
                  </div>
                </div>
                <div className="my-team-meta">
                  <span>
                    👥 {membership.team._count.members} member
                    {membership.team._count.members !== 1 ? "s" : ""}
                  </span>
                  <span
                    className={`badge ${
                      membership.team.event.privacy === "PUBLIC"
                        ? "badge-public"
                        : "badge-private"
                    }`}
                  >
                    {membership.team.event.privacy}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-title">No teams yet</p>
            <p className="empty-state-text">
              Browse events and create or join a team to get started!
            </p>
            <Link href="/events" className="btn btn-primary btn-lg">
              Browse Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
