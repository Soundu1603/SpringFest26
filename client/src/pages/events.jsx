import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import eventsData from "../data/eventsData";

const navigationGroups = [
  { label: "Paper Presentation", slugs: ["paper-presentation"] },
  {
    label: "Technical Events",
    slugs: ["ai-prompt-sprint", "bug-blitz", "idea-pitch", "code-insight"],
  },
  {
    label: "Non-Technical Events",
    slugs: ["chess-arena", "meme-sprint", "snap-rush", "guess-the-beat"],
  },
  { label: "Workshop", slugs: ["workshop"] },
];

/* Coordinators for each event */
const eventCoordinators = {
  "paper-presentation": [
    { name: "Malaiyarasan T", phone: "9790260910" },
    { name: "Srichandh P", phone: "9245603010" },
  ],

  "ai-prompt-sprint": [
    { name: "Vijayakrishna M", phone: "9360638166" },
    { name: "Shanjay S S", phone: "9345673218" },
  ],

  "bug-blitz": [
    { name: "Parkavi S", phone: "8798452671" },
    { name: "Sankavi S", phone: "9790876315" },
  ],

  "idea-pitch": [
    { name: "Vimalanandh K", phone: "8526194809" },
    { name: "Ishwarya Kiran R", phone: "6752652893" },
  ],

  "code-insight": [
    { name: "Meera K", phone: "9256173805" },
    { name: "Sreenisha M", phone: "9087623524" },
  ],

  "chess-arena": [
    { name: "Niketha S", phone: "8476294196" },
    { name: "Kaviya K", phone: "9478217630" },
  ],

  "meme-sprint": [
    { name: "Venkatabalaji M", phone: "9967282648" },
    { name: "Victor Edwin I", phone: "9587214738" },
  ],

  "snap-rush": [
    { name: "Ragavaraja V", phone: "7836251906" },
    { name: "Vishnu P S", phone: "9087653152" },
  ],

  "guess-the-beat": [
    { name: "Nehaa S", phone: "8364572190" },
    { name: "Sowmiya V", phone: "9807615234" },
  ],

  workshop: [
    { name: "Sriram R", phone: "9876453120" },
    { name: "Dharshini T", phone: "9967443228" },
  ],
};

