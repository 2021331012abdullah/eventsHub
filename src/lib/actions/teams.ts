"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTeam(
  eventId: string,
  name: string,
  visibility: "PUBLIC" | "PRIVATE"
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  // Check event exists
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found");

  // For private events, force team visibility to PRIVATE
  const finalVisibility = event.privacy === "PRIVATE" ? "PRIVATE" : visibility;

  // Check user doesn't already have a team for this event
  const existingMembership = await prisma.teamMember.findFirst({
    where: {
      userId: session.user.id,
      team: { eventId },
    },
  });
  if (existingMembership) {
    throw new Error("You already belong to a team in this event");
  }

  const team = await prisma.team.create({
    data: {
      name,
      eventId,
      creatorId: session.user.id,
      visibility: finalVisibility,
      members: {
        create: {
          userId: session.user.id,
          role: "LEADER",
        },
      },
    },
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/teams");
  return { success: true, teamId: team.id };
}

export async function leaveTeam(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const membership = await prisma.teamMember.findFirst({
    where: { teamId, userId: session.user.id },
    include: { team: true },
  });

  if (!membership) throw new Error("Not a member of this team");

  // If leader and only member, delete the team
  if (membership.role === "LEADER") {
    const memberCount = await prisma.teamMember.count({ where: { teamId } });
    if (memberCount === 1) {
      await prisma.team.delete({ where: { id: teamId } });
      revalidatePath(`/events/${membership.team.eventId}`);
      revalidatePath("/teams");
      return { success: true, deleted: true };
    }
    // Transfer leadership to another member
    const nextMember = await prisma.teamMember.findFirst({
      where: { teamId, userId: { not: session.user.id } },
    });
    if (nextMember) {
      await prisma.teamMember.update({
        where: { id: nextMember.id },
        data: { role: "LEADER" },
      });
    }
  }

  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId, userId: session.user.id } },
  });

  revalidatePath(`/events/${membership.team.eventId}`);
  revalidatePath("/teams");
  return { success: true, deleted: false };
}

export async function removeFromTeam(teamId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  // Verify requester is team leader
  const leaderMembership = await prisma.teamMember.findFirst({
    where: { teamId, userId: session.user.id, role: "LEADER" },
    include: { team: true },
  });
  if (!leaderMembership) throw new Error("Not authorized");

  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId, userId } },
  });

  // Also remove any pending invitations
  await prisma.invitation.deleteMany({
    where: { teamId, inviteeId: userId },
  });

  revalidatePath(`/events/${leaderMembership.team.eventId}`);
  revalidatePath(`/events/${leaderMembership.team.eventId}/teams/${teamId}`);
  return { success: true };
}

export async function getMyTeams() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.teamMember.findMany({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          event: { select: { id: true, name: true, date: true, privacy: true } },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });
}

export async function getTeamDetail(teamId: string) {
  const session = await auth();

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      event: { select: { id: true, name: true, date: true, privacy: true } },
      creator: { select: { id: true, name: true, image: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, image: true, institution: true } },
        },
        orderBy: { role: "asc" },
      },
      invitations: {
        where: { status: "PENDING" },
        include: {
          invitee: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (!team) return null;

  // Check visibility
  if (team.visibility === "PRIVATE") {
    // Only team members can see private teams
    const isMember = team.members.some((m) => m.userId === session?.user?.id);
    const isCreator = team.creatorId === session?.user?.id;
    if (!isMember && !isCreator) return null;
  }

  return team;
}
