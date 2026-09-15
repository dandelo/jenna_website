const initialTasks = [
  "buy a hanging plant",
  "tell me something that's just a little bit scary to share",
  "put up the new key shelf",
  "go to the gym next week",
  "make a playlist of songs to dance and cook to in the kitchen",
  "buy and assemble the second bedside table",
  "invite Dylan to something",
  "take a walk around the fields by your home with no phone (Dylan's can be invited)",
  "buy a mirror for the hallway",
  "try cooking one recipe you've never attempted before",
];

const storageKey = "tinyWinsTodo";
const cookieName = "tinyWinsTodo";
const listVersion = "jenna-list-2026-09-15-progression";
const cookieMaxAge = 60 * 60 * 24 * 180;
const maxPersistedTasks = 30;
const maxHistoryDays = 400;
const defaultLevels = {
  worry: 3,
  gym: 0,
};
const defaultTheme = "classic";

// XP + level progression. XP is earned per completed task and per daily streak day.
const xpPerCompletion = 12;
const xpPerStreakDay = 6;
const gameUnlockLevel = 2;
// XP required to *reach* a given level index (level 1 = 0 XP). Smooth-ish curve.
function xpForLevel(level) {
  if (level <= 1) return 0;
  // Quadratic-ish curve: level 2 = 40, 3 = 110, 4 = 210, 5 = 340, ...
  return Math.round(20 * (level - 1) * level - 20 * (level - 1));
}

function levelForXp(xp) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level += 1;
  return level;
}

// Themes catalogue. `unlockLevel` gates a theme behind a player level.
// classic + homewarming are always available (backwards compatible).
const themeCatalogue = [
  {
    key: "classic",
    name: "Classic",
    unlockLevel: 1,
    swatch: ["#92ccea", "#c8a7dd", "#ee6f98"],
    metaColor: "#92ccea",
    text: {
      eyebrow: "Tiny missions",
      title: "Tiny Wins Todo",
      copy: "A cheerful little list for getting the good stuff done.",
      activeTitle: "Still in progress",
      doneTitle: "Done and dusted",
    },
  },
  {
    key: "homewarming",
    name: "Homewarming",
    unlockLevel: 1,
    swatch: ["#f0b971", "#dd7a72", "#b7d3ad"],
    metaColor: "#f0b971",
    text: {
      eyebrow: "Homewarming mode",
      title: "New Home Nesting",
      copy: "Warm little missions for settling in, making memories, and claiming the sofa properly.",
      activeTitle: "Still settling in",
      doneTitle: "Moved into done",
    },
  },
  {
    key: "meadow",
    name: "Meadow",
    unlockLevel: 2,
    swatch: ["#8fd6a8", "#f2d377", "#7fb2e0"],
    metaColor: "#8fd6a8",
    text: {
      eyebrow: "Meadow mode",
      title: "Sunny Meadow List",
      copy: "Fresh-air missions for a bright, breezy, grass-between-your-toes kind of day.",
      activeTitle: "Growing still",
      doneTitle: "Gathered in",
    },
  },
  {
    key: "candy",
    name: "Candy",
    unlockLevel: 3,
    swatch: ["#ff9ec4", "#ffd36e", "#b79cff"],
    metaColor: "#ff9ec4",
    text: {
      eyebrow: "Candy mode",
      title: "Sweet Little Wins",
      copy: "Bubblegum missions for treating yourself while you tick things off.",
      activeTitle: "Still on the shelf",
      doneTitle: "In the sweet jar",
    },
  },
  {
    key: "midnight",
    name: "Midnight",
    unlockLevel: 4,
    swatch: ["#8ea2ff", "#c79bff", "#5fd0d6"],
    metaColor: "#1b2145",
    text: {
      eyebrow: "Midnight mode",
      title: "Quiet Hours List",
      copy: "Soft, low-light missions for winding down and being kind to future you.",
      activeTitle: "Still glowing",
      doneTitle: "Tucked in",
    },
  },
  {
    key: "cosmic",
    name: "Cosmic",
    unlockLevel: 5,
    swatch: ["#a78bfa", "#ff8fd0", "#61e6ff"],
    metaColor: "#160f2e",
    text: {
      eyebrow: "Cosmic mode",
      title: "Stardust Missions",
      copy: "Big-sky missions for when you are basically running the whole galaxy today.",
      activeTitle: "Still in orbit",
      doneTitle: "Landed",
    },
  },
];

const themeByKey = Object.fromEntries(themeCatalogue.map((entry) => [entry.key, entry]));
// themeText kept for compatibility with existing lookups.
const themeText = Object.fromEntries(
  themeCatalogue.map((entry) => [entry.key, entry.text]),
);

// Companion character. Moods map to an SVG face/pose + a line of copy.
const defaultCompanionName = "Pip";
const companionMoods = {
  celebrate: { face: "celebrate", line: (n) => `${n} is doing a little victory dance!` },
  rolling: { face: "happy", line: (n) => `${n} loves this momentum.` },
  happy: { face: "happy", line: (n) => `${n} is proud of you.` },
  ready: { face: "ready", line: (n) => `${n} is ready when you are.` },
  sleepy: { face: "sleepy", line: (n) => `${n} is getting cosy for the night.` },
  droopy: { face: "droopy", line: (n) => `${n} misses ticking things off with you.` },
};
const maxLevels = {
  worry: 5,
  gym: 3,
};
const milestoneBadges = [
  {
    key: "first",
    label: "First win",
    detail: "1 done",
    isEarned: ({ done }) => done >= 1,
  },
  {
    key: "three",
    label: "Triple sparkle",
    detail: "3 done",
    isEarned: ({ done }) => done >= 3,
  },
  {
    key: "halfway",
    label: "Half-way there",
    detail: "half done",
    isEarned: ({ done, total }) => total > 1 && done >= Math.ceil(total / 2),
  },
  {
    key: "all",
    label: "List legend",
    detail: "all done",
    isEarned: ({ done, total }) => total > 0 && done === total,
  },
];
const compliments = [
  "Jenna has a very rare talent for being clever and deeply kind at the same time.",
  "Jenna makes ordinary moments feel like they have better lighting.",
  "Jenna's brain is doing premium work, even when it pretends it is winging it.",
  "Jenna has excellent instincts and an unreasonable amount of charm.",
  "Jenna is thoughtful in a way that quietly changes the whole room.",
  "Jenna brings top-tier wit with properly excellent emotional intelligence.",
  "Jenna deserves credit for every invisible thing she keeps carrying.",
  "Jenna is funny, resilient, warm, and alarmingly good company.",
  "Jenna has the energy of someone who could fix a spreadsheet and a mood.",
  "Jenna notices the little things, which is secretly a superpower.",
  "Jenna's kindness has range, depth, and very good timing.",
  "Jenna is allowed to be proud of herself without filing a supporting essay.",
  "Jenna can make a small plan feel possible instead of annoying.",
  "Jenna has a five-star combination of brains, warmth, and excellent nonsense.",
  "Jenna is exactly the sort of person people feel lucky to know.",
  "Jenna handles more than she gives herself credit for.",
  "Jenna makes a home feel warmer just by being properly herself in it.",
  "Jenna has excellent taste in tiny joys and very important snacks.",
  "Jenna is brave in quiet ways that still absolutely count.",
  "Jenna brings the sort of humour that makes hard days loosen their grip.",
  "Jenna's company is the good kind of easy.",
  "Jenna is building a life that deserves soft lighting and applause.",
  "Jenna has strong main-character-on-a-comfy-sofa energy.",
  "Jenna is allowed to take up space, rest, and still be wildly impressive.",
];
const encouragements = [
  "That is one less thing asking for brain space.",
  "Excellent. The list has been politely humbled.",
  "A small win, handled with style.",
  "Future Jenna appreciates this development.",
  "Progress made. No supporting paperwork required.",
  "That counts, and it counts properly.",
  "Nicely done. The task has left the building.",
  "A calm little victory has been recorded.",
  "Good work. Momentum is looking very cute today.",
  "The day is now fractionally more under control.",
  "Done and therefore officially not your problem.",
  "Tiny triumph, strong execution.",
];
const randomTaskIdeas = [
  "Review friend contract",
  "Write a tiny note about something you are proud of",
  "Take three slow breaths before doing the next thing",
  "Drink some water and stand near a window for a minute",
  "Send a kind message without overthinking it",
  "Choose one worry and write the smallest useful next step",
  "Put on a song that makes the room feel lighter",
  "Make a snack or drink that feels like care",
  "Do five minutes of tidying in one visible place",
  "Write tomorrow's first task so morning Jenna has help",
  "Step outside and notice one thing that is not urgent",
  "Stretch your neck, shoulders, or back for two minutes",
  "Ask yourself what would make today 5% easier",
  "Put one annoying object back where it belongs",
  "Read a few pages instead of scrolling for five minutes",
  "Make one small plan with Dylan that sounds fun",
  "Write down one compliment you are allowed to accept",
  "Do something kind for your body without making it a project",
  "Clear one tiny bit of admin from your future",
  "Find one thing to look forward to this week",
  "Sit quietly for two minutes and let that be enough",
];
const friendContractSections = [
  {
    key: "jenna",
    direction: "upright",
    signedBy: "Dylan",
    lines: [
      "Pay attention to me",
      "You must get Jenna cake once per week",
      "Attend VS twice a week",
      "Always go to the cinema with Jenna",
      "Always make Jenna tea",
      "Holiday with Jenna twice a year",
      "Visit Jenna's new flat frequently",
      "Don't stop being my friend when you meet someone",
    ],
  },
  {
    key: "dylan",
    direction: "flipped",
    signedBy: "Jenna",
    lines: [
      {
        text: "Jenna must provide AT LEAST two hugs each week a Dylan is seen",
        marker: "*",
        note: "each hug must last at least one hour",
      },
      "Frequently invite me to your new home for fun, food and relaxing",
      "Continue to find new weird food, drinks and things for us to try",
      "Come to my house to cook, eat & game with me at least once per fortnight",
      "Scoop the cats often, and try not to be too allergic",
      "Remember Jenna is awesome and must accept all compliments",
      "Do walks with me",
      "Write my weekly schedule every now and again, and help me stick to it",
      "All rules apply ad-infinitum.",
      "Any breaches will be taken to the court of cats, and appropriate punishment dished out",
    ],
  },
];

