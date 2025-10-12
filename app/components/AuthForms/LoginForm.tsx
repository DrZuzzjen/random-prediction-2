"use client";

import { useState } from "react";

type LoginFormProps = {
  loginAction: (formData: FormData) => Promise<{ error?: string } | void>;
};

export default function LoginForm({ loginAction }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
      // Success case: server action will redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setIsLoading(false);
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
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isLoading}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={isLoading}
        />
      </label>

      <button
        type="submit"
        className="primary-button"
        disabled={isLoading}
      >
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