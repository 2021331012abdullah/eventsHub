import { auth } from "@/lib/auth";
import { createTeam } from "@/lib/actions/teams";
import { sendInvitation } from "@/lib/actions/invitations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { eventId, name, visibility, inviteUserIds } = await request.json();

    if (!eventId || !name) {
      return NextResponse.json(
        { error: "Event ID and team name are required" },
        { status: 400 }
      );
    }

    const result = await createTeam(eventId, name, visibility || "PUBLIC");

    // Send invitations to selected users
    if (inviteUserIds && inviteUserIds.length > 0 && result.teamId) {
      for (const userId of inviteUserIds) {
        try {
          await sendInvitation(result.teamId, userId);
        } catch (err) {
          console.error(`Failed to invite user ${userId}:`, err);
        }
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create team" },
      { status: 400 }
    );
  }
}
