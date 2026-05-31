import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import "./landing.css";

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="landing">
      {/* Animated background */}
      <div className="landing-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>

      {/* Floating Header */}
      <header className="landing-header">
        <div className="container landing-header-inner">
          <div className="landing-logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">EventsHub</span>
          </div>
          <div className="landing-header-actions">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero container">
        <div className="hero-grid">
          {/* Left Column: Copy & Call-to-action */}
          <div className="hero-copy animate-slide-up">
            <div className="landing-badge">
              <span className="badge-dot" />
              Next-Gen Team Formations
            </div>
            <h1 className="landing-title">
              Create Events.
              <br />
              <span className="title-gradient">Build Teams.</span>
              <br />
              Invite People.
            </h1>
            <p className="landing-description">
              The ultimate platform for team-based event management. Form teams,
              invite collaborators with fine-grained privacy controls, and discover public events happening around you.
            </p>

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
              className="cta-form"
            >
              <button type="submit" className="google-btn" id="google-sign-in">
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign In with Google
              </button>
            </form>

            <div className="hero-stats">
              <div className="stat-card">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Events Created</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">50k+</span>
                <span className="stat-label">Teams Built</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Reliability</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Mockup / Interactive Sandbox */}
          <div className="hero-visual animate-fade-in stagger-2">
            <div className="preview-container glass-card">
              <div className="preview-header">
                <span className="badge badge-public">🌐 Public Event</span>
                <div className="preview-dots">
                  <span className="p-dot" />
                  <span className="p-dot" />
                  <span className="p-dot" />
                </div>
              </div>

              <h3 className="preview-title">Global Hackathon 2026</h3>
              <p className="preview-desc">Form teams of 4 to design future city infrastructure.</p>

              <div className="preview-divider" />

              <div className="preview-team">
                <div className="team-meta">
                  <span className="team-name">🏆 Team Antigravity</span>
                  <span className="badge badge-leader">3 / 4 members</span>
                </div>

                <div className="preview-members">
                  <div className="member-row">
                    <img src="https://api.dicebear.com/9.x/lorelei/png?seed=Sarah" alt="" className="avatar avatar-sm" />
                    <div className="member-info">
                      <span className="m-name">Sarah Jenkins</span>
                      <span className="m-inst">MIT Tech</span>
                    </div>
                    <span className="badge badge-leader">Leader</span>
                  </div>
                  <div className="member-row">
                    <img src="https://api.dicebear.com/9.x/lorelei/png?seed=Alex" alt="" className="avatar avatar-sm" />
                    <div className="member-info">
                      <span className="m-name">Alex Rivera</span>
                      <span className="m-inst">Stanford Univ</span>
                    </div>
                    <span className="badge badge-public">Joined</span>
                  </div>
                  <div className="member-row status-invited">
                    <img src="https://api.dicebear.com/9.x/lorelei/png?seed=Daniel" alt="" className="avatar avatar-sm" />
                    <div className="member-info">
                      <span className="m-name">Daniel Chen</span>
                      <span className="m-inst">Pending invite...</span>
                    </div>
                    <span className="badge badge-pending">Invited</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="landing-features-section container">
        <div className="section-title-wrapper">
          <h2 className="section-title">Built for Collaboration</h2>
          <p className="section-subtitle">Everything you need to organize events and build perfect project teams</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-card-icon">📅</div>
            <h3>Event Hubs</h3>
            <p>Create public or private event hubs with date, time, and custom website links. Manage everything from one dashboard.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-card-icon">👥</div>
            <h3>Structured Teams</h3>
            <p>Users can build teams for public events and display member lists publicly. Or keep team formations private for confidential events.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-card-icon">✉️</div>
            <h3>Smart Invitations</h3>
            <p>Invite users to your team directly via Google OAuth linked handles. Manage pending invites, acceptance states, and roles instantly.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container footer-inner">
          <div className="footer-logo">
            <span className="logo-icon">⚡</span>
            <span>EventsHub © 2026</span>
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
