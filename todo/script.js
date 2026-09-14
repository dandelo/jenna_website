const initialTasks = [
  "chose a film to watch at the weekend",
  "re-invite everyone who didn't make it to your new home yet",
  "buy some key hooks for the key shelf",
  "put up the key shelf",
  "buy the second bedside table",
  "watch second episode of task master",
  "write down three things that made the new home feel like yours",
  "plan next gym visit",
  "have a cozy time with a hot chocolate at home",
  "find one thing to look forward to next week",
];

const cookieName = "tinyWinsTodo";
const listVersion = "jenna-list-2026-09-07-home-hot-chocolate";
const cookieMaxAge = 60 * 60 * 24 * 180;
const maxPersistedTasks = 30;
const defaultLevels = {
  worry: 3,
  gym: 0,
};
const defaultTheme = "classic";
const themeText = {
  classic: {
    eyebrow: "Tiny missions",
    title: "Tiny Wins Todo",
    copy: "A cheerful little list for getting the good stuff done.",
    activeTitle: "Still in progress",
    doneTitle: "Done and dusted",
  },
  homewarming: {
    eyebrow: "Homewarming mode",
    title: "New Home Nesting",
    copy: "Warm little missions for settling in, making memories, and claiming the sofa properly.",
    activeTitle: "Still settling in",
    doneTitle: "Moved into done",
  },
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
  return Object.prototype.hasOwnProperty.call(themeText, value) ? value : defaultTheme;
}

function loadState() {
  const stored = readCookie(cookieName);
  if (!stored) {
    return {
      tasks: starterTasks(),
      levels: { ...defaultLevels },
      theme: defaultTheme,
    };
  }

  try {
    const parsed = JSON.parse(stored);
    const shouldRefreshDefaults = parsed?.version !== listVersion;
    const savedTasks = normaliseTasks(parsed);

    return {
      tasks: shouldRefreshDefaults ? starterTasks() : (savedTasks ?? starterTasks()),
      levels: normaliseLevels(parsed.levels),
      theme: normaliseTheme(parsed.theme),
      needsSave: shouldRefreshDefaults,
    };
  } catch {
    return {
      tasks: starterTasks(),
      levels: { ...defaultLevels },
      theme: defaultTheme,
    };
  }
}

function saveState() {
  const payload = JSON.stringify({
    version: listVersion,
    levels,
    theme,
    tasks: tasks.slice(0, maxPersistedTasks).map((task) => [task.title, task.done ? 1 : 0]),
  });
  writeCookie(cookieName, payload);
}

const loadedState = loadState();
let tasks = loadedState.tasks;
let levels = loadedState.levels;
let theme = loadedState.theme;
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
  themeToggle: document.querySelector("#theme-toggle"),
  worrySlider: document.querySelector("#worry-level"),
  worryValue: document.querySelector("#worry-value"),
  gymSlider: document.querySelector("#gym-visits"),
  gymValue: document.querySelector("#gym-value"),
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

function updateTheme() {
  const isHomewarming = theme === "homewarming";
  const text = themeText[theme] || themeText[defaultTheme];
  document.body.dataset.theme = theme;
  if (els.heroEyebrow) els.heroEyebrow.textContent = text.eyebrow;
  if (els.pageTitle) els.pageTitle.textContent = text.title;
  if (els.heroCopy) els.heroCopy.textContent = text.copy;

  const activeTitle = document.querySelector("#active-title");
  const doneTitle = document.querySelector("#done-title");
  if (activeTitle) activeTitle.textContent = text.activeTitle;
  if (doneTitle) doneTitle.textContent = text.doneTitle;
  if (els.metaThemeColor) els.metaThemeColor.content = isHomewarming ? "#f0b971" : "#92ccea";

  if (!els.themeToggle) return;
  const label = els.themeToggle.querySelector(".theme-toggle__label");
  const detail = els.themeToggle.querySelector(".theme-toggle__detail");
  els.themeToggle.setAttribute("aria-pressed", String(isHomewarming));
  els.themeToggle.setAttribute(
    "aria-label",
    `Switch theme. Current theme: ${isHomewarming ? "Home" : "Classic"}`,
  );
  if (label) label.textContent = "Theme";
  if (detail) detail.textContent = isHomewarming ? "Home" : "Classic";
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
  recentlyCompletedId = null;
}

function resetList() {
  tasks = starterTasks();
  levels = { ...defaultLevels };
  els.input.value = "";
  saveState();
  updateLevels();
  updateTheme();
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

if (els.themeToggle) {
  els.themeToggle.addEventListener("click", () => {
    theme = theme === "homewarming" ? "classic" : "homewarming";
    updateTheme();
    saveState();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && els.contractModal && !els.contractModal.hidden) {
    closeFriendContract();
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

updateTheme();
updateLevels();
render();
