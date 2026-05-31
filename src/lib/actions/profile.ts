"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const name = formData.get("name") as string;
  const institution = formData.get("institution") as string;
  const bio = formData.get("bio") as string;
  const imageFile = formData.get("image") as File | null;

  let imageUrl: string | undefined;

  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    imageUrl = await uploadImage(buffer, "eventshub/avatars");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name || undefined,
      institution: institution || null,
      bio: bio || null,
      ...(imageUrl && { image: imageUrl }),
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      institution: true,
      bio: true,
    },
  });
}
