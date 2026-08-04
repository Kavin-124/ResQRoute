/* ==========================================================================
   ResQRoute High-Resolution Live Simulation & Telematics Engine
   Includes ALL 38 Districts of Tamil Nadu, Dynamic Rerouting Engine,
   Color-Differentiated Live Traffic Segments, and Realistic Speed Control.
   ========================================================================== */

const SimulationEngine = (function () {
  let isRunning = false;
  let timerId = null;
  let currentStep = 0;
  let animProgress = 0;

  // Complete Database of ALL 38 Districts of Tamil Nadu with Emergency Hospitals
  const districtHospitals = {
    "Ariyalur": [
      { name: "Government Head Quarters Hospital, Ariyalur", lat: 11.1401, lng: 79.0786 },
      { name: "Global Hospital & Trauma Care, Ariyalur", lat: 11.1450, lng: 79.0810 }
    ],
    "Chengalpattu": [
      { name: "Chengalpattu Govt Medical College Hospital", lat: 12.6917, lng: 79.9760 },
      { name: "Apollo Speciality Hospital, OMR Chengalpattu", lat: 12.8210, lng: 80.2190 },
      { name: "Gleneagles Global Health City, Perumbakkam", lat: 12.9030, lng: 80.2010 }
    ],
    "Chennai": [
      { name: "Rajiv Gandhi Govt General Hospital (RGGGH), Chennai", lat: 13.0815, lng: 80.2770 },
      { name: "Apollo Hospital, Greams Road, Chennai", lat: 13.0600, lng: 80.2520 },
      { name: "Government Stanley Medical College Hospital, Chennai", lat: 13.1040, lng: 80.2880 },
      { name: "Kauvery Hospital ER, Alwarpet, Chennai", lat: 13.0350, lng: 80.2510 },
      { name: "MGM Healthcare, Aminjikarai, Chennai", lat: 13.0720, lng: 80.2240 }
    ],
    "Coimbatore": [
      { name: "Coimbatore Medical College Hospital (CMCH), Coimbatore", lat: 11.0010, lng: 76.9640 },
      { name: "KMCH Speciality Hospital, Avinashi Rd, Coimbatore", lat: 11.0420, lng: 77.0380 },
      { name: "G. Kuppuswamy Naidu Memorial Hospital (GKNM), Coimbatore", lat: 11.0120, lng: 76.9820 },
      { name: "PSG Hospitals, Peelamedu, Coimbatore", lat: 11.0250, lng: 77.0030 }
    ],
    "Cuddalore": [
      { name: "Government Head Quarters Hospital, Cuddalore", lat: 11.7480, lng: 79.7710 },
      { name: "Rajah Muthiah Medical College Hospital, Chidambaram", lat: 11.3930, lng: 79.7140 }
    ],
    "Dharmapuri": [
      { name: "Government Dharmapuri Medical College Hospital", lat: 12.1310, lng: 78.1580 },
      { name: "Lotus Emergency Hospital, Dharmapuri", lat: 12.1380, lng: 78.1620 }
    ],
    "Dindigul": [
      { name: "Government Head Quarters Hospital, Dindigul", lat: 10.3670, lng: 77.9800 },
      { name: "City Hospital & Trauma Center, Dindigul", lat: 10.3610, lng: 77.9730 }
    ],
    "Erode": [
      { name: "Government Erode Medical College Hospital, Perundurai", lat: 11.2740, lng: 77.5850 },
      { name: "KMCH Speciality Hospital, Erode", lat: 11.3410, lng: 77.7170 },
      { name: "Lotus Hospital ER, Erode", lat: 11.3480, lng: 77.7210 }
    ],
    "Kallakurichi": [
      { name: "Government Head Quarters Hospital, Kallakurichi", lat: 11.7380, lng: 78.9630 }
    ],
    "Kanchipuram": [
      { name: "Government Head Quarters Hospital, Kanchipuram", lat: 12.8340, lng: 79.7030 },
      { name: "Meenakshi Medical College Hospital, Kanchipuram", lat: 12.8420, lng: 79.6740 }
    ],
    "Kanyakumari": [
      { name: "Kanyakumari Govt Medical College Hospital, Asaripallam", lat: 8.1810, lng: 77.4120 },
      { name: "Dr. Jeyasekharan Medical Trust, Nagercoil", lat: 8.1880, lng: 77.4350 }
    ],
    "Karur": [
      { name: "Government Medical College Hospital (GMCH), Karur", lat: 10.9601, lng: 78.0766 },
      { name: "Apollo Speciality Hospital, Karur", lat: 10.9580, lng: 78.0810 },
      { name: "Lotus Hospital & Emergency Care, Karur", lat: 10.9650, lng: 78.0720 },
      { name: "Amaravathi Emergency Hospital, Karur", lat: 10.9540, lng: 78.0790 }
    ],
    "Krishnagiri": [
      { name: "Government Head Quarters Hospital, Krishnagiri", lat: 12.5200, lng: 78.2140 },
      { name: "St. Peter's Medical College Hospital, Hosur", lat: 12.7410, lng: 77.8250 }
    ],
    "Madurai": [
      { name: "Government Rajaji Hospital (GRH), Madurai", lat: 9.9250, lng: 78.1250 },
      { name: "Apollo Specialty Hospital, KK Nagar, Madurai", lat: 9.9320, lng: 78.1480 },
      { name: "Meenakshi Mission Hospital & Research Centre, Madurai", lat: 9.9540, lng: 78.1620 },
      { name: "Velammal Medical College Hospital, Madurai", lat: 9.8820, lng: 78.1510 }
    ],
    "Mayiladuthurai": [
      { name: "Government Head Quarters Hospital, Mayiladuthurai", lat: 11.1010, lng: 79.6540 }
    ],
    "Nagapattinam": [
      { name: "Government Head Quarters Hospital, Nagapattinam", lat: 10.7650, lng: 79.8420 }
    ],
    "Namakkal": [
      { name: "Government Head Quarters Hospital, Namakkal", lat: 11.2180, lng: 78.1670 },
      { name: "CM Hospital & Trauma Care, Namakkal", lat: 11.2230, lng: 78.1710 }
    ],
    "Nilgiris": [
      { name: "Government Medical College Hospital, Ooty", lat: 11.4100, lng: 76.6950 }
    ],
    "Perambalur": [
      { name: "Government Head Quarters Hospital, Perambalur", lat: 11.2330, lng: 78.8820 },
      { name: "Dhanalakshmi Srinivasan Medical College Hospital", lat: 11.2410, lng: 78.8910 }
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
      { name: "Manipal Hospital ER, Salem", lat: 11.6820, lng: 78.1150 },
      { name: "Shanmuga Hospital & Trauma Care, Salem", lat: 11.6540, lng: 78.1390 }
    ],
    "Sivagangai": [
      { name: "Government Sivagangai Medical College Hospital", lat: 9.8450, lng: 78.4810 }
    ],
    "Tenkasi": [
      { name: "Government Head Quarters Hospital, Tenkasi", lat: 8.9590, lng: 77.3140 }
    ],
    "Thanjavur": [
      { name: "Thanjavur Govt Medical College Hospital (TMCH)", lat: 10.7580, lng: 79.1050 },
      { name: "Our Lady of Health Hospital, Thanjavur", lat: 10.7710, lng: 79.1320 }
    ],
    "Theni": [
      { name: "Government Theni Medical College Hospital, Kanavilku", lat: 10.0110, lng: 77.4780 }
    ],
    "Thoothukudi": [
      { name: "Government Thoothukudi Medical College Hospital", lat: 8.7840, lng: 78.1340 }
    ],
    "Tiruchirappalli": [
      { name: "Mahatma Gandhi Memorial Govt Hospital (MGMGH), Trichy", lat: 10.8140, lng: 78.6870 },
      { name: "KMC Speciality Hospital, Cantonment, Trichy", lat: 10.8060, lng: 78.6820 },
      { name: "Apollo Speciality Hospital, TVS Tolgate, Trichy", lat: 10.7950, lng: 78.6910 }
    ],
    "Tirunelveli": [
      { name: "Tirunelveli Govt Medical College Hospital (TVMCH)", lat: 8.7120, lng: 77.7340 },
      { name: "Galaxy Hospital & Emergency Center, Tirunelveli", lat: 8.7280, lng: 77.7120 }
    ],
    "Tirupathur": [
      { name: "Government Head Quarters Hospital, Tirupathur", lat: 12.4930, lng: 78.5680 }
    ],
    "Tiruppur": [
      { name: "Government Medical College Hospital, Tiruppur", lat: 11.1080, lng: 77.3410 },
      { name: "Revathi Medical Center, Tiruppur", lat: 11.1150, lng: 77.3520 }
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
      { name: "Christian Medical College (CMC), Vellore", lat: 12.9250, lng: 79.1350 },
      { name: "Government Vellore Medical College Hospital, Vellore", lat: 12.8710, lng: 79.1120 }
    ],
    "Viluppuram": [
      { name: "Government Medical College Hospital, Mundiyampakkam", lat: 11.9820, lng: 79.5140 }
    ],
    "Virudhunagar": [
      { name: "Government Virudhunagar Medical College Hospital", lat: 9.5860, lng: 77.9580 }
    ]
  };

  // Dynamic Route Coordinates & Color-Differentiated Traffic Segments
  const interDistrictRoutes = {
    "Chennai-Karur": {
      distanceKm: 385.4,
      estMinutes: 315,
      waypoints: [
        [13.0067, 80.2020], // Chennai Kathipara Jct
        [12.6917, 79.9760], // Chengalpattu
        [12.2310, 79.6500], // Tindivanam
        [11.9400, 79.4860], // Villupuram
        [11.2330, 78.8820], // Perambalur
        [10.8140, 78.6870], // Trichy
        [10.9601, 78.0766]  // Karur GMCH
      ],
      trafficSegments: [
        { fromIdx: 0, toIdx: 2, status: 'red', label: 'Heavy Traffic (Chennai City Exit - 18 km/h)', color: '#ff3b30' },
        { fromIdx: 2, toIdx: 4, status: 'green', label: 'Clear Highway (NH44 - 82 km/h)', color: '#00e676' },
        { fromIdx: 4, toIdx: 5, status: 'yellow', label: 'Moderate Traffic (Trichy Bypass - 45 km/h)', color: '#ffc107' },
        { fromIdx: 5, toIdx: 6, status: 'green', label: 'Clear Highway (Karur Approach - 78 km/h)', color: '#00e676' }
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
      ],
      trafficSegments: [
        { fromIdx: 0, toIdx: 1, status: 'yellow', label: 'Moderate Traffic (Sriperumbudur)', color: '#ffc107' },
        { fromIdx: 1, toIdx: 3, status: 'green', label: 'Clear Express Highway (85 km/h)', color: '#00e676' },
        { fromIdx: 3, toIdx: 5, status: 'red', label: 'Congested Toll Plaza (Salem-Erode)', color: '#ff3b30' }
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
      ],
      trafficSegments: [
        { fromIdx: 0, toIdx: 2, status: 'green', label: 'Clear NH38 Highway Corridor (80 km/h)', color: '#00e676' },
        { fromIdx: 2, toIdx: 4, status: 'yellow', label: 'Moderate Traffic (Madurai Ring Road)', color: '#ffc107' }
      ]
    },
    "Karur-Tiruchirappalli": {
      distanceKm: 83.2,
      estMinutes: 75,
      waypoints: [
        [10.9601, 78.0766], // Karur GMCH
        [10.9120, 78.2350], // Kulithalai
        [10.8540, 78.4520], // Elamanur
        [10.8140, 78.6870]  // Trichy MGMGH
      ],
      trafficSegments: [
        { fromIdx: 0, toIdx: 2, status: 'green', label: 'Clear River Corridor (75 km/h)', color: '#00e676' },
        { fromIdx: 2, toIdx: 3, status: 'yellow', label: 'Moderate City Approach', color: '#ffc107' }
      ]
    },
    "Default-Local": {
      distanceKm: 14.2,
      estMinutes: 22,
      waypoints: [
        [13.0067, 80.2020], // Guindy Kathipara
        [13.0234, 80.2205], // Saidapet
        [13.0420, 80.2450], // T. Nagar
        [13.0610, 80.2580], // Thousand Lights
        [13.0815, 80.2770]  // RGGGH Chennai
      ],
      trafficSegments: [
        { fromIdx: 0, toIdx: 2, status: 'yellow', label: 'Moderate Arterial Traffic', color: '#ffc107' },
        { fromIdx: 2, toIdx: 4, status: 'red', label: 'Heavy City Congestion (15 km/h)', color: '#ff3b30' }
      ]
    }
  };

  let activeRouteKey = "Chennai-Karur";
  let activeWaypoints = interDistrictRoutes["Chennai-Karur"].waypoints;
  let activeTrafficSegments = interDistrictRoutes["Chennai-Karur"].trafficSegments;

  // Primary Emergency Ambulance (TN-01-AX-1080)
  const primaryAmbulance = {
    id: 'TN-01-AX-1080',
    driver: 'Capt. Selvam M (TN 108 EMS)',
    status: 'CODE RED EMERGENCY',
    severity: 'CRITICAL',
    origin: 'Chennai',
    targetDistrict: 'Karur',
    lat: activeWaypoints[0][0],
    lng: activeWaypoints[0][1],
    speed: 68,
    vitals: { bpm: 134, spo2: 91, bp: '145/95' },
    destination: 'Government Medical College Hospital (GMCH), Karur',
    distanceRemaining: 385.4,
    etaSeconds: 18900
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
    activeTrafficSegments = routeData.trafficSegments;
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
        waypoints: activeWaypoints,
        trafficSegments: activeTrafficSegments
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

    animProgress += 0.025;

    if (animProgress >= 1) {
      animProgress = 0;
      currentStep++;
    }

    if (currentStep >= activeWaypoints.length - 1) {
      currentStep = 0;
      animProgress = 0;
    }

    // Main Ambulance Movement
    const p1 = activeWaypoints[currentStep];
    const p2 = activeWaypoints[Math.min(currentStep + 1, activeWaypoints.length - 1)];

    primaryAmbulance.lat = p1[0] + (p2[0] - p1[0]) * animProgress;
    primaryAmbulance.lng = p1[1] + (p2[1] - p1[1]) * animProgress;

    primaryAmbulance.speed = Math.floor(65 + Math.sin(Date.now() / 1500) * 6);
    primaryAmbulance.vitals.bpm = Math.floor(132 + Math.sin(Date.now() / 1000) * 4);

    const routeData = interDistrictRoutes[activeRouteKey] || interDistrictRoutes["Default-Local"];
    const totalWaypoints = activeWaypoints.length - 1;
    const progressRatio = (currentStep + animProgress) / totalWaypoints;
    
    primaryAmbulance.distanceRemaining = Math.max(0.2, (routeData.distanceKm * (1 - progressRatio))).toFixed(1);
    primaryAmbulance.etaSeconds = Math.max(10, Math.floor(routeData.estMinutes * 60 * (1 - progressRatio)));

    // Synchronized Convoy Movement
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
        peer.lat = lp1[0] + (lp2[0] - lp1[0]) * leadProgress;
        peer.lng = lp1[1] + (lp2[1] - lp1[1]) * leadProgress;
        peer.distFromPrimary = 0.08;
      }
    });

    if (listeners.onTick) {
      listeners.onTick({
        arrived: false,
        ambulance: primaryAmbulance,
        peers: peerAmbulances,
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
    districtHospitals,
    interDistrictRoutes,
    activeWaypoints,
    activeTrafficSegments,
    primaryAmbulance,
    peerAmbulances
  };
})();
