import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

import { uploadImageFromUrl } from "@/lib/cloudinary";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        let image = profile.picture;

        // Check if there is no custom picture
        const isGoogleDefault =
          !image ||
          (image.includes("googleusercontent.com") &&
            image.includes("/a/") &&
            !image.includes("/a-")) ||
          image.includes("default-user-pic");

        if (isGoogleDefault) {
          try {
            const seed = encodeURIComponent(
              profile.email || profile.sub || "eventshub"
            );
            const avatarUrl = `https://api.dicebear.com/9.x/lorelei/png?seed=${seed}`;
            image = await uploadImageFromUrl(avatarUrl);
          } catch (error) {
            console.error("Failed to generate and upload default avatar:", error);
          }
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: image,
        };
      },
    }),
  ],
});
export { auth as default };
