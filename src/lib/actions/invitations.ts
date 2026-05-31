"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendInvitation(teamId: string, inviteeId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  // Can't invite yourself
  if (inviteeId === session.user.id) {
    throw new Error("Cannot invite yourself");
  }

  // Verify inviter is team leader or member
  const membership = await prisma.teamMember.findFirst({
    where: { teamId, userId: session.user.id },
    include: { team: true },
  });
  if (!membership) throw new Error("Not a member of this team");

  // Check invitee isn't already in a team for this event
  const existingMembership = await prisma.teamMember.findFirst({
    where: {
      userId: inviteeId,
      team: { eventId: membership.team.eventId },
    },
  });
  if (existingMembership) {
    throw new Error("User already belongs to a team in this event");
  }

  // Check for existing pending invitation
  const existingInvitation = await prisma.invitation.findUnique({
    where: { teamId_inviteeId: { teamId, inviteeId } },
  });
  if (existingInvitation) {
    if (existingInvitation.status === "PENDING") {
      throw new Error("Invitation already pending");
    }
    // If previously declined, update to pending
    await prisma.invitation.update({
      where: { id: existingInvitation.id },
      data: { status: "PENDING", inviterId: session.user.id },
    });
    revalidatePath("/dashboard");
    return { success: true };
  }

  await prisma.invitation.create({
    data: {
      teamId,
      inviterId: session.user.id,
      inviteeId,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function acceptInvitation(invitationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { team: true },
  });

  if (!invitation || invitation.inviteeId !== session.user.id) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Invitation is no longer pending");
  }

  // Check user doesn't already belong to a team for this event
  const existingMembership = await prisma.teamMember.findFirst({
    where: {
      userId: session.user.id,
      team: { eventId: invitation.team.eventId },
    },
  });
  if (existingMembership) {
    throw new Error("You already belong to a team in this event");
  }

  // Accept: update invitation + add as team member
  await prisma.$transaction([
    prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" },
    }),
    prisma.teamMember.create({
      data: {
        teamId: invitation.teamId,
        userId: session.user.id,
        role: "MEMBER",
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/teams");
  revalidatePath(`/events/${invitation.team.eventId}`);
  return { success: true };
}

export async function declineInvitation(invitationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation || invitation.inviteeId !== session.user.id) {
    throw new Error("Invitation not found");
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "DECLINED" },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getPendingInvitations() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.invitation.findMany({
    where: {
      inviteeId: session.user.id,
      status: "PENDING",
    },
    include: {
      team: {
        include: {
          event: { select: { id: true, name: true, date: true } },
        },
      },
      inviter: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
