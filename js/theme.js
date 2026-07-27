/* ============================================================
   theme.js — Dark/Light mode + Settings persistence
   ============================================================ */

function applyStoredTheme(){
  const theme = localStorage.getItem("icu_theme") || "light";
  document.body.classList.toggle("dark", theme === "dark");
  syncThemeKnob(theme === "dark");
}

function toggleTheme(){
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("icu_theme", isDark ? "dark" : "light");
  syncThemeKnob(isDark);
}

function syncThemeKnob(isDark){
  document.querySelectorAll(".theme-toggle .knob i").forEach(i=>{
    i.className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
  });
  const themeSelect = document.querySelector("#settingTheme");
  if(themeSelect) themeSelect.value = isDark ? "dark" : "light";
}

// ---------- Settings (Notifications / Sound / Language) ----------
const DEFAULT_SETTINGS = { notifications:true, sound:true, language:"English" };

function getSettings(){
  try{ return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem("icu_settings") || "{}") }; }
  catch(e){ return { ...DEFAULT_SETTINGS }; }
}
function saveSettings(settings){
  localStorage.setItem("icu_settings", JSON.stringify(settings));
}
