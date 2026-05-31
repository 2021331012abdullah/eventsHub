"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  const user = session.user;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link href="/dashboard" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">EventsHub</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link
            href="/dashboard"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/events"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Events
          </Link>
          <Link
            href="/teams"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            My Teams
          </Link>
        </div>

        <div className="navbar-actions">
          <ThemeToggle />
          <div className="user-menu" ref={dropdownRef}>
            <button
              className="user-menu-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="avatar avatar-sm"
                />
              ) : (
                <span className="avatar avatar-sm avatar-fallback">
                  {initials}
                </span>
              )}
              <span className="user-name">{user?.name?.split(" ")[0]}</span>
              <svg
                className={`chevron ${dropdownOpen ? "open" : ""}`}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M6 8L2 4h8L6 8z" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link
                  href="/profile"
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </Link>
                <button
                  className="dropdown-item dropdown-danger"
                  onClick={() => {
                    setDropdownOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </div>
    </nav>
  );
}
