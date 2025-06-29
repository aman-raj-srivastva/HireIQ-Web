#!/usr/bin/env node

/**
 * Simple script to test Groq API key
 * Usage: node scripts/test-api.js [API_KEY]
 */

const API_KEY = process.argv[2] || process.env.NEXT_PUBLIC_GROQ_API_KEY;

if (!API_KEY) {
  console.error('❌ No API key provided!');
  console.log('Usage: node scripts/test-api.js [API_KEY]');
  console.log('Or set NEXT_PUBLIC_GROQ_API_KEY environment variable');
  process.exit(1);
}

if (!API_KEY.startsWith('gsk_')) {
  console.error('❌ Invalid API key format!');
  console.log('Groq API keys should start with "gsk_"');
  process.exit(1);
}

console.log('🔑 Testing Groq API key...');
console.log(`Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);

async function testAPI() {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'user', content: 'Hello, this is a test message.' }
        ],
        max_tokens: 10,
      }),
    });

    if (response.status === 401) {
      console.error('❌ Invalid API key!');
      console.log('Please check your Groq API key.');
      process.exit(1);
    }

    if (response.status === 403) {
      console.error('❌ API key is valid but lacks permissions!');
      console.log('Please check your account permissions.');
      process.exit(1);
    }

    if (response.status === 429) {
      console.error('❌ Rate limit exceeded!');
      console.log('Please try again later.');
      process.exit(1);
    }

    if (!response.ok) {
      console.error(`❌ API request failed: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      console.log('✅ API key is valid and working!');
      console.log(`Response: "${data.choices[0].message.content.trim()}"`);
      console.log('🎉 You can now use the interview practice platform!');
    } else {
      console.error('❌ API responded but with unexpected format.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('Please check your internet connection.');
    process.exit(1);
  }
}

testAPI(); 