import { useState, useMemo } from "react";
import "./AlgeriaMap.css";

// Approximate wilaya centers in dz.svg coordinate space (viewBox 0 0 1000 1000)
const POSITIONS = {
  Algiers:     { x: 570, y: 72 },
  Oran:        { x: 390, y: 102 },
  Constantine: { x: 730, y: 95 },
  Annaba:      { x: 760, y: 58 },
  Setif:       { x: 660, y: 110 },
  Batna:       { x: 705, y: 135 },
  Tlemcen:     { x: 340, y: 155 },
  Bechar:      { x: 280, y: 380 },
  Ghardaia:    { x: 590, y: 300 },
  Biskra:      { x: 660, y: 185 },
  Djelfa:      { x: 570, y: 170 },
  Medea:       { x: 540, y: 120 },
  Tiaret:      { x: 490, y: 150 },
  Laghouat:    { x: 530, y: 220 },
  "El Oued":   { x: 720, y: 240 },
  Ouargla:     { x: 660, y: 350 },
  Adrar:       { x: 390, y: 530 },
  Tindouf:     { x: 155, y: 510 },
  Tamanrasset: { x: 620, y: 780 },
  Illizi:      { x: 810, y: 580 },
};

// Mock PED scores by season (AI API will provide real data — top 5)
const SEASON_DATA = {
  summer: {
    Algiers: 78, Oran: 82, Constantine: 71, Annaba: 74, Setif: 69,
    Batna: 66, Tlemcen: 73, Bechar: 91, Ghardaia: 88, Biskra: 93,
    Djelfa: 72, Medea: 65, Tiaret: 68, Laghouat: 85, "El Oued": 90,
    Ouargla: 87, Adrar: 95, Tindouf: 89, Tamanrasset: 92, Illizi: 86,
  },
  spring: {
    Algiers: 81, Oran: 79, Constantine: 76, Annaba: 77, Setif: 74,
    Batna: 71, Tlemcen: 75, Bechar: 83, Ghardaia: 80, Biskra: 84,
    Djelfa: 78, Medea: 70, Tiaret: 73, Laghouat: 82, "El Oued": 85,
    Ouargla: 81, Adrar: 88, Tindouf: 79, Tamanrasset: 86, Illizi: 82,
  },
  autumn: {
    Algiers: 72, Oran: 70, Constantine: 68, Annaba: 69, Setif: 66,
    Batna: 64, Tlemcen: 67, Bechar: 76, Ghardaia: 73, Biskra: 78,
    Djelfa: 69, Medea: 63, Tiaret: 65, Laghouat: 74, "El Oued": 77,
    Ouargla: 75, Adrar: 80, Tindouf: 71, Tamanrasset: 79, Illizi: 74,
  },
  winter: {
    Algiers: 60, Oran: 58, Constantine: 55, Annaba: 56, Setif: 52,
    Batna: 50, Tlemcen: 54, Bechar: 63, Ghardaia: 61, Biskra: 66,
    Djelfa: 57, Medea: 49, Tiaret: 53, Laghouat: 62, "El Oued": 65,
    Ouargla: 64, Adrar: 70, Tindouf: 59, Tamanrasset: 68, Illizi: 63,
  },
};

const SURPLUS_MW = {
  Algiers: 12, Oran: 18, Constantine: 8, Annaba: 10, Setif: 6,
  Batna: 5, Tlemcen: 9, Bechar: 32, Ghardaia: 28, Biskra: 35,
  Djelfa: 11, Medea: 4, Tiaret: 7, Laghouat: 24, "El Oued": 30,
  Ouargla: 26, Adrar: 40, Tindouf: 22, Tamanrasset: 38, Illizi: 20,
};

function scoreColor(score) {
  if (score >= 85) return "#00e5a0";
  if (score >= 70) return "#f4c430";
  return "#e8294a";
}

function scoreTier(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  return "Low";
}

