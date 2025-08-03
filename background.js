// Background service worker for Text-to-Speech Reader extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Set default settings on first install
        const defaultSettings = {
            voiceIndex: 0,
            rate: 1,
            pitch: 1,
            volume: 1
        };
        
        chrome.storage.local.set({ settings: defaultSettings }, () => {
            console.log('Text-to-Speech Reader extension installed with default settings');
        });
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Text-to-Speech Reader extension started');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'readingStatus':
            // Store reading status for popup to access
            chrome.storage.local.set({ 
                readingStatus: {
                    isReading: message.isReading,
                    status: message.status,
                    timestamp: Date.now()
                }
            });
            break;
            
        case 'getTabInfo':
            // Get information about the current tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    sendResponse({
                        url: tabs[0].url,
                        title: tabs[0].title,
                        id: tabs[0].id
                    });
                }
            });
            return true; // Keep message channel open for async response
            
        default:
            break;
    }
});

// Handle tab updates to ensure content script is injected
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        // Inject content script if not already present
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(() => {
            // Content script might already be injected, ignore error
        });
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will be handled by the popup, but we can add additional functionality here
    console.log('Extension icon clicked on tab:', tab.id);
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    // Clean up any resources associated with the closed tab
    console.log('Tab closed:', tabId);
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.settings) {
        console.log('Settings updated:', changes.settings.newValue);
    }
});

// Note: Keyboard shortcuts can be added later by including "commands" permission
// and defining commands in manifest.json if needed 