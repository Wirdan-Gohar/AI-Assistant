Express Backend Integration - Walkthrough
✅ What Was Accomplished
Successfully integrated an Express backend server into your Vite React project, enabling you to run both frontend and backend from a single project with one command.

📁 Project Structure
vite-app/
├── server/
│   ├── index.js              # Express backend server
│   └── example-usage.js      # API usage examples
├── src/                      # Your React frontend
├── .env                      # Environment variables (GEMINI_API_KEY)
├── package.json              # Updated with backend dependencies
└── vite.config.js            # Configured with proxy settings
🔧 Changes Made
1. Backend Server - 
server/index.js
Created Express server with CORS enabled
Integrated Google Gemini AI (gemini-3-flash-preview model)
Added two endpoints:
POST /ask-ai - Send prompts to Gemini AI
GET /health - Health check endpoint
2. Package Dependencies - 
package.json
Added backend packages:

express - Web server framework
cors - Enable cross-origin requests
dotenv - Environment variable management
@google/generative-ai - Google Gemini AI SDK
concurrently - Run multiple npm scripts simultaneously
3. NPM Scripts - 
package.json
Updated scripts to run both servers:

"dev": "concurrently \"npm run server\" \"vite\"",
"server": "node server/index.js",
"client": "vite"
4. Vite Proxy Configuration - 
vite.config.js
Added proxy to forward API requests from frontend (port 5173) to backend (port 3001):

server: {
  proxy: {
    '/ask-ai': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
    '/health': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    }
  }
}
🚀 How to Run
Start Both Servers (Recommended)
npm run dev
This will start:

Backend on http://localhost:3001
Frontend on http://localhost:5173
Run Separately (Optional)
# Terminal 1 - Backend only
npm run server
# Terminal 2 - Frontend only
npm run client
💡 How to Use the API
From Your React Components
// Simple fetch example
const response = await fetch('/ask-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'What is React?' })
});
const data = await response.json();
console.log(data.answer);
See 
server/example-usage.js
 for complete React component examples.

🔑 Environment Variables
Your 
.env
 file already contains:

GEMINI_API_KEY="AIzaSyAQ2gyfu_7N9D4wuTTRaMZKh2Ksj_imtFM"
⚠️ Security Note: Never commit your 
.env
 file to version control. Make sure 
.env
 is in your 
.gitignore
.

✨ Key Benefits
Single Project - No need to run separate backend project
One Command - npm run dev starts everything
Proxy Setup - Frontend can call /ask-ai directly (no CORS issues)
Development Ready - Hot reload for both frontend and backend changes
🧪 Testing
Test the Health Endpoint
# From browser or curl
curl http://localhost:3001/health
# Response: {"status":"Server is running!"}
Test the AI Endpoint
curl -X POST http://localhost:3001/ask-ai \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello, who are you?"}'
Or from your React app:

fetch('/ask-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Hello, who are you?' })
})
📝 Next Steps
Run the project: npm run dev
Test the API: Use the examples in 
server/example-usage.js
Integrate into your app: Add AI features to your React components
Customize: Modify 
server/index.js
 to add more endpoints as needed
🎉 Summary
Your Vite project now has a fully integrated Express backend with Gemini AI support. Everything runs from a single project with one command!