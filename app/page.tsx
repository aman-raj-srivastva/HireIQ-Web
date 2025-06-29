'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Mic, 
  Video, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Star,
  Play,
  ArrowRight,
  CheckCircle,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [activeTab, setActiveTab] = useState('behavioral')

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Feedback',
      description: 'Get instant, personalized feedback on your responses and body language'
    },
    {
      icon: Mic,
      title: 'Voice Recognition',
      description: 'Practice with voice input and get real-time speech analysis'
    },
    {
      icon: Video,
      title: 'Video Analysis',
      description: 'Record yourself and receive feedback on presentation skills'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics and insights'
    }
  ]

  const interviewTypes = [
    { id: 'behavioral', name: 'Behavioral', icon: Users },
    { id: 'technical', name: 'Technical', icon: Brain },
    { id: 'case', name: 'Case Study', icon: MessageSquare },
    { id: 'system', name: 'System Design', icon: Zap }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      company: 'Google',
      content: 'The AI feedback helped me identify areas I never knew needed improvement. Landed my dream job!',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Product Manager',
      company: 'Microsoft',
      content: 'Incredible practice platform. The realistic scenarios and instant feedback were game-changing.',
      rating: 5
    },
    {
      name: 'Priya Patel',
      role: 'Data Scientist',
      company: 'Amazon',
      content: 'From nervous to confident. This platform transformed my interview skills completely.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Master</span> Your
              <br />
              Interview Skills
            </h1>
            <p className="text-xl md:text-2xl text-dark-600 mb-8 max-w-3xl mx-auto">
              Practice with AI-powered coaching, get instant feedback, and land your dream job with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/start-practice">
                <button className="button-primary flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Start Free Practice
                </button>
              </Link>
              <button className="button-secondary flex items-center justify-center gap-2">
                Watch Demo
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-dark-900 mb-4">
              Why Choose AI Interview Practice?
            </h2>
            <p className="text-xl text-dark-600 max-w-2xl mx-auto">
              Experience the future of interview preparation with cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="glass-effect rounded-2xl p-8 card-hover"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-dark-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-dark-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview Types Section */}
      <section className="py-20 bg-gradient-to-br from-dark-50 to-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-dark-900 mb-4">
              Practice Any Interview Type
            </h2>
            <p className="text-xl text-dark-600 max-w-2xl mx-auto">
              From behavioral questions to technical challenges, we've got you covered
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {interviewTypes.map((type, index) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                onClick={() => setActiveTab(type.id)}
                className={`glass-effect rounded-2xl p-6 text-left transition-all duration-300 ${
                  activeTab === type.id 
                    ? 'ring-2 ring-primary-500 shadow-lg' 
                    : 'hover:shadow-lg'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                  activeTab === type.id 
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500' 
                    : 'bg-dark-100'
                }`}>
                  <type.icon className={`w-5 h-5 ${
                    activeTab === type.id ? 'text-white' : 'text-dark-600'
                  }`} />
                </div>
                <h3 className={`font-semibold text-lg ${
                  activeTab === type.id ? 'text-primary-600' : 'text-dark-900'
                }`}>
                  {type.name}
                </h3>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-dark-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-dark-600 max-w-2xl mx-auto">
              Join thousands of professionals who've transformed their careers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="glass-effect rounded-2xl p-8 card-hover"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-dark-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <h4 className="font-semibold text-dark-900">{testimonial.name}</h4>
                  <p className="text-dark-500">{testimonial.role} at {testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start your free practice session today and experience the power of AI-driven interview coaching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/start-practice">
                <button className="bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors duration-300">
                  Get Started Free
                </button>
              </Link>
              <button className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white hover:text-primary-600 transition-colors duration-300">
                View Pricing
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold gradient-text mb-4">AI Interview Practice</h3>
              <p className="text-dark-300">
                Transform your interview skills with AI-powered coaching and personalized feedback.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-dark-300">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-dark-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-dark-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-700 mt-8 pt-8 text-center text-dark-300">
            <p>&copy; 2024 AI Interview Practice. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 