/* =========================================================
   Smart Agriculture Student Portal — Vanilla JS
   Modular logic with JSON-based state management.
   Edit ROUTINE below to change your class schedule.
   ========================================================= */

/* -------------------- 1. DATA: Class Routine -------------------- */
// Day index: 0=Sunday ... 6=Saturday
const DAY_FULL_BN = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];

const ROUTINE = {
  0: [ // রবিবার
    { subject: "পদার্থ বিজ্ঞান-২", startTime: "09:30", endTime: "10:15", room: "R-201", type: "theory" },
    { subject: "জীব বিজ্ঞান-২",   startTime: "10:15", endTime: "11:00", room: "R-202", type: "theory" },
    { subject: "রসায়ন-২",         startTime: "11:00", endTime: "11:45", room: "R-203", type: "theory" },
    { subject: "ভূমি আর্দ্রতা সংরক্ষণ ও উৎপাদন প্রযুক্তি-২", startTime: "12:00", endTime: "12:45", room: "R-301", type: "theory" },
  ],
  1: [ // সোমবার
    { subject: "হিসাববিজ্ঞান",     startTime: "09:30", endTime: "10:15", room: "R-105", type: "theory" },
    { subject: "পদার্থ বিজ্ঞান-২", startTime: "10:15", endTime: "11:00", room: "R-201", type: "theory" },
    { subject: "বাংলা-২",          startTime: "11:00", endTime: "11:45", room: "R-110", type: "theory" },
    { subject: "রসায়ন-২",         startTime: "12:00", endTime: "12:45", room: "R-203", type: "theory" },
  ],
  2: [ // মঙ্গলবার
    { subject: "কম্পিউটার অ্যাপ্লিকেশন",      startTime: "11:00", endTime: "11:45", room: "Lab-1", type: "theory" },
    { subject: "ভূমি আর্দ্রতা সংরক্ষণ (ব্যব)", startTime: "11:45", endTime: "12:30", room: "Lab-3", type: "practical" },
    { subject: "জীব বিজ্ঞান-২ (ব্যব)",          startTime: "12:30", endTime: "13:15", room: "Lab-2", type: "practical" },
    { subject: "রসায়ন (ব্যব)",                  startTime: "13:15", endTime: "14:00", room: "Lab-4", type: "practical" },
  ],
  3: [ // বুধবার
    { subject: "বাংলা-২",                 startTime: "09:30", endTime: "10:15", room: "R-110", type: "theory" },
    { subject: "পদার্থ বিজ্ঞান-২ (ব্যব)", startTime: "10:15", endTime: "11:00", room: "Lab-5", type: "practical" },
    { subject: "ইংরেজি",                  startTime: "11:00", endTime: "11:45", room: "R-112", type: "theory" },
  ],
  4: [], // বৃহস্পতিবার — fill in when available
  5: [], // শুক্রবার — weekend
  6: [], // শনিবার — weekend
};

/* -------------------- 2. UTILITIES -------------------- */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const fmt2 = (n) => String(n).padStart(2, "0");
const nowMin = (d) => d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;

function fmtCountdown(mins) {
  if (mins <= 0) return "এখনই";
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  return h > 0 ? `${h} ঘণ্টা ${m} মিনিট` : `${m} মিনিট`;
}

function nextDayWithClasses(from) {
  for (let i = 1; i <= 7; i++) {
    const idx = (from + i) % 7;
    if ((ROUTINE[idx] || []).length > 0) return idx;
  }
  return (from + 1) % 7;
}

