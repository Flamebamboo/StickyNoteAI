# StickyNoteAI - Installation and Testing Guide

## Current Issues Fixed ✅

1. **Missing WXT wrapper** - Added proper `defineContentScript` structure
2. **Chrome API conflicts** - Replaced all `chrome.*` with `browser.*` for WXT compatibility
3. **Proper initialization** - Content script now properly structured

## Installation Steps

### 1. Build the Extension

```bash
cd /Users/arushbasliyal/StickyNoteAI
npm run build
```

### 2. Load in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select the folder: `.output/chrome-mv3/`

### 3. Test the Extension

1. **Visit any webpage** (e.g., google.com, github.com)
2. **Look for the floating 📝 widget** in the top-right corner
3. **Click the + button** to create a note
4. **Try keyboard shortcuts**:
   - `Ctrl+Shift+H` - Hide/show widget
   - `Ctrl+Shift+N` - Create new note

## Debugging Steps

### If the widget doesn't appear:

1. **Check Console Errors**:

   - Press F12 → Console tab
   - Look for "StickyNoteAI: Initializing..." message
   - Check for any red error messages

2. **Check Extension Console**:

   - Go to `chrome://extensions/`
   - Find "StickyNoteAI"
   - Click "Details" → "Inspect views: background page"
   - Check for errors in the background script console

3. **Verify Extension is Active**:
   - Look for the extension icon in Chrome toolbar
   - Click it to open the popup interface

### Common Issues and Solutions:

**Issue**: Widget not showing

- **Solution**: Check if content script is loading on the page
- **Debug**: Open DevTools → Console → Look for initialization message

**Issue**: Notes not saving

- **Solution**: Check storage permissions in manifest
- **Debug**: Background script console for storage errors

**Issue**: Keyboard shortcuts not working

- **Solution**: Verify shortcuts are registered in background script
- **Debug**: Background console for command registration

## Quick Test Commands

```bash
# Rebuild after changes
npm run build

# Start dev server (for hot reloading)
npm run dev

# Check for TypeScript errors
npm run compile
```

## Extension Files Structure

```
.output/chrome-mv3/
├── manifest.json          # Extension configuration
├── popup.html             # Popup interface
├── background.js           # Background script
├── content-scripts/
│   └── content.js          # Widget and note functionality
└── assets/                 # Icons and resources
```

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Widget appears on any webpage
- [ ] - button opens note editor modal
- [ ] Notes can be created and saved
- [ ] Widget is draggable
- [ ] Keyboard shortcuts work
- [ ] Popup interface opens
- [ ] Notes persist across page reloads

## Need Help?

If the extension still isn't working:

1. Check the browser console for errors
2. Verify all files are built correctly
3. Try reloading the extension in chrome://extensions/
4. Check that all permissions are granted

Happy coding! 🚀
