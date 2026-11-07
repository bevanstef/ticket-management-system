// src/pages/register.tsx
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Login.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustomLogo, setUseCustomLogo] = useState(true);

  // If already logged in, redirect to home
  if (!loading && user) {
    router.replace("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError("Please enter a username.");
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(cleanUsername, password);
      router.replace("/");
    } catch (err: any) {
      setError(err.message ?? "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p style={{ color: "#38bdf8", fontWeight: 500 }}>Initializing application...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sign Up | Ticket Management System</title>
        <meta name="description" content="Create a new customer account to book tickets" />
      </Head>

      <div className={styles.container}>
        {/* Ambient atmospheric glows */}
        <div className={styles.ambientGlowTop} />
        <div className={styles.ambientGlowBottom} />

        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logoWrapper}>
              {useCustomLogo ? (
                <img
                  src="/logo5.png"
                  alt="Ticket System Logo"
                  className={styles.customLogo}
                  onError={() => setUseCustomLogo(false)}
                />
              ) : (
                <div className={styles.svgFallbackWrapper}>
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="M13 5v2" />
                    <path d="M13 17v2" />
                    <path d="M13 11v2" />
                  </svg>
                </div>
              )}
            </div>

            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>Sign up to purchase and manage your tickets</p>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="reg-username" className={styles.label}>
                Username
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="reg-username"
                  type="text"
                  placeholder="Choose a username (min 3 chars)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className={styles.input}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="reg-password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="reg-password"
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={styles.input}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="reg-confirm-password" className={styles.label}>
                Confirm Password
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </span>
                <input
                  id="reg-confirm-password"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className={styles.input}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              {isSubmitting ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Register & Continue</span>
              )}
            </button>
          </form>

          <p className={styles.switchAuthText}>
            Already have an account?{" "}
            <Link href="/login" className={styles.switchAuthLink}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

