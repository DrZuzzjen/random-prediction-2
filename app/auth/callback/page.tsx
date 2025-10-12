"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "migrating" | "success" | "error">("loading");
  const [migratedGames, setMigratedGames] = useState<number>(0);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from Supabase (both signup and login)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          setStatus("error");
          return;
        }

        const user = data.session?.user;
        if (!user?.email) {
          // Try to handle URL hash params for auth tokens
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          if (hashParams.get('access_token')) {
            // Wait a bit for Supabase to process the tokens
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            return;
          }
          
          router.push("/login");
          return;
        }

        // Check if user has legacy games to migrate
        setStatus("migrating");
        
        try {
          const checkResponse = await fetch('/api/auth/check-legacy-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email }),
          });

          if (checkResponse.ok) {
            const legacyData = await checkResponse.json();
            
            if (legacyData.hasLegacyData && legacyData.gameCount > 0) {
              // User has legacy games - migrate them with retry logic
              let migrationSuccess = false;
              let retries = 3;
              
              for (let i = 0; i < retries && !migrationSuccess; i++) {
                try {
                  const migrateResponse = await fetch("/api/auth/migrate-account", {
                    method: "POST",
                  });

                  if (migrateResponse.ok) {
                    const migrateData = await migrateResponse.json();
                    setMigratedGames(migrateData.migratedGames || legacyData.gameCount);
                    setStatus("success");
                    migrationSuccess = true;
                    
                    // Redirect to game after showing success message
                    setTimeout(() => {
                      window.location.href = "/game";
                    }, 3000);
                    return;
                  } else if (migrateResponse.status === 401 && i < retries - 1) {
                    // Still not authenticated, wait and retry
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                  } else {
                    throw new Error(`Migration failed: ${migrateResponse.status}`);
                  }
                } catch (retryError) {
                  if (i === retries - 1) {
                    throw retryError;
                  }
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            }
          }
        } catch (migrationError) {
          console.error("Migration failed:", migrationError);
          // Continue to game even if migration fails
        }

        // No legacy games or migration failed - go straight to game
        window.location.href = "/game";
        
      } catch (error) {
        console.error("Callback handling failed:", error);
        setStatus("error");
      }
    };

    handleAuthCallback();
  }, [router]);

  if (status === "loading") {
    return (
      <div className="card" style={{ padding: 32, textAlign: "center" }}>
        <div style={{ marginBottom: 16 }}>
          <div className="spinner" style={{ 
            width: 32, 
            height: 32, 
            border: "3px solid rgba(56, 189, 248, 0.3)",
            borderTop: "3px solid rgba(56, 189, 248, 0.9)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }} />
        </div>
        <h2>Verifying your account...</h2>
        <p style={{ color: "rgba(148, 163, 184, 0.85)" }}>
          Please wait while we set up your account.
        </p>
      </div>
    );
  }

  if (status === "migrating") {
    return (
      <div className="card" style={{ padding: 32, textAlign: "center" }}>
        <div style={{ marginBottom: 16 }}>
          <div className="spinner" style={{ 
            width: 32, 
            height: 32, 
            border: "3px solid rgba(16, 185, 129, 0.3)",
            borderTop: "3px solid rgba(16, 185, 129, 0.9)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }} />
        </div>
        <h2>🎉 Welcome back!</h2>
        <p style={{ color: "rgba(148, 163, 184, 0.85)" }}>
          We're linking your previous games to your new account...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="card" style={{ padding: 32, textAlign: "center" }}>
        <div style={{ 
          fontSize: "3rem", 
          marginBottom: 16,
          filter: "hue-rotate(120deg)"
        }}>
          🎯
        </div>
        <h2>Account setup complete!</h2>
        <p style={{ color: "rgba(16, 185, 129, 0.9)", marginBottom: 16 }}>
          <strong>✅ Successfully linked {migratedGames} previous game{migratedGames !== 1 ? 's' : ''} to your account!</strong>
        </p>
        <p style={{ color: "rgba(148, 163, 184, 0.85)" }}>
          Redirecting you to the game...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="card" style={{ padding: 32, textAlign: "center" }}>
        <h2>Something went wrong</h2>
        <p style={{ color: "rgba(248, 113, 113, 0.9)", marginBottom: 16 }}>
          There was an error setting up your account.
        </p>
        <a href="/login" className="primary-button">
          Try logging in
        </a>
      </div>
    );
  }

  return null;
}

// Add CSS animation for spinner
const styles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}