export default function AlgeriaMap() {
  const [season, setSeason] = useState("summer");
  const [topN, setTopN] = useState(5);
  const [hovered, setHovered] = useState(null);

  const scores = SEASON_DATA[season];

  const ranked = useMemo(
    () =>
      Object.entries(scores)
        .map(([name, score]) => ({ name, score, surplus: SURPLUS_MW[name] }))
        .sort((a, b) => b.score - a.score),
    [scores]
  );

  const topCandidates = ranked.slice(0, topN);
  const topSet = new Set(topCandidates.map((c) => c.name));

  const avgScore = Math.round(
    ranked.reduce((s, r) => s + r.score, 0) / ranked.length
  );
  const totalSurplus = topCandidates.reduce((s, c) => s + c.surplus, 0);

  return (
    <section className="pm-section">
      <div className="pm-header">
        <h2 className="pm-title">Algeria PED Potential Map</h2>
        <p className="pm-subtitle">
          Positive Energy District candidates ranked by renewable-energy score
        </p>
        <div className="pm-controls">
          <div className="pm-season-toggle">
            {["summer", "spring", "autumn", "winter"].map((s) => (
              <button
                key={s}
                className={`pm-season-btn${season === s ? " pm-active" : ""}`}
                onClick={() => setSeason(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="pm-topn-toggle">
            <span>Top</span>
            {[3, 5, 10].map((n) => (
              <button
                key={n}
                className={`pm-topn-btn${topN === n ? " pm-active" : ""}`}
                onClick={() => setTopN(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pm-body">
        <div className="pm-map-wrap">
          <svg viewBox="0 0 1000 1000" className="pm-map">
            {/* Algeria map background from dz.svg */}
            <image
              href="/dz.svg"
              x="0"
              y="0"
              width="1000"
              height="1000"
              className="pm-map-bg"
            />

            {/* Connection lines between top candidates */}
            {topCandidates.map((c, i) => {
              if (i === 0) return null;
              const prev = topCandidates[i - 1];
              const p1 = POSITIONS[prev.name];
              const p2 = POSITIONS[c.name];
              if (!p1 || !p2) return null;
              return (
                <line
                  key={`line-${i}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#00e5a0"
                  strokeWidth="1.2"
                  strokeDasharray="6 4"
                  opacity="0.3"
                />
              );
            })}

            {/* Wilaya dots */}
            {Object.entries(POSITIONS).map(([name, pos]) => {
              const score = scores[name];
              const isTop = topSet.has(name);
              const color = scoreColor(score);
              const tooltipX = pos.x > 800 ? pos.x - 160 : pos.x + 14;

              return (
                <g
                  key={name}
                  onMouseEnter={() => setHovered(name)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  {isTop && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="20"
                      fill={color}
                      className="pm-pulse"
                    />
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isTop ? 10 : 6}
                    fill={color}
                    stroke={isTop ? "#fff" : "none"}
                    strokeWidth="1.5"
                    opacity={isTop ? 1 : 0.5}
                  />
                  {isTop && (
                    <text
                      x={pos.x}
                      y={pos.y - 18}
                      textAnchor="middle"
                      fill="#c8d8e8"
                      fontSize="14"
                      fontWeight="600"
                    >
                      {name}
                    </text>
                  )}
                  {hovered === name && (
                    <g>
                      <rect
                        x={tooltipX}
                        y={pos.y - 30}
                        width="150"
                        height="55"
                        rx="6"
                        fill="#0d1b2a"
                        stroke={color}
                        strokeWidth="1"
                        opacity="0.95"
                      />
                      <text
                        x={tooltipX + 8}
                        y={pos.y - 12}
                        fill="#f0f8ff"
                        fontSize="13"
                        fontWeight="600"
                      >
                        {name}
                      </text>
                      <text
                        x={tooltipX + 8}
                        y={pos.y + 4}
                        fill={color}
                        fontSize="12"
                      >
                        Score: {score} — {scoreTier(score)}
                      </text>
                      <text
                        x={tooltipX + 8}
                        y={pos.y + 18}
                        fill="#8899aa"
                        fontSize="11"
                      >
                        Surplus: +{SURPLUS_MW[name]} MW
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="pm-sidebar">
          <h3 className="pm-sidebar-title">Top {topN} PED Candidates</h3>
          <div className="pm-card-list">
            {topCandidates.map((c, i) => (
              <div
                key={c.name}
                className={`pm-card${hovered === c.name ? " pm-card-hover" : ""}`}
                onMouseEnter={() => setHovered(c.name)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="pm-rank">#{i + 1}</span>
                <div className="pm-card-info">
                  <span className="pm-card-name">{c.name}</span>
                  <span className="pm-card-detail">
                    +{c.surplus} MW surplus
                  </span>
                </div>
                <span
                  className="pm-card-score"
                  style={{ color: scoreColor(c.score) }}
                >
                  {c.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pm-stats">
        <div className="pm-stat">
          <span className="pm-stat-value">{ranked.length}</span>
          <span className="pm-stat-label">Wilayas Analysed</span>
        </div>
        <div className="pm-stat">
          <span className="pm-stat-value" style={{ color: "#00e5a0" }}>
            {topCandidates[0]?.name}
          </span>
          <span className="pm-stat-label">Best Candidate</span>
        </div>
        <div className="pm-stat">
          <span className="pm-stat-value">{avgScore}</span>
          <span className="pm-stat-label">Avg Score</span>
        </div>
        <div className="pm-stat">
          <span className="pm-stat-value">+{totalSurplus} MW</span>
          <span className="pm-stat-label">Top-{topN} Surplus</span>
        </div>
      </div>
    </section>
  );
}
