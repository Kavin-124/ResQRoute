/* ==========================================================================
   ResQRoute Leaflet Map Engine (Inter-District Highway Corridor Edition)
   ========================================================================== */

const MapEngine = (function () {
  let map = null;
  let activePolyline = null;
  let markers = {
    ambulances: {},
    hospitals: {},
    jams: []
  };

  const defaultCenter = [11.1271, 78.6569];

  function initMap(containerId) {
    map = L.map(containerId, {
      zoomControl: true,
      attributionControl: false
    }).setView(defaultCenter, 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors | ResQRoute Tamil Nadu EMS Network'
    }).addTo(map);

    return map;
  }

  function createCustomIcon(className, iconFaClass) {
    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `<div class="marker-wrapper ${className}"><i class="${iconFaClass}"></i></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });
  }

  function addAmbulanceMarker(id, lat, lng, type, label) {
    const iconClass = type === 'active' ? 'marker-active-amb' : 'marker-peer-amb';
    const faIcon = type === 'active' ? 'fa-solid fa-truck-medical' : 'fa-solid fa-shield-halved';
    const icon = createCustomIcon(iconClass, faIcon);

    const marker = L.marker([lat, lng], { icon: icon }).addTo(map);
    marker.bindPopup(`
      <div style="color:#0f172a; font-family:sans-serif; font-weight:bold;">
        <h4>${label}</h4>
        <p style="margin:4px 0 0 0; font-size:0.8rem; color:#475569;">
          ${type === 'active' ? '🚨 Main Emergency Transport (TN-01-AX-1080)' : '🛡️ Synchronized Convoy Escort (TN-07-PA-4421)'}
        </p>
      </div>
    `);

    markers.ambulances[id] = marker;
    return marker;
  }

  function updateAmbulancePos(id, lat, lng) {
    if (markers.ambulances[id]) {
      markers.ambulances[id].setLatLng([lat, lng]);
    }
  }

  function addHospitalMarker(id, lat, lng, name) {
    if (markers.hospitals[id]) {
      map.removeLayer(markers.hospitals[id]);
    }
    const icon = createCustomIcon('marker-hospital', 'fa-solid fa-hospital');
    const marker = L.marker([lat, lng], { icon: icon }).addTo(map);
    marker.bindPopup(`
      <div style="color:#0f172a; font-family:sans-serif;">
        <h4>🏥 ${name}</h4>
        <p style="margin-top:4px; font-size:0.8rem; color:#6b21a8;">Emergency Trauma Center Ready</p>
      </div>
    `).openPopup();

    markers.hospitals[id] = marker;
    return marker;
  }

  function drawRoute(coords, isEmergency = true) {
    if (activePolyline) {
      map.removeLayer(activePolyline);
    }

    const color = isEmergency ? '#ff3b30' : '#00b0ff';
    activePolyline = L.polyline(coords, {
      color: color,
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    map.fitBounds(activePolyline.getBounds(), { padding: [60, 60] });
  }

  function addTrafficJamCircle(lat, lng) {
    const circle = L.circle([lat, lng], {
      color: '#ff3b30',
      fillColor: '#ff3b30',
      fillOpacity: 0.35,
      radius: 500
    }).addTo(map);
    circle.bindPopup('<strong style="color:#d32f2f;">HIGHWAY BOTTLENECK / CONGESTION ALERT</strong>');
    markers.jams.push(circle);
    return circle;
  }

  return {
    initMap,
    addAmbulanceMarker,
    updateAmbulancePos,
    addHospitalMarker,
    drawRoute,
    addTrafficJamCircle
  };
})();
