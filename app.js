/* ==========================================================================
   ResQRoute Main Application Controller
   Supports All 38 Districts of Tamil Nadu, Satellite Map Toggle,
   Color-Differentiated Live Traffic, and Dynamic Rerouting Engine.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Audio Synthesizer (Web Audio API)
  let audioCtx = null;
  let isSoundEnabled = true;
  let sirenOscillator = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
  }

  function playAlertChime() {
    if (!isSoundEnabled) return;
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  }

  function toggleSirenSound(enable) {
    if (!isSoundEnabled || !enable) {
      if (sirenOscillator) {
        sirenOscillator.stop();
        sirenOscillator = null;
      }
      return;
    }
    initAudio();
    if (sirenOscillator) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    gain.gain.value = 0.08;

    let high = true;
    const interval = setInterval(() => {
      if (!sirenOscillator) {
        clearInterval(interval);
        return;
      }
      osc.frequency.setValueAtTime(high ? 950 : 650, audioCtx.currentTime);
      high = !high;
    }, 400);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    sirenOscillator = osc;
  }

  // Sound Toggle Button
  const toggleSoundBtn = document.getElementById('toggleSoundBtn');
  const soundStatus = document.getElementById('soundStatus');
  toggleSoundBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundStatus.textContent = isSoundEnabled ? 'Audio ON' : 'Audio OFF';
    toggleSoundBtn.querySelector('i').className = isSoundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    if (!isSoundEnabled) toggleSirenSound(false);
  });

  // Live Clock
  setInterval(() => {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toTimeString().split(' ')[0];
  }, 1000);

  // Initialize Leaflet Map Engine
  MapEngine.initMap('map');

  // SATELLITE MAP TOGGLE HANDLER
  const radarModeBtn = document.getElementById('radarModeBtn');
  const satModeBtn = document.getElementById('satModeBtn');

  radarModeBtn.addEventListener('click', () => {
    radarModeBtn.classList.add('active');
    satModeBtn.classList.remove('active');
    MapEngine.setMapStyle('radar');
  });

  satModeBtn.addEventListener('click', () => {
    satModeBtn.classList.add('active');
    radarModeBtn.classList.remove('active');
    MapEngine.setMapStyle('satellite');
  });

  const primaryAmb = SimulationEngine.primaryAmbulance;
  const peerAmbs = SimulationEngine.peerAmbulances;

  // Add Hospital & Ambulance Markers
  let hospMarker = MapEngine.addHospitalMarker('hosp-1', 10.9601, 78.0766, primaryAmb.destination);
  MapEngine.addAmbulanceMarker(primaryAmb.id, primaryAmb.lat, primaryAmb.lng, 'active', `${primaryAmb.id} (Main Transport)`);
  peerAmbs.forEach(peer => {
    MapEngine.addAmbulanceMarker(peer.id, peer.lat, peer.lng, 'peer', `${peer.id} (${peer.driver.split(' ')[1]})`);
  });

  // Draw Color-Differentiated Traffic Segments
  MapEngine.drawSegmentedTrafficRoute(SimulationEngine.activeWaypoints, SimulationEngine.activeTrafficSegments);

  // Role View Switching
  const roleBtns = document.querySelectorAll('.role-btn');
  const rolePanels = document.querySelectorAll('.role-panel');

  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRole = btn.getAttribute('data-role');
      
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      rolePanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `panel-${targetRole}`) {
          panel.classList.add('active');
        }
      });
    });
  });

  // DYNAMIC DISTRICT-WISE HOSPITAL POPULATOR (ALL 38 DISTRICTS)
  const originDistrictSelect = document.getElementById('originDistrictSelect');
  const targetDistrictSelect = document.getElementById('targetDistrictSelect');
  const hospitalPresetSelect = document.getElementById('hospitalPresetSelect');
  const customHospGroup = document.getElementById('customHospGroup');
  const customHospInput = document.getElementById('customHospInput');
  const deliverHospBtn = document.getElementById('deliverHospBtn');

  function populateHospitalsForDistrict(district) {
    hospitalPresetSelect.innerHTML = '';
    const hospitals = SimulationEngine.districtHospitals[district] || [
      { name: `Government Head Quarters Hospital, ${district}`, lat: 10.8, lng: 78.6 }
    ];

    hospitals.forEach(hosp => {
      const opt = document.createElement('option');
      opt.value = hosp.name;
      opt.textContent = hosp.name;
      hospitalPresetSelect.appendChild(opt);
    });

    const customOpt = document.createElement('option');
    customOpt.value = 'CUSTOM';
    customOpt.textContent = `Type Custom Address in ${district}...`;
    hospitalPresetSelect.appendChild(customOpt);
  }

  // Populate default district hospitals on load
  populateHospitalsForDistrict(targetDistrictSelect.value);

  targetDistrictSelect.addEventListener('change', () => {
    populateHospitalsForDistrict(targetDistrictSelect.value);
  });

  hospitalPresetSelect.addEventListener('change', () => {
    if (hospitalPresetSelect.value === 'CUSTOM') {
      customHospGroup.style.display = 'flex';
    } else {
      customHospGroup.style.display = 'none';
    }
  });

  // DYNAMIC ROUTE RECALCULATOR & DELIVERER
  deliverHospBtn.addEventListener('click', () => {
    const origin = originDistrictSelect.value;
    const targetDistrict = targetDistrictSelect.value;
    let chosenHospital = hospitalPresetSelect.value;

    if (chosenHospital === 'CUSTOM') {
      chosenHospital = customHospInput.value.trim() || `Govt Hospital, ${targetDistrict}`;
    }

    SimulationEngine.setInterDistrictRoute(origin, targetDistrict, chosenHospital);

    document.getElementById('routeBannerText').innerHTML = `Route: <strong>${origin} ➔ ${targetDistrict}</strong>`;
    document.getElementById('destHospitalName').textContent = chosenHospital;
    document.getElementById('peerRouteText').textContent = `${origin} ➔ ${targetDistrict}`;
    document.getElementById('peerTargetHospText').textContent = chosenHospital;

    renderIncomingList();

    const districtHospitalsList = SimulationEngine.districtHospitals[targetDistrict] || [];
    const matchedHosp = districtHospitalsList.find(h => h.name === chosenHospital);
    const targetLat = matchedHosp ? matchedHosp.lat : SimulationEngine.activeWaypoints[SimulationEngine.activeWaypoints.length - 1][0];
    const targetLng = matchedHosp ? matchedHosp.lng : SimulationEngine.activeWaypoints[SimulationEngine.activeWaypoints.length - 1][1];

    MapEngine.addHospitalMarker('hosp-1', targetLat, targetLng, chosenHospital);
    MapEngine.drawSegmentedTrafficRoute(SimulationEngine.activeWaypoints, SimulationEngine.activeTrafficSegments);

    playAlertChime();
    document.getElementById('tickerText').textContent = `📍 ROUTE RECALCULATED: ${origin} to ${targetDistrict} (${SimulationEngine.primaryAmbulance.distanceRemaining} km). Hospital: "${chosenHospital}". Live traffic overlay updated!`;
    alert(`📍 Emergency Route Recalculated!\n\nRoute: ${origin} ➔ ${targetDistrict}\nDistance: ${SimulationEngine.primaryAmbulance.distanceRemaining} km\nTarget Hospital: ${chosenHospital}\n\nBroadcasted to Lead Convoy Escort TN-07-PA-4421 & Hospital ER!`);
  });

  // Dynamic Peer List Rendering
  function renderPeerList() {
    const peerListActive = document.getElementById('peerListActive');
    if (!peerListActive) return;
    peerListActive.innerHTML = '';
    peerAmbs.forEach(peer => {
      const item = document.createElement('div');
      item.className = 'peer-item';
      item.innerHTML = `
        <div class="peer-info">
          <i class="fa-solid fa-truck-medical peer-icon"></i>
          <div>
            <div class="peer-name">Reg No: ${peer.id}</div>
            <div class="peer-dist">${peer.status} • 80m Lead Escort</div>
          </div>
        </div>
        <span class="status-pill ${peer.isLeadEscort ? 'status-code-red' : 'status-available'}">
          ${peer.isLeadEscort ? 'CONVOY ESCORT' : 'PATROL READY'}
        </span>
      `;
      peerListActive.appendChild(item);
    });
  }
  renderPeerList();

  // Dynamic Incoming List Rendering
  function renderIncomingList() {
    const incomingList = document.getElementById('incomingList');
    if (!incomingList) return;
    incomingList.innerHTML = `
      <div class="incoming-card">
        <div class="incoming-header">
          <span><i class="fa-solid fa-truck-medical" style="color:#ff3b30"></i> Reg No: ${primaryAmb.id}</span>
          <span style="color:#00b0ff" id="erEtaDisplay">${Math.floor(primaryAmb.etaSeconds / 60)}m ${primaryAmb.etaSeconds % 60}s</span>
        </div>
        <div class="incoming-vitals">
          <span>Route: <strong>${primaryAmb.origin} ➔ ${primaryAmb.targetDistrict}</strong></span>
          <span>Target ER: <strong>${primaryAmb.destination}</strong></span>
        </div>
      </div>
    `;
  }
  renderIncomingList();

  // SOS Handler
  const triggerSosBtn = document.getElementById('triggerSosBtn');
  triggerSosBtn.addEventListener('click', () => {
    SimulationEngine.triggerCodeRedSOS();
    toggleSirenSound(true);
    playAlertChime();

    document.getElementById('tickerText').textContent = `🚨 CODE RED ACTIVE! Main Ambulance TN-01-AX-1080 & Convoy Escort TN-07-PA-4421 in Lead Convoy on ${primaryAmb.origin} ➔ ${primaryAmb.targetDistrict} Highway.`;
    renderPeerList();
  });

  // Peer Escort Accept Handler
  const acceptPatrolBtn = document.getElementById('acceptPatrolBtn');
  const peerRequestBox = document.getElementById('peerRequestBox');
  const patrolStatusBox = document.getElementById('patrolStatusBox');

  acceptPatrolBtn.addEventListener('click', () => {
    SimulationEngine.acceptPeerEscort('TN-07-PA-4421');
    peerRequestBox.style.display = 'none';
    patrolStatusBox.style.display = 'flex';
    document.getElementById('peerAlertBadge').style.display = 'none';
    playAlertChime();
    renderPeerList();
  });

  // Patient Vitals Form Handler
  const updateVitalsBtn = document.getElementById('updateVitalsBtn');
  const sevBtns = document.querySelectorAll('.sev-btn');
  let selectedSeverity = 'CRITICAL';

  sevBtns.forEach(b => {
    b.addEventListener('click', () => {
      sevBtns.forEach(btn => btn.classList.remove('active'));
      b.classList.add('active');
      selectedSeverity = b.getAttribute('data-sev');
    });
  });

  updateVitalsBtn.addEventListener('click', () => {
    SimulationEngine.updatePatientVitals({}, selectedSeverity);
    renderIncomingList();
    playAlertChime();
    alert(`Patient Vitals for TN-01-AX-1080 transmitted to ${primaryAmb.destination}!`);
  });

  // LIVE SIMULATION MOVEMENT
  function startLiveSimulation() {
    SimulationEngine.start({
      onTick: (data) => {
        MapEngine.updateAmbulancePos(data.ambulance.id, data.ambulance.lat, data.ambulance.lng);
        
        data.peers.forEach(peer => {
          MapEngine.updateAmbulancePos(peer.id, peer.lat, peer.lng);
        });

        document.getElementById('currentSpeed').textContent = `${data.ambulance.speed} km/h`;
        document.getElementById('distRemaining').textContent = `${data.ambulance.distanceRemaining} km`;
        
        const mins = Math.floor(data.ambulance.etaSeconds / 60);
        const hrs = Math.floor(mins / 60);
        const remMins = mins % 60;
        const etaFormatted = hrs > 0 ? `${hrs}h ${remMins}m` : `${mins}m ${data.ambulance.etaSeconds % 60}s`;

        document.getElementById('etaMinutes').textContent = etaFormatted;
        
        const erEtaDisplay = document.getElementById('erEtaDisplay');
        if (erEtaDisplay) {
          erEtaDisplay.textContent = etaFormatted;
        }

        const erBpm = document.getElementById('erBpm');
        if (erBpm) erBpm.textContent = data.ambulance.vitals.bpm;

        document.getElementById('vitalHeartRate').textContent = data.ambulance.vitals.bpm;
      },
      onRouteChange: (data) => {
        renderIncomingList();
        renderPeerList();
      },
      onPeerAlertTrigger: (peer) => {
        renderPeerList();
      }
    });
  }

  startLiveSimulation();

  // Controls
  document.getElementById('simStartBtn').addEventListener('click', () => {
    startLiveSimulation();
  });

  document.getElementById('simPauseBtn').addEventListener('click', () => {
    SimulationEngine.pause();
    toggleSirenSound(false);
  });

  document.getElementById('simTrafficJamBtn').addEventListener('click', () => {
    MapEngine.addTrafficJamCircle(11.9400, 79.4860);
    playAlertChime();
    document.getElementById('tickerText').textContent = `⚠️ Heavy highway congestion reported on ${primaryAmb.origin} ➔ ${primaryAmb.targetDistrict} route! Convoy Escort clearing path.`;
  });

  document.getElementById('simPeerEscortBtn').addEventListener('click', () => {
    SimulationEngine.acceptPeerEscort('TN-07-PA-4421');
    peerRequestBox.style.display = 'none';
    patrolStatusBox.style.display = 'flex';
    renderPeerList();
    playAlertChime();
  });
});
