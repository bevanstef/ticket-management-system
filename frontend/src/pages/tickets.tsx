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

const TICKET_TYPES = [
  { id: 1, name: "Regular", price: 1500 },
  { id: 2, name: "Premium", price: 2000 },
  { id: 3, name: "VIP", price: 3500 },
  { id: 4, name: "VVIP", price: 6000 },
];

export default function TicketsPage() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [useCustomLogo, setUseCustomLogo] = useState<boolean>(true);

  // Search filter states
  const [searchId, setSearchId] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");
  const [searchContact, setSearchContact] = useState<string>("");

  // Edit modal states
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editCustomerName, setEditCustomerName] = useState<string>("");
  const [editContactNumber, setEditContactNumber] = useState<string>("");
  const [editTypeId, setEditTypeId] = useState<number>(1);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [editErrorMessage, setEditErrorMessage] = useState<string>("");

  const handleOpenEditModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setEditCustomerName(ticket.customer_name);
    setEditContactNumber(ticket.contact_number);
    setEditTypeId(ticket.type_id);
    setEditErrorMessage("");
  };

  const handleCloseEditModal = () => {
    setEditingTicket(null);
    setEditErrorMessage("");
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    if (!editCustomerName.trim() || !editContactNumber.trim()) {
      setEditErrorMessage("Customer name and contact number are required.");
      return;
    }

    try {
      setSavingEdit(true);
      setEditErrorMessage("");

      const response = await api.put<Ticket>(`/tickets/${editingTicket.id}`, {
        customer_name: editCustomerName.trim(),
        contact_number: editContactNumber.trim(),
        type_id: editTypeId,
      });

      const updated = response.data;
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSuccessMessage(`Ticket #${updated.id} updated successfully.`);
      setTimeout(() => setSuccessMessage(""), 4000);
      handleCloseEditModal();
    } catch (err: any) {
      setEditErrorMessage(err.response?.data?.detail || "Failed to update ticket.");
    } finally {
      setSavingEdit(false);
    }
  };

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
              {useCustomLogo ? (
                <img
                  src="/logo5.PNG"
                  alt="Ticket Management System Logo"
                  className={styles.titleLogo}
                  onError={() => setUseCustomLogo(false)}
                />
              ) : (
                <div className={styles.svgFallbackWrapper}>
                  <svg
                    width="28"
                    height="28"
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
              <div className={styles.titleText}>
                <h1>Ticket Management Dashboard</h1>
                <p>Review, search, and manage issued tickets</p>
              </div>
            </div>

            <div className={styles.userControls}>
              <div className={styles.userInfo}>
                <span className={styles.roleBadge}>admin</span>
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
                        <div className={styles.actionButtonGroup}>
                          <button
                            onClick={() => handleOpenEditModal(t)}
                            className={styles.editBtn}
                            title="Edit ticket"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className={styles.deleteBtn}
                            title="Delete ticket"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </main>

          {/* Edit Ticket Modal */}
          {editingTicket && (
            <div className={styles.modalOverlay} onClick={handleCloseEditModal}>
              <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>Edit Ticket #{editingTicket.id}</h2>
                  <button
                    onClick={handleCloseEditModal}
                    className={styles.closeBtn}
                    title="Close modal"
                  >
                    &times;
                  </button>
                </div>

                {editErrorMessage && (
                  <div className={`${styles.alert} ${styles.alertError}`} style={{ marginBottom: "1rem" }}>
                    {editErrorMessage}
                  </div>
                )}

                <form onSubmit={handleSaveEdit}>
                  <div className={styles.modalFormGroup}>
                    <label className={styles.modalLabel} htmlFor="editCustomerName">
                      Customer Name
                    </label>
                    <input
                      id="editCustomerName"
                      type="text"
                      required
                      className={styles.modalInput}
                      value={editCustomerName}
                      onChange={(e) => setEditCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div className={styles.modalFormGroup}>
                    <label className={styles.modalLabel} htmlFor="editContactNumber">
                      Contact Number
                    </label>
                    <input
                      id="editContactNumber"
                      type="text"
                      required
                      className={styles.modalInput}
                      value={editContactNumber}
                      onChange={(e) => setEditContactNumber(e.target.value)}
                      placeholder="Enter contact number"
                    />
                  </div>

                  <div className={styles.modalFormGroup}>
                    <label className={styles.modalLabel} htmlFor="editTypeId">
                      Ticket Tier / Type
                    </label>
                    <select
                      id="editTypeId"
                      className={styles.modalSelect}
                      value={editTypeId}
                      onChange={(e) => setEditTypeId(Number(e.target.value))}
                    >
                      {TICKET_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} (Rs. {type.price.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.priceNotice}>
                    <span className={styles.priceNoticeLabel}>Updated Price:</span>
                    <span className={styles.priceNoticeValue}>
                      Rs.{" "}
                      {(
                        TICKET_TYPES.find((t) => t.id === editTypeId)?.price || 0
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className={styles.modalFooter}>
                    <button
                      type="button"
                      onClick={handleCloseEditModal}
                      className={styles.btnSecondary}
                      disabled={savingEdit}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.btnPrimary}
                      disabled={savingEdit}
                    >
                      {savingEdit ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