function Events() {
  const [searchParams] = useSearchParams();
  const selectedFromQuery = searchParams.get("event");
  const [highlightedSlug, setHighlightedSlug] = useState("");
  const highlightTimer = useRef(null);

  const focusEvent = (slug) => {
    const target = document.getElementById(slug);
    if (!target) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    target.classList.remove("event-selection-active");
    setHighlightedSlug("");

    window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });

      setHighlightedSlug(slug);
      target.classList.add("event-selection-active");

      window.clearTimeout(highlightTimer.current);

      highlightTimer.current = window.setTimeout(() => {
        target.classList.remove("event-selection-active");
        setHighlightedSlug("");
      }, 1800);
    });
  };

  useEffect(() => {
    if (
      !selectedFromQuery ||
      !eventsData.some((event) => event.slug === selectedFromQuery)
    ) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() =>
      focusEvent(selectedFromQuery)
    );

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(highlightTimer.current);
    };
  }, [selectedFromQuery]);

  useEffect(
    () => () => window.clearTimeout(highlightTimer.current),
    []
  );

  return (
    <div className="events-page">
      <header className="events-page-header">
        <Link className="events-back-link" to="/">
          ← SPRING FEST&apos;26
        </Link>

        <span className="events-kicker">
          National Level Technical Symposium · 2026
        </span>
      </header>

      <main className="events-page-main">
        <div className="events-intro">
          <div>
            <span className="events-eyebrow">The programme</span>
            <h1>Events</h1>
          </div>

          <p>
            Two days of ideas, challenges and unexpected ways to make
            something memorable.
          </p>
        </div>

        <nav className="events-selector" aria-label="Event navigation">
          {navigationGroups.map((group) => (
            <div className="events-selector-group" key={group.label}>
              <span>{group.label}</span>

              <div>
                {group.slugs.map((slug) => {
                  const event = eventsData.find(
                    (item) => item.slug === slug
                  );

                  return (
                    <button
                      className={
                        highlightedSlug === slug ? "active" : ""
                      }
                      type="button"
                      onClick={() => focusEvent(slug)}
                      key={slug}
                    >
                      {event.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <section className="events-day-block">
          <div className="events-day-label">
            <span>01</span>

            <div>
              <strong>Day 1</strong>
              <small>Friday · 09 October</small>
            </div>
          </div>

          <div className="event-details-list">
            {eventsData
              .filter((event) => event.day === "Day 1")
              .map((event, index) => (
                <Fragment key={event.slug}>
                  {event.slug === "ai-prompt-sprint" && (
                    <EventCategoryHeading>
                      Technical Events
                    </EventCategoryHeading>
                  )}

                  {event.slug === "chess-arena" && (
                    <EventCategoryHeading>
                      Non-Technical Events
                    </EventCategoryHeading>
                  )}

                  <EventDetailCard
                    event={event}
                    index={index}
                    selected={highlightedSlug === event.slug}
                  />
                </Fragment>
              ))}
          </div>
        </section>

        <section className="events-day-block day-two-events">
          <div className="events-day-label">
            <span>02</span>

            <div>
              <strong>Day 2</strong>
              <small>Saturday · 10 October</small>
            </div>
          </div>

          <div className="event-details-list">
            {eventsData
              .filter((event) => event.day === "Day 2")
              .map((event, index) => (
                <EventDetailCard
                  event={event}
                  index={index}
                  selected={highlightedSlug === event.slug}
                  key={event.slug}
                />
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function EventCategoryHeading({ children }) {
  return (
    <div className="event-category-separator" aria-label={children}>
      {children}
    </div>
  );
}

function EventDetailCard({ event, index, selected }) {
  const coordinators = eventCoordinators[event.slug] || [];

  return (
    <article
      id={event.slug}
      className={`event-detail-card ${
        selected ? "event-selection-active" : ""
      }`}
    >
      <div className="event-detail-card-icon">{event.icon}</div>

      <div className="event-detail-card-copy">
        <span className="event-card-label">
          {event.category} · {event.day}
        </span>

        <h2>{event.name}</h2>

        {event.theme && (
          <p className="event-detail-theme-copy">
            Theme: {event.theme}
          </p>
        )}

        <p>{event.description}</p>

        <div className="event-detail-card-facts">
          <span>{event.date}</span>
          <span>{event.category}</span>
          <span>
            Event {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="event-detail-card-info">

        {/* ABOUT */}
        <div>
          <span>About</span>
          <p>{event.about}</p>
        </div>

        {/* VENUE */}
        <div>
          <span>Venue</span>

          <p className="event-venue-list">
            {event.venue.map((venue) => (
              <span key={venue}>{venue}</span>
            ))}
          </p>
        </div>

        {/* COORDINATORS */}
        <div>
          <span>Coordinators</span>

          <div className="event-coordinators-list">
            {coordinators.map((coordinator) => (
              <div
                className="event-coordinator-row"
                key={coordinator.name}
              >
                <span className="event-coordinator-name">
                  {coordinator.name}
                </span>

                <a
                  className="event-coordinator-call"
                  href={`tel:${coordinator.phone}`}
                  aria-label={`Call ${coordinator.name}`}
                >
                  <span>Call</span>
                  <span className="event-call-icon">📞</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* START TIME */}
        <div>
          <span>Start Time</span>

          <p className="event-start-time">
            {event.startTime}
          </p>
        </div>

        {/* REGISTER */}
        <Link
          className="event-details-register"
          to={`/register?event=${encodeURIComponent(event.name)}`}
        >
          Register Now <span>↗</span>
        </Link>

      </div>
    </article>
  );
}

export default Events;