const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const GeminiLiveAPI = require('./gemini-live-api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

// Initialize Gemini API
const geminiAPI = new GeminiLiveAPI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Track active conversations with topic information
const activeConversations = new Map();

// Helper function to detect topic from user message
function detectTopic(userMessage) {
  const message = userMessage.toLowerCase();
  const topicKeywords = {
    'rv400': 'RV400 features',
    'rv300': 'RV300 features',
    'price': 'pricing',
    'cost': 'pricing',
    'range': 'battery range',
    'battery': 'battery and charging',
    'charging': 'charging',
    'service': 'service and maintenance',
    'warranty': 'warranty',
    'test ride': 'test ride availability',
    'availability': 'availability',
    'dealer': 'dealer locations',
    'hi': 'greeting',
    'hello': 'greeting',
    'how are you': 'greeting'
  };

  for (const [keyword, topic] of Object.entries(topicKeywords)) {
    if (message.includes(keyword)) {
      return topic;
    }
  }

  return 'general inquiry';
}

// Helper function to generate small talk response
function generateSmallTalkResponse() {
  const responses = [
    "Hi! I'm Rev. Are you interested in RV400 features, price, or test ride availability?",
    "Hello! I'm here to help with Revolt Motors. What would you like to know about our electric motorcycles?",
    "Hey there! I'm Rev from Revolt Motors. Should we talk about RV400 specs, pricing, or something else?"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// WebSocket event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start_conversation', async () => {
    console.log('Starting conversation for client:', socket.id);

    try {
      const conversation = await geminiAPI.createConversation();

      // Initialize conversation with topic tracking
      activeConversations.set(socket.id, {
        conversationId: conversation.conversationId,
        lastTopic: 'greeting',
        messageCount: 0
      });

      // Send a natural, conversational welcome
      const welcomeMessage = generateSmallTalkResponse();
      socket.emit('conversation_started', {
        conversationId: conversation.conversationId,
        message: welcomeMessage
      });

    } catch (error) {
      console.error('Error starting conversation:', error);
      socket.emit('error', { message: 'Failed to start conversation. Please try again.' });
    }
  });

  socket.on('audio_input', async (data) => {
    console.log('Received audio input from client:', socket.id);

    try {
      const conversation = activeConversations.get(socket.id);
      if (!conversation) {
        socket.emit('error', { message: 'No active conversation found.' });
        return;
      }

      // For now, use a simulated message - in real implementation, this would be STT
      const userMessage = "Tell me about RV400 features";

      // Detect topic and update conversation
      const detectedTopic = detectTopic(userMessage);
      conversation.lastTopic = detectedTopic;
      conversation.messageCount++;

      // Handle small talk differently
      if (detectedTopic === 'greeting') {
        const response = generateSmallTalkResponse();
        socket.emit('ai_response_stream', {
          type: 'text',
          content: response,
          conversationId: conversation.conversationId
        });
        return;
      }

      // Send message to Gemini API for topic-specific responses
      const tone = conversation.tone || 'concise';
      await geminiAPI.sendMessage(userMessage, conversation.conversationId, (streamData) => {
        socket.emit('ai_response_stream', streamData);
      }, tone);

    } catch (error) {
      console.error('Error processing audio input:', error);
      socket.emit('error', { message: 'Error processing your voice input.' });
    }
  });

  socket.on('interrupt', async () => {
    console.log('Interruption received from client:', socket.id);

    try {
      const conversation = activeConversations.get(socket.id);
      if (!conversation) {
        socket.emit('error', { message: 'No active conversation found.' });
        return;
      }

      // Handle interruption with context
      const interruptionResponse = await geminiAPI.handleInterruption(conversation.conversationId);

      socket.emit('interruption_handled', {
        message: interruptionResponse,
        conversationId: conversation.conversationId
      });

    } catch (error) {
      console.error('Error handling interruption:', error);
      socket.emit('error', { message: 'Error handling interruption.' });
    }
  });

  socket.on('end_conversation', () => {
    try {
      console.log('Ending conversation for client:', socket.id);

      activeConversations.delete(socket.id);

      socket.emit('conversation_ended');

    } catch (error) {
      console.error('Error ending conversation:', error);
      socket.emit('error', { message: 'Error ending conversation.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Clean up conversation
    activeConversations.delete(socket.id);
  });

  socket.on('tone_preference', (data) => {
    console.log('Tone preference received:', data.tone);

    try {
      const conversation = activeConversations.get(socket.id);
      if (conversation) {
        conversation.tone = data.tone;
        console.log(`Tone preference updated for client ${socket.id}: ${data.tone}`);
      }
    } catch (error) {
      console.error('Error updating tone preference:', error);
    }
  });
});

// API Endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeConnections: io.engine.clientsCount,
    activeConversations: activeConversations.size
  });
});

app.get('/api/status', (req, res) => {
  const modelInfo = geminiAPI.getModelInfo();
  res.json({
    status: 'running',
    model: modelInfo.currentModel,
    availableModels: modelInfo.availableModels,
    activeConnections: io.engine.clientsCount,
    activeConversations: activeConversations.size,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/switch-model', (req, res) => {
  try {
    const { model } = req.body;
    const result = geminiAPI.setModel(model);

    if (result.success) {
      res.json({
        success: true,
        message: `Switched to model: ${result.model}`,
        currentModel: result.model
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error switching model:', error);
    res.status(500).json({
      success: false,
      message: 'Error switching model'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚗 Revolt Motors Voice Chatbot server running on port ${PORT}`);
  console.log(`📱 Frontend available at: http://localhost:${PORT}`);
  console.log(`🔧 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Gemini API configured with model: ${geminiAPI.getModelInfo().currentModel}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 