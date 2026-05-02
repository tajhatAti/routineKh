/**
 * Smart Agriculture Student Portal – app.js
 * 2nd Semester Logic Engine
 * Author: Ahad | Room: 110
 */

// ============================================================
// ROUTINE DATA – 2nd Semester
// Days: 0=Sun, 1=Mon, 2=Tue, 3=Wed | Thu/Fri/Sat = off
// ============================================================
const ROUTINE = {
  0: { // রবিবার
    name: 'রবিবার',
    nameEn: 'Sunday',
    classes: [
      { id: 's1', subject: 'পদার্থ বিজ্ঞান-২', startTime: '09:30', endTime: '10:15', room: '110', type: 'theory', icon: '⚛️', color: '#22d3ee' },
      { id: 's2', subject: 'জীব বিজ্ঞান-২',   startTime: '10:15', endTime: '11:00', room: '110', type: 'theory', icon: '🧬', color: '#34d399' },
      { id: 's3', subject: 'রসায়ন-২',          startTime: '11:00', endTime: '11:45', room: '110', type: 'theory', icon: '🧪', color: '#f472b6' },
      { id: 's4', subject: 'ভূমি আর্দ্রতা সংরক্ষণে উৎপাদন প্রযুক্তি-২', startTime: '12:00', endTime: '12:45', room: '110', type: 'theory', icon: '🌱', color: '#a3e635' },
    ]
  },
  1: { // সোমবার
    name: 'সোমবার',
    nameEn: 'Monday',
    classes: [
      { id: 'm1', subject: 'হিসাববিজ্ঞান',     startTime: '09:30', endTime: '10:15', room: '110', type: 'theory', icon: '📊', color: '#fbbf24' },
      { id: 'm2', subject: 'পদার্থ বিজ্ঞান-২', startTime: '10:15', endTime: '11:00', room: '110', type: 'theory', icon: '⚛️', color: '#22d3ee' },
      { id: 'm3', subject: 'বাংলা-২',           startTime: '11:00', endTime: '11:45', room: '110', type: 'theory', icon: '📖', color: '#fb923c' },
      { id: 'm4', subject: 'রসায়ন-২',           startTime: '12:00', endTime: '12:45', room: '110', type: 'theory', icon: '🧪', color: '#f472b6' },
    ]
  },
  2: { // মঙ্গলবার
    name: 'মঙ্গলবার',
    nameEn: 'Tuesday',
    classes: [
      { id: 't1', subject: 'কম্পিউটার অ্যাপ্লিকেশন',                     startTime: '11:00', endTime: '11:45', room: '110', type: 'theory',    icon: '💻', color: '#38bdf8' },
      { id: 't2', subject: 'ভূমি আর্দ্রতা সংরক্ষণে উৎপাদন প্রযুক্তি (ব্যব)', startTime: '11:45', endTime: '12:30', room: '110', type: 'practical', icon: '🌾', color: '#a3e635' },
      { id: 't3', subject: 'জীব বিজ্ঞান-২ (ব্যব)',                         startTime: '12:30', endTime: '13:15', room: '110', type: 'practical', icon: '🔬', color: '#34d399' },
      { id: 't4', subject: 'রসায়ন (ব্যব)',                                  startTime: '13:15', endTime: '14:00', room: '110', type: 'practical', icon: '⚗️', color: '#f472b6' },
    ]
  },
  3: { // বুধবার
    name: 'বুধবার',
    nameEn: 'Wednesday',
    classes: [
      { id: 'w1', subject: 'বাংলা-২',           startTime: '09:30', endTime: '10:15', room: '110', type: 'theory',    icon: '📖', color: '#fb923c' },
      { id: 'w2', subject: 'পদার্থ বিজ্ঞান-২ (ব্যব)', startTime: '10:15', endTime: '11:00', room: '110', type: 'practical', icon: '🔭', color: '#22d3ee' },
      { id: 'w3', subject: 'ইংরেজি',            startTime: '11:00', endTime: '11:45', room: '110', type: 'theory',    icon: '🗣️', color: '#c084fc' },
    ]
  },
  // 4=Thu, 5=Fri, 6=Sat — ছুটি
};

