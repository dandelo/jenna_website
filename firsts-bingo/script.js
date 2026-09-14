const bingoItems = [
  { title: "First cup of tea", icon: "☕", tone: "teal" },
  { title: "First meal cooked", icon: "🍳", tone: "cream" },
  { title: "First takeaway", icon: "🥡", tone: "yellow" },
  { title: "First cake baked", icon: "🧁", tone: "cream" },
  { title: "First visitor", icon: "👋", tone: "teal" },
  { title: "First post delivered", icon: "✉️", tone: "cream" },
  { title: "First clinked glass", icon: "🥂", tone: "green" },
  { title: "First box unpacked", icon: "📦", tone: "cream" },
  { title: "First room finished", icon: "🛋️", tone: "teal" },
  { title: "First picture hung", icon: "🖼️", tone: "cream" },
  { title: "First laundry load", icon: "🧺", tone: "yellow" },
  { title: "First bin day solved", icon: "🗑️", tone: "cream" },
  { title: "Keys collected", icon: "🔑", tone: "navy" },
  { title: "First plant bought", icon: "🪴", tone: "cream" },
  { title: "First sofa nap", icon: "💤", tone: "yellow" },
  { title: "First movie night", icon: "🎬", tone: "cream" },
  { title: "First morning coffee", icon: "☕", tone: "teal" },
  { title: "First cosy night", icon: "🕯️", tone: "cream" },
  { title: "First rubiks cube solve", icon: "🧩", tone: "green" },
  { title: "First poop", icon: "💩", tone: "cream" },
  { title: "First hoover round", icon: "🧹", tone: "teal" },
  { title: "First lie-in", icon: "🛏️", tone: "cream" },
  { title: "First neighbour hello", icon: "👋", tone: "yellow" },
  { title: "First sleep", icon: "🌙", tone: "cream" },
  { title: "First fridge stocked", icon: "🧊", tone: "teal" },
];

const cookieName = "homeFirstsBingo";
const listVersion = "home-firsts-bingo-2026-08-10-full-house";
const cookieMaxAge = 60 * 60 * 24 * 365;
const tileTones = ["teal", "cream", "yellow", "green", "navy"];
const celebrationColours = ["#ffc414", "#0f8f83", "#d73627", "#7eaa2d", "#07162c"];

const winningLines = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const els = {
  board: document.querySelector("#bingo-board"),
  effectStatus: document.querySelector("#effect-status"),
  fullHouseCloseButtons: document.querySelectorAll("[data-full-house-close]"),
  fullHouseModal: document.querySelector("#full-house-modal"),
  paletteButton: document.querySelector("#palette-button"),
  resetButton: document.querySelector("#reset-button"),
  scoreMagnet: document.querySelector("#score-magnet"),
  shareButton: document.querySelector("#share-button"),
  statusLine: document.querySelector("#status-line"),
  celebrationLayer: document.querySelector("#celebration-layer"),
};

