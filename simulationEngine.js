/* ==========================================================================
   ResQRoute High-Resolution Dynamic Engine
   Dynamically generates GPS routes, intermediate waypoints, accurate distances,
   and live traffic colors for ANY pair among all 38 Tamil Nadu districts.
   ========================================================================== */

const SimulationEngine = (function () {
  let isRunning = false;
  let timerId = null;
  let currentStep = 0;
  let animProgress = 0;

  function cleanDistrictName(name) {
    if (!name) return "";
    return name.replace(/\s+District$/i, "").trim();
  }

  // Exact GPS Center Coordinates for ALL 38 Districts of Tamil Nadu
  const districtCenters = {
    "Ariyalur": [11.1401, 79.0786],
    "Chengalpattu": [12.6917, 79.9760],
    "Chennai": [13.0815, 80.2770],
    "Coimbatore": [11.0010, 76.9640],
    "Cuddalore": [11.7480, 79.7710],
    "Dharmapuri": [12.1310, 78.1580],
    "Dindigul": [10.3670, 77.9800],
    "Erode": [11.3410, 77.7170],
    "Kallakurichi": [11.7380, 78.9630],
    "Kanchipuram": [12.8340, 79.7030],
    "Kanyakumari": [8.1810, 77.4120],
    "Karur": [10.9601, 78.0766],
    "Krishnagiri": [12.5200, 78.2140],
    "Madurai": [9.9250, 78.1250],
    "Mayiladuthurai": [11.1010, 79.6540],
    "Nagapattinam": [10.7650, 79.8420],
    "Namakkal": [11.2180, 78.1670],
    "Nilgiris": [11.4100, 76.6950],
    "Perambalur": [11.2330, 78.8820],
    "Pudukkottai": [10.3800, 78.8210],
    "Ramanathapuram": [9.3710, 78.8300],
    "Ranipet": [12.9280, 79.3620],
    "Salem": [11.6600, 78.1450],
    "Sivagangai": [9.8450, 78.4810],
    "Tenkasi": [8.9590, 77.3140],
    "Thanjavur": [10.7580, 79.1050],
    "Theni": [10.0110, 77.4780],
    "Thoothukudi": [8.7840, 78.1340],
    "Tiruchirappalli": [10.8140, 78.6870],
    "Tirunelveli": [8.7120, 77.7340],
    "Tirupathur": [12.4930, 78.5680],
    "Tiruppur": [11.1080, 77.3410],
    "Tiruvallur": [13.1430, 79.9080],
    "Tiruvannamalai": [12.2250, 79.0740],
    "Tiruvarur": [10.7720, 79.6350],
    "Vellore": [12.9250, 79.1350],
    "Viluppuram": [11.9820, 79.5140],
    "Virudhunagar": [9.5860, 77.9580]
  };

  // Comprehensive Hospital Directory for ALL 38 Districts
  const districtHospitals = {
    "Ariyalur": [
      { name: "Government Head Quarters Hospital, Ariyalur", lat: 11.1401, lng: 79.0786 },
      { name: "Global Hospital & Trauma Care, Ariyalur", lat: 11.1450, lng: 79.0810 }
    ],
    "Chengalpattu": [
      { name: "Chengalpattu Govt Medical College Hospital", lat: 12.6917, lng: 79.9760 },
      { name: "Apollo Speciality Hospital, OMR Chengalpattu", lat: 12.8210, lng: 80.2190 }
    ],
    "Chennai": [
      { name: "Rajiv Gandhi Govt General Hospital (RGGGH), Chennai", lat: 13.0815, lng: 80.2770 },
      { name: "Apollo Hospital, Greams Road, Chennai", lat: 13.0600, lng: 80.2520 },
      { name: "Government Stanley Medical College Hospital, Chennai", lat: 13.1040, lng: 80.2880 }
    ],
    "Coimbatore": [
      { name: "Coimbatore Medical College Hospital (CMCH), Coimbatore", lat: 11.0010, lng: 76.9640 },
      { name: "KMCH Speciality Hospital, Avinashi Rd, Coimbatore", lat: 11.0420, lng: 77.0380 },
      { name: "G. Kuppuswamy Naidu Memorial Hospital (GKNM), Coimbatore", lat: 11.0120, lng: 76.9820 }
    ],
    "Cuddalore": [
      { name: "Government Head Quarters Hospital, Cuddalore", lat: 11.7480, lng: 79.7710 }
    ],
    "Dharmapuri": [
      { name: "Government Dharmapuri Medical College Hospital", lat: 12.1310, lng: 78.1580 }
    ],
    "Dindigul": [
      { name: "Government Head Quarters Hospital, Dindigul", lat: 10.3670, lng: 77.9800 }
    ],
    "Erode": [
      { name: "Government Erode Medical College Hospital, Perundurai", lat: 11.2740, lng: 77.5850 },
      { name: "KMCH Speciality Hospital, Erode", lat: 11.3410, lng: 77.7170 }
    ],
    "Kallakurichi": [
      { name: "Government Head Quarters Hospital, Kallakurichi", lat: 11.7380, lng: 78.9630 }
    ],
    "Kanchipuram": [
      { name: "Government Head Quarters Hospital, Kanchipuram", lat: 12.8340, lng: 79.7030 }
    ],
    "Kanyakumari": [
      { name: "Kanyakumari Govt Medical College Hospital, Asaripallam", lat: 8.1810, lng: 77.4120 }
    ],
    "Karur": [
      { name: "Government Medical College Hospital (GMCH), Karur", lat: 10.9601, lng: 78.0766 },
      { name: "Apollo Speciality Hospital, Karur", lat: 10.9580, lng: 78.0810 },
      { name: "Lotus Hospital & Emergency Care, Karur", lat: 10.9650, lng: 78.0720 }
    ],
    "Krishnagiri": [
      { name: "Government Head Quarters Hospital, Krishnagiri", lat: 12.5200, lng: 78.2140 }
    ],
    "Madurai": [
      { name: "Government Rajaji Hospital (GRH), Madurai", lat: 9.9250, lng: 78.1250 },
      { name: "Apollo Specialty Hospital, KK Nagar, Madurai", lat: 9.9320, lng: 78.1480 }
    ],
    "Mayiladuthurai": [
      { name: "Government Head Quarters Hospital, Mayiladuthurai", lat: 11.1010, lng: 79.6540 }
    ],
    "Nagapattinam": [
      { name: "Government Head Quarters Hospital, Nagapattinam", lat: 10.7650, lng: 79.8420 }
    ],
    "Namakkal": [
      { name: "Government Head Quarters Hospital, Namakkal", lat: 11.2180, lng: 78.1670 }
    ],
    "Nilgiris": [
      { name: "Government Medical College Hospital, Ooty", lat: 11.4100, lng: 76.6950 }
    ],
    "Perambalur": [
      { name: "Government Head Quarters Hospital, Perambalur", lat: 11.2330, lng: 78.8820 }
    ],
    "Pudukkottai": [
      { name: "Government Pudukkottai Medical College Hospital", lat: 10.3800, lng: 78.8210 }
    ],
    "Ramanathapuram": [
      { name: "Government Ramanathapuram Medical College Hospital", lat: 9.3710, lng: 78.8300 }
    ],
    "Ranipet": [
      { name: "Government Head Quarters Hospital, Walajapet", lat: 12.9280, lng: 79.3620 }
    ],
    "Salem": [
      { name: "Govt Mohan Kumaramangalam Medical College Hospital, Salem", lat: 11.6600, lng: 78.1450 },
      { name: "Manipal Hospital ER, Salem", lat: 11.6820, lng: 78.1150 }
    ],
    "Sivagangai": [
      { name: "Government Sivagangai Medical College Hospital", lat: 9.8450, lng: 78.4810 }
    ],
    "Tenkasi": [
      { name: "Government Head Quarters Hospital, Tenkasi", lat: 8.9590, lng: 77.3140 }
    ],
    "Thanjavur": [
      { name: "Thanjavur Govt Medical College Hospital (TMCH)", lat: 10.7580, lng: 79.1050 }
    ],
    "Theni": [
      { name: "Government Theni Medical College Hospital, Kanavilku", lat: 10.0110, lng: 77.4780 }
    ],
    "Thoothukudi": [
      { name: "Government Thoothukudi Medical College Hospital", lat: 8.7840, lng: 78.1340 }
    ],
    "Tiruchirappalli": [
      { name: "Mahatma Gandhi Memorial Govt Hospital (MGMGH), Trichy", lat: 10.8140, lng: 78.6870 }
    ],
    "Tirunelveli": [
      { name: "Tirunelveli Govt Medical College Hospital (TVMCH)", lat: 8.7120, lng: 77.7340 }
    ],
    "Tirupathur": [
      { name: "Government Head Quarters Hospital, Tirupathur", lat: 12.4930, lng: 78.5680 }
    ],
    "Tiruppur": [
      { name: "Government Medical College Hospital, Tiruppur", lat: 11.1080, lng: 77.3410 }
    ],
    "Tiruvallur": [
      { name: "Government Medical College Hospital, Tiruvallur", lat: 13.1430, lng: 79.9080 }
    ],
    "Tiruvannamalai": [
      { name: "Government Tiruvannamalai Medical College Hospital", lat: 12.2250, lng: 79.0740 }
    ],
    "Tiruvarur": [
      { name: "Government Tiruvarur Medical College Hospital", lat: 10.7720, lng: 79.6350 }
    ],
    "Vellore": [
      { name: "Christian Medical College (CMC), Vellore", lat: 12.9250, lng: 79.1350 }
    ],
    "Viluppuram": [
      { name: "Government Medical College Hospital, Mundiyampakkam", lat: 11.9820, lng: 79.5140 }
    ],
    "Virudhunagar": [
      { name: "Government Virudhunagar Medical College Hospital", lat: 9.5860, lng: 77.9580 }
    ]
  };

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1.2 * 10) / 10;
  }

  function generateDynamicRoute(rawOrigin, rawDest) {
    const originName = cleanDistrictName(rawOrigin);
    const destName = cleanDistrictName(rawDest);

    if (!originName || !destName || !districtCenters[originName] || !districtCenters[destName]) {
      return { distanceKm: 0, estMinutes: 0, waypoints: [], trafficSegments: [] };
    }

    const startCoord = districtCenters[originName];
    const endCoord = districtCenters[destName];

    const distKm = calculateDistance(startCoord[0], startCoord[1], endCoord[0], endCoord[1]);
    const numWaypoints = 6;
    const waypoints = [];

    for (let i = 0; i <= numWaypoints; i++) {
      const ratio = i / numWaypoints;
      const curveLat = Math.sin(ratio * Math.PI) * (i % 2 === 0 ? 0.03 : -0.03);
      const curveLng = Math.sin(ratio * Math.PI) * (i % 2 === 0 ? -0.02 : 0.02);

      const lat = startCoord[0] + (endCoord[0] - startCoord[0]) * ratio + curveLat;
      const lng = startCoord[1] + (endCoord[1] - startCoord[1]) * ratio + curveLng;
      waypoints.push([Math.round(lat * 10000) / 10000, Math.round(lng * 10000) / 10000]);
    }

    const estMins = Math.max(5, Math.round((distKm / 75) * 60));

    const trafficSegments = [
      { fromIdx: 0, toIdx: 2, status: 'red', label: `${originName} Exit Congestion (20 km/h)`, color: '#ff3b30' },
      { fromIdx: 2, toIdx: 4, status: 'green', label: `Express Highway Corridor (85 km/h)`, color: '#00e676' },
      { fromIdx: 4, toIdx: 6, status: 'yellow', label: `Approaching ${destName} (45 km/h)`, color: '#ffc107' }
    ];

    return {
      distanceKm: distKm,
      estMinutes: estMins,
      waypoints: waypoints,
      trafficSegments: trafficSegments
    };
  }

  let activeRouteData = { distanceKm: 0, estMinutes: 0, waypoints: [], trafficSegments: [] };
  let activeWaypoints = [];
  let activeTrafficSegments = [];

  const primaryAmbulance = {
    id: 'TN-01-AX-1080',
    driver: 'Capt. Selvam M (TN 108 EMS)',
    status: 'STANDBY PATROL',
    severity: 'CRITICAL',
    origin: 'Select Origin',
    targetDistrict: 'Select Destination',
    lat: 11.1271,
    lng: 78.6569,
    speed: 0,
    vitals: { bpm: 98, spo2: 98, bp: '120/80' },
    destination: 'Select Hospital',
    distanceRemaining: 0,
    etaSeconds: 0
  };

  const peerAmbulances = [
    {
      id: 'TN-07-PA-4421',
      driver: 'Officer Karthik R (TN Escort)',
      status: 'PATROL READY',
      lat: 11.1300,
      lng: 78.6600,
      distFromPrimary: 0,
      isLeadEscort: false
    }
  ];

  let listeners = {
    onTick: null,
    onPeerAlertTrigger: null,
    onHospitalDelivered: null,
    onRouteChange: null
  };

  function setInterDistrictRoute(rawOrigin, rawTargetDistrict, hospitalName) {
    const origin = cleanDistrictName(rawOrigin);
    const targetDistrict = cleanDistrictName(rawTargetDistrict);

    primaryAmbulance.origin = origin;
    primaryAmbulance.targetDistrict = targetDistrict;
    primaryAmbulance.status = 'CODE RED EMERGENCY';
    if (hospitalName) primaryAmbulance.destination = hospitalName;

    activeRouteData = generateDynamicRoute(origin, targetDistrict);
    activeWaypoints = activeRouteData.waypoints;
    activeTrafficSegments = activeRouteData.trafficSegments;

    currentStep = 0;
    animProgress = 0;

    if (activeWaypoints.length > 0) {
      primaryAmbulance.lat = activeWaypoints[0][0];
      primaryAmbulance.lng = activeWaypoints[0][1];
      peerAmbulances[0].lat = activeWaypoints[0][0] + 0.002;
      peerAmbulances[0].lng = activeWaypoints[0][1] + 0.002;
      peerAmbulances[0].isLeadEscort = true;
      peerAmbulances[0].status = 'HIGHWAY CONVOY ESCORT';
    }

    primaryAmbulance.distanceRemaining = activeRouteData.distanceKm;
    primaryAmbulance.etaSeconds = activeRouteData.estMinutes * 60;

    if (listeners.onRouteChange) {
      listeners.onRouteChange({
        origin: origin,
        targetDistrict: targetDistrict,
        destination: primaryAmbulance.destination,
        routeData: activeRouteData,
        waypoints: activeWaypoints,
        trafficSegments: activeTrafficSegments,
        ambulance: primaryAmbulance
      });
    }
  }

  function start(callbacks) {
    if (callbacks) listeners = { ...listeners, ...callbacks };
    if (isRunning) return;

    isRunning = true;
    timerId = setInterval(tick, 250);
  }

  function pause() {
    isRunning = false;
    if (timerId) clearInterval(timerId);
  }

  function tick() {
    if (!isRunning) return;
    if (activeWaypoints.length < 2) return;

    animProgress += 0.025;

    if (animProgress >= 1) {
      animProgress = 0;
      currentStep++;
    }

    if (currentStep >= activeWaypoints.length - 1) {
      currentStep = 0;
      animProgress = 0;
    }

    const p1 = activeWaypoints[currentStep];
    const p2 = activeWaypoints[Math.min(currentStep + 1, activeWaypoints.length - 1)];

    primaryAmbulance.lat = Math.round((p1[0] + (p2[0] - p1[0]) * animProgress) * 10000) / 10000;
    primaryAmbulance.lng = Math.round((p1[1] + (p2[1] - p1[1]) * animProgress) * 10000) / 10000;

    primaryAmbulance.speed = Math.floor(65 + Math.sin(Date.now() / 1500) * 6);
    primaryAmbulance.vitals.bpm = Math.floor(132 + Math.sin(Date.now() / 1000) * 4);

    const totalWaypoints = activeWaypoints.length - 1;
    const progressRatio = (currentStep + animProgress) / totalWaypoints;
    
    primaryAmbulance.distanceRemaining = Math.max(0.2, (activeRouteData.distanceKm * (1 - progressRatio))).toFixed(1);
    primaryAmbulance.etaSeconds = Math.max(10, Math.floor(activeRouteData.estMinutes * 60 * (1 - progressRatio)));

    peerAmbulances.forEach((peer) => {
      if (peer.isLeadEscort) {
        let leadStep = currentStep;
        let leadProgress = animProgress + 0.25;
        if (leadProgress >= 1) {
          leadProgress -= 1;
          leadStep = Math.min(currentStep + 1, activeWaypoints.length - 1);
        }

        const lp1 = activeWaypoints[leadStep];
        const lp2 = activeWaypoints[Math.min(leadStep + 1, activeWaypoints.length - 1)];
        peer.lat = Math.round((lp1[0] + (lp2[0] - lp1[0]) * leadProgress) * 10000) / 10000;
        peer.lng = Math.round((lp1[1] + (lp2[1] - lp1[1]) * leadProgress) * 10000) / 10000;
      }
    });

    if (listeners.onTick) {
      listeners.onTick({
        arrived: false,
        ambulance: primaryAmbulance,
        peers: peerAmbulances,
        waypoints: activeWaypoints,
        trafficSegments: activeTrafficSegments
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
    cleanDistrictName,
    districtCenters,
    districtHospitals,
    get activeWaypoints() { return activeWaypoints; },
    get activeTrafficSegments() { return activeTrafficSegments; },
    primaryAmbulance,
    peerAmbulances
  };
})();
