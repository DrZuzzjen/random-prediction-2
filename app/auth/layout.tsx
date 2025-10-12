export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: 16
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {children}
      </div>
    </div>
  );
}