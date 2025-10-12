"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import RegisterForm from "@/app/components/AuthForms/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [legacyData, setLegacyData] = useState<{
    hasLegacyData: boolean;
    gameCount: number;
    leaderboardEntry: any;
  } | null>(null);

  const handleRegister = async (email: string, password: string, name: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,  // Store name in user metadata
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Show email confirmation message
      setCheckEmail(true);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  if (checkEmail) {
    return (
      <div className="card" style={{ padding: 32 }}>
        <div style={{ textAlign: "center" }}>
          <h2>Check your email</h2>
          <p style={{ color: "rgba(148, 163, 184, 0.85)" }}>
            We sent you a confirmation link. Click it to verify your account and start playing!
          </p>
          <a href="/login" className="primary-button" style={{ marginTop: 24, display: "inline-block" }}>
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 32 }}>
      <RegisterForm 
        onSubmit={handleRegister} 
        isLoading={isLoading} 
        onLegacyDataDetected={setLegacyData}
      />
    </div>
  );
}