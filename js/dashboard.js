/* ============================================================
   dashboard.js — Dashboard page rendering + live monitoring
   ============================================================ */

let livePatients = JSON.parse(JSON.stringify(PATIENTS)); // deep clone, mutated every 3s
let currentFilter = "all";
let currentSort = "room";
let currentSearch = "";

function computeStatus(v){
  if(v.hr>120 || v.hr<50 || v.spo2<90 || v.temp>39) return "critical";
  if(v.hr>100 || v.spo2<94 || v.temp>37.8) return "observation";
  return "stable";
}

function vitalDanger(key, val){
  if(key==="hr") return val>120 || val<50;
  if(key==="spo2") return val<90;
  if(key==="temp") return val>39;
  return false;
}

function renderStats(){
  const total = livePatients.length;
  const critical = livePatients.filter(p=>p.status==="critical").length;
  const stable = livePatients.filter(p=>p.status==="stable").length;
  const beds = 12 - total;

  const map = { total, critical, stable, beds };
  document.querySelectorAll("[data-stat]").forEach(el=>{
    animateCounter(el, map[el.dataset.stat]);
  });
}

function patientCardHTML(p){
  const dangerHR = vitalDanger("hr", p.hr);
  const dangerSpo2 = vitalDanger("spo2", p.spo2);
  const dangerTemp = vitalDanger("temp", p.temp);
  const isCritical = p.status === "critical";

  return `
  <div class="patient-card glass fade-up status-${p.status} ${isCritical ? "critical-alert" : ""}" data-id="${p.id}">
    <div class="patient-top">
      <img src="${p.photo}" alt="${p.name}">
      <div class="meta">
        <b>${p.name}</b>
        <span>${p.age} yrs · Room ${p.room}</span>
        <span>${p.doctor}</span>
      </div>
      <span class="status-badge ${p.status}">${p.status}</span>
    </div>
    <div class="vitals-grid">
      <div class="vital-box ${dangerHR ? "danger" : ""}"><i class="fa-solid fa-heart-pulse hr"></i><div class="vv"><b>${p.hr} bpm</b><span>Heart Rate</span></div></div>
      <div class="vital-box ${dangerSpo2 ? "danger" : ""}"><i class="fa-solid fa-lungs spo2"></i><div class="vv"><b>${p.spo2}%</b><span>SpO₂</span></div></div>
      <div class="vital-box ${dangerTemp ? "danger" : ""}"><i class="fa-solid fa-temperature-half temp"></i><div class="vv"><b>${p.temp.toFixed(1)}°C</b><span>Temperature</span></div></div>
      <div class="vital-box"><i class="fa-solid fa-droplet bp"></i><div class="vv"><b>${p.bpS}/${p.bpD}</b><span>Blood Pressure</span></div></div>
      <div class="vital-box" style="grid-column:span 2;"><i class="fa-solid fa-wind resp"></i><div class="vv"><b>${p.resp} rpm</b><span>Respiration Rate</span></div></div>
    </div>
    <div class="patient-actions">
      <button class="btn btn-outline btn-sm" onclick="openDetails(${p.id})"><i class="fa-solid fa-notes-medical"></i> Details</button>
      <button class="btn btn-outline btn-sm" onclick="location.href='history.html?id=${p.id}'"><i class="fa-solid fa-chart-line"></i> History</button>
      <button class="btn btn-danger btn-sm" onclick="openEmergencyModal(livePatients.find(x=>x.id===${p.id}))"><i class="fa-solid fa-triangle-exclamation"></i> Emergency</button>
    </div>
  </div>`;
}

