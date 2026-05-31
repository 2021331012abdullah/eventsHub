"use client";

import { useState, useEffect, useRef } from "react";

type SearchUser = {
  id: string;
  name: string | null;
  image: string | null;
  email?: string | null;
  institution?: string | null;
};

export default function UserSearchInput({
  selectedUsers,
  onSelect,
  onRemove,
  excludeTeamId,
}: {
  selectedUsers: SearchUser[];
  onSelect: (user: SearchUser) => void;
  onRemove: (userId: string) => void;
  excludeTeamId?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query });
        if (excludeTeamId) params.set("excludeTeam", excludeTeamId);
        const res = await fetch(`/api/users/search?${params}`);
        const data = await res.json();
        // Filter out already selected users
        const filtered = data.filter(
          (u: SearchUser) => !selectedUsers.some((s) => s.id === u.id)
        );
        setResults(filtered);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query, excludeTeamId, selectedUsers]);

  const handleSelect = (user: SearchUser) => {
    onSelect(user);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div className="user-search-wrapper" ref={wrapperRef}>
      <input
        type="text"
        className="form-input"
        placeholder="Search by name or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
      />

      {showDropdown && (
        <div className="search-dropdown">
          {loading ? (
            <div className="search-loading">
              <div className="spinner" /> Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((user) => (
              <button
                key={user.id}
                className="search-result-item"
                onClick={() => handleSelect(user)}
                type="button"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className="avatar avatar-sm"
                  />
                ) : (
                  <span className="avatar avatar-sm avatar-fallback">
                    {user.name?.[0] || "?"}
                  </span>
                )}
                <div className="search-result-info">
                  <span className="search-result-name">
                    {user.name || "Unknown"}
                  </span>
                  {user.institution && (
                    <span className="search-result-sub">
                      {user.institution}
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="search-empty">No users found</div>
          )}
        </div>
      )}

      {selectedUsers.length > 0 && (
        <div className="selected-users">
          {selectedUsers.map((user) => (
            <div key={user.id} className="selected-user-chip">
              {user.image ? (
                <img
                  src={user.image}
                  alt=""
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : null}
              <span>{user.name || "Unknown"}</span>
              <button
                type="button"
                className="chip-remove"
                onClick={() => onRemove(user.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .user-search-wrapper {
          position: relative;
        }
        .search-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          max-height: 240px;
          overflow-y: auto;
          z-index: 50;
          box-shadow: var(--shadow-lg);
        }
        .search-result-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          width: 100%;
          padding: var(--space-sm) var(--space-md);
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          transition: background var(--transition-fast);
          text-align: left;
        }
        .search-result-item:hover {
          background: var(--bg-glass-hover);
        }
        .search-result-info {
          display: flex;
          flex-direction: column;
        }
        .search-result-name {
          font-size: var(--font-size-sm);
          font-weight: 500;
        }
        .search-result-sub {
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
        }
        .search-loading,
        .search-empty {
          padding: var(--space-md);
          text-align: center;
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
        }
        .selected-users {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          margin-top: var(--space-sm);
        }
        .selected-user-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(108, 99, 255, 0.12);
          border: 1px solid rgba(108, 99, 255, 0.25);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          color: var(--accent-primary-light);
        }
        .chip-remove {
          background: none;
          border: none;
          color: var(--accent-primary-light);
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          padding: 0;
          opacity: 0.7;
        }
        .chip-remove:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
