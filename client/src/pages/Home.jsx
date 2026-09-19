import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaEnvelope, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa6";
import "../App.css";
import eventsData from "../data/eventsData";

const EVENT_NAME = "SPRING FEST'26";
const EVENT_DATE = "2026-10-09T00:00:00+05:30";
const EVENT_DISPLAY_DATE = "9 October 2026";
const EVENT_VENUE = "D Block";
const EVENT_COLLEGE = "KSR College of Engineering";

const paperEvent = eventsData.find((event) => event.slug === "paper-presentation");
const technicalEvents = eventsData.filter((event) => event.category === "Technical Event");
const nonTechnicalEvents = eventsData.filter((event) => event.category === "Non-Technical Event");
const workshopEvent = eventsData.find((event) => event.slug === "workshop");

const stats = [
  { value: "09", label: "Events" },
  { value: "1000+", label: "Participants" },
  { value: "02", label: "Days" },
  { value: "₹20,000", label: "Prize Pool" },
];

const featureCards = [
  { icon: "⚡", title: "Innovation", text: "Explore ideas that solve real challenges with creativity and technical depth." },
  { icon: "🏁", title: "Competition", text: "Test your skills in focused, high-energy technical challenges and events." },
  { icon: "📚", title: "Learning", text: "Learn from peers, mentors and the latest trends shaping modern technology." },
  { icon: "🤝", title: "Networking", text: "Meet students, creators and innovators while building lasting connections." },
];

const reasons = [
  { icon: "⚡", title: "Challenge Yourself", text: "Compete with talented students and push your limits." },
  { icon: "💡", title: "Build & Innovate", text: "Transform ideas into practical solutions with real-world impact." },
  { icon: "🏆", title: "Get Recognized", text: "Showcase your skills and make your achievements stand out." },
  { icon: "🤝", title: "Connect", text: "Meet students, creators and technology enthusiasts from across campuses." },
];

const timeline = [
  { label: "Registration Opens", date: "25 August 2026" },
  { label: "Registration Closes", date: "07 October 2026" },
  { label: "On Spot", date: "09 October 2026" },
  { label: "Prize Distribution", date: "By 3.00 PM" },
];

const highlightCards = [
  { title: "Top 3 Paper Presentation", value: "₹7,000" },
  { title: "All Other Events", value: "₹1,000" },
  { title: "Best Innovation", value: "Certificate + Recognition" },
  { title: "Participation", value: "Certificate" },
];

const faqItems = [
  {
    question: "What events are available?",
    answer: `${EVENT_NAME} includes Paper Presentation, four Technical and Non-Technical Events, and a Workshop. Participants can explore the separate Events page for complete event details.`,
  },
  {
    question: "How do I register?",
    answer: 'Click the Register Now button, enter your required personal and college details, select your event, complete the payment process if applicable, and submit the registration form.',
  },
  {
    question: "What are the registration fees?",
    answer: "Registration fees depend on the selected event. The applicable fee is displayed from the existing event registration configuration.",
  },
  {
    question: "How do I complete the payment?",
    answer: "Select the required event during registration, follow the displayed payment instructions, and upload the required payment proof before submitting the registration.",
  },
];

const rulesItems = [
  {
    question: `Who can participate in ${EVENT_NAME}?`,
    answer: `${EVENT_NAME} is open to college students who are interested in participating in the listed technical and non-technical events. Participants should complete the registration process and meet the requirements of their selected event.`,
  },
  {
    question: "What are the team size limits?",
    answer: "Team size depends on the selected event. Participants must follow the team-size limit specified for that particular event during registration.",
  },
  {
    question: "What are the registration requirements?",
    answer: "Participants must provide accurate personal and college details and complete the required event registration and payment process before the registration deadline.",
  },
  {
    question: "What are the payment requirements?",
    answer: "Participants must complete the applicable event payment and upload valid payment proof during registration. The payment details should be clear and accurate.",
  },
];

const studentCoordinatorGroups = [
  [
    { name: "S. JayaKavin", phone: "7634920716" },
    { name: "S. Gowtham", phone: "9362719307" },
  ],
  [
    { name: "S. Haripriya", phone: "9360638166" },
    { name: "V. Ragavaraja", phone: "9790260910" },
  ],
];

