"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
      padding: "12px 24px"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* Logo/Brand */}
        <a
          href="/"
          style={{
            textDecoration: "none",
            fontWeight: "700",
            fontSize: "18px",
            color: "#f5f7fa"
          }}
        >
          🎯 Random Prediction
        </a>

        {/* Desktop Navigation */}
        <div style={{
          display: "flex",
          gap: "32px",
          alignItems: "center"
        }}>
          <a
            href="/"
            style={{
              textDecoration: "none",
              color: "rgba(148, 163, 184, 0.9)",
              fontWeight: "500",
              transition: "color 0.2s ease"
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.color = "#38bdf8"}
            onMouseOut={(e) => (e.target as HTMLElement).style.color = "rgba(148, 163, 184, 0.9)"}
          >
            Game
          </a>
          <a
            href="/analytics"
            style={{
              textDecoration: "none",
              color: "rgba(148, 163, 184, 0.9)",
              fontWeight: "500",
              transition: "color 0.2s ease"
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.color = "#38bdf8"}
            onMouseOut={(e) => (e.target as HTMLElement).style.color = "rgba(148, 163, 184, 0.9)"}
          >
            Analytics
          </a>
          {user && (
            <a
              href="/my-analytics"
              style={{
                textDecoration: "none",
                color: "rgba(148, 163, 184, 0.9)",
                fontWeight: "500",
                transition: "color 0.2s ease"
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.color = "#38bdf8"}
              onMouseOut={(e) => (e.target as HTMLElement).style.color = "rgba(148, 163, 184, 0.9)"}
            >
              My Analytics
            </a>
          )}
        </div>

        {/* Auth Links */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {loading ? (
            <div style={{ color: "rgba(148, 163, 184, 0.8)" }}>...</div>
          ) : user ? (
            <>
              <span style={{
                color: "rgba(148, 163, 184, 0.9)",
                fontWeight: "500"
              }}>
                Welcome, {user.email?.split('@')[0]}
              </span>
              <button 
                onClick={signOut}
                style={{ 
                  textDecoration: "none", 
                  backgroundColor: "transparent",
                  color: "rgba(148, 163, 184, 0.8)",
                  fontWeight: "500",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                  (e.target as HTMLElement).style.color = "rgb(239, 68, 68)";
                  (e.target as HTMLElement).style.borderColor = "rgba(239, 68, 68, 0.3)";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "transparent";
                  (e.target as HTMLElement).style.color = "rgba(148, 163, 184, 0.8)";
                  (e.target as HTMLElement).style.borderColor = "rgba(148, 163, 184, 0.3)";
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                style={{
                  textDecoration: "none",
                  color: "rgba(148, 163, 184, 0.9)",
                  fontWeight: "500",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "rgba(56, 189, 248, 0.1)";
                  (e.target as HTMLElement).style.color = "#38bdf8";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "transparent";
                  (e.target as HTMLElement).style.color = "rgba(148, 163, 184, 0.9)";
                }}
              >
                Login
              </a>
              <a
                href="/register"
                style={{
                  textDecoration: "none",
                  background: "linear-gradient(135deg, #38bdf8, #a855f7)",
                  color: "white",
                  fontWeight: "600",
                  padding: "8px 20px",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 12px rgba(56, 189, 248, 0.3)"
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLElement).style.transform = "translateY(-2px)";
                  (e.target as HTMLElement).style.boxShadow = "0 6px 16px rgba(56, 189, 248, 0.4)";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLElement).style.transform = "translateY(0)";
                  (e.target as HTMLElement).style.boxShadow = "0 4px 12px rgba(56, 189, 248, 0.3)";
                }}
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}