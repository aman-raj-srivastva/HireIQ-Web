# AI Interview Practice Platform

A modern, aesthetically appealing website for AI-powered interview practice with real-time feedback and coaching using Groq API.

## 🚀 Features

- **AI-Powered Feedback**: Get instant, personalized feedback on your responses using Groq API
- **Customized Practice Sessions**: Configure job role, difficulty level, and target company
- **Multiple Interview Types**: Practice behavioral, technical, and case study interviews
- **Real-time Coaching**: Interactive chat interface with AI analysis
- **Code Writing & Submission**: Write and submit code to answer technical questions with AI review
- **Voice & Video Support**: Record audio and video for comprehensive feedback
- **Progress Tracking**: Monitor your improvement with detailed analytics
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **API Testing Tools**: Built-in tools to validate your Groq API key

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)
- **AI Integration**: Groq API (Llama 3.1 8B)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-interview-practice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Groq API key:
   ```env
   NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
   ```
   
   Get your API key from: https://console.groq.com/

4. **Test your API key** (Optional but recommended)
   ```bash
   # Method 1: Using the web interface
   npm run dev
   # Then visit http://localhost:3000/test-api
   
   # Method 2: Using the command line script
   node scripts/test-api.js your_api_key_here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Key Testing

### Web Interface Testing
Visit `/test-api` to access the built-in API testing tool that provides:
- **API Key Status**: Shows if your key is present and its format
- **Connection Test**: Validates your key with the Groq API
- **Detailed Error Messages**: Specific feedback for different error types
- **Setup Instructions**: Step-by-step guide to get your API key

### Command Line Testing
Use the provided script for quick testing:
```bash
# Test with environment variable
node scripts/test-api.js

# Test with specific key
node scripts/test-api.js gsk_your_key_here
```

### Error Types Handled
- **Missing API Key**: No key found in environment
- **Invalid Format**: Key doesn't start with "gsk_"
- **Invalid API Key**: Authentication failed
- **Insufficient Permissions**: Key valid but lacks model access
- **Rate Limit Exceeded**: Too many requests
- **Network Errors**: Connection issues

## 🎯 Usage

### Homepage
- Explore the features and benefits of AI-powered interview practice
- View testimonials from successful users
- Learn about different interview types

### Start Practice Setup
1. Click "Start Free Practice" on the homepage
2. Navigate through the 4-step configuration:
   - **Step 1**: Select your job role (Software Engineer, Data Scientist, etc.)
   - **Step 2**: Choose your experience level (Beginner, Intermediate, Advanced)
   - **Step 3**: Optionally select a target company
   - **Step 4**: Review your settings and start practicing

### Practice Session
1. The AI will generate personalized questions based on your configuration
2. Answer questions and receive real-time AI feedback
3. **Write and submit code** for technical questions using the built-in code editor
4. Use voice/video recording for enhanced practice
5. Track your progress and scores
6. Generate new questions anytime

**Code Writing Feature:**
- Click the "Write Code" button in session controls to enter code mode
- Select your programming language from the dropdown (JavaScript, Python, Java, C++, etc.)
- Write your code in the syntax-highlighted editor
- Submit code for AI review and feedback
- The AI interviewer will analyze your code and ask follow-up questions

### API Status Monitoring
- **Practice Page**: Shows API status indicator in the header
- **Real-time Validation**: Tests API connection before generating questions
- **Fallback Mode**: Works with predefined questions if API is unavailable

## 🎨 Design Features

- **Glass Morphism**: Modern glass-effect cards with backdrop blur
- **Gradient Text**: Eye-catching gradient text effects
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Design**: Works perfectly on all devices
- **Dark Mode Ready**: Color scheme optimized for accessibility

## 📱 Pages

- **Homepage** (`/`): Landing page with features and testimonials
- **Start Practice** (`/start-practice`): 4-step configuration wizard
- **Practice** (`/practice`): Interactive interview practice session
- **API Tester** (`/test-api`): Comprehensive API key validation tool

## 🤖 AI Integration

The platform uses Groq API for:
- **Dynamic Question Generation**: Questions tailored to job role, experience level, and company
- **Intelligent Feedback**: Detailed analysis with scores, strengths, and suggestions
- **Code Analysis**: Review and feedback on submitted code solutions
- **Follow-up Questions**: Contextual follow-ups based on your answers
- **Fallback System**: Graceful degradation when API is unavailable
- **Real-time Validation**: Continuous API health monitoring

### Supported Job Roles
- Software Engineer
- Frontend Developer
- Backend Developer
- Full Stack Developer
- Data Scientist
- Product Manager
- DevOps Engineer
- UI/UX Designer
- Mobile Developer
- QA Engineer
- And more...

### Difficulty Levels
- **Beginner**: 0-2 years experience, fundamental concepts
- **Intermediate**: 2-5 years experience, practical scenarios
- **Advanced**: 5+ years experience, complex challenges

### Supported Programming Languages
The code writing feature supports multiple programming languages:
- **Web Development**: JavaScript, TypeScript, PHP, Ruby
- **General Purpose**: Python, Java, C++, C#, Go, Rust
- **Mobile Development**: Swift, Kotlin
- **Data & Analytics**: SQL, Scala
- **More languages can be easily added**

## 🔧 Customization

### Colors
The color scheme can be customized in `tailwind.config.js`:
- Primary: Blue gradient (`primary-500` to `primary-600`)
- Secondary: Purple gradient (`secondary-500` to `secondary-600`)
- Dark: Gray scale (`dark-50` to `dark-900`)

### AI Prompts
Modify AI behavior in `lib/groq-api.ts`:
- Question generation prompts
- Feedback analysis prompts
- Follow-up question generation

### Job Roles
Add new job roles in `app/start-practice/page.tsx`:
```typescript
const jobRoles = [
  'Your Custom Role',
  // ... existing roles
]
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
```bash
npm run build
npm start
```

## 📈 Future Enhancements

- [ ] Real-time voice transcription
- [ ] Video analysis with body language feedback
- [ ] User authentication and profiles
- [ ] Session recording and playback
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Integration with other AI providers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@aiinterviewpractice.com or create an issue in the repository.

## 🔑 API Key Setup

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Generate an API key
4. Add it to your `.env.local` file:
   ```env
   NEXT_PUBLIC_GROQ_API_KEY=gsk_your_key_here
   ```
5. Test your key using the built-in tools:
   - Web interface: `/test-api`
   - Command line: `node scripts/test-api.js`

## 🧪 Testing Your Setup

### Quick Test
```bash
# Start the development server
npm run dev

# In another terminal, test your API key
node scripts/test-api.js
```

### Comprehensive Testing
1. Visit `http://localhost:3000/test-api`
2. Check API key status
3. Run connection test
4. Verify all features work correctly

---

**Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and Groq API**

---
