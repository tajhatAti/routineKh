/* =========================================================
   Admin Panel — Assignment Manager
   ⚠️ Static client-side gate. Not real security — anyone can
   read the password by viewing source. It only stops casual
   visitors. Real protection requires a backend.
   ========================================================= */

// 🔑 Change this to your own password
const ADMIN_PASSWORD = "tajhat2026";

// Local working copy (browser only, until you export JSON)
const STORAGE_KEY = "sasp.admin.assignments.v1";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

let assignments = [];

/* -------- Auth gate (sessionStorage so refresh keeps you in) -------- */
function isLoggedIn() {
  return sessionStorage.getItem("sasp.admin.auth") === "1";
}
function showPanel() {
  $("#loginCard").hidden = true;
  $("#adminPanel").hidden = false;
  init();
}
$("#loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if ($("#pwInput").value === ADMIN_PASSWORD) {
    sessionStorage.setItem("sasp.admin.auth", "1");
    showPanel();
  } else {
    $("#pwError").style.display = "block";
  }
});
if (isLoggedIn()) showPanel();

/* -------- Load assignments: prefer local edits, fall back to file -------- */
async function loadAssignments() {
  // 1) Local edits (newest)
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try { assignments = JSON.parse(local); render(); return; } catch {}
  }
  // 2) Live JSON file
  try {
    const res = await fetch(`assignments.json?t=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      assignments = Array.isArray(data) ? data : (data.assignments || []);
    }
  } catch {}
  render();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  render();
}

function uid() {
  return "a" + Math.random().toString(36).slice(2, 9);
}

function hoursLeft(due) { return (new Date(due).getTime() - Date.now()) / 36e5; }
function daysLeft(due)  { return Math.ceil(hoursLeft(due) / 24); }

function render() {
  const sorted = [...assignments].sort((a, b) => {
    if (!!a.done !== !!b.done) return a.done ? 1 : -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  $("#count").textContent = sorted.length;

  const list = $("#adminList");
  if (!sorted.length) {
    list.innerHTML = `<li class="empty-day bn">এখনো কোনো অ্যাসাইনমেন্ট নেই</li>`;
  } else {
    list.innerHTML = sorted.map(a => {
      const h = hoursLeft(a.dueDate);
      const urgent = !a.done && h <= 48 && h > 0;
      const dl = daysLeft(a.dueDate);
      const dueText = a.done ? "সম্পন্ন" : (h <= 0 ? "মেয়াদোত্তীর্ণ" : (dl <= 1 ? `${Math.max(0, Math.round(h))} ঘণ্টা` : `${dl} দিন`));
      return `<li class="assign-item ${a.done ? "done" : ""} ${urgent ? "urgent" : ""}" data-id="${a.id}">
        <button class="assign-check" data-action="toggle" title="সম্পন্ন">${a.done ? "✓" : ""}</button>
        <div>
          <div class="assign-title bn">${a.title}</div>
          <div class="assign-sub bn">${a.subject} · 📅 ${new Date(a.dueDate).toLocaleDateString("bn-BD")}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
          <span class="assign-due bn">${dueText}</span>
          <button class="assign-del" data-action="del" title="মুছুন">✕</button>
        </div>
      </li>`;
    }).join("");
  }

  // Update JSON export
  const exportData = { assignments: assignments.map(a => ({
    id: a.id, title: a.title, subject: a.subject, dueDate: a.dueDate, done: !!a.done
  }))};
  $("#jsonOutput").value = JSON.stringify(exportData, null, 2);
}

/* -------- Init events -------- */
function init() {
  loadAssignments();

  $("#adminList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]"); if (!btn) return;
    const id = btn.closest(".assign-item").dataset.id;
    if (btn.dataset.action === "toggle") {
      assignments = assignments.map(a => a.id === id ? { ...a, done: !a.done } : a);
    } else if (btn.dataset.action === "del") {
      if (!confirm("এই অ্যাসাইনমেন্টটি মুছে ফেলবেন?")) return;
      assignments = assignments.filter(a => a.id !== id);
    }
    save();
  });

  $("#addForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("#aTitle").value.trim();
    const subject = $("#aSubject").value.trim();
    const due = $("#aDue").value;
    if (!title || !subject || !due) return;
    const dueIso = new Date(`${due}T23:59:00`).toISOString();
    assignments = [{ id: uid(), title, subject, dueDate: dueIso, done: false }, ...assignments];
    save();
    e.target.reset();
  });

  $("#resetForm").addEventListener("click", () => $("#addForm").reset());
  $("#loadBtn").addEventListener("click", () => {
    if (confirm("লোকাল পরিবর্তন বাতিল করে assignments.json থেকে রিলোড করবেন?")) {
      localStorage.removeItem(STORAGE_KEY);
      loadAssignments();
    }
  });

  $("#copyBtn").addEventListener("click", async () => {
    const text = $("#jsonOutput").value;
    try {
      await navigator.clipboard.writeText(text);
      $("#copyStatus").style.display = "block";
      setTimeout(() => { $("#copyStatus").style.display = "none"; }, 2500);
    } catch {
      $("#jsonOutput").select();
      document.execCommand("copy");
      $("#copyStatus").style.display = "block";
      setTimeout(() => { $("#copyStatus").style.display = "none"; }, 2500);
    }
  });
      }
      
