// Prevent multiple initializations
if (window.ttsReaderInitialized) {
    console.log('Text-to-Speech Reader already initialized');
} else {
    window.ttsReaderInitialized = true;

class TextToSpeechReader {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.utterance = null;
        this.isReading = false;
        this.floatingControls = null;
        this.currentText = '';
        this.textChunks = [];
        this.currentChunkIndex = 0;
        this.settings = {
            voiceIndex: 0,
            rate: 1,
            pitch: 1,
            volume: 1
        };
        
        this.init();
    }

    init() {
        this.setupMessageListener();
        this.createFloatingControls();
        this.loadSettings();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            try {
                switch (message.action) {
                    case 'startReading':
                        this.settings = { ...this.settings, ...message.settings };
                        this.startReading();
                        break;
                    case 'stopReading':
                        this.stopReading();
                        break;
                    case 'showFloatingControls':
                        this.showFloatingControls();
                        break;
                    case 'hideFloatingControls':
                        this.hideFloatingControls();
                        break;
                }
            } catch (error) {
                console.error('Error handling message in TTS Reader:', error);
            }
        });
    }

    loadSettings() {
        chrome.storage.local.get(['settings'], (result) => {
            if (result.settings) {
                this.settings = { ...this.settings, ...result.settings };
            }
        });
    }

    extractTextFromPage() {
        // Get the main content area, excluding navigation, ads, etc.
        const selectors = [
            'main',
            'article',
            '.content',
            '.main-content',
            '#content',
            '#main',
            '.post-content',
            '.entry-content'
        ];

        let contentElement = null;
        for (const selector of selectors) {
            contentElement = document.querySelector(selector);
            if (contentElement) break;
        }

        // If no specific content area found, use body but exclude common non-content elements
        if (!contentElement) {
            contentElement = document.body;
        }

        // Clone the element to avoid modifying the original DOM
        const clone = contentElement.cloneNode(true);
        
        // Remove unwanted elements
        const unwantedSelectors = [
            'nav', 'header', 'footer', '.nav', '.navigation',
            '.sidebar', '.advertisement', '.ads', '.ad',
            '.menu', '.footer', '.header', 'script', 'style',
            '.social-share', '.comments', '.related-posts'
        ];

        unwantedSelectors.forEach(selector => {
            const elements = clone.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });

        // Extract text content
        let text = clone.textContent || clone.innerText || '';
        
        // Clean up the text
        text = text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n+/g, ' ') // Replace multiple newlines with single space
            .trim();

        return text;
    }

    splitTextIntoChunks(text, maxChunkLength = 200) {
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const chunks = [];
        let currentChunk = '';

        sentences.forEach(sentence => {
            if ((currentChunk + sentence).length > maxChunkLength && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += (currentChunk ? '. ' : '') + sentence;
            }
        });

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    startReading() {
        if (this.isReading) {
            this.stopReading();
        }

        this.currentText = this.extractTextFromPage();
        if (!this.currentText) {
            this.notifyStatus('No readable content found on this page');
            return;
        }

        this.textChunks = this.splitTextIntoChunks(this.currentText);
        this.currentChunkIndex = 0;
        this.isReading = true;

        this.notifyStatus(`Reading page content (${this.textChunks.length} chunks)`);
        this.readNextChunk();
    }

    readNextChunk() {
        if (!this.isReading || this.currentChunkIndex >= this.textChunks.length) {
            this.stopReading();
            return;
        }

        const text = this.textChunks[this.currentChunkIndex];
        this.speakText(text);
    }

    speakText(text) {
        // Cancel any ongoing speech
        this.synthesis.cancel();

        // Create new utterance
        this.utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice
        const voices = this.synthesis.getVoices();
        if (voices.length > 0) {
            const voiceIndex = Math.min(this.settings.voiceIndex, voices.length - 1);
            this.utterance.voice = voices[voiceIndex];
        }

        // Set properties
        this.utterance.rate = this.settings.rate;
        this.utterance.pitch = this.settings.pitch;
        this.utterance.volume = this.settings.volume;

        // Event handlers
        this.utterance.onend = () => {
            this.currentChunkIndex++;
            this.readNextChunk();
        };

        this.utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.notifyStatus('Error occurred while reading');
            this.stopReading();
        };

        // Start speaking
        this.synthesis.speak(this.utterance);
        this.updateFloatingControls();
    }

    stopReading() {
        this.isReading = false;
        this.synthesis.cancel();
        this.currentChunkIndex = 0;
        this.textChunks = [];
        this.notifyStatus('Reading stopped');
        this.updateFloatingControls();
    }

    createFloatingControls() {
        this.floatingControls = document.createElement('div');
        this.floatingControls.id = 'tts-floating-controls';
        this.floatingControls.innerHTML = `
            <div class="tts-header">
                <span class="tts-title">Text-to-Speech</span>
                <button class="tts-close" title="Close">×</button>
            </div>
            <div class="tts-content">
                <div class="tts-progress">
                    <div class="tts-progress-bar">
                        <div class="tts-progress-fill"></div>
                    </div>
                    <span class="tts-progress-text">0 / 0</span>
                </div>
                <div class="tts-buttons">
                    <button class="tts-btn tts-play" title="Play/Pause">▶</button>
                    <button class="tts-btn tts-stop" title="Stop">⏹</button>
                    <button class="tts-btn tts-prev" title="Previous">⏮</button>
                    <button class="tts-btn tts-next" title="Next">⏭</button>
                </div>
            </div>
        `;

        // Add event listeners
        this.floatingControls.querySelector('.tts-close').addEventListener('click', () => {
            this.hideFloatingControls();
        });

        this.floatingControls.querySelector('.tts-play').addEventListener('click', () => {
            if (this.isReading) {
                this.stopReading();
            } else {
                this.startReading();
            }
        });

        this.floatingControls.querySelector('.tts-stop').addEventListener('click', () => {
            this.stopReading();
        });

        this.floatingControls.querySelector('.tts-prev').addEventListener('click', () => {
            this.goToPreviousChunk();
        });

        this.floatingControls.querySelector('.tts-next').addEventListener('click', () => {
            this.goToNextChunk();
        });

        // Make draggable
        this.makeDraggable(this.floatingControls);

        document.body.appendChild(this.floatingControls);
        this.hideFloatingControls();
    }

    makeDraggable(element) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        const dragStart = (e) => {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === element || element.contains(e.target)) {
                isDragging = true;
            }
        };

        const dragEnd = () => {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        };

        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;

                element.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        };

        element.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    }

    showFloatingControls() {
        this.floatingControls.style.display = 'block';
        this.updateFloatingControls();
    }

    hideFloatingControls() {
        this.floatingControls.style.display = 'none';
    }

    updateFloatingControls() {
        const playBtn = this.floatingControls.querySelector('.tts-play');
        const progressFill = this.floatingControls.querySelector('.tts-progress-fill');
        const progressText = this.floatingControls.querySelector('.tts-progress-text');

        // Update play button
        if (this.isReading) {
            playBtn.textContent = '⏸';
            playBtn.title = 'Pause';
        } else {
            playBtn.textContent = '▶';
            playBtn.title = 'Play';
        }

        // Update progress
        const totalChunks = this.textChunks.length;
        const currentChunk = this.currentChunkIndex + 1;
        const progress = totalChunks > 0 ? (currentChunk / totalChunks) * 100 : 0;

        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${currentChunk} / ${totalChunks}`;
    }

    goToPreviousChunk() {
        if (this.currentChunkIndex > 0) {
            this.currentChunkIndex--;
            this.synthesis.cancel();
            this.readNextChunk();
        }
    }

    goToNextChunk() {
        if (this.currentChunkIndex < this.textChunks.length - 1) {
            this.currentChunkIndex++;
            this.synthesis.cancel();
            this.readNextChunk();
        }
    }

    notifyStatus(status) {
        try {
            chrome.runtime.sendMessage({
                action: 'readingStatus',
                isReading: this.isReading,
                status: status
            });
        } catch (error) {
            console.error('Error sending status message:', error);
        }
    }
}

// Initialize the text-to-speech reader
try {
    const ttsReader = new TextToSpeechReader();
    console.log('Text-to-Speech Reader initialized successfully');
} catch (error) {
    console.error('Error initializing Text-to-Speech Reader:', error);
}
} 