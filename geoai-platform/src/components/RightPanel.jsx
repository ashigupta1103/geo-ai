import React, { useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const TABS = ['Overview', 'Modules', 'Metrics', 'Export'];

const PIE_COLORS = ['#1d4ed8','#0d9488','#16a34a','#d97706','#7c3aed'];

function SectionHeading({ children }) {
  return <div className="section-heading">{children}</div>;
}

function MetricRow({ label, val, color }) {
  return (
    <div className="metric-row">
      <span className="metric-key">{label}</span>
      <span className="metric-val" style={color ? { color } : {}}>{val}</span>
    </div>
  );
}

function KpiCard({ label, value, sub, color, topColor }) {
  return (
    <div className="kpi-card" style={topColor ? { '--kpi-top': topColor } : {}}>
      <style>{`.kpi-card::before { background: ${topColor || 'var(--gov-blue-600)'} !important; }`}</style>
      <div className="kpi-label">{label}</div>
      <div className="kpi-val" style={{ color: color || 'var(--gov-blue-800)' }}>{value ?? '—'}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

function ModuleCard({ mod, data }) {
  const [expanded, setExpanded] = useState(false);
  if (!data) return null;
  const statusIcon = data.status === 'complete' ? '✓' : data.status === 'running' ? '⟳' : '○';
  const statusColor = data.status === 'complete' ? 'var(--green-600)' : data.status === 'running' ? 'var(--amber-600)' : 'var(--text-400)';

  return (
    <div
      className={`module-status-card ${data.status}`}
      onClick={() => setExpanded(v => !v)}
    >
      <div className="module-header-row">
        <div className="module-num-badge">{mod}</div>
        <div className="module-name">{data.name}</div>
        <span style={{ fontSize: 13, color: statusColor, fontWeight: 800 }}>{statusIcon}</span>
      </div>
      <div className="module-io">
        <span>IN: {data.input}</span>
        <span className="io-arrow">→</span>
        <span>OUT: {Array.isArray(data.output) ? data.output.join(', ') : data.output}</span>
      </div>
      {expanded && data.metrics && (
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 8, marginTop: 4 }}>
          {Object.entries(data.metrics).slice(0, 7).map(([k, v]) => (
            <MetricRow key={k}
              label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
              val={v}
            />
          ))}
        </div>
      )}
      {expanded && data.log && (
        <div className="module-logs" style={{ marginTop: 6 }}>
          {data.log.map((l, i) => <div key={i} className="log-line">{l}</div>)}
        </div>
      )}
      <div style={{ fontSize: '0.58rem', color: 'var(--text-400)', marginTop: 4, fontWeight: 600 }}>
        {expanded ? '▲ Collapse' : '▼ Expand details'}
      </div>
    </div>
  );
}

export default function RightPanel({ results, village, pipelineDone, rainfall }) {
  const [tab, setTab] = useState('Overview');

  const classData = results?.m2
    ? Object.entries(results.m2.classDistribution).map(([k, v]) => ({
        name: k.charAt(0).toUpperCase() + k.slice(1), value: v,
      }))
    : [];

  const radarData = results?.m2 ? [
    { subject: 'Ground',   value: parseFloat(results.m2.metrics.groundF1) },
    { subject: 'Building', value: parseFloat(results.m2.metrics.buildingF1) },
    { subject: 'Veg',      value: parseFloat(results.m2.metrics.vegF1) },
    { subject: 'Road',     value: parseFloat(results.m2.metrics.roadF1) },
    { subject: 'Water',    value: parseFloat(results.m2.metrics.waterF1) },
  ] : [];

  return (
    <div className="app-panel">
      <div className="panel-tabs">
        {TABS.map(t => (
          <div key={t} className={`panel-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </div>
        ))}
      </div>

      <div className="panel-content">

        {/* ─────── OVERVIEW ─────── */}
        {tab === 'Overview' && (
          <div className="animate-fadein">
            {/* Village Risk Card */}
            <div className="village-summary-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div className="village-summary-name">{village.name}</div>
                  <div className="village-summary-state">{village.state} · {village.district}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '1.9rem', fontWeight: 900, lineHeight: 1,
                    color: village.riskIndex >= 7 ? 'var(--red-600)' : village.riskIndex >= 5 ? 'var(--amber-600)' : 'var(--green-600)',
                  }}>
                    {village.riskIndex}
                  </div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-400)', marginTop: 2 }}>
                    Risk Index / 10
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-400)', marginBottom: 5 }}>
                Village Drainage Risk Index (VDRI)
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{
                  width: `${village.riskIndex * 10}%`,
                  background: village.riskIndex >= 7
                    ? 'linear-gradient(90deg, var(--red-800), var(--red-600))'
                    : village.riskIndex >= 5
                    ? 'linear-gradient(90deg, var(--amber-800), var(--amber-600))'
                    : 'linear-gradient(90deg, var(--green-800), var(--green-600))',
                }} />
              </div>
            </div>

            {!pipelineDone ? (
              <div style={{ textAlign: 'center', padding: '44px 0', color: 'var(--text-400)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📡</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-600)', marginBottom: 6 }}>
                  Pipeline Not Executed
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-400)', fontWeight: 500 }}>
                  Click "Run Full Pipeline" to begin analysis
                </div>
              </div>
            ) : (
              <>
                <SectionHeading>AI & Terrain Performance Metrics</SectionHeading>
                <div className="kpi-grid">
                  <KpiCard label="mIoU Score" value={results.m2?.metrics?.mIoU}       color="var(--gov-blue-800)" topColor="var(--gov-blue-700)"  sub="AI Classification (target ≥75%)" />
                  <KpiCard label="Ground F1"  value={results.m2?.metrics?.groundF1}    color="var(--teal-700)"    topColor="var(--teal-600)"      sub="Critical class (target ≥90%)" />
                  <KpiCard label="DTM RMSE"   value={results.m3?.metrics?.rmse}        color="var(--green-800)"   topColor="var(--green-600)"     sub="Vs. Ground Control Points" />
                  <KpiCard label="ROC-AUC"    value={results.m5?.metrics?.rocAUC}      color="var(--purple-600)"  topColor="var(--purple-600)"    sub="Flood Prediction Model" />
                  <KpiCard label="Hotspots"   value={results.m5?.metrics?.hotspotCount} color="var(--red-600)"   topColor="var(--red-600)"       sub={`Critical zones @ ${rainfall}mm`} />
                  <KpiCard label="Cost Saved" value={results.m6?.metrics?.costVsBaseline} color="var(--amber-600)" topColor="var(--amber-600)"  sub="Vs. Conventional Method" />
                </div>

                <SectionHeading>Impact Assessment</SectionHeading>
                <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-med)', borderRadius: 'var(--r-md)', padding: 12, marginBottom: 14 }}>
                  {[
                    { label: 'Flood Volume Reduction', val: results.m6?.metrics?.floodReduction, color: 'var(--green-600)', bg: 'linear-gradient(90deg, var(--green-800), var(--green-600))' },
                    { label: 'Gravity Flow Compliance', val: results.m6?.metrics?.gravityCompliance, color: 'var(--gov-blue-700)', bg: 'linear-gradient(90deg, var(--gov-blue-800), var(--gov-blue-600))' },
                    { label: 'Overall Accuracy (M2)', val: results.m2?.metrics?.overallAccuracy, color: 'var(--teal-700)', bg: 'linear-gradient(90deg, var(--teal-700), var(--teal-500))' },
                  ].map(({ label, val, color, bg }) => (
                    <div key={label} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-700)' }}>{label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.76rem', color }}>{val}</span>
                      </div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: val, background: bg }} />
                      </div>
                    </div>
                  ))}
                </div>

                <SectionHeading>Point Cloud Class Distribution</SectionHeading>
                <div style={{ height: 170 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={classData} cx="50%" cy="50%" outerRadius={65} dataKey="value" nameKey="name">
                        {classData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border-med)', borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                        formatter={(v) => [`${v}%`, '']}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--text-700)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─────── MODULES ─────── */}
        {tab === 'Modules' && (
          <div className="animate-fadein">
            {!results?.m1 ? (
              <div style={{ textAlign: 'center', padding: '44px 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚙️</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-600)' }}>Pipeline Not Executed</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-400)', marginTop: 4, fontWeight: 500 }}>Run the pipeline to view module outputs</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--text-500)', marginBottom: 10, padding: '6px 8px', background: 'var(--surface-raised)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-med)' }}>
                  Click any module card to expand logs and metrics
                </div>
                {['m1','m2','m3','m4','m5','m6','m7'].map((k, i) => (
                  <ModuleCard key={k} mod={`M${i+1}`} data={results[k]} />
                ))}
              </>
            )}
          </div>
        )}

        {/* ─────── METRICS ─────── */}
        {tab === 'Metrics' && (
          <div className="animate-fadein">
            {!pipelineDone ? (
              <div style={{ textAlign: 'center', padding: '44px 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-600)' }}>No Data Available</div>
              </div>
            ) : (
              <>
                <SectionHeading>AI Classification — Per-Class F1 Score</SectionHeading>
                <div style={{ height: 170, marginBottom: 14 }}>
                  <ResponsiveContainer>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border-med)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-600)', fontWeight: 600 }} />
                      <Radar name="F1 Score" dataKey="value" stroke="var(--gov-blue-700)" fill="var(--gov-blue-700)" fillOpacity={0.15} strokeWidth={2} />
                      <Tooltip
                        contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border-med)', borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                        formatter={v => [`${v}%`, 'F1 Score']}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <SectionHeading>DTM Quality Indicators (M3)</SectionHeading>
                {Object.entries(results.m3?.metrics ?? {}).map(([k, v]) => (
                  <MetricRow key={k}
                    label={k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}
                    val={v}
                  />
                ))}

                <SectionHeading style={{ marginTop: 14 }}>Flood ML Performance (M5)</SectionHeading>
                {results.m5 && (
                  <div style={{ height: 130, marginBottom: 10 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={[
                          { name: 'ROC-AUC',  val: parseFloat(results.m5.metrics.rocAUC)  * 100 },
                          { name: 'Precision',val: parseFloat(results.m5.metrics.precision)* 100 },
                          { name: 'Recall',   val: parseFloat(results.m5.metrics.recall)   * 100 },
                          { name: 'F1',       val: parseFloat(results.m5.metrics.f1Score)  * 100 },
                        ]}
                        barSize={22}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-600)', fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: 'var(--text-400)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border-med)', borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                          formatter={v => [`${v.toFixed(1)}%`]}
                        />
                        <Bar dataKey="val" fill="var(--gov-blue-700)" radius={[3,3,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <SectionHeading>Drainage Optimisation Results (M6)</SectionHeading>
                {Object.entries(results.m6?.metrics ?? {}).map(([k,v]) => (
                  <MetricRow key={k}
                    label={k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}
                    val={v}
                    color={k.includes('Reduction') ? 'var(--green-600)' : k.includes('Cost') ? 'var(--amber-600)' : null}
                  />
                ))}

                <SectionHeading>Hydrological Parameters (M4)</SectionHeading>
                {Object.entries(results.m4?.metrics ?? {}).map(([k,v]) => (
                  <MetricRow key={k}
                    label={k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}
                    val={v}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* ─────── EXPORT ─────── */}
        {tab === 'Export' && (
          <div className="animate-fadein">
            <SectionHeading>GIS Output Bundle</SectionHeading>
            <div className="export-banner">
              <div className="export-banner-title">Submission-Ready GIS Layers</div>
              <div className="export-files">
                {[
                  { file:'dtm.tif',                  type:'GeoTIFF', c:'var(--gov-blue-700)' },
                  { file:'flow_accumulation.tif',    type:'GeoTIFF', c:'var(--gov-blue-700)' },
                  { file:'flood_hotspots.geojson',   type:'GeoJSON', c:'var(--red-600)' },
                  { file:'drainage_network.geojson', type:'GeoJSON', c:'var(--teal-700)' },
                  { file:'streams.geojson',          type:'GeoJSON', c:'var(--teal-700)' },
                  { file:'risk_score_map.tif',       type:'GeoTIFF', c:'var(--red-600)' },
                ].map(({ file, type, c }) => (
                  <div key={file} className="export-file">
                    <span>{file}</span>
                    <span className="export-file-badge" style={{ background: `color-mix(in srgb, ${c} 12%, white)`, color: c, border: `1px solid color-mix(in srgb, ${c} 25%, white)` }}>
                      {type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <SectionHeading>Submission Artefacts</SectionHeading>
            {[
              { icon:'🗺️',  label:'Interactive Web Dashboard',     status:'Live',    sc:'badge-green' },
              { icon:'📊',  label:'Evaluation Metrics Report',     status: pipelineDone ? 'Ready' : 'Pending', sc: pipelineDone ? 'badge-teal' : 'badge-amber' },
              { icon:'📄',  label:'PRD & Technical Report (PDF)',  status:'Ready',   sc:'badge-teal'  },
              { icon:'🎥',  label:'5-Minute Demo Video',           status:'Ready',   sc:'badge-teal'  },
              { icon:'🏗️', label:'System Architecture Diagram',   status:'Ready',   sc:'badge-teal'  },
              { icon:'💻',  label:'GitHub Repository (Open)',      status:'Public',  sc:'badge-green' },
            ].map(({ icon, label, status, sc }) => (
              <div key={label} className="metric-row">
                <span className="metric-key" style={{ fontWeight: 600, color: 'var(--text-700)' }}>{icon} &nbsp;{label}</span>
                <span className={`badge ${sc}`}>{status}</span>
              </div>
            ))}

            <SectionHeading>Pipeline Run Summary</SectionHeading>
            <div style={{
              background: 'var(--surface-sunken)',
              border: '1px solid var(--border-med)',
              borderRadius: 'var(--r-sm)',
              padding: 10,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              color: 'var(--text-600)',
              lineHeight: 1.9,
              fontWeight: 500,
            }}>
              {pipelineDone ? (
                <>
                  <div>Village     : {village.name}, {village.state}</div>
                  <div>LiDAR Pts   : {village.lidarPoints.toLocaleString()}</div>
                  <div>DTM Res.    : 1m GeoTIFF · EPSG:32643</div>
                  <div>Hotspots    : {results?.m5?.hotspots?.length} flood zones</div>
                  <div>Drain Routes: {results?.m6?.drainageNetwork?.length} paths</div>
                  <div>Rainfall    : {rainfall}mm scenario</div>
                  <div>Generated   : {new Date().toLocaleString('en-IN')}</div>
                </>
              ) : (
                <div style={{ color: 'var(--text-400)' }}>Run pipeline to generate report…</div>
              )}
            </div>

            <div style={{
              marginTop: 14, padding: 12,
              background: 'var(--gov-blue-50)',
              border: '1px solid rgba(29,78,216,0.15)',
              borderLeft: '3px solid var(--gov-blue-600)',
              borderRadius: 'var(--r-sm)',
              fontSize: '0.7rem', fontWeight: 600,
              color: 'var(--gov-blue-800)',
              lineHeight: 1.7,
              fontStyle: 'italic',
            }}>
              "We are not just predicting floods. We are converting national SVAMITVA drone data into village-scale infrastructure intelligence."
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
