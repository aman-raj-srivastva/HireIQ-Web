export interface OmniDimensionConfig {
    jobRole: string
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
    targetCompany?: string
  }
  
  export interface CallContext {
    candidate_name?: string
    job_role: string
    difficulty_level: string
    target_company?: string
    interview_type: 'technical' | 'behavioral' | 'mixed'
    session_id: string
  }
  
  export class OmniDimensionAPI {
    private apiKey: string
    private baseUrl: string = 'https://api.omnidim.io/v1' // Updated with version
  
    constructor(apiKey?: string) {
      this.apiKey = apiKey || (typeof window !== 'undefined' ? localStorage.getItem('userOmnidimApiKey') : process.env.NEXT_PUBLIC_OMNIDIM_API_KEY) || ''
    }
  
    // Get API key status
    getAPIKeyStatus() {
      return {
        hasKey: !!this.apiKey,
        keyLength: this.apiKey.length,
        keyPrefix: this.apiKey.substring(0, 4)
      }
    }
  
    // Get active API key
    static getActiveApiKey(): string {
      return (typeof window !== 'undefined' ? localStorage.getItem('userOmnidimApiKey') : process.env.NEXT_PUBLIC_OMNIDIM_API_KEY) || ''
    }
  
    // Dispatch an interview call
    async dispatchInterviewCall(
      agentId: number,
      phoneNumber: string,
      config: OmniDimensionConfig,
      candidateName?: string
    ): Promise<any> {
      if (!this.apiKey) {
        throw new Error('OmniDimension API key not found')
      }
  
      const sessionId = `interview_${Date.now()}`
      const callContext: CallContext = {
        candidate_name: candidateName,
        job_role: config.jobRole,
        difficulty_level: config.difficultyLevel,
        target_company: config.targetCompany,
        interview_type: 'mixed',
        session_id: sessionId
      }
  
      try {
        const response = await fetch(`${this.baseUrl}/call/dispatch`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            agent_id: agentId,
            to_number: phoneNumber,
            call_context: callContext
          })
        })
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`)
        }
  
        return await response.json()
      } catch (error) {
        console.error('Failed to dispatch interview call:', error)
        throw error
      }
    }
  
    // Get call logs for interview sessions
    async getInterviewCallLogs(page: number = 1, pageSize: number = 10, agentId?: number): Promise<any> {
      if (!this.apiKey) {
        throw new Error('OmniDimension API key not found')
      }
  
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          page_size: pageSize.toString()
        })
  
        if (agentId) {
          params.append('agent_id', agentId.toString())
        }
  
        const response = await fetch(`${this.baseUrl}/call/logs?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        })
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`)
        }
  
        return await response.json()
      } catch (error) {
        console.error('Failed to get call logs:', error)
        throw error
      }
    }
  
    // Get specific call log details
    async getCallLog(callLogId: string): Promise<any> {
      if (!this.apiKey) {
        throw new Error('OmniDimension API key not found')
      }
  
      try {
        const response = await fetch(`${this.baseUrl}/call/logs/${callLogId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        })
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`)
        }
  
        return await response.json()
      } catch (error) {
        console.error('Failed to get call log:', error)
        throw error
      }
    }
  
    // List available agents for interviews
    async listInterviewAgents(): Promise<any> {
      if (!this.apiKey) {
        throw new Error('OmniDimension API key not found')
      }
  
      try {
        console.log('Making request to:', `${this.baseUrl}/agents`)
        console.log('API Key prefix:', this.apiKey.substring(0, 8) + '...')
        
        const response = await fetch(`${this.baseUrl}/agents`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        })
  
        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData)
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`)
        }
  
        const data = await response.json()
        console.log('Agents data:', data)
        return data
      } catch (error) {
        console.error('Failed to list agents:', error)
        throw error
      }
    }
  }
  
  export const omnidimensionAPI = new OmniDimensionAPI() 