import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Random Prediction Game",
  description: "Predict numbers, track analytics, and compete on the leaderboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
