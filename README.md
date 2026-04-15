# GeoAI Village Drainage Intelligence Platform

## Overview
The **GeoAI Village Drainage Intelligence Platform** is an advanced spatial analytics and deep learning solution aimed at automating and optimizing rural drainage planning. Developed as a proposal for the Ministry of Panchayati Raj Geospatial Intelligence Challenge, this platform leverages SVAMITVA scheme drone LiDAR data to help rural planners build efficient and cost-effective drainage networks.

## Key Features

### 1. Automated LiDAR Classification
Upload raw `.laz` (drone LiDAR) files directly to the platform. Our real-time **RandLA-Net Classification Engine** instantly segments the point cloud into distinct categories (buildings, vegetation, and ground), stripping away obstructions to reveal the bare earth.

### 2. DTM Generation & Hydrological Flow
Generates a high-resolution (1-meter) Digital Terrain Model (DTM) from the classified ground points. The integrated hydrological engine calculates natural water flow paths across the village terrain, highlighting natural depressions where water gathers.

### 3. ML-Powered Flood Hotspot Prediction
Instead of relying purely on flow accumulation, the platform uses an **XGBoost Machine Learning model** to predict definitive flood hotspots based on terrain features, providing a risk percentage and area estimation for zones vulnerable to waterlogging during monsoon seasons.

### 4. A* Drainage Network Optimization
The core engine utilizes an **A* Optimization Algorithm** to automatically generate the most cost-efficient and gravity-aligned drainage network. It connects flood hotspots to the nearest safe outflow while:
- Minimizing required excavation volume.
- Saving up to 34% compared to baseline costs.
- Automatically bypassing existing structures/houses.

### 5. Climate Simulation & Stress Testing
Interactive rainfall slider allows planners to simulate various climate scenarios (e.g., normal 50mm to extreme 200mm rainfall). The platform dynamically recalculates:
- Pipe capacity and overflow bottlenecks.
- Expansions of flood hotspots.
- Overall Village Resilience Score (0-100).

### 6. Explainable AI & GIS Export
- **Explainable AI (XAI):** Click on any predicted flood hotspot to view a SHAP waterfall chart explaining the precise factors causing the flood risk (e.g., high impervious ratio, local elevation).
- **Export GIS Bundle:** Download the entire optimized network, cost maps, and raster data as an open GIS bundle ready for field implementation.

## Technology Stack
- **Deep Learning / AI:** RandLA-Net (Point Cloud Classification), XGBoost (Flood Prediction), SHAP (Explainability)
- **Optimization:** A* Pathfinding Algorithm for drainage routing
- **Data Input:** SVAMITVA `.laz` LiDAR files
- **Frontend / Integration:** React/HTML, interactive 3D viewer, GIS mapping tools
