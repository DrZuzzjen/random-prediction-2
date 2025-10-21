"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!user) {
    return (
      <div style={{ display: "flex", gap: 12 }}>
        <a href="/login" className="secondary-button">
          Log in
        </a>
        <a href="/register" className="primary-button">
          Sign up
        </a>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="secondary-button"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <span>👤</span>
        <span>{user.email?.split('@')[0] || user.email}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 220,
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 12,
            padding: 8,
            zIndex: 100,
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
              marginBottom: 4,
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "rgba(148, 163, 184, 0.7)" }}>
              Signed in as
            </div>
            <div style={{ fontSize: "0.9rem", color: "rgba(148, 163, 184, 0.95)", marginTop: 2 }}>
              {user.email}
            </div>
          </div>

          <a
            href="/game"
            style={{
              display: "block",
              padding: "8px 12px",
              borderRadius: 8,
              color: "rgba(148, 163, 184, 0.9)",
              textDecoration: "none",
              transition: "background 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            🎯 Play Game
          </a>

          <a
            href="/my-analytics"
            style={{
              display: "block",
              padding: "8px 12px",
              borderRadius: 8,
              color: "rgba(148, 163, 184, 0.9)",
              textDecoration: "none",
              transition: "background 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            📊 My Stats
          </a>

          <a
            href="/analytics"
            style={{
              display: "block",
              padding: "8px 12px",
              borderRadius: 8,
              color: "rgba(148, 163, 184, 0.9)",
              textDecoration: "none",
              transition: "background 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            📈 Global Analytics
          </a>

          <div style={{ height: 1, background: "rgba(148, 163, 184, 0.1)", margin: "4px 0" }} />

          <button
            onClick={handleSignOut}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              borderRadius: 8,
              background: "transparent",
              border: "none",
              color: "rgba(248, 113, 113, 0.9)",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            🚪 Sign out
          </button>
        </div>
      )}
    </div>
  );
}