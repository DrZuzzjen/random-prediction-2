"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

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
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="secondary-button"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <span>👤</span>
        <span>{user.email}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 200,
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 12,
            padding: 8,
            zIndex: 100,
          }}
        >
          <a
            href="/my-analytics"
            style={{
              display: "block",
              padding: "8px 12px",
              borderRadius: 8,
              color: "rgba(148, 163, 184, 0.9)",
            }}
          >
            My Analytics
          </a>
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
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}