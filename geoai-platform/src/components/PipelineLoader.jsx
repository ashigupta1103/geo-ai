import React from 'react';

export default function PipelineLoader({ step, label, progress }) {
  return (
    <div className="pipeline-running-overlay">
      <div className="pipeline-loader">
        <div className="loader-icon">⚙️</div>
        <div className="loader-title">Running GeoAI Pipeline</div>
        <div className="loader-module">{label || 'Initializing…'}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < step - 1 ? 'var(--teal-500)' : i === step - 1 ? 'var(--amber-400)' : 'var(--bg-600)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
        <div className="loader-progress">
          <div className="loader-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ marginTop: 8, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          Step {step}/7 · {progress.toFixed(0)}% complete
        </div>
      </div>
    </div>
  );
}
