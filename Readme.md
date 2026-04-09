ai-cicd-pipeline
I built this to learn how CI/CD pipelines actually work in production — and to go one step further by wiring in an AI agent that reviews code on every pull request automatically.
The idea is simple: you push code, the pipeline runs your tests, builds a Docker image, and an LLM reads your git diff and posts a proper code review as a comment on your PR. No manual review needed for basic quality checks.

What it does
When you open a Pull Request, three things happen automatically:

Your test suite runs and coverage is reported
A Docker image gets built and verified
An AI agent reads everything you changed and posts a structured review — what you broke, what looks suspicious, what could be better

The AI review looks like this on your PR:
## AI Code Review

### Summary
Adds a GET /api/users endpoint returning a hardcoded list of users.

### Issues Found
Data is hardcoded — no real database connection. The TODO comment confirms this is incomplete.

### Suggestions
Add pagination support. Consider input validation middleware for future endpoints.

### Security Check
No security concerns. No secrets or user input exposed.

### Verdict
APPROVE

Stack

Node.js + Express — the app itself, nothing fancy
Jest + Supertest — tests and coverage
Docker — containerized so it runs the same everywhere
GitHub Actions — orchestrates the whole pipeline
Groq API (LLaMA 3.3 70B) — the brain behind the AI reviewer, free tier


Project structure
ai-cicd-pipeline/
├── src/
│   └── app.js              # Express app and all routes
├── tests/
│   └── app.test.js         # Jest test suite
├── scripts/
│   └── ai-review.js        # AI reviewer agent
├── .github/
│   └── workflows/
│       ├── ci.yml          # Test + Docker pipeline
│       └── ai-review.yml   # AI PR reviewer
└── Dockerfile

Running it locally
You'll need Node.js 20+ and Docker installed.
bashgit clone https://github.com/YOUR_USERNAME/ai-cicd-pipeline.git
cd ai-cicd-pipeline
npm install
npm test
To run with Docker:
bashdocker build -t ai-cicd-pipeline .
docker run -p 3000:3000 ai-cicd-pipeline
Hit http://localhost:3000/health and you should get back:
json{ "status": "ok", "timestamp": "..." }

API endpoints
MethodRouteWhat it doesGET/healthHealth check, returns status and timestampGET/api/greet?name=XReturns a greeting for the given namePOST/api/echoEchoes back whatever JSON body you sendGET/api/usersReturns a list of users

Setting up the AI reviewer
The AI reviewer needs one secret to work — your Groq API key.

Get a free key at console.groq.com
Go to your repo → Settings → Secrets and variables → Actions
Add a new secret called GROQ_API_KEY and paste your key

That's it. Next time you open a PR the bot will show up automatically.

How the AI review actually works
Nothing magical going on. The workflow grabs the full git diff of your PR using:
bashgit diff origin/main...HEAD > pr_diff.txt
That diff gets sent to Groq's LLaMA 3.3 70B model with a prompt telling it to act as a senior engineer doing a code review. The model responds with structured feedback and the workflow posts it as a comment on your PR using the GitHub API.
The whole thing runs in under 90 seconds.

Workflows
ci.yml — triggers on every push to main and on every PR
Runs tests → uploads coverage report → builds Docker image → spins up the container → hits /health to confirm it actually starts
ai-review.yml — triggers only when a PR is opened or updated
Captures the diff → sends it to Groq → posts the review as a PR comment

What I learned building this
Setting up GitHub Actions was straightforward. The interesting part was the AI reviewer — specifically handling cases where the diff is empty, the model gets decommissioned (happened mid-build), or the API returns an error object instead of a normal response. Added proper error handling and logging for all of those so the pipeline fails with a useful message instead of a cryptic crash.