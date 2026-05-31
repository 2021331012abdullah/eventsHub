import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/ProfileForm";
import "./profile.css";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
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

  if (!user) redirect("/");

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="profile-page animate-fade-in">
          <div className="section-header">
            <div>
              <h1 className="section-title">Your Profile</h1>
              <p className="section-subtitle">
                Manage your personal information
              </p>
            </div>
          </div>
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
