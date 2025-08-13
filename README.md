# 🚗 Revolt Motors Voice Chatbot

A sophisticated voice chatbot for Revolt Motors using the Gemini Live API with Node.js/Express backend and modern web frontend.

## ✨ Features

- **🎤 Voice Interaction**: Real-time voice recording and AI response
- **🔄 Streaming Responses**: Low-latency streaming from Gemini Live API
- **⏹️ Interruption Handling**: Users can interrupt AI responses mid-stream
- **🌍 Multilingual Support**: Built-in support for multiple languages
- **📱 Responsive Design**: Modern, mobile-friendly interface
- **🔧 Model Switching**: Easy switching between different Gemini models
- **📊 Real-time Stats**: Conversation duration, message count, and status
- **⌨️ Keyboard Shortcuts**: Space to record, Escape to interrupt, Enter to start

## 🏗️ Architecture

```
Frontend (React-like) ←→ WebSocket ←→ Node.js/Express Server ←→ Gemini Live API
     ↓
Voice Recording ←→ Speech-to-Text ←→ AI Processing ←→ Text-to-Speech
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Google AI Studio API key for Gemini Live API
- Modern web browser with microphone access

### 1. Clone and Install

```bash
git clone <repository-url>
cd revolt-motors-voice-chatbot
npm install
```

### 2. Configure Environment

Copy the configuration template and add your API key:

```bash
cp config.env .env
```

Edit `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models
PORT=3000
NODE_ENV=development
```

### 3. Get Gemini Live API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

### 4. Run the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini Live API key | Required |
| `GEMINI_API_URL` | Gemini API base URL | `https://generativelanguage.googleapis.com/v1beta/models` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |

### Model Configuration

The chatbot supports multiple Gemini models:

- `gemini-1.5-flash-exp` (default) - Fastest, best for real-time
- `gemini-1.5-pro` - Balanced performance and quality
- `gemini-1.0-pro` - Legacy model for compatibility

Switch models via the sidebar or API endpoint:

```bash
curl -X POST http://localhost:3000/api/switch-model \
  -H "Content-Type: application/json" \
  -d '{"model": "gemini-1.5-pro"}'
```

## 📱 Usage

### Starting a Conversation

1. Click "Start Conversation" button
2. Wait for AI greeting
3. Click the microphone button to speak
4. Ask questions about Revolt Motors

### Voice Commands

- **Space Bar**: Start/stop recording (when conversation active)
- **Escape**: Interrupt AI response
- **Enter**: Start new conversation (when inactive)

### Interrupting the AI

- Click the "Interrupt" button
- Press Escape key
- Start speaking (auto-interrupts)

### Testing Features

- **Test Interruption**: Simulate interruption handling
- **Test Latency**: Measure response time
- **Model Switching**: Change AI models on-the-fly

## 🏗️ Project Structure

```
revolt-motors-voice-chatbot/
├── server.js                 # Main Express server
├── gemini-live-api.js       # Gemini API integration
├── config.env               # Environment configuration
├── package.json             # Dependencies and scripts
├── public/                  # Frontend assets
│   ├── index.html          # Main HTML page
│   ├── styles.css          # CSS styling
│   └── app.js              # Frontend JavaScript
└── README.md               # This file
```

## 🔌 API Endpoints

### Health & Status

- `GET /health` - Server health check
- `GET /api/status` - API configuration status
- `POST /api/switch-model` - Switch Gemini model

### WebSocket Events

- `start_conversation` - Begin new conversation
- `audio_input` - Send audio/transcript to AI
- `interrupt` - Interrupt current AI response
- `end_conversation` - End current conversation

## 🎯 Revolt Motors Integration

The chatbot is specifically configured for Revolt Motors with:

- **System Prompt**: Restricted to Revolt Motors topics only
- **Product Knowledge**: Electric vehicles, motorcycles, scooters
- **Service Information**: Warranty, service centers, support
- **Company Details**: History, mission, achievements

### Sample Questions

- "Tell me about Revolt Motors electric vehicles"
- "What is the range of your motorcycles?"
- "How many service centers do you have?"
- "What are the features of RV400?"
- "Tell me about your warranty policy"

## 🧪 Testing

### Manual Testing

1. **Connection Test**: Check server status and WebSocket connection
2. **Voice Recording**: Test microphone access and recording
3. **AI Response**: Verify Gemini API integration
4. **Interruption**: Test interruption handling
5. **Model Switching**: Verify model switching functionality

### Automated Testing

```bash
# Run health checks
curl http://localhost:3000/health

# Test API status
curl http://localhost:3000/api/status

# Test model switching
curl -X POST http://localhost:3000/api/switch-model \
  -H "Content-Type: application/json" \
  -d '{"model": "gemini-1.5-pro"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **API Key Error**
   - Verify `GEMINI_API_KEY` in `.env`
   - Check API key validity in Google AI Studio

2. **Microphone Access**
   - Ensure browser has microphone permissions
   - Check HTTPS requirement for production

3. **WebSocket Connection**
   - Verify server is running
   - Check firewall/network settings

4. **Model Switching Fails**
   - Verify model name is correct
   - Check API key permissions

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

### Logs

Check server logs for detailed error information:

```bash
npm run dev 2>&1 | tee server.log
```

## 🔒 Security Considerations

- **API Key Protection**: Never commit API keys to version control
- **CORS Configuration**: Restrict origins in production
- **Input Validation**: Validate all user inputs
- **Rate Limiting**: Implement rate limiting for production use

## 📈 Performance Optimization

- **Streaming Responses**: Real-time AI responses
- **Audio Compression**: Optimize audio quality vs. size
- **Connection Pooling**: Efficient WebSocket management
- **Caching**: Cache common responses

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   PORT=80
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

2. **Process Management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "revolt-chatbot"
   pm2 startup
   pm2 save
   ```

3. **Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google AI Studio for Gemini Live API
- Revolt Motors for the use case
- Socket.io for real-time communication
- Express.js for the backend framework

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for Revolt Motors using cutting-edge AI technology** 