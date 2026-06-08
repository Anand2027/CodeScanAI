require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ─── REVIEW ENDPOINT ───────────────────────────────────────────────────────────
app.post("/api/review", async (req, res) => {
  const { code, language, features } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ error: "No code provided" });
  }

  const featureInstructions = {
    bugs: "**Bug Detection & Fixes**: Identify all bugs, logic errors, null pointer issues, off-by-one errors, unhandled exceptions, etc. For each bug, provide the exact fix.",
    quality:
      "**Code Quality & Refactoring**: Assess readability, maintainability, DRY violations, naming conventions, complexity, and suggest concrete refactoring improvements.",
    security:
      "**Security Analysis**: Look for SQL injection, XSS, hardcoded secrets, insecure dependencies, improper input validation, auth issues, and other security vulnerabilities.",
  };

  const selectedFeatures = features || ["bugs", "quality", "security"];
  const featurePrompts = selectedFeatures.map((f) => featureInstructions[f]).join("\n\n");

  const systemPrompt = `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance. 
You provide thorough, actionable, and developer-friendly code reviews.
Always respond in valid JSON format exactly as specified. Do not include any text outside the JSON object.`;

  const userPrompt = `Review the following ${language || "code"} and provide a structured analysis.

\`\`\`${language || ""}
${code}
\`\`\`

Analyze based on these dimensions:
${featurePrompts}

Respond with ONLY a valid JSON object in this exact structure:
{
  "summary": "2-3 sentence overall assessment",
  "score": <number 0-100 representing overall code quality>,
  "language": "<detected language>",
  "bugs": [
    {
      "severity": "critical|high|medium|low",
      "line": "<line number or range or null>",
      "title": "<short title>",
      "description": "<what the bug is>",
      "fix": "<exact code fix or solution>"
    }
  ],
  "quality": [
    {
      "type": "refactor|naming|complexity|duplication|readability",
      "line": "<line number or range or null>",
      "title": "<short title>",
      "description": "<what to improve>",
      "suggestion": "<how to improve it>"
    }
  ],
  "security": [
    {
      "severity": "critical|high|medium|low",
      "line": "<line number or range or null>",
      "title": "<short title>",
      "description": "<vulnerability description>",
      "fix": "<how to fix it>"
    }
  ],
  "positives": ["<things done well>"],
  "metrics": {
    "complexity": "<low|medium|high>",
    "maintainability": "<low|medium|high>",
    "testability": "<low|medium|high>"
  }
}`;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullText = "";

    const stream = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 4000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        fullText += text;
        res.write(`data: ${JSON.stringify({ type: "delta", text })}\n\n`);
      }
    }

    try {
      const clean = fullText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      res.write(`data: ${JSON.stringify({ type: "done", result: parsed })}\n\n`);
    } catch (e) {
      res.write(`data: ${JSON.stringify({ type: "error", error: "Failed to parse review result" })}\n\n`);
    }

    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// ─── FIXED CODE ENDPOINT ───────────────────────────────────────────────────────
app.post("/api/fix", async (req, res) => {
  const { code, language, review } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ error: "No code provided" });
  }

  // Build a summary of all issues found
  const issuesSummary = [];
  if (review?.bugs?.length) {
    review.bugs.forEach(b => issuesSummary.push(`BUG [${b.severity}] line ${b.line || "?"}: ${b.title} — Fix: ${b.fix}`));
  }
  if (review?.security?.length) {
    review.security.forEach(s => issuesSummary.push(`SECURITY [${s.severity}] line ${s.line || "?"}: ${s.title} — Fix: ${s.fix}`));
  }
  if (review?.quality?.length) {
    review.quality.forEach(q => issuesSummary.push(`QUALITY: ${q.title} — ${q.suggestion}`));
  }

  const systemPrompt = `You are an expert software engineer. Your job is to rewrite code with ALL bugs fixed, security vulnerabilities patched, and quality improvements applied.
Return ONLY the corrected, production-ready code. No explanations, no markdown fences, no extra text — just the raw fixed code.`;

  const userPrompt = `Here is the original ${language || "code"}:

${code}

Apply ALL of these fixes and improvements:
${issuesSummary.length > 0 ? issuesSummary.join("\n") : "Fix any bugs, security issues, and improve code quality."}

Return ONLY the complete corrected code. Nothing else.`;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 4000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true,
    });

    let fullFixed = "";
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        fullFixed += text;
        res.write(`data: ${JSON.stringify({ type: "delta", text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: "done", fixedCode: fullFixed.trim() })}\n\n`);
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("CodeScanAI Backend Running 🚀");
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));