import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ── Colour helpers ──────────────────────────────────────────── */
function elevToColor(norm) {
  // low (blue) → mid (teal) → high (amber-green)
  if (norm < 0.33) {
    const t = norm / 0.33;
    return `rgba(${Math.round(40 + t*40)},${Math.round(80+t*100)},${Math.round(200-t*30)},0.55)`;
  } else if (norm < 0.66) {
    const t = (norm - 0.33) / 0.33;
    return `rgba(${Math.round(80+t*80)},${Math.round(180-t*20)},${Math.round(170-t*100)},0.55)`;
  } else {
    const t = (norm - 0.66) / 0.34;
    return `rgba(${Math.round(160+t*80)},${Math.round(160+t*30)},${Math.round(70-t*50)},0.5)`;
  }
}

function riskToColor(risk) {
  if (risk < 0.40) return { fill:'rgba(34,197,94,0.65)',   stroke:'rgba(34,197,94,0.9)' };
  if (risk < 0.60) return { fill:'rgba(251,191,36,0.65)',  stroke:'rgba(251,191,36,0.9)' };
  if (risk < 0.75) return { fill:'rgba(249,115,22,0.70)',  stroke:'rgba(249,115,22,0.9)' };
  return               { fill:'rgba(239,68,68,0.72)',   stroke:'rgba(239,68,68,0.95)' };
}

