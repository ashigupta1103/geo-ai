import React from 'react';

const STEPS = [
  {
    title: 'Upload LiDAR → AI Classifies Terrain',
    desc: 'SVAMITVA drone data (.las/.laz) is ingested and RandLA-Net deep learning model classifies every point: ground, building, vegetation, road, water — achieving mIoU ≥ 75%.',
    highlight: 'villages',
    module: 'M1 + M2',
  },
  {
    title: 'Survey-Grade DTM Appears on Map',
    desc: 'Ground class points are TIN-interpolated into a 1m resolution Digital Terrain Model. The elevation heatmap renders on the map — see valleys, ridges, and low-lying flood zones.',
    highlight: 'dtm',
    module: 'M3',
  },
  {
    title: 'Natural Flow Paths Light Up',
    desc: 'D∞ hydrological modeling computes flow direction and accumulation. Natural drainage streams, depressions, and micro-watersheds are extracted and overlaid on the terrain.',
    highlight: 'streams',
    module: 'M4',
  },
  {
    title: 'Flood Hotspots Emerge (Pre-Monsoon)',
    desc: 'XGBoost classifier trained on elevation, slope, flow accumulation, and imperviousness predicts waterlogging probability per cell. Red zones = flood-before-monsoon warning.',
    highlight: 'flood',
    module: 'M5',
  },
  {
    title: 'Optimized Drainage Network Overlays',
    desc: 'A* pathfinding with custom terrain cost function routes drains from every hotspot to natural outlets — minimizing excavation volume, elevation gain, and built-area disruption.',
    highlight: 'drainage',
    module: 'M6',
  },
  {
    title: 'Drag Rainfall Slider → Before vs After',
    desc: 'Try 200mm rainfall — watch flood zones expand. Toggle "Compare" to see the before vs after split view. With the drainage network, flood spread is reduced by 60–75%.',
    highlight: 'compare',
    module: 'M7',
  },
  {
    title: 'Click Hotspot → SHAP Explainability',
    desc: 'Every flood hotspot is explainable. Click any red zone to see SHAP feature contributions — why this specific parcel floods, what the AI confidence is, and what action is recommended.',
    highlight: 'shap',
    module: 'Innovation',
  },
];

export default function DemoTourBar({ step, onNext, onPrev, onClose }) {
  const current = STEPS[step] || STEPS[0];
  const total = STEPS.length;

  return (
    <div className="demo-tour-bar">
      <div className="tour-step-label">🎬 Demo Tour · Step {step + 1} of {total} · {current.module}</div>
      <div className="tour-step-title">{current.title}</div>
      <div className="tour-step-desc">{current.desc}</div>
      <div className="tour-controls">
        <div className="tour-dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`tour-dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>
        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={onPrev} disabled={step === 0}>
          ←
        </button>
        {step < total - 1 ? (
          <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem' }} onClick={onNext}>
            Next →
          </button>
        ) : (
          <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem' }} onClick={onClose}>
            ✓ End Tour
          </button>
        )}
        <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
