import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";
import { getEventDetails } from "../../utils/eventHelpers";
import styles from "../../styles/DigitalTicket.module.css";

interface TicketType {
  id: number;
  name: string;
  price: number;
}

interface DigitalTicket {
  id: number;
  event_name: string;
  customer_name: string;
  contact_number: string;
  type_id: number;
  ticket_price: number;
  booked_at: string;
  type?: TicketType;
}

export default function DigitalTicketPage() {
  const router = useRouter();
  const { id } = router.query;

  const [ticket, setTicket] = useState<DigitalTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Use current origin's host or NEXT_PUBLIC_API_URL so mobile phone can reach backend
    const apiHost =
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== "undefined"
        ? `http://${window.location.hostname}:8000`
        : "http://localhost:8000");

    axios
      .get<DigitalTicket>(`${apiHost}/tickets/digital/${id}`)
      .then((res) => {
        setTicket(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch digital ticket:", err);
        setError(
          err.response?.status === 404
            ? "Ticket pass not found or invalid."
            : "Unable to verify ticket pass at this time."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const event = ticket ? getEventDetails(ticket.event_name) : null;

  return (
    <div className={styles.container}>
      <Head>
        <title>{ticket ? `${ticket.event_name} - E-Pass` : "Digital Ticket Pass"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {loading && (
        <div className={styles.centerState}>
          <div className={styles.spinner} />
          <p>Verifying Ticket Pass...</p>
        </div>
      )}

      {!loading && error && (
        <div className={styles.centerState}>
          <span style={{ fontSize: "3rem" }}>⚠️</span>
          <h2 style={{ margin: "0.5rem 0", color: "#f87171" }}>Invalid Ticket</h2>
          <p style={{ color: "#94a3b8", maxWidth: 300 }}>{error}</p>
        </div>
      )}

      {!loading && ticket && event && (
        <>
          <div className={styles.ticketCard}>
            {/* Banner Section */}
            <div className={styles.banner}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.image}
                alt={ticket.event_name}
                className={styles.bannerImage}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/pic 1.png";
                }}
              />
              <div className={styles.bannerGradientOverlay} />
              <div className={styles.badgeWrapper}>
                <span className={styles.verifiedBadge}>
                  <span>✓</span> Verified Pass
                </span>
                <span className={styles.ticketTypeBadge}>
                  {ticket.type?.name || "Standard Pass"}
                </span>
              </div>
            </div>

            {/* Ticket Body Details */}
            <div className={styles.body}>
              <div className={styles.eventTitleSection}>
                <h1 className={styles.eventTitle}>{ticket.event_name}</h1>
                <div className={styles.passNumber}>PASS #TKT-{ticket.id}</div>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Attendee</span>
                  <span className={styles.detailValue}>{ticket.customer_name}</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Contact</span>
                  <span className={styles.detailValue}>{ticket.contact_number}</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Date & Time</span>
                  <span className={styles.detailValue}>
                    {event.date} • {event.time}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Venue</span>
                  <span className={styles.detailValue}>{event.venue}</span>
                </div>
              </div>

              {/* Perforation Divider */}
              <div className={styles.perforation}>
                <div className={styles.notchLeft} />
                <div className={styles.dashedLine} />
                <div className={styles.notchRight} />
              </div>

              {/* Verification Stamp */}
              <div className={styles.validationSection}>
                <div className={styles.gateCheckNotice}>
                  <span>🔒</span> Valid for Fast-Track Gate Entry
                </div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                  Booked on {new Date(ticket.booked_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footerNote}>
            Official Digital Ticket Pass • Present this screen to gate staff
          </div>
        </>
      )}
    </div>
  );
}
