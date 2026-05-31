"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;
  const time = (formData.get("time") as string) || null;
  const durationRaw = formData.get("duration") as string;
  const durationMinutes = durationRaw ? parseInt(durationRaw) : null;
  const website = (formData.get("website") as string) || null;
  const privacy = formData.get("privacy") as "PUBLIC" | "PRIVATE";

  if (!name || !date) {
    throw new Error("Name and date are required");
  }

  const event = await prisma.event.create({
    data: {
      name,
      description: description || null,
      date: new Date(date),
      time,
      durationMinutes,
      website,
      privacy,
      creatorId: session.user.id,
    },
  });

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return { success: true, eventId: event.id };
}

export async function updateEvent(eventId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.creatorId !== session.user.id) {
    throw new Error("Not authorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;
  const time = (formData.get("time") as string) || null;
  const durationRaw = formData.get("duration") as string;
  const durationMinutes = durationRaw ? parseInt(durationRaw) : null;
  const website = (formData.get("website") as string) || null;
  const privacy = formData.get("privacy") as "PUBLIC" | "PRIVATE";

  await prisma.event.update({
    where: { id: eventId },
    data: {
      name,
      description: description || null,
      date: new Date(date),
      time,
      durationMinutes,
      website,
      privacy,
    },
  });

  // If event becomes PRIVATE, force all teams to PRIVATE
  if (privacy === "PRIVATE") {
    await prisma.team.updateMany({
      where: { eventId },
      data: { visibility: "PRIVATE" },
    });
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.creatorId !== session.user.id) {
    throw new Error("Not authorized");
  }

  await prisma.event.delete({ where: { id: eventId } });

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getPublicEvents(search?: string) {
  const where: Record<string, unknown> = { privacy: "PUBLIC" as const };
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  return prisma.event.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, image: true } },
      _count: { select: { teams: true } },
    },
    orderBy: { date: "asc" },
  });
}

export async function getMyEvents() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.event.findMany({
    where: { creatorId: session.user.id },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      _count: { select: { teams: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEvent(eventId: string) {
  const session = await auth();
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      teams: {
        include: {
          creator: { select: { id: true, name: true, image: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
          _count: { select: { members: true } },
        },
      },
    },
  });

  if (!event) return null;

  // For private events, only the creator can see it
  if (event.privacy === "PRIVATE" && event.creatorId !== session?.user?.id) {
    // Check if the user is a member of any team in this event
    if (session?.user?.id) {
      const membership = await prisma.teamMember.findFirst({
        where: {
          userId: session.user.id,
          team: { eventId },
        },
      });
      if (!membership) return null;
    } else {
      return null;
    }
  }

  return event;
}
