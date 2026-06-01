// VeriFeed Popup Script - Simplified Analysis + Working Chatbot
class VeriFeedPopup {
  constructor() {
    this.serverUrl = "http://localhost:5000";
    this.settings = {
      verifeedEnabled: true,
    };
    this.currentVideo = null;
    this.lastVerifiedVideoSrc = null;
    this.isAnalyzing = false;
    this.isCompactMode = false;
    this.healthCheckInterval = null;
    this.videoDetectionInterval = null;
    this.abortController = null;

    this.init();
  }

  async init() {
    console.log("[VeriFeed Popup] Initializing...");

    try {
      await this.loadSettings();
      this.setupEventListeners();
      this.setupChatbotListeners(); // NEW: Setup chatbot
      this.setupMessageListener();
      this.updateUI();
      await this.checkServerStatus();
      await this.detectVideo();

      this.healthCheckInterval = setInterval(() => this.checkServerStatus(), 10000);
      this.videoDetectionInterval = setInterval(() => this.detectVideo(), 2000);

      window.addEventListener("beforeunload", () => this.cleanup());
    } catch (error) {
      console.error("[VeriFeed Popup] Initialization error:", error);
      this.showInitializationError(error);
    }
  }

  cleanup() {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.videoDetectionInterval) clearInterval(this.videoDetectionInterval);
    if (this.abortController) this.abortController.abort();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(["verifeedEnabled", "serverUrl"]);
      this.settings = {
        verifeedEnabled: result.verifeedEnabled !== false,
      };
      this.serverUrl = result.serverUrl || "http://localhost:5000";
      console.log("[VeriFeed Popup] Settings loaded:", this.settings);
    } catch (error) {
      console.error("[VeriFeed Popup] Error loading settings:", error);
      throw new Error("Failed to load extension settings");
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set({
        ...this.settings,
        serverUrl: this.serverUrl,
      });
      console.log("[VeriFeed Popup] Settings saved");
      return true;
    } catch (error) {
      console.error("[VeriFeed Popup] Error saving settings:", error);
      return false;
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "videoChanged") {
        console.log("[VeriFeed Popup] Video changed:", request);
        this.handleVideoChange(request.hasVideo, request.videoInfo);
        sendResponse({ received: true });
        return true;
      }
    });
  }

  handleVideoChange(hasVideo, videoInfo) {
    const videoInfoEl = document.getElementById("videoInfo");
    const verifyBtn = document.getElementById("verifyBtn");
    const resultsSection = document.getElementById("resultsSection");

    const videoSrc = videoInfo?.src;
    const isDifferentVideo = videoSrc && videoSrc !== this.lastVerifiedVideoSrc;

    if (hasVideo) {
      if (videoInfoEl) {
        videoInfoEl.textContent = "✓ Video detected on page";
        videoInfoEl.className = "video-info video-found";
      }
      if (verifyBtn) {
        verifyBtn.disabled = !this.settings.verifeedEnabled || this.isAnalyzing;
      }
      this.currentVideo = videoInfo;

      if (isDifferentVideo && resultsSection) {
        resultsSection.classList.remove("show");
        this.resetResultsUI();
        console.log("[VeriFeed Popup] New video detected, cleared results");
      }
    } else {
      if (videoInfoEl) {
        videoInfoEl.textContent = "No video found on current page";
        videoInfoEl.className = "video-info no-video";
      }
      if (verifyBtn) {
        verifyBtn.disabled = true;
      }
      this.currentVideo = null;

      if (resultsSection) {
        resultsSection.classList.remove("show");
      }
    }
  }

  resetResultsUI() {
    const confidenceBar = document.getElementById("confidenceBar");
    const realBar = document.getElementById("realBar");
    const fakeBar = document.getElementById("fakeBar");
    const confidenceValue = document.getElementById("confidenceValue");
    const realProb = document.getElementById("realProb");
    const fakeProb = document.getElementById("fakeProb");

    if (confidenceBar) {
      confidenceBar.style.width = "0%";
      confidenceBar.classList.remove("animate");
    }
    if (realBar) {
      realBar.style.width = "0%";
      realBar.classList.remove("animate");
    }
    if (fakeBar) {
      fakeBar.style.width = "0%";
      fakeBar.classList.remove("animate");
    }

    if (confidenceValue) confidenceValue.textContent = "0%";
    if (realProb) realProb.textContent = "0%";
    if (fakeProb) fakeProb.textContent = "0%";

    // Hide chatbot section
    const nlpSection = document.getElementById("nlpSection");
    if (nlpSection) nlpSection.style.display = "none";
  }

  setupEventListeners() {
    const toggleEnabled = document.getElementById("toggleEnabled");
    if (toggleEnabled) {
      toggleEnabled.checked = this.settings.verifeedEnabled;
      toggleEnabled.addEventListener("change", async (e) => {
        this.settings.verifeedEnabled = e.target.checked;
        const saved = await this.saveSettings();
        if (saved) {
          this.updateUI();
          this.showToast(e.target.checked ? "VeriFeed enabled" : "VeriFeed disabled");
        }
      });
    }

    const verifyBtn = document.getElementById("verifyBtn");
    if (verifyBtn) {
      verifyBtn.addEventListener("click", () => this.verifyVideo());
    }

    const btnMinimize = document.getElementById("btnMinimize");
    if (btnMinimize) {
      btnMinimize.addEventListener("click", () => this.toggleCompactMode());
    }

    const btnRefresh = document.getElementById("btnRefresh");
    if (btnRefresh) {
      let refreshTimeout;
      btnRefresh.addEventListener("click", async () => {
        clearTimeout(refreshTimeout);
        btnRefresh.disabled = true;

        refreshTimeout = setTimeout(async () => {
          await this.refreshAll();
          btnRefresh.disabled = false;
        }, 300);
      });
    }

    const btnClose = document.getElementById("btnClose");
    if (btnClose) {
      btnClose.addEventListener("click", () => {
        this.cleanup();
        window.close();
      });
    }
  }

  // ============================================================================
  // CHATBOT SETUP
  // ============================================================================
  setupChatbotListeners() {
    const chatInput = document.getElementById("nlpChatInput");
    const chatSubmit = document.getElementById("nlpChatSubmit");
    const quickQuestions = document.querySelectorAll(".nlp-quick-question");

    // Submit button
    if (chatSubmit) {
      chatSubmit.addEventListener("click", () => this.handleChatSubmit());
    }

    // Enter key in input
    if (chatInput) {
      chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleChatSubmit();
        }
      });
    }

    // Quick question buttons
    quickQuestions.forEach((btn) => {
      btn.addEventListener("click", () => {
        const question = btn.getAttribute("data-question");
        if (question) {
          this.askQuestion(question);
        }
      });
    });

    console.log("[VeriFeed Popup] Chatbot listeners setup complete");
  }

  async handleChatSubmit() {
    const chatInput = document.getElementById("nlpChatInput");
    const question = chatInput?.value.trim();

    if (!question) return;

    // Clear input immediately
    chatInput.value = "";

    await this.askQuestion(question);
  }

  async askQuestion(question) {
    const messagesContainer = document.getElementById("nlpChatMessages");
    const chatSubmit = document.getElementById("nlpChatSubmit");

    if (!messagesContainer) return;

    // Remove empty state if present
    const emptyState = messagesContainer.querySelector(".nlp-empty-state");
    if (emptyState) {
      emptyState.remove();
    }

    // Add user message
    this.addChatMessage(question, "user");

    // Disable input during processing
    if (chatSubmit) chatSubmit.disabled = true;

    // Add typing indicator
    const typingId = this.addTypingIndicator();

    try {
      // Get response from NLP chatbot
      const response = await verifeedChatbot.processQuestion(question);

      // Remove typing indicator
      this.removeTypingIndicator(typingId);

      // Add bot response
      this.addChatMessage(response, "bot");
    } catch (error) {
      console.error("[VeriFeed Popup] Chat error:", error);
      this.removeTypingIndicator(typingId);
      this.addChatMessage("Sorry, I encountered an error processing your question. Please try again.", "bot");
    } finally {
      if (chatSubmit) chatSubmit.disabled = false;
    }
  }

  addChatMessage(text, role) {
    const messagesContainer = document.getElementById("nlpChatMessages");
    if (!messagesContainer) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = "nlp-chat-message";

    const contentDiv = document.createElement("div");
    contentDiv.className = role === "user" ? "nlp-user-message" : "nlp-bot-message";
    contentDiv.textContent = text;

    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addTypingIndicator() {
    const messagesContainer = document.getElementById("nlpChatMessages");
    if (!messagesContainer) return null;

    const typingId = `typing-${Date.now()}`;
    const messageDiv = document.createElement("div");
    messageDiv.className = "nlp-chat-message";
    messageDiv.id = typingId;

    const contentDiv = document.createElement("div");
    contentDiv.className = "nlp-bot-message";
    contentDiv.innerHTML = '<span style="opacity: 0.6;">Typing...</span>';

    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return typingId;
  }

  removeTypingIndicator(typingId) {
    if (!typingId) return;
    const indicator = document.getElementById(typingId);
    if (indicator) indicator.remove();
  }

  async refreshAll() {
    const btnRefresh = document.getElementById("btnRefresh");
    const resultsSection = document.getElementById("resultsSection");
    const videoInfo = document.getElementById("videoInfo");

    if (resultsSection) {
      resultsSection.classList.remove("show");
      this.resetResultsUI();
    }

    this.lastVerifiedVideoSrc = null;
    this.currentVideo = null;

    if (btnRefresh) {
      btnRefresh.innerHTML = "⟳";
      btnRefresh.style.animation = "spin 1s linear infinite";
    }

    if (videoInfo) {
      videoInfo.textContent = "Checking for videos...";
      videoInfo.className = "video-info no-video";
    }

    try {
      await this.checkServerStatus();

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab?.id) {
        try {
          const response = await this.sendMessageToTab(tab.id, {
            action: "refresh",
          });

          if (response && response.hasVideo !== undefined) {
            console.log("[VeriFeed Popup] Refresh response:", response);
            this.handleVideoChange(response.hasVideo, response.videoInfo);
          } else {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await this.detectVideo();
          }
        } catch (error) {
          console.log("[VeriFeed Popup] Error refreshing content script:", error);
          await this.detectVideo();
        }
      } else {
        await this.detectVideo();
      }
    } catch (error) {
      console.error("[VeriFeed Popup] Refresh error:", error);
      if (videoInfo) {
        videoInfo.textContent = "Error during refresh";
        videoInfo.className = "video-info no-video";
      }
    } finally {
      if (btnRefresh) {
        btnRefresh.innerHTML = "↻";
        btnRefresh.style.animation = "";
      }

      this.showToast("Detection refreshed");
    }
  }

  toggleCompactMode() {
    this.isCompactMode = !this.isCompactMode;
    document.body.classList.toggle("compact-mode", this.isCompactMode);
    console.log("[VeriFeed Popup] Compact mode:", this.isCompactMode);
  }

  updateUI() {
    const verifyBtn = document.getElementById("verifyBtn");
    const toggleEnabled = document.getElementById("toggleEnabled");

    if (verifyBtn) {
      verifyBtn.disabled = !this.settings.verifeedEnabled || !this.currentVideo || this.isAnalyzing;
    }

    if (toggleEnabled) {
      toggleEnabled.checked = this.settings.verifeedEnabled;
    }
  }

  async checkServerStatus() {
    const statusDot = document.getElementById("statusDot");
    const statusText = document.getElementById("statusText");
    const statusInfo = document.getElementById("statusInfo");

    if (!statusDot || !statusText || !statusInfo) return;

    try {
      statusText.textContent = "Checking...";
      statusDot.className = "status-dot";

      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();

      const startTime = Date.now();
      const response = await fetch(`${this.serverUrl}/health`, {
        method: "GET",
        signal: this.abortController.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const latency = Date.now() - startTime;
      const data = await response.json();

      if (response.ok && data.status === "healthy") {
        statusDot.className = "status-dot online";
        statusText.textContent = "Online";

        const modelStatus = data.model_loaded ? "✓ Loaded" : "✗ Not loaded";
        const deviceInfo = data.device || "Unknown";

        statusInfo.textContent = `Server ready • Model: ${modelStatus} • Device: ${deviceInfo} • Latency: ${latency}ms`;
        console.log("[VeriFeed Popup] Server healthy:", data);
      } else {
        throw new Error(`Server returned status: ${response.status}`);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("[VeriFeed Popup] Server check aborted");
        return;
      }

      console.error("[VeriFeed Popup] Server check failed:", error);

      if (statusDot && statusText && statusInfo) {
        statusDot.className = "status-dot offline";
        statusText.textContent = "Offline";

        let errorMsg = "Cannot connect to analysis server.";
        if (error.message.includes("timeout") || error.name === "TimeoutError") {
          errorMsg = "Connection timeout. Server may be offline.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMsg = "Server not reachable.";
        } else {
          errorMsg = `Server error: ${error.message}`;
        }

        statusInfo.textContent = errorMsg;
      }
    }
  }

  async detectVideo() {
    const videoInfo = document.getElementById("videoInfo");
    const verifyBtn = document.getElementById("verifyBtn");

    if (!videoInfo || !verifyBtn) return;

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id || !tab?.url) {
        videoInfo.textContent = "No active tab found";
        videoInfo.className = "video-info no-video";
        verifyBtn.disabled = true;
        return;
      }

      const isFacebookPage = tab.url.includes("facebook.com") || tab.url.includes("fb.com");

      if (!isFacebookPage) {
        videoInfo.textContent = "Navigate to Facebook to detect videos";
        videoInfo.className = "video-info no-video";
        verifyBtn.disabled = true;
        return;
      }

      const response = await this.sendMessageToTab(tab.id, {
        action: "checkVideo",
      });
      this.handleVideoChange(response.hasVideo, response.videoInfo);
    } catch (error) {
      console.error("[VeriFeed Popup] Video detection error:", error);
      videoInfo.textContent = "Error detecting video";
      videoInfo.className = "video-info no-video";
      verifyBtn.disabled = true;
    }
  }

  async sendMessageToTab(tabId, message) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          console.log("[VeriFeed Popup] Content script not ready:", chrome.runtime.lastError.message);
          resolve({ hasVideo: false });
        } else {
          resolve(response || { hasVideo: false });
        }
      });
    });
  }

  async verifyVideo() {
    if (this.isAnalyzing || !this.currentVideo) return;

    const verifyBtn = document.getElementById("verifyBtn");
    const verifyBtnText = document.getElementById("verifyBtnText");
    const resultsSection = document.getElementById("resultsSection");

    if (!verifyBtn || !verifyBtnText) return;

    this.isAnalyzing = true;
    verifyBtn.disabled = true;
    resultsSection?.classList.remove("show");

    verifyBtnText.textContent = "Extracting";
    verifyBtnText.className = "verifeed-status-text";

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        throw new Error("No active tab found");
      }

      const framesResponse = await this.sendMessageToTab(tab.id, {
        action: "extractFrames",
      });

      if (!framesResponse.success) {
        throw new Error(framesResponse.error || "Frame extraction failed");
      }

      if (!framesResponse.frames?.length) {
        throw new Error("No frames extracted from video");
      }

      console.log(`[VeriFeed Popup] Extracted ${framesResponse.frames.length} frames`);

      verifyBtnText.textContent = "Analyzing";
      const result = await this.analyzeFrames(framesResponse.frames);

      if (this.currentVideo?.src) {
        this.lastVerifiedVideoSrc = this.currentVideo.src;
      }

      this.displayResults(result);
    } catch (error) {
      console.error("[VeriFeed Popup] Verification error:", error);
      this.showError(error.message);
    } finally {
      this.isAnalyzing = false;
      verifyBtn.disabled = !this.settings.verifeedEnabled || !this.currentVideo;
      verifyBtnText.textContent = "Verify Video";
      verifyBtnText.className = "";
    }
  }

  async analyzeFrames(frames) {
    try {
      console.log(`[VeriFeed Popup] Analyzing ${frames.length} frames...`);

      if (typeof verifeedAuth === "undefined" || !verifeedAuth.predict) {
        throw new Error("Authentication module not loaded");
      }

      const result = await verifeedAuth.predict(frames);
      console.log("[VeriFeed Popup] Analysis complete:", result);

      return result;
    } catch (error) {
      console.error("[VeriFeed Popup] Analysis error:", error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  // ============================================================================
  // DISPLAY RESULTS USING NLG SYSTEM
  // ============================================================================
  displayResults(result) {
    // Store result for language switching
    this.currentResult = result;

    const resultsSection = document.getElementById('resultsSection');
    const resultIcon = document.getElementById('resultIcon');
    const resultStatus = document.getElementById('resultStatus');
    const confidenceValue = document.getElementById('confidenceValue');
    const confidenceBar = document.getElementById('confidenceBar');
    const realProb = document.getElementById('realProb');
    const fakeProb = document.getElementById('fakeProb');
    const realBar = document.getElementById('realBar');
    const fakeBar = document.getElementById('fakeBar');
    const resultDescription = document.getElementById('resultDescription');
    const framesProcessed = document.getElementById('framesProcessed');
    const processingTime = document.getElementById('processingTime');

    const isAuthentic = result.prediction === 'REAL';
    const confidence = result.confidence;
    
    // Set icon and status
    resultIcon.textContent = isAuthentic ? '✅' : '⚠️';
    resultStatus.textContent = isAuthentic ? 'Authentic Video' : 'Deepfake Detected';
    resultStatus.className = `result-status ${isAuthentic ? 'authentic' : 'fake'}`;

    // Set confidence
    confidenceValue.textContent = `${confidence}%`;
    confidenceBar.className = `confidence-bar ${isAuthentic ? 'authentic' : 'fake'}`;
    
    setTimeout(() => {
      confidenceBar.style.width = `${confidence}%`;
    }, 100);

    // Set probabilities
    realProb.textContent = `${result.real_probability}%`;
    fakeProb.textContent = `${result.fake_probability}%`;

    setTimeout(() => {
      realBar.classList.add('animate');
      fakeBar.classList.add('animate');
      realBar.style.width = `${result.real_probability}%`;
      fakeBar.style.width = `${result.fake_probability}%`;
    }, 100);

    // Use NLG system to generate interpretation
    this.renderInterpretation(result.prediction, result.confidence);

    // Set metadata
    framesProcessed.textContent = result.frames_processed || result.faces_analyzed || '20';
    processingTime.textContent = result.processing_time ? `${result.processing_time}s` : '--';

    // Show results
    resultsSection.classList.add('show');

    // Setup language dropdown listener
    this.setupLanguageDropdown();

    // Update NLP chatbot context
    if (typeof verifeedChatbot !== 'undefined') {
      verifeedChatbot.setAnalysisContext({
        prediction: result.prediction,
        confidence: result.confidence,
        real_probability: result.real_probability,
        fake_probability: result.fake_probability,
        faces_analyzed: result.faces_analyzed || 20,
        frames_processed: result.frames_processed || 20
      });
      console.log('[VeriFeed] NLP context updated with analysis results');

      const nlpSection = document.getElementById('nlpSection');
      if (nlpSection) {
        nlpSection.style.display = 'block';
      }
    }
  }

  renderInterpretation(prediction, confidence) {
    const resultDescription = document.getElementById('resultDescription');
    
    if (typeof deepfakeNLG === 'undefined') {
      console.error('[VeriFeed] NLG system not loaded');
      return;
    }

    // Generate interpretation using NLG
    const interpretation = deepfakeNLG.generateInterpretation(prediction, confidence);
    const isAuthentic = interpretation.isAuthentic;
    const currentLang = deepfakeNLG.getLanguage();
    
    // Determine risk color
    let riskColor;
    if (isAuthentic) {
      riskColor = confidence >= 70 ? '#10b981' : '#f59e0b';
    } else {
      riskColor = confidence >= 70 ? '#ef4444' : '#f59e0b';
    }

    const descriptionHTML = `
      <div style="position: relative; padding: 14px; background: ${isAuthentic ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border-radius: 8px; border-left: 4px solid ${riskColor};">
        <select id="languageSelect" style="position: absolute; top: 0; right: 0; padding: 4px 8px; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: white; font-size: 10px; font-family: inherit; cursor: pointer; outline: none;">
          <option value="en" ${currentLang === 'en' ? 'selected' : ''}>EN</option>
          <option value="fil" ${currentLang === 'fil' ? 'selected' : ''}>FIL</option>
        </select>
        <div style="font-size: 12px; line-height: 1.6; opacity: 0.95; margin-bottom: 8px;">
          ${interpretation.summaryText}
        </div>
        <div style="font-size: 11px; line-height: 1.5; opacity: 0.85; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
          ${interpretation.detailsText}
        </div>
      </div>
    `;

    resultDescription.innerHTML = descriptionHTML;
    
    // Re-attach event listener after rendering
    this.setupLanguageDropdown();
  }

  setupLanguageDropdown() {
    const languageSelect = document.getElementById('languageSelect');
    
    if (!languageSelect) return;
    
    // Remove existing listener if any
    if (this.languageChangeListener) {
      languageSelect.removeEventListener('change', this.languageChangeListener);
    }
    
    // Create new listener
    this.languageChangeListener = (e) => {
      const selectedLang = e.target.value;
      
      if (typeof deepfakeNLG !== 'undefined') {
        deepfakeNLG.setLanguage(selectedLang);
        
        // Re-render interpretation if we have a current result
        if (this.currentResult) {
          this.renderInterpretation(this.currentResult.prediction, this.currentResult.confidence);
        }
        
        console.log(`[VeriFeed] Language changed to: ${selectedLang}`);
      }
    };
    
    // Add listener
    languageSelect.addEventListener('change', this.languageChangeListener);
  }

  showError(message) {
    const resultsSection = document.getElementById("resultsSection");
    const resultIcon = document.getElementById("resultIcon");
    const resultStatus = document.getElementById("resultStatus");
    const resultDescription = document.getElementById("resultDescription");
    const confidenceSection = document.querySelector(".confidence-section");
    const probabilityGrid = document.querySelector(".probability-grid");
    const metadata = document.querySelector(".metadata");

    if (!resultsSection) return;

    resultsSection.classList.remove("result-authentic", "result-fake");
    resultsSection.classList.add("result-error");

    if (resultIcon) {
      resultIcon.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 24px;
        font-weight: bold;
        color: white;
        background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
      `;
      resultIcon.textContent = "⚠";
    }

    if (resultStatus) {
      resultStatus.textContent = "Analysis Failed";
      resultStatus.className = "result-status error";
      resultStatus.style.color = "#fbbf24";
    }

    if (resultDescription) {
      resultDescription.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="font-weight: 600; color: #fbbf24;">
            ⚠️ Unable to Complete Analysis
          </div>
          <div style="color: rgba(255, 255, 255, 0.9); line-height: 1.6;">
            ${this.formatErrorMessage(message)}
          </div>          
        </div>
      `;
    }

    [confidenceSection, probabilityGrid, metadata].forEach((el) => {
      if (el) el.style.display = "none";
    });

    resultsSection.classList.add("show");
  }

  formatErrorMessage(message) {
    if (message.includes("timeout") || message.includes("Timeout")) {
      return "The server took too long to respond. The analysis server may be overloaded or offline.";
    } else if (message.includes("Failed to fetch") || message.includes("Network")) {
      return "Cannot connect to the analysis server. Please ensure the backend is running on <code>localhost:5000</code>.";
    } else if (message.includes("No frames")) {
      return "Could not extract frames from the video. The video may be too short or not fully loaded.";
    } else if (message.includes("Video too short")) {
      return "The video is too short to analyze. Videos must be at least 3 seconds long.";
    } else if (message.includes("not ready")) {
      return "The video is not ready for analysis. Please wait for it to load completely.";
    } else {
      return message;
    }
  }

  showInitializationError(error) {
    console.error("[VeriFeed Popup] Initialization failed:", error);
  }

  showToast(message, duration = 2000) {
    console.log(`[VeriFeed Toast] ${message}`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("[VeriFeed Popup] DOM loaded, initializing...");
  try {
    window.verifeedPopup = new VeriFeedPopup();
  } catch (error) {
    console.error("[VeriFeed Popup] Failed to initialize:", error);
  }
});
