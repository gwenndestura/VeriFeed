// ============================================================================
// VeriFeed NLP Chatbot - API Client Version
// Connects to Python backend with your trained 100% accuracy model
// ============================================================================

class VeriFeedChatbot {
  constructor() {
  this.apiUrl = 'http://localhost:5000';
  this.isReady = false;
  this.analysisContext = null;
  this.conversationHistory = [];

  console.log('[VeriFeed NLP] Initializing chatbot with API backend...');
  
  // Wait a bit for verifeedAuth to load, then check health
  setTimeout(() => {
    this.checkHealth();
  }, 500);
}

  /**
   * Check if API is healthy
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.isReady = data.model_loaded;
        console.log('[VeriFeed NLP] ✅ API connected and model loaded!');
      } else {
        console.warn('[VeriFeed NLP] ⚠️ API not responding');
        this.isReady = false;
      }
    } catch (error) {
      console.error('[VeriFeed NLP] ❌ Failed to connect to API:', error);
      console.error('[VeriFeed NLP] Make sure to run: python flask_chatbot_api.py');
      this.isReady = false;
    }
  }

  /**
   * Set analysis context
   */
  setAnalysisContext(context) {
    this.analysisContext = context;
    this.conversationHistory = [];
    console.log('[VeriFeed NLP] Analysis context updated');
  }

