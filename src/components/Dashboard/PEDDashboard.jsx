import { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./PEDDashboard.css";

// ── MOCK DATA ──────────────────────────────────────────────────────────────────

const generateForecastData = () => {
  const data = [];
  const now = new Date();
  for (let i = -6; i < 42; i++) {
    const h = (now.getHours() + i + 24) % 24;
    const solar =
      i < 0
        ? Math.max(
            0,
            18 * Math.sin(((h - 6) * Math.PI) / 12) + (Math.random() - 0.5) * 3,
          )
        : Math.max(0, 18 * Math.sin(((h - 6) * Math.PI) / 12));
    const piezo = Math.max(
      0,
      2.5 + Math.sin(h * 0.8) * 1.2 + (Math.random() - 0.5),
    );
    const demand =
      15 + 8 * Math.sin(((h - 14) * Math.PI) / 10) + (Math.random() - 0.5) * 2;
    const clouds = Math.max(
      0,
      Math.min(100, 30 + Math.sin(i * 0.3) * 25 + (Math.random() - 0.5) * 10),
    );
    data.push({
      hour: `${String(h).padStart(2, "0")}:00`,
      solar: +solar.toFixed(1),
      piezo: +piezo.toFixed(1),
      demand: +demand.toFixed(1),
      clouds: +clouds.toFixed(0),
      isPast: i < 0,
    });
  }
  return data;
};

const BUILDINGS = [
  {
    id: "B01",
    name: "Central Hospital",
    type: "hospital",
    solar: 15.2,
    piezo: 0,
    demand: 48.3,
    comfort: 82,
    status: "deficit",
    anomaly: null,
  },
  {
    id: "B02",
    name: "ESI University",
    type: "school",
    solar: 22.1,
    piezo: 3.1,
    demand: 18.5,
    comfort: 91,
    status: "surplus",
    anomaly: null,
  },
  {
    id: "B03",
    name: "City Hall",
    type: "office",
    solar: 12.8,
    piezo: 5.2,
    demand: 11.1,
    comfort: 78,
    status: "surplus",
    anomaly: null,
  },
  {
    id: "B04",
    name: "Residential Block A",
    type: "residential",
    solar: 8.4,
    piezo: 1.8,
    demand: 14.2,
    comfort: 88,
    status: "deficit",
    anomaly: null,
  },
  {
    id: "B05",
    name: "Tech Hub",
    type: "office",
    solar: 19.6,
    piezo: 4.5,
    demand: 16.8,
    comfort: 94,
    status: "surplus",
    anomaly: null,
  },
  {
    id: "B06",
    name: "Primary School",
    type: "school",
    solar: 9.2,
    piezo: 2.9,
    demand: 7.8,
    comfort: 72,
    status: "surplus",
    anomaly: { type: "solar_underperformance", severity: "medium" },
  },
  {
    id: "B07",
    name: "Police Station",
    type: "office",
    solar: 6.1,
    piezo: 0.8,
    demand: 22.4,
    comfort: 85,
    status: "deficit",
    anomaly: null,
  },
  {
    id: "B08",
    name: "Residential Block B",
    type: "residential",
    solar: 11.3,
    piezo: 2.2,
    demand: 13.6,
    comfort: 90,
    status: "balanced",
    anomaly: null,
  },
  {
    id: "B09",
    name: "Sports Complex",
    type: "office",
    solar: 24.8,
    piezo: 8.9,
    demand: 19.2,
    comfort: 76,
    status: "surplus",
    anomaly: { type: "consumption_spike", severity: "low" },
  },
  {
    id: "B10",
    name: "Market Plaza",
    type: "office",
    solar: 7.3,
    piezo: 12.4,
    demand: 11.8,
    comfort: 83,
    status: "balanced",
    anomaly: null,
  },
  {
    id: "B11",
    name: "Clinic Nord",
    type: "hospital",
    solar: 13.5,
    piezo: 0.4,
    demand: 31.2,
    comfort: 89,
    status: "deficit",
    anomaly: null,
  },
  {
    id: "B12",
    name: "Residential Block C",
    type: "residential",
    solar: 9.8,
    piezo: 1.6,
    demand: 8.9,
    comfort: 95,
    status: "surplus",
    anomaly: null,
  },
  {
    id: "B13",
    name: "Library",
    type: "office",
    solar: 16.2,
    piezo: 3.3,
    demand: 9.4,
    comfort: 97,
    status: "surplus",
    anomaly: null,
  },
  {
    id: "B14",
    name: "Train Station",
    type: "office",
    solar: 28.5,
    piezo: 18.7,
    demand: 24.1,
    comfort: 71,
    status: "surplus",
    anomaly: null,
  },
  {
    id: "B15",
    name: "Residential Block D",
    type: "residential",
    solar: 7.1,
    piezo: 1.1,
    demand: 10.3,
    comfort: 86,
    status: "deficit",
    anomaly: null,
  },
];

const WILAYAS = [
  {
    name: "Tamanrasset",
    score: 99.9,
    season: "summer",
    lat: 22.8,
    lng: 5.5,
    surplus: 420,
  },
  {
    name: "Adrar",
    score: 72.1,
    season: "summer",
    lat: 27.9,
    lng: -0.3,
    surplus: 280,
  },
  {
    name: "Ghardaïa",
    score: 58.6,
    season: "summer",
    lat: 32.5,
    lng: 3.7,
    surplus: 180,
  },
  {
    name: "Biskra",
    score: 52.3,
    season: "spring",
    lat: 34.8,
    lng: 5.7,
    surplus: 120,
  },
  {
    name: "Béchar",
    score: 68.4,
    season: "summer",
    lat: 31.6,
    lng: -2.2,
    surplus: 210,
  },
  {
    name: "Ouargla",
    score: 65.2,
    season: "summer",
    lat: 31.9,
    lng: 5.3,
    surplus: 195,
  },
  {
    name: "El Oued",
    score: 61.8,
    season: "summer",
    lat: 33.4,
    lng: 6.9,
    surplus: 160,
  },
  {
    name: "Djelfa",
    score: 49.3,
    season: "spring",
    lat: 34.7,
    lng: 3.3,
    surplus: 55,
  },
  {
    name: "M'sila",
    score: 47.6,
    season: "spring",
    lat: 35.7,
    lng: 4.5,
    surplus: 30,
  },
  {
    name: "Laghouat",
    score: 56.1,
    season: "summer",
    lat: 33.8,
    lng: 2.9,
    surplus: 140,
  },
  {
    name: "Batna",
    score: 42.7,
    season: "spring",
    lat: 35.6,
    lng: 6.2,
    surplus: -40,
  },
  {
    name: "Sétif",
    score: 40.5,
    season: "spring",
    lat: 36.2,
    lng: 5.4,
    surplus: -55,
  },
  {
    name: "Algiers",
    score: 41.2,
    season: "spring",
    lat: 36.7,
    lng: 3.0,
    surplus: -80,
  },
  {
    name: "Oran",
    score: 44.8,
    season: "spring",
    lat: 35.7,
    lng: -0.6,
    surplus: 40,
  },
  {
    name: "Constantine",
    score: 38.1,
    season: "spring",
    lat: 36.4,
    lng: 6.6,
    surplus: -120,
  },
  {
    name: "Tlemcen",
    score: 39.4,
    season: "autumn",
    lat: 34.9,
    lng: -1.3,
    surplus: -60,
  },
  {
    name: "Annaba",
    score: 36.8,
    season: "spring",
    lat: 36.9,
    lng: 7.8,
    surplus: -90,
  },
  {
    name: "Blida",
    score: 37.2,
    season: "spring",
    lat: 36.5,
    lng: 2.8,
    surplus: -70,
  },
  {
    name: "Tizi Ouzou",
    score: 33.5,
    season: "autumn",
    lat: 36.7,
    lng: 4.0,
    surplus: -110,
  },
  {
    name: "Béjaïa",
    score: 35.9,
    season: "spring",
    lat: 36.8,
    lng: 5.1,
    surplus: -85,
  },
];

const TRADES = [
  { seller: "B14", buyer: "B01", amount: 8.2, price: 2.8, time: "2 min ago" },
  { seller: "B09", buyer: "B07", amount: 5.5, price: 2.6, time: "5 min ago" },
  { seller: "B05", buyer: "B11", amount: 3.1, price: 3.1, time: "11 min ago" },
  { seller: "B13", buyer: "B15", amount: 6.8, price: 2.9, time: "18 min ago" },
  { seller: "B02", buyer: "B04", amount: 4.4, price: 2.7, time: "24 min ago" },
];

const NODES_5G = [
  {
    id: "P1",
    type: "piezo",
    label: "Piezo Cluster A",
    lat: 0.15,
    lng: 0.2,
    latency: 12,
  },
  {
    id: "P2",
    type: "piezo",
    label: "Piezo Cluster B",
    lat: 0.8,
    lng: 0.3,
    latency: 14,
  },
  {
    id: "S1",
    type: "solar",
    label: "Solar Meter B01",
    lat: 0.3,
    lng: 0.7,
    latency: 11,
  },
  {
    id: "S2",
    type: "solar",
    label: "Solar Meter B09",
    lat: 0.6,
    lng: 0.8,
    latency: 16,
  },
  {
    id: "T1",
    type: "traffic",
    label: "Traffic Node 1",
    lat: 0.5,
    lng: 0.4,
    latency: 13,
  },
  {
    id: "T2",
    type: "traffic",
    label: "Traffic Node 2",
    lat: 0.2,
    lng: 0.6,
    latency: 15,
  },
  {
    id: "B1",
    type: "building",
    label: "Building Ctrl A",
    lat: 0.7,
    lng: 0.15,
    latency: 10,
  },
  {
    id: "B2",
    type: "building",
    label: "Building Ctrl B",
    lat: 0.4,
    lng: 0.9,
    latency: 18,
  },
];

// ── HELPERS ────────────────────────────────────────────────────────────────────

function getComfortColor(score) {
  if (score >= 90) return "#00e5a0";
  if (score >= 75) return "#4caf50";
  if (score >= 60) return "#f4c430";
  if (score >= 45) return "#ff6b2b";
  return "#e8294a";
}

function getWilayaColor(score) {
  if (score >= 75) return "#00e5a0";
  if (score >= 50) return "#f4c430";
  return "#e8294a";
}

function getWilayaLabel(score) {
  if (score >= 75) return "Immediate";
  if (score >= 50) return "6 months";
  return "Planning";
}

// ── COMPONENTS ─────────────────────────────────────────────────────────────────

function LiveBalanceWidget({ data }) {
  const totalProd = data.solar + data.piezo;
  const net = +(totalProd - data.demand).toFixed(1);
  const isSurplus = net >= 0;
  return (
    <div className="card">
      <div className="card-title">District Live Energy Balance</div>
      <div className="balance-hero">
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: isSurplus ? "var(--green)" : "var(--red)",
          }}
        >
          {isSurplus ? "▲ SURPLUS" : "▼ DEFICIT"}
        </div>
        <div
          className="balance-number"
          style={{ color: isSurplus ? "var(--green)" : "var(--red)" }}
        >
          {isSurplus ? "+" : ""}
          {net}
          <span
            style={{ fontSize: 20, fontWeight: 400, color: "var(--muted)" }}
          >
            kW
          </span>
        </div>
        <div className="balance-label" style={{ color: "var(--muted)" }}>
          NET BALANCE
        </div>
        <div className="sources-row">
          <div className="source-item">
            <span className="source-value" style={{ color: "var(--yellow)" }}>
              {data.solar}kW
            </span>
            <span className="source-label">Solar</span>
          </div>
          <div className="source-divider" />
          <div className="source-item">
            <span className="source-value" style={{ color: "var(--blue)" }}>
              {data.piezo}kW
            </span>
            <span className="source-label">Piezo</span>
          </div>
          <div className="source-divider" />
          <div className="source-item">
            <span className="source-value" style={{ color: "var(--red)" }}>
              {data.demand}kW
            </span>
            <span className="source-label">Demand</span>
          </div>
          <div className="source-divider" />
          <div className="source-item">
            <span className="source-value" style={{ color: "var(--text)" }}>
              {((totalProd / data.demand) * 100).toFixed(0)}%
            </span>
            <span className="source-label">Renew.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RLDecisionsWidget({ tick }) {
  // API action space: lighting=[10%,40%,70%,85%,100%], hvac=[off,eco,standard,full], ev=[paused,slow,fast], traffic=[eco,standard,adaptive]
  const lightingLevels = [10, 40, 70, 85, 100];
  const lighting = lightingLevels[Math.floor(tick / 3) % 5];
  const hvacModes = ["OFF", "ECO", "STANDARD", "FULL"];
  const hvac = hvacModes[Math.floor(tick / 4) % 4];
  const evModes = ["PAUSED", "SLOW", "FAST"];
  const ev = evModes[tick % 3];
  const trafficModes = ["ECO", "STANDARD", "ADAPTIVE"];
  const traffic = trafficModes[Math.floor(tick / 5) % 3];
  const batteryModes = ["CHARGE", "DISCHARGE", "HOLD"];
  const battery = batteryModes[Math.floor(tick / 6) % 3];
  const confidence = 0.78 + Math.sin(tick * 0.03) * 0.12;
  return (
    <div className="card">
      <div className="card-title">RL Agent — Live Decisions</div>
      <div className="rl-grid">
        <div className="rl-item">
          <div className="rl-item-label">Street Lighting</div>
          <div className="rl-item-value">{lighting}%</div>
          <div className="rl-bar">
            <div
              className="rl-bar-fill"
              style={{ width: `${lighting}%`, background: "var(--yellow)" }}
            />
          </div>
        </div>
        <div className="rl-item">
          <div className="rl-item-label">HVAC Mode</div>
          <div
            className="rl-item-value"
            style={{
              color:
                hvac === "OFF"
                  ? "var(--muted)"
                  : hvac === "ECO"
                    ? "var(--green)"
                    : hvac === "FULL"
                      ? "var(--red)"
                      : "var(--yellow)",
            }}
          >
            {hvac}
          </div>
          <div className="rl-bar">
            <div
              className="rl-bar-fill"
              style={{
                width:
                  hvac === "OFF"
                    ? "5%"
                    : hvac === "ECO"
                      ? "30%"
                      : hvac === "STANDARD"
                        ? "60%"
                        : "90%",
                background: "var(--blue)",
              }}
            />
          </div>
        </div>
        <div className="rl-item">
          <div className="rl-item-label">EV Charging</div>
          <div
            className="rl-item-value"
            style={{
              color:
                ev === "PAUSED"
                  ? "var(--muted)"
                  : ev === "SLOW"
                    ? "var(--yellow)"
                    : "var(--green)",
            }}
          >
            {ev}
          </div>
          <div className="rl-bar">
            <div
              className="rl-bar-fill"
              style={{
                width: ev === "PAUSED" ? "5%" : ev === "SLOW" ? "50%" : "95%",
                background: "var(--green)",
              }}
            />
          </div>
        </div>
        <div className="rl-item">
          <div className="rl-item-label">Traffic Signals</div>
          <div
            className="rl-item-value"
            style={{
              color:
                traffic === "ADAPTIVE"
                  ? "var(--green)"
                  : traffic === "ECO"
                    ? "var(--blue)"
                    : "var(--yellow)",
            }}
          >
            {traffic}
          </div>
          <div className="rl-bar">
            <div
              className="rl-bar-fill"
              style={{
                width:
                  traffic === "ADAPTIVE"
                    ? "85%"
                    : traffic === "STANDARD"
                      ? "50%"
                      : "25%",
                background: "var(--green)",
              }}
            />
          </div>
        </div>
        <div className="rl-item">
          <div className="rl-item-label">Battery</div>
          <div
            className="rl-item-value"
            style={{
              color:
                battery === "CHARGE"
                  ? "var(--green)"
                  : battery === "DISCHARGE"
                    ? "var(--yellow)"
                    : "var(--muted)",
            }}
          >
            {battery}
          </div>
          <div className="rl-bar">
            <div
              className="rl-bar-fill"
              style={{
                width:
                  battery === "CHARGE"
                    ? "80%"
                    : battery === "DISCHARGE"
                      ? "60%"
                      : "30%",
                background:
                  battery === "CHARGE"
                    ? "var(--green)"
                    : battery === "DISCHARGE"
                      ? "var(--yellow)"
                      : "var(--muted)",
              }}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
          paddingTop: 10,
          borderTop: "1px solid var(--border)",
        }}
      >
        <div className="rl-reasoning">
          ↳ Solar surplus detected. Pre-cooling B03 and B05. EV charging at
          {ev === "FAST" ? " fast" : ev === "SLOW" ? " slow" : " paused"}.
          Lighting at {lighting}%.
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--muted)",
            whiteSpace: "nowrap",
            marginLeft: 12,
          }}
        >
          Confidence:{" "}
          <span
            style={{
              color: "var(--green)",
              fontFamily: "Space Mono",
              fontWeight: 700,
            }}
          >
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function ForecastWidget({ forecastData }) {
  const CustomDot = ({ cx, cy, payload }) => {
    if (!payload.isPast) return null;
    return null;
  };
  return (
    <div className="card">
      <div className="card-title">48h Production & Demand Forecast</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={forecastData}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gSolar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f4c430" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f4c430" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gPiezo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2196f3" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2196f3" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gDemand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e8294a" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#e8294a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.08)"
          />
          <XAxis
            dataKey="hour"
            tick={{ fill: "#4a6580", fontSize: 9 }}
            interval={7}
          />
          <YAxis tick={{ fill: "#4a6580", fontSize: 9 }} />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 10, 10, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 12,
              fontSize: 11,
              backdropFilter: "blur(20px)",
            }}
            labelStyle={{ color: "#c8d8e8" }}
          />
          <Area
            type="monotone"
            dataKey="solar"
            stroke="#f4c430"
            strokeWidth={2}
            fill="url(#gSolar)"
            name="Solar kW"
            strokeDasharray={(d) => (d?.isPast ? "0" : "4 2")}
          />
          <Area
            type="monotone"
            dataKey="piezo"
            stroke="#2196f3"
            strokeWidth={2}
            fill="url(#gPiezo)"
            name="Piezo kW"
          />
          <Area
            type="monotone"
            dataKey="demand"
            stroke="#e8294a"
            strokeWidth={2}
            fill="url(#gDemand)"
            name="Demand kW"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 10,
          justifyContent: "center",
        }}
      >
        {[
          ["#f4c430", "Solar"],
          ["#2196f3", "Piezo"],
          ["#e8294a", "Demand"],
        ].map(([c, l]) => (
          <div
            key={l}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            <div
              style={{ width: 12, height: 3, background: c, borderRadius: 2 }}
            />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function BuildingsWidget({ buildings, onSelect }) {
  return (
    <div className="card">
      <div className="card-title">All 15 Buildings — Live Status</div>
      <div className="buildings-grid">
        {buildings.map((b) => {
          const net = b.solar + b.piezo - b.demand;
          return (
            <div
              key={b.id}
              className={`building-card ${b.status}`}
              onClick={() => onSelect(b)}
            >
              {b.anomaly && <div className="anomaly-dot" />}
              <div className="building-id">{b.id}</div>
              <div className="building-name">{b.name}</div>
              <div className="building-stats">
                <span
                  style={{
                    color:
                      b.status === "surplus"
                        ? "var(--green)"
                        : b.status === "deficit"
                          ? "var(--red)"
                          : "var(--yellow)",
                  }}
                >
                  {net >= 0 ? "+" : ""}
                  {net.toFixed(1)}kW
                </span>
                <span style={{ color: "var(--muted)" }}>{b.demand}↓</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CO2Widget({ tick }) {
  // API: 0.51 kg CO2/kWh base emission factor (Algeria grid average)
  // Simulate grid import vs renewable to compute avoided emissions
  const EMISSION_FACTOR = 0.51; // kg CO2 per kWh
  const totalDemand = BUILDINGS.reduce((s, b) => s + b.demand, 0); // ~267.6 kW
  const totalRenewable = BUILDINGS.reduce((s, b) => s + b.solar + b.piezo, 0); // ~211.6 + 66.9
  const gridImport = Math.max(0, totalDemand - totalRenewable);
  const fullGridCO2 = totalDemand * EMISSION_FACTOR; // if 100% grid
  const actualCO2 = gridImport * EMISSION_FACTOR; // only grid imports emit
  const hoursToday = new Date().getHours() + tick * 0.0003; // simulate time progression
  const co2Avoided = +((fullGridCO2 - actualCO2) * hoursToday).toFixed(1);
  const co2Emitted = +(actualCO2 * hoursToday).toFixed(1);
  const trees = Math.floor(co2Avoided / 21);
  const renewableShare = ((totalRenewable / totalDemand) * 100).toFixed(0);
  const avoidedPct = ((co2Avoided / (co2Avoided + co2Emitted)) * 100).toFixed(
    0,
  );
  return (
    <div className="card">
      <div className="card-title">CO₂ Tracking — District Emissions</div>
      <div className="co2-big">
        {co2Avoided}
        <span className="co2-unit"> kg avoided</span>
      </div>
      <div className="co2-equiv">
        <span style={{ fontSize: 18 }}></span>
        <span style={{ fontSize: 13, color: "var(--text)" }}>
          = <strong style={{ color: "var(--green)" }}>{trees} trees</strong>{" "}
          equivalent today
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 14,
          fontSize: 11,
          color: "var(--muted)",
        }}
      >
        <span>Grid emission factor: {EMISSION_FACTOR} kg/kWh</span>
        <span style={{ color: "var(--green)" }}>
          {avoidedPct}% avoided vs full grid
        </span>
      </div>
      <div className="co2-bar-track">
        <div className="co2-bar-fill" style={{ width: `${avoidedPct}%` }} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
          fontSize: 11,
          color: "var(--muted)",
        }}
      >
        <span>
          Emitted today:{" "}
          <strong style={{ color: "var(--red)" }}>{co2Emitted} kg</strong>
        </span>
        <span>
          Renewable share:{" "}
          <strong style={{ color: "var(--green)" }}>{renewableShare}%</strong>
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid var(--border)",
        }}
      >
        {[
          [
            `~${(((fullGridCO2 - actualCO2) * 720) / 1000).toFixed(0)}t`,
            "Avoided/Month",
          ],
          [
            `~${(((fullGridCO2 - actualCO2) * 8760) / 1000).toFixed(0)}t`,
            "Avoided/Year",
          ],
          [`${((actualCO2 * 24) / 1000).toFixed(1)}t`, "Emitted/Day"],
        ].map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "Space Mono",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--white)",
              }}
            >
              {v}
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
              {l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TradingWidget({ trades }) {
  const totalSaved = 284.5;
  return (
    <div className="card">
      <div className="card-title">P2P Energy Trading — Live Market</div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 14,
          padding: "10px 14px",
          background: "var(--surface2)",
          borderRadius: 6,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "Space Mono",
              fontSize: 16,
              color: "var(--green)",
              fontWeight: 700,
            }}
          >
            2.81
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            DZD/kWh avg
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "Space Mono",
              fontSize: 16,
              color: "var(--yellow)",
              fontWeight: 700,
            }}
          >
            28.0 kWh
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            Volume today
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "Space Mono",
              fontSize: 16,
              color: "var(--white)",
              fontWeight: 700,
            }}
          >
            {totalSaved} DZD
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            Saved vs grid
          </div>
        </div>
      </div>
      {trades.map((t, i) => (
        <div key={i} className="trade-item">
          <div className="trade-flow">
            <span style={{ color: "var(--white)", fontWeight: 700 }}>
              {t.seller}
            </span>
            <span className="trade-arrow">→</span>
            <span style={{ color: "var(--white)", fontWeight: 700 }}>
              {t.buyer}
            </span>
          </div>
          <span className="trade-amount">{t.amount} kWh</span>
          <span
            style={{
              fontFamily: "Space Mono",
              fontSize: 11,
              color: "var(--yellow)",
            }}
          >
            {t.price} DZD
          </span>
          <span className="trade-time">{t.time}</span>
        </div>
      ))}
    </div>
  );
}

