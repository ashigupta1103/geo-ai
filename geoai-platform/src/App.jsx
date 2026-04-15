import React, { useState, useCallback } from 'react';
import './index.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import RightPanel from './components/RightPanel';
import SHAPPanel from './components/SHAPPanel';
import DemoTourBar from './components/DemoTourBar';
import PipelineLoader from './components/PipelineLoader';
import { VILLAGES, runFullPipeline } from './engine/pipelineEngine';

const INITIAL_LAYERS = {
  dtm: true,
  streams: true,
  flood: true,
  drainage: true,
  watershed: false,
};

export default function App() {
  const [activeVillage, setActiveVillage] = useState(VILLAGES[0]);
  const [layers, setLayers] = useState(INITIAL_LAYERS);
  const [rainfall, setRainfallVal] = useState(100);
  const [results, setResults] = useState(null);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineLabel, setPipelineLabel] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [toast, setToast] = useState(null);
  const pipelineDone = results?.m7 != null;

  // ── Toast ──────────────────────────────────────────────────
  const showToast = (msg, icon = '✓') => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Layer toggle ───────────────────────────────────────────
  const toggleLayer = useCallback((id) => {
    setLayers(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // ── Village change ─────────────────────────────────────────
  const handleVillageChange = (v) => {
    setActiveVillage(v);
    setResults(null);
    setPipelineStep(0);
    setSelectedHotspot(null);
    showToast(`Switched to ${v.name}, ${v.state}`, '📍');
  };

  // ── Rainfall change (re-runs M5+M6 if pipeline done) ──────
  const setRainfall = (val) => {
    setRainfallVal(val);
  };

  // ── Run full pipeline ──────────────────────────────────────
  const handleRunPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setResults(null);
    setPipelineStep(0);

    try {
      const res = await runFullPipeline(
        activeVillage,
        rainfall,
        ({ step, label }) => {
          setPipelineStep(step);
          setPipelineLabel(label);
        }
      );
      setResults(res);
      showToast(`Pipeline complete for ${activeVillage.name}!`, '🛰️');
    } catch (e) {
      console.error(e);
      showToast('Pipeline error. Check console.', '⚠️');
    } finally {
      setIsRunning(false);
      setPipelineStep(8);
    }
  };

  // ── GIS Export ─────────────────────────────────────────────
  const handleExport = () => {
    if (!results?.m7) return;
    const bundle = {
      ...results.m7.bundle,
      metadata: {
        generated: new Date().toISOString(),
        pipeline: 'GeoAI Village Drainage Intelligence Platform v1.0',
        institution: 'IITTNiF Geo-Intel Lab',
      },
      flood_hotspots: results.m5?.hotspots?.slice(0, 20).map(hs => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [activeVillage.lng, activeVillage.lat] },
        properties: { risk: hs.risk, elevation: hs.elev, shap: hs.shap },
      })),
      drainage_network: results.m6?.drainageNetwork?.map(d => ({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: d.path.map(p => [p.c, p.r]) },
        properties: { length: d.length, excavationVolume: d.excavationVolume, costEstimate: d.costEstimate },
      })),
      metrics: {
        m2: results.m2?.metrics,
        m3: results.m3?.metrics,
        m5: results.m5?.metrics,
        m6: results.m6?.metrics,
      },
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geoai_${activeVillage.id}_gis_bundle.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('GIS bundle exported!', '⬇️');
  };

  // ── Demo Tour ──────────────────────────────────────────────
  const handleDemoTour = () => {
    setTourActive(true);
    setTourStep(0);
    if (!results?.m7) {
      handleRunPipeline();
    }
  };

  const progress = pipelineStep ? Math.min((pipelineStep / 7) * 100, 100) : 0;

  return (
    <div className="app-shell">
      {/* ─ Header ─ */}
      <Header
        pipelineStep={pipelineStep}
        village={activeVillage}
        rainfall={rainfall}
        isRunning={isRunning}
        compareMode={compareMode}
        setCompareMode={setCompareMode}
      />

      {/* ─ Sidebar ─ */}
      <Sidebar
        activeVillage={activeVillage}
        setActiveVillage={handleVillageChange}
        layers={layers}
        toggleLayer={toggleLayer}
        rainfall={rainfall}
        setRainfall={setRainfall}
        onRunPipeline={handleRunPipeline}
        isRunning={isRunning}
        onExport={handleExport}
        onDemoTour={handleDemoTour}
        pipelineDone={pipelineDone}
      />

      {/* ─ Map ─ IMPORTANT: minHeight:0 allows CSS grid cell to shrink properly */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: 0, height: '100%' }}>
        <MapView
          village={activeVillage}
          results={results}
          layers={layers}
          rainfall={rainfall}
          compareMode={compareMode}
          onHotspotClick={setSelectedHotspot}
        />
        {isRunning && (
          <PipelineLoader
            step={pipelineStep}
            label={pipelineLabel}
            progress={progress}
          />
        )}
      </div>

      {/* ─ Right Panel ─ */}
      <RightPanel
        results={results}
        village={activeVillage}
        pipelineDone={pipelineDone}
        rainfall={rainfall}
      />

      {/* ─ SHAP Modal ─ */}
      {selectedHotspot && (
        <SHAPPanel
          hotspot={selectedHotspot}
          onClose={() => setSelectedHotspot(null)}
        />
      )}

      {/* ─ Demo Tour ─ */}
      {tourActive && (
        <DemoTourBar
          step={tourStep}
          onNext={() => setTourStep(s => Math.min(s + 1, 6))}
          onPrev={() => setTourStep(s => Math.max(s - 1, 0))}
          onClose={() => setTourActive(false)}
        />
      )}

      {/* ─ Toast ─ */}
      {toast && (
        <div className="toast">
          <span>{toast.icon}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
