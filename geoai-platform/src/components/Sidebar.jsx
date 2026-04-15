import React from 'react';
import { VILLAGES } from '../engine/pipelineEngine';

const LAYERS = [
  { id: 'dtm',       label: 'DTM Elevation Layer',     color: '#2563eb' },
  { id: 'streams',   label: 'Hydrological Flow Paths', color: '#0ea5e9' },
  { id: 'flood',     label: 'Flood Risk Hotspots',     color: '#dc2626' },
  { id: 'drainage',  label: 'Optimised Drain Network', color: '#0d9488' },
  { id: 'watershed', label: 'Micro-Watersheds',        color: '#7c3aed' },
];

function getRiskClass(r) {
  if (r >= 7) return 'risk-high';
  if (r >= 5) return 'risk-med';
  return 'risk-low';
}

export default function Sidebar({
  activeVillage, setActiveVillage,
  layers, toggleLayer,
  rainfall, setRainfall,
  onRunPipeline, isRunning,
  onExport, onDemoTour,
  pipelineDone,
}) {
  return (
    <aside className="app-sidebar">

      {/* ── Village Selection ── */}
      <div className="sidebar-section">
        <div className="sidebar-label">Project Villages</div>
        {VILLAGES.map(v => (
          <div
            key={v.id}
            className={`village-card ${activeVillage.id === v.id ? 'active' : ''}`}
            onClick={() => setActiveVillage(v)}
          >
            <div className="village-dot" style={{ background: v.color }} />
            <div className="village-info">
              <div className="village-name">{v.name}</div>
              <div className="village-state">{v.state} &nbsp;·&nbsp; {v.district}</div>
            </div>
            <div
              className={`village-risk ${getRiskClass(v.riskIndex)}`}
              title="Village Drainage Risk Index (0–10)"
            >
              {v.riskIndex}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 6, fontSize: '0.6rem', color: 'var(--text-400)', fontWeight: 600, paddingLeft: 2 }}>
          SVAMITVA LiDAR Coverage — 5 Villages
        </div>
      </div>

      {/* ── Rainfall Scenario ── */}
      <div className="sidebar-section">
        <div className="sidebar-label">Climate Simulation</div>
        <div className="rainfall-control">
          <div className="slider-header">
            <span className="slider-label">Rainfall Intensity</span>
            <span className="slider-value">{rainfall} mm/hr</span>
          </div>
          <input
            type="range" min={10} max={300} step={5}
            value={rainfall}
            onChange={e => setRainfall(Number(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: 'var(--text-400)', marginTop: 4, fontWeight: 600 }}>
            <span>Light (10)</span><span>Extreme (300)</span>
          </div>
          <div className="rainfall-presets">
            {[50, 100, 200].map(p => (
              <button
                key={p}
                className={`preset-btn ${rainfall === p ? 'active' : ''}`}
                onClick={() => setRainfall(p)}
              >
                {p} mm
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── GIS Layers ── */}
      <div className="sidebar-section">
        <div className="sidebar-label">GIS Layer Controls</div>
        {LAYERS.map(l => (
          <div key={l.id} className="layer-toggle" onClick={() => toggleLayer(l.id)}>
            <div className={`toggle-switch ${layers[l.id] ? 'on' : ''}`} />
            <div className="layer-label">{l.label}</div>
            <div className="layer-color" style={{ background: l.color, opacity: layers[l.id] ? 1 : 0.3 }} />
          </div>
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="sidebar-section">
        <div className="sidebar-label">Pipeline Controls</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <button
            className="btn btn-primary"
            onClick={onRunPipeline}
            disabled={isRunning}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isRunning ? '⟳  Processing Pipeline…' : '▶  Run Full Pipeline (M1–M7)'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={onDemoTour}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            🎬  Start 5-Min Demo Tour
          </button>
          {pipelineDone && (
            <button
              className="btn btn-secondary"
              onClick={onExport}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              ⬇  Export GIS Bundle (.geojson)
            </button>
          )}
        </div>
      </div>

      {/* ── Village Profile ── */}
      <div className="sidebar-section" style={{ flex: 1, overflow: 'auto' }}>
        <div className="sidebar-label">Village Profile</div>

        <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-med)', borderRadius: 'var(--r-sm)', padding: '10px', marginBottom: 10 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-900)', marginBottom: 8 }}>
            {activeVillage.name}, {activeVillage.state}
          </div>
          {[
            ['Population',      activeVillage.population.toLocaleString() + ' persons'],
            ['Area',            activeVillage.area + ' km²'],
            ['LiDAR Points',    activeVillage.lidarPoints.toLocaleString()],
            ['Base Elevation',  activeVillage.elevation_base + ' m above MSL'],
            ['District',        activeVillage.district],
          ].map(([k, v]) => (
            <div className="metric-row" key={k}>
              <span className="metric-key">{k}</span>
              <span className="metric-val" style={{ fontSize: '0.68rem' }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{
          fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-700)',
          lineHeight: 1.65, padding: '8px 10px',
          background: 'rgba(245,158,11,0.07)',
          borderRadius: 'var(--r-sm)',
          borderLeft: '3px solid var(--amber-600)',
        }}>
          <strong style={{ color: 'var(--amber-800)', textTransform: 'uppercase', fontSize: '0.58rem', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
            Key Challenge
          </strong>
          {activeVillage.issue}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid var(--border-med)',
        background: 'var(--surface-raised)',
      }}>
        <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Powered By
        </div>
        <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--gov-blue-800)' }}>
          Geo-Intel Lab · IITTNiF
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-400)', fontWeight: 500 }}>
          Ministry of Panchayati Raj — SVAMITVA Initiative
        </div>
      </div>
    </aside>
  );
}