function renderPatients(){
  const grid = document.querySelector("#patientsGrid");
  if(!grid) return;

  let list = livePatients.filter(p=>{
    const matchesFilter = currentFilter === "all" || p.status === currentFilter;
    const matchesSearch = p.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
                           p.room.toLowerCase().includes(currentSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if(currentSort === "room"){
    list = list.slice().sort((a,b)=> a.room.localeCompare(b.room));
  } else if(currentSort === "status"){
    const order = { critical:0, observation:1, stable:2 };
    list = list.slice().sort((a,b)=> order[a.status]-order[b.status]);
  } else if(currentSort === "name"){
    list = list.slice().sort((a,b)=> a.name.localeCompare(b.name));
  }

  grid.innerHTML = list.length
    ? list.map(patientCardHTML).join("")
    : `<div class="glass" style="padding:40px; text-align:center; grid-column:1/-1;"><i class="fa-solid fa-magnifying-glass" style="font-size:22px;color:var(--text-muted);"></i><p style="margin-top:10px;color:var(--text-muted);">No patients match your search.</p></div>`;
}

// ---------- Patient details modal ----------
function openDetails(id){
  const p = livePatients.find(x=>x.id===id);
  if(!p) return;
  const modal = document.querySelector("#detailsModal");
  modal.querySelector(".detail-header img").src = p.photo;
  modal.querySelector(".detail-header b").textContent = p.name;
  modal.querySelector(".detail-header span").textContent = `${p.gender}, ${p.age} yrs · Room ${p.room}`;
  const grid = modal.querySelector(".detail-grid");
  grid.innerHTML = `
    <div class="detail-item"><span>Blood Group</span><b>${p.bloodGroup}</b></div>
    <div class="detail-item"><span>Diagnosis</span><b>${p.diagnosis}</b></div>
    <div class="detail-item"><span>Admission Date</span><b>${p.admitted}</b></div>
    <div class="detail-item"><span>Doctor</span><b>${p.doctor}</b></div>
    <div class="detail-item"><span>Medicines</span><b>${p.medicines}</b></div>
    <div class="detail-item"><span>Next Checkup</span><b>${p.nextCheckup}</b></div>
    <div class="detail-item" style="grid-column:span 2;"><span>Current Status</span><b class="status-badge ${p.status}" style="display:inline-flex;margin-top:4px;">${p.status}</b></div>
  `;
  modal.classList.add("open");
}

// ---------- Live vitals simulation ----------
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

function tickLiveVitals(){
  livePatients = livePatients.map(p=>{
    // Small random walk; occasionally larger swing to demonstrate emergency detection
    const bigSwing = Math.random() < 0.08;
    const swing = bigSwing ? 18 : 4;
    const hr = clamp(Math.round(p.hr + (Math.random()-0.5)*swing), 42, 145);
    const spo2 = clamp(Math.round(p.spo2 + (Math.random()-0.5)*(bigSwing?6:1.5)), 82, 100);
    const temp = clamp(+(p.temp + (Math.random()-0.5)*(bigSwing?0.8:0.15)).toFixed(1), 35.5, 40.2);
    const bpS = clamp(Math.round(p.bpS + (Math.random()-0.5)*6), 80, 170);
    const bpD = clamp(Math.round(p.bpD + (Math.random()-0.5)*4), 50, 105);
    const resp = clamp(Math.round(p.resp + (Math.random()-0.5)*3), 10, 34);
    const updated = { ...p, hr, spo2, temp, bpS, bpD, resp };
    updated.status = computeStatus(updated);
    return updated;
  });

  renderPatients();
  renderStats();

  // Emergency detection on the most critical patient currently
  const emergencyPatient = livePatients.find(p=> typeof isEmergency === "function" && isEmergency(p));
  if(emergencyPatient) maybeTriggerEmergency(emergencyPatient);
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", ()=>{
  if(!document.querySelector("#patientsGrid")) return; // not on dashboard

  // Read ?search= param from header search redirect
  const params = new URLSearchParams(location.search);
  if(params.get("search")){
    currentSearch = params.get("search");
    const searchInput = document.querySelector("#globalSearch");
    if(searchInput) searchInput.value = currentSearch;
  }

  renderStats();
  renderPatients();

  document.querySelectorAll(".chip-group .chip[data-filter]").forEach(chip=>{
    chip.addEventListener("click", ()=>{
      document.querySelectorAll(".chip-group .chip[data-filter]").forEach(c=>c.classList.remove("active"));
      chip.classList.add("active");
      currentFilter = chip.dataset.filter;
      renderPatients();
    });
  });

  const sortSelect = document.querySelector("#sortSelect");
  sortSelect && sortSelect.addEventListener("change", ()=>{
    currentSort = sortSelect.value;
    renderPatients();
  });

  const dashSearch = document.querySelector("#dashSearch");
  dashSearch && dashSearch.addEventListener("input", ()=>{
    currentSearch = dashSearch.value;
    renderPatients();
  });

  const detailsClose = document.querySelector("#detailsModal .modal-close");
  detailsClose && detailsClose.addEventListener("click", ()=> document.querySelector("#detailsModal").classList.remove("open"));
  document.querySelector("#detailsModal").addEventListener("click", (e)=>{
    if(e.target.id === "detailsModal") e.target.classList.remove("open");
  });

  setInterval(tickLiveVitals, 3000);
});
