const https = require('https');

const diff = process.env.PR_DIFF || '';
const groqKey = process.env.GROQ_API_KEY;

if (!groqKey) {
  console.error('GROQ_API_KEY not set');
  process.exit(1);
}

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
    'Authorization': `Bearer ${groqKey}`,
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const review = json.choices[0].message.content;
      console.log(review);
    } catch (e) {
      console.error('Failed to parse Groq response:', e.message);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e.message);
  process.exit(1);
});

req.write(body);
req.end();