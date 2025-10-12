"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

export default function MigrationBanner() {
  const { user } = useAuth();
  const [migrated, setMigrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameCount, setGameCount] = useState<number | null>(null);
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    // Check if there are actually legacy games to migrate
    const checkLegacyGames = async () => {
      if (!user?.email) return;

      try {
        const response = await fetch('/api/auth/check-legacy-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });

        if (response.ok) {
          const data = await response.json();
          if (!data.hasLegacyData || data.gameCount === 0) {
            setShouldShow(false);
          }
        }
      } catch (error) {
        console.error('Failed to check legacy games', error);
      }
    };

    checkLegacyGames();
  }, [user?.email]);

  if (!user || migrated || !shouldShow) return null;

  const handleMigrate = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/migrate-account", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setGameCount(data.migratedGames);
      setMigrated(true);
    } catch (error) {
      console.error("Migration failed:", error);
      alert("Failed to migrate account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (gameCount !== null && migrated) {
    return (
      <div
        className="card"
        style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          padding: 16,
          marginBottom: 24,
        }}
      >
        <strong>✅ Account linked!</strong> We found and linked {gameCount} previous games to your account.
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        background: "rgba(56, 189, 248, 0.1)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        padding: 16,
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <strong>Welcome back!</strong> We found games played with this email before you created an account.
      </div>
      <button
        className="primary-button"
        onClick={handleMigrate}
        disabled={loading}
        style={{ whiteSpace: "nowrap" }}
      >
        {loading ? "Linking..." : "Link old games"}
      </button>
    </div>
  );
}