/* ==========================================================================
   ResQRoute Leaflet Map Engine
   Supports Satellite Map Imagery, Color-Differentiated Live Traffic Segments,
   and Dynamic Route Recalculation Rendering.
   ========================================================================== */

const MapEngine = (function () {
  let map = null;
  let activeTileLayer = null;
  let polylineSegments = [];
  let currentMapStyle = 'radar';

  let markers = {
    ambulances: {},
    hospitals: {},
    jams: []
  };

  const defaultCenter = [11.1271, 78.6569];

  const tileLayers = {
    radar: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  function initMap(containerId) {
    map = L.map(containerId, {
      zoomControl: true,
      attributionControl: false
    }).setView(defaultCenter, 8);

    activeTileLayer = L.tileLayer(tileLayers.radar, {
      maxZoom: 19,
      attribution: '© OpenStreetMap | Esri Satellite | ResQRoute TN EMS'
    }).addTo(map);

    return map;
  }

  function setMapStyle(style) {
    if (currentMapStyle === style) return;
    currentMapStyle = style;

    if (activeTileLayer) {
      map.removeLayer(activeTileLayer);
    }

    const tileUrl = tileLayers[style] || tileLayers.radar;
    const tileContainer = document.getElementById('map');

    if (style === 'satellite') {
      tileContainer.classList.add('satellite-mode');
    } else {
      tileContainer.classList.remove('satellite-mode');
    }

    activeTileLayer = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);
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

  function drawSegmentedTrafficRoute(waypoints, segments) {
    polylineSegments.forEach(layer => map.removeLayer(layer));
    polylineSegments = [];

    if (!segments || segments.length === 0) {
      const line = L.polyline(waypoints, { color: '#00e676', weight: 6, opacity: 0.9 }).addTo(map);
      polylineSegments.push(line);
      map.fitBounds(line.getBounds(), { padding: [60, 60] });
      return;
    }

    const boundsGroup = L.featureGroup();

    segments.forEach(seg => {
      const segCoords = waypoints.slice(seg.fromIdx, seg.toIdx + 1);
      if (segCoords.length >= 2) {
        const polyline = L.polyline(segCoords, {
          color: seg.color || '#00e676',
          weight: 7,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        polyline.bindPopup(`
          <div style="color:#0f172a; font-weight:bold; font-family:sans-serif;">
            <span style="color:${seg.color}">● LIVE TRAFFIC STATUS</span><br/>
            ${seg.label}
          </div>
        `);

        polylineSegments.push(polyline);
        boundsGroup.addLayer(polyline);
      }
    });

    if (boundsGroup.getLayers().length > 0) {
      map.fitBounds(boundsGroup.getBounds(), { padding: [60, 60] });
    }
  }

  function addTrafficJamCircle(lat, lng) {
    const circle = L.circle([lat, lng], {
      color: '#ff3b30',
      fillColor: '#ff3b30',
      fillOpacity: 0.35,
      radius: 500
    }).addTo(map);
    circle.bindPopup('<strong style="color:#d32f2f;">HEAVY TRAFFIC BOTTLENECK ALERT</strong>');
    markers.jams.push(circle);
    return circle;
  }

  return {
    initMap,
    setMapStyle,
    addAmbulanceMarker,
    updateAmbulancePos,
    addHospitalMarker,
    drawSegmentedTrafficRoute,
    addTrafficJamCircle
  };
})();
