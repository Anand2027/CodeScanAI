# ⬡ CodeScan AI — AI Code Reviewer

An AI-powered code reviewer built with React + Node.js + Claude API.
Detects bugs, analyzes code quality, and flags security vulnerabilities.

---

## Features

- 🐛 **Bug Detection** — Logic errors, null refs, unhandled exceptions, off-by-ones
- ✨ **Code Quality** — Refactor suggestions, naming, complexity, DRY violations
- 🔒 **Security Analysis** — SQL injection, XSS, hardcoded secrets, auth issues
- 📊 **Code Score** — Overall quality score (0–100) with metrics
- 🌐 **Multi-language** — JS, TS, Python, Java, Go, Rust, C/C++, SQL, and more

---

## Setup

### Prerequisites
- Node.js 18+
- Anthropic API key → https://console.anthropic.com

### 1. Clone / open the project
```bash
cd ai-code-reviewer
```

### 2. Install dependencies
```bash
# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 3. Set your API key

**Server** — create `server/.env`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Or export it in your terminal:
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 4. Run the app

**Terminal 1 — Start the server:**
```bash
cd server
npm run dev       # with auto-reload (nodemon)
# or
npm start         # plain node
```

**Terminal 2 — Start the React client:**
```bash
cd client
npm start
```

Open → **http://localhost:3000**

---

## Project Structure

```
ai-code-reviewer/
├── server/
│   ├── index.js          # Express server + Claude API integration
│   └── package.json
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js         # Main app + API calls
│       ├── App.css        # Dark theme styling
│       └── components/
│           ├── Header.js
│           ├── CodeInput.js   # Code editor + feature toggles
│           └── ReviewPanel.js # Results with tabs + score ring
└── README.md
```

---

## How It Works

1. User pastes code and selects which features to analyze
2. React sends a POST to `/api/review` with code + language + features
3. Server builds a detailed prompt and streams Claude's response via SSE
4. Claude returns structured JSON with bugs, quality issues, security findings
5. Frontend renders the results with severity badges, score ring, and tabs

---

## Extending the App

- **GitHub PR integration** — use GitHub API to fetch diffs and review PRs automatically
- **File upload** — let users upload `.js`, `.py`, `.java` files directly
- **History** — save past reviews to localStorage or a DB
- **Shareable links** — generate a unique URL for each review
- **VS Code extension** — wrap the API call in a VS Code extension

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (required) |
| `PORT` | Server port (default: 3001) |
