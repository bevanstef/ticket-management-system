import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import styles from "../styles/Tickets.module.css";

interface TicketType {
  id: number;
  name: string;
  price: number;
}

interface Ticket {
  id: number;
  customer_name: string;
  contact_number: string;
  type_id: number;
  ticket_price: number;
  booked_at: string;
  type?: TicketType;
}

export default function TicketsPage() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Search filter states
  const [searchId, setSearchId] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");
  const [searchContact, setSearchContact] = useState<string>("");

  const loadTickets = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await api.get<Ticket[]>("/tickets/");
      setTickets(response.data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchId && !searchName && !searchContact) {
      loadTickets();
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const params: Record<string, string> = {};
      if (searchId) params.ticket_id = searchId;
      if (searchName) params.name = searchName;
      if (searchContact) params.contact = searchContact;

      const response = await api.get<Ticket[]>("/tickets/search", { params });
      setTickets(response.data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchId("");
    setSearchName("");
    setSearchContact("");
    loadTickets();
  };

  const handleDelete = async (ticketId: number) => {
    if (!confirm(`Are you sure you want to delete ticket #${ticketId}?`)) return;

    try {
      await api.delete(`/tickets/${ticketId}`);
      setSuccessMessage(`Ticket #${ticketId} deleted successfully.`);
      setTimeout(() => setSuccessMessage(""), 4000);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Failed to delete ticket");
    }
  };

  const getTypeBadgeClass = (typeName?: string) => {
    switch (typeName?.toLowerCase()) {
      case "regular":
        return styles.typeRegular;
      case "premium":
        return styles.typePremium;
      case "vip":
        return styles.typeVIP;
      case "vvip":
        return styles.typeVVIP;
      default:
        return styles.typeRegular;
    }
  };

  return (
    <ProtectedRoute requiredRole="staff">
      <Head>
        <title>Manage Tickets - Ticket Management System</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.inner}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.titleArea}>
              <h1>Ticket Management Dashboard</h1>
              <p>Review, search, and manage issued tickets</p>
            </div>

            <div className={styles.userControls}>
              <div className={styles.userInfo}>
                <span>{user?.username}</span>
                <span className={styles.roleBadge}>{user?.role}</span>
              </div>
              <Link href="/" className={styles.navLink}>
                Home
              </Link>
              <Link href="/book" className={styles.navLink}>
                Book Ticket
              </Link>
              <button onClick={logout} className={styles.logoutBtn}>
                Log out
              </button>
            </div>
          </header>

          {/* Feedback Alerts */}
          {errorMessage && <div className={`${styles.alert} ${styles.alertError}`}>{errorMessage}</div>}
          {successMessage && <div className={`${styles.alert} ${styles.alertSuccess}`}>{successMessage}</div>}

          {/* Search & Actions Bar */}
          <section className={styles.controlsBar}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="number"
                placeholder="Ticket ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className={styles.searchInput}
                style={{ maxWidth: "130px" }}
              />
              <input
                type="text"
                placeholder="Customer Name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className={styles.searchInput}
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.btnPrimary}>
                Search
              </button>
              {(searchId || searchName || searchContact) && (
                <button type="button" onClick={handleResetSearch} className={styles.btnSecondary}>
                  Clear
                </button>
              )}
            </form>
          </section>

          {/* Tickets Data Table */}
          <main className={styles.tableCard}>
            {loading ? (
              <div className={styles.emptyState}>Loading tickets data…</div>
            ) : tickets.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No tickets found.</p>
                <Link href="/book" className={styles.navLink} style={{ display: "inline-block", marginTop: "0.5rem" }}>
                  Issue a new ticket &rarr;
                </Link>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Contact</th>
                    <th>Ticket Type</th>
                    <th>Price</th>
                    <th>Booked At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>#{t.id}</td>
                      <td>{t.customer_name}</td>
                      <td>{t.contact_number}</td>
                      <td>
                        <span className={`${styles.typeBadge} ${getTypeBadgeClass(t.type?.name)}`}>
                          {t.type?.name || `Type #${t.type_id}`}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: "#38bdf8" }}>
                        Rs. {Number(t.ticket_price).toLocaleString()}
                      </td>
                      <td style={{ color: "#94a3b8" }}>
                        {new Date(t.booked_at).toLocaleString("en-LK", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className={styles.deleteBtn}
                          title="Delete ticket"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