/* -------------------- 3. LOGIC ENGINE -------------------- */
function getDynamicState(now = new Date()) {
  const dayIndex = now.getDay();
  const todayClasses = ROUTINE[dayIndex] || [];
  const cur = nowMin(now);
  const isWeekend = dayIndex === 5 || dayIndex === 6;

  let activeClass = null, activeProgress = 0, nextClass = null, minutesToNext = null;

  for (const c of todayClasses) {
    const s = toMin(c.startTime), e = toMin(c.endTime);
    if (cur >= s && cur < e) { activeClass = c; activeProgress = (cur - s) / (e - s); break; }
  }
  if (!activeClass) {
    for (const c of todayClasses) {
      const s = toMin(c.startTime);
      if (s > cur) { nextClass = c; minutesToNext = s - cur; break; }
    }
  }
  const lastEnd = todayClasses.length ? todayClasses[todayClasses.length - 1].endTime : null;
  const afterHours = lastEnd != null && cur >= toMin(lastEnd);

  let mode;
  if (isWeekend) mode = "weekend";
  else if (activeClass) mode = "active-class";
  else if (afterHours || todayClasses.length === 0) mode = "after-hours";
  else mode = "before-classes";

  const upcomingDayIndex = (mode === "after-hours" || mode === "weekend")
    ? nextDayWithClasses(dayIndex) : dayIndex;

  return { now, dayIndex, isWeekend, todayClasses, activeClass, activeProgress,
           nextClass, minutesToNext, lastEnd, mode, upcomingDayIndex,
           upcomingClasses: ROUTINE[upcomingDayIndex] || [] };
}

/* -------------------- 4. RENDER: Hero + Priority -------------------- */
function renderHeroAndPriority(state) {
  const d = state.now;
  $("#clock").textContent = `${fmt2(d.getHours())}:${fmt2(d.getMinutes())}:${fmt2(d.getSeconds())}`;
  $("#dateLine").textContent = `${DAY_FULL_BN[d.getDay()]} · ${d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}`;

  const card = $("#priorityCard");
  card.classList.remove("active");

  let badge = "Top Priority", subject = "—", meta = "", status = "", progress = 0;

  if (state.mode === "weekend") {
    badge = "🌴 ছুটির দিন"; subject = "সাপ্তাহিক বিশ্রাম";
    meta = `পরবর্তী ক্লাসের দিন: ${DAY_FULL_BN[state.upcomingDayIndex]}`;
    status = "অ্যাসাইনমেন্ট সম্পন্ন করুন এবং বিশ্রাম নিন।";
  } else if (state.mode === "active-class") {
    card.classList.add("active");
    badge = "🔴 চলমান ক্লাস"; subject = state.activeClass.subject;
    meta = `${state.activeClass.startTime} – ${state.activeClass.endTime} · ${state.activeClass.room || ""}`;
    progress = state.activeProgress * 100;
    status = `ক্লাস চলছে — ${Math.round(progress)}% সম্পন্ন`;
  } else if (state.mode === "before-classes" && state.nextClass) {
    badge = "⏳ পরবর্তী ক্লাস"; subject = state.nextClass.subject;
    meta = `${state.nextClass.startTime} – ${state.nextClass.endTime} · ${state.nextClass.room || ""}`;
    status = `শুরু হবে ${fmtCountdown(state.minutesToNext)} পরে`;
    $("#priorityCountdown").textContent = fmtCountdown(state.minutesToNext);
  } else if (state.mode === "after-hours") {
    badge = "🌙 আজকের ক্লাস শেষ"; subject = "আগামীকালের প্রস্তুতি";
    meta = `পরবর্তী দিন: ${DAY_FULL_BN[state.upcomingDayIndex]} · ${state.upcomingClasses.length} টি ক্লাস`;
    status = "নোট রিভিউ ও অ্যাসাইনমেন্ট সম্পন্ন করুন।";
  }

  $("#priorityBadge").textContent = badge;
  $("#prioritySubject").textContent = subject;
  $("#priorityMeta").textContent = meta;
  $("#priorityProgress").style.width = `${progress}%`;
  $("#statusLine").textContent = status;
  if (state.mode !== "before-classes") $("#priorityCountdown").textContent = "";
}

