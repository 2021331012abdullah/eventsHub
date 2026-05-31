"use client";

import { acceptInvitation, declineInvitation } from "@/lib/actions/invitations";
import { useState } from "react";

export default function InvitationActions({
  invitationId,
}: {
  invitationId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<"accepted" | "declined" | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await acceptInvitation(invitationId);
      setDone("accepted");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to accept");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await declineInvitation(invitationId);
      setDone("declined");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to decline");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <span
        className={`badge ${
          done === "accepted" ? "badge-public" : "badge-private"
        }`}
      >
        {done === "accepted" ? "✓ Accepted" : "✗ Declined"}
      </span>
    );
  }

  return (
    <div className="invitation-actions">
      <button
        className="btn btn-primary btn-sm"
        onClick={handleAccept}
        disabled={loading}
      >
        {loading ? "..." : "Accept"}
      </button>
      <button
        className="btn btn-ghost btn-sm"
        onClick={handleDecline}
        disabled={loading}
      >
        Decline
      </button>
    </div>
  );
}
