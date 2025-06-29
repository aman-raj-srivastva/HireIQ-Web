'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Send, 
  Brain, 
  Clock, 
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Settings,
  Target,
  Briefcase,
  Key,
  FileText,
  Smile,
  Trophy,
  Code,
  FileCode,
  Volume2,
  VolumeX,
  Phone
} from 'lucide-react'
import { groqAPI, GroqAPI } from '@/lib/groq-api'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { omnidimensionAPI, OmniDimensionAPI, OmniDimensionConfig } from '@/lib/omnidimension-api'

interface Message {
  id: string
  type: 'question' | 'answer' | 'feedback' | 'code'
  content: string
  timestamp: Date
  language?: string
  aiFeedback?: {
    score: number
    suggestions: string[]
    strengths: string[]
    detailedAnalysis: string
  }
}

interface PracticeConfig {
  jobRole: string
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  targetCompany?: string
}

const NON_ANSWERS = [
  'i dont know',
  "i don't know",
  'idk',
  'no idea',
  'not sure',
  'skip',
  'pass',
  'n/a',
  'none',
  'cannot answer',
  'do not know',
  'dont know',
  'dunno',
  ''
]

// Fix linter errors for SpeechRecognition
const SpeechRecognition = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export default function PracticePage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [practiceConfig, setPracticeConfig] = useState<PracticeConfig | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<{ hasKey: boolean; keyLength: number; keyPrefix: string } | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [report, setReport] = useState<{ summary: string; qaTable: string }>({ summary: '', qaTable: '' })
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showApiKeyCard, setShowApiKeyCard] = useState(false)
  const [userApiKey, setUserApiKey] = useState<string | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiKeySaved, setApiKeySaved] = useState(false)
  
  // Code writing functionality
  const [isCodeMode, setIsCodeMode] = useState(false)
  const [codeContent, setCodeContent] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [isSubmittingCode, setIsSubmittingCode] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isRecordingSpeech, setIsRecordingSpeech] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const [isAIVoiceOn, setIsAIVoiceOn] = useState(false);

  // Add new state variables for call functionality
  const [showCallInterface, setShowCallInterface] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [availableAgents, setAvailableAgents] = useState<any[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)
  const [isDispatchingCall, setIsDispatchingCall] = useState(false)
  const [callLogs, setCallLogs] = useState<any[]>([])
  const [showCallLogs, setShowCallLogs] = useState(false)

  useEffect(() => {
    // Load practice configuration from localStorage
    const savedConfig = localStorage.getItem('practiceConfig')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setPracticeConfig(config)
      } catch (error) {
        console.error('Failed to parse practice config:', error)
      }
    }

    // Get API key status
    const status = groqAPI.getAPIKeyStatus()
    setApiKeyStatus(status)

    // Load user API key from localStorage
    const storedUserKey = localStorage.getItem('userGroqApiKey')
    if (storedUserKey) {
      setUserApiKey(storedUserKey)
      setApiKeyInput(storedUserKey)
    }
  }, [])

  useEffect(() => {
    if (isSessionActive) {
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isSessionActive])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle webcam stream when isVideoOn changes
  useEffect(() => {
    if (isVideoOn) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          setIsVideoOn(false);
          alert('Could not access webcam: ' + err.message);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    // Clean up on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isVideoOn]);

  // Start/stop speech recognition
  useEffect(() => {
    if (!SpeechRecognition) return;
    if (isRecording) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setSpeechTranscript(final + interim);
      };
      recognition.onend = () => {
        setIsRecordingSpeech(false);
      };
      recognition.onerror = (e: any) => {
        setIsRecording(false);
        setIsRecordingSpeech(false);
        alert('Speech recognition error: ' + e.error);
      };
      recognition.start();
      setIsRecordingSpeech(true);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecordingSpeech(false);
      if (speechTranscript.trim()) {
        // Submit the transcript as the answer
        setUserAnswer(speechTranscript.trim());
        setSpeechTranscript('');
        setTimeout(() => handleAnswerSubmit(), 100); // slight delay to ensure state update
      }
    }
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecordingSpeech(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // Speak the latest AI question if voice is enabled
  useEffect(() => {
    if (!isAIVoiceOn) return;
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.type === 'question' && lastMsg.content) {
      const utter = new window.SpeechSynthesisUtterance(lastMsg.content);
      utter.lang = 'en-US';
      window.speechSynthesis.cancel(); // stop any previous
      window.speechSynthesis.speak(utter);
    }
  }, [messages, isAIVoiceOn]);

  // Load available agents when call interface is opened
  useEffect(() => {
    if (showCallInterface && availableAgents.length === 0) {
      loadAvailableAgents()
    }
  }, [showCallInterface])

  // Function to load available agents
  const loadAvailableAgents = async () => {
    setIsLoadingAgents(true)
    try {
      console.log('Loading agents...')
      const agents = await omnidimensionAPI.listInterviewAgents()
      console.log('Agents response:', agents)
      setAvailableAgents(agents || [])
      
      // If no agents returned, add a fallback demo agent
      if (!agents || agents.length === 0) {
        console.log('No agents found, adding demo agent')
        setAvailableAgents([
          {
            id: 2799,
            name: 'InterviewBot (Demo Agent)',
            description: 'AI Interview Agent for testing'
          }
        ])
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
      // Add fallback demo agent on error
      setAvailableAgents([
        {
          id: 2799,
          name: 'InterviewBot (Demo Agent)',
          description: 'AI Interview Agent for testing'
        }
      ])
    } finally {
      setIsLoadingAgents(false)
    }
  }

  // Add a refresh agents function
  const refreshAgents = async () => {
    setIsLoadingAgents(true)
    try {
      console.log('Refreshing agents...')
      const agents = await omnidimensionAPI.listInterviewAgents()
      console.log('Agents response:', agents)
      setAvailableAgents(agents || [])
      
      if (!agents || agents.length === 0) {
        console.log('No agents found, adding demo agent')
        setAvailableAgents([
          {
            id: 2799,
            name: 'InterviewBot (Demo Agent)',
            description: 'AI Interview Agent for testing'
          }
        ])
      }
    } catch (error) {
      console.error('Failed to refresh agents:', error)
      setAvailableAgents([
        {
          id: 2799,
          name: 'InterviewBot (Demo Agent)',
          description: 'AI Interview Agent for testing'
        }
      ])
    } finally {
      setIsLoadingAgents(false)
    }
  }

  // Add a demo function for testing OmniDimension API
  const triggerDemoInterviewCall = async () => {
    const agentId = 2799; // Your InterviewBot's ID
    const demoPhoneNumber = phoneNumber || '+1234567890'; // Use entered phone number or demo
    const interviewConfig: OmniDimensionConfig = {
      jobRole: practiceConfig?.jobRole || 'Software Engineer',
      difficultyLevel: practiceConfig?.difficultyLevel || 'intermediate',
      targetCompany: practiceConfig?.targetCompany || 'OmniDimension'
    };
    const candidateName = 'Demo Candidate';

    console.log(`Attempting to dispatch call for ${candidateName} to ${demoPhoneNumber} using Agent ID: ${agentId}...`);

    try {
      const response = await omnidimensionAPI.dispatchInterviewCall(
        agentId,
        demoPhoneNumber,
        interviewConfig,
        candidateName
      );
      console.log('Call dispatched successfully:', response);
      alert('Call initiated successfully! Check your phone.');
      setShowCallInterface(false);
      setPhoneNumber('');
      setSelectedAgentId(null);
    } catch (error: any) {
      console.error('Error dispatching call:', error.message);
      alert(`Failed to initiate call: ${error.message}. Please check console for details.`);
    }
  };

  // Update the existing dispatchCall function with better error handling
  const dispatchCall = async () => {
    if (!phoneNumber || !selectedAgentId || !practiceConfig) {
      alert('Please provide phone number and select an agent')
      return
    }

    setIsDispatchingCall(true)
    try {
      const response = await omnidimensionAPI.dispatchInterviewCall(
        selectedAgentId,
        phoneNumber,
        practiceConfig
      )
      
      console.log('Call dispatched successfully:', response);
      alert('Interview call dispatched successfully! Check your phone.')
      setShowCallInterface(false)
      setPhoneNumber('')
      setSelectedAgentId(null)
    } catch (error: any) {
      console.error('Failed to dispatch call:', error)
      alert(`Failed to dispatch call: ${error.message}. Please check console for details.`)
    } finally {
      setIsDispatchingCall(false)
    }
  }

  // Function to load call logs
  const loadCallLogs = async () => {
    try {
      const logs = await omnidimensionAPI.getInterviewCallLogs()
      setCallLogs(logs || [])
      setShowCallLogs(true)
    } catch (error) {
      console.error('Failed to load call logs:', error)
    }
  }

  const startSession = async () => {
    if (!practiceConfig) {
      setShowConfig(true)
      return
    }

    setIsSessionActive(true)
    setSessionTime(0)
    setMessages([])
    setShowReport(false)
    setReport({ summary: '', qaTable: '' })
    await generateQuestion()
  }

  const stopSession = async () => {
    setIsSessionActive(false)
    setIsRecording(false)
    setIsVideoOn(false)
    setShowSummary(true)
  }

  const generateQuestion = async () => {
    if (!practiceConfig) return

    setIsGeneratingQuestion(true)
    try {
      const question = await groqAPI.generateInterviewQuestion(practiceConfig, GroqAPI.getActiveApiKey())
      setCurrentQuestion(question)
      
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'question',
        content: question,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, newMessage])
    } catch (error) {
      console.error('Failed to generate question:', error)
      // Fallback question
      const fallbackQuestion = 'Tell me about a challenging project you worked on and how you overcame obstacles.'
      setCurrentQuestion(fallbackQuestion)
      
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'question',
        content: fallbackQuestion,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, newMessage])
    } finally {
      setIsGeneratingQuestion(false)
    }
  }

  const isNonAnswer = (answer: string) => {
    const normalized = answer.trim().toLowerCase()
    return NON_ANSWERS.includes(normalized)
  }

  const handleCodeSubmit = async () => {
    if (!codeContent.trim() || !practiceConfig) return

    setIsSubmittingCode(true)
    
    const codeMessage: Message = {
      id: Date.now().toString(),
      type: 'code',
      content: codeContent,
      timestamp: new Date(),
      language: selectedLanguage
    }

    setMessages(prev => [...prev, codeMessage])
    setCodeContent('')
    setIsCodeMode(false)
    setIsTyping(true)
    
    try {
      // Get the last question
      const lastQuestion = messages.filter(m => m.type === 'question').pop()?.content || currentQuestion
      
      const prompt = `You are acting as a technical interviewer reviewing code. The candidate has submitted the following code in response to this question:

Question: ${lastQuestion}
Language: ${selectedLanguage}
Code:
\`\`\`${selectedLanguage}
${codeContent}
\`\`\`

Please provide a brief, constructive response as the interviewer. You can:
- Acknowledge the code submission
- Ask a follow-up question about the implementation
- Request clarification on specific parts
- Move to the next question if appropriate
- Keep the interview flowing naturally

Respond as the interviewer would in a real technical interview. Keep it concise and interactive.`
      
      const aiReply = await groqAPI.makeRequest(prompt, GroqAPI.getActiveApiKey())
      const newQuestion: Message = {
        id: (Date.now() + 2).toString(),
        type: 'question',
        content: aiReply.trim(),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newQuestion])
      setCurrentQuestion(aiReply.trim())
    } catch (error) {
      console.error('Failed to process code submission:', error)
      // Fallback: ask a generic new question
      await generateQuestion()
    } finally {
      setIsTyping(false)
      setIsSubmittingCode(false)
    }
  }

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim() || !practiceConfig) return

    const answerMessage: Message = {
      id: Date.now().toString(),
      type: 'answer',
      content: userAnswer,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, answerMessage])
    setUserAnswer('')
    setIsTyping(true)
    try {
      // Get the last question
      const lastQuestion = messages.filter(m => m.type === 'question').pop()?.content || currentQuestion
      // Compose the prompt for the AI interviewer
      const chatHistory = messages
        .map(m => `${m.type === 'question' ? 'Interviewer:' : 'Candidate:'} ${m.content}`)
        .concat([`Candidate: ${userAnswer}`])
        .join('\n')
      const prompt = `You are acting as a strict, realistic, and interactive technical interviewer for a ${practiceConfig.difficultyLevel} ${practiceConfig.jobRole}${practiceConfig.targetCompany ? ` at ${practiceConfig.targetCompany}` : ''}.

Here is the interview so far:
${chatHistory}

Now, as the interviewer, react to the candidate's last answer. You can:
- Acknowledge the answer (briefly)
- Ask a relevant follow-up question if appropriate
- If the answer is poor or a non-answer, encourage or move to a new question
- Keep the conversation going as a real interview would
- Only ask one question at a time
- Do not provide feedback or analysis, just keep the interview interactive

Your next message should be the next interviewer message/question only.`
      const aiReply = await groqAPI.makeRequest(prompt, GroqAPI.getActiveApiKey())
      const newQuestion: Message = {
        id: (Date.now() + 2).toString(),
        type: 'question',
        content: aiReply.trim(),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newQuestion])
      setCurrentQuestion(aiReply.trim())
    } catch (error) {
      // Fallback: ask a generic new question
      await generateQuestion()
    } finally {
      setIsTyping(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateAverageScore = () => {
    const feedbackMessages = messages.filter(m => m.aiFeedback)
    if (feedbackMessages.length === 0) return 0
    
    const totalScore = feedbackMessages.reduce((sum, message) => sum + (message.aiFeedback?.score || 0), 0)
    return Math.round(totalScore / feedbackMessages.length)
  }

  // Generate AI-powered session report
  const generateSessionReport = async () => {
    setIsGeneratingReport(true)
    setShowReport(true)
    try {
      if (!practiceConfig) return
      // Collect all Q&A pairs
      const qaPairs = [] as { question: string; answer: string; type: string }[]
      let lastQuestion = ''
      messages.forEach(m => {
        if (m.type === 'question') lastQuestion = m.content
        if (m.type === 'answer' || m.type === 'code') {
          qaPairs.push({ 
            question: lastQuestion, 
            answer: m.type === 'code' ? `[Code in ${m.language}]\n${m.content}` : m.content,
            type: m.type
          })
        }
      })
      // Save session to localStorage for history (future feature)
      const sessionData = {
        config: practiceConfig,
        qaPairs,
        messages,
        endedAt: new Date().toISOString()
      }
      const history = JSON.parse(localStorage.getItem('interviewHistory') || '[]')
      localStorage.setItem('interviewHistory', JSON.stringify([sessionData, ...history]))
      // Prepare markdown table for Q&A
      const qaTable = `| Question | Answer | Type |\n|---|---|---|\n${qaPairs.map(q => `| ${q.question.replace(/\|/g, '')} | ${q.answer.replace(/\|/g, '')} | ${q.type} |`).join('\n')}`
      const prompt = `You are an expert technical interviewer and coach. Analyze the following interview session for a ${practiceConfig.difficultyLevel} ${practiceConfig.jobRole}${practiceConfig.targetCompany ? ` at ${practiceConfig.targetCompany}` : ''}.

Here is the full Q&A from the session as a markdown table:
${qaTable}

Instructions:
- Carefully analyze the quality of the answers. If the answer is wrong, missing, or "I don't know", give a low score (0-30).
- Be strict and realistic in scoring. Do not be overly positive.
- Only show the score and report as you determine from the answers. Do not use any default or fallback values.
- If all answers are wrong or missing, the score should be very low.
- Your report should include:
  - Overall performance summary
  - Key strengths (if any)
  - Areas for improvement
  - Actionable suggestions
  - Final score (average, 0-100)
  - Encouragement for next steps
- Format the report in markdown with clear sections.
- Do not include any placeholder or dummy data. Only use your own analysis.`
      const summary = await groqAPI.makeRequest(prompt, GroqAPI.getActiveApiKey())
      setReport({ summary, qaTable })
    } catch (error) {
      setReport({ summary: 'Failed to generate report. Please try again.', qaTable: '' })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // Handler for showing the report
  const handleShowReport = async () => {
    setShowSummary(false)
    await generateSessionReport()
  }

  // Helper to get the active API key
  const getActiveApiKey = () => userApiKey || process.env.NEXT_PUBLIC_GROQ_API_KEY || ''

  if (showConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-dark-900 mb-2">Configuration Required</h2>
            <p className="text-dark-600">Please set up your practice session first</p>
          </div>
          
          <button
            onClick={() => window.location.href = '/start-practice'}
            className="button-primary w-full"
          >
            Configure Practice Session
          </button>
        </div>
      </div>
    )
  }

  if (showSummary) {
    const numQuestions = messages.filter(m => m.type === 'question').length
    const numAnswers = messages.filter(m => m.type === 'answer').length
    const numCodeSubmissions = messages.filter(m => m.type === 'code').length
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 max-w-xl w-full mx-4 flex flex-col items-center">
          <Trophy className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold gradient-text mb-2 text-center">Interview Complete!</h2>
          <p className="text-lg text-dark-700 mb-6 text-center">
            Thank you for completing your AI-powered interview practice session.<br/>
            Ready to see your personalized report?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-6">
            <div className="flex-1 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-xl p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-primary-700">{numQuestions}</span>
              <span className="text-dark-600 text-sm">Questions Asked</span>
            </div>
            <div className="flex-1 bg-gradient-to-r from-secondary-100 to-primary-100 rounded-xl p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-secondary-700">{numAnswers}</span>
              <span className="text-dark-600 text-sm">Text Answers</span>
            </div>
            <div className="flex-1 bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-green-700">{numCodeSubmissions}</span>
              <span className="text-dark-600 text-sm">Code Submissions</span>
            </div>
            <div className="flex-1 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-dark-700">{formatTime(sessionTime)}</span>
              <span className="text-dark-600 text-sm">Session Time</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-4">
            <button
              className="button-primary text-lg flex-1 min-w-[180px] py-4"
              onClick={handleShowReport}
            >
              Show Report
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              className="button-secondary flex-1 min-w-[180px] w-full py-4"
              onClick={() => {
                setShowSummary(false)
                setMessages([])
                setSessionTime(0)
              }}
            >
              Start New Session
            </button>
            <Link href="/" passHref legacyBehavior>
              <a className="button-secondary flex-1 min-w-[180px] w-full py-4 flex items-center justify-center">
                Back to Home
              </a>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (showReport) {
    // Parse Q&A pairs for card rendering
    const qaPairs = []
    if (report.qaTable) {
      // Parse the markdown table into Q&A pairs (skip header)
      const lines = report.qaTable.split('\n').filter(Boolean)
      for (let i = 2; i < lines.length; i++) {
        const match = lines[i].match(/^\|(.+)\|(.+)\|(.+)\|$/)
        if (match) {
          qaPairs.push({
            question: match[1].trim(),
            answer: match[2].trim(),
            type: match[3].trim()
          })
        }
      }
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border-2 border-primary-100">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <FileText className="w-8 h-8 text-primary-600" />
            <h2 className="text-2xl font-bold gradient-text">Session Report</h2>
          </div>
          {isGeneratingReport ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg text-dark-600">Generating your report...</p>
            </div>
          ) : (
            <>
              <div className="mb-8 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 p-4 shadow-inner">
                <h3 className="font-semibold text-dark-900 mb-4">Questions & Answers</h3>
                <div className="space-y-4">
                  {qaPairs.length === 0 && (
                    <div className="text-dark-600 italic">No Q&A data available.</div>
                  )}
                  {qaPairs.map((qa, idx) => (
                    <div key={idx} className="bg-white/80 rounded-xl p-4 shadow flex flex-col gap-2">
                      <div className="font-semibold text-primary-700">Question:</div>
                      <div className="text-dark-900 mb-2">{qa.question}</div>
                      <div className="font-semibold text-secondary-700">
                        Your {qa.type === 'code' ? 'Code' : 'Answer'}:
                      </div>
                      <div className="text-dark-800">
                        {qa.type === 'code' ? (
                          <pre className="bg-dark-100 rounded-lg p-3 overflow-x-auto text-sm font-mono">
                            <code>{qa.answer}</code>
                          </pre>
                        ) : (
                          qa.answer
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="prose max-w-none rounded-xl bg-white/80 p-6 shadow-lg">
                <ReactMarkdown>{report.summary || ''}</ReactMarkdown>
              </div>
            </>
          )}
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/" passHref legacyBehavior>
              <a className="button-secondary flex-1 min-w-[180px] w-full py-4 flex items-center justify-center">
                Back to Home
              </a>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">AI Interview Practice</h1>
              <p className="text-dark-600 mt-2">Real-time coaching and feedback</p>
              {practiceConfig && (
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-dark-600">
                    <Briefcase className="w-4 h-4" />
                    {practiceConfig.jobRole}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-600">
                    <TrendingUp className="w-4 h-4" />
                    {practiceConfig.difficultyLevel}
                  </div>
                  {practiceConfig.targetCompany && (
                    <div className="flex items-center gap-2 text-sm text-dark-600">
                      <Target className="w-4 h-4" />
                      {practiceConfig.targetCompany}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* AI Voice Toggle */}
              <button
                onClick={() => setIsAIVoiceOn(v => !v)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-sm transition-colors ${isAIVoiceOn ? 'bg-primary-500 text-white border-primary-600' : 'bg-dark-100 text-dark-700 border-dark-200'}`}
                title={isAIVoiceOn ? 'Mute AI Voice' : 'Enable AI Voice'}
              >
                {isAIVoiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {isAIVoiceOn ? 'AI Voice On' : 'AI Voice Off'}
              </button>
              {/* Add Your API Key Button */}
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-dark-100 hover:bg-dark-200 text-dark-700 text-sm border border-dark-200"
                onClick={() => setShowApiKeyCard(true)}
              >
                <Key className="w-4 h-4" />
                Add Your API Key
              </button>
              {/* API Key Status Indicator */}
              {apiKeyStatus && (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${userApiKey ? 'bg-blue-500' : apiKeyStatus.hasKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <Link href="/test-api" className="text-sm text-dark-600 hover:text-primary-600 transition-colors">
                    <div className="flex items-center gap-1">
                      <Key className="w-4 h-4" />
                      API Status
                    </div>
                  </Link>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-dark-600">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(sessionTime)}</span>
              </div>
              {!isSessionActive ? (
                <button 
                  onClick={startSession}
                  disabled={isGeneratingQuestion}
                  className="button-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingQuestion ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Session
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={stopSession}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-xl transition-colors duration-300"
                >
                  End Session
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-dark-900 mb-4">Session Controls</h3>
              <div className="space-y-4">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-dark-100 hover:bg-dark-200 text-dark-700'
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                    isVideoOn
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-dark-100 hover:bg-dark-200 text-dark-700'
                  }`}
                >
                  {isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  {isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
                </button>

                <button
                  onClick={generateQuestion}
                  disabled={!isSessionActive || isGeneratingQuestion}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-dark-100 hover:bg-dark-200 text-dark-700 transition-all duration-300 disabled:opacity-50"
                >
                  {isGeneratingQuestion ? (
                    <>
                      <div className="w-5 h-5 border-2 border-dark-600 border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-5 h-5" />
                      New Question
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsCodeMode(!isCodeMode)}
                  disabled={!isSessionActive}
                  className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 disabled:opacity-50 ${
                    isCodeMode
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-dark-100 hover:bg-dark-200 text-dark-700'
                  }`}
                >
                  <Code className="w-5 h-5" />
                  {isCodeMode ? 'Exit Code Mode' : 'Write Code'}
                </button>

                <button
                  onClick={() => setShowCallInterface(true)}
                  disabled={!isSessionActive}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all duration-300 disabled:opacity-50"
                >
                  <Phone className="w-5 h-5" />
                  Schedule Phone Interview
                </button>

                <button
                  onClick={loadCallLogs}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300"
                >
                  <Phone className="w-5 h-5" />
                  View Call Logs
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-dark-900 mb-4">Session Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-dark-600">Text Answers</span>
                  <span className="font-semibold text-dark-900">
                    {messages.filter(m => m.type === 'answer').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-600">Code Submissions</span>
                  <span className="font-semibold text-green-600">
                    {messages.filter(m => m.type === 'code').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-600">Total Responses</span>
                  <span className="font-semibold text-primary-600">
                    {messages.filter(m => m.type === 'answer' || m.type === 'code').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-600">Average Score</span>
                  <span className="font-semibold text-primary-600">{calculateAverageScore()}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-600">Session Time</span>
                  <span className="font-semibold text-dark-900">{formatTime(sessionTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="glass-effect rounded-2xl p-6 h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-dark-900">Interview Session</h3>
                <div className="flex items-center gap-2">
                  {isRecording && <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
                  {isVideoOn && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.type === 'question' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                        message.type === 'question'
                          ? 'bg-primary-500 text-white'
                          : message.type === 'answer'
                          ? 'bg-dark-200 text-dark-900'
                          : message.type === 'code'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                          : 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white'
                      }`}>
                        {message.type === 'code' ? (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <FileCode className="w-4 h-4" />
                              <span className="text-sm font-mono">{message.language}</span>
                            </div>
                            <pre className="bg-dark-900 rounded-lg p-3 overflow-x-auto text-sm font-mono text-white border border-dark-700">
                              <code>{message.content}</code>
                            </pre>
                          </div>
                        ) : (
                          <p className="mb-2">{message.content}</p>
                        )}
                        
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 animate-pulse" />
                        <span className="text-sm">AI is analyzing your response...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                  placeholder="Type your answer here..."
                  className="flex-1 p-4 rounded-xl border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={!isSessionActive}
                />
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!isSessionActive || !userAnswer.trim() || isTyping}
                  className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Card Modal */}
      <AnimatePresence>
        {showApiKeyCard && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            onClick={() => setShowApiKeyCard(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-dark-400 hover:text-dark-700"
                onClick={() => setShowApiKeyCard(false)}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Key className="w-6 h-6 text-primary-500" />
                Use Your Own Groq API Key
              </h2>
              <p className="mb-4 text-dark-700 text-sm">
                <strong>Your API key is secure.</strong> It is only stored in your browser and never sent to our servers. Using your own key reduces traffic and gives you rapid, private responses.
              </p>
              <input
                type="password"
                className="w-full p-3 border border-dark-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Paste your Groq API key (starts with gsk_)"
                value={apiKeyInput}
                onChange={e => {
                  setApiKeyInput(e.target.value)
                  setApiKeySaved(false)
                }}
              />
              <div className="flex gap-2 mb-4">
                <button
                  className="button-primary flex-1"
                  onClick={() => {
                    localStorage.setItem('userGroqApiKey', apiKeyInput)
                    setUserApiKey(apiKeyInput)
                    setApiKeySaved(true)
                  }}
                  disabled={!apiKeyInput.startsWith('gsk_')}
                >
                  Save Key
                </button>
                {userApiKey && (
                  <button
                    className="flex-1 bg-dark-100 hover:bg-dark-200 text-dark-700 rounded-lg px-4 py-2"
                    onClick={() => {
                      localStorage.removeItem('userGroqApiKey')
                      setUserApiKey(null)
                      setApiKeyInput('')
                      setApiKeySaved(false)
                    }}
                  >
                    Remove Key
                  </button>
                )}
              </div>
              {apiKeySaved && (
                <div className="text-green-600 text-sm mb-2">API key saved! All requests will use your key.</div>
              )}
              <div className="bg-dark-50 rounded-lg p-3 text-xs text-dark-700 mb-2">
                <strong>How to get a Groq API key:</strong>
                <ol className="list-decimal ml-5 mt-1">
                  <li>Go to <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">Groq Console</a></li>
                  <li>Sign in or create an account</li>
                  <li>Navigate to <b>API Keys</b> and generate a new key</li>
                  <li>Copy the key (starts with <code>gsk_</code>) and paste it here</li>
                </ol>
              </div>
              <div className="text-xs text-dark-500 mt-2">
                <b>Model used:</b> llama3-8b-8192<br />
                <b>Docs:</b> <a href="https://console.groq.com/docs" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">Groq API Documentation</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Writing Modal */}
      <AnimatePresence>
        {isCodeMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            onClick={() => setIsCodeMode(false)}
          >
            <div
              className="bg-dark-900 rounded-2xl shadow-xl p-0 max-w-4xl w-[900px] min-h-[520px] relative border border-dark-700 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-5 right-6 text-dark-400 hover:text-white text-2xl z-10"
                onClick={() => setIsCodeMode(false)}
              >
                ×
              </button>
              <div className="flex flex-row h-full divide-x divide-dark-800" style={{ minHeight: 520, height: 520 }}>
                {/* Left: Question */}
                <div className="w-1/2 p-8 flex flex-col bg-dark-800 rounded-l-2xl overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                    <FileCode className="w-6 h-6 text-primary-400" />
                    Code Writing Mode
                  </h2>
                  <div className="mb-4 p-4 rounded-lg bg-dark-900 border border-dark-700 text-white text-base flex-1 overflow-y-auto">
                    <span className="font-semibold text-primary-300">Question:</span><br />
                    {currentQuestion}
                  </div>
                  <div className="text-sm text-dark-200 bg-dark-900 p-3 rounded-lg border border-dark-700">
                    Write and submit code to answer technical questions. The AI interviewer will review your code and provide feedback or ask follow-up questions.
                  </div>
                </div>
                {/* Right: Code Editor */}
                <div className="w-1/2 p-8 flex flex-col bg-dark-900 rounded-r-2xl overflow-y-auto">
                  <div className="flex gap-2 mb-3">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="min-w-[200px] px-3 py-2 rounded-lg border border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-dark-800 text-white"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="csharp">C#</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="typescript">TypeScript</option>
                      <option value="php">PHP</option>
                      <option value="ruby">Ruby</option>
                      <option value="swift">Swift</option>
                      <option value="kotlin">Kotlin</option>
                      <option value="scala">Scala</option>
                      <option value="sql">SQL</option>
                    </select>
                    <button
                      onClick={() => setIsCodeMode(false)}
                      className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <textarea
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    placeholder={`Write your ${selectedLanguage} code here...`}
                    className="w-full p-4 rounded-xl border border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-none bg-dark-800 text-white mb-4 flex-1"
                    disabled={!isSessionActive}
                    rows={12}
                    style={{ minHeight: 220 }}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleCodeSubmit}
                      disabled={!isSessionActive || !codeContent.trim() || isSubmittingCode}
                      className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingCode ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Preview */}
      {isVideoOn && (
        <div className="fixed bottom-6 right-6 z-40 bg-dark-900 border border-dark-700 rounded-xl shadow-lg p-2">
          <video
            ref={videoRef}
            width={240}
            height={180}
            autoPlay
            muted
            className="rounded-lg bg-black"
            style={{ objectFit: 'cover' }}
          />
          <div className="text-xs text-white text-center mt-1">Webcam Preview</div>
        </div>
      )}

      {/* Live Transcript */}
      {isRecording && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-dark-900 border border-dark-700 rounded-xl shadow-lg px-6 py-4 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-red-500 font-semibold">Recording... Speak your answer</span>
          </div>
          <div className="text-white text-lg min-h-[32px] max-w-[400px] text-center">
            {speechTranscript || <span className="opacity-50">Listening...</span>}
          </div>
          <div className="text-xs text-dark-300 mt-2">Click "Stop Recording" to submit your answer</div>
        </div>
      )}

      {/* Call Interface Modal */}
      {showCallInterface && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowCallInterface(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-dark-400 hover:text-dark-700 text-2xl"
              onClick={() => setShowCallInterface(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Phone className="w-6 h-6 text-green-500" />
              Schedule Phone Interview
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Phone Number (with country code)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+15551234567"
                  className="w-full p-3 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-dark-700">
                    Select Interview Agent
                  </label>
                  <button
                    onClick={refreshAgents}
                    disabled={isLoadingAgents}
                    className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    {isLoadingAgents ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
                {isLoadingAgents ? (
                  <div className="w-full p-3 border border-dark-200 rounded-lg bg-dark-50">
                    Loading agents...
                  </div>
                ) : (
                  <select
                    value={selectedAgentId || ''}
                    onChange={(e) => setSelectedAgentId(Number(e.target.value))}
                    className="w-full p-3 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select an agent</option>
                    {availableAgents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name || `Agent ${agent.id}`}
                      </option>
                    ))}
                  </select>
                )}
                {availableAgents.length === 0 && !isLoadingAgents && (
                  <p className="text-xs text-red-600 mt-1">
                    No agents available. Using demo agent (ID: 2799).
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={dispatchCall}
                  disabled={!phoneNumber || !selectedAgentId || isDispatchingCall}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDispatchingCall ? 'Dispatching...' : 'Schedule Call'}
                </button>
                <button
                  onClick={triggerDemoInterviewCall}
                  disabled={!phoneNumber || isDispatchingCall}
                  className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  title="Test with Agent ID 2799"
                >
                  Demo
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Call Logs Modal */}
      {showCallLogs && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowCallLogs(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full relative max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-dark-400 hover:text-dark-700 text-2xl"
              onClick={() => setShowCallLogs(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Phone className="w-6 h-6 text-blue-500" />
              Call Logs
            </h2>
            <div className="space-y-4">
              {callLogs.length === 0 ? (
                <p className="text-dark-600">No call logs found.</p>
              ) : (
                callLogs.map((log) => (
                  <div key={log.id} className="border border-dark-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-dark-900">
                          Call to {log.to_number}
                        </h3>
                        <p className="text-sm text-dark-600">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.status === 'completed' ? 'bg-green-100 text-green-800' :
                        log.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    {log.duration && (
                      <p className="text-sm text-dark-600">
                        Duration: {Math.round(log.duration / 60)} minutes
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 