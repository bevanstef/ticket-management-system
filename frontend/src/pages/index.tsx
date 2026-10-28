import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Ticket Management System</title>
        <meta name="description" content="Ticket Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Ticket Management System</h1>
        <p>Starter frontend is running successfully.</p>
      </main>
    </>
  );
}

