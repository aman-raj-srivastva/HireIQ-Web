'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  TrendingUp, 
  Building, 
  ArrowRight, 
  Sparkles,
  Target,
  Zap,
  Users,
  Brain
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface PracticeConfig {
  jobRole: string
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  targetCompany?: string
}

const jobRoles = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Product Manager',
  'DevOps Engineer',
  'UI/UX Designer',
  'Mobile Developer',
  'QA Engineer',
  'System Administrator',
  'Data Engineer',
  'Machine Learning Engineer',
  'Cloud Architect',
  'Security Engineer'
]

const difficultyLevels = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: '0-2 years experience',
    icon: Users
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: '2-5 years experience',
    icon: TrendingUp
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: '5+ years experience',
    icon: Zap
  }
]

const popularCompanies = [
  'Google',
  'Microsoft',
  'Amazon',
  'Apple',
  'Meta',
  'Netflix',
  'Uber',
  'Airbnb',
  'Stripe',
  'Shopify',
  'Salesforce',
  'Adobe',
  'Intel',
  'Oracle',
  'IBM'
]

// Add a mapping from company name to logo path
const companyLogos: Record<string, string> = {
  Google: '/assets/google.png',
  Microsoft: '/assets/microsoft.png',
  Amazon: '/assets/amazon.png',
  Apple: '/assets/apple.png',
  Meta: '/assets/meta.png',
  Netflix: '/assets/netflix.png',
  Uber: '/assets/uber.png',
  Airbnb: '/assets/airbnb.png',
  Stripe: '/assets/stripe.png',
  Shopify: '/assets/shopify.png',
  Salesforce: '/assets/salesforce.png',
  Adobe: '/assets/adobe.png',
  Intel: '/assets/intel.png',
  Oracle: '/assets/oracle.png',
  IBM: '/assets/ibm.png',
}

export default function StartPracticePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<PracticeConfig>({
    jobRole: '',
    difficultyLevel: 'intermediate',
    targetCompany: ''
  })
  const [customCompany, setCustomCompany] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleJobRoleSelect = (role: string) => {
    setConfig(prev => ({ ...prev, jobRole: role }))
    setStep(2)
  }

  const handleDifficultySelect = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setConfig(prev => ({ ...prev, difficultyLevel: level }))
    setStep(3)
  }

  const handleCompanySelect = (company: string) => {
    setConfig(prev => ({ ...prev, targetCompany: company }))
    setStep(4)
  }

  const handleCustomCompany = () => {
    if (customCompany.trim()) {
      setConfig(prev => ({ ...prev, targetCompany: customCompany.trim() }))
      setStep(4)
    }
  }

  const startPractice = async () => {
    setIsLoading(true)
    
    // Store the configuration in localStorage for the practice session
    localStorage.setItem('practiceConfig', JSON.stringify(config))
    
    // Navigate to practice page
    router.push('/practice')
  }

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Start Your Practice</h1>
          </div>
          <p className="text-xl text-dark-600 max-w-2xl mx-auto">
            Let's customize your interview practice experience with AI-powered coaching
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= stepNumber 
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white' 
                    : 'bg-dark-200 text-dark-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-gradient-to-r from-primary-500 to-secondary-500' : 'bg-dark-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-dark-600">
            Step {step} of 4
          </div>
        </motion.div>

        {/* Step 1: Job Role Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-effect rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-dark-900 mb-2">What role are you interviewing for?</h2>
              <p className="text-dark-600">Select your target job position to get personalized questions</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleJobRoleSelect(role)}
                  className="p-6 text-left bg-white hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 border-2 border-dark-100 hover:border-primary-300 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-dark-900">{role}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Difficulty Level */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-effect rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-dark-900 mb-2">What's your experience level?</h2>
              <p className="text-dark-600">This helps us tailor the interview difficulty to your background</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {difficultyLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleDifficultySelect(level.id as 'beginner' | 'intermediate' | 'advanced')}
                  className="p-8 text-center bg-white hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 border-2 border-dark-100 hover:border-primary-300 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <level.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-dark-900 mb-2">{level.name}</h3>
                  <p className="text-dark-600">{level.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={goBack}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Back to job role selection
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Target Company */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-effect rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-dark-900 mb-2">Target Company (Optional)</h2>
              <p className="text-dark-600">Select a company to get more specific interview questions</p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {popularCompanies.map((company) => (
                <button
                  key={company}
                  onClick={() => handleCompanySelect(company)}
                  className="p-4 text-center bg-white hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 border-2 border-dark-100 hover:border-primary-300 rounded-xl transition-all duration-300 hover:shadow-lg flex flex-col items-center"
                >
                  {companyLogos[company] ? (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 bg-white">
                      <Image src={companyLogos[company]} alt={company + ' logo'} width={32} height={32} className="object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="font-medium text-dark-900 text-sm">{company}</span>
                </button>
              ))}
            </div>

            <div className="mb-8">
              <div className="text-center mb-4">
                <span className="text-dark-600">Or enter a custom company:</span>
              </div>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="text"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="Enter company name..."
                  className="flex-1 p-4 rounded-xl border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomCompany()}
                />
                <button
                  onClick={handleCustomCompany}
                  disabled={!customCompany.trim()}
                  className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => handleCompanySelect('')}
                className="button-secondary mr-4"
              >
                Skip Company Selection
              </button>
              <button
                onClick={goBack}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Back to difficulty level
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review and Start */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-effect rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-dark-900 mb-2">Review Your Settings</h2>
              <p className="text-dark-600">Everything looks good? Let's start your AI-powered interview practice!</p>
            </div>

            <div className="bg-white rounded-xl p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-dark-900 mb-1">Job Role</h3>
                  <p className="text-dark-600">{config.jobRole}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-dark-900 mb-1">Difficulty</h3>
                  <p className="text-dark-600 capitalize">{config.difficultyLevel}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-dark-900 mb-1">Company</h3>
                  <p className="text-dark-600">{config.targetCompany || 'Any company'}</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <button
                onClick={startPractice}
                disabled={isLoading}
                className="button-primary text-lg px-8 py-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Starting Practice...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Start AI-Powered Practice
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </button>
              <div>
                <button
                  onClick={goBack}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  ← Back to company selection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 