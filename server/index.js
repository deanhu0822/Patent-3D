import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/supplier', async (req, res) => {
  const { partName, material, description, dimensions } = req.body;

  if (!partName) {
    return res.status(400).json({ error: 'partName is required' });
  }

  const dimStr = dimensions
    ? Object.entries(dimensions)
        .filter(([k]) => k !== 'unit')
        .map(([k, v]) => `${k}: ${v}${dimensions.unit ?? ''}`)
        .join(', ')
    : null;

  const prompt = [
    `You are a procurement assistant. Use web search to find a real online supplier where someone can buy this mechanical part:`,
    `Part name: ${partName}`,
    material ? `Material: ${material}` : null,
    description ? `Description: ${description}` : null,
    dimStr ? `Dimensions: ${dimStr}` : null,
    ``,
    `Requirements:`,
    `- Find a real supplier website (McMaster-Carr, Grainger, RS Components, MSC Industrial, Misumi, Amazon Business, or a specialist)`,
    `- The URL must be a real, working product page or search results page on that supplier's website`,
    `- Do NOT make up URLs — only use URLs you found via web search`,
    ``,
    `After searching, respond with ONLY a single JSON object on one line. No markdown, no explanation, no code fences. Exactly this shape:`,
    `{"supplier":"<name>","url":"<full https URL>","blurb":"<one sentence on why this supplier>"}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    // Use agentic loop: Claude may call web_search multiple times before settling on an answer
    const messages = [{ role: 'user', content: prompt }];
    let finalText = null;

    while (true) {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages,
      });

      // Collect any text blocks from this turn
      const textBlocks = response.content.filter((b) => b.type === 'text');
      if (textBlocks.length > 0) {
        finalText = textBlocks.map((b) => b.text).join('');
      }

      if (response.stop_reason === 'end_turn') break;

      if (response.stop_reason === 'tool_use') {
        // Append assistant turn and all tool results, then continue loop
        messages.push({ role: 'assistant', content: response.content });

        const toolResults = response.content
          .filter((b) => b.type === 'tool_use')
          .map((b) => ({
            type: 'tool_result',
            tool_use_id: b.id,
            content: b.input?.query ?? '',
          }));

        messages.push({ role: 'user', content: toolResults });
      } else {
        // Any other stop reason — collect text and break
        break;
      }
    }

    if (!finalText) {
      return res.status(502).json({ error: 'No response from Claude' });
    }

    // 1. Strip markdown code fences
    let jsonStr = finalText.replace(/^```(?:json)?\s*/im, '').replace(/\s*```$/m, '').trim();

    // 2. Try to extract the first {...} JSON object if Claude added surrounding text
    const jsonMatch = jsonStr.match(/\{[\s\S]*?\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Could not parse JSON from Claude response:', finalText);
      return res.status(502).json({ error: 'Claude did not return a valid supplier result. Try again.' });
    }

    return res.json(parsed);
  } catch (err) {
    console.error('Supplier lookup error:', err);
    return res.status(500).json({ error: err.message ?? 'Internal server error' });
  }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`Supplier API listening on http://localhost:${PORT}`));