function fallbackId(index = 0) {
  return `task-${index}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createId(index = 0) {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : fallbackId(index);
}

function starterTasks() {
  return initialTasks.map((title, index) => ({
    id: createId(index),
    title,
    done: false,
  }));
}

function readCookie(name) {
  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${encodeURIComponent(name)}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function writeCookie(name, value) {
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${cookieMaxAge}; Path=/todo; SameSite=Lax${secureFlag}`;
}

function cleanTitle(title) {
  return typeof title === "string" ? title.trim().replace(/\s+/g, " ") : "";
}

function normaliseTasks(value) {
  const source = Array.isArray(value) ? value : value?.tasks;
  if (!Array.isArray(source)) return null;

  const cleaned = source
    .map((task, index) => {
      const isCompactTask = Array.isArray(task);
      return {
        id: createId(index),
        title: cleanTitle(isCompactTask ? task[0] : task.title),
        done: isCompactTask ? task[1] === 1 : task.done === true,
      };
    })
    .filter((task) => task.title)
    .slice(0, maxPersistedTasks);

  return cleaned;
}

function clampLevel(value, fallback, min = 1, max = 5) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normaliseLevels(value) {
  return {
    worry: clampLevel(value?.worry, defaultLevels.worry, 1, maxLevels.worry),
    gym: clampLevel(value?.gym, defaultLevels.gym, 0, maxLevels.gym),
  };
}

function normaliseTheme(value) {
  return Object.prototype.hasOwnProperty.call(themeByKey, value) ? value : defaultTheme;
}

// ---- Dates, streaks, progression -------------------------------------------

function dayKey(date = new Date()) {
  // Local-time YYYY-MM-DD so a "day" matches the user's own clock.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayKeyOffset(offset, from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() + offset);
  return dayKey(date);
}

function normaliseHistory(value) {
  if (!value || typeof value !== "object") return {};
  const out = {};
  Object.entries(value).forEach(([key, count]) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      const n = Number.parseInt(count, 10);
      if (Number.isFinite(n) && n > 0) out[key] = n;
    }
  });
  // Trim to the most recent maxHistoryDays entries so the store stays small.
  const keys = Object.keys(out).sort();
  if (keys.length > maxHistoryDays) {
    keys.slice(0, keys.length - maxHistoryDays).forEach((key) => delete out[key]);
  }
  return out;
}

function computeStreakFromHistory(history, today = dayKey()) {
  const yesterday = dayKeyOffset(-1);
  // Current streak only counts if the most recent active day is today or yesterday.
  let anchor = history[today] ? today : history[yesterday] ? yesterday : null;
  let current = 0;
  if (anchor) {
    let cursor = new Date(anchor);
    while (history[dayKey(cursor)]) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }
  // Best streak: longest run of consecutive active days ever recorded.
  const days = Object.keys(history).sort();
  let best = 0;
  let run = 0;
  let previous = null;
  days.forEach((day) => {
    if (previous && dayKeyOffset(1, new Date(previous)) === day) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    previous = day;
  });
  return { current, best: Math.max(best, current) };
}

function normaliseProgress(value) {
  const xp = Math.max(0, Number.parseInt(value?.xp, 10) || 0);
  return {
    xp,
    // level is derived from xp, but we persist it to detect level-ups on load.
    level: levelForXp(xp),
    seenLevel: Math.max(1, Number.parseInt(value?.seenLevel, 10) || 1),
    gameBest: Math.max(0, Number.parseInt(value?.gameBest, 10) || 0),
  };
}

function normaliseCompanionName(value) {
  if (typeof value !== "string") return defaultCompanionName;
  const cleaned = value.trim().replace(/\s+/g, " ").slice(0, 18);
  return cleaned || defaultCompanionName;
}

function readStore() {
  // Prefer localStorage (roomy). Fall back to the legacy cookie so an existing
  // list on this device migrates seamlessly the first time.
  try {
    const local = window.localStorage.getItem(storageKey);
    if (local) return local;
  } catch {
    // localStorage may be unavailable (private mode); fall through to cookie.
  }
  return readCookie(cookieName);
}

function loadState() {
  const stored = readStore();
  const fresh = () => ({
    tasks: starterTasks(),
    levels: { ...defaultLevels },
    theme: defaultTheme,
    history: {},
    progress: { xp: 0, level: 1, seenLevel: 1 },
    companionName: defaultCompanionName,
  });

  if (!stored) {
    return { ...fresh(), needsSave: true };
  }

  try {
    const parsed = JSON.parse(stored);
    const shouldRefreshDefaults = parsed?.version !== listVersion;
    const savedTasks = normaliseTasks(parsed);

    return {
      tasks: shouldRefreshDefaults ? starterTasks() : (savedTasks ?? starterTasks()),
      levels: normaliseLevels(parsed.levels),
      theme: normaliseTheme(parsed.theme),
      history: normaliseHistory(parsed.history),
      progress: normaliseProgress(parsed.progress),
      companionName: normaliseCompanionName(parsed.companionName),
      needsSave: shouldRefreshDefaults,
    };
  } catch {
    return { ...fresh(), needsSave: true };
  }
}

