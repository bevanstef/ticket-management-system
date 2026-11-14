import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, FormEvent, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import styles from "../styles/Book.module.css";
import { SAMPLE_EVENTS, EventItem } from "./index";

const TICKET_TYPES = [
  { id: 1, name: "Regular", price: 1500 },
  { id: 2, name: "Premium", price: 2000 },
  { id: 3, name: "VIP", price: 3500 },
  { id: 4, name: "VVIP", price: 6000 },
];

export default function BookTicketPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { event: eventIdQuery } = router.query;

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [customerName, setCustomerName] = useState(user?.username || "");
  const [contactNumber, setContactNumber] = useState("");
  const [typeId, setTypeId] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState<any | null>(null);

  useEffect(() => {
    if (eventIdQuery) {
      const match = SAMPLE_EVENTS.find((e) => e.id === eventIdQuery);
      if (match) {
        setSelectedEvent(match);
      }
    } else {
      setSelectedEvent(SAMPLE_EVENTS[0]);
    }
  }, [eventIdQuery]);

  useEffect(() => {
    if (user?.username && !customerName) {
      setCustomerName(user.username);
    }
  }, [user]);

  const selectedType = TICKET_TYPES.find((t) => t.id === typeId) || TICKET_TYPES[0];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessInfo(null);

    if (!customerName.trim() || !contactNumber.trim()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/tickets/", {
        event_name: selectedEvent?.title || "Colombo Music Carnival & Baila Night",
        customer_name: customerName.trim(),
        contact_number: contactNumber.trim(),
        type_id: typeId,
      });

      setSuccessInfo(res.data);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || "Failed to book ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>
          {selectedEvent ? `Book ${selectedEvent.title}` : "Book Event Ticket"} - Ticketz Sri Lanka
        </title>
      </Head>

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Book Event Tickets</h1>
            <p>
              {selectedEvent
                ? `Reserving seats for ${selectedEvent.title}`
                : "Select your preferred pass and enter details"}
            </p>
          </div>

          {selectedEvent && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <span style={{ fontSize: "2rem" }}>{selectedEvent.emoji}</span>
              <div style={{ textAlign: "left" }}>
                <strong style={{ display: "block", color: "#ffffff", fontSize: "0.95rem" }}>
                  {selectedEvent.title}
                </strong>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                  📅 {selectedEvent.date} • 📍 {selectedEvent.venue}, {selectedEvent.city}
                </span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className={`${styles.alert} ${styles.alertError}`}>{errorMessage}</div>
          )}

          {successInfo ? (
            <div>
              <div className={`${styles.alert} ${styles.alertSuccess}`}>
                <strong>Booking Confirmed!</strong>
                <p style={{ margin: "0.25rem 0 0" }}>
                  Ticket <strong>#{successInfo.id}</strong> ({successInfo.type?.name})
                  reserved for <strong>{successInfo.customer_name}</strong>.
                </p>
                <p style={{ margin: "0.25rem 0 0", color: "#166534" }}>
                  Amount: LKR {Number(successInfo.ticket_price).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => {
                  setSuccessInfo(null);
                  setContactNumber("");
                }}
                className={styles.submitBtn}
                style={{ marginBottom: "0.75rem" }}
              >
                Book Another Ticket
              </button>

              <button
                onClick={() => router.push("/my-bookings")}
                className={styles.submitBtn}
                style={{
                  background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                  marginBottom: "0.75rem",
                }}
              >
                View My Bookings &rarr;
              </button>

              <button
                onClick={() => router.push("/")}
                className={styles.submitBtn}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                &larr; Back to Events Explorer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Select Event</label>
                <select
                  value={selectedEvent?.id || ""}
                  onChange={(e) => {
                    const found = SAMPLE_EVENTS.find((ev) => ev.id === e.target.value);
                    if (found) setSelectedEvent(found);
                  }}
                  className={styles.select}
                  disabled={submitting}
                >
                  {SAMPLE_EVENTS.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.emoji} {ev.title} ({ev.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>User Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Perera"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={styles.input}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +94 77 123 4567"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className={styles.input}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Ticket Type / Tier</label>
                <select
                  value={typeId}
                  onChange={(e) => setTypeId(Number(e.target.value))}
                  className={styles.select}
                  disabled={submitting}
                >
                  {TICKET_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} — LKR {type.price.toLocaleString()}
                    </option>
                  ))}
                </select>

                <div className={styles.pricePreview}>
                  <span>Total Amount</span>
                  <strong style={{ fontSize: "1rem" }}>
                    LKR {selectedType.price.toLocaleString()}
                  </strong>
                </div>
              </div>

              <button type="submit" disabled={submitting} className={styles.submitBtn}>
                {submitting
                  ? "Reserving Seats…"
                  : `Confirm & Reserve (LKR ${selectedType.price.toLocaleString()})`}
              </button>
            </form>
          )}

          <div className={styles.footerLinks}>
            <Link href="/" className={styles.link}>
              &larr; Back to Events Explorer
            </Link>
            {user?.role === "staff" && (
              <Link href="/tickets" className={styles.link}>
                View All Booked Tickets &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
