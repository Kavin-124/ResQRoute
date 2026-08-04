/* ==========================================================================
   ResQRoute Main Application Controller
   Supports All 38 Districts of Tamil Nadu, Satellite Map Toggle,
   Color-Differentiated Live Traffic, and Dynamic Rerouting Engine.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
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

  const toggleSoundBtn = document.getElementById('toggleSoundBtn');
  const soundStatus = document.getElementById('soundStatus');
  toggleSoundBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundStatus.textContent = isSoundEnabled ? 'Audio ON' : 'Audio OFF';
    toggleSoundBtn.querySelector('i').className = isSoundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    if (!isSoundEnabled) toggleSirenSound(false);
  });

  setInterval(() => {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toTimeString().split(' ')[0];
  }, 1000);

  MapEngine.initMap('map');

  const radarModeBtn = document.getElementById('radarModeBtn');
  const satModeBtn = document.getElementById('satModeBtn');

  if (radarModeBtn && satModeBtn) {
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
  }

  const primaryAmb = SimulationEngine.primaryAmbulance;
  const peerAmbs = SimulationEngine.peerAmbulances;

  let hospMarker = MapEngine.addHospitalMarker('hosp-1', 11.0420, 77.0380, primaryAmb.destination);
  MapEngine.addAmbulanceMarker(primaryAmb.id, primaryAmb.lat, primaryAmb.lng, 'active', `${primaryAmb.id} (Main Transport)`);
  peerAmbs.forEach(peer => {
    MapEngine.addAmbulanceMarker(peer.id, peer.lat, peer.lng, 'peer', `${peer.id} (${peer.driver.split(' ')[1]})`);
  });

  MapEngine.drawSegmentedTrafficRoute(SimulationEngine.activeWaypoints, SimulationEngine.activeTrafficSegments);

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

  const originDistrictSelect = document.getElementById('originDistrictSelect');
  const targetDistrictSelect = document.getElementById('targetDistrictSelect');
  const hospitalPresetSelect = document.getElementById('hospitalPresetSelect');
  const customHospGroup = document.getElementById('customHospGroup');
  const customHospInput = document.getElementById('customHospInput');
  const deliverHospBtn = document.getElementById('deliverHospBtn');

  function initDistrictDropdowns() {
    const allDistricts = Object.keys(SimulationEngine.districtCenters).sort();

    if (originDistrictSelect) {
      originDistrictSelect.innerHTML = '';
      allDistricts.forEach(dist => {
        const opt = document.createElement('option');
        opt.value = dist;
        opt.textContent = dist;
        if (dist === 'Karur') opt.selected = true;
        originDistrictSelect.appendChild(opt);
      });
    }

    if (targetDistrictSelect) {
      targetDistrictSelect.innerHTML = '';
      allDistricts.forEach(dist => {
        const opt = document.createElement('option');
        opt.value = dist;
        opt.textContent = `${dist} District`;
        if (dist === 'Coimbatore') opt.selected = true;
        targetDistrictSelect.appendChild(opt);
      });
    }
  }

  initDistrictDropdowns();

  function populateHospitalsForDistrict(rawDistrict) {
    if (!hospitalPresetSelect) return;
    const district = SimulationEngine.cleanDistrictName(rawDistrict);
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

  if (targetDistrictSelect) {
    populateHospitalsForDistrict(targetDistrictSelect.value);

    targetDistrictSelect.addEventListener('change', () => {
      populateHospitalsForDistrict(targetDistrictSelect.value);
    });
  }

  if (hospitalPresetSelect) {
    hospitalPresetSelect.addEventListener('change', () => {
      if (hospitalPresetSelect.value === 'CUSTOM') {
        if (customHospGroup) customHospGroup.style.display = 'flex';
      } else {
        if (customHospGroup) customHospGroup.style.display = 'none';
      }
    });
  }

  if (deliverHospBtn) {
    deliverHospBtn.addEventListener('click', () => {
      const origin = originDistrictSelect.value;
      const targetDistrict = SimulationEngine.cleanDistrictName(targetDistrictSelect.value);
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

      // Instantly relocate markers to new origin & destination
      MapEngine.updateAmbulancePos(primaryAmb.id, primaryAmb.lat, primaryAmb.lng);
      peerAmbs.forEach(peer => {
        MapEngine.updateAmbulancePos(peer.id, peer.lat, peer.lng);
      });

      MapEngine.addHospitalMarker('hosp-1', targetLat, targetLng, chosenHospital);
      MapEngine.drawSegmentedTrafficRoute(SimulationEngine.activeWaypoints, SimulationEngine.activeTrafficSegments);

      playAlertChime();
      document.getElementById('tickerText').textContent = `📍 ROUTE RECALCULATED: ${origin} to ${targetDistrict} (${SimulationEngine.primaryAmbulance.distanceRemaining} km). Hospital: "${chosenHospital}". Live GPS overlay updated!`;
      alert(`📍 Emergency Route Recalculated for ${origin} ➔ ${targetDistrict}!\n\nDistance: ${SimulationEngine.primaryAmbulance.distanceRemaining} km\nTarget Hospital: ${chosenHospital}\n\nBroadcasted to Lead Convoy Escort TN-07-PA-4421 & Hospital ER!`);
    });
  }

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

  const triggerSosBtn = document.getElementById('triggerSosBtn');
  if (triggerSosBtn) {
    triggerSosBtn.addEventListener('click', () => {
      SimulationEngine.triggerCodeRedSOS();
      toggleSirenSound(true);
      playAlertChime();

      document.getElementById('tickerText').textContent = `🚨 CODE RED ACTIVE! Main Ambulance TN-01-AX-1080 & Convoy Escort TN-07-PA-4421 in Lead Convoy on ${primaryAmb.origin} ➔ ${primaryAmb.targetDistrict} Highway.`;
      renderPeerList();
    });
  }

  const acceptPatrolBtn = document.getElementById('acceptPatrolBtn');
  const peerRequestBox = document.getElementById('peerRequestBox');
  const patrolStatusBox = document.getElementById('patrolStatusBox');

  if (acceptPatrolBtn) {
    acceptPatrolBtn.addEventListener('click', () => {
      SimulationEngine.acceptPeerEscort('TN-07-PA-4421');
      if (peerRequestBox) peerRequestBox.style.display = 'none';
      if (patrolStatusBox) patrolStatusBox.style.display = 'flex';
      const badge = document.getElementById('peerAlertBadge');
      if (badge) badge.style.display = 'none';
      playAlertChime();
      renderPeerList();
    });
  }

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

  if (updateVitalsBtn) {
    updateVitalsBtn.addEventListener('click', () => {
      SimulationEngine.updatePatientVitals({}, selectedSeverity);
      renderIncomingList();
      playAlertChime();
      alert(`Patient Vitals for TN-01-AX-1080 transmitted to ${primaryAmb.destination}!`);
    });
  }

  function startLiveSimulation() {
    SimulationEngine.start({
      onTick: (data) => {
        MapEngine.updateAmbulancePos(data.ambulance.id, data.ambulance.lat, data.ambulance.lng);
        
        data.peers.forEach(peer => {
          MapEngine.updateAmbulancePos(peer.id, peer.lat, peer.lng);
        });

        const gpsDisplay = document.getElementById('liveGpsCoords');
        if (gpsDisplay) {
          gpsDisplay.textContent = `${data.ambulance.lat.toFixed(4)}° N, ${data.ambulance.lng.toFixed(4)}° E`;
        }

        const speedEl = document.getElementById('currentSpeed');
        if (speedEl) speedEl.textContent = `${data.ambulance.speed} km/h`;

        const distEl = document.getElementById('distRemaining');
        if (distEl) distEl.textContent = `${data.ambulance.distanceRemaining} km`;
        
        const mins = Math.floor(data.ambulance.etaSeconds / 60);
        const hrs = Math.floor(mins / 60);
        const remMins = mins % 60;
        const etaFormatted = hrs > 0 ? `${hrs}h ${remMins}m` : `${mins}m ${data.ambulance.etaSeconds % 60}s`;

        const etaEl = document.getElementById('etaMinutes');
        if (etaEl) etaEl.textContent = etaFormatted;
        
        const erEtaDisplay = document.getElementById('erEtaDisplay');
        if (erEtaDisplay) erEtaDisplay.textContent = etaFormatted;

        const erBpm = document.getElementById('erBpm');
        if (erBpm) erBpm.textContent = data.ambulance.vitals.bpm;

        const heartEl = document.getElementById('vitalHeartRate');
        if (heartEl) heartEl.textContent = data.ambulance.vitals.bpm;
      },
      onRouteChange: (data) => {
        MapEngine.updateAmbulancePos(data.ambulance.id, data.ambulance.lat, data.ambulance.lng);
        MapEngine.drawSegmentedTrafficRoute(data.waypoints, data.trafficSegments);
        renderIncomingList();
        renderPeerList();
      },
      onPeerAlertTrigger: (peer) => {
        renderPeerList();
      }
    });
  }

  startLiveSimulation();

  const simStartBtn = document.getElementById('simStartBtn');
  if (simStartBtn) simStartBtn.addEventListener('click', () => startLiveSimulation());

  const simPauseBtn = document.getElementById('simPauseBtn');
  if (simPauseBtn) {
    simPauseBtn.addEventListener('click', () => {
      SimulationEngine.pause();
      toggleSirenSound(false);
    });
  }

  const simTrafficJamBtn = document.getElementById('simTrafficJamBtn');
  if (simTrafficJamBtn) {
    simTrafficJamBtn.addEventListener('click', () => {
      MapEngine.addTrafficJamCircle(11.9400, 79.4860);
      playAlertChime();
      document.getElementById('tickerText').textContent = `⚠️ Heavy highway congestion reported on ${primaryAmb.origin} ➔ ${primaryAmb.targetDistrict} route! Convoy Escort clearing path.`;
    });
  }

  const simPeerEscortBtn = document.getElementById('simPeerEscortBtn');
  if (simPeerEscortBtn) {
    simPeerEscortBtn.addEventListener('click', () => {
      SimulationEngine.acceptPeerEscort('TN-07-PA-4421');
      if (peerRequestBox) peerRequestBox.style.display = 'none';
      if (patrolStatusBox) patrolStatusBox.style.display = 'flex';
      renderPeerList();
      playAlertChime();
    });
  }
});
