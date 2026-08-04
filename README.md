# 🚑 ResQRoute — Smart Emergency Patrol & Inter-District Route Network

> **Tamil Nadu EMS Peer Patrol & Inter-District Emergency Routing System**  
> *Built for real-time emergency transport coordination across Tamil Nadu districts.*

---

## 🌟 Key Features

1. **🚑 Pure Ambulance-to-Ambulance (A2A) Peer Patrol Network:**
   * When an ambulance carrying a critical patient triggers **Code Red SOS**, nearby standby ambulances receive an instant **Convoy Escort Request**.
   * The escort ambulance (`TN-07-PA-4421`) travels **directly in lead convoy 80 meters ahead** of the main ambulance (`TN-01-AX-1080`) to clear traffic paths on public roads.

2. **🗺️ Tamil Nadu District-Wise Emergency Hospital Selection:**
   * Filter hospitals by Tamil Nadu District: **Karur, Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Vellore, Erode**.
   * Dynamically populates major government and private emergency trauma hospitals per district (*GMCH Karur, RGGGH Chennai, CMCH Coimbatore, GRH Madurai, MGMGH Trichy, CMCH Vellore*).

3. **📍 On-The-Spot Hospital Delivery by Driver:**
   * Main ambulance drivers can select or type a target hospital **on the spot**.
   * Updates map GPS pins, ETA countdowns, and convoy escort units instantly.

4. **🛣️ Inter-District Highway Route Calculation (e.g., Chennai ➔ Karur):**
   * Calculates accurate highway distances (**385.4 km for Chennai to Karur**) and travel time (**5h 15m**).
   * Renders dynamic real-world OpenStreetMap corridor lines and traffic bottleneck alerts.

5. **🏥 Hospital Emergency Triage Synchronization:**
   * ER staff receive live patient vitals (BPM, SpO2, Blood Pressure) and countdown timers to prepare trauma bays before arrival.

---

## 🚘 Active Fleet Registration Numbers

* **Main Transport Ambulance:** `TN-01-AX-1080` *(Capt. Selvam M)*
* **Lead Convoy Escort Ambulance:** `TN-07-PA-4421` *(Officer Karthik R)*
* **Standby Patrol Unit:** `TN-09-EM-8833` *(Officer Anitha S)*

---

## 🛠️ Tech Stack

* **Frontend UI:** HTML5, Modern CSS3 (Glassmorphism & Emergency Dark Theme), Vanilla JavaScript (ES6+).
* **Mapping Engine:** Leaflet.js with OpenStreetMap real Tamil Nadu tiles.
* **Audio Synthesizer:** Web Audio API (Dual-Tone Emergency Siren & Notification Chimes).

---

## 🚀 Getting Started

### Run Locally:
```bash
# Serve application using npx serve or python http server
npx serve . -p 8080
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser.

---

## 📝 License & Attribution
Maintained by [Kavin-124](https://github.com/Kavin-124) (`kavinravi124@gmail.com`) for LifePulse Emergency System.
