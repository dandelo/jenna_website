const targetAt = new Date("2026-08-14T12:00:00+01:00");
const targetLabel = "Friday 14 August 2026";
const openedStorageKey = "jennaHomeCountdownOpenedV2";
const appPath = "/home-countdown";

const reveals = [
  {
    date: "2026-08-05",
    shortDate: "5 Aug",
    title: "A real first glimpse",
    kicker: "Today's treat",
    image: `${appPath}/assets/listing/photo-17.jpeg`,
    alt: "Exterior and parking area of Jenna's new home from the listing.",
    note: "The building is not just an idea anymore. It has windows, a path, and a Friday waiting for it.",
    accent: "#65c7c1",
  },
  {
    date: "2026-08-06",
    shortDate: "6 Aug",
    title: "Kitchen victory lap",
    kicker: "Tomorrow's treat",
    image: `${appPath}/assets/listing/photo-02.jpeg`,
    alt: "Kitchen from the listing with pale cabinetry and integrated appliances.",
    note: "First tea, first snacks, first standing in the kitchen saying: this is mine.",
    accent: "#ee6f5f",
  },
  {
    date: "2026-08-07",
    shortDate: "7 Aug",
    title: "Living room plans",
    kicker: "Treat pocket",
    image: `${appPath}/assets/listing/photo-06.jpeg`,
    alt: "Living room from the listing with sofas, TV, and bright windows.",
    note: "A whole corner ready for films, games, books, and deeply earned quiet.",
    accent: "#f6c84c",
  },
  {
    date: "2026-08-08",
    shortDate: "8 Aug",
    title: "Light through the blinds",
    kicker: "Treat pocket",
    image: `${appPath}/assets/listing/photo-09.jpeg`,
    alt: "Open-plan living area with large windows and the kitchen beyond.",
    note: "The windows are already doing excellent new-home work.",
    accent: "#4fa35a",
  },
  {
    date: "2026-08-09",
    shortDate: "9 Aug",
    title: "Hallway hello",
    kicker: "Treat pocket",
    image: `${appPath}/assets/listing/photo-10.jpeg`,
    alt: "Hallway from the listing with white doors, mirror, and a plant.",
    note: "The place where keys, shoes, bags, and arrivals are about to have a home.",
    accent: "#9bd6ef",
  },
  {
    date: "2026-08-10",
    shortDate: "10 Aug",
    title: "Bedroom calm",
    kicker: "Treat pocket",
    image: `${appPath}/assets/listing/photo-12.jpeg`,
    alt: "Bedroom from the listing with white bedding, curtains, and wall art.",
    note: "A calm room for sleeping properly after signing every last form.",
    accent: "#65c7c1",
  },
  {
    date: "2026-08-11",
    shortDate: "11 Aug",
    title: "Bathroom shine",
    kicker: "Treat pocket",
    image: `${appPath}/assets/listing/photo-15.jpeg`,
    alt: "Bathroom from the listing with bath, shower screen, basin, and towel rail.",
    note: "Clean, bright, and ready for the first everything shower after moving day.",
    accent: "#ee6f5f",
  },
  {
    date: "2026-08-12",
    shortDate: "12 Aug",
    title: "Open-plan glow",
    kicker: "Treat pocket",
    image: `${appPath}/assets/listing/photo-04.jpeg`,
    alt: "Open-plan living and kitchen area from the listing with sofa, pendant light, and bright windows.",
    note: "The cosy bit and the practical bit are already in conversation with each other.",
    accent: "#f6c84c",
  },
  {
    date: "2026-08-13",
    shortDate: "13 Aug",
    title: "The whole plan",
    kicker: "Almost keys",
    image: `${appPath}/assets/listing/floorplan.jpeg`,
    alt: "Floorplan from the listing showing kitchen lounge, bedroom, bathroom, and hall.",
    note: "One more sleep, and the floorplan stops being a diagram and starts being home.",
    accent: "#4fa35a",
  },
  {
    date: "2026-08-14",
    shortDate: "14 Aug",
    title: "Keys day",
    kicker: "Completion Friday",
    image: `${appPath}/assets/listing/photo-01.jpeg`,
    alt: "Front exterior of Jenna's new home from the listing.",
    note: "Today is the day. New keys, new door, new start, and a very deserved celebration.",
    accent: "#c89523",
  },
];

