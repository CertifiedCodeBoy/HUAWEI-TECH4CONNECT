# HUAWEI TECH4CONNECT

An interactive web platform built by **Team Lafabrica** for the Huawei ICT Solutions hackathon. It showcases a smart city energy management system for Algeria, demonstrating how **piezoelectric energy** (harvested from footsteps) and **solar power** converge into a sustainable, bidirectional energy grid.

## Features

- **3D Hero Section** – Immersive Huawei logo model with scroll/mouse parallax and bloom post-processing
- **PED Dashboard** – Real-time energy analytics with 48-hour forecasting, building analytics, anomaly detection, AI decisions, 5G network simulation, and regional (wilaya) data
- **Hex Simulation** – Interactive 3D piezoelectric floor model
- **Battery Section** – 3D modular battery storage visualization
- **House Section** – Smart home energy consumption display
- **Wires Overlay** – Animated energy flow between components

## Tech Stack

| Technology | Version |
|---|---|
| React | 19.1.0 |
| Vite | 6.3.5 |
| Three.js | 0.176.0 |
| @react-three/fiber | 9.1.2 |
| @react-three/drei | 10.0.6 |
| Recharts | 2.15.3 |
| ESLint | 9.39.1 |

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── main.jsx                          # React entry point; GLB asset preloading
├── App.jsx                           # Main app layout, routing, About section
├── hooks/useInView.js                # Intersection Observer hook
└── components/
    ├── Navbar/Navbar.jsx             # Fixed header navigation
    ├── Hero/Hero.jsx                 # Hero parallax section
    ├── Hero/Model3D.jsx              # 3D Huawei logo model
    ├── Dashboard/PEDDashboard.jsx    # Energy analytics dashboard
    ├── HexSimulation/HexSimulation.jsx # Piezoelectric floor container
    ├── Battery/Battery.jsx           # Battery storage section
    ├── House/House.jsx               # Smart home section
    └── WiresOverlay/WiresOverlay.jsx # Animated energy flow overlay
```
