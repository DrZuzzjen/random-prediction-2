"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "@/app/components/AuthForms/LoginForm";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const redirect = searchParams?.get("redirect") || "/game";
      router.push(redirect);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <div className="card" style={{ padding: 32 }}>
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
