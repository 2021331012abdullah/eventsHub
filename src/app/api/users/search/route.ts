import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q");
  const excludeTeamId = request.nextUrl.searchParams.get("excludeTeam");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  let excludeUserIds: string[] = [session.user.id];

  // If excluding a team, get all member IDs
  if (excludeTeamId) {
    const members = await prisma.teamMember.findMany({
      where: { teamId: excludeTeamId },
      select: { userId: true },
    });
    const pendingInvites = await prisma.invitation.findMany({
      where: { teamId: excludeTeamId, status: "PENDING" },
      select: { inviteeId: true },
    });
    excludeUserIds = [
      ...excludeUserIds,
      ...members.map((m) => m.userId),
      ...pendingInvites.map((i) => i.inviteeId),
    ];
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { notIn: excludeUserIds } },
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      institution: true,
    },
    take: 10,
  });

  return NextResponse.json(users);
}
