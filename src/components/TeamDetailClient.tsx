"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leaveTeam, removeFromTeam } from "@/lib/actions/teams";
import { sendInvitation } from "@/lib/actions/invitations";
import UserSearchInput from "@/components/UserSearchInput";

type TeamMember = {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    institution: string | null;
  };
};

type PendingInvite = {
  id: string;
  invitee: { id: string; name: string | null; image: string | null };
};

type Team = {
  id: string;
  name: string;
  visibility: string;
  creatorId: string;
  eventId?: string;
  event: { id: string; name: string; privacy: string };
  members: TeamMember[];
  invitations: PendingInvite[];
};

export default function TeamDetailClient({
  team,
  isLeader,
  isMember,
  currentUserId,
  eventId,
}: {
  team: Team;
  isLeader: boolean;
  isMember: boolean;
  currentUserId: string;
  eventId: string;
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<
    { id: string; name: string | null; image: string | null }[]
  >([]);
  const [sending, setSending] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const router = useRouter();

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this team?")) return;
    try {
      const result = await leaveTeam(team.id);
      if (result.deleted) {
        router.push(`/events/${eventId}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to leave team");
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove this member from the team?")) return;
    setRemoving(userId);
    try {
      await removeFromTeam(team.id, userId);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setRemoving(null);
    }
  };

  const handleSendInvites = async () => {
    if (selectedUsers.length === 0) return;
    setSending(true);
    try {
      for (const user of selectedUsers) {
        await sendInvitation(team.id, user.id);
      }
      setSelectedUsers([]);
      setShowInvite(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send invitations");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Members List */}
      <div className="glass-card" style={{ marginBottom: "var(--space-xl)" }}>
        <h3
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: 700,
            marginBottom: "var(--space-lg)",
          }}
        >
          Members
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
        >
          {team.members.map((member) => (
            <div
              key={member.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-sm) 0",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-md)",
                }}
              >
                {member.user.image ? (
                  <img
                    src={member.user.image}
                    alt={member.user.name || ""}
                    className="avatar"
                  />
                ) : (
                  <span className="avatar avatar-fallback">
                    {member.user.name?.[0] || "?"}
                  </span>
                )}
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-sm)",
                    }}
                  >
                    {member.user.name || "Unknown"}
                    {member.role === "LEADER" && (
                      <span className="badge badge-leader">Leader</span>
                    )}
                    {member.userId === currentUserId && (
                      <span
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        (You)
                      </span>
                    )}
                  </div>
                  {member.user.institution && (
                    <span
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {member.user.institution}
                    </span>
                  )}
                </div>
              </div>

              {isLeader && member.userId !== currentUserId && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemove(member.userId)}
                  disabled={removing === member.userId}
                >
                  {removing === member.userId ? "..." : "Remove"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {isLeader && team.invitations.length > 0 && (
        <div className="glass-card" style={{ marginBottom: "var(--space-xl)" }}>
          <h3
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: 700,
              marginBottom: "var(--space-lg)",
            }}
          >
            Pending Invitations
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-sm)",
            }}
          >
            {team.invitations.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-md)",
                  padding: "var(--space-sm) 0",
                }}
              >
                {inv.invitee.image ? (
                  <img
                    src={inv.invitee.image}
                    alt=""
                    className="avatar avatar-sm"
                  />
                ) : (
                  <span className="avatar avatar-sm avatar-fallback">
                    {inv.invitee.name?.[0]}
                  </span>
                )}
                <span style={{ fontSize: "var(--font-size-sm)" }}>
                  {inv.invitee.name}
                </span>
                <span className="badge badge-pending">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-md)",
          flexWrap: "wrap",
        }}
      >
        {isLeader && (
          <button
            className="btn btn-primary"
            onClick={() => setShowInvite(!showInvite)}
          >
            {showInvite ? "Cancel" : "✉️ Invite Members"}
          </button>
        )}
        {isMember && (
          <button className="btn btn-danger" onClick={handleLeave}>
            Leave Team
          </button>
        )}
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div
          className="glass-card"
          style={{ marginTop: "var(--space-xl)" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-lg)",
            }}
          >
            <div className="form-group">
              <label className="form-label">Search Users</label>
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
                excludeTeamId={team.id}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSendInvites}
              disabled={sending || selectedUsers.length === 0}
            >
              {sending
                ? "Sending..."
                : `Send ${selectedUsers.length} Invitation${
                    selectedUsers.length !== 1 ? "s" : ""
                  }`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
