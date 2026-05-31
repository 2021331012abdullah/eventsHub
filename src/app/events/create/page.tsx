"use client";

import { createEvent } from "@/lib/actions/events";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UserSearchInput from "@/components/UserSearchInput";

export default function CreateEventPage() {
  const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teamName, setTeamName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<
    { id: string; name: string | null; image: string | null }[]
  >([]);
  const [createTeamNow, setCreateTeamNow] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("privacy", privacy);
      const result = await createEvent(formData);

      // If user wants to create a team immediately
      if (createTeamNow && teamName && result.eventId) {
        const teamRes = await fetch("/api/teams/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: result.eventId,
            name: teamName,
            visibility: privacy === "PRIVATE" ? "PRIVATE" : "PUBLIC",
            inviteUserIds: selectedUsers.map((u) => u.id),
          }),
        });

        if (!teamRes.ok) {
          const data = await teamRes.json();
          console.error("Team creation error:", data.error);
        }
      }

      router.push(`/events/${result.eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="create-event-page animate-fade-in">
          <div className="section-header">
            <div>
              <h1 className="section-title">Create Event</h1>
              <p className="section-subtitle">
                Set up a new event and optionally create your team
              </p>
            </div>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="create-form">
            <div className="glass-card">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-lg)",
                }}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="event-name">
                    Event Name *
                  </label>
                  <input
                    id="event-name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Hackathon 2026"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="event-desc">
                    Description
                  </label>
                  <textarea
                    id="event-desc"
                    name="description"
                    className="form-textarea"
                    placeholder="What's this event about?"
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="event-date">
                      Date *
                    </label>
                    <input
                      id="event-date"
                      name="date"
                      type="date"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="event-time">
                      Time
                    </label>
                    <input
                      id="event-time"
                      name="time"
                      type="time"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="event-duration">
                      Duration (minutes)
                    </label>
                    <input
                      id="event-duration"
                      name="duration"
                      type="number"
                      className="form-input"
                      placeholder="e.g. 60"
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="event-website">
                      Event Website URL
                    </label>
                    <input
                      id="event-website"
                      name="website"
                      type="url"
                      className="form-input"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Privacy</label>
                  <div className="toggle-group">
                    <button
                      type="button"
                      className={`toggle-option ${
                        privacy === "PUBLIC" ? "active" : ""
                      }`}
                      onClick={() => setPrivacy("PUBLIC")}
                    >
                      🌐 Public
                    </button>
                    <button
                      type="button"
                      className={`toggle-option ${
                        privacy === "PRIVATE" ? "active" : ""
                      }`}
                      onClick={() => setPrivacy("PRIVATE")}
                    >
                      🔒 Private
                    </button>
                  </div>
                  <span className="privacy-description">
                    {privacy === "PUBLIC"
                      ? "Anyone can browse this event and see public teams"
                      : "Only invited team members can see this event"}
                  </span>
                </div>
              </div>
            </div>

            {/* Optional: Create team inline */}
            <div className="glass-card">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-lg)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-sm)",
                      cursor: "pointer",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={createTeamNow}
                      onChange={(e) => setCreateTeamNow(e.target.checked)}
                      style={{ accentColor: "var(--accent-primary)" }}
                    />
                    Create a team now & invite members
                  </label>
                </div>

                {createTeamNow && (
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="team-name">
                        Team Name
                      </label>
                      <input
                        id="team-name"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Team Alpha"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                      />
                    </div>

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
                  </>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => router.back()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
