# 🚑 ResQRoute — Tamil Nadu Statewide Emergency Medical Service (EMS) Network

**ResQRoute** is an advanced, high-resolution Emergency Medical Services (EMS) routing, telematics, and highway convoy escort platform designed specifically for the state of **Tamil Nadu**.

---

## 🌟 Key Features

### 📍 1. Dynamic 38-District Highway Route Engine
- Full support for **ALL 38 Districts of Tamil Nadu**:
  * *Ariyalur, Chengalpattu, Chennai, Coimbatore, Cuddalore, Dharmapuri, Dindigul, Erode, Kallakurichi, Kanchipuram, Kanyakumari, Karur, Krishnagiri, Madurai, Mayiladuthurai, Nagapattinam, Namakkal, Nilgiris, Perambalur, Pudukkottai, Ramanathapuram, Ranipet, Salem, Sivagangai, Tenkasi, Thanjavur, Theni, Thoothukudi, Tiruchirappalli, Tirunelveli, Tirupathur, Tiruppur, Tiruvallur, Tiruvannamalai, Tiruvarur, Vellore, Viluppuram, Virudhunagar.*
- Select **ANY Origin & Destination District** to dynamically calculate:
  - Real-world curvature-adjusted highway distance (km).
  - Estimated Travel Time (ETA).
  - Multi-point intermediate highway waypoints.

### 🚥 2. Color-Differentiated Live Traffic Status
- Visualizes real-time highway segment conditions directly on the map:
  - 🟢 **Green Polyline:** Clear Highway Corridor (75–85 km/h)
  - 🟡 **Yellow Polyline:** Moderate Congestion (40–50 km/h)
  - 🔴 **Red Polyline:** Heavy Bottleneck / District Exit (15–20 km/h)

### 🌍 3. Esri High-Resolution Satellite Map Toggle
- Switch seamlessly between:
  - 🛰️ **Esri World Imagery (Satellite Mode)** for detailed real-world satellite terrain.
  - 📡 **OpenStreetMap (Radar Mode)** for vector maps.

### 🛡️ 4. A2A Lead Convoy Escort (<100m Lead Gap)
- Escort vehicle (`TN-07-PA-4421`) automatically locks in formation **~65 meters directly ahead** (<100m) of the main ambulance (`TN-01-AX-1080`) to clear highway traffic.

### 🏥 5. Hospital Arrival & Loop Termination
- Automatically stops the animation loop upon arrival at the destination hospital.
- Triggers ER admission handover alerts and locks telemetry to `0 km/h` and `Arrived`.

---

## 🚀 Getting Started

### Local Development
```bash
# Clone the repository
git clone https://github.com/Kavin-124/ResQRoute.git

# Navigate to project folder
cd ResQRoute

# Install dependencies & start local server
npm install
npm start
```

Access the app in your browser at `http://localhost:8080`.

---

## 📁 Repository Structure
```
ResQRoute/
├── index.html            # Main Web Application Entry Point
├── styles.css            # Dark Mode Design System & Glassmorphism Styles
├── mapEngine.js          # Leaflet & Esri Satellite Map Controller
├── simulationEngine.js   # 38-District GPS Telematics & Route Engine
├── app.js                # Main UI Event Listeners & State Controller
├── package.json          # Node Dependencies & Start Script
├── vercel.json           # Vercel Deployment Configuration
├── README.md             # Project Documentation
└── .gitignore            # Git Ignored Files
```

---

## 🌐 Deployment
Hosted live on **Vercel** connected directly to the GitHub repository:  
👉 **GitHub Repository:** [https://github.com/Kavin-124/ResQRoute](https://github.com/Kavin-124/ResQRoute)
