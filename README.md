# Text-to-Speech Reader Chrome Extension

A powerful Chrome extension that reads web page content aloud with movable floating controls and customizable voice settings.

## Features

- **Text-to-Speech Reading**: Automatically extracts and reads the main content from web pages
- **Movable Floating Controls**: Draggable control panel that stays on top of any webpage
- **Voice Customization**: Choose from available system voices with adjustable speed, pitch, and volume
- **Smart Content Extraction**: Intelligently identifies and reads main content while excluding navigation, ads, and other non-content elements
- **Progress Tracking**: Visual progress bar showing reading progress through the page
- **Navigation Controls**: Play, pause, stop, and navigate between text chunks
- **Session Management**: Easy activation/deactivation for browser sessions
- **Settings Persistence**: Your voice preferences are saved and restored automatically

## Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the folder containing this extension
5. The extension should now appear in your extensions list and be ready to use

### Method 2: Install from Chrome Web Store (When Available)

1. Visit the Chrome Web Store (link will be provided when published)
2. Click "Add to Chrome"
3. Confirm the installation when prompted

## Usage

### Basic Usage

1. **Navigate to any webpage** you want to read
2. **Click the extension icon** in your Chrome toolbar
3. **Configure your voice settings**:
   - Select your preferred voice from the dropdown
   - Adjust speed (0.5x to 2x)
   - Adjust pitch (0.5 to 2)
   - Adjust volume (0 to 1)
4. **Click "Start Reading"** to begin text-to-speech
5. **Use "Stop Reading"** to halt the reading

### Floating Controls

1. **Show Floating Controls**: Click the button in the popup to display movable controls on the webpage
2. **Move Controls**: Click and drag the header of the floating controls to reposition them
3. **Control Functions**:
   - ▶/⏸ Play/Pause reading
   - ⏹ Stop reading completely
   - ⏮ Go to previous text chunk
   - ⏭ Go to next text chunk
   - × Close floating controls

### Advanced Features

- **Smart Content Detection**: The extension automatically identifies the main content area of web pages
- **Chunked Reading**: Long content is split into manageable chunks for better control
- **Progress Tracking**: See your reading progress with a visual progress bar
- **Session Control**: Easily activate or deactivate the extension for your current browsing session

## File Structure

```
text-to-speech-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── content.js            # Content script for webpage interaction
├── content.css           # Floating controls styling
├── background.js         # Background service worker
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## Technical Details

### Permissions Used

- `activeTab`: Access to the currently active tab
- `storage`: Save and restore user settings
- `scripting`: Inject content scripts into web pages
- `host_permissions`: Access to all URLs for content reading

### Browser Compatibility

- Chrome 88+ (Manifest V3)
- Chromium-based browsers (Edge, Brave, etc.)

### Voice Support

The extension uses the Web Speech API's SpeechSynthesis interface, which provides access to the system's available voices. Voice availability depends on your operating system and browser.

## Troubleshooting

### Common Issues

1. **No voices available**: Ensure your system has text-to-speech voices installed
2. **Extension not working on some sites**: Some sites may block content scripts for security reasons
3. **Floating controls not appearing**: Check if the site has restrictive CSS that might hide the controls

### Debug Mode

To enable debug logging:
1. Open Chrome DevTools
2. Go to the Console tab
3. Look for messages from the extension

## Development

### Building from Source

1. Clone the repository
2. Make your changes
3. Load as unpacked extension in Chrome
4. Test your changes

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have feature requests, please open an issue on the GitHub repository.

## Changelog

### Version 1.0.0
- Initial release
- Basic text-to-speech functionality
- Movable floating controls
- Voice customization options
- Smart content extraction
- Progress tracking