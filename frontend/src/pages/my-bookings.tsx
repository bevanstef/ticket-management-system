import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import styles from "../styles/MyBookings.module.css";

interface TicketType {
  id: number;
  name: string;
  price: number;
}

interface Ticket {
  id: number;
  event_name: string;
  customer_name: string;
  contact_number: string;
  type_id: number;
  ticket_price: number;
  booked_at: string;
  type?: TicketType;
}

export default function MyBookingsPage() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await api.get<Ticket[]>("/tickets/my-tickets");
      setTickets(res.data);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || "Failed to load your booked tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>My Bookings - Ticketz Sri Lanka</title>
      </Head>

      <div className={styles.container}>
        {/* Navigation Bar */}
        <header className={styles.navbar}>
          <Link href="/" className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo5.PNG" alt="Ticketz Logo" className={styles.brandLogo} />
            <span className={styles.brandTitle}>Ticketz Sri Lanka</span>
          </Link>

          <div className={styles.navActions}>
            <Link href="/" className={styles.navLink}>
              Events Explorer
            </Link>
            <div className={styles.userBadge}>
              <span>👤 {user?.username}</span>
            </div>
            {user?.role === "staff" && (
              <Link href="/tickets" className={styles.staffLink}>
                Admin Portal &rarr;
              </Link>
            )}
            <button onClick={logout} className={styles.logoutBtn}>
              Log Out
            </button>
          </div>
        </header>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>My Booked Passes</h1>
            <p className={styles.pageSubtitle}>
              View and manage all your reserved event tickets
            </p>
          </div>
          <Link href="/book" className={styles.bookNewBtn}>
            + Book Another Event
          </Link>
        </div>

        {/* Content Container */}
        <main className={styles.mainContainer}>
          {errorMessage && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                padding: "1rem",
                borderRadius: "10px",
                marginBottom: "1.5rem",
              }}
            >
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "#94a3b8" }}>
              Loading your bookings…
            </div>
          ) : tickets.length === 0 ? (
            <div className={styles.emptyCard}>
              <div className={styles.emptyEmoji}>🎟️</div>
              <h2 className={styles.emptyTitle}>No Bookings Yet</h2>
              <p className={styles.emptyDesc}>
                You haven&apos;t reserved any event tickets yet. Explore upcoming Sri
                Lankan events and book your passes today!
              </p>
              <Link href="/" className={styles.bookNewBtn}>
                Explore Events &rarr;
              </Link>
            </div>
          ) : (
            <div className={styles.ticketsGrid}>
              {tickets.map((t) => (
                <div key={t.id} className={styles.ticketPass}>
                  <div className={styles.passHeader}>
                    <span className={styles.ticketBadge}>
                      {t.type?.name || "Standard Pass"}
                    </span>
                    <span className={styles.ticketNumber}>TICKET #{t.id}</span>
                  </div>

                  <div className={styles.passBody}>
                    <h3 className={styles.eventTitle}>
                      {t.event_name || "Sri Lanka Live Event"}
                    </h3>

                    <div className={styles.passDetailsGrid}>
                      <div className={styles.detailBox}>
                        <span className={styles.detailLabel}>Attendee</span>
                        <span className={styles.detailValue}>{t.customer_name}</span>
                      </div>
                      <div className={styles.detailBox}>
                        <span className={styles.detailLabel}>Contact</span>
                        <span className={styles.detailValue}>{t.contact_number}</span>
                      </div>
                      <div className={styles.detailBox}>
                        <span className={styles.detailLabel}>Booking Date</span>
                        <span className={styles.detailValue}>
                          {new Date(t.booked_at).toLocaleDateString("en-LK", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className={styles.detailBox}>
                        <span className={styles.detailLabel}>Time</span>
                        <span className={styles.detailValue}>
                          {new Date(t.booked_at).toLocaleTimeString("en-LK", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.passFooter}>
                    <div>
                      <div className={styles.priceLabel}>Paid Amount</div>
                      <div className={styles.priceValue}>
                        LKR {Number(t.ticket_price).toLocaleString()}
                      </div>
                    </div>
                    <span className={styles.statusPill}>● Confirmed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

