import React, { useState } from "react";

const LANGUAGES = [
  "Auto Detect", "JavaScript", "TypeScript", "Python", "Java",
  "C", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "SQL"
];

const SAMPLE_CODE = `// Sample: Vulnerable Node.js login function
async function loginUser(req, res) {
  const { username, password } = req.body;
  
  // Direct SQL query - no sanitization
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  const result = await db.query(query);
  
  if (result.length > 0) {
    const user = result[0];
    // Hardcoded secret key!
    const token = jwt.sign({ id: user.id }, "mysecretkey123");
    res.json({ token: token, user: user });
  } else {
    res.json({ error: "Invalid credentials" });
  }
}`;

export default function CodeInput({ onReview, loading }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Auto Detect");
  const [features, setFeatures] = useState(["bugs", "quality", "security"]);

  const toggleFeature = (f) => {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const handleSubmit = () => {
    if (!code.trim()) return;
    onReview({
      code,
      language: language === "Auto Detect" ? null : language.toLowerCase(),
      features,
    });
  };

  return (
    <div className="input-panel">
      <div className="input-toolbar">
        <div className="toolbar-left">
          <select
            className="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>

          <div className="feature-toggles">
            {[
              { id: "bugs", label: "🐛 Bugs", color: "#ef4444" },
              { id: "quality", label: "✨ Quality", color: "#3b82f6" },
              { id: "security", label: "🔒 Security", color: "#f59e0b" },
            ].map(({ id, label, color }) => (
              <button
                key={id}
                className={`feature-btn ${features.includes(id) ? "active" : ""}`}
                style={{ "--feature-color": color }}
                onClick={() => toggleFeature(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="sample-btn"
          onClick={() => setCode(SAMPLE_CODE)}
        >
          Load Sample
        </button>
      </div>

      <textarea
        className="code-textarea"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
        spellCheck={false}
      />

      <div className="input-footer">
        <span className="char-count">{code.length} chars · {code.split("\n").length} lines</span>
        <button
          className="review-btn"
          onClick={handleSubmit}
          disabled={loading || !code.trim() || features.length === 0}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="spinner" /> Analyzing...
            </span>
          ) : (
            "Review Code →"
          )}
        </button>
      </div>
    </div>
  );
}
