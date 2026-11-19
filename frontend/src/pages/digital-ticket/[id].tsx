import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
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
  is_used: boolean;
  scanned_at?: string;
  type?: TicketType;
}

interface VerifyResponse {
  ticket: DigitalTicket;
  is_authentic: boolean;
  is_used: boolean;
  scanned_at?: string;
  message: string;
}

export default function DigitalTicketPage() {
  const router = useRouter();
  const { id, sig } = router.query;
  const { user } = useAuth();

  const [ticket, setTicket] = useState<DigitalTicket | null>(null);
  const [isAuthentic, setIsAuthentic] = useState<boolean>(true);
  const [isUsed, setIsUsed] = useState<boolean>(false);
  const [scannedAt, setScannedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Staff check-in state
  const [checkingIn, setCheckingIn] = useState<boolean>(false);
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState<string | null>(null);

  const isStaff = user?.role === "staff";

  // Format UTC string into local readable time
  const formatScannedTime = (isoString?: string | null) => {
    if (!isoString) return "";
    // If backend sent ISO without Z, ensure it's treated as UTC
    const utcIso = isoString.endsWith("Z") ? isoString : `${isoString}Z`;
    return new Date(utcIso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getApiHost = () => {
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== "undefined"
        ? `http://${window.location.hostname}:8000`
        : "http://localhost:8000")
    );
  };

  useEffect(() => {
    if (!id) return;

    const querySig = typeof sig === "string" ? `?sig=${encodeURIComponent(sig)}` : "";

    axios
      .get<VerifyResponse>(`${getApiHost()}/tickets/digital/${id}${querySig}`)
      .then((res) => {
        setTicket(res.data.ticket);
        setIsAuthentic(res.data.is_authentic);
        setIsUsed(res.data.is_used);
        setScannedAt(res.data.scanned_at || null);
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
  }, [id, sig]);

  // Option B: Staff Confirmation Action
  const handleCheckIn = async () => {
    if (!ticket || !isStaff || isUsed) return;

    setCheckingIn(true);
    setCheckInSuccessMsg(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tms_token") : null;
      const res = await axios.post<VerifyResponse>(
        `${getApiHost()}/tickets/${ticket.id}/check-in`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setIsUsed(true);
      setScannedAt(res.data.scanned_at || new Date().toISOString());
      setCheckInSuccessMsg("Attendee admitted successfully!");
    } catch (err: any) {
      console.error("Check-in failed:", err);
      alert(err.response?.data?.detail || "Check-in failed. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

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
          {/* Tamper Warning if signature was altered */}
          {!isAuthentic && (
            <div className={styles.tamperAlert}>
              <span>⚠️</span>
              <div>
                <strong>Warning: Unverified Signature!</strong>
                <p>This pass has an invalid security hash. Verify with official records.</p>
              </div>
            </div>
          )}

          {/* Status Alert: Displayed only for customer */}
          {isUsed && !isStaff && (
            <div className={styles.customerAdmittedBanner}>
              <span>🎟️</span>
              <div>
                <strong>Ticket Admitted</strong>
                <p>
                  Checked in at {formatScannedTime(scannedAt)}. Enjoy the event!
                </p>
              </div>
            </div>
          )}

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
                {isUsed ? (
                  <span className={styles.usedBadge}>
                    <span>●</span> Admitted / Used
                  </span>
                ) : isAuthentic ? (
                  <span className={styles.verifiedBadge}>
                    <span>✓</span> Authentic Pass
                  </span>
                ) : (
                  <span className={styles.unverifiedBadge}>
                    <span>?</span> Unverified
                  </span>
                )}
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

              {/* Staff Two-Step Confirmation Action (Option B) */}
              {isStaff ? (
                <div className={styles.staffActionBox}>
                  <div className={styles.staffHeader}>
                    <span>🛡️ Gate Staff Controls</span>
                    <span className={styles.staffPill}>Staff Mode</span>
                  </div>

                  {checkInSuccessMsg && (
                    <div className={styles.successToast}>✓ {checkInSuccessMsg}</div>
                  )}

                  {!isUsed ? (
                    <button
                      className={styles.admitBtn}
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                    >
                      {checkingIn ? "Recording Admission..." : "✓ Admit Attendee / Check In"}
                    </button>
                  ) : (
                    <div className={styles.admittedNotice}>
                      <span>✓</span> Attendee Already Admitted
                      {scannedAt && (
                        <small>Checked in at {formatScannedTime(scannedAt)}</small>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.validationSection}>
                  <div className={styles.gateCheckNotice}>
                    <span>🔒</span> {isUsed ? "Pass Used For Gate Entry" : "Valid For Fast-Track Gate Entry"}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                    Booked on {new Date(ticket.booked_at).toLocaleDateString()}
                  </div>
                </div>
              )}
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