function saveState() {
  const payload = JSON.stringify({
    version: listVersion,
    levels,
    theme,
    history,
    progress,
    companionName,
    tasks: tasks.slice(0, maxPersistedTasks).map((task) => [task.title, task.done ? 1 : 0]),
  });
  try {
    window.localStorage.setItem(storageKey, payload);
  } catch {
    // Ignore quota / unavailable errors; cookie write below still gives us
    // a smaller fallback for the essentials.
  }
  writeCookie(cookieName, payload);
}

const loadedState = loadState();
let tasks = loadedState.tasks;
let levels = loadedState.levels;
let theme = loadedState.theme;
let history = loadedState.history;
let progress = loadedState.progress;
let companionName = loadedState.companionName;
let streak = computeStreakFromHistory(history);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const els = {
  activeCount: document.querySelector("#active-count"),
  badgeRack: document.querySelector("#badge-rack"),
  complimentButton: document.querySelector("#compliment-button"),
  complimentLine: document.querySelector("#compliment-line"),
  contractCloseButton: document.querySelector("#contract-close-button"),
  contractCopy: document.querySelector("#friend-contract-copy"),
  contractFlipToggle: document.querySelector("#contract-flip-toggle"),
  contractModal: document.querySelector("#friend-contract-modal"),
  contractOrientationToggle: document.querySelector("#contract-orientation-toggle"),
  contractSheet: document.querySelector(".contract-sheet"),
  doneCount: document.querySelector("#done-count"),
  doneList: document.querySelector("#done-list"),
  doneSection: document.querySelector("#done-section"),
  effectLayer: document.querySelector("#effect-layer"),
  effectStatus: document.querySelector("#effect-status"),
  encouragementLine: document.querySelector("#encouragement-line"),
  form: document.querySelector("#add-form"),
  heroCopy: document.querySelector("#hero-copy"),
  heroEyebrow: document.querySelector("#hero-eyebrow"),
  input: document.querySelector("#new-task"),
  list: document.querySelector("#task-list"),
  metaThemeColor: document.querySelector("meta[name='theme-color']"),
  pageTitle: document.querySelector("#page-title"),
  progress: document.querySelector("#progress-bar"),
  randomTaskButton: document.querySelector("#random-task-button"),
  resetButton: document.querySelector("#reset-button"),
  secretContractButton: document.querySelector("#secret-contract-button"),
  summaryCount: document.querySelector("#summary-count"),
  summaryMood: document.querySelector("#summary-mood"),
  worrySlider: document.querySelector("#worry-level"),
  worryValue: document.querySelector("#worry-value"),
  gymSlider: document.querySelector("#gym-visits"),
  gymValue: document.querySelector("#gym-value"),
  // Progression + streaks + companion + game
  statusBar: document.querySelector("#status-bar"),
  streakValue: document.querySelector("#streak-value"),
  streakLabel: document.querySelector("#streak-label"),
  streakBest: document.querySelector("#streak-best"),
  levelValue: document.querySelector("#level-value"),
  xpBar: document.querySelector("#xp-bar"),
  xpText: document.querySelector("#xp-text"),
  companion: document.querySelector("#companion"),
  companionFace: document.querySelector("#companion-face"),
  companionLine: document.querySelector("#companion-line"),
  companionName: document.querySelector("#companion-name"),
  companionRename: document.querySelector("#companion-rename"),
  themePicker: document.querySelector("#theme-picker"),
  themePickerButton: document.querySelector("#theme-picker-button"),
  themePickerName: document.querySelector("#theme-picker-name"),
  themePickerMenu: document.querySelector("#theme-picker-menu"),
  gameButton: document.querySelector("#game-button"),
  gameModal: document.querySelector("#game-modal"),
  gameCanvas: document.querySelector("#game-canvas"),
  gameClose: document.querySelector("#game-close"),
  gameScore: document.querySelector("#game-score"),
  gameBest: document.querySelector("#game-best"),
  gameOverlay: document.querySelector("#game-overlay"),
  gameStart: document.querySelector("#game-start"),
  gameLockNote: document.querySelector("#game-lock-note"),
};

let complimentIndex = -1;
let draggedTaskId = null;
let encouragementIndex = -1;
let encouragementTimer;
let effectTimer;
let lastFocusedElement = null;
let recentlyCompletedId = null;

if (loadedState.needsSave) {
  saveState();
}

function taskMood(done, total) {
  if (total === 0) return "Fresh page";
  if (done === 0) return "Ready";
  if (done === total) return "All wrapped";
  if (done / total >= 0.5) return "Rolling";
  return "Started";
}

function taskCounts() {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  return { done, total };
}

function updateSummary() {
  const { done, total } = taskCounts();
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  els.summaryCount.textContent = `${done} of ${total} done`;
  els.summaryMood.textContent = taskMood(done, total);
  els.progress.style.width = `${percent}%`;
}

function updateLevels() {
  els.worrySlider.value = String(levels.worry);
  els.worryValue.textContent = String(levels.worry);
  els.gymSlider.value = String(levels.gym);
  els.gymValue.textContent = String(levels.gym);
}

function timeOfDay(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  if (h < 22) return "evening";
  return "night";
}

function greetingFor(part) {
  switch (part) {
    case "morning":
      return "Good morning, Jenna";
    case "afternoon":
      return "Good afternoon, Jenna";
    case "evening":
      return "Good evening, Jenna";
    default:
      return "Late night, Jenna";
  }
}

function themeUnlocked(key) {
  const entry = themeByKey[key];
  if (!entry) return false;
  return progress.level >= entry.unlockLevel;
}

function updateTheme() {
  const entry = themeByKey[theme] || themeByKey[defaultTheme];
  const text = entry.text;
  document.body.dataset.theme = theme;

  // Time-of-day greeting replaces the eyebrow so the page feels like it knows
  // what part of the day it is, while the theme still owns the copy + title.
  const part = timeOfDay();
  if (els.heroEyebrow) els.heroEyebrow.textContent = `${greetingFor(part)} · ${text.eyebrow}`;
  if (els.pageTitle) els.pageTitle.textContent = text.title;
  if (els.heroCopy) els.heroCopy.textContent = text.copy;

  const activeTitle = document.querySelector("#active-title");
  const doneTitle = document.querySelector("#done-title");
  if (activeTitle) activeTitle.textContent = text.activeTitle;
  if (doneTitle) doneTitle.textContent = text.doneTitle;
  if (els.metaThemeColor) els.metaThemeColor.content = entry.metaColor;

  renderThemePicker();
}

function renderThemePicker() {
  if (!els.themePickerName || !els.themePickerMenu) return;
  const active = themeByKey[theme] || themeByKey[defaultTheme];
  els.themePickerName.textContent = active.name;
  if (els.themePickerButton) {
    els.themePickerButton.setAttribute("aria-label", `Theme: ${active.name}. Choose a theme.`);
  }

  els.themePickerMenu.replaceChildren();
  const fragment = document.createDocumentFragment();
  themeCatalogue.forEach((entry) => {
    const unlocked = progress.level >= entry.unlockLevel;
    const option = document.createElement("button");
    option.type = "button";
    option.className = "theme-option";
    option.dataset.theme = entry.key;
    option.setAttribute("role", "menuitemradio");
    option.setAttribute("aria-checked", String(entry.key === theme));
    if (!unlocked) {
      option.disabled = true;
      option.classList.add("is-locked");
    }
    if (entry.key === theme) option.classList.add("is-active");

    const swatch = document.createElement("span");
    swatch.className = "theme-option__swatch";
    swatch.setAttribute("aria-hidden", "true");
    swatch.style.background = `linear-gradient(135deg, ${entry.swatch[0]} 0 34%, ${entry.swatch[1]} 34% 67%, ${entry.swatch[2]} 67%)`;

    const label = document.createElement("span");
    label.className = "theme-option__label";
    label.textContent = entry.name;

    const meta = document.createElement("span");
    meta.className = "theme-option__meta";
    meta.textContent = unlocked
      ? entry.key === theme
        ? "Active"
        : "Ready"
      : `Level ${entry.unlockLevel}`;

    option.append(swatch, label, meta);
    option.addEventListener("click", () => {
      if (option.disabled) return;
      setTheme(entry.key);
      closeThemePicker();
    });
    fragment.append(option);
  });
  els.themePickerMenu.append(fragment);
}

