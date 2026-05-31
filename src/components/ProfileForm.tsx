"use client";

import { updateProfile } from "@/lib/actions/profile";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  institution: string | null;
  bio: string | null;
};

export default function ProfileForm({ user }: { user: User }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(user.image);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData(e.currentTarget);
      await updateProfile(formData);
      setMessage("Profile updated successfully!");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="profile-card">
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper" onClick={handleImageClick}>
            {preview ? (
              <img
                src={preview}
                alt={user.name || "Avatar"}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-fallback">{initials || "?"}</div>
            )}
            <div className="avatar-overlay">📷 Change</div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          <span className="profile-email">{user.email}</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Display Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-input"
            defaultValue={user.name || ""}
            placeholder="Your name"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="institution">
            Institution
          </label>
          <input
            id="institution"
            name="institution"
            type="text"
            className="form-input"
            defaultValue={user.institution || ""}
            placeholder="University, company, or organization"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bio">
            Short Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            className="form-textarea"
            defaultValue={user.bio || ""}
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>

        <div className="profile-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && <span className="save-message">{message}</span>}
        </div>
      </form>
    </div>
  );
}