function readCookie(name) {
  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${encodeURIComponent(name)}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function writeCookie(name, value) {
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${cookieMaxAge}; Path=/firsts-bingo; SameSite=Lax${secureFlag}`;
}

function loadState() {
  const stored = readCookie(cookieName);
  if (!stored) {
    return {
      completed: new Set(),
      toneOffset: 0,
    };
  }

  try {
    const parsed = JSON.parse(stored);
    if (parsed?.version !== listVersion || typeof parsed?.completed !== "string") {
      return {
        completed: new Set(),
        toneOffset: 0,
      };
    }

    return {
      completed: new Set(
        parsed.completed
          .split("")
          .map((value, index) => (value === "1" ? index : null))
          .filter((index) => Number.isInteger(index) && index >= 0 && index < bingoItems.length),
      ),
      toneOffset: Number.isInteger(parsed.toneOffset) ? parsed.toneOffset : 0,
    };
  } catch {
    return {
      completed: new Set(),
      toneOffset: 0,
    };
  }
}

let state = loadState();
let lastFocusedElement = null;

function saveState() {
  const completedString = bingoItems
    .map((_, index) => (state.completed.has(index) ? "1" : "0"))
    .join("");

  writeCookie(
    cookieName,
    JSON.stringify({
      version: listVersion,
      completed: completedString,
      toneOffset: state.toneOffset,
    }),
  );
}

function completedLines() {
  return winningLines.filter((line) => line.every((index) => state.completed.has(index)));
}

function displayTone(item, index) {
  if (item.tone === "navy") return "navy";
  const baseIndex = tileTones.indexOf(item.tone);
  const nextIndex = (baseIndex + state.toneOffset + index) % tileTones.length;
  return tileTones[nextIndex] === "navy" ? "cream" : tileTones[nextIndex];
}

function statusText(done, lineTotal) {
  if (done === 0) return "No firsts checked off yet.";
  if (done === bingoItems.length) return "Full house: every new-home first has landed.";
  if (lineTotal > 0) {
    return `${lineTotal} bingo line${lineTotal === 1 ? "" : "s"} complete. ${bingoItems.length - done} to go.`;
  }

  return `${done} of ${bingoItems.length} firsts checked off.`;
}

function buildCard(item, index, lineIndexes) {
  const card = document.createElement("button");
  const tone = displayTone(item, index);

  card.type = "button";
  card.className = `bingo-tile bingo-tile--${tone}`;
  card.dataset.index = String(index);
  card.setAttribute("aria-pressed", state.completed.has(index) ? "true" : "false");
  card.setAttribute("aria-label", `${item.title}${state.completed.has(index) ? ", done" : ""}`);

  if (item.title.length > 23) {
    card.classList.add("bingo-tile--long");
  }

  if (state.completed.has(index)) {
    card.classList.add("is-done");
  }

  if (lineIndexes.has(index)) {
    card.classList.add("bingo-tile--line");
  }

  const icon = document.createElement("span");
  icon.className = "tile-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = item.icon;

  const title = document.createElement("span");
  title.className = "tile-title";
  title.textContent = item.title;

  const check = document.createElement("span");
  check.className = "check-magnet";
  check.setAttribute("aria-hidden", "true");
  check.textContent = "✓";

  card.append(icon, title, check);
  return card;
}

function renderBoard() {
  const lineIndexes = new Set(completedLines().flat());
  const fragment = document.createDocumentFragment();

  bingoItems.forEach((item, index) => {
    fragment.append(buildCard(item, index, lineIndexes));
  });

  els.board.replaceChildren(fragment);

  const done = state.completed.size;
  const lineTotal = completedLines().length;
  els.scoreMagnet.textContent = `${done} of ${bingoItems.length}`;
  els.statusLine.textContent = statusText(done, lineTotal);
}

function celebrate(isFullHouse = false) {
  if (reduceMotion.matches) return;

  const pieceCount = isFullHouse ? 96 : 24;
  for (let index = 0; index < pieceCount; index += 1) {
    const piece = document.createElement("span");
    piece.className = "celebration-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = celebrationColours[index % celebrationColours.length];
    piece.style.animationDelay = `${Math.random() * 180}ms`;
    piece.style.animationDuration = `${860 + Math.random() * 560}ms`;
    els.celebrationLayer.append(piece);
    window.setTimeout(() => piece.remove(), 1600);
  }
}

function showFullHousePopup() {
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  els.fullHouseModal.hidden = false;
  document.body.classList.add("has-open-modal");
  els.fullHouseModal.querySelector(".full-house-close")?.focus();
}

function closeFullHousePopup() {
  if (els.fullHouseModal.hidden) return;

  els.fullHouseModal.hidden = true;
  document.body.classList.remove("has-open-modal");
  lastFocusedElement?.focus();
}

function toggleCard(index) {
  const previousLineTotal = completedLines().length;
  const wasDone = state.completed.has(index);

  if (wasDone) {
    state.completed.delete(index);
  } else {
    state.completed.add(index);
  }

  saveState();
  renderBoard();

  const newLineTotal = completedLines().length;
  if (!wasDone && state.completed.size === bingoItems.length) {
    celebrate(true);
    showFullHousePopup();
    els.effectStatus.textContent = "Full house complete.";
  } else if (!wasDone && newLineTotal > previousLineTotal) {
    celebrate();
    els.effectStatus.textContent = "Bingo line complete.";
  } else {
    els.effectStatus.textContent = `${bingoItems[index].title} ${wasDone ? "unchecked" : "checked off"}.`;
  }
}

async function shareBoard() {
  const url = `${window.location.origin}/firsts-bingo/`;
  if (navigator.share) {
    await navigator.share({
      title: "Home Firsts Bingo",
      url,
    });
    return;
  }

  await navigator.clipboard?.writeText(url);
  els.effectStatus.textContent = "Bingo link copied.";
}

els.board.addEventListener("click", (event) => {
  const card = event.target.closest(".bingo-tile");
  if (!card) return;

  const index = Number.parseInt(card.dataset.index, 10);
  if (Number.isNaN(index)) return;

  toggleCard(index);
});

els.paletteButton.addEventListener("click", () => {
  state.toneOffset = (state.toneOffset + 1) % tileTones.length;
  saveState();
  renderBoard();
});

els.resetButton.addEventListener("click", () => {
  if (state.completed.size === 0) return;

  const shouldReset = window.confirm("Reset Home Firsts Bingo?");
  if (!shouldReset) return;

  state = {
    completed: new Set(),
    toneOffset: state.toneOffset,
  };
  saveState();
  renderBoard();
  els.effectStatus.textContent = "Bingo board reset.";
});

els.shareButton.addEventListener("click", () => {
  shareBoard().catch(() => {
    els.effectStatus.textContent = "Could not copy the bingo link.";
  });
});

els.fullHouseCloseButtons.forEach((button) => {
  button.addEventListener("click", closeFullHousePopup);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeFullHousePopup();
  }
});

renderBoard();
