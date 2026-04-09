const https = require('https');

const diff = process.env.PR_DIFF || '';
const groqKey = process.env.GROQ_API_KEY;

// ── Guard: missing API key ──────────────────────────────────────────────────
if (!groqKey) {
  console.error('ERROR: GROQ_API_KEY secret is not set in GitHub.');
  process.exit(1);
}

// ── Guard: empty diff ───────────────────────────────────────────────────────
if (!diff.trim()) {
  console.log('## AI Code Review 🤖\n\nNo changes detected in this PR. Nothing to review.');
  process.exit(0);
}

console.log(`Diff size received: ${diff.length} characters`);

// ── Build prompt ────────────────────────────────────────────────────────────
const prompt = `You are a senior DevOps and backend engineer doing a code review.

Review the following git diff and provide structured feedback.

Format your response EXACTLY like this:

## AI Code Review 🤖

### Summary
[1-2 sentence summary of what changed]

### Issues Found
[List any bugs, security issues, or bad practices. If none, write "No critical issues found."]

### Suggestions
[List improvements for readability, performance, or best practices]

### Security Check
[Flag any hardcoded secrets, SQL injection risks, or insecure patterns. If clean, write "No security concerns."]

### Verdict
[APPROVE / REQUEST CHANGES / NEEDS DISCUSSION]

---
Git Diff to review:
\`\`\`
${diff.slice(0, 6000)}
\`\`\`
`;

const body = JSON.stringify({
  model: 'llama3-70b-8192',
  max_tokens: 1000,
  messages: [{ role: 'user', content: prompt }]
});

const options = {
  hostname: 'api.groq.com',
  path: '/openai/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${groqKey.trim()}`,
    'Content-Length': Buffer.byteLength(body)
  }
};

// ── Make the request ─────────────────────────────────────────────────────────
const req = https.request(options, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {
    console.log(`Groq API status code: ${res.statusCode}`);

    try {
      const json = JSON.parse(data);

      // ── Check if Groq returned an error object ──────────────────────────
      if (json.error) {
        console.error('Groq API returned an error:');
        console.error(JSON.stringify(json.error, null, 2));
        process.exit(1);
      }

      // ── Check if choices array exists and has content ───────────────────
      if (!json.choices || !Array.isArray(json.choices) || json.choices.length === 0) {
        console.error('Groq response has no choices. Full response:');
        console.error(JSON.stringify(json, null, 2));
        process.exit(1);
      }

      const review = json.choices[0].message.content;

      if (!review) {
        console.error('Review content is empty. Full response:');
        console.error(JSON.stringify(json, null, 2));
        process.exit(1);
      }

      // ── Success ─────────────────────────────────────────────────────────
      console.log(review);

    } catch (e) {
      console.error('Failed to parse Groq response as JSON.');
      console.error('Raw response received:');
      console.error(data);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('HTTPS request to Groq failed:', e.message);
  process.exit(1);
});

req.write(body);
req.end();
