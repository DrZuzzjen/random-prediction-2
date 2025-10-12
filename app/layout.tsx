import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import UserMenu from "./components/UserMenu";

export const metadata: Metadata = {
  title: "Random Prediction Game",
  description: "Predict numbers, track analytics, and compete on the leaderboard",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <nav
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <a href="/" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              🎯 Random Prediction
            </a>
            <UserMenu />
          </nav>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
