# 🏥 Smart ICU Monitoring Dashboard

A responsive, front-end-only ICU patient monitoring system built with **plain HTML, CSS, and JavaScript** — no frameworks, no build step. Features a modern glassmorphism blue/white medical theme, live-updating vitals, emergency detection, animated charts, and full dark/light mode.

---

## 🚀 Getting Started

No installation or server required.

1. Unzip the project.
2. Open **`index.html`** directly in your browser (double-click it), or serve the folder with any static server:
   ```bash
   cd Smart-ICU
   python3 -m http.server 8000
   # then visit http://localhost:8000
   ```
3. **Login:** enter any email address and a password of 4+ characters — this is a front-end demo, so there's no real backend authentication.

> Requires an internet connection on first load to fetch Google Fonts (Poppins) and Font Awesome from their CDNs. Everything else runs fully offline/local.

---

## 📁 Folder Structure

```
Smart-ICU/
│
├── index.html          # Login page
├── dashboard.html       # Main dashboard (stats, patients, schedule)
├── patient.html         # Full patient list / details page
├── history.html         # Vital trend charts (HR / SpO2 / Temp)
├── doctor.html           # Doctor profile & assigned patients
├── settings.html         # Theme, notifications, sound, language
│
├── css/
│   ├── style.css         # Variables, resets, buttons, login page
│   ├── dashboard.css     # App layout, sidebar, cards, modals, charts
│   └── responsive.css    # Breakpoints for tablet/mobile
│
├── js/
│   ├── script.js         # Shared data (patients/doctor/schedule), login logic, sidebar, notifications, toasts
│   ├── dashboard.js      # Patient rendering, search/filter/sort, live vitals simulation
│   ├── charts.js         # Canvas-based animated trend charts
│   ├── alerts.js         # Emergency threshold detection + siren/popup
│   └── theme.js          # Dark/Light mode + settings persistence
│
├── images/
│   ├── patients/         # Patient avatar SVGs (p1–p6)
│   ├── doctors/          # Doctor avatar SVGs
│   └── logo.svg           # Hospital logo
│
└── README.md
```

---

## ✨ Features

### Login Page
- Role toggle (Doctor / Nurse / Admin)
- Email + password validation with shake animation on error
- Demo mode — any valid-looking email + 4+ char password logs in

### Dashboard
- Header with search, notification bell (with badge count), profile, and dark/light toggle
- 4 animated stat cards: Total Patients, Critical Patients, Stable Patients, Available ICU Beds
- 6 live patient cards with photo, vitals, status badge, and action buttons
- Today's schedule timeline

### Live Monitoring & Emergency Alerts
- Heart Rate, SpO₂, Temperature, Blood Pressure, and Respiration Rate auto-update every **3 seconds** within realistic random ranges
- Automatic emergency detection when:
  - Heart Rate > 120 or < 50 bpm
  - SpO₂ < 90%
  - Temperature > 39°C
- Triggers: flashing red card, blinking border, siren icon animation, popup modal with an audible tone (Web Audio API — no sound file needed)

### Patient Details Modal
Shows full profile: name, age, gender, blood group, diagnosis, admission date, doctor, medicines, next checkup, and current status.

### Patient History
- Canvas-based animated line charts for Heart Rate, SpO₂, and Temperature
- Range tabs: Today / Yesterday / Last 7 Days / Last Month

### Doctor Profile
- Doctor info, specialization, and stat cards (patients assigned, available today, completed cases, upcoming appointments)
- Assigned patients list and quick actions (Schedule, Messages, Emergency Calls)

### Settings
- Theme switch (synced with the header toggle)
- Enable/disable notifications and alert sound
- Language dropdown
- All settings and theme choice persist via `localStorage`

### Other JS Capabilities
- Live patient search (header + dashboard)
- Filter patients by status (All / Stable / Observation / Critical)
- Sort patients by room number, status, or name
- Animated counters on stat cards
- Collapsible sidebar (desktop) and slide-in sidebar (mobile)
- Toast notifications for confirmations (e.g., saving settings)

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary Blue | `#2b6ff2` |
| Sky Accent | `#5fb4ff` |
| Deep Navy | `#0b2447` |
| Stable / Green | `#17b978` |
| Observation / Yellow | `#f2a93b` |
| Critical / Red | `#ff4d5e` |
| Font | Poppins (Google Fonts) |
| Card radius | 20px |
| Effect | Glassmorphism (`backdrop-filter: blur`) |

---

## ⚙️ Customization

- **Add/edit patients:** update the `PATIENTS` array in `js/script.js`.
- **Change doctor info:** update the `DOCTOR` object in `js/script.js`.
- **Adjust emergency thresholds:** edit `VITAL_THRESHOLDS` in `js/alerts.js`.
- **Change update frequency:** edit the `setInterval(tickLiveVitals, 3000)` call in `js/dashboard.js`.
- **Swap avatars:** replace the SVGs in `images/patients/` and `images/doctors/` with real photos (keep the same filenames, or update the `photo` paths in `PATIENTS`/`DOCTOR`).

---

## 🌐 Browser Support

Tested on latest Chrome, Edge, Firefox, and Safari. Uses standard Web APIs (Canvas 2D, Web Audio, `localStorage`, CSS `backdrop-filter`) — no polyfills included, so very old browsers (IE) are not supported.

---

## 📌 Notes

- This is a **front-end simulation only** — there is no real backend, database, or authentication server. All patient/vitals data is mock data generated in-browser.
- Do not use this project for actual clinical decision-making.