  /**
   * Process user question and get AI response
   */
  async processQuestion(userQuestion) {
  console.log('[VeriFeed NLP] Processing question:', userQuestion);
  
  // Validate question input
  if (!userQuestion || typeof userQuestion !== 'string' || userQuestion.trim() === '') {
    throw new Error('Invalid question: question cannot be empty');
  }

  // Check if analysis context exists
  if (!this.analysisContext) {
    return "Please analyze a video first before asking questions.";
  }

  try {
    // *** CRITICAL FIX: Get authentication headers from verifeedAuth ***
    let headers;
    if (typeof verifeedAuth !== 'undefined') {
      headers = await verifeedAuth.getAuthHeaders();
      console.log('[VeriFeed NLP] Using authenticated headers');
    } else {
      console.error('[VeriFeed NLP] verifeedAuth not available!');
      headers = {
        'Content-Type': 'application/json'
      };
    }

    const requestBody = {
      question: userQuestion.trim(),
      context: this.analysisContext
    };

    // Debug: Check what we're sending
    console.log('[VeriFeed NLP] Request context:', this.analysisContext);

    const response = await fetch(`${this.apiUrl}/api/nlp/question`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    console.log('[VeriFeed NLP] Response status:', response.status);

    // Handle 401 (unauthorized) - try to refresh token
    if (response.status === 401) {
      console.log('[VeriFeed NLP] Token invalid, regenerating...');
      
      if (typeof verifeedAuth !== 'undefined') {
        await verifeedAuth.clearToken();
        const newHeaders = await verifeedAuth.getAuthHeaders();
        
        // Retry with new token
        const retryResponse = await fetch(`${this.apiUrl}/api/nlp/question`, {
          method: 'POST',
          headers: newHeaders,
          body: JSON.stringify(requestBody)
        });
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Server error: ${retryResponse.status}`);
        }
        
        const data = await retryResponse.json();
        console.log('[VeriFeed NLP] Response data:', data);
        return data.answer || data.response || 'No response received from server';
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[VeriFeed NLP] Response data:', data);

    // Return the answer from the response
    return data.answer || data.response || 'No response received from server';

  } catch (error) {
    console.error('[VeriFeed NLP] Error processing question:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Is the backend running on localhost:5000?');
    } else if (error.message.includes('Missing question field')) {
      throw new Error('Server configuration error: question field missing');
    } else {
      throw error;
    }
  }
}

  /**
   * Get intent only (without full response generation)
   */
  async predictIntent(question) {
    try {
      const response = await fetch(`${this.apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          intent: data.intent,
          confidence: data.confidence,
          topIntents: data.top_intents,
          entities: data.entities
        };
      } else {
        throw new Error(data.error || 'Unknown error');
      }

    } catch (error) {
      console.error('[VeriFeed NLP] Error predicting intent:', error);
      return null;
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    console.log('[VeriFeed NLP] Conversation history cleared');
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Get last N messages
   */
  getLastMessages(n = 5) {
    return this.conversationHistory.slice(-n);
  }

  /**
   * Export conversation
   */
  exportConversation() {
    const messages = this.conversationHistory.map(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      const role = msg.role === 'user' ? 'You' : 'VeriFeed';
      return `[${time}] ${role}: ${msg.content}`;
    }).join('\n\n');

    return messages;
  }

  /**
   * Get statistics
   */
  getStats() {
    const userMessages = this.conversationHistory.filter(m => m.role === 'user').length;
    const assistantMessages = this.conversationHistory.filter(m => m.role === 'assistant').length;
    const intents = this.conversationHistory
      .filter(m => m.role === 'assistant' && m.intent)
      .map(m => m.intent);

    return {
      totalMessages: this.conversationHistory.length,
      userMessages,
      assistantMessages,
      intents,
      isReady: this.isReady,
      hasContext: !!this.analysisContext
    };
  }
}

// ============================================================================
// USAGE IN YOUR EXTENSION
// ============================================================================

// Create global instance
const verifeedChatbot = new VeriFeedChatbot();

// Example: When video analysis completes
function onVideoAnalysisComplete(result) {
  // Set context for chatbot
  verifeedChatbot.setAnalysisContext({
    prediction: result.prediction,  // 'REAL' or 'FAKE'
    confidence: result.confidence,  // 0-100
    features: {
      temporal_consistency: result.temporal_consistency,
      facial_artifacts: result.facial_artifacts,
      texture_anomalies: result.texture_anomalies,
      lighting_consistency: result.lighting_consistency,
      motion_patterns: result.motion_patterns
    }
  });
  
  console.log('[VeriFeed] Chatbot ready for questions!');
}

// Example: When user asks a question
async function handleUserQuestion(question) {
  console.log('[VeriFeed] User asked:', question);
  
  // Show loading state in your UI
  showLoadingIndicator();
  
  try {
    // Get response from chatbot
    const response = await verifeedChatbot.processQuestion(question);
    
    // Display response in your UI
    displayChatbotResponse(response);
    
    console.log('[VeriFeed] Response:', response);
  } catch (error) {
    console.error('[VeriFeed] Error:', error);
    displayError('Failed to get response from chatbot');
  } finally {
    hideLoadingIndicator();
  }
}

// Example: Check if chatbot is ready
function isChatbotReady() {
  const stats = verifeedChatbot.getStats();
  return stats.isReady && stats.hasContext;
}

// ============================================================================
// HELPER FUNCTIONS (implement these in your UI code)
// ============================================================================

function showLoadingIndicator() {
  // Show "Thinking..." in your chat UI
  console.log('[UI] Showing loading...');
}

function hideLoadingIndicator() {
  // Hide loading indicator
  console.log('[UI] Hiding loading...');
}

function displayChatbotResponse(response) {
  // Add response to chat UI
  console.log('[UI] Displaying response:', response);
}

function displayError(message) {
  // Show error in UI
  console.error('[UI] Error:', message);
}

// ============================================================================
// INTEGRATION WITH YOUR POPUP.JS
// ============================================================================

// In your popup.js, you can use it like this:

/*
// When video analysis completes:
chrome.runtime.sendMessage({
  action: 'analysisComplete',
  result: analysisResult
}, (response) => {
  // Set chatbot context
  verifeedChatbot.setAnalysisContext({
    prediction: analysisResult.prediction,
    confidence: analysisResult.confidence,
    features: analysisResult.features
  });
});

// When user submits a question:
document.getElementById('chatInput').addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    const question = e.target.value.trim();
    if (question) {
      // Clear input
      e.target.value = '';
      
      // Add user message to UI
      addMessageToChat('user', question);
      
      // Get chatbot response
      const response = await verifeedChatbot.processQuestion(question);
      
      // Add bot response to UI
      addMessageToChat('bot', response);
    }
  }
});

function addMessageToChat(role, message) {
  const chatContainer = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  messageDiv.textContent = message;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
*/

console.log('[VeriFeed NLP] Chatbot module loaded - API client version');
console.log('[VeriFeed NLP] Backend must be running: python flask_chatbot_api.py');