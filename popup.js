document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const voiceSelect = document.getElementById('voice-select');
    const rateSlider = document.getElementById('rate-slider');
    const pitchSlider = document.getElementById('pitch-slider');
    const volumeSlider = document.getElementById('volume-slider');
    const rateValue = document.getElementById('rate-value');
    const pitchValue = document.getElementById('pitch-value');
    const volumeValue = document.getElementById('volume-value');
    const startReadingBtn = document.getElementById('start-reading');
    const stopReadingBtn = document.getElementById('stop-reading');
    const showFloatingControlsBtn = document.getElementById('show-floating-controls');
    const hideFloatingControlsBtn = document.getElementById('hide-floating-controls');
    const statusText = document.getElementById('status-text');

    let voices = [];
    let isReading = false;
    let floatingControlsVisible = false;

    // Load available voices
    function loadVoices() {
        return new Promise((resolve) => {
            if (speechSynthesis.getVoices().length > 0) {
                voices = speechSynthesis.getVoices();
                populateVoiceSelect();
                resolve();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    voices = speechSynthesis.getVoices();
                    populateVoiceSelect();
                    resolve();
                };
            }
        });
    }

    // Populate voice select dropdown
    function populateVoiceSelect() {
        voiceSelect.innerHTML = '';
        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }

    // Update display values for sliders
    function updateSliderValues() {
        rateValue.textContent = rateSlider.value;
        pitchValue.textContent = pitchSlider.value;
        volumeValue.textContent = volumeSlider.value;
    }

    // Save settings to storage
    function saveSettings() {
        const settings = {
            voiceIndex: voiceSelect.value,
            rate: rateSlider.value,
            pitch: pitchSlider.value,
            volume: volumeSlider.value
        };
        chrome.storage.local.set({ settings });
    }

    // Load settings from storage
    function loadSettings() {
        chrome.storage.local.get(['settings'], (result) => {
            if (result.settings) {
                const settings = result.settings;
                voiceSelect.value = settings.voiceIndex || 0;
                rateSlider.value = settings.rate || 1;
                pitchSlider.value = settings.pitch || 1;
                volumeSlider.value = settings.volume || 1;
                updateSliderValues();
            }
        });
    }

    // Send message to content script
    function sendMessageToContentScript(action, data = {}) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: action,
                    ...data
                });
            }
        });
    }

    // Start reading
    function startReading() {
        const settings = {
            voiceIndex: voiceSelect.value,
            rate: parseFloat(rateSlider.value),
            pitch: parseFloat(pitchSlider.value),
            volume: parseFloat(volumeSlider.value)
        };

        sendMessageToContentScript('startReading', { settings });
        isReading = true;
        updateButtonStates();
        statusText.textContent = 'Reading page content...';
    }

    // Stop reading
    function stopReading() {
        sendMessageToContentScript('stopReading');
        isReading = false;
        updateButtonStates();
        statusText.textContent = 'Reading stopped';
    }

    // Show floating controls
    function showFloatingControls() {
        sendMessageToContentScript('showFloatingControls');
        floatingControlsVisible = true;
        updateButtonStates();
        statusText.textContent = 'Floating controls shown';
    }

    // Hide floating controls
    function hideFloatingControls() {
        sendMessageToContentScript('hideFloatingControls');
        floatingControlsVisible = false;
        updateButtonStates();
        statusText.textContent = 'Floating controls hidden';
    }

    // Update button states
    function updateButtonStates() {
        startReadingBtn.disabled = isReading;
        stopReadingBtn.disabled = !isReading;
        showFloatingControlsBtn.disabled = floatingControlsVisible;
        hideFloatingControlsBtn.disabled = !floatingControlsVisible;
    }

    // Event listeners
    voiceSelect.addEventListener('change', saveSettings);
    rateSlider.addEventListener('input', () => {
        updateSliderValues();
        saveSettings();
    });
    pitchSlider.addEventListener('input', () => {
        updateSliderValues();
        saveSettings();
    });
    volumeSlider.addEventListener('input', () => {
        updateSliderValues();
        saveSettings();
    });

    startReadingBtn.addEventListener('click', startReading);
    stopReadingBtn.addEventListener('click', stopReading);
    showFloatingControlsBtn.addEventListener('click', showFloatingControls);
    hideFloatingControlsBtn.addEventListener('click', hideFloatingControls);

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'readingStatus') {
            isReading = message.isReading;
            updateButtonStates();
            statusText.textContent = message.status;
        }
    });

    // Initialize
    loadVoices().then(() => {
        loadSettings();
        updateSliderValues();
        updateButtonStates();
    });
}); 