export default function MapView({ village, results, layers, rainfall, compareMode, onHotspotClick }) {
  const containerRef    = useRef(null);   // outer wrapper div
  const mapDivRef       = useRef(null);   // actual leaflet target
  const mapRef          = useRef(null);   // leaflet map instance
  const layerGroupsRef  = useRef({});

  /* ── 1. Initialize map ONCE ────────────────────────────────── */
  useEffect(() => {
    if (mapRef.current || !mapDivRef.current) return;

    const map = L.map(mapDivRef.current, {
      center:      [village.lat, village.lng],
      zoom:        14,
      zoomControl: false,
      preferCanvas: true,           // faster for many shapes
    });

    // Light Carto tile layer — loads reliably without auth
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '© OpenStreetMap © CARTO',
        subdomains:  'abcd',
        maxZoom:     19,
      }
    ).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer groups
    const groups = {};
    ['dtm','streams','flood','drainage','watershed'].forEach(id => {
      groups[id] = L.layerGroup().addTo(map);
    });
    layerGroupsRef.current = groups;
    mapRef.current         = map;

    // CRITICAL: call invalidateSize after mount so Leaflet
    // recalculates dimensions (fixes the grey/blank map bug)
    setTimeout(() => map.invalidateSize(), 100);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 2. Handle container resize ────────────────────────────── */
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      mapRef.current?.invalidateSize();
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  /* ── 3. Re-center on village change ───────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([village.lat, village.lng], 14, { animate: true, duration: 0.8 });
    Object.values(layerGroupsRef.current).forEach(g => g.clearLayers());
  }, [village]);

  /* ── 4. Render GIS layers ──────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !results?.m3) return;
    const groups = layerGroupsRef.current;
    const { m3, m4, m5, m6 } = results;
    const { grid, rows, cols, minElev, maxElev } = m3;

    // Helper: grid (r,c) → geographic bounds
    const SPAN_LAT = 0.018, SPAN_LNG = 0.022;
    const cellBounds = (r, c) => ({
      lat: village.lat + SPAN_LAT / 2 - (r / rows) * SPAN_LAT,
      lng: village.lng - SPAN_LNG / 2 + (c / cols) * SPAN_LNG,
    });

    /* — DTM elevation rectangles — */
    groups.dtm.clearLayers();
    const STEP = 3;
    for (let r = 0; r < rows; r += STEP) {
      for (let c = 0; c < cols; c += STEP) {
        const norm   = (grid[r][c] - minElev) / (maxElev - minElev);
        const p1     = cellBounds(r, c);
        const p2     = cellBounds(r + STEP, c + STEP);
        L.rectangle([[p1.lat, p1.lng],[p2.lat, p2.lng]], {
          color:       'transparent',
          fillColor:   elevToColor(norm),
          fillOpacity: 1,
          weight:      0,
          interactive: false,
        }).addTo(groups.dtm);
      }
    }

    /* — Stream polylines — */
    groups.streams.clearLayers();
    if (m4?.streams?.length > 2) {
      const allPts = m4.streams.map(([r,c]) => {
        const p = cellBounds(r, c);
        return [p.lat, p.lng];
      });
      // Draw in segments for a river-network feel
      for (let i = 0; i < allPts.length - 3; i += 4) {
        L.polyline(allPts.slice(i, i + 5), {
          color:   '#0ea5e9',
          weight:  2.5,
          opacity: 0.75,
          lineJoin: 'round',
        }).addTo(groups.streams);
      }
      // Main trunk
      L.polyline(allPts.slice(0, 80), {
        color:   '#06b6d4',
        weight:  3.5,
        opacity: 0.6,
        dashArray: '6,4',
      }).addTo(groups.streams);
    }

    /* — Micro-watershed polygons — */
    groups.watershed.clearLayers();
    if (m4?.depressions) {
      m4.depressions.slice(0, 6).forEach((dep, i) => {
        const center = cellBounds(dep.r, dep.c);
        const R = 0.003 + dep.depth * 0.0001;
        const pts = Array.from({ length: 10 }, (_, k) => {
          const angle = (k / 10) * Math.PI * 2;
          return [center.lat + Math.sin(angle)*R, center.lng + Math.cos(angle)*R*1.35];
        });
        L.polygon(pts, {
          color:       '#8b5cf6',
          weight:      1.5,
          fillColor:   '#8b5cf6',
          fillOpacity: 0.10,
          dashArray:   '4,3',
        }).bindTooltip(`Micro-Watershed ${i+1}`, {
          className: 'hotspot-popup-body',
          sticky: true,
        }).addTo(groups.watershed);
      });
    }

    /* — Flood hotspot circles — */
    groups.flood.clearLayers();
    if (m5?.hotspots) {
      m5.hotspots.forEach((hs, i) => {
        const p      = cellBounds(hs.r, hs.c);
        const colors = riskToColor(hs.risk);
        const radius = 7 + hs.risk * 12;

        // Outer glow ring
        L.circleMarker([p.lat, p.lng], {
          radius:      radius + 6,
          color:       colors.stroke,
          weight:      1,
          fillColor:   colors.fill,
          fillOpacity: 0.18,
          interactive: false,
        }).addTo(groups.flood);

        // Main hotspot
        const circle = L.circleMarker([p.lat, p.lng], {
          radius,
          color:       colors.stroke,
          weight:      1.8,
          fillColor:   colors.fill,
          fillOpacity: 0.78,
        });

        circle.bindPopup(`
          <div class="hotspot-popup-title">⚠ Flood Hotspot #${i+1}</div>
          <div class="hotspot-popup-body">
            Risk Score: <strong style="color:#dc2626">${(hs.risk*10).toFixed(1)}/10</strong><br>
            Elevation: ${hs.elev?.toFixed(2)} m<br>
            Flow Accumulation: ${hs.flowAcc?.toFixed(0)} cells<br>
            Scenario: ${rainfall}mm rainfall
          </div>
          <div class="hotspot-popup-btn">🔍 View SHAP Analysis</div>
        `, { maxWidth: 220 });

        circle.on('click', () => onHotspotClick({ ...hs, lat: p.lat, lng: p.lng, index: i }));
        circle.addTo(groups.flood);
      });
    }

    /* — Optimized drainage network — */
    groups.drainage.clearLayers();
    if (m6?.drainageNetwork) {
      m6.drainageNetwork.forEach((dn, i) => {
        const pts = dn.path.map(({ r, c }) => {
          const p = cellBounds(r, c);
          return [p.lat, p.lng];
        });
        if (pts.length < 2) return;

        // Glow shadow
        L.polyline(pts, { color:'#0d9488', weight:7, opacity:0.18 }).addTo(groups.drainage);
        // Main drain line
        L.polyline(pts, {
          color:    '#14b8a6',
          weight:   3,
          opacity:  0.95,
          lineJoin: 'round',
        }).bindTooltip(
          `Drain ${i+1} · ${dn.excavationVolume}m³ · ₹${(parseInt(dn.costEstimate)/1000).toFixed(0)}K`,
          { sticky: true }
        ).addTo(groups.drainage);

        // Source culvert dot
        L.circleMarker([pts[0][0], pts[0][1]], {
          radius:4, color:'#14b8a6', fillColor:'#0d9488', fillOpacity:1, weight:2,
        }).addTo(groups.drainage);
      });

      // Outlet label
      const op = cellBounds(rows-1, Math.floor(cols/2));
      L.marker([op.lat, op.lng], {
        icon: L.divIcon({
          html: `<div style="background:rgba(20,184,166,0.9);color:white;font-size:10px;font-weight:700;
                 padding:2px 8px;border-radius:4px;white-space:nowrap;
                 box-shadow:0 2px 8px rgba(20,184,166,0.4);">OUTLET ▼</div>`,
          className: '',
          iconAnchor: [28,10],
        }),
      }).addTo(groups.drainage);
    }

    // Force a size recalc after drawing
    setTimeout(() => map.invalidateSize(), 50);
  }, [results, village, rainfall]);

  /* ── 5. Toggle layer visibility ────────────────────────────── */
  useEffect(() => {
    const map    = mapRef.current;
    const groups = layerGroupsRef.current;
    if (!map) return;
    Object.entries(layers).forEach(([id, on]) => {
      if (!groups[id]) return;
      if (on && !map.hasLayer(groups[id])) map.addLayer(groups[id]);
      if (!on && map.hasLayer(groups[id]))  map.removeLayer(groups[id]);
    });
  }, [layers]);

  /* ── 6. Fit bounds to village area on run complete ─────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !results?.m3) return;
    const { lat, lng } = village;
    const SPAN_LAT = 0.018, SPAN_LNG = 0.022;
    map.fitBounds([
      [lat + SPAN_LAT/2, lng - SPAN_LNG/2],
      [lat - SPAN_LAT/2, lng + SPAN_LNG/2],
    ], { padding: [20, 20], animate: true, duration: 0.8 });
  }, [results]);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div ref={containerRef} className="app-map">

      {/* THE ACTUAL LEAFLET DIV — must be position:absolute with inset:0 */}
      <div
        ref={mapDivRef}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1,
        }}
      />

      {/* Empty state shown before pipeline runs */}
      {!results?.m3 && (
        <div className="map-empty-state">
          <div className="map-empty-icon">🛰️</div>
          <div className="map-empty-text">Select a village and run the pipeline to display GIS layers</div>
        </div>
      )}

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-title">Legend</div>
        {results?.m3 ? (
          <>
            {layers.dtm && (
              <div className="legend-item">
                <div className="legend-swatch" style={{ background:'linear-gradient(90deg,#3b82f6,#14b8a6,#d97706)' }} />
                <span className="legend-label">DTM Elevation</span>
              </div>
            )}
            {layers.streams && (
              <div className="legend-item">
                <div className="legend-swatch" style={{ background:'#0ea5e9' }} />
                <span className="legend-label">Flow Streams</span>
              </div>
            )}
            {layers.flood && (
              <div className="legend-item">
                <div className="legend-swatch" style={{ background:'#ef4444' }} />
                <span className="legend-label">Flood Hotspots</span>
              </div>
            )}
            {layers.drainage && (
              <div className="legend-item">
                <div className="legend-swatch" style={{ background:'#14b8a6' }} />
                <span className="legend-label">Drainage Network</span>
              </div>
            )}
            {layers.watershed && (
              <div className="legend-item">
                <div className="legend-swatch" style={{ background:'#8b5cf6' }} />
                <span className="legend-label">Micro-watersheds</span>
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize:'0.66rem', color:'var(--text-muted)', lineHeight:1.5 }}>
            Run pipeline to<br/>display layers
          </div>
        )}
      </div>

      {/* Bottom stats bar */}
      {results?.m6 && (
        <div className="map-info-bar">
          <div className="map-stat">
            <div className="map-stat-val" style={{ color:'#dc2626' }}>{results.m5?.hotspots?.length ?? 0}</div>
            <div className="map-stat-label">Hotspots</div>
          </div>
          <div className="map-divider" />
          <div className="map-stat">
            <div className="map-stat-val" style={{ color:'#0d9488' }}>{results.m6?.drainageNetwork?.length ?? 0}</div>
            <div className="map-stat-label">Drain Routes</div>
          </div>
          <div className="map-divider" />
          <div className="map-stat">
            <div className="map-stat-val" style={{ color:'#16a34a' }}>{results.m6?.metrics?.floodReduction}</div>
            <div className="map-stat-label">Flood ↓</div>
          </div>
          <div className="map-divider" />
          <div className="map-stat">
            <div className="map-stat-val" style={{ color:'#d97706' }}>{results.m6?.metrics?.costEstimate}</div>
            <div className="map-stat-label">Est. Cost</div>
          </div>
          <div className="map-divider" />
          <div className="map-stat">
            <div className="map-stat-val">{rainfall}mm</div>
            <div className="map-stat-label">Scenario</div>
          </div>
        </div>
      )}

      {/* Before / After compare overlay */}
      {compareMode && (
        <div style={{ position:'absolute', inset:0, zIndex:450, pointerEvents:'none', display:'flex' }}>
          <div className="compare-before" style={{ flex:1, position:'relative' }}>
            <div className="compare-label-base compare-label-before">BEFORE DRAINAGE</div>
          </div>
          <div className="compare-after" style={{ flex:1, position:'relative' }}>
            <div className="compare-label-base compare-label-after">AFTER DRAINAGE</div>
          </div>
        </div>
      )}
    </div>
  );
}