function ComfortWidget({ buildings }) {
  return (
    <div className="card">
      <div className="card-title">Indoor Comfort Heatmap — All Buildings</div>
      <div className="comfort-grid">
        {buildings.map((b) => (
          <div
            key={b.id}
            className="comfort-cell"
            title={`${b.name}: ${b.comfort}`}
            style={{ background: getComfortColor(b.comfort) }}
          >
            <span className="comfort-score">{b.comfort}</span>
            <span className="comfort-id">{b.id}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
          fontSize: 10,
          color: "var(--muted)",
        }}
      >
        {[
          ["#e8294a", "<45 Poor"],
          ["#ff6b2b", "45-60"],
          ["#f4c430", "60-75"],
          ["#4caf50", "75-90"],
          ["#00e5a0", "90+ Optimal"],
        ].map(([c, l]) => (
          <div
            key={l}
            style={{ display: "flex", alignItems: "center", gap: 3 }}
          >
            <div
              style={{ width: 8, height: 8, borderRadius: 2, background: c }}
            />
            <span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Network5GWidget({ nodes, tick }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width,
      h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2,
      cy = h / 2;
    nodes.forEach((node, idx) => {
      const x = node.lng * w,
        y = node.lat * h;
      const phase = (tick * 0.05 + idx * 0.8) % 1;
      const px = cx + (x - cx) * phase,
        py = cy + (y - cy) * phase;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(33,150,243,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(33,150,243,0.8)";
      ctx.fill();
    });
  }, [tick, nodes]);

  const nodeColors = {
    piezo: "#2196f3",
    solar: "#f4c430",
    traffic: "#00e5a0",
    building: "#e8294a",
  };

  return (
    <div className="card">
      <div className="card-title">5G Network — mMTC & Network Slicing</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {["City Ops", "Energy", "Citizens"].map((slice, i) => (
          <div
            key={slice}
            style={{
              flex: 1,
              padding: "5px 8px",
              background: [
                "rgba(232,41,74,0.1)",
                "rgba(0,229,160,0.1)",
                "rgba(33,150,243,0.1)",
              ][i],
              border: `1px solid ${["rgba(232,41,74,0.3)", "rgba(0,229,160,0.3)", "rgba(33,150,243,0.3)"][i]}`,
              borderRadius: 4,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: ["var(--red)", "var(--green)", "var(--blue)"][i],
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              SLICE {i + 1}
            </div>
            <div style={{ fontSize: 11, color: "var(--white)", marginTop: 2 }}>
              {slice}
            </div>
          </div>
        ))}
      </div>
      <div className="network-canvas">
        <canvas
          ref={canvasRef}
          width={600}
          height={220}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        <div className="base-station"></div>
        {nodes.map((node) => (
          <div
            key={node.id}
            className="node-dot"
            title={`${node.label} — ${node.latency}ms`}
            style={{
              left: `${node.lng * 100}%`,
              top: `${node.lat * 100}%`,
              background: nodeColors[node.type],
              color: nodeColors[node.type],
            }}
          />
        ))}
      </div>
      <div className="network-stats">
        {[
          ["8", "Active Nodes"],
          [`${nodes.length * 120 + (tick % 50)}/s`, "Packets"],
          ["~13ms", "Avg Latency"],
          ["3", "Net Slices"],
        ].map(([v, l]) => (
          <div key={l} className="net-stat">
            <span className="net-stat-value">{v}</span>
            <span className="net-stat-label">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WilayaWidget({ wilayas }) {
  const [season, setSeason] = useState("summer");
  return (
    <div className="card">
      <div className="card-title">Algeria Wilaya — PED Candidate Scores</div>
      <div className="season-tabs">
        {["summer", "spring", "autumn", "winter"].map((s) => (
          <button
            key={s}
            className={`season-tab ${season === s ? "active" : ""}`}
            onClick={() => setSeason(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div className="wilaya-list">
        {wilayas
          .sort((a, b) => b.score - a.score)
          .map((w, i) => (
            <div key={w.name} className="wilaya-item">
              <span className="wilaya-rank">#{i + 1}</span>
              <div
                className="wilaya-dot"
                style={{ background: getWilayaColor(w.score) }}
              />
              <span className="wilaya-name">{w.name}</span>
              <div className="wilaya-score-bar">
                <div
                  className="wilaya-score-fill"
                  style={{
                    width: `${w.score}%`,
                    background: getWilayaColor(w.score),
                  }}
                />
              </div>
              <span
                className="wilaya-score-num"
                style={{ color: getWilayaColor(w.score) }}
              >
                {w.score}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "var(--muted)",
                  width: 60,
                  textAlign: "right",
                }}
              >
                {getWilayaLabel(w.score)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function EnergyMixWidget({ buildings }) {
  const totalSolar = buildings.reduce((s, b) => s + b.solar, 0);
  const totalPiezo = buildings.reduce((s, b) => s + b.piezo, 0);
  const totalDemand = buildings.reduce((s, b) => s + b.demand, 0);
  const gridImport = Math.max(0, totalDemand - totalSolar - totalPiezo);
  const total = totalSolar + totalPiezo + gridImport;
  const data = [
    { name: "Solar", value: +totalSolar.toFixed(1), color: "#f4c430" },
    { name: "Piezo", value: +totalPiezo.toFixed(1), color: "#2196f3" },
    { name: "Grid", value: +gridImport.toFixed(1), color: "#e8294a" },
  ];
  const renewablePct = (((totalSolar + totalPiezo) / total) * 100).toFixed(0);
  return (
    <div className="card">
      <div className="card-title">District Energy Mix</div>
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <PieChart width={180} height={180}>
          <Pie
            data={data}
            cx={85}
            cy={85}
            innerRadius={55}
            outerRadius={80}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((e, i) => (
              <Cell key={i} fill={e.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="donut-center">
          <div className="donut-pct">{renewablePct}%</div>
          <div className="donut-label">Renewable</div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginTop: 4,
        }}
      >
        {data.map((d) => (
          <div
            key={d.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: d.color,
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, color: "var(--text)" }}>{d.name}</span>
            <span
              style={{
                fontFamily: "Space Mono",
                fontSize: 12,
                color: "var(--white)",
              }}
            >
              {d.value} kW
            </span>
            <span style={{ color: "var(--muted)", fontSize: 10 }}>
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnomaliesWidget({ buildings }) {
  const anomalies = buildings
    .filter((b) => b.anomaly)
    .map((b) => ({ ...b.anomaly, building: b.name, id: b.id }));
  const typeLabels = {
    solar_underperformance:
      "Solar panel underperforming — production 40% below expected",
    consumption_spike: "Unusual consumption spike detected — 3x baseline",
  };
  return (
    <div className="card">
      <div className="card-title">Anomaly Detection — Active Alerts</div>
      {anomalies.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "var(--muted)",
            padding: "20px 0",
            fontSize: 13,
          }}
        >
          ✓ No anomalies detected
        </div>
      ) : (
        <div className="anomaly-list">
          {anomalies.map((a, i) => (
            <div key={i} className={`anomaly-item ${a.severity}`}>
              <span className={`anomaly-severity ${a.severity}`}>
                {a.severity}
              </span>
              <div>
                <span className="anomaly-building">
                  {a.building} ({a.id})
                </span>
                <div className="anomaly-text">{typeLabels[a.type]}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 12,
          fontSize: 11,
        }}
      >
        {[
          ["var(--red)", "HIGH", 0],
          ["var(--orange)", "MEDIUM", 1],
          ["var(--yellow)", "LOW", 1],
        ].map(([c, l, n]) => (
          <div
            key={l}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{ width: 8, height: 8, borderRadius: 50, background: c }}
            />
            <span style={{ color: "var(--muted)" }}>
              {l}: <strong style={{ color: c }}>{n}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TABS ───────────────────────────────────────────────────────────────────────

const TABS = [
  "Overview",
  "AI Decisions",
  "Forecast",
  "Buildings",
  "Regional",
  "Network 5G",
  "Trading",
  "Sustainability",
];

// ── MAIN APP ───────────────────────────────────────────────────────────────────

export default function PEDDashboard() {
  const [tab, setTab] = useState("Overview");
  const [tick, setTick] = useState(0);
  const [forecastData] = useState(generateForecastData);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const liveData = {
    solar: +(
      BUILDINGS.reduce((s, b) => s + b.solar, 0) +
      Math.sin(tick * 0.05) * 2
    ).toFixed(1),
    piezo: +(
      BUILDINGS.reduce((s, b) => s + b.piezo, 0) +
      Math.sin(tick * 0.08) * 0.5
    ).toFixed(1),
    demand: +(
      BUILDINGS.reduce((s, b) => s + b.demand, 0) +
      Math.cos(tick * 0.04) * 3
    ).toFixed(1),
  };

  const renderTab = () => {
    switch (tab) {
      case "Overview":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="grid-3">
              <LiveBalanceWidget data={liveData} />
              <CO2Widget tick={tick} />
              <EnergyMixWidget buildings={BUILDINGS} />
            </div>
            <div className="grid-2">
              <RLDecisionsWidget tick={tick} />
              <AnomaliesWidget buildings={BUILDINGS} />
            </div>
          </div>
        );
      case "AI Decisions":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <RLDecisionsWidget tick={tick} />
            <ForecastWidget forecastData={forecastData} />
          </div>
        );
      case "Forecast":
        return <ForecastWidget forecastData={forecastData} />;
      case "Buildings":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <BuildingsWidget
              buildings={BUILDINGS}
              onSelect={setSelectedBuilding}
            />
            {selectedBuilding && (
              <div className="card">
                <div className="card-title">
                  Selected — {selectedBuilding.name}
                </div>
                <div className="grid-4">
                  {[
                    ["Solar", `${selectedBuilding.solar} kW`, "var(--yellow)"],
                    ["Piezo", `${selectedBuilding.piezo} kW`, "var(--blue)"],
                    ["Demand", `${selectedBuilding.demand} kW`, "var(--red)"],
                    [
                      "Comfort",
                      `${selectedBuilding.comfort}/100`,
                      "var(--green)",
                    ],
                  ].map(([l, v, c]) => (
                    <div
                      key={l}
                      className="card"
                      style={{ textAlign: "center", padding: 16 }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          marginBottom: 6,
                        }}
                      >
                        {l}
                      </div>
                      <div
                        style={{
                          fontFamily: "Space Mono",
                          fontSize: 22,
                          fontWeight: 700,
                          color: c,
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ComfortWidget buildings={BUILDINGS} />
          </div>
        );
      case "Regional":
        return <WilayaWidget wilayas={WILAYAS} />;
      case "Network 5G":
        return <Network5GWidget nodes={NODES_5G} tick={tick} />;
      case "Trading":
        return <TradingWidget trades={TRADES} />;
      case "Sustainability":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="grid-2">
              <CO2Widget tick={tick} />
              <EnergyMixWidget buildings={BUILDINGS} />
            </div>
            <AnomaliesWidget buildings={BUILDINGS} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="dashboard-wrapper">
        <div className="dashboard">
          <div className="header">
            <div className="header-left">
              <h1>Dashboard</h1>
              <p>Tech4Connect · Huawei Algeria</p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  fontFamily: "Space Mono",
                  fontSize: 11,
                  color: "var(--muted)",
                }}
              >
                {new Date().toLocaleTimeString()}
              </div>
              <div className="ped-badge">
                <div className="ped-dot" />
                <span
                  style={{
                    fontFamily: "Space Mono",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--red)",
                  }}
                >
                  PED ACTIVE
                </span>
              </div>
            </div>
          </div>

          <div className="nav-tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`nav-tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {renderTab()}

          {selectedBuilding && tab !== "Buildings" && (
            <div
              style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12,
                display: "flex",
                gap: 10,
                alignItems: "center",
                zIndex: 100,
              }}
            >
              <span style={{ color: "var(--muted)" }}>Selected:</span>
              <span style={{ color: "var(--white)", fontWeight: 600 }}>
                {selectedBuilding.name}
              </span>
              <button
                onClick={() => setSelectedBuilding(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
