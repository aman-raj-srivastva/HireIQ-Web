interface PracticeConfig {
  jobRole: string
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  targetCompany?: string
}

interface AIResponse {
  question?: string
  feedback?: {
    score: number
    suggestions: string[]
    strengths: string[]
    detailedAnalysis: string
  }
  followUpQuestion?: string
}

interface APIValidationResult {
  isValid: boolean
  message: string
  error?: string
}

export class GroqAPI {
  private apiKey: string
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions'

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || ''
  }

  /**
   * Get the active API key: user-provided (localStorage) or default from env
   */
  static getActiveApiKey(): string {
    if (typeof window !== 'undefined') {
      const userKey = localStorage.getItem('userGroqApiKey')
      if (userKey) return userKey
    }
    return process.env.NEXT_PUBLIC_GROQ_API_KEY || ''
  }

  /**
   * Test API key validity
   */
  async testAPIKey(apiKeyOverride?: string): Promise<APIValidationResult> {
    const key = apiKeyOverride || this.apiKey
    if (!key) {
      return {
        isValid: false,
        message: 'No API key found. Please add NEXT_PUBLIC_GROQ_API_KEY to your environment variables.',
        error: 'MISSING_API_KEY'
      }
    }
    if (!key.startsWith('gsk_')) {
      return {
        isValid: false,
        message: 'Invalid API key format. Groq API keys should start with "gsk_".',
        error: 'INVALID_FORMAT'
      }
    }
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'user', content: 'Hello, this is a test message.' }
          ],
          max_tokens: 10,
        }),
      })
      if (response.status === 401) {
        return {
          isValid: false,
          message: 'Invalid API key. Please check your Groq API key.',
          error: 'INVALID_API_KEY'
        }
      }
      if (response.status === 403) {
        return {
          isValid: false,
          message: 'API key is valid but doesn\'t have permission to access this model.',
          error: 'INSUFFICIENT_PERMISSIONS'
        }
      }
      if (response.status === 429) {
        return {
          isValid: false,
          message: 'Rate limit exceeded. Please try again later.',
          error: 'RATE_LIMIT_EXCEEDED'
        }
      }
      if (!response.ok) {
        return {
          isValid: false,
          message: `API request failed with status ${response.status}: ${response.statusText}`,
          error: 'API_ERROR'
        }
      }
      const data = await response.json()
      if (data.choices && data.choices.length > 0) {
        return {
          isValid: true,
          message: 'API key is valid and working correctly!'
        }
      } else {
        return {
          isValid: false,
          message: 'API responded but with unexpected format.',
          error: 'INVALID_RESPONSE'
        }
      }
    } catch (error) {
      console.error('API test failed:', error)
      return {
        isValid: false,
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'NETWORK_ERROR'
      }
    }
  }

  getAPIKeyStatus(): { hasKey: boolean; keyLength: number; keyPrefix: string } {
    const key = GroqAPI.getActiveApiKey()
    const hasKey = !!key
    const keyLength = key.length
    const keyPrefix = key.substring(0, 4)
    return {
      hasKey,
      keyLength,
      keyPrefix
    }
  }

  /**
   * Make a request to Groq API
   */
  public async makeRequest(prompt: string, systemPrompt?: string, apiKeyOverride?: string): Promise<string> {
    const key = apiKeyOverride || GroqAPI.getActiveApiKey() || this.apiKey
    if (!key) {
      throw new Error('Groq API key not found. Please add NEXT_PUBLIC_GROQ_API_KEY to your environment variables.')
    }
    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: prompt }
    ]
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })
      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Groq API request failed:', error)
      throw error
    }
  }

  async generateInterviewQuestion(config: PracticeConfig, apiKeyOverride?: string): Promise<string> {
    const systemPrompt = `You are an expert technical interviewer. Generate relevant interview questions based on the job role, difficulty level, and target company. Be specific and realistic.`
    const prompt = `Generate a single interview question for a ${config.difficultyLevel} level ${config.jobRole} position${config.targetCompany ? ` at ${config.targetCompany}` : ''}.

Requirements:
- Make it specific to the role and experience level
- If a company is specified, tailor it to that company's culture/tech stack
- For beginner level: Focus on fundamentals and basic concepts
- For intermediate level: Include practical scenarios and problem-solving
- For advanced level: Include complex technical challenges and system design
- Keep it concise but detailed enough to be clear

Return only the question, no additional text.`
    try {
      const question = await this.makeRequest(prompt, systemPrompt, apiKeyOverride)
      return question.trim()
    } catch (error) {
      // Fallback questions if API fails
      return this.getFallbackQuestion(config)
    }
  }

  async analyzeAnswer(
    question: string,
    answer: string,
    config: PracticeConfig,
    apiKeyOverride?: string
  ): Promise<AIResponse['feedback']> {
    const systemPrompt = `You are an expert interview coach. Analyze the candidate's answer and provide constructive feedback. Be encouraging but honest.`
    const prompt = `Analyze this interview answer:

Question: ${question}
Answer: ${answer}
Job Role: ${config.jobRole}
Experience Level: ${config.difficultyLevel}${config.targetCompany ? `\nTarget Company: ${config.targetCompany}` : ''}

Provide feedback in this exact JSON format:
{
  "score": 75,
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "detailedAnalysis": "2-3 sentences of detailed analysis"
}

Guidelines:
- Score: 0-100 based on answer quality, relevance, and completeness
- Suggestions: 3 specific, actionable improvements
- Strengths: 3 positive aspects of the answer
- Be encouraging but constructive
- Consider the experience level when scoring`
    try {
      const response = await this.makeRequest(prompt, systemPrompt, apiKeyOverride)
      // Try to parse JSON response
      try {
        const feedback = JSON.parse(response)
        return {
          score: Math.min(100, Math.max(0, feedback.score || 75)),
          suggestions: feedback.suggestions || ['Try to be more specific', 'Include examples', 'Structure your response better'],
          strengths: feedback.strengths || ['Good effort', 'Clear communication', 'Relevant response'],
          detailedAnalysis: feedback.detailedAnalysis || 'Your answer shows good understanding of the topic. Consider adding more specific examples and quantifiable results.'
        }
      } catch (parseError) {
        // If JSON parsing fails, return structured feedback
        return {
          score: 75,
          suggestions: ['Try to be more specific with examples', 'Include quantifiable results when possible', 'Structure your response using the STAR method'],
          strengths: ['Clear communication', 'Good problem-solving approach', 'Professional demeanor'],
          detailedAnalysis: 'Your answer demonstrates good understanding. Consider adding more specific examples and measurable outcomes to strengthen your response.'
        }
      }
    } catch (error) {
      // Fallback feedback if API fails
      return {
        score: Math.floor(Math.random() * 30) + 70,
        suggestions: ['Try to be more specific with examples', 'Include quantifiable results when possible', 'Structure your response using the STAR method'],
        strengths: ['Clear communication', 'Good problem-solving approach', 'Professional demeanor'],
        detailedAnalysis: 'Your answer shows good understanding of the topic. Consider adding more specific examples and quantifiable results.'
      }
    }
  }

  async generateFollowUpQuestion(
    originalQuestion: string,
    answer: string,
    config: PracticeConfig,
    apiKeyOverride?: string
  ): Promise<string> {
    const systemPrompt = `You are an expert interviewer. Generate a relevant follow-up question based on the candidate's answer.`
    const prompt = `Generate a follow-up question based on this interview exchange:

Original Question: ${originalQuestion}
Candidate's Answer: ${answer}
Job Role: ${config.jobRole}
Experience Level: ${config.difficultyLevel}

The follow-up should:
- Build upon their answer
- Probe deeper into their experience
- Be relevant to their skill level
- Help assess their expertise further

Return only the follow-up question, no additional text.`
    try {
      const followUp = await this.makeRequest(prompt, systemPrompt, apiKeyOverride)
      return followUp.trim()
    } catch (error) {
      return this.getFallbackFollowUpQuestion(config)
    }
  }

  private getFallbackQuestion(config: PracticeConfig): string {
    const questions = {
      'Software Engineer': {
        beginner: 'Explain the difference between var, let, and const in JavaScript.',
        intermediate: 'How would you design a simple caching system for a web application?',
        advanced: 'Design a distributed system for handling millions of concurrent users.'
      },
      'Frontend Developer': {
        beginner: 'What is the difference between React components and elements?',
        intermediate: 'How would you optimize the performance of a React application?',
        advanced: 'Design a component library that supports multiple themes and accessibility standards.'
      },
      'Data Scientist': {
        beginner: 'Explain the difference between supervised and unsupervised learning.',
        intermediate: 'How would you handle missing data in a dataset?',
        advanced: 'Design an ML pipeline for real-time fraud detection.'
      }
    }

    const roleQuestions = questions[config.jobRole as keyof typeof questions] || questions['Software Engineer']
    return roleQuestions[config.difficultyLevel] || 'Tell me about a challenging project you worked on.'
  }

  private getFallbackFollowUpQuestion(config: PracticeConfig): string {
    const followUps = {
      beginner: 'Can you walk me through how you would approach this problem step by step?',
      intermediate: 'What would you do differently if you had to solve this problem again?',
      advanced: 'How would you scale this solution to handle 10x more load?'
    }

    return followUps[config.difficultyLevel] || 'Can you elaborate on that experience?'
  }
}

// Export a singleton instance
export const groqAPI = new GroqAPI() 