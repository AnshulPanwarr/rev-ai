const axios = require('axios');

class GeminiLiveAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = 'gemini-1.5-flash'; // Use stable model for better availability
    this.conversationId = null;
  }

  async createConversation() {
    try {
      console.log('Creating conversation with Gemini API...');

      // Test the API connection first
      const testResponse = await axios.post(
        `${this.baseUrl}/${this.model}:generateContent`,
        {
          contents: [{
            role: 'user',
            parts: [{
              text: 'Hello, start a conversation about Revolt Motors'
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          }
        }
      );

      this.conversationId = Date.now().toString();
      console.log('✅ Conversation created successfully');

      return {
        conversationId: this.conversationId,
        success: true
      };
    } catch (error) {
      console.error('Error creating conversation:', error.response?.data || error.message);
      throw new Error('Failed to create conversation');
    }
  }

  async sendMessage(message, conversationId, onStream, tone = 'concise') {
    try {
      // Detect language (basic Devanagari detection)
      const isHindi = /[\u0900-\u097F]/.test(message);
      const languageHint = isHindi ? 'Respond in Hindi if the user\'s message is in Hindi, otherwise English.' : 'Respond in English.';

      // Adjust response style based on tone preference
      const toneInstructions = tone === 'detailed'
        ? 'Provide comprehensive but focused information. Include 2-3 key points and a relevant follow-up question.'
        : 'Keep responses very concise (1-2 sentences max). Focus on the most essential information only.';

      const maxTokens = tone === 'detailed' ? 200 : 120;

      const systemPrompt = `You are Rev, Revolt Motors' assistant. Be warm, humble, and conversational. Use short, friendly sentences and everyday words. When it helps, ask a brief follow-up to clarify needs. ${languageHint} Stay strictly on Revolt Motors vehicles, features, pricing, service, availability, warranty, and company info; if asked anything else, politely say you can only help with Revolt Motors topics and suggest a relevant alternative. If interrupted, quickly summarize where you stopped and ask how to continue.

Tone: friendly, concise, humble.
Role: Revolt Motors-only.
Follow-ups: 1 short question max when needed.
Prioritize the 1-2 most helpful facts first. Avoid long lists. Offer a relevant next step.
Response Style: ${toneInstructions}

System:
Tone: friendly, concise, humble.
Role: Revolt Motors-only.
Follow-ups: 1 short question max when needed.

User:
${message}`;

      const response = await axios.post(
        `${this.baseUrl}/${this.model}:streamGenerateContent?alt=sse`,
        {
          contents: [{
            role: 'user',
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7, // Balanced creativity and consistency
            topK: 40,
            topP: 0.9,
            maxOutputTokens: maxTokens // Adjust based on tone preference
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          responseType: 'stream'
        }
      );

      let buffer = '';
      let isFirstChunk = true;

      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts && parsed.candidates[0].content.parts[0]) {
                const text = parsed.candidates[0].content.parts[0].text;
                if (text) {
                  onStream({
                    type: 'text',
                    content: text,
                    conversationId: conversationId
                  });
                }
              }
            } catch (e) {
              // Continue processing
            }
          }
        }
      });

      return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve());
        response.data.on('error', (error) => reject(error));
      });

    } catch (error) {
      console.error('Error calling Gemini API:', error.response?.data || error.message);
      throw new Error('Failed to get response from AI');
    }
  }

  async handleInterruption(conversationId) {
    try {
      // Get the last topic from conversation context
      const lastTopic = this.getLastTopic(conversationId);

      const interruptionPrompt = `You were interrupted while talking about ${lastTopic || 'Revolt Motors'}. Quickly summarize where you stopped and ask how to continue. Keep it to 1-2 sentences max.`;

      const response = await axios.post(
        `${this.baseUrl}/${this.model}:generateContent`,
        {
          contents: [{
            role: 'user',
            parts: [{ text: interruptionPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 80 // Very brief interruption response
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          }
        }
      );

      if (response.data.candidates && response.data.candidates[0]) {
        return response.data.candidates[0].content.parts[0].text;
      }

      return `No problem—do you want me to continue about ${lastTopic || 'Revolt Motors'} or focus on something else?`;
    } catch (error) {
      console.error('Error handling interruption:', error);
      return 'Got it—what would you like to know about Revolt Motors?';
    }
  }

  getLastTopic(conversationId) {
    // Simple topic detection based on common keywords
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
      'dealer': 'dealer locations'
    };

    // For now, return a default topic - in a real implementation,
    // you'd track conversation history and extract the last topic
    return 'Revolt Motors vehicles';
  }

  setModel(modelName) {
    const availableModels = [
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];

    if (availableModels.includes(modelName)) {
      this.model = modelName;
      console.log(`Switched to model: ${this.model}`);
      return { success: true, model: this.model };
    } else {
      console.warn(`Invalid model: ${modelName}. Available models: ${availableModels.join(', ')}`);
      return { success: false, error: 'Invalid model' };
    }
  }

  getModelInfo() {
    return {
      currentModel: this.model,
      availableModels: [
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
      ]
    };
  }
}

module.exports = GeminiLiveAPI; 