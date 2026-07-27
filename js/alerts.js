/* ============================================================
   alerts.js — Emergency threshold detection + popup
   ============================================================ */

const VITAL_THRESHOLDS = {
  hrHigh: 120, hrLow: 50, spo2Low: 90, tempHigh: 39
};

function isEmergency(v){
  return v.hr > VITAL_THRESHOLDS.hrHigh ||
         v.hr < VITAL_THRESHOLDS.hrLow ||
         v.spo2 < VITAL_THRESHOLDS.spo2Low ||
         v.temp > VITAL_THRESHOLDS.tempHigh;
}

let lastAlertedPatientId = null;
let alertCooldown = false;

function maybeTriggerEmergency(patient){
  if(!isEmergency(patient)) return;
  const settings = (typeof getSettings === "function") ? getSettings() : { notifications:true, sound:true };
  if(!settings.notifications) return;
  if(alertCooldown) return; // avoid stacking popups every 3s
  alertCooldown = true;
  lastAlertedPatientId = patient.id;
  openEmergencyModal(patient);
  if(settings.sound) playSirenBeep();
  setTimeout(()=> alertCooldown = false, 15000); // one popup per 15s max
}

function openEmergencyModal(patient){
  const modal = document.querySelector("#emergencyModal");
  if(!modal) return;
  modal.querySelector(".emergency-patient").textContent = `${patient.name} — Room ${patient.room}`;
  modal.querySelector(".emergency-detail").textContent =
    `HR ${patient.hr} bpm · SpO₂ ${patient.spo2}% · Temp ${patient.temp.toFixed(1)}°C`;
  modal.classList.add("open");
}

function closeEmergencyModal(){
  const modal = document.querySelector("#emergencyModal");
  modal && modal.classList.remove("open");
}

// Simple beep using Web Audio API (no external file needed)
function playSirenBeep(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.6);
  }catch(e){ /* audio not available */ }
}

document.addEventListener("DOMContentLoaded", ()=>{
  const closeBtn = document.querySelector("#emergencyModal .modal-close");
  closeBtn && closeBtn.addEventListener("click", closeEmergencyModal);
  const overlay = document.querySelector("#emergencyModal");
  overlay && overlay.addEventListener("click", (e)=>{ if(e.target === overlay) closeEmergencyModal(); });
});
