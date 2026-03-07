import React from "react";
import "./PowerGrid.css";

export default function PowerGrid() {
  return (
    <section className="powergrid-section">
      <div className="powergrid-shell">
        {/* Left: Blue wires coming down from Footsteps */}
        <div className="powergrid-wires">
          <svg
            viewBox="0 0 120 200"
            preserveAspectRatio="none"
            className="powergrid-svg"
          >
            <path
              className="wire-track"
              vectorEffect="non-scaling-stroke"
              d="M 30 0 V 60 H 80 V 140 H 40 V 200"
            />
            <path
              className="wire-track"
              vectorEffect="non-scaling-stroke"
              d="M 50 0 V 50 H 100 V 130 H 60 V 200"
            />
            <path
              className="wire-track"
              vectorEffect="non-scaling-stroke"
              d="M 70 0 V 40 H 110 V 120 H 80 V 200"
            />

            <path
              className="wire-pulse wire-pulse--blue"
              vectorEffect="non-scaling-stroke"
              d="M 30 0 V 60 H 80 V 140 H 40 V 200"
            />
            <path
              className="wire-pulse wire-pulse--blue"
              vectorEffect="non-scaling-stroke"
              d="M 50 0 V 50 H 100 V 130 H 60 V 200"
              style={{ animationDelay: "0.5s" }}
            />
            <path
              className="wire-pulse wire-pulse--blue"
              vectorEffect="non-scaling-stroke"
              d="M 70 0 V 40 H 110 V 120 H 80 V 200"
              style={{ animationDelay: "1s" }}
            />

            <polygon
              className="wire-arrow wire-arrow--blue"
              points="40,195 30,180 50,180"
            />
            <polygon
              className="wire-arrow wire-arrow--blue"
              points="60,195 50,180 70,180"
            />
            <polygon
              className="wire-arrow wire-arrow--blue"
              points="80,195 70,180 90,180"
            />
          </svg>
        </div>

        {/* Center: Explanation */}
        <div className="powergrid-copy">
          <p className="powergrid-label">Dual Source Charging</p>
          <h2 className="powergrid-headline">
            CONVERGING
            <br />
            POWER LINES
          </h2>
          <p className="powergrid-description">
            Footstep-generated electricity and solar energy from the smart city
            both feed into the central battery array. The city also draws from
            stored reserves when demand peaks — creating a self-sustaining
            bidirectional energy loop.
          </p>
          <div className="powergrid-indicators">
            <div className="powergrid-indicator">
              <span className="indicator-dot indicator-dot--blue"></span>
              <span>Footsteps → Battery</span>
            </div>
            <div className="powergrid-indicator">
              <span className="indicator-dot indicator-dot--red"></span>
              <span>Solar Panels → Battery</span>
            </div>
            <div className="powergrid-indicator">
              <span className="indicator-dot indicator-dot--cyan"></span>
              <span>Battery ↔ City</span>
            </div>
          </div>
        </div>

        {/* Right: Red wires coming down from Smart City */}
        <div className="powergrid-wires">
          <svg
            viewBox="0 0 120 200"
            preserveAspectRatio="none"
            className="powergrid-svg"
          >
            <path
              className="wire-track"
              vectorEffect="non-scaling-stroke"
              d="M 90 0 V 60 H 40 V 140 H 80 V 200"
            />
            <path
              className="wire-track"
              vectorEffect="non-scaling-stroke"
              d="M 70 0 V 50 H 20 V 130 H 60 V 200"
            />
            <path
              className="wire-track"
              vectorEffect="non-scaling-stroke"
              d="M 50 0 V 40 H 10 V 120 H 40 V 200"
            />

            <path
              className="wire-pulse wire-pulse--red"
              vectorEffect="non-scaling-stroke"
              d="M 90 0 V 60 H 40 V 140 H 80 V 200"
            />
            <path
              className="wire-pulse wire-pulse--red"
              vectorEffect="non-scaling-stroke"
              d="M 70 0 V 50 H 20 V 130 H 60 V 200"
              style={{ animationDelay: "0.5s" }}
            />
            <path
              className="wire-pulse wire-pulse--red"
              vectorEffect="non-scaling-stroke"
              d="M 50 0 V 40 H 10 V 120 H 40 V 200"
              style={{ animationDelay: "1s" }}
            />

            <polygon
              className="wire-arrow wire-arrow--red"
              points="80,195 70,180 90,180"
            />
            <polygon
              className="wire-arrow wire-arrow--red"
              points="60,195 50,180 70,180"
            />
            <polygon
              className="wire-arrow wire-arrow--red"
              points="40,195 30,180 50,180"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
