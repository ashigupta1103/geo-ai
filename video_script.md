# GeoAI Village Drainage Intelligence Platform: App Walkthrough Video Script

**Format:** Pure Software Demonstration (Screen Recording)
**Length:** 5 Minutes
**Pacing:** Fast-paced UI demonstration. Focus entirely on the live dashboard.

---

## 0:00 - 0:30 | Step 1: Uploading LiDAR Data & AI Classification
**Screen Action:** 
1. The camera immediately starts on the GeoAI web dashboard homepage.
2. The user clicks "New Project" and drags a raw SVAMITVA `.laz` (drone LiDAR) file into the upload zone.
3. A progress bar zooms across: "Running RandLA-Net Classification Engine..."
4. The screen jumps to a 3D viewer. The raw point cloud appears in grey, then rapidly flashes into different colors: red (buildings), green (trees), and ground (brown).

**Voiceover:** 
"Welcome to the GeoAI Village Drainage platform. Here, we're taking a raw SVAMITVA drone LiDAR file and uploading it directly into the system. Instantly, our deep learning engine classifies the point cloud in real-time, stripping away buildings and vegetation to find the bare earth."

---

## 0:30 - 1:15 | Step 2: DTM Generation & Flow Paths
**Screen Action:** 
1. The user clicks a toggle on the left sidebar: "Generate DTM".
2. The 3D point cloud morphs into a smooth, high-resolution Digital Terrain Model (DTM) overlaid on the 2D map.
3. Next, the user clicks "Run Hydrological Engine".
4. Animated blue lines (flow paths) light up and trace down the DTM, naturally gathering in the lowest depressions.

**Voiceover:** 
"With the ground isolated, the platform generates a one-meter resolution Digital Terrain Model. Next, we run our hydrological engine. You can see these blue flow paths lighting up—this shows exactly how water naturally moves across the village's terrain and where it gets trapped."

---

## 1:15 - 2:00 | Step 3: Flood ML Prediction (Hotspots)
**Screen Action:** 
1. The user clicks a button labeled: "Predict Flood Hotspots (XGBoost)".
2. Several pulsing **red polygons** emerge on the map over low-lying, trapped areas.
3. The user hovers over one of the red zones, and a tooltip shows: `"Risk: High (88%), Area: 450 sq m"`.

**Voiceover:** 
"Using pure flow accumulation isn't enough. By running our Machine Learning predictive model over the terrain features, the app identifies definitive flood hotspots. These pulsing red zones indicate areas guaranteed to waterlog severely during the monsoon."

---

## 2:00 - 3:00 | Step 4: Core Engine - Drainage Optimization
**Screen Action:** 
1. The core moment. The user clicks the main action button: "Generate Optimized Drainage Network".
2. A loading spinner briefly appears. Then, thick **blue pipelines** aggressively draw themselves across the map, naturally linking the red flood zones to the nearest safe outflow.
3. The right-hand panel populates with metrics:
   * **Total Pipeline Length:** 1.2 km
   * **Estimated Excavation Volume:** 4,500 cubic meters
   * **Saved vs. Baseline Cost:** 34%
4. The user zooms in to show how the blue line gently curves to follow the DTM's natural slope, avoiding a cluster of village houses.

**Voiceover:** 
"Now for the core engine. We click generate, and our A-star optimization algorithm automatically draws the most cost-efficient drainage network. Notice how the blue pipeline routes itself organically. It avoids unnecessary excavation, ensures gravity flow, and bypasses existing houses, instantly giving rural planners a ready-to-build, budget-optimized network."

---

## 3:00 - 4:15 | Step 5: Climate Simulation (Rainfall Slider)
**Screen Action:** 
1. The user moves their mouse up to the **"Climate Simulation" slider** set at `50mm (Normal)`.
2. The user drags the slider to the right: `150mm (Heavy)` and then `200mm (Extreme)`.
3. As the slider gets dragged, the map reacts dynamically:
   * The blue drainage pipes turn **orange** and then **red** in certain bottleneck areas.
   * New flood hotspots spill out over the previously protected zones.
4. A dashboard widget labeled "Overall Resilience Score" drops from `95/100` to `62/100`.

**Voiceover:** 
"We don't just plan for today; we plan for extreme climate events. Using our interactive rainfall slider, users can stress-test the drainage network. Watch what happens when we drag the rainfall up to a 200-millimeter extreme event. The platform instantly recalculates, showing exactly which pipes will overflow and where the resilience score drops, allowing planners to size up infrastructure before building."

---

## 4:15 - 5:00 | Step 6: Explainable AI & Export
**Screen Action:** 
1. The user clicks directly on one of the newly flooded red hotspots.
2. An **Explainability Panel** pops up on the right.
3. It displays a SHAP waterfall chart. Text reads: *"Primary factors for flooding: 1. Surrounding concrete (Impervious ratio), 2. Low local elevation."*
4. Finally, the user clicks "Export GIS Bundle" in the top right. A zip file downloads.

**Voiceover:** 
"Finally, we provide transparency. By clicking any flood hotspot, the Explainable AI panel opens, demonstrating exactly why the AI made its prediction—building trust with government officials. And with one click, the entire network, cost map, and raster data export as an open GIS bundle, ready for immediate field implementation."
