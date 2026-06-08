import React, { useEffect, useRef, useState } from "react";
import "./LandingPage.css";

// Animated canvas: falling code characters
function CodeRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ{}[]<>/\\=+-*&|!?;:".split("");
    const fontSize = 14;
    let cols = Math.floor(canvas.width / fontSize);
    let drops = Array(cols).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(8, 10, 18, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      cols = Math.floor(canvas.width / fontSize);
      if (drops.length !== cols) drops = Array(cols).fill(1);

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const brightness = Math.random();
        if (brightness > 0.97) {
          ctx.fillStyle = "#ffffff";
        } else if (brightness > 0.9) {
          ctx.fillStyle = "#4f8cff";
        } else {
          ctx.fillStyle = `rgba(34, 197, 94, ${0.15 + brightness * 0.4})`;
        }
        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
        ctx.fillText(char, i * fontSize, y * fontSize);

        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="code-rain-canvas" />;
}

// Typing animation hook
function useTypingEffect(texts, speed = 60) {
  const [display, setDisplay] = useState("");
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    let timeout;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTextIdx(i => (i + 1) % texts.length);
    }

    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts, speed]);

  return display;
}

const FEATURES = [
  {
    icon: "🐛",
    title: "Bug Detection",
    desc: "Catches logic errors, null refs, off-by-ones, and unhandled exceptions with exact line numbers and fixes.",
    color: "#ef4444",
  },
  {
    icon: "✨",
    title: "Code Quality",
    desc: "Spots DRY violations, naming issues, high complexity, and gives concrete refactoring suggestions.",
    color: "#4f8cff",
  },
  {
    icon: "🔒",
    title: "Security Scan",
    desc: "Finds SQL injection, XSS, hardcoded secrets, auth flaws, and insecure dependencies instantly.",
    color: "#f59e0b",
  },
  {
    icon: "🛠️",
    title: "Auto Fix",
    desc: "Applies every fix automatically and gives you 100% corrected, production-ready code to copy-paste.",
    color: "#22c55e",
  },
];

const STEPS = [
  { num: "01", title: "Paste Your Code", desc: "Drop in any code — JS, Python, Java, Go, Rust, SQL, and more." },
  { num: "02", title: "Choose Analysis", desc: "Pick bugs, quality, security — or run all three at once." },
  { num: "03", title: "Get AI Review", desc: "Llama 3.3 70B analyzes your code and returns structured insights instantly." },
  { num: "04", title: "Copy Fixed Code", desc: "One click gives you the fully corrected version ready to ship." },
];

export default function LandingPage({ onEnter }) {
  const typed = useTypingEffect([
    "Find bugs before users do.",
    "Ship secure code every time.",
    "Refactor smarter, not harder.",
    "100% fixed code in one click.",
  ], 55);

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="landing">
      <CodeRain />
      <div className={`landing-content ${visible ? "visible" : ""}`}>

        {/* NAV */}
        <nav className="landing-nav">
          <div className="landing-logo">
            <span className="landing-logo-hex">⬡</span>
            <span>CodeScan <span className="ai-badge">AI</span></span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <button className="nav-cta" onClick={onEnter}>Launch App →</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-tag">⚡ Powered by Llama 3.3 70B via Groq</div>
          <h1 className="hero-title">
            Your AI<br />
            <span className="hero-accent">Code Reviewer</span>
          </h1>
          <p className="hero-typed">
            <span className="typed-text">{typed}</span>
            <span className="cursor">|</span>
          </p>
          <p className="hero-sub">
            Paste any code. Get instant bug reports, security alerts, quality scores,
            and a fully corrected version — all in seconds.
          </p>
          <div className="hero-actions">
            <button className="hero-cta" onClick={onEnter}>
              Start Reviewing Code
              <span className="cta-arrow">→</span>
            </button>
            <div className="hero-note">Free · No sign-up needed · Runs locally</div>
          </div>

          {/* Mock terminal */}
          <div className="mock-terminal">
            <div className="terminal-bar">
              <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
              <span className="terminal-title">codescan-ai — review.js</span>
            </div>
            <div className="terminal-body">
              <div className="t-line"><span className="t-dim">$</span> <span className="t-cmd">codescan review</span> <span className="t-arg">./auth.js</span></div>
              <div className="t-line t-delay-1"><span className="t-info">→</span> Analyzing 142 lines...</div>
              <div className="t-line t-delay-2"><span className="t-err">✗</span> <span className="t-label-red">[CRITICAL]</span> SQL Injection at line 23</div>
              <div className="t-line t-delay-3"><span className="t-err">✗</span> <span className="t-label-red">[HIGH]</span> Hardcoded API key at line 7</div>
              <div className="t-line t-delay-4"><span className="t-warn">⚠</span> <span className="t-label-yellow">[MEDIUM]</span> Unhandled promise rejection at line 55</div>
              <div className="t-line t-delay-5"><span className="t-ok">✓</span> <span className="t-label-green">Fixed code generated</span> → copy ready</div>
              <div className="t-line t-delay-6"><span className="t-dim">Score: </span><span className="t-score">34/100</span><span className="t-dim"> → after fix: </span><span className="t-score-good">97/100</span></div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section" id="features">
          <div className="section-label">// CAPABILITIES</div>
          <h2 className="section-title">Everything you need to<br /><span className="accent-text">ship clean code</span></h2>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div className="feature-card" key={i} style={{ "--fc": f.color, animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <div className="feature-glow" />
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="steps-section" id="how">
          <div className="section-label">// HOW IT WORKS</div>
          <h2 className="section-title">From messy code to<br /><span className="accent-text">production-ready</span> in 4 steps</h2>
          <div className="steps-track">
            {STEPS.map((s, i) => (
              <div className="step-item" key={i}>
                <div className="step-num">{s.num}</div>
                <div className="step-connector" />
                <div className="step-content">
                  <h4 className="step-title">{s.title}</h4>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LANGUAGES */}
        <section className="langs-section">
          <div className="section-label">// SUPPORTED LANGUAGES</div>
          <div className="langs-scroll">
            {["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C++", "C#", "PHP", "Ruby", "Swift", "Kotlin", "SQL", "Bash"].map((l, i) => (
              <span className="lang-pill" key={i}>{l}</span>
            ))}
          </div>
        </section>

        {/* CTA BOTTOM */}
        <section className="bottom-cta">
          <div className="bottom-cta-inner">
            <h2 className="bottom-title">Ready to write better code?</h2>
            <p className="bottom-sub">No API key needed to get started — just paste and go.</p>
            <button className="hero-cta" onClick={onEnter}>
              Open Code Reviewer
              <span className="cta-arrow">→</span>
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="landing-footer">
          <span className="landing-logo">
            <span className="landing-logo-hex">⬡</span> CodeScan AI
          </span>
          <span className="footer-note">Built with Groq · Llama 3.3 70B · React · Node.js</span>
        </footer>

      </div>
    </div>
  );
}