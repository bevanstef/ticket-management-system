import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Home.module.css";

export interface EventItem {
  id: string;
  title: string;
  category: "Concert" | "Tech" | "Sports" | "Comedy" | "Cultural";
  date: string;
  time: string;
  venue: string;
  city: string;
  description: string;
  fullDetails: string;
  bannerGradient: string;
  emoji: string;
  image: string;
  tiers: { name: string; price: number }[];
}

export const SAMPLE_EVENTS: EventItem[] = [
  {
    id: "colombo-music-carnival-2026",
    title: "Colombo Music Carnival & Baila Night",
    category: "Concert",
    date: "Dec 19, 2026",
    time: "6:00 PM - 1:00 AM",
    venue: "CR & FC Grounds",
    city: "Colombo 07",
    emoji: "🎵",
    image: "/pic 1.png",
    bannerGradient: "linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)",
    description: "An electrifying night celebrating top Sri Lankan live artists, acoustic bands, and high-energy Baila beats by the green.",
    fullDetails:
      "Colombo's biggest open-air music festival featuring legendary local performers, contemporary pop bands, live percussion, and youth indie artists. Includes Sri Lankan street food stalls (kottu, isso vade), chill zones, and VIP lounge experiences.",
    tiers: [
      { name: "General Pass", price: 1500 },
      { name: "Fan Pit / Front Zone", price: 2000 },
      { name: "VIP Lounge Pass", price: 3500 },
      { name: "VVIP Hospitality Deck", price: 6000 },
    ],
  },
  {
    id: "slasscom-future-tech-summit",
    title: "Sri Lanka Tech & AI Innovations Summit",
    category: "Tech",
    date: "Jan 16, 2027",
    time: "9:00 AM - 5:30 PM",
    venue: "BMICH (Bandaranaike Memorial International Conference Hall)",
    city: "Colombo",
    emoji: "🚀",
    image: "/pic 2.png",
    bannerGradient: "linear-gradient(135deg, #0ea5e9, #2563eb, #6366f1)",
    description: "The island's premier technology gathering uniting IT leaders, software engineers, AI researchers, and startups.",
    fullDetails:
      "A flagship technology conference hosted at the prestigious BMICH Lotus Hall. Dive into frontier AI architectures, cloud native scaling, FinTech disruptions, and developer masterclasses with keynote speakers from top Sri Lankan tech firms and global innovators.",
    tiers: [
      { name: "Student & Developer Delegate", price: 1500 },
      { name: "Professional Conference Pass", price: 2000 },
      { name: "VIP Executive Pass", price: 3500 },
      { name: "Founder & Investor Roundtable", price: 6000 },
    ],
  },
  {
    id: "lanka-t20-stadium-clash",
    title: "Lanka Premier T20 Showdown: Colombo vs Jaffna",
    category: "Sports",
    date: "Dec 27, 2026",
    time: "7:00 PM - 11:00 PM",
    venue: "R. Premadasa International Cricket Stadium",
    city: "Colombo",
    emoji: "🏏",
    image: "/pic 3.png",
    bannerGradient: "linear-gradient(135deg, #10b981, #059669, #0284c7)",
    description: "High-octane T20 cricket clash between top island rival franchises under floodlights at Khettarama.",
    fullDetails:
      "Experience the unmatched atmosphere of Sri Lankan cricket fandom! Featuring live papare bands in the stands, fireworks, cheer squads, and heart-pounding cricket action between star national players and international imports.",
    tiers: [
      { name: "Upper Tier Grandstand", price: 1500 },
      { name: "Lower Ground Pavilion", price: 2000 },
      { name: "Air-Conditioned Box VIP", price: 3500 },
      { name: "President's Enclosure VVIP", price: 6000 },
    ],
  },
  {
    id: "colombo-comedy-unleashed",
    title: "Colombo Comedy Club: Island Humour Live",
    category: "Comedy",
    date: "Dec 23, 2026",
    time: "7:30 PM - 10:00 PM",
    venue: "Lionel Wendt Theatre",
    city: "Colombo 07",
    emoji: "🎙️",
    image: "/pic 4.png",
    bannerGradient: "linear-gradient(135deg, #f59e0b, #ef4444, #ec4899)",
    description: "Hilarious stand-up comedy special tackling Sri Lankan everyday life, traffic, culture, and corporate drama.",
    fullDetails:
      "Get ready for non-stop laughs with Sri Lanka's funniest comedians and witty improv artists at the historic Lionel Wendt. Covering relatable island quirks, wedding traditions, tuition classes, and modern life.",
    tiers: [
      { name: "Balcony Standard", price: 1500 },
      { name: "Stalls Prime", price: 2000 },
      { name: "Front Row VIP", price: 3500 },
      { name: "VIP + Artist Meet & Greet", price: 6000 },
    ],
  },
  {
    id: "kandy-heritage-cultural-night",
    title: "Kandy Cultural Beats & Fire Dance Spectacular",
    category: "Cultural",
    date: "Jan 08, 2027",
    time: "6:30 PM - 9:00 PM",
    venue: "Kandy Lake Club Cultural Hall",
    city: "Kandy",
    emoji: "🥁",
    image: "/pic 5.png",
    bannerGradient: "linear-gradient(135deg, #d97706, #b45309, #7c2d12)",
    description: "Breathtaking traditional Kandyan dancing, Geta Bera drumming, and dramatic acrobatic fire walks.",
    fullDetails:
      "An authentic showcase of Sri Lankan heritage and ancient ritual arts set by the scenic Kandy Lake. Experience the Ves Dance, peacock dances, thunderous traditional drumming ensembles, and dramatic fire walking by hereditary performers.",
    tiers: [
      { name: "Standard Seating", price: 1500 },
      { name: "Premium Center Row", price: 2000 },
      { name: "VIP Front Row", price: 3500 },
      { name: "Royal Kandyan Experience VVIP", price: 6000 },
    ],
  },
];

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);

  const categories = ["All", "Concert", "Tech", "Sports", "Comedy", "Cultural"];

  const filteredEvents =
    selectedCategory === "All"
      ? SAMPLE_EVENTS
      : SAMPLE_EVENTS.filter((ev) => ev.category === selectedCategory);

  const handleBookRedirect = (eventItem: EventItem) => {
    router.push({
      pathname: "/book",
      query: { event: eventItem.id, eventTitle: eventItem.title },
    });
  };

  return (
    <>
      <Head>
        <title>Ticketz Sri Lanka - Discover & Book Live Events</title>
        <meta
          name="description"
          content="Explore and book upcoming concerts, sports, tech conferences, and cultural events across Sri Lanka."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.container}>
        {/* Top Navigation */}
        <header className={styles.navbar}>
          <div className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo5.PNG"
              alt="Ticketz Logo"
              className={styles.brandLogo}
              onError={(e) => {
                // fallback if case-sensitive mismatch on some platforms
                (e.currentTarget as HTMLImageElement).src = "/logo5.png";
              }}
            />
            <span className={styles.brandTitle}>Ticketz</span>
          </div>

          <div className={styles.navActions}>
            {user ? (
              <>
                <Link href="/my-bookings" className={styles.staffLink}>
                  My Bookings
                </Link>
                <div className={styles.userBadge}>
                  <span>👤 {user.username}</span>
                </div>
                {user.role === "staff" && (
                  <Link href="/tickets" className={styles.staffLink}>
                    Admin Portal &rarr;
                  </Link>
                )}
                <button onClick={logout} className={styles.logoutBtn}>
                  Log Out
                </button>
              </>
            ) : (
              <Link href="/login" className={styles.signInBtn}>
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroTag}>Events Across Sri Lanka 🇱🇰</div>
          <h1 className={styles.heroTitle}>Discover & Book Islandwide Events</h1>
          <p className={styles.heroSubtitle}>
            From Colombo concerts and R. Premadasa cricket matches to BMICH summits and Kandy cultural nights.
            Select any event card below to view details and book your passes.
          </p>
        </section>

        {/* Category Filters */}
        <div className={styles.filterBar}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${
                selectedCategory === cat ? styles.filterBtnActive : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <main className={styles.mainContent}>
          <div className={styles.eventsGrid}>
            {filteredEvents.map((item) => (
              <div
                key={item.id}
                className={styles.eventCard}
                onClick={() => setActiveEvent(item)}
              >
                <div
                  className={styles.cardHeaderBanner}
                  style={{ background: item.bannerGradient }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.cardImage}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className={styles.categoryBadge}>{item.category}</span>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.eventTitle}>{item.title}</h3>

                  <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                      <span>📅</span>
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span>📍</span>
                      <span>
                        {item.venue}, {item.city}
                      </span>
                    </div>
                  </div>

                  <p className={styles.eventDesc}>{item.description}</p>

                  <div className={styles.cardFooter}>
                    <div>
                      <div className={styles.priceLabel}>Starting from</div>
                      <div className={styles.priceValue}>
                        LKR {item.tiers[0].price.toLocaleString()}
                      </div>
                    </div>
                    <button
                      className={styles.viewDetailsBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEvent(item);
                      }}
                    >
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Event Details Modal Popup */}
        {activeEvent && (
          <div
            className={styles.modalOverlay}
            onClick={() => setActiveEvent(null)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={styles.modalHeader}
                style={{ background: activeEvent.bannerGradient }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeEvent.image}
                  alt={activeEvent.title}
                  className={styles.modalImage}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <button
                  className={styles.modalCloseBtn}
                  onClick={() => setActiveEvent(null)}
                  title="Close details"
                >
                  ✕
                </button>
              </div>

              <div className={styles.modalBody}>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span className={styles.roleTag}>{activeEvent.category}</span>
                </div>

                <h2 className={styles.modalTitle}>{activeEvent.title}</h2>

                <div className={styles.modalMetaGrid}>
                  <div className={styles.modalMetaBox}>
                    <span className={styles.modalMetaLabel}>Date & Time</span>
                    <span className={styles.modalMetaValue}>
                      {activeEvent.date} ({activeEvent.time})
                    </span>
                  </div>
                  <div className={styles.modalMetaBox}>
                    <span className={styles.modalMetaLabel}>Location & Venue</span>
                    <span className={styles.modalMetaValue}>
                      {activeEvent.venue}, {activeEvent.city}
                    </span>
                  </div>
                </div>

                <div className={styles.sectionHeading}>About This Event</div>
                <p className={styles.modalFullDesc}>{activeEvent.fullDetails}</p>

                <div className={styles.sectionHeading}>Available Ticket Passes</div>
                <div className={styles.tierList}>
                  {activeEvent.tiers.map((tier) => (
                    <div key={tier.name} className={styles.tierItem}>
                      <span className={styles.tierName}>{tier.name}</span>
                      <span className={styles.tierPrice}>
                        LKR {tier.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setActiveEvent(null)}
                  >
                    Close
                  </button>
                  <button
                    className={styles.bookNowBtn}
                    onClick={() => handleBookRedirect(activeEvent)}
                  >
                    Book Tickets Now &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
