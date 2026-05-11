import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'

const CONFIG_ERROR_MESSAGE =
  'AI service is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY (Gemini), AI_GATEWAY_API_KEY (Vercel AI Gateway), or OPENAI_API_KEY (OpenAI) in .env.local and restart the dev server.'

export function getAiModel() {
  // Prefer direct Gemini API when configured (free tier available).
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
    return google(geminiModel)
  }

  // Prefer Vercel AI Gateway if configured (keeps existing model id).
  if (process.env.AI_GATEWAY_API_KEY) return 'openai/gpt-5-mini' as const

  // Fallback: direct OpenAI API.
  if (process.env.OPENAI_API_KEY) return openai('gpt-4.1-mini')

  throw new Error(CONFIG_ERROR_MESSAGE)
}

export function assertAiConfigured() {
  if (
    !process.env.GOOGLE_GENERATIVE_AI_API_KEY &&
    !process.env.AI_GATEWAY_API_KEY &&
    !process.env.OPENAI_API_KEY
  ) {
    throw new Error(CONFIG_ERROR_MESSAGE)
  }
}

