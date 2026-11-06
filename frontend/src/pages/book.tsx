import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, FormEvent } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import styles from "../styles/Book.module.css";

const TICKET_TYPES = [
  { id: 1, name: "Regular", price: 1500 },
  { id: 2, name: "Premium", price: 2000 },
  { id: 3, name: "VIP", price: 3500 },
  { id: 4, name: "VVIP", price: 6000 },
];

export default function BookTicketPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [customerName, setCustomerName] = useState(user?.username || "");
  const [contactNumber, setContactNumber] = useState("");
  const [typeId, setTypeId] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState<any | null>(null);

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
        customer_name: customerName.trim(),
        contact_number: contactNumber.trim(),
        type_id: typeId,
      });

      setSuccessInfo(res.data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Failed to book ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Book Ticket - Ticket Management System</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Book a Ticket</h1>
            <p>Select your preferred pass and enter details</p>
          </div>

          {errorMessage && <div className={`${styles.alert} ${styles.alertError}`}>{errorMessage}</div>}

          {successInfo ? (
            <div>
              <div className={`${styles.alert} ${styles.alertSuccess}`}>
                <strong>Booking Confirmed!</strong>
                <p style={{ margin: "0.25rem 0 0" }}>
                  Ticket <strong>#{successInfo.id}</strong> ({successInfo.type?.name}) booked for{" "}
                  <strong>{successInfo.customer_name}</strong>.
                </p>
                <p style={{ margin: "0.25rem 0 0", color: "#166534" }}>
                  Amount: Rs. {Number(successInfo.ticket_price).toLocaleString()}
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

              {user?.role === "staff" && (
                <button
                  onClick={() => router.push("/tickets")}
                  className={styles.submitBtn}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  Go to Tickets List
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
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
                  placeholder="e.g. +91 9876543210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className={styles.input}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Ticket Type</label>
                <select
                  value={typeId}
                  onChange={(e) => setTypeId(Number(e.target.value))}
                  className={styles.select}
                  disabled={submitting}
                >
                  {TICKET_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} — Rs. {type.price.toLocaleString()}
                    </option>
                  ))}
                </select>

                <div className={styles.pricePreview}>
                  <span>Base Price</span>
                  <strong style={{ fontSize: "1rem" }}>Rs. {selectedType.price.toLocaleString()}</strong>
                </div>
              </div>

              <button type="submit" disabled={submitting} className={styles.submitBtn}>
                {submitting ? "Booking Ticket…" : `Confirm & Book (Rs. ${selectedType.price.toLocaleString()})`}
              </button>
            </form>
          )}

          <div className={styles.footerLinks}>
            <Link href="/" className={styles.link}>
              &larr; Back to Dashboard
            </Link>
            {user?.role === "staff" && (
              <Link href="/tickets" className={styles.link}>
                View All Tickets &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

