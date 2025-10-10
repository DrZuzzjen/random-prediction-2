"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "@/app/components/AuthForms/RegisterForm";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleRegister = async (email: string, password: string, name: string) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/game`,
        },
      });

      if (error) {
        throw error;
      }

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
      <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
    </div>
  );
}
