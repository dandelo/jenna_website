const initialTasks = [
  "Make a list of social groups to join/look into",
  "Have an ice cream",
  "Play some more game with Dylan",
  "Doing something lovely for Fran",
  "Acknowledge at least two super smart things you do this week, and don't call it being lazy",
  "Try some mindfulness exercises",
  "Buy a new retainer",
  "Talk to Liz, or someone, about what role to move into in the future and what the steps are to get there",
  "Complete a rubik's cube (no cheating!)",
  "Eat tuna steak and rhubarb frangipane",
  "At least once, when you notice yourself worrying about something, take a moment to ask 'is this actually a problem right now?' and if not, try to let it go",
];

const cookieName = "tinyWinsTodo";
const listVersion = "jenna-list-2026-06-08-mural";
const cookieMaxAge = 60 * 60 * 24 * 180;
const maxPersistedTasks = 30;
const defaultLevels = {
  worry: 3,
  gym: 0,
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
  "Jenna has excellent main-character spreadsheet energy.",
  "Jenna is basically a limited-edition good idea machine.",
  "Jenna brings sunshine and sensible chaos in ideal proportions.",
  "Jenna's brain deserves a tiny standing ovation.",
  "Jenna is kind, funny, sharp, and suspiciously good at being lovely.",
  "Jenna has premium sparkle settings enabled.",
  "Jenna could make a Tuesday feel like a tiny festival.",
  "Jenna has elite cozy-chaos management skills.",
  "Jenna's ideas arrive with excellent lighting and snacks.",
  "Jenna is operating at highly advanced lovely-person levels.",
  "Jenna makes competence look suspiciously charming.",
  "Jenna has a five-star brain and a very kind operating system.",
  "Jenna has the exact right amount of sparkle and nonsense.",
  "Jenna is quietly excellent in several highly specific ways.",
  "Jenna brings top-tier wit with a generous side of warmth.",
  "Jenna's presence improves the room's general forecast.",
];
const encouragements = [
  "Tiny victory logged.",
  "That absolutely counts.",
  "Momentum acquired.",
  "One less thing buzzing around.",
  "Good job, that task has been gently defeated.",
  "Small win, excellent form.",
  "The list is visibly less powerful now.",
  "A very respectable little triumph.",
  "Progress has entered the chat.",
  "Done is done, and done is excellent.",
];
const randomTaskIdeas = [
  "Write down one thing that felt easier than expected",
  "Take five slow breaths and unclench your shoulders",
  "Drink a glass of water somewhere you can see daylight",
  "Text someone a small kind thought",
  "Name one thing your future self will be glad you did",
  "Step outside for two minutes and notice three real colours",
  "Make a tiny plan for tomorrow that starts kindly",
  "Tidy one surface just enough to make it calmer",
  "Put on a song that makes your brain feel lighter",
  "Write one sentence about what you need, without judging it",
  "Do one gentle stretch and call it a win",
  "Notice one worry, then write the smallest next step",
  "Make a cup of tea and do absolutely nothing while it brews",
  "Find one small thing to look forward to this week",
  "Say something kind to yourself that you would say to a friend",
  "Spend ten minutes on a task that has been quietly bothering you",
  "Open a window or step outside and take a proper breath",
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

function loadState() {
  const stored = readCookie(cookieName);
  if (!stored) {
    return {
      tasks: starterTasks(),
      levels: { ...defaultLevels },
    };
  }

  try {
    const parsed = JSON.parse(stored);
    const shouldRefreshDefaults = parsed?.version !== listVersion;
    const savedTasks = normaliseTasks(parsed);

    return {
      tasks: shouldRefreshDefaults ? starterTasks() : (savedTasks ?? starterTasks()),
      levels: normaliseLevels(parsed.levels),
      needsSave: shouldRefreshDefaults,
    };
  } catch {
    return {
      tasks: starterTasks(),
      levels: { ...defaultLevels },
    };
  }
}

function saveState() {
  const payload = JSON.stringify({
    version: listVersion,
    levels,
    tasks: tasks.slice(0, maxPersistedTasks).map((task) => [task.title, task.done ? 1 : 0]),
  });
  writeCookie(cookieName, payload);
}

const loadedState = loadState();
let tasks = loadedState.tasks;
let levels = loadedState.levels;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const els = {
  activeCount: document.querySelector("#active-count"),
  badgeRack: document.querySelector("#badge-rack"),
  complimentButton: document.querySelector("#compliment-button"),
  complimentLine: document.querySelector("#compliment-line"),
  doneCount: document.querySelector("#done-count"),
  doneList: document.querySelector("#done-list"),
  doneSection: document.querySelector("#done-section"),
  effectLayer: document.querySelector("#effect-layer"),
  effectStatus: document.querySelector("#effect-status"),
  encouragementLine: document.querySelector("#encouragement-line"),
  form: document.querySelector("#add-form"),
  input: document.querySelector("#new-task"),
  list: document.querySelector("#task-list"),
  progress: document.querySelector("#progress-bar"),
  randomTaskButton: document.querySelector("#random-task-button"),
  resetButton: document.querySelector("#reset-button"),
  summaryCount: document.querySelector("#summary-count"),
  summaryMood: document.querySelector("#summary-mood"),
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

function addTask(title) {
  const cleanedTitle = cleanTitle(title);
  if (!cleanedTitle) return false;

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

  els.effectLayer.append(fragment);
  effectTimer = window.setTimeout(clearEffect, 2400);
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
    if (recentlyCompletedId) {
      showEncouragement();
      triggerTaskSparkle(sparkleRect);
    }
    saveState();
    render(previousBadgeKeys);
    if (!wasAllComplete && isAllComplete()) triggerEffect("complete");
  });

  const checkVisual = document.createElement("label");
  checkVisual.className = "task-check";
  checkVisual.htmlFor = checkbox.id;
  checkVisual.setAttribute("aria-hidden", "true");

  const title = document.createElement("label");
  title.className = "task-title";
  title.htmlFor = checkbox.id;
  title.textContent = task.title;

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

updateLevels();
render();