function setTheme(key) {
  if (!themeUnlocked(key)) return;
  theme = key;
  updateTheme();
  updateCompanion();
  saveState();
}

function openThemePicker() {
  if (!els.themePicker) return;
  els.themePicker.classList.add("is-open");
  if (els.themePickerButton) els.themePickerButton.setAttribute("aria-expanded", "true");
}

function closeThemePicker() {
  if (!els.themePicker) return;
  els.themePicker.classList.remove("is-open");
  if (els.themePickerButton) els.themePickerButton.setAttribute("aria-expanded", "false");
}

function toggleThemePicker() {
  if (!els.themePicker) return;
  if (els.themePicker.classList.contains("is-open")) closeThemePicker();
  else openThemePicker();
}

function activeTasks() {
  return tasks.filter((task) => !task.done);
}

function completedTasks() {
  return tasks.filter((task) => task.done);
}

function earnedBadgeKeySet() {
  const counts = taskCounts();
  return new Set(
    milestoneBadges
      .filter((badge) => badge.isEarned(counts))
      .map((badge) => badge.key),
  );
}

function renderBadges(previousBadgeKeys = earnedBadgeKeySet()) {
  const currentBadgeKeys = earnedBadgeKeySet();
  els.badgeRack.replaceChildren();

  if (currentBadgeKeys.size === 0) {
    const placeholder = document.createElement("span");
    placeholder.className = "badge-placeholder";
    placeholder.textContent = "Sticker space";
    els.badgeRack.append(placeholder);
    return;
  }

  const fragment = document.createDocumentFragment();
  milestoneBadges.forEach((badge) => {
    if (!currentBadgeKeys.has(badge.key)) return;

    const sticker = document.createElement("span");
    sticker.className = `sticker${previousBadgeKeys.has(badge.key) ? "" : " is-new"}`;
    sticker.innerHTML = `<strong>${badge.label}</strong><small>${badge.detail}</small>`;
    fragment.append(sticker);
  });

  els.badgeRack.append(fragment);
}

function isAllComplete() {
  return tasks.length > 0 && tasks.every((task) => task.done);
}

function taskById(taskId) {
  return tasks.find((task) => task.id === taskId);
}

function moveTaskBefore(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return false;

  const source = taskById(sourceId);
  const target = taskById(targetId);
  if (!source || !target || source.done !== target.done) return false;

  const withoutSource = tasks.filter((task) => task.id !== sourceId);
  const targetIndex = withoutSource.findIndex((task) => task.id === targetId);
  if (targetIndex === -1) return false;

  tasks = [
    ...withoutSource.slice(0, targetIndex),
    source,
    ...withoutSource.slice(targetIndex),
  ];

  return true;
}

