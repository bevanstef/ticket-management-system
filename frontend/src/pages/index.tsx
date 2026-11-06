import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Home.module.css";

export default function Home() {
  const { user, logout, loading } = useAuth();

  return (
    <>
      <Head>
        <title>Ticket Management System</title>
        <meta name="description" content="Ticket Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Ticket Management System</h1>
          <p className={styles.subtitle}>Powered by Ticketz </p>

          {loading ? (
            <p style={{ color: "#94a3b8" }}>Loading authentication status…</p>
          ) : user ? (
            <div>
              <div className={styles.profileSection}>
                <div className={styles.profileDetails}>
                  <div className={styles.username}>{user.username}</div>
                  <span className={styles.roleBadge}>{user.role}</span>
                </div>
                <button onClick={logout} className={styles.logoutBtn}>
                  Log out
                </button>
              </div>

              <div className={styles.actionsGrid}>
                {user.role === "staff" && (
                  <Link href="/tickets" className={styles.actionCard}>
                    <div className={styles.actionTitle}>
                      <span>Manage Tickets</span>
                      <span>&rarr;</span>
                    </div>
                    <p className={styles.actionDesc}>
                      Staff Dashboard: View, search, and manage all issued tickets.
                    </p>
                  </Link>
                )}

                <Link href="/book" className={styles.actionCard}>
                  <div className={styles.actionTitle}>
                    <span>Book a Ticket</span>
                    <span>&rarr;</span>
                  </div>
                  <p className={styles.actionDesc}>
                    {user.role === "staff"
                      ? "Issue a new ticket for Regular, Premium, VIP, or VVIP passes."
                      : "Purchase and reserve your ticket pass."}
                  </p>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
                Please sign in to access your dashboard and manage tickets.
              </p>
              <Link href="/login" className={styles.loginPromptBtn}>
                Sign In to Continue &rarr;
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
