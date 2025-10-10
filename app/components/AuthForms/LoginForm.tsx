"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type LoginFormProps = {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
};

export default function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await onSubmit(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Welcome back</h2>
        <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.85)" }}>
          Log in to continue predicting numbers
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
        <span>Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
        />
      </label>

      <button type="submit" className="primary-button" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Log in"}
      </button>

      <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
        <a href="/forgot-password" style={{ color: "rgba(148, 163, 184, 0.85)" }}>
          Forgot password?
        </a>
        {" · "}
        <a href="/register" style={{ color: "rgba(56, 189, 248, 0.9)" }}>
          Create account
        </a>
      </div>
    </form>
  );
}
