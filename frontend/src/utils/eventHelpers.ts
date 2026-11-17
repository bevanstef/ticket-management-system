import { SAMPLE_EVENTS, EventItem } from "../pages/index";

export function getEventDetails(eventName?: string): EventItem {
  if (!eventName) {
    return SAMPLE_EVENTS[0];
  }

  const found = SAMPLE_EVENTS.find(
    (e) =>
      e.title.toLowerCase().trim() === eventName.toLowerCase().trim() ||
      eventName.toLowerCase().includes(e.title.toLowerCase()) ||
      e.title.toLowerCase().includes(eventName.toLowerCase())
  );

  return (
    found || {
      id: "general-event",
      title: eventName,
      category: "Concert",
      date: "Upcoming Event",
      time: "TBA",
      venue: "Main Arena",
      city: "Colombo",
      emoji: "🎟️",
      image: "/pic 1.png",
      bannerGradient: "linear-gradient(135deg, #0284c7, #38bdf8)",
      description: "Official event pass for live entertainment & exhibitions.",
      fullDetails: "Present this pass at the gate for fast-track entry.",
      tiers: [],
    }
  );
}