/* -------------------- 5. RENDER: Schedule -------------------- */
let currentView = "today";
function renderSchedule(state) {
  const body = $("#scheduleBody");
  const cur = nowMin(state.now);

  const renderDayList = (classes, todayDay) => {
    if (!classes.length) return `<p class="empty-day bn">কোনো ক্লাস নেই — বিশ্রামের দিন 🌿</p>`;
    return classes.map(c => {
      const s = toMin(c.startTime), e = toMin(c.endTime);
      const isNow = todayDay && cur >= s && cur < e;
      const isDone = todayDay && cur >= e;
      const cls = ["class-card"]; if (isNow) cls.push("now"); if (isDone) cls.push("done");
      return `<div class="${cls.join(" ")}">
        <div class="class-time mono">${c.startTime}<br/>${c.endTime}</div>
        <div>
          <div class="class-subject">${c.subject}</div>
          <div class="class-room">${c.room || ""}</div>
        </div>
        <span class="class-tag ${c.type || "theory"}">${c.type === "practical" ? "ব্যব" : "তত্ত্ব"}</span>
      </div>`;
    }).join("");
  };

  if (currentView === "today") {
    body.innerHTML = renderDayList(state.todayClasses, true);
  } else if (currentView === "tomorrow") {
    const tIdx = (state.dayIndex + 1) % 7;
    body.innerHTML = `<h4 class="bn">${DAY_FULL_BN[tIdx]}</h4>` + renderDayList(ROUTINE[tIdx] || [], false);
  } else { // week
    body.innerHTML = [0,1,2,3,4,5,6].map(idx =>
      `<div class="day-group">
         <h4 class="bn">${DAY_FULL_BN[idx]}${idx === state.dayIndex ? " · আজ" : ""}</h4>
         ${renderDayList(ROUTINE[idx] || [], idx === state.dayIndex)}
       </div>`
    ).join("");
  }
}

$$(".tab").forEach(btn => btn.addEventListener("click", () => {
  $$(".tab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentView = btn.dataset.view;
  renderSchedule(getDynamicState());
}));

/* -------------------- 6. ASSIGNMENTS (localStorage) -------------------- */
const STORE_KEY = "sasp.assignments.v1";

function loadAssignments() {
  try { const raw = localStorage.getItem(STORE_KEY); if (raw) return JSON.parse(raw); } catch {}
  const today = new Date();
  const inDays = (d) => { const x = new Date(today); x.setDate(x.getDate() + d); x.setHours(23,59,0,0); return x.toISOString(); };
  const seed = [
    { id: crypto.randomUUID(), title: "ল্যাব রিপোর্ট: রসায়ন-২",   subject: "রসায়ন-২",            dueDate: inDays(1), done: false },
    { id: crypto.randomUUID(), title: "অ্যাসাইনমেন্ট: ভূমি আর্দ্রতা", subject: "ভূমি আর্দ্রতা সংরক্ষণ", dueDate: inDays(3), done: false },
    { id: crypto.randomUUID(), title: "প্রেজেন্টেশন: জীব বিজ্ঞান-২", subject: "জীব বিজ্ঞান-২",       dueDate: inDays(7), done: false },
  ];
  localStorage.setItem(STORE_KEY, JSON.stringify(seed));
  return seed;
}
function saveAssignments(items) { localStorage.setItem(STORE_KEY, JSON.stringify(items)); }

let assignments = loadAssignments();

function hoursLeft(due) { return (new Date(due).getTime() - Date.now()) / 36e5; }
function daysLeft(due)  { return Math.ceil(hoursLeft(due) / 24); }

function renderAssignments() {
  const list = $("#assignList");
  const sorted = [...assignments].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  if (!sorted.length) { list.innerHTML = `<li class="empty-day bn">কোনো অ্যাসাইনমেন্ট নেই 🎉</li>`; return; }
  list.innerHTML = sorted.map(a => {
    const h = hoursLeft(a.dueDate);
    const urgent = !a.done && h <= 48 && h > 0;
    const dl = daysLeft(a.dueDate);
    const dueText = a.done ? "সম্পন্ন" : (h <= 0 ? "মেয়াদোত্তীর্ণ" : (dl <= 1 ? `${Math.max(0, Math.round(h))} ঘণ্টা` : `${dl} দিন`));
    return `<li class="assign-item ${a.done ? "done" : ""} ${urgent ? "urgent" : ""}" data-id="${a.id}">
      <button class="assign-check" data-action="toggle">${a.done ? "✓" : ""}</button>
      <div>
        <div class="assign-title bn">${a.title}</div>
        <div class="assign-sub bn">${a.subject}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
        <span class="assign-due bn">${dueText}</span>
        <button class="assign-del" data-action="del" title="মুছুন">✕</button>
      </div>
    </li>`;
  }).join("");
}

$("#assignList").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]"); if (!btn) return;
  const id = btn.closest(".assign-item").dataset.id;
  if (btn.dataset.action === "toggle") {
    assignments = assignments.map(a => a.id === id ? { ...a, done: !a.done } : a);
  } else if (btn.dataset.action === "del") {
    assignments = assignments.filter(a => a.id !== id);
  }
  saveAssignments(assignments); renderAssignments();
});

