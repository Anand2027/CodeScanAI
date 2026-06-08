import React, { useState } from "react";
import CodeInput from "./components/CodeInput";
import ReviewPanel from "./components/ReviewPanel";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import "./App.css";

const API_URL = "https://codescanai-cntt.onrender.com";

export default function App() {
  const [page, setPage] = useState("landing"); // "landing" | "app"
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("bugs");
  const [fixedCode, setFixedCode] = useState(null);
  const [fixLoading, setFixLoading] = useState(false);
  const [originalCode, setOriginalCode] = useState("");
  const [originalLang, setOriginalLang] = useState("");

  const handleReview = async ({ code, language, features }) => {
    setLoading(true);
    setError(null);
    setReview(null);
    setFixedCode(null);
    setOriginalCode(code);
    setOriginalLang(language);

    try {
      // const response = await fetch("/api/review", {
      const response = await fetch(`${API_URL}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, features }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.type === "done") { setReview(data.result); setActiveTab("bugs"); }
            else if (data.type === "error") setError(data.error);
          }
        }
      }
    } catch (err) {
      setError("Failed to connect to server. Is it running on port 3001?");
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async () => {
    setFixLoading(true);
    setFixedCode("");
    setActiveTab("fixed");

    try {
      // const response = await fetch("/api/fix", {
      const response = await fetch(`${API_URL}/api/fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: originalCode, language: originalLang, review }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.type === "delta") setFixedCode(prev => (prev || "") + data.text);
            else if (data.type === "done") setFixedCode(data.fixedCode);
          }
        }
      }
    } catch (err) {
      setError("Failed to generate fixed code.");
    } finally {
      setFixLoading(false);
    }
  };

  // Show landing page
  if (page === "landing") {
    return <LandingPage onEnter={() => setPage("app")} />;
  }

  // Show main reviewer app
  return (
    <div className="app">
      <Header onBack={() => setPage("landing")} />
      <main className="main">
        <CodeInput onReview={handleReview} loading={loading} />
        {error && <div className="error-banner">⚠️ {error}</div>}
        {(loading || review) && (
          <ReviewPanel
            review={review}
            loading={loading}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            fixedCode={fixedCode}
            fixLoading={fixLoading}
            onFix={handleFix}
          />
        )}
      </main>
    </div>
  );
}