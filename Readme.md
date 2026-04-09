#  AI-Powered CI/CD Pipeline

> A production-style CI/CD pipeline with an AI agent that automatically reviews every Pull Request using a large language model.

![CI Pipeline](https://github.com/AyushKat2001/ai-cicd-pipeline/actions/workflows/ci.yml/badge.svg)
![AI Review](https://github.com/AyushKat2001/ai-cicd-pipeline/actions/workflows/ai-review.yml/badge.svg)

---

## 💡 What is this?

I built this to learn how CI/CD pipelines actually work in production — and went one step further by wiring in an AI agent that reviews code on every pull request automatically.

The idea is simple: you push code, the pipeline runs your tests, builds a Docker image, and an LLM reads your git diff and posts a proper code review as a comment on your PR. No manual review needed for basic quality checks.

---

## ⚙️ What happens when you open a PR

Three things trigger automatically:

1. ✅ Test suite runs and coverage is reported
2. 🐳 Docker image gets built and verified
3. 🤖 AI agent reads everything you changed and posts a structured review

**The AI review looks like this on your PR:**

```
## AI Code Review 🤖

### Summary
Adds a GET /api/users endpoint returning a hardcoded list of users.

### Issues Found
Data is hardcoded — no real database connection.
The TODO comment confirms this is incomplete.

### Suggestions
Add pagination support.
Consider input validation middleware for future endpoints.

### Security Check
No security concerns. No secrets or user input exposed.

### Verdict
✅ APPROVE
```

---

## 🛠️ Stack

| Tool | Purpose |
|------|---------|
| Node.js + Express | Application |
| Jest + Supertest | Tests and coverage |
| Docker | Containerization |
| GitHub Actions | CI/CD orchestration |
| Groq API (LLaMA 3.3 70B) | AI code reviewer — free tier |

---

## 📁 Project Structure

```
ai-cicd-pipeline/
├── src/
│   └── app.js                  # Express app and all routes
├── tests/
│   └── app.test.js             # Jest test suite
├── scripts/
│   └── ai-review.js            # AI reviewer agent
├── .github/
│   └── workflows/
│       ├── ci.yml              # Test + Docker pipeline
│       └── ai-review.yml       # AI PR reviewer
└── Dockerfile
```

---

## 🚀 Running Locally

**Prerequisites:** Node.js 20+ and Docker

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-cicd-pipeline.git
cd ai-cicd-pipeline

# Install and test
npm install
npm test
```

**Run with Docker:**

```bash
docker build -t ai-cicd-pipeline .
docker run -p 3000:3000 ai-cicd-pipeline
```

Visit `http://localhost:3000/health` — you should get:

```json
{ "status": "ok", "timestamp": "..." }
```

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Health check — returns status and timestamp |
| `GET` | `/api/greet?name=X` | Returns a greeting for the given name |
| `POST` | `/api/echo` | Echoes back whatever JSON body you send |
| `GET` | `/api/users` | Returns a list of users |

---

## 🔐 Setting Up the AI Reviewer

The AI reviewer needs one secret — your Groq API key.

1. Get a free key at [console.groq.com](https://console.groq.com)
2. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
3. Add a new secret named `GROQ_API_KEY` and paste your key

That's it. Next time you open a PR the bot shows up automatically.

---

## 🔍 How the AI Review Actually Works

Nothing magical. The workflow grabs the full git diff of your PR:

```bash
git diff origin/main...HEAD > pr_diff.txt
```

That diff gets sent to Groq's LLaMA 3.3 70B model with a prompt telling it to act as a senior engineer doing a code review. The model responds with structured feedback and the workflow posts it as a PR comment using the GitHub API.

The whole thing runs in under 90 seconds.

---

## 📋 Workflows

**`ci.yml`** — triggers on every push to `main` and on every PR

```
Install deps → Run tests → Upload coverage → Build Docker image → Verify container starts
```

**`ai-review.yml`** — triggers only when a PR is opened or updated

```
Capture git diff → Send to Groq LLM → Post review as PR comment
```

---

## 📝 What I Learned Building This

Setting up GitHub Actions was straightforward. The interesting part was the AI reviewer — specifically handling edge cases like an empty diff, a decommissioned model (happened mid-build with `llama3-70b-8192`), and the API returning an error object instead of a normal response.

Added proper error handling and logging for all of those so the pipeline fails with a useful message instead of a cryptic crash.
