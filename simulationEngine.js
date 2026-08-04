/* ==========================================================================
   ResQRoute High-Resolution Live Simulation & Telematics Engine
   (Tamil Nadu District-Wise Emergency Hospital & Inter-District Route Engine)
   ========================================================================== */

const SimulationEngine = (function () {
  let isRunning = false;
  let timerId = null;
  let currentStep = 0;
  let animProgress = 0;

  // Comprehensive Tamil Nadu District-Wise Emergency Hospital Database
  const districtHospitals = {
    "Karur": [
      { name: "Government Medical College Hospital (GMCH), Karur", lat: 10.9601, lng: 78.0766 },
      { name: "Apollo Speciality Hospital, Karur", lat: 10.9580, lng: 78.0810 },
      { name: "Lotus Hospital & Emergency Care, Karur", lat: 10.9650, lng: 78.0720 },
      { name: "Amaravathi Emergency Hospital, Karur", lat: 10.9540, lng: 78.0790 }
    ],
    "Chennai": [
      { name: "Rajiv Gandhi Govt General Hospital (RGGGH), Chennai", lat: 13.0815, lng: 80.2770 },
      { name: "Apollo Hospital, Greams Road, Chennai", lat: 13.0600, lng: 80.2520 },
      { name: "Government Stanley Medical College Hospital, Chennai", lat: 13.1040, lng: 80.2880 },
      { name: "Kauvery Hospital ER, Alwarpet, Chennai", lat: 13.0350, lng: 80.2510 }
    ],
    "Coimbatore": [
      { name: "Coimbatore Medical College Hospital (CMCH), Coimbatore", lat: 11.0010, lng: 76.9640 },
      { name: "KMCH Speciality Hospital, Avinashi Rd, Coimbatore", lat: 11.0420, lng: 77.0380 },
      { name: "G. Kuppuswamy Naidu Memorial Hospital (GKNM), Coimbatore", lat: 11.0120, lng: 76.9820 }
    ],
    "Madurai": [
      { name: "Government Rajaji Hospital (GRH), Madurai", lat: 9.9250, lng: 78.1250 },
      { name: "Apollo Specialty Hospital, KK Nagar, Madurai", lat: 9.9320, lng: 78.1480 },
      { name: "Meenakshi Mission Hospital & Research Centre, Madurai", lat: 9.9540, lng: 78.1620 }
    ],
    "Tiruchirappalli": [
      { name: "Mahatma Gandhi Memorial Govt Hospital (MGMGH), Trichy", lat: 10.8140, lng: 78.6870 },
      { name: "KMC Speciality Hospital, Cantonment, Trichy", lat: 10.8060, lng: 78.6820 }
    ],
    "Salem": [
      { name: "Govt Mohan Kumaramangalam Medical College Hospital, Salem", lat: 11.6600, lng: 78.1450 },
      { name: "Manipal Hospital ER, Salem", lat: 11.6820, lng: 78.1150 }
    ],
    "Vellore": [
      { name: "Christian Medical College (CMC), Vellore", lat: 12.9250, lng: 79.1350 },
      { name: "Government Vellore Medical College Hospital, Vellore", lat: 12.8710, lng: 79.1120 }
    ]
  };

  // Inter-District Route Coordinates Library
  const interDistrictRoutes = {
    "Chennai-Karur": {
      distanceKm: 385.4,
      estMinutes: 315, // 5h 15m
      waypoints: [
        [13.0067, 80.2020], // Chennai Kathipara Jct
        [12.6917, 79.9760], // Chengalpattu (NH45)
        [12.2310, 79.6500], // Tindivanam
        [11.9400, 79.4860], // Villupuram
        [11.2330, 78.8820], // Perambalur
        [10.8140, 78.6870], // Tiruchirappalli (Trichy)
        [10.9601, 78.0766]  // Karur GMCH Hospital
      ]
    },
    "Chennai-Coimbatore": {
      distanceKm: 506.0,
      estMinutes: 420,
      waypoints: [
        [13.0067, 80.2020], // Chennai
        [12.9250, 79.1350], // Vellore
        [12.5200, 78.2140], // Krishnagiri
        [11.6600, 78.1450], // Salem
        [11.3410, 77.7170], // Erode
        [11.0010, 76.9640]  // Coimbatore CMCH
      ]
    },
    "Chennai-Madurai": {
      distanceKm: 462.0,
      estMinutes: 380,
      waypoints: [
        [13.0067, 80.2020], // Chennai
        [11.9400, 79.4860], // Villupuram
        [10.8140, 78.6870], // Trichy
        [10.3670, 77.9800], // Dindigul
        [9.9250, 78.1250]   // Madurai GRH
      ]
    },
    "Default-Local": {
      distanceKm: 9.4,
      estMinutes: 12,
      waypoints: [
        [13.0067, 80.2020], // Guindy Kathipara
        [13.0234, 80.2205], // Saidapet Jct
        [13.0420, 80.2450], // T. Nagar
        [13.0610, 80.2580], // Thousand Lights
        [13.0815, 80.2770]  // RGGGH Chennai
      ]
    }
  };

  let activeRouteKey = "Chennai-Karur";
  let activeWaypoints = interDistrictRoutes["Chennai-Karur"].waypoints;

  // Primary Emergency Ambulance (Reg No: TN-01-AX-1080)
  const primaryAmbulance = {
    id: 'TN-01-AX-1080',
    driver: 'Capt. Selvam M (TN 108 EMS)',
    status: 'CODE RED EMERGENCY',
    severity: 'CRITICAL',
    origin: 'Chennai',
    targetDistrict: 'Karur',
    lat: activeWaypoints[0][0],
    lng: activeWaypoints[0][1],
    speed: 78, // km/h
    vitals: { bpm: 134, spo2: 91, bp: '145/95' },
    destination: 'Government Medical College Hospital (GMCH), Karur',
    distanceRemaining: 385.4, // km
    etaSeconds: 18900 // seconds
  };

  // Peer Patrol Ambulances
  const peerAmbulances = [
    {
      id: 'TN-07-PA-4421',
      driver: 'Officer Karthik R (TN Escort)',
      status: 'HIGHWAY CONVOY ESCORT',
      lat: activeWaypoints[0][0] + 0.002,
      lng: activeWaypoints[0][1] + 0.002,
      distFromPrimary: 0.08,
      isLeadEscort: true
    },
    {
      id: 'TN-09-EM-8833',
      driver: 'Officer Anitha S',
      status: 'PATROL BEACON',
      lat: activeWaypoints[Math.floor(activeWaypoints.length / 2)][0],
      lng: activeWaypoints[Math.floor(activeWaypoints.length / 2)][1],
      distFromPrimary: 2.5,
      isLeadEscort: false
    }
  ];

  let listeners = {
    onTick: null,
    onPeerAlertTrigger: null,
    onHospitalDelivered: null,
    onRouteChange: null
  };

  function setInterDistrictRoute(origin, targetDistrict, hospitalName) {
    primaryAmbulance.origin = origin;
    primaryAmbulance.targetDistrict = targetDistrict;
    if (hospitalName) primaryAmbulance.destination = hospitalName;

    const routeKey = `${origin}-${targetDistrict}`;
    activeRouteKey = interDistrictRoutes[routeKey] ? routeKey : "Default-Local";
    const routeData = interDistrictRoutes[activeRouteKey] || interDistrictRoutes["Default-Local"];

    activeWaypoints = routeData.waypoints;
    currentStep = 0;
    animProgress = 0;

    primaryAmbulance.lat = activeWaypoints[0][0];
    primaryAmbulance.lng = activeWaypoints[0][1];
    primaryAmbulance.distanceRemaining = routeData.distanceKm;
    primaryAmbulance.etaSeconds = routeData.estMinutes * 60;

    peerAmbulances[0].lat = activeWaypoints[0][0] + 0.002;
    peerAmbulances[0].lng = activeWaypoints[0][1] + 0.002;

    if (listeners.onRouteChange) {
      listeners.onRouteChange({
        origin: origin,
        targetDistrict: targetDistrict,
        destination: primaryAmbulance.destination,
        routeData: routeData,
        waypoints: activeWaypoints
      });
    }
  }

  function start(callbacks) {
    if (callbacks) listeners = { ...listeners, ...callbacks };
    if (isRunning) return;

    isRunning = true;
    timerId = setInterval(tick, 150);
  }

  function pause() {
    isRunning = false;
    if (timerId) clearInterval(timerId);
  }

  function tick() {
    if (!isRunning) return;

    animProgress += 0.06;

    if (animProgress >= 1) {
      animProgress = 0;
      currentStep++;
    }

    if (currentStep >= activeWaypoints.length - 1) {
      currentStep = 0;
      animProgress = 0;
    }

    // Main Ambulance TN-01-AX-1080 Movement
    const p1 = activeWaypoints[currentStep];
    const p2 = activeWaypoints[Math.min(currentStep + 1, activeWaypoints.length - 1)];

    primaryAmbulance.lat = p1[0] + (p2[0] - p1[0]) * animProgress;
    primaryAmbulance.lng = p1[1] + (p2[1] - p1[1]) * animProgress;

    primaryAmbulance.speed = Math.floor(74 + Math.sin(Date.now() / 1000) * 8);
    primaryAmbulance.vitals.bpm = Math.floor(132 + Math.sin(Date.now() / 800) * 5);

    const routeData = interDistrictRoutes[activeRouteKey] || interDistrictRoutes["Default-Local"];
    const totalWaypoints = activeWaypoints.length - 1;
    const progressRatio = (currentStep + animProgress) / totalWaypoints;
    
    primaryAmbulance.distanceRemaining = Math.max(0.2, (routeData.distanceKm * (1 - progressRatio))).toFixed(1);
    primaryAmbulance.etaSeconds = Math.max(10, Math.floor(routeData.estMinutes * 60 * (1 - progressRatio)));

    // SYNCHRONIZED CONVOY MOVEMENT: TN-07-PA-4421 travels directly in lead ahead of TN-01-AX-1080
    peerAmbulances.forEach((peer) => {
      if (peer.isLeadEscort) {
        let leadStep = currentStep;
        let leadProgress = animProgress + 0.35;
        if (leadProgress >= 1) {
          leadProgress -= 1;
          leadStep = Math.min(currentStep + 1, activeWaypoints.length - 1);
        }

        const lp1 = activeWaypoints[leadStep];
        const lp2 = activeWaypoints[Math.min(leadStep + 1, activeWaypoints.length - 1)];
        peer.lat = lp1[0] + (lp2[0] - lp1[0]) * leadProgress;
        peer.lng = lp1[1] + (lp2[1] - lp1[1]) * leadProgress;
        peer.distFromPrimary = 0.08;
      }
    });

    if (listeners.onTick) {
      listeners.onTick({
        arrived: false,
        ambulance: primaryAmbulance,
        peers: peerAmbulances
      });
    }
  }

  function triggerCodeRedSOS() {
    primaryAmbulance.status = 'CODE RED EMERGENCY';
    peerAmbulances[0].isLeadEscort = true;
    if (listeners.onPeerAlertTrigger) {
      listeners.onPeerAlertTrigger(peerAmbulances[0]);
    }
  }

  function acceptPeerEscort(peerId) {
    const peer = peerAmbulances.find(p => p.id === peerId);
    if (peer) {
      peer.isLeadEscort = true;
      peer.status = 'CONVOY PILOT ESCORT';
    }
  }

  function updatePatientVitals(newVitals, severity) {
    primaryAmbulance.vitals = { ...primaryAmbulance.vitals, ...newVitals };
    if (severity) primaryAmbulance.severity = severity;
  }

  return {
    start,
    pause,
    triggerCodeRedSOS,
    acceptPeerEscort,
    setInterDistrictRoute,
    updatePatientVitals,
    districtHospitals,
    interDistrictRoutes,
    activeWaypoints,
    primaryAmbulance,
    peerAmbulances
  };
})();
