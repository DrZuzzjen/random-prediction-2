"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="card" style={{ padding: 32, textAlign: "center" }}>
        <h2>Check your email</h2>
        <p style={{ color: "rgba(148, 163, 184, 0.85)" }}>
          We sent password reset instructions to <strong>{email}</strong>
        </p>
        <a href="/login" className="secondary-button" style={{ marginTop: 24, display: "inline-block" }}>
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 32 }}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 8 }}>Reset your password</h2>
          <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.85)" }}>
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {error && (
          <div style={{ color: "rgba(248, 113, 113, 0.9)" }}>{error}</div>
        )}

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </label>

        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset link"}
        </button>

        <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
          <a href="/login" style={{ color: "rgba(148, 163, 184, 0.85)" }}>
            Back to login
          </a>
        </div>
      </form>
    </div>
  );
}