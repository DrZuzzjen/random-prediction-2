import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Random Prediction",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        {children}
      </div>
    </main>
  );
}