const els = {
  body: document.body,
  countdownStatus: document.querySelector("#countdown-status"),
  days: document.querySelector("#days"),
  daysLabel: document.querySelector("#days-label"),
  effectStatus: document.querySelector("#effect-status"),
  featuredFrame: document.querySelector("#featured-frame"),
  featuredImage: document.querySelector("#featured-image"),
  featuredKicker: document.querySelector("#featured-kicker"),
  featuredNote: document.querySelector("#featured-note"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  openToday: document.querySelector("#open-today"),
  pocketGrid: document.querySelector("#pocket-grid"),
  pocketStatus: document.querySelector("#pocket-status"),
  seconds: document.querySelector("#seconds"),
  targetLine: document.querySelector("#target-line"),
  timerLabel: document.querySelector("#timer-label"),
  title: document.querySelector("#today-title"),
  confettiLayer: document.querySelector("#confetti-layer"),
};

const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "short",
  timeZone: "Europe/London",
  weekday: "short",
});

const datePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/London",
  year: "numeric",
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let selectedIndex = findInitialIndex();
let openedDates = readOpenedDates();
let lastPocketRenderKey = "";

function readOpenedDates() {
  try {
    const parsed = JSON.parse(localStorage.getItem(openedStorageKey));
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function saveOpenedDates() {
  try {
    localStorage.setItem(openedStorageKey, JSON.stringify([...openedDates]));
  } catch {
    // Local storage can be disabled; the app still works without persistence.
  }
}

function londonDateString(date = new Date()) {
  const parts = Object.fromEntries(
    datePartsFormatter.formatToParts(date).map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function isUnlocked(reveal, now = new Date()) {
  return londonDateString(now) >= reveal.date || now >= targetAt;
}

function findInitialIndex(now = new Date()) {
  if (now >= targetAt) return reveals.length - 1;

  const today = londonDateString(now);
  const exactToday = reveals.findIndex((reveal) => reveal.date === today);
  if (exactToday >= 0) return exactToday;

  const latestUnlocked = reveals.findLastIndex((reveal) => reveal.date < today);
  return latestUnlocked >= 0 ? latestUnlocked : 0;
}

function formatNumber(value) {
  return String(value).padStart(2, "0");
}

function formatDifference(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function updateCountdown() {
  const now = new Date();
  const remaining = targetAt.getTime() - now.getTime();
  const diff = formatDifference(remaining);
  const isComplete = remaining <= 0;
  const londonToday = londonDateString(now);
  const pocketRenderKey = `${londonToday}-${isComplete}`;

  els.days.textContent = diff.days;
  els.hours.textContent = formatNumber(diff.hours);
  els.minutes.textContent = formatNumber(diff.minutes);
  els.seconds.textContent = formatNumber(diff.seconds);
  els.daysLabel.textContent = diff.days === 1 ? "day" : "days";
  els.body.dataset.countdownComplete = String(isComplete);

  if (isComplete) {
    els.timerLabel.textContent = "Keys are in";
    els.countdownStatus.textContent = "Jenna owns it";
    els.openToday.textContent = "Open keys day";
  } else if (londonToday === "2026-08-14") {
    els.timerLabel.textContent = "Keys today";
    els.countdownStatus.textContent = `UK time ${formatter.format(now)}`;
    els.openToday.textContent = "Open today's pocket";
  } else {
    els.timerLabel.textContent = "Keys in";
    els.countdownStatus.textContent = `UK time ${formatter.format(now)}`;
    els.openToday.textContent = "Open today's pocket";
  }

  els.targetLine.textContent = targetLabel;
  if (pocketRenderKey !== lastPocketRenderKey) {
    lastPocketRenderKey = pocketRenderKey;
    renderPockets();
  }
}

function setFeatured(index, { shouldCelebrate = false, markOpened = false } = {}) {
  const reveal = reveals[index];
  const unlocked = isUnlocked(reveal);
  const opened = openedDates.has(reveal.date);
  const shouldShowReveal = unlocked && (opened || markOpened);

  selectedIndex = index;
  els.featuredImage.src = reveal.image;
  els.featuredImage.alt = reveal.alt;
  els.featuredKicker.textContent = shouldShowReveal
    ? reveal.kicker
    : unlocked
      ? "Ready to open"
      : "Still wrapped";
  els.title.textContent = shouldShowReveal ? reveal.title : "A pocket is waiting";
  els.featuredNote.textContent = shouldShowReveal
    ? reveal.note
    : unlocked
      ? "Open today's pocket to reveal the photo and little new-home treat."
    : `This pocket opens on ${reveal.shortDate}.`;
  els.featuredFrame.classList.toggle("is-locked", !shouldShowReveal);
  els.pocketStatus.textContent = shouldShowReveal
    ? `${reveal.title} is open.`
    : unlocked
      ? `${reveal.title} is ready to open.`
    : `${reveal.title} opens on ${reveal.shortDate}.`;

  if (unlocked && markOpened) {
    openedDates.add(reveal.date);
    saveOpenedDates();
  }

  renderPockets();

  if (shouldCelebrate && unlocked) {
    launchConfetti();
    els.effectStatus.textContent = `${reveal.title} opened.`;
  }
}

function renderPockets() {
  const now = new Date();
  els.pocketGrid.replaceChildren(
    ...reveals.map((reveal, index) => createPocket(reveal, index, now))
  );
}

function createPocket(reveal, index, now) {
  const unlocked = isUnlocked(reveal, now);
  const opened = openedDates.has(reveal.date);
  const button = document.createElement("button");
  const image = document.createElement("img");
  const body = document.createElement("span");
  const date = document.createElement("span");
  const title = document.createElement("span");
  const state = document.createElement("span");

  button.type = "button";
  button.className = "pocket";
  button.style.setProperty("--accent", reveal.accent);
  button.dataset.locked = String(!unlocked);
  button.setAttribute(
    "aria-label",
    unlocked ? `Open ${reveal.title}` : `${reveal.title} opens on ${reveal.shortDate}`
  );
  button.classList.toggle("is-selected", index === selectedIndex);
  button.classList.toggle("is-opened", opened);

  image.className = "pocket__image";
  image.src = reveal.image;
  image.alt = "";
  image.loading = index < 4 ? "eager" : "lazy";

  body.className = "pocket__body";
  date.className = "pocket__date";
  title.className = "pocket__title";
  state.className = "pocket__state";

  date.textContent = reveal.shortDate;
  title.textContent = reveal.title;
  state.textContent = unlocked ? (opened ? "Opened" : "Open") : "Locked";

  body.append(date, title, state);
  button.append(image, body);

  button.addEventListener("click", () => {
    if (!unlocked) {
      shakePocket(button);
      els.pocketStatus.textContent = `${reveal.title} opens on ${reveal.shortDate}.`;
      return;
    }

    setFeatured(index, { shouldCelebrate: true, markOpened: true });
  });

  return button;
}

function shakePocket(button) {
  button.classList.remove("is-shake");
  window.requestAnimationFrame(() => {
    button.classList.add("is-shake");
  });
}

function launchConfetti() {
  if (reduceMotion.matches) return;

  const colours = ["#ee6f5f", "#65c7c1", "#f6c84c", "#4fa35a", "#9bd6ef", "#c89523"];
  const pieces = 42;

  for (let index = 0; index < pieces; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--x", `${Math.random() * 100}vw`);
    piece.style.setProperty("--drift", `${Math.random() * 140 - 70}px`);
    piece.style.setProperty("--rotation", `${Math.random() * 360}deg`);
    piece.style.setProperty("--duration", `${1.8 + Math.random() * 1.2}s`);
    piece.style.setProperty("--color", colours[index % colours.length]);
    els.confettiLayer.append(piece);
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
  }
}

els.openToday.addEventListener("click", () => {
  setFeatured(findInitialIndex(), { shouldCelebrate: true, markOpened: true });
});

updateCountdown();
setFeatured(selectedIndex);
window.setInterval(updateCountdown, 1000);
