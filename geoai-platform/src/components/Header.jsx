import React from 'react';

const MODULES = [
  { id: 'M1', label: 'Ingestion'  },
  { id: 'M2', label: 'AI Classify'},
  { id: 'M3', label: 'DTM Gen'    },
  { id: 'M4', label: 'Hydrology'  },
  { id: 'M5', label: 'Flood ML'   },
  { id: 'M6', label: 'Drain Opt'  },
  { id: 'M7', label: 'GIS Export' },
];

function getStatus(pipelineStep, idx) {
  if (!pipelineStep) return 'idle';
  if (pipelineStep > idx + 1) return 'complete';
  if (pipelineStep === idx + 1) return 'running';
  return 'idle';
}

export default function Header({
  pipelineStep, village, rainfall,
  isRunning, compareMode, setCompareMode,
}) {
  return (
    <header className="app-header">

      {/* Logo / Branding */}
      <div className="header-logo">
        <img src="/logo.png" alt="GeoAI Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', flexShrink: 0, borderRadius: 'var(--r-sm)' }} />
        <div>
          <div className="logo-text">
            Geo<span>AI</span> Drainage Intelligence
          </div>
          <div className="logo-subtitle">
            Ministry of Panchayati Raj · SVAMITVA Programme
          </div>
        </div>
      </div>

      <div className="header-divider" />

      {/* Pipeline Progress */}
      <div className="header-pipeline">
        {MODULES.map((m, i) => (
          <div key={m.id} className="pipeline-step">
            <div className={`pipe-node ${getStatus(pipelineStep, i)}`}>
              <div className="pipe-dot" />
              {m.id} · {m.label}
            </div>
            {i < MODULES.length - 1 && (
              <span className="pipe-arrow">›</span>
            )}
          </div>
        ))}
      </div>

      {/* Right badges */}
      <div className="header-actions">
        {rainfall > 0 && (
          <div className="badge badge-blue">
            🌧 {rainfall} mm Scenario
          </div>
        )}
        {isRunning && (
          <div className="badge badge-amber">⟳ Processing</div>
        )}
        {pipelineStep > 7 && (
          <div className="badge badge-green">✓ Analysis Complete</div>
        )}
        <button
          className="btn btn-ghost"
          style={{ padding: '4px 10px', fontSize: '0.66rem' }}
          onClick={() => setCompareMode(v => !v)}
        >
          {compareMode ? '🗺 Map View' : '↔ Before / After'}
        </button>
        <div
          className="badge badge-indigo"
          title="Geo-Intel Lab, IIT Tirupati NIF"
          style={{ cursor: 'default' }}
        >
          IITTNiF · v1.0
        </div>
      </div>
    </header>
  );
}
