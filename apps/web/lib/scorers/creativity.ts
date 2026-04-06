import { z } from 'zod';
import { getAdapter } from '@/lib/adapters';
import { CSDetails, LLMMessage } from './types';
import { logger } from '@/lib/logger';

// ── Zod schema for CS sub-scores ────────────────────────────────────────────
const ScoreValue = z.number().min(0).max(100);

export const CSSchema = z.object({
  originality: ScoreValue,
  metaphor_use: ScoreValue,
  novel_connections: ScoreValue,
  divergent_thinking: ScoreValue,
  conceptual_fluency: ScoreValue,
});

// ── Score clamping ──────────────────────────────────────────────────────────
function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

// ── CS calculation ──────────────────────────────────────────────────────────
export function calculateCS(cs: CSDetails): number {
  return clamp(
    cs.originality * 0.30 +
    cs.metaphor_use * 0.15 +
    cs.novel_connections * 0.25 +
    cs.divergent_thinking * 0.20 +
    cs.conceptual_fluency * 0.10
  );
}

// ── Input sanitization ──────────────────────────────────────────────────────
const MAX_INPUT_LENGTH = 10_000;

function sanitizeForPrompt(text: string): string {
  return text.length > MAX_INPUT_LENGTH
    ? text.slice(0, MAX_INPUT_LENGTH) + '\n[...truncated]'
    : text;
}

// ── LLM-as-judge prompt for creativity evaluation ───────────────────────────
export const CREATIVITY_SYSTEM_PROMPT = `You are a CAIMS creativity evaluator.
You assess the Creativity Score (CS) of AI responses by measuring originality, divergent thinking, and novel connections.
You MUST return ONLY valid JSON with no other text.

IMPORTANT: All scores MUST be integers between 0 and 100 inclusive.

Evaluate the following creativity dimensions:

## CS - Creativity Score
- originality (0-100): Does the response present ideas or framings that are non-obvious and genuinely novel? High scores reflect surprising, inventive thinking rather than restating common knowledge.
- metaphor_use (0-100): Does the response employ effective metaphors, analogies, or imagery to illuminate concepts? High scores reflect apt, vivid, and illuminating figurative language.
- novel_connections (0-100): Does the response draw unexpected bridges between disparate domains or concepts? High scores reflect synthesis that reveals new insight through unlikely associations.
- divergent_thinking (0-100): Does the response explore multiple distinct angles, possibilities, or interpretations rather than converging on a single path? High scores reflect breadth and exploratory depth.
- conceptual_fluency (0-100): Does the response demonstrate ease in generating varied conceptual alternatives, analogies, or examples? High scores reflect a rich flow of relevant and differentiated ideas.

Return a JSON object with this exact structure:
{
  "cs": {
    "originality": N,
    "metaphor_use": N,
    "novel_connections": N,
    "divergent_thinking": N,
    "conceptual_fluency": N
  },
  "reasoning": "Brief explanation of the creativity scores"
}`;

// ── Response schema for standalone creativity scoring ───────────────────────
const CreativityResponseSchema = z.object({
  cs: CSSchema,
  reasoning: z.string().default('No reasoning provided'),
});

// ── JSON extraction ─────────────────────────────────────────────────────────
function extractJSON(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json|JSON)?\s*\n?/i, '').replace(/\n?```\s*$/, '');
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

// ── Standalone creativity scorer ────────────────────────────────────────────
export async function scoreCreativity(params: {
  response: string;
  question: string;
  history: LLMMessage[];
  model?: string;
}): Promise<{ csScore: number; details: CSDetails; reasoning: string } | null> {
  const model = params.model || process.env.CAIMS_SCORING_MODEL || 'claude-sonnet-4-20250514';
  const startTime = Date.now();

  try {
    const recentHistory = params.history.slice(-10);
    const historyText = recentHistory.length > 0
      ? recentHistory
          .map((m) => `<${m.role}>${sanitizeForPrompt(m.content)}</${m.role}>`)
          .join('\n')
      : '(no prior conversation history)';

    const userPrompt = `Evaluate the creativity of the following AI interaction:

<conversation_history>
${historyText}
</conversation_history>

<user_question>
${sanitizeForPrompt(params.question)}
</user_question>

<ai_response_to_evaluate>
${sanitizeForPrompt(params.response)}
</ai_response_to_evaluate>

Score this response across all CS creativity dimensions. Return ONLY the JSON object.`;

    const adapter = getAdapter();
    const judgeResponse = await adapter.judge(
      `${CREATIVITY_SYSTEM_PROMPT}\n\n${userPrompt}`,
      { model, maxTokens: 512 }
    );

    const latencyMs = Date.now() - startTime;

    const jsonContent = extractJSON(judgeResponse);
    const parsed = JSON.parse(jsonContent);
    const validated = CreativityResponseSchema.parse(parsed);

    const csScore = calculateCS(validated.cs);

    logger.info('Creativity scoring completed', {
      csScore, latencyMs, model,
    });

    return {
      csScore,
      details: validated.cs,
      reasoning: validated.reasoning,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    if (error instanceof z.ZodError) {
      logger.error('Creativity scoring validation failed — LLM returned out-of-range scores', {
        issues: error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
        latencyMs,
      });
    } else {
      logger.error('Creativity scoring failed', {
        error: error instanceof Error ? error.message : String(error),
        latencyMs,
      });
    }
    return null;
  }
}
