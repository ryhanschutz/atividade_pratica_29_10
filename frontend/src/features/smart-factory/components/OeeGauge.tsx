// src/features/smart-factory/components/OeeGauge.tsx
import React from "react";

interface OeeGaugeProps {
  title: string;
  value: number; // 0 to 100
  color?: string;
  size?: number;
}

export const OeeGauge: React.FC<OeeGaugeProps> = ({
  title,
  value,
  color = "#84cc16", // Lime green matching reference image
  size = 110,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc fills percentage of circumference
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: "1 1 0px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--sf-text-primary, #1e293b)",
          marginBottom: "6px",
          textAlign: "center",
        }}
      >
        {title}
      </div>

      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background track arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--sf-gauge-track, #e2e8f0)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s ease-in-out",
            }}
          />
        </svg>

        {/* Center percentage label */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--sf-text-primary, #1e293b)",
          }}
        >
          {value.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