$("#addBtn").addEventListener("click", () => $("#addForm").hidden = !$("#addForm").hidden);
$("#cancelAdd").addEventListener("click", () => $("#addForm").hidden = true);
$("#addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $("#aTitle").value.trim();
  const subject = $("#aSubject").value.trim();
  const due = $("#aDue").value;
  if (!title || !subject || !due) return;
  const dueIso = new Date(`${due}T23:59:00`).toISOString();
  assignments = [{ id: crypto.randomUUID(), title, subject, dueDate: dueIso, done: false }, ...assignments];
  saveAssignments(assignments); renderAssignments();
  e.target.reset(); $("#addForm").hidden = true;
});

/* -------------------- 7. GPA CALCULATOR -------------------- */
const GRADE_POINTS = { "A+": 4.0, "A": 3.75, "A-": 3.5, "B+": 3.25, "B": 3.0, "B-": 2.75, "C+": 2.5, "C": 2.25, "D": 2.0, "F": 0 };
let gpaCourses = [{ name: "", credit: 3, grade: "A" }];

function renderGpa() {
  $("#gpaRows").innerHTML = gpaCourses.map((c, i) => `
    <div class="gpa-row">
      <input data-i="${i}" data-k="name" placeholder="কোর্স" value="${c.name}" />
      <input data-i="${i}" data-k="credit" type="number" min="0" step="0.5" value="${c.credit}" />
      <select data-i="${i}" data-k="grade">
        ${Object.keys(GRADE_POINTS).map(g => `<option ${g === c.grade ? "selected" : ""}>${g}</option>`).join("")}
      </select>
      <button class="btn-icon" data-rm="${i}" title="মুছুন">✕</button>
    </div>`).join("");
}
$("#gpaRows").addEventListener("input", (e) => {
  const i = +e.target.dataset.i, k = e.target.dataset.k;
  if (k != null) gpaCourses[i][k] = k === "credit" ? +e.target.value : e.target.value;
});
$("#gpaRows").addEventListener("click", (e) => {
  if (e.target.dataset.rm != null) {
    gpaCourses.splice(+e.target.dataset.rm, 1);
    if (!gpaCourses.length) gpaCourses.push({ name: "", credit: 3, grade: "A" });
    renderGpa();
  }
});
$("#gpaAdd").addEventListener("click", () => { gpaCourses.push({ name: "", credit: 3, grade: "A" }); renderGpa(); });
$("#gpaCalc").addEventListener("click", () => {
  let totalC = 0, totalP = 0;
  gpaCourses.forEach(c => { const cr = +c.credit || 0; totalC += cr; totalP += cr * (GRADE_POINTS[c.grade] || 0); });
  const gpa = totalC ? (totalP / totalC).toFixed(2) : "—";
  $("#gpaResult").textContent = `GPA: ${gpa}  (Credits: ${totalC})`;
});
$("#gpaToggle").addEventListener("click", () => { $("#gpaModal").hidden = false; renderGpa(); });
$("#gpaClose").addEventListener("click", () => { $("#gpaModal").hidden = true; });
$("#gpaModal").addEventListener("click", (e) => { if (e.target.id === "gpaModal") $("#gpaModal").hidden = true; });

/* -------------------- 8. MAIN LOOP -------------------- */
function tick() {
  const state = getDynamicState();
  renderHeroAndPriority(state);
  renderSchedule(state);
}
tick();
renderAssignments();
setInterval(tick, 1000);
// Re-render assignments every minute to update countdowns
setInterval(renderAssignments, 60000);
