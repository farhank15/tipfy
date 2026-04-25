import { createServerFn } from '@tanstack/react-start'

export interface ModerationSettings {
  profanityEnabled: boolean
  gamblingEnabled: boolean
  pinjolEnabled: boolean
  saraEnabled: boolean
}

export const censorMessageServerFn = createServerFn({ method: 'POST' }).handler(
  async (ctx: any) => {
    const { message, settings } = ctx.data as {
      message: string
      settings: ModerationSettings
    }

    if (!message || message.trim().length === 0) return { censored: message }

    if (
      !settings.profanityEnabled &&
      !settings.gamblingEnabled &&
      !settings.pinjolEnabled &&
      !settings.saraEnabled
    ) {
      return { censored: message }
    }

    try {
      const { env } = await import('../env')

      const categories = []
      if (settings.profanityEnabled)
        categories.push('Profanity/Dirty words (Indonesian and English)')
      if (settings.gamblingEnabled)
        categories.push('Gambling (Judol/Slot) related keywords')
      if (settings.pinjolEnabled)
        categories.push('Illegal lending (Pinjol) related keywords')
      if (settings.saraEnabled)
        categories.push('SARA/Hate speech/Discrimination')

      const systemPrompt = `You are a professional content moderator for a tipping platform.
      Your task is to identify and censor ONLY these categories:
      ${categories.map((c, i) => `${i + 1}. ${c}`).join('\n      ')}

      Instructions:
      1. Replace ONLY the identified bad words with asterisks (***).
      2. Keep the rest of the message intact.
      3. Maintain the original tone if it's positive.
      4. Only return the censored string, nothing else. No explanations.
      5. Do NOT censor words outside of the specified categories.`

      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content: message,
              },
            ],
            temperature: 0.1,
          }),
        },
      )

      const dataRes = await response.json()
      const censored = dataRes.choices?.[0]?.message?.content || message
      return { censored }
    } catch (error) {
      console.error('[AI Censor Error]:', error)
      return { censored: message }
    }
  },
)
