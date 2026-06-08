import React, { useState } from "react";

const SEVERITY_COLOR = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#22c55e",
};

const SEVERITY_BADGE = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
};

function ScoreRing({ score }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="score-ring-wrap">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#1e2433" strokeWidth="8" />
        <circle
          cx="45" cy="45" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="score-label">
        <span className="score-num" style={{ color }}>{score}</span>
        <span className="score-sub">/100</span>
      </div>
    </div>
  );
}

function IssueCard({ item, type }) {
  const sev = item.severity;
  return (
    <div className="issue-card" style={{ "--sev-color": SEVERITY_COLOR[sev] || "#3b82f6" }}>
      <div className="issue-header">
        <span className="issue-badge">{SEVERITY_BADGE[sev] || "💡"}</span>
        <span className="issue-title">{item.title}</span>
        {item.line && <span className="issue-line">line {item.line}</span>}
        {sev && (
          <span className="issue-sev" style={{ color: SEVERITY_COLOR[sev] }}>{sev}</span>
        )}
      </div>
      <p className="issue-desc">{item.description}</p>
      {(item.fix || item.suggestion) && (
        <div className="issue-fix">
          <span className="fix-label">{type === "quality" ? "Suggestion" : "Fix"}:</span>
          <span className="fix-text">{item.fix || item.suggestion}</span>
        </div>
      )}
    </div>
  );
}

function FixedCodePanel({ fixedCode, fixLoading, onFix, hasReview }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!fixedCode && !fixLoading) {
    return (
      <div className="fixed-empty">
        <div className="fixed-empty-icon">🛠️</div>
        <p className="fixed-empty-title">Get 100% Fixed Code</p>
        <p className="fixed-empty-sub">
          AI will apply all bug fixes, security patches, and quality improvements in one clean file.
        </p>
        <button className="generate-fix-btn" onClick={onFix} disabled={!hasReview}>
          ✨ Generate Fixed Code
        </button>
      </div>
    );
  }

  return (
    <div className="fixed-code-wrap">
      <div className="fixed-code-toolbar">
        <span className="fixed-code-label">
          {fixLoading ? "⚡ Generating fixed code..." : "✅ Fixed Code — Ready to use"}
        </span>
        {fixedCode && !fixLoading && (
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? "✅ Copied!" : "📋 Copy All"}
          </button>
        )}
      </div>
      <pre className="fixed-code-block">
        <code>{fixedCode || " "}</code>
      </pre>
      {fixedCode && !fixLoading && (
        <div className="fixed-code-footer">
          <span className="fixed-note">⚠️ Review the changes before using in production.</span>
          <button className="copy-btn-bottom" onClick={handleCopy}>
            {copied ? "✅ Copied!" : "📋 Copy Code"}
          </button>
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="skeleton-wrap">
      <div className="skeleton-header">
        <div className="skel skel-ring" />
        <div className="skel-lines">
          <div className="skel skel-line w60" />
          <div className="skel skel-line w40" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="skel-card">
          <div className="skel skel-line w80" />
          <div className="skel skel-line w60" />
          <div className="skel skel-line w90" />
        </div>
      ))}
    </div>
  );
}

export default function ReviewPanel({ review, loading, activeTab, setActiveTab, fixedCode, fixLoading, onFix }) {
  if (loading && !review) return (
    <div className="review-panel">
      <div className="review-loading-msg">🤖 AI is analyzing your code...</div>
      <Skeleton />
    </div>
  );

  if (!review) return null;

  const totalIssues = (review.bugs?.length || 0) + (review.security?.length || 0);

  const tabs = [
    { id: "bugs", label: "🐛 Bugs", count: review.bugs?.length || 0 },
    { id: "quality", label: "✨ Quality", count: review.quality?.length || 0 },
    { id: "security", label: "🔒 Security", count: review.security?.length || 0 },
    { id: "positives", label: "✅ Positives", count: review.positives?.length || 0 },
    { id: "fixed", label: "🛠️ Fixed Code", count: null, highlight: true },
  ];

  const metrics = review.metrics || {};

  return (
    <div className="review-panel">
      {/* Summary Bar */}
      <div className="summary-bar">
        <ScoreRing score={review.score || 0} />
        <div className="summary-info">
          <div className="summary-meta">
            <span className="lang-tag">{review.language || "Unknown"}</span>
            {Object.entries(metrics).map(([k, v]) => (
              <span key={k} className={`metric-tag metric-${v}`}>
                {k}: {v}
              </span>
            ))}
          </div>
          <p className="summary-text">{review.summary}</p>
        </div>
        {totalIssues > 0 && (
          <button className="quick-fix-btn" onClick={() => { onFix(); }}>
            🛠️ Fix All Issues
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? "active" : ""} ${t.highlight ? "tab-highlight" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {t.count !== null && <span className="tab-count">{t.count}</span>}
            {t.id === "fixed" && (fixedCode || fixLoading) && (
              <span className="tab-count tab-count-ready">●</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="tab-content">
        {activeTab === "fixed" ? (
          <FixedCodePanel
            fixedCode={fixedCode}
            fixLoading={fixLoading}
            onFix={onFix}
            hasReview={!!review}
          />
        ) : activeTab === "positives" ? (
          <ul className="positives-list">
            {(review.positives || []).map((p, i) => (
              <li key={i} className="positive-item">✅ {p}</li>
            ))}
            {(!review.positives || review.positives.length === 0) && (
              <p className="empty-msg">No positives noted.</p>
            )}
          </ul>
        ) : (
          <div className="issues-list">
            {(review[activeTab] || []).map((item, i) => (
              <IssueCard key={i} item={item} type={activeTab} />
            ))}
            {(!review[activeTab] || review[activeTab].length === 0) && (
              <p className="empty-msg">🎉 No issues found in this category!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}