const DAY_NAMES_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const MONTH_NAMES_BN = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

// ============================================================
// STATE
// ============================================================
let currentView = 'today';
let assignments = loadAssignments();

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  renderAll();
  setView('today');
});

// ============================================================
// CLOCK & DATE
// ============================================================
function startClock() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    document.getElementById('live-clock').textContent = `${h}:${m}:${s}`;

    const day = DAY_NAMES_BN[now.getDay()];
    const date = now.getDate();
    const month = MONTH_NAMES_BN[now.getMonth()];
    const year = now.getFullYear();
    document.getElementById('live-date').textContent = `${day}, ${date} ${month} ${year}`;

    updateStatusBanner();
    refreshClassCardStates();
  }
  tick();
  setInterval(tick, 1000);
}

// ============================================================
// DYNAMIC STATE ENGINE
// ============================================================
function getDynamicState() {
  const now = new Date();
  const dayIndex = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Weekend check (Thu=4, Fri=5, Sat=6)
  if (dayIndex >= 4) {
    // Find next school day
    let nextDay = (dayIndex + 1) % 7;
    while (nextDay >= 4) nextDay = (nextDay + 1) % 7;
    const nextDayName = ROUTINE[nextDay]?.name || 'রবিবার';
    return { mode: 'weekend', nextDayName, dayIndex, currentMinutes };
  }

  const todayRoutine = ROUTINE[dayIndex];

  if (!todayRoutine || !todayRoutine.classes.length) {
    return { mode: 'noclass', dayIndex, currentMinutes };
  }

  const classes = todayRoutine.classes;
  const firstStart = timeToMinutes(classes[0].startTime);
  const lastEnd   = timeToMinutes(classes[classes.length - 1].endTime);

  // Check if in an active class
  for (const cls of classes) {
    const start = timeToMinutes(cls.startTime);
    const end   = timeToMinutes(cls.endTime);
    if (currentMinutes >= start && currentMinutes < end) {
      return { mode: 'active', activeClass: cls, dayIndex, currentMinutes, classes };
    }
  }

  // After last class
  if (currentMinutes >= lastEnd) {
    // Find next school day
    let nextDay = (dayIndex + 1) % 7;
    while (nextDay >= 4) nextDay = (nextDay + 1) % 7;
    const nextDayData = ROUTINE[nextDay];
    return { mode: 'afterhours', dayIndex, currentMinutes, nextDayData, nextDay };
  }

  // Before first class
  if (currentMinutes < firstStart) {
    // Find next upcoming class
    const nextCls = classes[0];
    const minsLeft = firstStart - currentMinutes;
    return { mode: 'beforeclass', nextClass: nextCls, minsLeft, dayIndex, currentMinutes, classes };
  }

  // Between classes
  for (let i = 0; i < classes.length - 1; i++) {
    const end  = timeToMinutes(classes[i].endTime);
    const next = timeToMinutes(classes[i+1].startTime);
    if (currentMinutes >= end && currentMinutes < next) {
      const minsLeft = next - currentMinutes;
      return { mode: 'break', nextClass: classes[i+1], minsLeft, dayIndex, currentMinutes, classes };
    }
  }

  return { mode: 'idle', dayIndex, currentMinutes };
}

