"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UserSearchInput from "@/components/UserSearchInput";
import { sendInvitation } from "@/lib/actions/invitations";

type TeamMember = {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string | null; image: string | null };
};

type Team = {
  id: string;
  name: string;
  visibility: string;
  creatorId: string;
  members: TeamMember[];
  _count: { members: number };
};

type Event = {
  id: string;
  name: string;
  privacy: string;
};

export default function EventDetailClient({
  event,
  visibleTeams,
  userTeam,
  currentUserId,
  isCreator,
}: {
  event: Event;
  visibleTeams: Team[];
  userTeam: Team | null;
  currentUserId: string;
  isCreator: boolean;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(
    event.privacy === "PRIVATE" ? "PRIVATE" : "PUBLIC"
  );
  const [selectedUsers, setSelectedUsers] = useState<
    { id: string; name: string | null; image: string | null }[]
  >([]);
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          name: teamName,
          visibility,
          inviteUserIds: selectedUsers.map((u) => u.id),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create team");
        return;
      }
      setShowCreate(false);
      setTeamName("");
      setSelectedUsers([]);
      router.refresh();
    } catch (err) {
      alert("Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const handleInviteToTeam = async (
    teamId: string,
    userId: string
  ) => {
    setInviting(userId);
    try {
      await sendInvitation(teamId, userId);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to invite");
    } finally {
      setInviting(null);
    }
  };

  return (
    <section className="teams-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Teams</h2>
          <p className="section-subtitle">
            {event.privacy === "PUBLIC"
              ? "Public teams are visible to everyone"
              : "Teams are private in this event"}
          </p>
        </div>
        {!userTeam && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(!showCreate)}
          >
            {showCreate ? "Cancel" : "+ Create Team"}
          </button>
        )}
      </div>

      {/* Create Team Form */}
      {showCreate && (
        <div className="glass-card" style={{ marginBottom: "var(--space-xl)" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-lg)",
            }}
          >
            <div className="form-group">
              <label className="form-label">Team Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Team Alpha"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            {event.privacy === "PUBLIC" && (
              <div className="form-group">
                <label className="form-label">Team Visibility</label>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-option ${
                      visibility === "PUBLIC" ? "active" : ""
                    }`}
                    onClick={() => setVisibility("PUBLIC")}
                  >
                    🌐 Public
                  </button>
                  <button
                    type="button"
                    className={`toggle-option ${
                      visibility === "PRIVATE" ? "active" : ""
                    }`}
                    onClick={() => setVisibility("PRIVATE")}
                  >
                    🔒 Private
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Invite Members</label>
              <UserSearchInput
                selectedUsers={selectedUsers}
                onSelect={(user) =>
                  setSelectedUsers((prev) => [...prev, user])
                }
                onRemove={(userId) =>
                  setSelectedUsers((prev) =>
                    prev.filter((u) => u.id !== userId)
                  )
                }
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleCreateTeam}
              disabled={creating || !teamName.trim()}
            >
              {creating ? "Creating..." : "Create Team"}
            </button>
          </div>
        </div>
      )}

      {/* Team List */}
      {visibleTeams.length > 0 ? (
        <div className="grid-cards">
          {visibleTeams.map((team) => {
            const isTeamLeader = team.creatorId === currentUserId;
            const isMember = team.members.some(
              (m) => m.userId === currentUserId
            );

            return (
              <div key={team.id} className="glass-card">
                <div className="team-card-header">
                  <h3 className="team-card-name">{team.name}</h3>
                  <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                    <span
                      className={`badge ${
                        team.visibility === "PUBLIC"
                          ? "badge-public"
                          : "badge-private"
                      }`}
                    >
                      {team.visibility}
                    </span>
                    {isTeamLeader && (
                      <span className="badge badge-leader">Leader</span>
                    )}
                  </div>
                </div>

                <div className="team-members-preview">
                  <div className="avatar-stack">
                    {team.members.slice(0, 5).map((m) =>
                      m.user.image ? (
                        <img
                          key={m.id}
                          src={m.user.image}
                          alt={m.user.name || ""}
                          className="avatar avatar-sm"
                          title={m.user.name || ""}
                        />
                      ) : (
                        <span
                          key={m.id}
                          className="avatar avatar-sm avatar-fallback"
                          title={m.user.name || ""}
                        >
                          {m.user.name?.[0] || "?"}
                        </span>
                      )
                    )}
                  </div>
                  <span className="team-member-count">
                    {team._count.members} member
                    {team._count.members !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Member names */}
                <div
                  style={{
                    marginTop: "var(--space-md)",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {team.members.map((m) => m.user.name).join(", ")}
                </div>

                {/* Team link */}
                <div style={{ marginTop: "var(--space-md)" }}>
                  <a
                    href={`/events/${event.id}/teams/${team.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View Team →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-title">No teams yet</p>
          <p className="empty-state-text">
            Be the first to create a team for this event!
          </p>
        </div>
      )}
    </section>
  );
}
