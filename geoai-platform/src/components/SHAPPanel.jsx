import React from 'react';

const SHAP_COLORS = {
  elevation: '#ef4444',
  slopeFlatness: '#f97316',
  flowAccumulation: '#eab308',
  imperviousRatio: '#a855f7',
  rainfallIntensity: '#3b82f6',
};

const SHAP_LABELS = {
  elevation: 'Low Elevation',
  slopeFlatness: 'Flat Terrain',
  flowAccumulation: 'Flow Accumulation',
  imperviousRatio: 'Impervious Ratio',
  rainfallIntensity: 'Rainfall Intensity',
};

export default function SHAPPanel({ hotspot, onClose }) {
  if (!hotspot) return null;

  const shapEntries = Object.entries(hotspot.shap ?? {});
  const maxShap = Math.max(...shapEntries.map(([, v]) => parseFloat(v)));

  return (
    <div className="shap-panel" onClick={onClose}>
      <div className="shap-card" onClick={e => e.stopPropagation()}>
        <div className="shap-header">
          <div>
            <div className="shap-title">⚠ Flood Hotspot Explainability</div>
            <div className="shap-sub">SHAP feature importance analysis · XGBoost prediction</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-subtle)',
              borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer',
              padding: '4px 8px', fontSize: '14px',
            }}
          >✕</button>
        </div>

        <div className="shap-body">
          {/* Risk score row */}
          <div className="shap-risk-score">
            <div className="shap-score-val">{(hotspot.risk * 10).toFixed(1)}</div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Flood Risk Score
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Elevation: {hotspot.elev?.toFixed(2)} m &nbsp;|&nbsp;
                Flow Acc: {hotspot.flowAcc?.toFixed(0)} cells
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Slope: {hotspot.slope?.toFixed(4)} rad &nbsp;|&nbsp;
                Threshold: 0.68 (exceeded)
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className={`badge ${hotspot.risk >= 0.8 ? 'badge-red' : hotspot.risk >= 0.68 ? 'badge-amber' : 'badge-green'}`}>
                {hotspot.risk >= 0.8 ? 'CRITICAL' : hotspot.risk >= 0.68 ? 'HIGH' : 'MEDIUM'}
              </div>
            </div>
          </div>

          {/* SHAP waterfall */}
          <div className="shap-features-title">SHAP Feature Contributions</div>
          {shapEntries.map(([key, val]) => {
            const pct = (parseFloat(val) / maxShap) * 100;
            return (
              <div key={key} className="shap-feature-row">
                <div className="shap-feat-name">{SHAP_LABELS[key] || key}</div>
                <div className="shap-feat-bar-wrap">
                  <div
                    className="shap-feat-bar"
                    style={{
                      width: `${pct}%`,
                      background: SHAP_COLORS[key] || 'var(--teal-500)',
                    }}
                  />
                </div>
                <div className="shap-feat-val" style={{ color: SHAP_COLORS[key] }}>
                  {parseFloat(val).toFixed(3)}
                </div>
              </div>
            );
          })}

          {/* AI Explanation text */}
          <div style={{
            marginTop: 16, padding: 12,
            background: 'var(--bg-900)', borderRadius: 8,
            fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.7,
            borderLeft: '3px solid var(--red-500)',
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>AI Explanation:</strong>{' '}
            This zone is predicted to waterlog due to a combination of{' '}
            <span style={{ color: SHAP_COLORS.elevation }}>low elevation relative to surroundings</span>,{' '}
            <span style={{ color: SHAP_COLORS.slopeFlatness }}>minimal terrain slope</span>, and{' '}
            <span style={{ color: SHAP_COLORS.flowAccumulation }}>high upstream flow convergence</span>.
            The upstream catchment area routes {hotspot.flowAcc?.toFixed(0)} cells of runoff to this point.
            At {hotspot.elev?.toFixed(1)}m elevation, gravity drainage is insufficient without intervention.
          </div>

          {/* Recommended action */}
          <div style={{
            marginTop: 12, padding: 12,
            background: 'rgba(45,212,191,0.08)', borderRadius: 8,
            fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.7,
            borderLeft: '3px solid var(--teal-500)',
          }}>
            <strong style={{ color: 'var(--teal-400)' }}>Recommended Action:</strong>{' '}
            Install a catch drain with minimum 300mm diameter at this location.
            Route gravity flow toward the nearest natural stream identified in M4 analysis.
            Estimated excavation: 1.2m depth × 0.5m width.
          </div>

          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 16 }}
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
