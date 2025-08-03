# Installation Guide

## Quick Installation Steps

### Step 1: Download the Extension
1. Download or clone this repository to your computer
2. Extract the files if you downloaded a ZIP file

### Step 2: Open Chrome Extensions Page
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. Or go to Chrome Menu → More Tools → Extensions

### Step 3: Enable Developer Mode
1. Look for the "Developer mode" toggle in the top-right corner
2. Turn it ON (it will show a blue background when enabled)

### Step 4: Load the Extension
1. Click the "Load unpacked" button that appears
2. Navigate to the folder containing the extension files
3. Select the folder and click "Select Folder"

### Step 5: Verify Installation
1. You should see "Text-to-Speech Reader" appear in your extensions list
2. The extension icon should appear in your Chrome toolbar
3. If you don't see the icon, click the puzzle piece icon in the toolbar to find it

## Troubleshooting Installation

### Extension Not Appearing
- Make sure you selected the correct folder (the one containing `manifest.json`)
- Check that all files are present in the folder
- Try refreshing the extensions page

### Extension Shows Errors
- Check the console for error messages
- Ensure all required files are present:
  - `manifest.json`
  - `popup.html`
  - `popup.css`
  - `popup.js`
  - `content.js`
  - `content.css`
  - `background.js`

### Icons Missing
- The extension will work without custom icons
- Chrome will use a default icon if the icon files are missing
- To add icons, create PNG files named `icon16.png`, `icon48.png`, and `icon128.png` in the `icons` folder

## First Use

1. **Navigate to any webpage** you want to read
2. **Click the extension icon** in your Chrome toolbar
3. **Configure your voice settings** in the popup
4. **Click "Start Reading"** to begin

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "Text-to-Speech Reader" in the list
3. Click "Remove" to uninstall the extension

## Updating the Extension

1. Download the latest version
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Or remove and reinstall the extension

## System Requirements

- Google Chrome 88 or later
- Windows, macOS, or Linux
- Text-to-speech voices installed on your system

## Voice Installation

### Windows
1. Go to Settings → Time & Language → Speech
2. Add voices under "Speech pack"

### macOS
1. Go to System Preferences → Accessibility → Speech
2. Select and download voices

### Linux
- Install speech synthesis packages for your distribution
- Common packages: `espeak`, `festival`, or `pico2wave`

## Security Note

This extension requires permissions to:
- Read web page content (for text-to-speech)
- Access all websites (to work on any webpage)
- Store settings locally

These permissions are necessary for the extension to function properly. The extension does not collect or transmit any personal data. 