function updateStatusBanner() {
  const state = getDynamicState();
  const banner = document.getElementById('status-banner');
  const icon   = document.getElementById('status-icon');
  const title  = document.getElementById('status-title');
  const sub    = document.getElementById('status-subtitle');
  const pill   = document.getElementById('next-class-pill');

  pill.classList.add('hidden');
  banner.style.borderColor = '';

  switch (state.mode) {
    case 'active':
      icon.textContent = state.activeClass.icon;
      title.textContent = `এখন চলছে: ${state.activeClass.subject}`;
      sub.textContent  = `সময়: ${state.activeClass.startTime} – ${state.activeClass.endTime} | Room ${state.activeClass.room}`;
      banner.style.borderColor = 'rgba(34,211,238,0.4)';
      break;

    case 'break':
      icon.textContent = '☕';
      title.textContent = 'ব্রেক টাইম!';
      sub.textContent  = `পরবর্তী ক্লাস: ${state.nextClass.subject} – ${state.nextClass.startTime} তে (${state.minsLeft} মিনিট বাকি)`;
      pill.textContent = `${state.minsLeft} মিনিট`;
      pill.classList.remove('hidden');
      break;

    case 'beforeclass':
      icon.textContent = '🌅';
      title.textContent = 'প্রথম ক্লাসের আগে';
      sub.textContent  = `প্রথম ক্লাস: ${state.nextClass.subject} – ${state.nextClass.startTime} তে (${state.minsLeft} মিনিট বাকি)`;
      pill.textContent = `${state.minsLeft} মিনিট`;
      pill.classList.remove('hidden');
      break;

    case 'afterhours':
      icon.textContent = '🌙';
      title.textContent = 'আজকের ক্লাস শেষ – পরের দিনের প্রস্তুতি নাও';
      sub.textContent  = `আগামীকাল (${state.nextDayData?.name}): ${state.nextDayData?.classes[0]?.subject} দিয়ে শুরু – ${state.nextDayData?.classes[0]?.startTime}`;
      break;

    case 'weekend':
      icon.textContent = '🌴';
      title.textContent = 'উইকেন্ড! বিশ্রাম ও রিভিশনের সময়';
      sub.textContent  = `পরের স্কুলের দিন: ${state.nextDayName}`;
      break;

    case 'noclass':
    default:
      icon.textContent = '📚';
      title.textContent = 'স্মার্ট এগ্রি পোর্টালে স্বাগতম';
      sub.textContent  = '২য় সেমিস্টার | Room 110 | তোমার রুটিন ও অ্যাসাইনমেন্ট এখানেই';
  }
}

// ============================================================
// CLASS CARD STATE REFRESH (active/done)
// ============================================================
function refreshClassCardStates() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  document.querySelectorAll('.class-card[data-start][data-end]').forEach(card => {
    const start = parseInt(card.dataset.start);
    const end   = parseInt(card.dataset.end);
    card.classList.remove('active-class', 'done-class');

    const badge = card.querySelector('.class-badge');
    if (badge) {
      badge.classList.remove('badge-active', 'badge-done');
      if (currentMinutes >= start && currentMinutes < end) {
        card.classList.add('active-class');
        badge.textContent = '● চলছে';
        badge.classList.add('badge-active');
      } else if (currentMinutes >= end) {
        card.classList.add('done-class');
        badge.textContent = '✓ শেষ';
        badge.classList.add('badge-done');
      }
    }
  });
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================
function renderAll() {
  renderToday();
  renderTomorrow();
  renderWeekly();
  renderAssignments();
}

function buildClassCard(cls, showProgressBar = false) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const start = timeToMinutes(cls.startTime);
  const end   = timeToMinutes(cls.endTime);
  const isActive = currentMinutes >= start && currentMinutes < end;
  const isDone   = currentMinutes >= end;

  let badgeClass = cls.type === 'practical' ? 'badge-practical' : 'badge-theory';
  let badgeText  = cls.type === 'practical' ? 'ব্যবহারিক' : 'তত্ত্ব';
  if (isActive) { badgeClass = 'badge-active'; badgeText = '● চলছে'; }
  if (isDone)   { badgeClass = 'badge-done';   badgeText = '✓ শেষ'; }

  const cardClass = isActive ? 'class-card active-class' : isDone ? 'class-card done-class' : 'class-card';
  const practicalClass = cls.type === 'practical' ? ' practical-class' : '';

  let progressHTML = '';
  if (isActive && showProgressBar) {
    const pct = Math.round(((currentMinutes - start) / (end - start)) * 100);
    progressHTML = `<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>`;
  }

  return `
    <div class="${cardClass}${practicalClass}" data-start="${start}" data-end="${end}">
      <div class="subject-icon" style="background:${cls.color}22; border:1px solid ${cls.color}33;">${cls.icon}</div>
      <div class="flex-1 min-w-0">
        <div class="class-time">${cls.startTime} – ${cls.endTime}</div>
        <div class="class-subject">${cls.subject}</div>
        <div class="class-meta">Room ${cls.room}</div>
        ${progressHTML}
      </div>
      <span class="class-badge ${badgeClass}">${badgeText}</span>
    </div>
  `;
}

