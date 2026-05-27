const initialTasks = [
  "Actually collect bike 🙌",
  "Chill water for gym",
  "Watch the sheep detectives",
  "make a list of social groups to join/look into",
  "Have an ice cream",
  "Play some more game with Dylan",
  "Doing something lovely for Fran",
  "Acknowledge at least one super smart thing you do this week, and don't call it being lazy",
  "Try some meditation before bed",
  "...or buy a new retainer",
  "Have a delicious meal at sunny stores",
  "Eat some \"marry me butter beans\"",
  "Talk to Liz, or someone, about what role to move into in the future and what the steps are to get there",
  "Say \"Hey girlie squirly\" to Lola",
  "Remember that Jenna is Kind, Sweet, Self-Aware, Funny and super resilient",
];

const cookieName = "tinyWinsTodo";
const listVersion = "jenna-list-2026-05-27-mural";
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
  effectLayer: document.querySelector("#effect-layer"),
  effectStatus: document.querySelector("#effect-status"),
  form: document.querySelector("#add-form"),
  input: document.querySelector("#new-task"),
  list: document.querySelector("#task-list"),
  progress: document.querySelector("#progress-bar"),
  resetButton: document.querySelector("#reset-button"),
  summaryCount: document.querySelector("#summary-count"),
  summaryMood: document.querySelector("#summary-mood"),
  worrySlider: document.querySelector("#worry-level"),
  worryValue: document.querySelector("#worry-value"),
  gymSlider: document.querySelector("#gym-visits"),
  gymValue: document.querySelector("#gym-value"),
};

let effectTimer;

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

function updateSummary() {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
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

function orderedTasks() {
  return [
    ...tasks.filter((task) => !task.done),
    ...tasks.filter((task) => task.done),
  ];
}

function isAllComplete() {
  return tasks.length > 0 && tasks.every((task) => task.done);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
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
  els.effectLayer.replaceChildren();
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

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.done ? " is-done" : ""}`;
  item.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `check-${task.id}`;
  checkbox.checked = task.done;
  checkbox.addEventListener("change", () => {
    const wasAllComplete = isAllComplete();
    task.done = checkbox.checked;
    saveState();
    render();
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
    tasks = tasks.filter((candidate) => candidate.id !== task.id);
    saveState();
    render();
    if (!wasAllComplete && isAllComplete()) triggerEffect("complete");
  });

  item.append(checkbox, checkVisual, title, removeButton);
  return item;
}

function render() {
  els.list.replaceChildren();

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Nothing on the list right now.";
    els.list.append(empty);
    updateSummary();
    return;
  }

  const fragment = document.createDocumentFragment();
  orderedTasks().forEach((task) => fragment.append(createTaskElement(task)));
  els.list.append(fragment);
  updateSummary();
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

  tasks = [
    {
      id: createId(tasks.length),
      title,
      done: false,
    },
    ...tasks,
  ];

  els.input.value = "";
  saveState();
  render();
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

els.resetButton.addEventListener("click", resetList);

updateLevels();
render();
