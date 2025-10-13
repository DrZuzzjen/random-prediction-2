"use client";

import { useRouter } from "next/navigation";

type AuthRequiredModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthRequiredModal({ isOpen, onClose }: AuthRequiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignUp = () => {
    router.push('/register?from=game');
  };

  const handleLogin = () => {
    router.push('/login?from=game');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          zIndex: 9998,
          animation: "fadeIn 0.2s ease-out"
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          width: "min(500px, 90vw)",
          animation: "slideUp 0.3s ease-out"
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "24px",
            padding: "40px 32px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(56, 189, 248, 0.15)",
            position: "relative"
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(148, 163, 184, 0.1)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(148, 163, 184, 0.8)",
              fontSize: "18px",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              (e.currentTarget).style.backgroundColor = "rgba(148, 163, 184, 0.2)";
              (e.currentTarget).style.color = "#f5f7fa";
            }}
            onMouseOut={(e) => {
              (e.currentTarget).style.backgroundColor = "rgba(148, 163, 184, 0.1)";
              (e.currentTarget).style.color = "rgba(148, 163, 184, 0.8)";
            }}
          >
            ✕
          </button>

          {/* Icon */}
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 24px",
              background: "linear-gradient(135deg, #38bdf8, #a855f7)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              boxShadow: "0 8px 24px rgba(56, 189, 248, 0.3)"
            }}
          >
            🔒
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              textAlign: "center",
              margin: "0 0 16px 0",
              background: "linear-gradient(135deg, #38bdf8, #a855f7)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: "1.2"
            }}
          >
            Sign Up to Play!
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "rgba(148, 163, 184, 0.95)",
              textAlign: "center",
              margin: "0 0 32px 0",
              maxWidth: "400px",
              marginLeft: "auto",
              marginRight: "auto"
            }}
          >
            To protect the integrity of our leaderboards and ensure fair play, we require all players to create a free account.
            This helps us prevent spam and keep your stats secure!
          </p>

          {/* Benefits list */}
          <div
            style={{
              background: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "32px"
            }}
          >
            <div style={{ fontSize: "14px", color: "rgba(148, 163, 184, 0.9)" }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "18px" }}>✨</span>
                <span>Track your performance over time</span>
              </div>
              <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "18px" }}>🏆</span>
                <span>Compete on the global leaderboard</span>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={{ fontSize: "18px" }}>📊</span>
                <span>Access detailed analytics and insights</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "16px"
            }}
          >
            {/* Sign Up - Primary */}
            <button
              onClick={handleSignUp}
              style={{
                flex: 1,
                padding: "14px 24px",
                fontSize: "16px",
                fontWeight: "600",
                color: "white",
                background: "linear-gradient(135deg, #38bdf8, #a855f7)",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(56, 189, 248, 0.4)",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                (e.currentTarget).style.transform = "translateY(-2px)";
                (e.currentTarget).style.boxShadow = "0 6px 20px rgba(56, 189, 248, 0.5)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget).style.transform = "translateY(0)";
                (e.currentTarget).style.boxShadow = "0 4px 16px rgba(56, 189, 248, 0.4)";
              }}
            >
              Create Free Account
            </button>
          </div>

          {/* Login link */}
          <div
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "rgba(148, 163, 184, 0.8)"
            }}
          >
            Already have an account?{" "}
            <button
              onClick={handleLogin}
              style={{
                background: "none",
                border: "none",
                color: "#38bdf8",
                fontWeight: "600",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "14px",
                padding: 0
              }}
              onMouseOver={(e) => (e.currentTarget).style.color = "#a855f7"}
              onMouseOut={(e) => (e.currentTarget).style.color = "#38bdf8"}
            >
              Log in
            </button>
          </div>
        </div>

        {/* Add CSS animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, -45%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}</style>
      </div>
    </>
  );
}
