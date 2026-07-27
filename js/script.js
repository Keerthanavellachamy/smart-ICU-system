/* ============================================================
   script.js — Shared data + utilities used across all pages
   ============================================================ */

// ---------- Mock Patient Data ----------
const PATIENTS = [
  { id:1, name:"Ananya Sharma", age:58, gender:"Female", room:"ICU-101", doctor:"Dr. Rohan Mehta",
    photo:"images/patients/p1.svg", bloodGroup:"O+", diagnosis:"Post-cardiac surgery recovery",
    admitted:"2026-07-18", nextCheckup:"2026-07-28 10:00 AM", medicines:"Atorvastatin, Metoprolol, Aspirin",
    status:"stable", hr:78, spo2:97, temp:36.8, bpS:118, bpD:76, resp:16 },
  { id:2, name:"Vikram Iyer", age:64, gender:"Male", room:"ICU-102", doctor:"Dr. Priya Nair",
    photo:"images/patients/p2.svg", bloodGroup:"B+", diagnosis:"Acute respiratory distress",
    admitted:"2026-07-20", nextCheckup:"2026-07-27 04:00 PM", medicines:"Salbutamol, Dexamethasone",
    status:"critical", hr:128, spo2:88, temp:39.4, bpS:150, bpD:96, resp:26 },
  { id:3, name:"Meera Nair", age:45, gender:"Female", room:"ICU-103", doctor:"Dr. Arjun Rao",
    photo:"images/patients/p3.svg", bloodGroup:"A-", diagnosis:"Sepsis, under observation",
    admitted:"2026-07-22", nextCheckup:"2026-07-27 07:00 PM", medicines:"Piperacillin, IV Fluids",
    status:"observation", hr:104, spo2:93, temp:38.2, bpS:132, bpD:88, resp:21 },
  { id:4, name:"Rahul Verma", age:36, gender:"Male", room:"ICU-104", doctor:"Dr. Rohan Mehta",
    photo:"images/patients/p4.svg", bloodGroup:"AB+", diagnosis:"Traumatic brain injury, stable",
    admitted:"2026-07-15", nextCheckup:"2026-07-29 11:00 AM", medicines:"Mannitol, Levetiracetam",
    status:"stable", hr:72, spo2:98, temp:36.6, bpS:114, bpD:74, resp:15 },
  { id:5, name:"Kavita Desai", age:71, gender:"Female", room:"ICU-105", doctor:"Dr. Priya Nair",
    photo:"images/patients/p5.svg", bloodGroup:"O-", diagnosis:"Congestive heart failure",
    admitted:"2026-07-21", nextCheckup:"2026-07-27 09:00 PM", medicines:"Furosemide, Digoxin",
    status:"observation", hr:110, spo2:92, temp:37.6, bpS:145, bpD:92, resp:22 },
  { id:6, name:"Suresh Pillai", age:52, gender:"Male", room:"ICU-106", doctor:"Dr. Arjun Rao",
    photo:"images/patients/p6.svg", bloodGroup:"B-", diagnosis:"Multi-organ failure, critical",
    admitted:"2026-07-23", nextCheckup:"2026-07-27 06:00 PM", medicines:"Norepinephrine, Vasopressin",
    status:"critical", hr:136, spo2:86, temp:39.7, bpS:88, bpD:56, resp:29 },
];

const DOCTOR = {
  name:"Dr. Rohan Mehta", specialization:"Critical Care & Pulmonology",
  photo:"images/doctors/doc1.svg", patients:24, availableToday:6, completed:182, upcoming:5
};

const SCHEDULE = [
  { time:"08:00 AM", title:"Patient Checkup", icon:"fa-stethoscope" },
  { time:"09:30 AM", title:"ECG Review", icon:"fa-heart-pulse" },
  { time:"11:00 AM", title:"ICU Meeting", icon:"fa-users" },
  { time:"01:00 PM", title:"Medicine Review", icon:"fa-pills" },
  { time:"03:00 PM", title:"Surgery Follow-up", icon:"fa-user-doctor" },
];

const NOTIFICATIONS = [
  { icon:"fa-triangle-exclamation", color:"red", title:"Patient Critical", desc:"Vikram Iyer — SpO₂ dropped below 90%", time:"2 min ago" },
  { icon:"fa-pills", color:"yellow", title:"Medicine Time", desc:"Meera Nair — Piperacillin due now", time:"12 min ago" },
  { icon:"fa-calendar-check", color:"blue", title:"Doctor Appointment", desc:"Follow-up with Dr. Priya Nair at 4:00 PM", time:"30 min ago" },
  { icon:"fa-bed-pulse", color:"green", title:"ICU Bed Available", desc:"Bed ICU-108 is now free", time:"1 hr ago" },
];

