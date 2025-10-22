"use client";

import { useState } from "react";

type RegisterFormProps = {
  onSubmit: (email: string, password: string, name: string) => Promise<void>;
  isLoading: boolean;
  onLegacyDataDetected?: (legacyData: any) => void;
};

export default function RegisterForm({ onSubmit, isLoading, onLegacyDataDetected }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [legacyData, setLegacyData] = useState<{
    hasLegacyData: boolean;
    gameCount: number;
    leaderboardEntry: any;
  } | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await onSubmit(email, password, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const checkLegacyEmail = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) return;

    setCheckingEmail(true);
    try {
      const response = await fetch('/api/auth/check-legacy-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck }),
      });

      if (response.ok) {
        const data = await response.json();
        setLegacyData(data);
        if (onLegacyDataDetected) {
          onLegacyDataDetected(data);
        }
      }
    } catch (error) {
      console.error('Failed to check legacy email', error);
    } finally {
      setCheckingEmail(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Create your account</h2>
        <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.85)" }}>
          Start tracking your predictions and compete on the leaderboard
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(248, 113, 113, 0.5)",
            background: "rgba(248, 113, 113, 0.1)",
            color: "rgba(248, 113, 113, 0.9)",
          }}
        >
          {error}
        </div>
      )}

      <label style={{ display: "grid", gap: 6 }}>
        <span>Name</span>
        <input
          type="text"
          required
          maxLength={50}
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={(e) => checkLegacyEmail(e.target.value)}
          disabled={isLoading}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Password</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Confirm password</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />
      </label>

      <button
        type="submit"
        className="primary-button"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>

      <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
        Already have an account?{" "}
        <a href="/login" style={{ color: "rgba(56, 189, 248, 0.9)" }}>
          Log in
        </a>
      </div>
    </form>
  );
}