function moveTaskToGroupEnd(sourceId, doneState) {
  const source = taskById(sourceId);
  if (!source || source.done !== doneState) return false;

  const withoutSource = tasks.filter((task) => task.id !== sourceId);
  let lastGroupIndex = -1;
  withoutSource.forEach((task, index) => {
    if (task.done === doneState) lastGroupIndex = index;
  });
  const insertIndex = lastGroupIndex === -1 ? withoutSource.length : lastGroupIndex + 1;

  tasks = [
    ...withoutSource.slice(0, insertIndex),
    source,
    ...withoutSource.slice(insertIndex),
  ];

  return true;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function isFriendContractTrigger(title) {
  const normalisedTitle = cleanTitle(title).toLocaleLowerCase("en-GB");
  return /\b(friend\s+contract|contract|friendship\s+terms)\b/.test(normalisedTitle);
}

function isShootingStarTask(title) {
  return cleanTitle(title).toLocaleLowerCase("en-GB").includes("shooting star");
}

function appendLinkedText(element, text) {
  const urlPattern = /https?:\/\/[^\s)]+/g;
  let lastIndex = 0;
  let match;

  while ((match = urlPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      element.append(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const link = document.createElement("a");
    link.href = match[0];
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = match[0];
    link.addEventListener("click", (event) => event.stopPropagation());
    element.append(link);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    element.append(document.createTextNode(text.slice(lastIndex)));
  }
}

function renderFriendContract() {
  if (!els.contractCopy) return;

  const fragment = document.createDocumentFragment();

  friendContractSections.forEach((section) => {
    const sectionElement = document.createElement("section");
    sectionElement.className = `contract-section contract-section--${section.direction}`;

    const list = document.createElement("ul");
    list.className = "contract-lines";

    section.lines.forEach((line) => {
      const lineText = typeof line === "string" ? line : line.text;
      const item = document.createElement("li");
      const body = document.createElement("span");
      body.className = "contract-line-body";
      const text = document.createElement("span");
      text.className = "contract-line-text";
      text.textContent = lineText;

      body.append(text);
      if (typeof line === "object" && line.marker) {
        const marker = document.createElement("span");
        marker.className = "contract-line-marker";
        marker.textContent = line.marker;
        text.append(marker);
      }

      if (typeof line === "object" && line.note) {
        const note = document.createElement("span");
        note.className = "contract-line-note";
        note.textContent = line.note;
        body.append(note);
      }

      item.append(body);
      list.append(item);
    });

    const signature = document.createElement("p");
    signature.className = "contract-signature";
    signature.innerHTML = "<span>Signed</span>";
    signature.append(document.createTextNode(section.signedBy));

    sectionElement.append(list, signature);
    fragment.append(sectionElement);
  });

  els.contractCopy.replaceChildren(fragment);
}

function updateContractOrientationButton() {
  if (!els.contractCopy || !els.contractOrientationToggle) return;
  const isStraightened = els.contractCopy.classList.contains("is-straightened");
  els.contractOrientationToggle.textContent = isStraightened ? "Mess it up again" : "Straighten page";
}

function updateContractFlipButton() {
  if (!els.contractSheet || !els.contractFlipToggle) return;
  const isFlipped = els.contractSheet.classList.contains("is-page-flipped");
  els.contractFlipToggle.textContent = isFlipped ? "Flip back" : "Flip 180";
}

function openFriendContract({ straightened = false } = {}) {
  if (
    !els.contractModal ||
    !els.contractCopy ||
    !els.contractSheet ||
    !els.contractCloseButton
  ) {
    return;
  }

  renderFriendContract();
  els.contractCopy.classList.toggle("is-straightened", straightened);
  els.contractSheet.classList.remove("is-page-flipped");
  updateContractOrientationButton();
  updateContractFlipButton();
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  els.contractModal.hidden = false;
  document.body.classList.add("is-contract-open");
  els.contractCloseButton.focus();
}

function closeFriendContract() {
  if (!els.contractModal) return;
  els.contractModal.hidden = true;
  document.body.classList.remove("is-contract-open");
  if (lastFocusedElement) lastFocusedElement.focus();
}

function revealFriendContract(delay = 0) {
  window.setTimeout(() => openFriendContract(), delay);
}

function addTask(title) {
  const cleanedTitle = cleanTitle(title);
  if (!cleanedTitle) return false;
  const shouldRevealContract = isFriendContractTrigger(cleanedTitle);

  tasks = [
    {
      id: createId(tasks.length),
      title: cleanedTitle,
      done: false,
    },
    ...tasks,
  ];

  saveState();
  render();
  if (shouldRevealContract) revealFriendContract(220);
  return true;
}

function randomTaskTitle() {
  const existingTitles = new Set(tasks.map((task) => task.title.toLocaleLowerCase("en-GB")));
  const unusedIdeas = randomTaskIdeas.filter(
    (title) => !existingTitles.has(title.toLocaleLowerCase("en-GB")),
  );
  const source = unusedIdeas.length > 0 ? unusedIdeas : randomTaskIdeas;

  return source[Math.floor(randomBetween(0, source.length))];
}

function showCompliment() {
  let nextIndex = Math.floor(randomBetween(0, compliments.length));
  if (compliments.length > 1 && nextIndex === complimentIndex) {
    nextIndex = (nextIndex + 1) % compliments.length;
  }

  complimentIndex = nextIndex;
  els.complimentLine.textContent = compliments[complimentIndex];
  els.complimentLine.classList.remove("is-popping");
  void els.complimentLine.offsetWidth;
  els.complimentLine.classList.add("is-popping");
}

function showEncouragement() {
  window.clearTimeout(encouragementTimer);

  let nextIndex = Math.floor(randomBetween(0, encouragements.length));
  if (encouragements.length > 1 && nextIndex === encouragementIndex) {
    nextIndex = (nextIndex + 1) % encouragements.length;
  }

  encouragementIndex = nextIndex;
  els.encouragementLine.hidden = false;
  els.encouragementLine.textContent = encouragements[encouragementIndex];
  els.encouragementLine.classList.remove("is-visible", "is-popping");
  void els.encouragementLine.offsetWidth;
  els.encouragementLine.classList.add("is-visible", "is-popping");

  encouragementTimer = window.setTimeout(() => {
    els.encouragementLine.classList.remove("is-visible", "is-popping");
    els.encouragementLine.hidden = true;
    els.encouragementLine.textContent = "";
  }, 3000);
}

function createEffectPiece(className, properties = {}) {
  const piece = document.createElement("span");
  piece.className = `effect-piece ${className}`;
  Object.entries(properties).forEach(([name, value]) => {
    piece.style.setProperty(name, value);
  });
  return piece;
}

function clearEffect() {
  window.clearTimeout(effectTimer);
  els.effectLayer
    .querySelectorAll(".effect-piece:not(.effect-piece--task-sparkle)")
    .forEach((piece) => piece.remove());
  els.effectLayer.className = "effect-layer";
}

function triggerEffect(type) {
  if (reduceMotion.matches) return;

  clearEffect();
  const fragment = document.createDocumentFragment();
  els.effectLayer.classList.add(`effect-layer--${type}`);

  if (type === "complete") {
    els.effectStatus.textContent = "All tasks complete.";
    for (let index = 0; index < 48; index += 1) {
      fragment.append(
        createEffectPiece("effect-piece--confetti", {
          "--x": `${randomBetween(4, 96)}vw`,
          "--drift": `${randomBetween(-90, 90)}px`,
          "--delay": `${randomBetween(0, 0.38)}s`,
          "--duration": `${randomBetween(1.2, 2.1)}s`,
          "--rotate": `${randomBetween(-220, 220)}deg`,
          "--color": ["#92ccea", "#c8a7dd", "#ee6f98", "#f5a35f"][index % 4],
        }),
      );
    }
  }

  if (type === "gym") {
    els.effectStatus.textContent = `Gym visits reached ${maxLevels.gym}.`;
    for (let index = 0; index < 12; index += 1) {
      fragment.append(
        createEffectPiece("effect-piece--gym", {
          "--x": `${randomBetween(16, 84)}vw`,
          "--y": `${randomBetween(26, 78)}vh`,
          "--delay": `${index * 0.035}s`,
          "--rotate": `${index % 2 === 0 ? -18 : 18}deg`,
        }),
      );
    }
  }

  if (type === "worry-low") {
    els.effectStatus.textContent = "Worry level reached one.";
    for (let index = 0; index < 9; index += 1) {
      fragment.append(
        createEffectPiece("effect-piece--calm", {
          "--x": `${randomBetween(18, 82)}vw`,
          "--y": `${randomBetween(20, 78)}vh`,
          "--delay": `${index * 0.11}s`,
          "--size": `${randomBetween(54, 120)}px`,
        }),
      );
    }
  }

  if (type === "worry-high") {
    els.effectStatus.textContent = "Worry level reached five.";
    for (let index = 0; index < 18; index += 1) {
      const rotate = randomBetween(-28, 28);
      fragment.append(
        createEffectPiece("effect-piece--zap", {
          "--x": `${randomBetween(8, 92)}vw`,
          "--y": `${randomBetween(18, 78)}vh`,
          "--delay": `${randomBetween(0, 0.22)}s`,
          "--rotate": `${rotate}deg`,
          "--flip-rotate": `${rotate * -1}deg`,
        }),
      );
    }
  }

  if (type === "shooting-star") {
    els.effectStatus.textContent = "Shooting star spotted.";
    fragment.append(createEffectPiece("effect-piece--meteor"));
    fragment.append(
      createEffectPiece("effect-piece--meteor effect-piece--meteor-secondary", {
        "--meteor-delay": "0.52s",
        "--meteor-scale": "0.68",
      }),
    );
    for (let index = 0; index < 28; index += 1) {
      fragment.append(
        createEffectPiece("effect-piece--star", {
          "--x": `${randomBetween(5, 95)}vw`,
          "--y": `${randomBetween(8, 74)}vh`,
          "--delay": `${randomBetween(0, 2.25)}s`,
          "--size": `${randomBetween(5, 15)}px`,
        }),
      );
    }
  }

  if (type === "level-up") {
    els.effectStatus.textContent = `Level ${progress.level} reached.`;
    for (let index = 0; index < 40; index += 1) {
      fragment.append(
        createEffectPiece("effect-piece--levelup", {
          "--x": `${randomBetween(6, 94)}vw`,
          "--y": `${randomBetween(20, 80)}vh`,
          "--delay": `${randomBetween(0, 0.5)}s`,
          "--size": `${randomBetween(10, 24)}px`,
          "--rotate": `${randomBetween(-180, 180)}deg`,
          "--color": ["#f5d66f", "#92ccea", "#c8a7dd", "#ee6f98", "#8fd6a8"][index % 5],
        }),
      );
    }
  }

  els.effectLayer.append(fragment);
  effectTimer = window.setTimeout(clearEffect, type === "shooting-star" ? 4600 : 2400);
}

function triggerTaskSparkle(rect) {
  if (reduceMotion.matches || !rect) return;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 10; index += 1) {
    const piece = createEffectPiece("effect-piece--task-sparkle", {
      "--x": `${centerX}px`,
      "--y": `${centerY}px`,
      "--move-x": `${randomBetween(-46, 46)}px`,
      "--move-y": `${randomBetween(-54, -16)}px`,
      "--delay": `${index * 0.018}s`,
      "--size": `${randomBetween(6, 13)}px`,
      "--color": ["#92ccea", "#c8a7dd", "#ee6f98", "#f5a35f"][index % 4],
    });
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
    fragment.append(piece);
  }

  els.effectLayer.append(fragment);
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.done ? " is-done" : ""}`;
  if (task.id === recentlyCompletedId) item.classList.add("is-moving-done");
  item.dataset.id = task.id;
  item.draggable = true;

  const dragHandle = document.createElement("span");
  dragHandle.className = "task-drag";
  dragHandle.textContent = "⋮⋮";
  dragHandle.setAttribute("aria-hidden", "true");

  item.addEventListener("dragstart", (event) => {
    draggedTaskId = task.id;
    item.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id);
  });

  item.addEventListener("dragend", () => {
    draggedTaskId = null;
    item.classList.remove("is-dragging");
    document
      .querySelectorAll(".is-drag-over, .is-drag-target")
      .forEach((element) => element.classList.remove("is-drag-over", "is-drag-target"));
  });

  item.addEventListener("dragover", (event) => {
    const draggedTask = taskById(draggedTaskId);
    if (!draggedTask || draggedTask.id === task.id || draggedTask.done !== task.done) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    item.classList.add("is-drag-over");
  });

  item.addEventListener("dragleave", () => {
    item.classList.remove("is-drag-over");
  });

  item.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    item.classList.remove("is-drag-over");
    const sourceId = event.dataTransfer.getData("text/plain") || draggedTaskId;
    const previousBadgeKeys = earnedBadgeKeySet();

    if (moveTaskBefore(sourceId, task.id)) {
      saveState();
      render(previousBadgeKeys);
    }
  });

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `check-${task.id}`;
  checkbox.checked = task.done;
  checkbox.addEventListener("change", () => {
    const wasAllComplete = isAllComplete();
    const previousBadgeKeys = earnedBadgeKeySet();
    const wasDone = task.done;
    const sparkleRect = checkbox.checked ? checkVisual.getBoundingClientRect() : null;

    task.done = checkbox.checked;
    recentlyCompletedId = !wasDone && task.done ? task.id : null;
    const shouldRevealContract = recentlyCompletedId && isFriendContractTrigger(task.title);
    const shouldTriggerShootingStar = recentlyCompletedId && isShootingStarTask(task.title);
    if (recentlyCompletedId) {
      showEncouragement();
      triggerTaskSparkle(sparkleRect);
      recordCompletion();
    }
    saveState();
    render(previousBadgeKeys);
    if (!wasAllComplete && isAllComplete()) {
      triggerEffect(shouldTriggerShootingStar ? "shooting-star" : "complete");
    } else if (shouldRevealContract) {
      revealFriendContract(260);
    } else if (shouldTriggerShootingStar) {
      triggerEffect("shooting-star");
    }
  });

  const checkVisual = document.createElement("label");
  checkVisual.className = "task-check";
  checkVisual.htmlFor = checkbox.id;
  checkVisual.setAttribute("aria-hidden", "true");

  const title = document.createElement("span");
  title.className = "task-title";
  appendLinkedText(title, task.title);
  title.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    checkbox.click();
  });

  const removeButton = document.createElement("button");
  removeButton.className = "icon-button icon-button--remove";
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `Remove ${task.title}`);
  removeButton.textContent = "x";
  removeButton.addEventListener("click", () => {
    const wasAllComplete = isAllComplete();
    const previousBadgeKeys = earnedBadgeKeySet();
    tasks = tasks.filter((candidate) => candidate.id !== task.id);
    saveState();
    render(previousBadgeKeys);
    if (!wasAllComplete && isAllComplete()) triggerEffect("complete");
  });

  item.append(dragHandle, checkbox, checkVisual, title, removeButton);
  return item;
}

function handleListDragOver(doneState, event) {
  const draggedTask = taskById(draggedTaskId);
  if (!draggedTask || draggedTask.done !== doneState) return;

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  event.currentTarget.classList.add("is-drag-target");
}

function handleListDrop(doneState, event) {
  event.preventDefault();
  event.currentTarget.classList.remove("is-drag-target");
  const sourceId = event.dataTransfer.getData("text/plain") || draggedTaskId;
  const previousBadgeKeys = earnedBadgeKeySet();

  if (moveTaskToGroupEnd(sourceId, doneState)) {
    saveState();
    render(previousBadgeKeys);
  }
}

// ---- Progression, streaks, companion ---------------------------------------

function updateStatusBar() {
  streak = computeStreakFromHistory(history);
  if (els.streakValue) els.streakValue.textContent = String(streak.current);
  if (els.streakLabel) {
    els.streakLabel.textContent = streak.current === 1 ? "day streak" : "day streak";
  }
  if (els.streakBest) {
    els.streakBest.textContent = streak.best > 0 ? `Best: ${streak.best}` : "New start";
  }

  const level = progress.level;
  const currentFloor = xpForLevel(level);
  const nextFloor = xpForLevel(level + 1);
  const span = Math.max(1, nextFloor - currentFloor);
  const into = Math.min(span, progress.xp - currentFloor);
  const percent = Math.round((into / span) * 100);

  if (els.levelValue) els.levelValue.textContent = String(level);
  if (els.xpBar) els.xpBar.style.width = `${percent}%`;
  if (els.xpText) els.xpText.textContent = `${into} / ${span} XP to level ${level + 1}`;
}

function updateGameLock() {
  const unlocked = progress.level >= gameUnlockLevel;
  if (els.gameButton) {
    els.gameButton.disabled = !unlocked;
    els.gameButton.classList.toggle("is-locked", !unlocked);
    els.gameButton.textContent = unlocked ? "Play Tiny Hop" : `Game · Level ${gameUnlockLevel}`;
  }
}

function grantXp(amount, { celebrate = true } = {}) {
  if (amount <= 0) return;
  const before = progress.level;
  progress.xp += amount;
  progress.level = levelForXp(progress.xp);
  if (progress.level > before) {
    handleLevelUp(before, progress.level, { celebrate });
  }
  progress.seenLevel = progress.level;
}

function handleLevelUp(fromLevel, toLevel, { celebrate = true } = {}) {
  // Announce any themes unlocked between the two levels.
  const newlyUnlocked = themeCatalogue.filter(
    (entry) => entry.unlockLevel > fromLevel && entry.unlockLevel <= toLevel,
  );
  const gameJustUnlocked = fromLevel < gameUnlockLevel && toLevel >= gameUnlockLevel;

  renderThemePicker();
  updateGameLock();

  if (celebrate) {
    triggerEffect("level-up");
    let message = `Level ${toLevel}! `;
    const bits = [];
    newlyUnlocked.forEach((entry) => bits.push(`${entry.name} theme unlocked`));
    if (gameJustUnlocked) bits.push("Tiny Hop game unlocked");
    message += bits.length ? bits.join(" · ") : "Nicely levelled up.";
    announce(message);
    if (els.companionLine) {
      companionOverride = `${companionName}: level ${toLevel}! ${bits.length ? bits[0] + "." : "so proud."}`;
      updateCompanion();
      window.clearTimeout(companionOverrideTimer);
      companionOverrideTimer = window.setTimeout(() => {
        companionOverride = null;
        updateCompanion();
      }, 4200);
    }
  }
}

function announce(message) {
  if (!els.effectStatus) return;
  els.effectStatus.textContent = message;
}

// Records today's completion in history, keeps XP + streak moving.
function recordCompletion() {
  const today = dayKey();
  const previousStreak = computeStreakFromHistory(history).current;
  history[today] = (history[today] || 0) + 1;
  const newStreak = computeStreakFromHistory(history);

  let xp = xpPerCompletion;
  // Bonus XP the first time a new streak day is banked.
  if (newStreak.current > previousStreak) {
    xp += xpPerStreakDay * newStreak.current;
  }
  grantXp(xp);
  updateStatusBar();
  updateCompanion();
}

function companionMoodKey() {
  const { done, total } = taskCounts();
  const part = timeOfDay();
  if (total > 0 && done === total) return "celebrate";
  if (part === "night") return "sleepy";
  if (streak.current === 0 && done === 0) return "droopy";
  if (total > 0 && done / total >= 0.5) return "rolling";
  if (done > 0) return "happy";
  return "ready";
}

function companionFaceMarkup(face) {
  // Simple inline SVG faces; eyes + mouth vary by mood.
  const eyes = {
    happy: '<circle cx="34" cy="46" r="5"/><circle cx="66" cy="46" r="5"/>',
    celebrate:
      '<path d="M28 48 q6 -10 12 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M60 48 q6 -10 12 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    ready: '<circle cx="34" cy="46" r="4.5"/><circle cx="66" cy="46" r="4.5"/>',
    sleepy:
      '<path d="M28 47 q6 5 12 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M60 47 q6 5 12 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    droopy: '<circle cx="34" cy="49" r="4"/><circle cx="66" cy="49" r="4"/>',
  };
  const mouth = {
    happy: '<path d="M38 62 q12 12 24 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    celebrate: '<path d="M36 60 q14 18 28 0 q-14 8 -28 0" fill="currentColor"/>',
    ready: '<path d="M40 63 q10 6 20 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    sleepy: '<path d="M44 64 q6 4 12 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    droopy: '<path d="M38 66 q12 -10 24 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  };
  const cheeks =
    face === "happy" || face === "celebrate"
      ? '<circle cx="24" cy="58" r="6" fill="var(--coral)" opacity="0.5"/><circle cx="76" cy="58" r="6" fill="var(--coral)" opacity="0.5"/>'
      : "";
  const zzz =
    face === "sleepy"
      ? '<text x="78" y="26" font-size="16" fill="currentColor" opacity="0.7">z</text><text x="86" y="16" font-size="11" fill="currentColor" opacity="0.6">z</text>'
      : "";
  return `<g fill="currentColor">${eyes[face] || eyes.ready}${cheeks}</g>${mouth[face] || mouth.ready}${zzz}`;
}

let companionOverride = null;
let companionOverrideTimer;

function updateCompanion() {
  if (!els.companion) return;
  const moodKey = companionMoodKey();
  const mood = companionMoods[moodKey] || companionMoods.ready;
  els.companion.dataset.mood = moodKey;
  if (els.companionFace) els.companionFace.innerHTML = companionFaceMarkup(mood.face);
  if (els.companionName) els.companionName.textContent = companionName;
  if (els.companionLine) {
    els.companionLine.textContent = companionOverride || mood.line(companionName);
  }
}

function renameCompanion() {
  const next = window.prompt("Name your companion", companionName);
  if (next === null) return;
  companionName = normaliseCompanionName(next);
  updateCompanion();
  saveState();
}

function render(previousBadgeKeys = earnedBadgeKeySet()) {
  els.list.replaceChildren();
  els.doneList.replaceChildren();

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Nothing on the list right now.";
    els.list.append(empty);
    els.doneSection.hidden = true;
    els.activeCount.textContent = "0 to go";
    renderBadges(previousBadgeKeys);
    updateSummary();
    updateCompanion();
    return;
  }

  const active = activeTasks();
  const completed = completedTasks();
  const activeFragment = document.createDocumentFragment();
  const doneFragment = document.createDocumentFragment();

  els.activeCount.textContent = `${active.length} to go`;

  if (active.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Nothing left up here.";
    els.list.append(empty);
  } else {
    active.forEach((task) => activeFragment.append(createTaskElement(task)));
    els.list.append(activeFragment);
  }

  els.doneSection.hidden = completed.length === 0;
  els.doneCount.textContent = `${completed.length} tucked away`;
  completed.forEach((task) => doneFragment.append(createTaskElement(task)));
  els.doneList.append(doneFragment);
  renderBadges(previousBadgeKeys);
  updateSummary();
  updateCompanion();
  recentlyCompletedId = null;
}

function resetList() {
  // Reset only the task list + sliders. Streaks, XP, levels, unlocks and the
  // companion name are persistent memory and deliberately survive a reset.
  tasks = starterTasks();
  levels = { ...defaultLevels };
  els.input.value = "";
  saveState();
  updateLevels();
  updateTheme();
  updateStatusBar();
  updateGameLock();
  updateCompanion();
  render();
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = cleanTitle(els.input.value);
  if (!title) {
    els.input.focus();
    return;
  }

  if (addTask(title)) els.input.value = "";
});

els.randomTaskButton.addEventListener("click", () => {
  addTask(randomTaskTitle());
});

if (els.secretContractButton) {
  els.secretContractButton.addEventListener("click", () => {
    openFriendContract();
  });
}

if (els.contractCloseButton) {
  els.contractCloseButton.addEventListener("click", closeFriendContract);
}

if (els.contractModal) {
  els.contractModal.querySelectorAll("[data-contract-close]").forEach((button) => {
    button.addEventListener("click", closeFriendContract);
  });
}

if (els.contractOrientationToggle && els.contractCopy) {
  els.contractOrientationToggle.addEventListener("click", () => {
    els.contractCopy.classList.toggle("is-straightened");
    updateContractOrientationButton();
  });
}

if (els.contractFlipToggle && els.contractSheet) {
  els.contractFlipToggle.addEventListener("click", () => {
    els.contractSheet.classList.toggle("is-page-flipped");
    updateContractFlipButton();
  });
}

if (els.themePickerButton) {
  els.themePickerButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleThemePicker();
  });
}

if (els.themePicker) {
  document.addEventListener("click", (event) => {
    if (!els.themePicker.classList.contains("is-open")) return;
    if (!els.themePicker.contains(event.target)) closeThemePicker();
  });
}

if (els.companionRename) {
  els.companionRename.addEventListener("click", renameCompanion);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (els.contractModal && !els.contractModal.hidden) {
      closeFriendContract();
      return;
    }
    if (els.gameModal && !els.gameModal.hidden) {
      closeGame();
      return;
    }
    if (els.themePicker && els.themePicker.classList.contains("is-open")) {
      closeThemePicker();
    }
  }
});

els.worrySlider.addEventListener("input", () => {
  const previous = levels.worry;
  levels.worry = clampLevel(els.worrySlider.value, defaultLevels.worry, 1, maxLevels.worry);
  updateLevels();
  saveState();
  if (levels.worry !== previous && levels.worry === 1) triggerEffect("worry-low");
  if (levels.worry !== previous && levels.worry === maxLevels.worry) triggerEffect("worry-high");
});

els.gymSlider.addEventListener("input", () => {
  const previous = levels.gym;
  levels.gym = clampLevel(els.gymSlider.value, defaultLevels.gym, 0, maxLevels.gym);
  updateLevels();
  saveState();
  if (previous !== maxLevels.gym && levels.gym === maxLevels.gym) triggerEffect("gym");
});

els.complimentButton.addEventListener("click", showCompliment);

els.resetButton.addEventListener("click", resetList);

[
  [els.list, false],
  [els.doneList, true],
].forEach(([list, doneState]) => {
  list.addEventListener("dragover", (event) => handleListDragOver(doneState, event));
  list.addEventListener("dragleave", (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    event.currentTarget.classList.remove("is-drag-target");
  });
  list.addEventListener("drop", (event) => handleListDrop(doneState, event));
});

// ---- Tiny Hop: a small self-contained canvas game --------------------------
// A cosy one-button hopper. Hold/press to hop over gaps; collect stars for
// score. Keyboard (Space/Arrow Up/W) and touch/click supported. High score
// persists in the saved progress object.
const game = {
  raf: 0,
  running: false,
  ctx: null,
  w: 0,
  h: 0,
  dpr: 1,
  ground: 0,
  player: null,
  obstacles: [],
  stars: [],
  speed: 0,
  score: 0,
  spawnTimer: 0,
  starTimer: 0,
  lastTime: 0,
};

function gameBestScore() {
  return Math.max(0, Number.parseInt(progress.gameBest, 10) || 0);
}

function setGameBest(value) {
  if (value > gameBestScore()) {
    progress.gameBest = value;
    saveState();
  }
}

function sizeGameCanvas() {
  if (!els.gameCanvas) return;
  const rect = els.gameCanvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  game.dpr = dpr;
  game.w = rect.width;
  game.h = rect.height;
  els.gameCanvas.width = Math.round(rect.width * dpr);
  els.gameCanvas.height = Math.round(rect.height * dpr);
  game.ctx = els.gameCanvas.getContext("2d");
  game.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  game.ground = game.h - 28;
}

function resetGameState() {
  sizeGameCanvas();
  game.player = {
    x: Math.max(40, game.w * 0.18),
    y: game.ground,
    vy: 0,
    r: 16,
    onGround: true,
  };
  game.obstacles = [];
  game.stars = [];
  game.speed = Math.max(3.2, game.w / 150);
  game.score = 0;
  game.spawnTimer = 60;
  game.starTimer = 90;
  if (els.gameScore) els.gameScore.textContent = "0";
  if (els.gameBest) els.gameBest.textContent = String(gameBestScore());
}

function gameHop() {
  if (!game.running || !game.player) return;
  if (game.player.onGround) {
    game.player.vy = -Math.max(9, game.h * 0.024);
    game.player.onGround = false;
  }
}

function endGame() {
  game.running = false;
  window.cancelAnimationFrame(game.raf);
  setGameBest(Math.floor(game.score));
  if (els.gameOverlay) {
    els.gameOverlay.hidden = false;
    els.gameOverlay.querySelector("[data-game-result]").textContent =
      `Score ${Math.floor(game.score)} · Best ${gameBestScore()}`;
  }
  if (els.gameStart) els.gameStart.textContent = "Play again";
  // A game session also nudges progression a little, so play is never wasted.
  grantXp(Math.min(20, Math.floor(game.score / 5)), { celebrate: true });
  updateStatusBar();
}

function gameStep(timestamp) {
  if (!game.running) return;
  const ctx = game.ctx;
  if (!ctx) return;
  if (!game.lastTime) game.lastTime = timestamp;
  const dt = Math.min(2.4, (timestamp - game.lastTime) / 16.67);
  game.lastTime = timestamp;

  // Physics
  const gravity = Math.max(0.5, game.h * 0.0016);
  game.player.vy += gravity * dt;
  game.player.y += game.player.vy * dt;
  if (game.player.y >= game.ground) {
    game.player.y = game.ground;
    game.player.vy = 0;
    game.player.onGround = true;
  }

  game.speed += 0.0016 * dt;

  // Spawn obstacles + stars
  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    const height = randomBetween(18, 40);
    game.obstacles.push({ x: game.w + 20, w: randomBetween(16, 26), h: height });
    game.spawnTimer = randomBetween(70, 130) / (game.speed / 3.4);
  }
  game.starTimer -= dt;
  if (game.starTimer <= 0) {
    game.stars.push({
      x: game.w + 20,
      y: game.ground - randomBetween(50, 120),
      r: 9,
      got: false,
    });
    game.starTimer = randomBetween(90, 180);
  }

  // Move + collide
  const px = game.player.x;
  const py = game.player.y;
  const pr = game.player.r;
  game.obstacles.forEach((o) => {
    o.x -= game.speed * dt;
  });
  game.stars.forEach((s) => {
    s.x -= game.speed * dt;
  });
  game.obstacles = game.obstacles.filter((o) => o.x + o.w > -10);
  game.stars = game.stars.filter((s) => s.x > -20 && !s.got);

  let hit = false;
  game.obstacles.forEach((o) => {
    const oy = game.ground - o.h;
    if (px + pr > o.x && px - pr < o.x + o.w && py + pr > oy) hit = true;
  });
  game.stars.forEach((s) => {
    const dx = px - s.x;
    const dy = py - s.y;
    if (Math.hypot(dx, dy) < pr + s.r) {
      s.got = true;
      game.score += 10;
    }
  });

  // Passive score for distance
  game.score += 0.08 * dt * game.speed;
  if (els.gameScore) els.gameScore.textContent = String(Math.floor(game.score));

  // Draw
  const themeEntry = themeByKey[theme] || themeByKey.classic;
  ctx.clearRect(0, 0, game.w, game.h);
  // ground line
  ctx.strokeStyle = "rgba(70,35,73,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, game.ground + pr);
  ctx.lineTo(game.w, game.ground + pr);
  ctx.stroke();
  // stars
  game.stars.forEach((s) => {
    ctx.fillStyle = themeEntry.swatch[1];
    drawStar(ctx, s.x, s.y, 5, s.r, s.r / 2);
  });
  // obstacles
  ctx.fillStyle = themeEntry.swatch[2];
  game.obstacles.forEach((o) => {
    const oy = game.ground - o.h;
    ctx.beginPath();
    ctx.roundRect(o.x, oy, o.w, o.h + pr, 5);
    ctx.fill();
  });
  // player
  ctx.fillStyle = themeEntry.swatch[0];
  ctx.beginPath();
  ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(53,36,63,0.85)";
  ctx.beginPath();
  ctx.arc(px + 5, py - 3, 2.4, 0, Math.PI * 2);
  ctx.fill();

  if (hit) {
    endGame();
    return;
  }
  game.raf = window.requestAnimationFrame(gameStep);
}

function drawStar(ctx, cx, cy, spikes, outer, inner) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  for (let i = 0; i < spikes; i += 1) {
    ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
    rot += step;
  }
  ctx.lineTo(cx, cy - outer);
  ctx.closePath();
  ctx.fill();
}

function startGameRun() {
  if (els.gameOverlay) els.gameOverlay.hidden = true;
  resetGameState();
  game.running = true;
  game.lastTime = 0;
  game.raf = window.requestAnimationFrame(gameStep);
}

function openGame() {
  if (progress.level < gameUnlockLevel || !els.gameModal) return;
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  els.gameModal.hidden = false;
  document.body.classList.add("is-contract-open");
  resetGameState();
  if (els.gameOverlay) {
    els.gameOverlay.hidden = false;
    els.gameOverlay.querySelector("[data-game-result]").textContent =
      `Best ${gameBestScore()}`;
  }
  if (els.gameStart) {
    els.gameStart.textContent = "Start";
    els.gameStart.focus();
  }
}

function closeGame() {
  if (!els.gameModal) return;
  game.running = false;
  window.cancelAnimationFrame(game.raf);
  els.gameModal.hidden = true;
  document.body.classList.remove("is-contract-open");
  if (lastFocusedElement) lastFocusedElement.focus();
}

if (els.gameButton) {
  els.gameButton.addEventListener("click", openGame);
}
if (els.gameClose) {
  els.gameClose.addEventListener("click", closeGame);
}
if (els.gameModal) {
  els.gameModal.querySelectorAll("[data-game-close]").forEach((button) => {
    button.addEventListener("click", closeGame);
  });
}
if (els.gameStart) {
  els.gameStart.addEventListener("click", startGameRun);
}
if (els.gameCanvas) {
  els.gameCanvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (game.running) gameHop();
    else if (els.gameOverlay && !els.gameOverlay.hidden) startGameRun();
  });
}
document.addEventListener("keydown", (event) => {
  if (els.gameModal && !els.gameModal.hidden) {
    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
      event.preventDefault();
      if (game.running) gameHop();
      else startGameRun();
    }
  }
});
window.addEventListener("resize", () => {
  if (els.gameModal && !els.gameModal.hidden) sizeGameCanvas();
});

// Re-render greeting if the app is left open across a time-of-day boundary.
window.setInterval(() => {
  updateTheme();
  updateCompanion();
}, 5 * 60 * 1000);

updateTheme();
updateLevels();
updateStatusBar();
updateGameLock();
updateCompanion();
render();