// Theme functions (applyStoredTheme / toggleTheme) live in theme.js

// ---------- Toast ----------
function showToast(msg, icon="fa-circle-check"){
  let toast = document.querySelector(".toast");
  if(!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${msg}</span>`;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> toast.classList.remove("show"), 2800);
}

// ---------- Sidebar toggle (mobile + collapse) ----------
function initSidebar(){
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.querySelector(".sidebar-toggle-btn");
  const overlay = document.querySelector(".sidebar-overlay");
  if(!sidebar || !toggleBtn) return;
  toggleBtn.addEventListener("click", ()=>{
    if(window.innerWidth <= 992){
      sidebar.classList.toggle("mobile-open");
      overlay && overlay.classList.toggle("show");
    } else {
      sidebar.classList.toggle("collapsed");
    }
  });
  overlay && overlay.addEventListener("click", ()=>{
    sidebar.classList.remove("mobile-open");
    overlay.classList.remove("show");
  });
}

// ---------- Notification dropdown ----------
function initNotifications(){
  const bell = document.querySelector("#notifBell");
  const panel = document.querySelector("#notifPanel");
  if(!bell || !panel) return;
  const colorMap = {
    red:{bg:"var(--red-bg)", fg:"var(--red)"},
    yellow:{bg:"var(--yellow-bg)", fg:"#a9720a"},
    green:{bg:"var(--green-bg)", fg:"var(--green)"},
    blue:{bg:"rgba(43,111,242,0.14)", fg:"var(--blue-600)"}
  };
  panel.innerHTML = `<h4>Notifications</h4>` + NOTIFICATIONS.map(n=>{
    const c = colorMap[n.color] || colorMap.blue;
    return `
    <div class="notif-item">
      <i class="fa-solid ${n.icon}" style="background:${c.bg}; color:${c.fg};"></i>
      <div class="txt"><b>${n.title}</b><span>${n.desc}</span><br><span>${n.time}</span></div>
    </div>`;
  }).join("");
  bell.addEventListener("click", (e)=>{
    e.stopPropagation();
    panel.classList.toggle("open");
  });
  document.addEventListener("click", (e)=>{
    if(!panel.contains(e.target) && e.target !== bell) panel.classList.remove("open");
  });
}

// ---------- Animated counters ----------
function animateCounter(el, target, duration=1200){
  const start = 0;
  const startTime = performance.now();
  function tick(now){
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if(progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

// ---------- Search redirect (header search on any page) ----------
function initHeaderSearch(){
  const input = document.querySelector("#globalSearch");
  if(!input) return;
  input.addEventListener("keydown", (e)=>{
    if(e.key === "Enter" && input.value.trim()){
      window.location.href = `dashboard.html?search=${encodeURIComponent(input.value.trim())}`;
    }
  });
}

// ---------- Login page logic ----------
function initLoginForm(){
  const form = document.querySelector("#loginForm");
  if(!form) return;
  const roleButtons = document.querySelectorAll(".role-toggle button");
  let role = "doctor";
  roleButtons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      roleButtons.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      role = btn.dataset.role;
    });
  });

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = form.querySelector("#loginEmail").value.trim();
    const password = form.querySelector("#loginPassword").value.trim();
    const errorEl = form.querySelector(".error-msg");
    const card = document.querySelector(".login-form");

    if(!email || !password){
      errorEl.textContent = "Please enter both email and password.";
      card.classList.add("shake");
      setTimeout(()=>card.classList.remove("shake"), 500);
      return;
    }
    if(!/^\S+@\S+\.\S+$/.test(email)){
      errorEl.textContent = "Please enter a valid email address.";
      card.classList.add("shake");
      setTimeout(()=>card.classList.remove("shake"), 500);
      return;
    }
    if(password.length < 4){
      errorEl.textContent = "Password must be at least 4 characters.";
      card.classList.add("shake");
      setTimeout(()=>card.classList.remove("shake"), 500);
      return;
    }

    errorEl.textContent = "";
    localStorage.setItem("icu_user", JSON.stringify({ email, role }));
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Signing in...`;
    submitBtn.disabled = true;
    setTimeout(()=>{ window.location.href = "dashboard.html"; }, 700);
  });
}

// ---------- Boot shared UI on every page ----------
document.addEventListener("DOMContentLoaded", ()=>{
  applyStoredTheme();
  initSidebar();
  initNotifications();
  initHeaderSearch();
  initLoginForm();
  document.querySelectorAll(".theme-toggle").forEach(btn=>{
    btn.addEventListener("click", toggleTheme);
  });
  // Highlight active nav link based on current file
  const current = location.pathname.split("/").pop() || "dashboard.html";
  document.querySelectorAll(".nav-list a").forEach(a=>{
    if(a.getAttribute("href") === current) a.classList.add("active");
  });
});
