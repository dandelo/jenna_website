const event = {
  name: "Eta Aquariids",
  activeStart: new Date("2026-04-19T00:00:00+01:00"),
  peakStart: new Date("2026-05-06T00:00:00+01:00"),
  peakEnd: new Date("2026-05-06T05:00:00+01:00"),
  activeEnd: new Date("2026-05-28T23:59:59+01:00"),
};

const els = {
  label: document.querySelector("#countdown-label"),
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
  ukTime: document.querySelector("#uk-time"),
  status: document.querySelector("#event-status"),
};

const ukTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
});

function splitDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function renderDuration(duration) {
  els.days.textContent = String(duration.days);
  els.hours.textContent = pad(duration.hours);
  els.minutes.textContent = pad(duration.minutes);
  els.seconds.textContent = pad(duration.seconds);
}

function update() {
  const now = new Date();
  els.ukTime.textContent = ukTimeFormatter.format(now);

  if (now < event.peakStart) {
    els.label.textContent = "Peak window opens in";
    els.status.textContent = "Active now, peak still ahead";
    renderDuration(splitDuration(event.peakStart - now));
    return;
  }

  if (now <= event.peakEnd) {
    els.label.textContent = "Peak window closes in";
    els.status.textContent = "Peak window open";
    renderDuration(splitDuration(event.peakEnd - now));
    return;
  }

  if (now <= event.activeEnd) {
    els.label.textContent = "Shower remains active for";
    els.status.textContent = "Past peak, still active";
    renderDuration(splitDuration(event.activeEnd - now));
    return;
  }

  els.label.textContent = "This shower peaked";
  els.status.textContent = "Next major UK favourite: Perseids, 12-13 Aug 2026";
  renderDuration({ days: 0, hours: 0, minutes: 0, seconds: 0 });
}

update();
setInterval(update, 1000);
