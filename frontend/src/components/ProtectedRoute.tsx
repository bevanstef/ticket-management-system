import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { ReactNode, useEffect } from "react";

interface Props {
  children: ReactNode;
  requiredRole?: "staff" | "customer";
}

export const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--color-primary-dark, #0a1128)",
        color: "#ffffff",
        fontFamily: "inherit"
      }}>
        <p>Loading session…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--color-primary-dark, #0a1128)",
        color: "#ffffff",
        textAlign: "center",
        padding: "2rem"
      }}>
        <h2 style={{ color: "#ef4444", marginBottom: "0.5rem" }}>Access Denied</h2>
        <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
          You need <strong>{requiredRole}</strong> privileges to view this page. You are currently logged in as a <strong>{user.role}</strong>.
        </p>
        <button
          onClick={() => router.push("/")}
          style={{
            background: "linear-gradient(135deg, #0284c7, #38bdf8)",
            color: "#ffffff",
            border: "none",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

