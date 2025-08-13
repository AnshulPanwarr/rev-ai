// Modern AI Assistant - Rev
class ModernAIAssistant {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.conversationActive = false;
    this.speechSynthesis = window.speechSynthesis;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.isRecording = false;
    this.currentUtterance = null;

    this.initializeElements();
    this.initializeSocket();
    this.bindEvents();
    this.initializeVoice();
  }

  initializeElements() {
    this.startBtn = document.getElementById('startBtn');
    this.recordBtn = document.getElementById('recordBtn');
    this.welcomeMessage = document.getElementById('welcomeMessage');
    this.conversationStatus = document.getElementById('conversationStatus');
    this.statusText = document.getElementById('statusText');
    this.toneToggle = document.getElementById('toneToggle');
    this.toneSelect = document.getElementById('toneSelect');
  }

  initializeVoice() {
    // Wait for voices to load
    if (this.speechSynthesis.getVoices().length > 0) {
      this.setupVoice();
    } else {
      this.speechSynthesis.addEventListener('voiceschanged', () => {
        this.setupVoice();
      });
    }
  }

  setupVoice() {
    const voices = this.speechSynthesis.getVoices();
    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

    // Try to find the best natural-sounding voice
    this.selectedVoice = this.findBestVoice(voices);
    console.log('Selected voice:', this.selectedVoice?.name);
  }

  findBestVoice(voices) {
    // Priority order for voice selection
    const voicePreferences = [
      // Premium voices (usually better quality)
      { pattern: /google/i, priority: 10 },
      { pattern: /microsoft/i, priority: 9 },
      { pattern: /samantha/i, priority: 8 },
      { pattern: /alex/i, priority: 7 },
      { pattern: /david/i, priority: 6 },
      // Indian/Asian voices
      { pattern: /en-in/i, priority: 5 },
      { pattern: /indian/i, priority: 4 },
      { pattern: /raj/i, priority: 4 },
      { pattern: /dev/i, priority: 4 },
      // General male voices
      { pattern: /male/i, priority: 3 },
      // Any English voice
      { pattern: /en-/i, priority: 2 }
    ];

    let bestVoice = null;
    let bestScore = -1;

    for (const voice of voices) {
      if (!voice.lang.startsWith('en')) continue;

      let score = 0;
      for (const pref of voicePreferences) {
        if (pref.pattern.test(voice.name) || pref.pattern.test(voice.lang)) {
          score = Math.max(score, pref.priority);
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestVoice = voice;
      }
    }

    // If no good voice found, try to find any voice with good quality
    if (!bestVoice || bestScore < 5) {
      bestVoice = voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('microsoft') ||
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('alex'))
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    return bestVoice;
  }

  initializeSocket() {
    this.socket = io();

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.updateStatus('Connected to server');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.updateStatus('Disconnected from server');
    });

    this.socket.on('conversation_started', (data) => {
      this.conversationActive = true;
      this.showConversationMode();
      this.updateStatus('Conversation started');

      // Speak the welcome message with enhanced voice
      this.speakWithEnhancedVoice(data.message);

      // Automatically start listening after a short delay for natural flow
      setTimeout(() => {
        this.startContinuousListening();
      }, 2000);
    });

    this.socket.on('ai_response_stream', (data) => {
      if (data.type === 'text') {
        this.updateStatus('Rev is speaking...');

        // Speak the text with enhanced voice
        this.speakWithEnhancedVoice(data.content);

        // Automatically start listening again after Rev finishes speaking
        this.speechSynthesis.addEventListener('end', () => {
          setTimeout(() => {
            this.startContinuousListening();
          }, 500); // Small pause for natural conversation flow
        }, { once: true });
      } else if (data.type === 'audio') {
        this.updateStatus('Playing audio response...');
        this.playAudioResponse(data.content);
      }
    });

    this.socket.on('interruption_handled', (data) => {
      this.updateStatus('Interruption handled');

      // Speak the interruption response if available
      if (data.message) {
        this.speakWithEnhancedVoice(data.message);
      }

      // Automatically start listening again after a short delay
      setTimeout(() => {
        if (this.conversationActive) {
          this.startContinuousListening();
        }
      }, 1000);
    });

    this.socket.on('conversation_ended', () => {
      this.conversationActive = false;
      this.showWelcomeMode();
      this.updateStatus('Conversation ended');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.updateStatus('Error: ' + error.message);
    });
  }

  bindEvents() {
    this.startBtn.addEventListener('click', () => this.startConversation());
    this.recordBtn.addEventListener('click', () => this.toggleRecording());

    // Tone toggle event
    this.toneSelect.addEventListener('change', (e) => {
      const selectedTone = e.target.value;
      this.updateTonePreference(selectedTone);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.conversationActive && !this.isRecording) {
        e.preventDefault();
        this.toggleRecording();
      }
    });
  }

  updateTonePreference(tone) {
    if (this.socket && this.isConnected) {
      this.socket.emit('tone_preference', { tone });
      this.updateStatus(`Response style set to: ${tone}`);
    }
  }

  async startConversation() {
    if (!this.isConnected) {
      this.updateStatus('Not connected to server');
      return;
    }

    this.startBtn.disabled = true;
    this.updateStatus('Starting conversation...');

    try {
      this.socket.emit('start_conversation');
    } catch (error) {
      console.error('Error starting conversation:', error);
      this.updateStatus('Error starting conversation');
      this.startBtn.disabled = false;
    }
  }

  showConversationMode() {
    this.welcomeMessage.style.display = 'none';
    this.conversationStatus.style.display = 'flex';
    this.startBtn.style.display = 'none';
    this.recordBtn.style.display = 'flex';
    this.toneToggle.style.display = 'block';
  }

  showWelcomeMode() {
    this.welcomeMessage.style.display = 'block';
    this.conversationStatus.style.display = 'none';
    this.startBtn.style.display = 'flex';
    this.recordBtn.style.display = 'none';
    this.toneToggle.style.display = 'none';
  }

  async toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  async startRecording() {
    if (!this.conversationActive) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.processAudioRecording();
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordBtn.classList.add('recording');
      this.recordBtn.innerHTML = `
        <div class="record-icon">
          <i class="fas fa-stop"></i>
        </div>
        <span>Stop Recording</span>
      `;
      this.updateStatus('Recording... Speak now');

    } catch (error) {
      console.error('Error starting recording:', error);
      this.updateStatus('Error accessing microphone');
    }
  }

  async stopRecording() {
    if (!this.isRecording) return;

    this.mediaRecorder.stop();
    this.stream.getTracks().forEach(track => track.stop());
    this.isRecording = false;
    this.recordBtn.classList.remove('recording');
    this.recordBtn.innerHTML = `
      <div class="record-icon">
        <i class="fas fa-microphone"></i>
      </div>
      <span>Tap to Speak</span>
    `;
    this.updateStatus('Processing audio...');
  }

  async processAudioRecording() {
    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      const audioData = await this.audioBlobToArrayBuffer(audioBlob);

      this.socket.emit('audio_input', {
        audioData: Array.from(new Uint8Array(audioData)),
        conversationId: 'current'
      });

      this.updateStatus('Sending audio...');
    } catch (error) {
      console.error('Error processing audio:', error);
      this.updateStatus('Error processing audio');
    }
  }

  audioBlobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  speakWithEnhancedVoice(text) {
    // Cancel any current speech
    if (this.currentUtterance) {
      this.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Enhanced voice settings for natural sound
    utterance.voice = this.selectedVoice;
    utterance.rate = 0.9; // Slightly faster for natural conversation
    utterance.pitch = 0.95; // Natural pitch
    utterance.volume = 1;

    // Add natural pauses and emphasis for better speech flow
    utterance.text = this.addNaturalPauses(text);

    // Add event listeners for better control
    this.currentUtterance = utterance;
    this.speechSynthesis.speak(utterance);

    utterance.onstart = () => {
      this.updateStatus('Rev is speaking...');
    };

    utterance.onend = () => {
      this.updateStatus('Ready to listen');
      this.currentUtterance = null;

      // Automatically start listening again for natural conversation flow
      if (this.conversationActive) {
        setTimeout(() => {
          this.startContinuousListening();
        }, 300); // Very short pause for natural flow
      }
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      this.updateStatus('Speech error');
      this.currentUtterance = null;
    };

    // Add pause and resume functionality
    utterance.onpause = () => {
      this.updateStatus('Speech paused');
    };

    utterance.onresume = () => {
      this.updateStatus('Rev is speaking...');
    };
  }

  addNaturalPauses(text) {
    // Enhanced natural pauses for better speech flow
    return text
      // Add pauses after punctuation for natural breathing
      .replace(/([.!?])\s+/g, '$1... ')
      .replace(/([,;:])\s+/g, '$1... ')
      // Add natural pauses for conjunctions and transitions
      .replace(/\s+and\s+/gi, '... and... ')
      .replace(/\s+but\s+/gi, '... but... ')
      .replace(/\s+so\s+/gi, '... so... ')
      .replace(/\s+or\s+/gi, '... or... ')
      .replace(/\s+then\s+/gi, '... then... ')
      .replace(/\s+now\s+/gi, '... now... ')
      // Add pauses for emphasis and thinking
      .replace(/\s+really\s+/gi, '... really... ')
      .replace(/\s+actually\s+/gi, '... actually... ')
      .replace(/\s+basically\s+/gi, '... basically... ')
      .replace(/\s+you\s+know\s+/gi, '... you know... ')
      .replace(/\s+i\s+mean\s+/gi, '... I mean... ')
      .replace(/\s+well\s+/gi, '... well... ')
      .replace(/\s+like\s+/gi, '... like... ')
      .replace(/\s+um\s+/gi, '... um... ')
      .replace(/\s+uh\s+/gi, '... uh... ')
      // Add pauses for natural conversation flow
      .replace(/\s+right\s+/gi, '... right... ')
      .replace(/\s+okay\s+/gi, '... okay... ')
      .replace(/\s+so\s+anyway\s+/gi, '... so anyway... ')
      // Clean up multiple pauses and spacing
      .replace(/\.{3,}/g, '...')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  playAudioResponse(audioData) {
    try {
      const audioBlob = new Blob([audioData], { type: 'audio/pcm' });
      const audioUrl = URL.createObjectURL(audioData);

      this.audioPlayer.src = audioUrl;
      this.audioPlayer.play();

      this.audioPlayer.onended = () => {
        this.updateStatus('Ready to listen');
        URL.revokeObjectURL(audioUrl);
      };

      this.audioPlayer.onerror = (error) => {
        console.error('Audio playback error:', error);
        this.updateStatus('Audio playback error');
      };
    } catch (error) {
      console.error('Error playing audio:', error);
      this.updateStatus('Error playing audio');
    }
  }

  interruptAI() {
    if (this.conversationActive) {
      this.speechSynthesis.cancel();
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
      this.currentUtterance = null;

      this.socket.emit('interrupt', { conversationId: 'current' });
      this.updateStatus('Interrupted - ready to listen');
    }
  }

  endConversation() {
    if (this.conversationActive) {
      this.socket.emit('end_conversation', { conversationId: 'current' });
      this.conversationActive = false;
      this.showWelcomeMode();
    }
  }

  updateStatus(message) {
    if (this.statusText) {
      this.statusText.textContent = message;
    }
    console.log('Status:', message);
  }

  async startContinuousListening() {
    if (!this.conversationActive || this.isRecording) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      this.isRecording = true;

      // Update UI to show we're listening
      this.recordBtn.classList.add('listening');
      this.recordBtn.innerHTML = `
        <div class="record-icon">
          <i class="fas fa-microphone-alt"></i>
        </div>
        <span>Listening...</span>
      `;
      this.updateStatus('Listening for your voice...');

      // Start recording in small chunks for real-time processing
      this.mediaRecorder.start(1000); // Process every second

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);

          // Process audio immediately when we have enough data
          if (this.audioChunks.length >= 2) { // After 2 seconds of audio
            this.processAudioChunk();
          }
        }
      };

      this.mediaRecorder.onstop = () => {
        this.stopContinuousListening();
      };

      // Auto-stop after 10 seconds if no speech detected
      this.listeningTimeout = setTimeout(() => {
        if (this.isRecording) {
          this.stopContinuousListening();
        }
      }, 10000);

    } catch (error) {
      console.error('Error starting continuous listening:', error);
      this.updateStatus('Error accessing microphone');
    }
  }

  async stopContinuousListening() {
    if (!this.isRecording) return;

    this.mediaRecorder.stop();
    this.stream.getTracks().forEach(track => track.stop());
    this.isRecording = false;

    if (this.listeningTimeout) {
      clearTimeout(this.listeningTimeout);
    }

    this.recordBtn.classList.remove('listening');
    this.recordBtn.innerHTML = `
      <div class="record-icon">
        <i class="fas fa-microphone"></i>
      </div>
      <span>Tap to Speak</span>
    `;
    this.updateStatus('Processing...');
  }

  async processAudioChunk() {
    if (this.audioChunks.length === 0) return;

    try {
      // Process the accumulated audio
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      const audioData = await this.audioBlobToArrayBuffer(audioBlob);

      // Clear the chunks for next processing
      this.audioChunks = [];

      // Send audio data to server
      this.socket.emit('audio_input', {
        audioData: Array.from(new Uint8Array(audioData)),
        conversationId: 'current'
      });

      this.updateStatus('Processing your voice...');

    } catch (error) {
      console.error('Error processing audio chunk:', error);
      this.updateStatus('Error processing audio');
    }
  }
}

// Initialize the assistant when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new ModernAIAssistant();
}); 