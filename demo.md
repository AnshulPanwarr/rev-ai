# 🎬 Revolt Motors Voice Chatbot Demo Guide

This guide will help you create a compelling demo of the voice chatbot for your assessment.

## 🎯 Demo Objectives

1. **Show Natural Conversation Flow** - Demonstrate greetings and follow-ups
2. **Test Multilingual Capability** - Try questions in different languages
3. **Demonstrate Interruption Handling** - Show how users can interrupt AI
4. **Measure Response Latency** - Time the system's response speed
5. **Verify Topic Restriction** - Ensure AI only talks about Revolt Motors

## 🚀 Demo Setup

### 1. Pre-Demo Checklist

- [ ] Server running on `http://localhost:3000`
- [ ] Gemini API key configured
- [ ] Microphone permissions granted
- [ ] Browser console open for monitoring
- [ ] Recording software ready (if needed)

### 2. Demo Environment

```bash
# Start the server
npm run dev

# Check health status
curl http://localhost:3000/health

# Verify API configuration
curl http://localhost:3000/api/status
```

## 🎭 Demo Script

### Scene 1: Introduction & Setup (30 seconds)

**Narrator**: "Welcome to the Revolt Motors Voice Chatbot demo. I'll show you how this AI-powered assistant helps customers learn about our electric vehicles."

**Actions**:
1. Open `http://localhost:3000`
2. Show the beautiful interface
3. Point out the Revolt Motors branding
4. Click "Start Conversation"

**Expected Result**: AI greets with "Hello! I am Rev, your Revolt Motors assistant. How can I help you today?"

### Scene 2: Basic Question & Response (45 seconds)

**Narrator**: "Let me ask a basic question about our company."

**Actions**:
1. Click microphone button
2. Ask: "Tell me about Revolt Motors electric vehicles"
3. Wait for AI response
4. Show transcript area

**Expected Result**: AI provides detailed information about Revolt Motors EVs

### Scene 3: Interruption Demonstration (30 seconds)

**Narrator**: "Now watch how users can interrupt the AI mid-response."

**Actions**:
1. Start a new question
2. While AI is responding, click "Interrupt" button
3. Show interruption handling

**Expected Result**: AI stops and acknowledges interruption

### Scene 4: Multilingual Test (30 seconds)

**Narrator**: "The chatbot supports multiple languages. Let me test Hindi."

**Actions**:
1. Ask question in Hindi: "Revolt Motors ke electric vehicles ke bare mein bataiye"
2. Show AI response

**Expected Result**: AI responds appropriately in the language used

### Scene 5: Topic Restriction Test (30 seconds)

**Narrator**: "The AI is restricted to only Revolt Motors topics. Let me test this."

**Actions**:
1. Ask off-topic question: "What's the weather like today?"
2. Show AI politely refusing

**Expected Result**: AI says it can only help with Revolt Motors topics

### Scene 6: Model Switching (20 seconds)

**Narrator**: "We can switch between different AI models for testing."

**Actions**:
1. Show sidebar model selector
2. Switch to different model
3. Show confirmation

**Expected Result**: Model switches successfully

### Scene 7: Performance Metrics (15 seconds)

**Narrator**: "The system provides real-time performance metrics."

**Actions**:
1. Point out conversation duration
2. Show message count
3. Highlight connection status

**Expected Result**: All metrics visible and updating

## 📊 Demo Metrics to Record

### Response Latency
- **Target**: < 2 seconds
- **Measurement**: Time from question to first AI response
- **Tool**: Browser console or stopwatch

### Interruption Response
- **Target**: < 500ms
- **Measurement**: Time from interrupt to AI acknowledgment
- **Tool**: Browser console or stopwatch

### Conversation Flow
- **Target**: Natural, contextual responses
- **Measurement**: Quality of follow-up questions
- **Tool**: Subjective assessment

## 🎬 Recording Tips

### Video Recording
1. **Screen Recording**: Use OBS Studio or similar
2. **Audio Quality**: Ensure clear microphone audio
3. **Resolution**: 1080p minimum
4. **Duration**: Keep under 3 minutes

### Audio Recording
1. **Clear Speech**: Speak slowly and clearly
2. **Background Noise**: Minimize distractions
3. **Volume Levels**: Balance voice and system audio

### Browser Console
1. **Open DevTools**: F12 or right-click → Inspect
2. **Console Tab**: Monitor WebSocket events
3. **Network Tab**: Watch API calls

## 🧪 Testing Scenarios

### 1. Connection Testing
```javascript
// In browser console
fetch('/health').then(r => r.json()).then(console.log)
```

### 2. WebSocket Testing
```javascript
// Check connection status
console.log('Socket connected:', socket.connected)
```

### 3. API Testing
```javascript
// Test model switching
fetch('/api/switch-model', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({model: 'gemini-1.5-pro'})
})
```

## 🚨 Demo Troubleshooting

### Common Issues

1. **Microphone Not Working**
   - Check browser permissions
   - Try refreshing page
   - Check HTTPS requirement

2. **AI Not Responding**
   - Verify API key in config
   - Check server logs
   - Test API endpoint

3. **Interruption Not Working**
   - Ensure conversation is active
   - Check WebSocket connection
   - Verify server-side handling

### Fallback Demo

If live demo fails:
1. Show pre-recorded video
2. Walk through code structure
3. Demonstrate API endpoints
4. Show configuration files

## 📝 Demo Checklist

- [ ] Server starts successfully
- [ ] Frontend loads without errors
- [ ] WebSocket connection established
- [ ] Conversation starts properly
- [ ] Voice recording works
- [ ] AI responds appropriately
- [ ] Interruption handling works
- [ ] Multilingual support tested
- [ ] Topic restriction verified
- [ ] Model switching functional
- [ ] Performance metrics visible
- [ ] Error handling demonstrated

## 🎯 Key Talking Points

1. **Technology Stack**: Node.js, Express, Socket.io, Gemini Live API
2. **Real-time Features**: WebSocket streaming, low latency
3. **User Experience**: Intuitive interface, keyboard shortcuts
4. **Business Value**: Customer support, product information
5. **Scalability**: Easy model switching, API integration
6. **Security**: Topic restriction, input validation

## 📈 Success Metrics

- **Demo Duration**: 2-3 minutes
- **Feature Coverage**: All 6 core features demonstrated
- **Technical Depth**: Architecture and implementation details
- **Business Value**: Clear use case and benefits
- **Professional Quality**: Smooth delivery, clear communication

---

**Remember**: Practice the demo multiple times before recording. Focus on smooth transitions and clear explanations of each feature's value to Revolt Motors customers. 