function renderToday() {
  const now = new Date();
  const dayIndex = now.getDay();
  const dayData = ROUTINE[dayIndex];
  const container = document.getElementById('today-classes');
  const empty = document.getElementById('today-empty');
  const badge = document.getElementById('today-day-badge');

  if (!dayData) {
    badge.textContent = DAY_NAMES_BN[dayIndex] + ' – ছুটি';
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  badge.textContent = dayData.name;
  empty.classList.add('hidden');
  container.innerHTML = dayData.classes.map((cls, i) => {
    const div = document.createElement('div');
    div.style.animationDelay = `${i * 0.07}s`;
    return `<div style="animation-delay:${i*70}ms">${buildClassCard(cls, true)}</div>`;
  }).join('');
}

function renderTomorrow() {
  const now = new Date();
  let nextDay = (now.getDay() + 1) % 7;
  // Skip weekends
  let tries = 0;
  while (nextDay >= 4 && tries < 7) { nextDay = (nextDay + 1) % 7; tries++; }
  const dayData = ROUTINE[nextDay];

  const container = document.getElementById('tomorrow-classes');
  const empty = document.getElementById('tomorrow-empty');
  const badge = document.getElementById('tomorrow-day-badge');

  const rawNext = (now.getDay() + 1) % 7;
  if (rawNext >= 4 || !dayData) {
    badge.textContent = DAY_NAMES_BN[rawNext] + ' – ছুটি';
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  badge.textContent = dayData.name;
  empty.classList.add('hidden');
  container.innerHTML = dayData.classes.map((cls, i) =>
    `<div style="animation-delay:${i*70}ms">${buildClassCard(cls)}</div>`
  ).join('');
}

function renderWeekly() {
  const now = new Date();
  const todayIndex = now.getDay();
  const container = document.getElementById('weekly-grid');

  let html = '';
  for (let d = 0; d <= 3; d++) {
    const dayData = ROUTINE[d];
    const isToday = d === todayIndex;

    html += `
      <div class="weekly-day-card" style="animation-delay:${d*80}ms">
        <div class="weekly-day-header ${isToday ? 'today-header' : ''}">
          <span class="font-orbitron text-sm font-bold ${isToday ? 'text-cyan-400' : 'text-slate-300'}">${dayData.name}</span>
          ${isToday ? '<span class="pill-cyan text-xs">আজ</span>' : ''}
          <span class="text-xs text-slate-500 font-mono">${dayData.classes.length} ক্লাস</span>
        </div>
        <div>
          ${dayData.classes.map(cls => `
            <div class="weekly-class-row">
              <span style="font-size:16px; margin-right:10px;">${cls.icon}</span>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-200 font-bengali truncate">${cls.subject}</div>
                <div class="text-xs text-slate-500 font-mono">${cls.startTime} – ${cls.endTime}</div>
              </div>
              <span class="class-badge ${cls.type === 'practical' ? 'badge-practical' : 'badge-theory'} ml-2">
                ${cls.type === 'practical' ? 'ব্যব' : 'তত্ত্ব'}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

// ============================================================
// ASSIGNMENT ENGINE
// ============================================================
function loadAssignments() {
  try {
    return JSON.parse(localStorage.getItem('agri_assignments_v2') || '[]');
  } catch { return []; }
}

function saveAssignmentsToStorage() {
  localStorage.setItem('agri_assignments_v2', JSON.stringify(assignments));
}

function renderAssignments() {
  const container = document.getElementById('assignment-list');
  const empty = document.getElementById('assignment-empty');

  if (!assignments.length) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  const now = new Date(); now.setHours(0,0,0,0);
  const sorted = [...assignments].sort((a, b) => new Date(a.due) - new Date(b.due));

  container.innerHTML = sorted.map((asgn, i) => {
    const due = new Date(asgn.due);
    const diffMs = due - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isUrgent = diffDays <= 2 && diffDays >= 0;
    const isOverdue = diffDays < 0;

    let dueText = '';
    let dueClass = 'text-slate-400';
    if (isOverdue) { dueText = `${Math.abs(diffDays)} দিন আগে ছিল`; dueClass = 'text-red-400'; }
    else if (diffDays === 0) { dueText = 'আজকেই জমা!'; dueClass = 'text-red-400 font-bold'; }
    else if (diffDays === 1) { dueText = 'আগামীকাল জমা'; dueClass = 'text-orange-400 font-bold'; }
    else { dueText = `${diffDays} দিন বাকি`; dueClass = 'text-green-400'; }

    return `
      <div class="asgn-card ${isUrgent || isOverdue ? 'urgent' : ''}" style="animation-delay:${i*60}ms">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-semibold text-slate-200 font-bengali">${asgn.title}</span>
            ${isUrgent ? '<span class="pill-red">⚠ জরুরি</span>' : ''}
            ${isOverdue ? '<span class="pill-red">মেয়াদ শেষ</span>' : ''}
          </div>
          <div class="text-xs text-slate-500 font-bengali mt-1">${asgn.subject}</div>
          <div class="text-xs mt-1 font-bengali ${dueClass}">📅 ${formatDate(asgn.due)} · ${dueText}</div>
        </div>
        <button class="btn-delete" onclick="deleteAssignment('${asgn.id}')">🗑</button>
      </div>
    `;
  }).join('');
}

function openAddAssignment() {
  // Set default due date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('asgn-due').value = tomorrow.toISOString().split('T')[0];
  document.getElementById('asgn-title').value = '';
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function saveAssignment() {
  const subject = document.getElementById('asgn-subject').value;
  const title   = document.getElementById('asgn-title').value.trim();
  const due     = document.getElementById('asgn-due').value;

  if (!title) { document.getElementById('asgn-title').focus(); return; }
  if (!due)   { document.getElementById('asgn-due').focus(); return; }

  assignments.push({
    id: Date.now().toString(),
    subject, title, due,
    createdAt: new Date().toISOString()
  });
  saveAssignmentsToStorage();
  renderAssignments();
  closeModal();
}

function deleteAssignment(id) {
  assignments = assignments.filter(a => a.id !== id);
  saveAssignmentsToStorage();
  renderAssignments();
}

// ============================================================
// GPA CALCULATOR
// ============================================================
function addGpaRow() {
  const container = document.getElementById('gpa-rows');
  const row = document.createElement('div');
  row.className = 'gpa-row flex gap-3';
  row.innerHTML = `
    <input type="text" placeholder="বিষয়ের নাম" class="gpa-input flex-1 font-bengali" />
    <input type="number" placeholder="ক্রেডিট" min="1" max="4" class="gpa-input w-20 font-mono" />
    <select class="gpa-input w-24 font-mono">
      <option value="4.0">A+ (4.0)</option>
      <option value="3.75">A (3.75)</option>
      <option value="3.5">A- (3.5)</option>
      <option value="3.25">B+ (3.25)</option>
      <option value="3.0">B (3.0)</option>
      <option value="2.75">B- (2.75)</option>
      <option value="2.5">C+ (2.5)</option>
      <option value="2.25">C (2.25)</option>
      <option value="2.0">D (2.0)</option>
      <option value="0">F (0.0)</option>
    </select>
    <button onclick="this.closest('.gpa-row').remove(); calcGPA();" class="text-red-400 hover:text-red-300 text-lg px-2">×</button>
  `;
  container.appendChild(row);
}

function calcGPA() {
  const rows = document.querySelectorAll('.gpa-row');
  let totalPoints = 0, totalCredits = 0;

  r
