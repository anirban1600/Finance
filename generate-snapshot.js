// api/generate-snapshot.js
// -----------------------------------------------------------------------
// Calls the Anthropic API server-side, using ANTHROPIC_API_KEY from Vercel's
// Environment Variables. The browser never sees this key — it only ever
// calls THIS endpoint, which then calls Anthropic on its behalf.
// -----------------------------------------------------------------------

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, age, income, expenses, goal, risk } = req.body || {};
    if (!age || !income || !expenses) {
      return res.status(400).json({ error: 'age, income, and expenses are required.' });
    }

    const surplus = Number(income) - Number(expenses);
    const savingsRate = Number(income) > 0 ? Math.round((surplus / Number(income)) * 100) : 0;

    const systemPrompt = `You are a financial literacy assistant embedded on the website of Nivesh Saathi, a financial planning consultancy in India. A visitor has entered basic numbers. Produce a short, warm, plain-language "passbook entry" style snapshot.

Rules:
- Do NOT recommend specific stocks, mutual funds, insurance policies, or brand names.
- Speak only in categories (equity/debt/gold), percentage ranges, and rupee amounts derived from the user's own numbers.
- Structure your reply as short lines, each starting with a bank-passbook-style label in square brackets, e.g. [SAVINGS RATE], [MONTHLY SIP TARGET], [ASSET MIX], [INSURANCE CHECK], [NEXT STEP]. One short line of plain language after each label.
- Keep the whole reply under 130 words.
- Tone: encouraging, direct, never alarmist.
- End with exactly one line inviting them to book a full consultation for a personalised plan, labeled [NOTE].`;

    const userPrompt = `Name: ${name || 'Friend'}
Age: ${age}
Monthly income: ₹${income}
Monthly expenses (incl. EMIs): ₹${expenses}
Approx. current savings rate: ${savingsRate}%
Primary goal: ${goal}
Risk comfort: ${risk}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(502).json({ error: 'Could not generate snapshot right now.' });
    }

    const data = await response.json();
    const text = (data.content || []).map(b => b.text || '').join('\n').trim();
    if (!text) return res.status(502).json({ error: 'Empty response from AI.' });

    res.status(200).json({ text });
  } catch (err) {
    console.error('generate-snapshot error', err);
    res.status(500).json({ error: 'Could not generate snapshot right now.' });
  }
};
