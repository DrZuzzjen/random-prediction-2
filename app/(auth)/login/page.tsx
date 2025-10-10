"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LoginForm from "@/app/components/AuthForms/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to game
      router.push("/game");
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