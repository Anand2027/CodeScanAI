import React from "react";

export default function Header({ onBack }) {
  return (
    <header className="header">
      <div className="header-inner">
        {/* Back Button - CSS classes exact same hain, inline positioning use ki hai */}
        <button 
          className="back-btn" 
          onClick={onBack} 
          title="Back to home"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <span style={{ fontSize: "14px", lineHeight: "1" }}>←</span>
          <span>Home</span>
        </button>

        {/* Logo Section */}
        <div className="logo" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Hexagon icon ko modern grid/node icon `⬢` se badla jo standard font me zyada sharp dikhta hai */}
          <span className="logo-icon" style={{ lineHeight: "1" }}>⬢</span>
          <span className="logo-text" style={{ letterSpacing: "-0.5px" }}>
            CodeScan <span className="logo-ai">AI</span>
          </span>
        </div>

        {/* Subtitle with better spacing */}
        <p className="header-sub" style={{ opacity: 0.85, letterSpacing: "0.5px" }}>
          Bug Detection <span style={{ color: "var(--accent)", margin: "0 4px" }}>•</span> Code Quality <span style={{ color: "var(--accent)", margin: "0 4px" }}>•</span> Security Analysis
        </p>
      </div>
    </header>
  );
}