function getTimeRemaining(targetDate) {
  const difference = new Date(targetDate).getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  };
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(EVENT_DATE));
  const [openFaq, setOpenFaq] = useState(null);
  const [openRules, setOpenRules] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeRemaining(EVENT_DATE)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="techno-page" id="top">
      <header className="site-header">
        <nav className="navbar container" aria-label="Main navigation">
          <Link to="/" className="brand" aria-label="SPRING FEST 26 home">
            <span className="brand-mark">💻</span>
            <span>{EVENT_NAME}</span>
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#top">Home</a>
            <a href="#events">Events</a>
            <Link to="/admin">Admin</Link>
            <a href="#venue">Venue</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Link to="/register" className="nav-register-button">
              Register Now
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">National Level Technical Symposium</span>
              <h1>{EVENT_NAME}</h1>
              <p className="tagline">INNOVATE • COMPETE • CREATE</p>
              <p className="hero-description">
                Where ideas meet innovation, technology meets creativity, and students turn challenges into solutions.
              </p>

              <div className="hero-actions">
                <Link to="/register" className="primary-btn large-btn">
                  REGISTER NOW
                </Link>
                <Link to="/events" className="secondary-btn large-btn light-btn">
                  EXPLORE EVENTS
                </Link>
              </div>

              <div className="hero-meta">
                <div>
                  <span>Event Date</span>
                  <strong>{EVENT_DISPLAY_DATE}</strong>
                </div>
                <div>
                  <span>Venue</span>
                  <strong>{EVENT_VENUE}</strong>
                </div>
                <div>
                  <span>College</span>
                  <strong>{EVENT_COLLEGE}</strong>
                </div>
              </div>
            </div>

            <div className="hero-panel" aria-label="Event highlights card">
              <div className="panel-badge">SYMPOSIUM 2026</div>
              <h2>Build ideas. Lead innovation.</h2>
              <p>
                A premium platform for students to showcase talent, creativity, problem-solving and technical excellence.
              </p>

              <div className="mini-highlight-list">
                <div>
                  <strong>Day 1 - Paper Presentation</strong>
                  <span>A platform for students to present innovative ideas.</span>
                </div>
                <div>
                  <strong>Day 1 - Technical &amp; Non-Technical Events</strong>
                  <span>Four different challenges.</span>
                </div>
                <div>
                  <strong>Day 2 - Workshop</strong>
                  <span>Agentic AI and cloud-native development.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="countdown-wrap container" aria-label="Countdown timer">
            {timeLeft.expired ? (
              <div className="countdown-box" style={{ gridColumn: "1 / -1" }}>
                <span>EVENT DAY IS HERE!</span>
                <label>{EVENT_NAME}</label>
              </div>
            ) : (
              <>
                <div className="countdown-box">
                  <span>{String(timeLeft.days).padStart(2, "0")}</span>
                  <label>Days</label>
                </div>
                <div className="countdown-box">
                  <span>{String(timeLeft.hours).padStart(2, "0")}</span>
                  <label>Hours</label>
                </div>
                <div className="countdown-box">
                  <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <label>Minutes</label>
                </div>
                <div className="countdown-box">
                  <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
                  <label>Seconds</label>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="stats-section container">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </section>

        <section className="why-section container">
          <div className="section-heading">
            <span className="section-tag">Why us</span>
            <h2>{`WHY ${EVENT_NAME}?`}</h2>
          </div>

          <div className="reasons-grid">
            {reasons.map((item) => (
              <article className="reason-card" key={item.title}>
                <div className="reason-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="events-showcase container" id="events">
          <div className="section-heading">
            <span className="section-tag">SPRING FEST '26</span>
            <h2>EVENTS</h2>
            <p className="section-subtitle">Explore. Compete. Create. Experience a complete day of technical innovation, creativity and fun.</p>
          </div>

          <div className="event-day-heading event-day-marker">
            <span className="section-tag">DAY 1</span>
            <strong>{EVENT_DISPLAY_DATE}</strong>
          </div>

          <div className="event-card-grid event-preview-grid">
            <article className="event-card event-small-card">
              <div className="event-card-topline"><span className="event-number">01</span><span className="event-icon">{paperEvent.icon}</span></div>
              <div className="event-content">
                <span className="event-card-label">PAPER PRESENTATION</span>
                <h3>{paperEvent.name}</h3>
                <p>{paperEvent.description}</p>
              </div>
              <div className="event-meta"><span>Paper Presentation</span><span>Day 1</span></div>
              <Link className="event-text-action" to={`/events?event=${paperEvent.slug}`}>VIEW DETAILS <span>→</span></Link>
            </article>
          </div>

          <div className="event-grid-heading">
            <span className="section-tag">01 — TECHNICAL ARENA</span>
            <h3>TECHNICAL EVENTS</h3>
            <p>Test your technical skills, creativity and problem-solving ability.</p>
          </div>
          <div className="event-card-grid">
            {technicalEvents.map((event, index) => (
              <article className="event-card event-small-card" key={event.slug}>
                <div className="event-card-topline"><span className="event-number">0{index + 1}</span><span className="event-icon">{event.icon}</span></div>
                <div className="event-content">
                  <span className="event-card-label">TECHNICAL EVENT</span>
                  <h3>{event.name}</h3>
                  <p>{event.description}</p>
                </div>
                <div className="event-meta"><span>Technical Event</span><span>Day 1</span></div>
                <Link className="event-text-action" to={`/events?event=${event.slug}`}>VIEW DETAILS <span>→</span></Link>
              </article>
            ))}
          </div>

          <div className="event-grid-heading event-grid-heading-spaced">
            <span className="section-tag">02 — OPEN ARENA</span>
            <h3>NON-TECHNICAL EVENTS</h3>
            <p>Relax, compete and have fun beyond the technical arena.</p>
          </div>
          <div className="event-card-grid">
            {nonTechnicalEvents.map((event, index) => (
              <article className="event-card event-small-card" key={event.slug}>
                <div className="event-card-topline"><span className="event-number">0{index + 1}</span><span className="event-icon">{event.icon}</span></div>
                <div className="event-content">
                  <span className="event-card-label">NON-TECHNICAL EVENT</span>
                  <h3>{event.name}</h3>
                  <p>{event.description}</p>
                </div>
                <div className="event-meta"><span>Non-Technical Event</span><span>Day 1</span></div>
                <Link className="event-text-action" to={`/events?event=${event.slug}`}>VIEW DETAILS <span>→</span></Link>
              </article>
            ))}
          </div>

          <div className="event-day-heading event-day-marker day-two-heading">
            <span className="section-tag">DAY 2</span>
            <strong>{EVENT_DISPLAY_DATE}</strong>
          </div>

          <div className="event-card-grid event-preview-grid">
            <article className="event-card event-small-card workshop-preview-card">
              <div className="event-card-topline"><span className="event-number">01</span><span className="event-icon">{workshopEvent.icon}</span></div>
              <div className="event-content">
                <span className="event-card-label">WORKSHOP</span>
                <h3>{workshopEvent.name}</h3>
                <p>{workshopEvent.description}</p>
              </div>
              <div className="event-meta"><span>Workshop</span><span>Day 2</span></div>
              <Link className="event-text-action" to={`/events?event=${workshopEvent.slug}`}>VIEW DETAILS <span>→</span></Link>
            </article>
          </div>
        </section>

        <section className="timeline-section container" id="schedule">
          <div className="section-heading">
            <span className="section-tag">Timeline</span>
            <h2>EVENT TIMELINE</h2>
          </div>

          <div className="timeline">
            {timeline.map((item, index) => (
              <div key={item.label} className="timeline-item">
                <div className="timeline-dot" />
                {index < timeline.length - 1 && <div className="timeline-line" />}
                <div className="timeline-content">
                  <strong>{item.label}</strong>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="prizes-section container">
          <div className="section-heading">
            <span className="section-tag">Highlights</span>
            <h2>PRIZES &amp; HIGHLIGHTS</h2>
          </div>

          <div className="highlight-grid">
            {highlightCards.map((item) => (
              <article className="highlight-card" key={item.title}>
                <div className="highlight-value">{item.value}</div>
                <div className="highlight-title">{item.title}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="rules-section container">
          <div className="section-heading">
            <span className="section-tag">Guidelines</span>
            <h2>RULES &amp; GUIDELINES</h2>
            <p className="section-subtitle">Please read the following guidelines carefully before participating.</p>
          </div>

          <div className="accordion-list">
            {rulesItems.map((item, index) => {
              const isOpen = openRules === index;
              return (
                <div key={item.question} className={`accordion-item ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="accordion-button"
                    onClick={() => setOpenRules(isOpen ? null : index)}
                  >
                    <span className="accordion-question-text">{item.question}</span>
                    <span className="accordion-icon" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                  </button>
                  <div className="accordion-content">
                    <div className="accordion-body">
                      {item.answer.split("\n").map((line, lineIndex) => (
                        <span key={`${item.question}-${lineIndex}`}>
                          {line}
                          {lineIndex < item.answer.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="faq-section container">
          <div className="section-heading">
            <span className="section-tag">FAQ</span>
            <h2>FAQ</h2>
            <p className="section-subtitle">Everything you need to know before participating in {EVENT_NAME}.</p>
          </div>

          <div className="accordion-list">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={item.question} className={`accordion-item ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="accordion-button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <span className="accordion-question-text">{item.question}</span>
                    <span className="accordion-icon" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                  </button>
                  <div className="accordion-content">
                    <div className="accordion-body">
                      {item.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="venue-section container" id="venue">
          <div className="section-heading">
            <span className="section-tag">Venue</span>
            <h2>VENUE</h2>
          </div>

          <div className="venue-panel">
            <div className="venue-icon">📍</div>
            <div className="venue-text">
              <h3>{EVENT_COLLEGE}</h3>
              <p>{EVENT_COLLEGE}</p>
              <p>{EVENT_VENUE}</p>
              <p>KSR College of Engineering, Tamil Nadu</p>
            </div>
            <a
              className="maps-btn"
              href="https://maps.app.goo.gl/DN1Egk4oiSWPZTHf9?g_st=ac"
              target="_blank"
              rel="noopener noreferrer"
            >
              VIEW ON GOOGLE MAPS
            </a>
          </div>
        </section>

        <section className="feature-section container" id="about">
          <div className="section-heading align-left">
            <span className="section-tag">About</span>
            <h2>{`ABOUT ${EVENT_NAME}`}</h2>
          </div>

          <div className="about-layout">
            <div className="about-copy">
              <p>
                {EVENT_NAME} is a platform for students to showcase technical knowledge, creativity,
                problem-solving skills and innovative ideas through exciting competitions and events.
              </p>
            </div>

            <div className="feature-grid">
              {featureCards.map((card) => (
                <article className="feature-card" key={card.title}>
                  <div className="feature-icon">{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section container" id="contact">
          <div className="section-heading">
            <span className="section-tag">Support & Queries</span>
            <h2>CONTACT COORDINATORS</h2>
          </div>

          <div className="coordinator-grid">
            {studentCoordinatorGroups.map((group, groupIndex) => (
              <article className="coordinator-card student-coordinator-card" key={`student-coordinators-${groupIndex}`}>
                <h3>Student Coordinators</h3>
                {group.map((person) => (
                  <div className="student-coordinator" key={person.phone}>
                    <div className="coordinator-info"><strong>{person.name}</strong><a href={`tel:${person.phone}`}>{person.phone}</a></div>
                    <a href={`tel:${person.phone}`} className="small-call-btn">📞 Call</a>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section className="social-section container">
          <div className="section-heading">
            <span className="section-tag">Connect</span>
            <h2>FOLLOW US</h2>
          </div>

          <div className="social-links">
            <div className="social-item">
              <a href="https://www.instagram.com/ksr_infospark?stkn=MXdiY3RqOTE5Y3libw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><FaInstagram aria-hidden="true" /></a>
              <span>Instagram</span>
            </div>
            <div className="social-item">
              <a href="https://www.linkedin.com/company/ksrce/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><FaLinkedinIn aria-hidden="true" /></a>
              <span>LinkedIn</span>
            </div>
            <div className="social-item">
              <a href="https://youtube.com/@ksrceites?si=Y1B2AX5nr98KO7vn" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube"><FaYoutube aria-hidden="true" /></a>
              <span>YouTube</span>
            </div>
            <div className="social-item">
              <a href="mailto:astra2k26@gmail.com" aria-label="Gmail" title="Gmail"><FaEnvelope aria-hidden="true" /></a>
              <span>Gmail</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <h3>{EVENT_NAME}</h3>
            <p>INNOVATE • COMPETE • CREATE</p>
          </div>

          <div className="footer-links">
            <a href="#top">Home</a>
            <a href="#about">About</a>
            <Link to="/events">Events</Link>
            <Link to="/register">Register</Link>
            <a href="#venue">Venue</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="footer-socials">
            <a href="https://www.instagram.com/ksr_infospark?stkn=MXdiY3RqOTE5Y3libw==" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.linkedin.com/company/ksrce/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://youtube.com/@ksrceites?si=Y1B2AX5nr98KO7vn" target="_blank" rel="noopener noreferrer">YouTube</a>
            <a href="mailto:astra2k26@gmail.com">Gmail</a>
          </div>
        </div>
        <div className="container footer-bottom">© 2026 {EVENT_NAME} | All Rights Reserved.</div>
      </footer>
    </div>
  );
}

export default Home;
