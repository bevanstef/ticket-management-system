import Head from "next/head";

import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, logout, loading } = useAuth();
  return (
    <>
      <Head>
        <title>Ticket Management System</title>
        <meta name="description" content="Ticket Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Ticket Management System</h1>
        {loading ? (
          <p>Loading authentication…</p>
        ) : user ? (
          <div>
            <p>Logged in as <strong>{user.username}</strong> ({user.role})</p>
            <button onClick={logout}>Log out</button>
          </div>
        ) : (
          <p><a href="/login">Log in to continue</a></p>
        )}
      </main>
    </>
  );
}

