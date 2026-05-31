import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTeamDetail } from "@/lib/actions/teams";
import Link from "next/link";
import TeamDetailClient from "@/components/TeamDetailClient";
import "../../../events.css";

type Params = Promise<{ id: string; teamId: string }>;

export default async function TeamDetailPage({ params }: { params: Params }) {
  const { id: eventId, teamId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const team = await getTeamDetail(teamId);

  if (!team) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🔒</div>
            <p className="empty-state-title">Team not found</p>
            <p className="empty-state-text">
              This team may be private or doesn&apos;t exist.
            </p>
            <Link href={`/events/${eventId}`} className="btn btn-primary">
              Back to Event
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLeader = team.members.some(
    (m: { userId: string; role: string }) => m.userId === session.user!.id && m.role === "LEADER"
  );
  const isMember = team.members.some((m: { userId: string }) => m.userId === session.user!.id);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="event-detail animate-fade-in">
          {/* Breadcrumb */}
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-tertiary)",
              marginBottom: "var(--space-xl)",
            }}
          >
            <Link href="/events" style={{ color: "var(--text-tertiary)" }}>
              Events
            </Link>
            {" → "}
            <Link
              href={`/events/${eventId}`}
              style={{ color: "var(--text-tertiary)" }}
            >
              {team.event.name}
            </Link>
            {" → "}
            <span style={{ color: "var(--text-primary)" }}>{team.name}</span>
          </div>

          <div className="section-header">
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-md)",
                  marginBottom: "var(--space-sm)",
                }}
              >
                <h1 className="section-title">{team.name}</h1>
                <span
                  className={`badge ${
                    team.visibility === "PUBLIC"
                      ? "badge-public"
                      : "badge-private"
                  }`}
                >
                  {team.visibility}
                </span>
              </div>
              <p className="section-subtitle">
                {team.event.name} • {team.members.length} member
                {team.members.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <TeamDetailClient
            team={JSON.parse(JSON.stringify(team))}
            isLeader={isLeader}
            isMember={isMember}
            currentUserId={session.user.id}
            eventId={eventId}
          />
        </div>
      </div>
    </div>
  );
}
