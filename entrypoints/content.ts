export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    console.log("🎯 StickyNoteAI v2.2 CSS FIXED + MENU POSITIONING - Loading...");

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        initializeWidget();
      });
    } else {
      initializeWidget();
    }
  },
});

let widget: HTMLElement | null = null;
let isDragging = false;
let isMenuOpen = false;
let dragOffset = { x: 0, y: 0 };
let lastPosition = { x: 0, y: 0 };
let menuCloseTimeout: NodeJS.Timeout | null = null;
let globalSmilyFaceUrl: string; // Global variable for smiley face URL
let globalMouseMoveHandler: ((e: MouseEvent) => void) | null = null;
let currentTheme: { id: string; data: any } = { id: 'default', data: null }; // Current theme for new notes

function initializeWidget() {
  console.log("StickyNoteAI: DOM ready, creating widget...");
  createFloatingWidget();
  loadWidgetPosition();
  loadCurrentTheme();
  setupKeyboardShortcuts();
  setupMessageListener();
}

async function loadCurrentTheme() {
  try {
    const result = await browser.storage.local.get("sticky-settings");
    const settings = result["sticky-settings"];
    if (settings && settings.activeTheme && settings.activeTheme !== 'default') {
      // Load theme data from popup's theme definitions
      const themes = [
        {
          id: 'autumn',
          name: 'Autumn',
          description: 'Warm autumn colors with orange, red, and golden tones',
          colors: {
            primary: 'linear-gradient(135deg, #ff6b35 0%, #d84315 100%)',
            secondary: 'linear-gradient(135deg, #ff8f00 0%, #ef6c00 100%)',
            accent: '#8d4004',
            background: 'linear-gradient(145deg, #fff3e0, #ffe0b2)',
            noteColors: [
              'rgba(255, 183, 77, 0.85)',  // Golden yellow
              'rgba(255, 138, 101, 0.85)', // Coral orange
              'rgba(198, 40, 40, 0.85)',   // Deep red
              'rgba(191, 54, 12, 0.85)',   // Burnt orange
              'rgba(239, 108, 0, 0.85)',   // Orange
              'rgba(130, 119, 23, 0.85)',  // Golden brown
            ]
          }
        }
      ];
      
      const theme = themes.find(t => t.id === settings.activeTheme);
      if (theme) {
        currentTheme = { id: settings.activeTheme, data: theme };
        console.log("StickyNoteAI: Loaded theme:", settings.activeTheme);
      }
    }
  } catch (error) {
    console.error("StickyNoteAI: Failed to load theme:", error);
  }
}

function createFloatingWidget() {
  // Remove existing widget if any
  const existingWidget = document.getElementById("sticky-note-widget");
  if (existingWidget) {
    existingWidget.remove();
  }

  // Create main widget container
  widget = document.createElement("div");
  widget.id = "sticky-note-widget";

  // Try multiple approaches to get the correct URLs for public assets
  let smilyFaceUrl: string;
  let add2Url: string;

  try {
    // Primary approach: Use browser.runtime.getURL
    smilyFaceUrl = browser.runtime.getURL("smilyface.gif" as any);
    globalSmilyFaceUrl = smilyFaceUrl; // Store globally
    add2Url = browser.runtime.getURL("add2.png" as any);
  } catch (error) {
    console.warn("browser.runtime.getURL failed, using fallback approach:", error);
    // Fallback approach: Direct extension URL construction
    const extensionId = browser.runtime.id || chrome.runtime.id;
    smilyFaceUrl = `chrome-extension://${extensionId}/smilyface.gif`;
    globalSmilyFaceUrl = smilyFaceUrl; // Store globally
    add2Url = `chrome-extension://${extensionId}/add2.png`;
  }

  console.log("StickyNoteAI: Image URLs:", { smilyFaceUrl, add2Url });
  console.log("StickyNoteAI: Extension ID:", browser.runtime.id);
  console.log("StickyNoteAI: Chrome runtime ID:", chrome.runtime.id);

  widget.innerHTML = `
    <div class="widget-container">
      <div class="widget-main-button" id="main-button">
        <img src="${smilyFaceUrl}" alt="Widget" style="width: 24px; height: 24px;" id="smiley-image">
      </div>
      <div class="widget-menu" id="widget-menu">
        <div class="menu-button add-button" data-action="add">
          <span class="add-icon">📝</span>
        </div>
        <div class="menu-button notes-button" data-action="notes">📋</div>
        <div class="menu-button settings-button" data-action="settings">⚙️</div>
        
      </div>
    </div>
  `;
  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    #sticky-note-widget {
      position: fixed;
      bottom: 50vh;
      right: 50px;
      z-index: 999999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      user-select: none;
      pointer-events: auto;
    }

    .widget-container {
      position: relative;
      display: inline-block;
    }

    .widget-main-button {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
      transition: all 0.3s ease;
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      position: relative;
    }

    .widget-main-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    }
        0 0 100px rgba(204, 102, 218, 0.4);
      animation: pulseGlowHover 2s ease-in-out infinite;
    }

    @keyframes pulseGlowHover {
      0%, 100% {
        box-shadow: 
          0 6px 25px rgba(153, 41, 234, 0.6),
          0 0 35px rgba(153, 41, 234, 0.8),
          0 0 70px rgba(204, 102, 218, 0.6),
          0 0 100px rgba(204, 102, 218, 0.4);
      }
      50% {
        box-shadow: 
          0 8px 30px rgba(153, 41, 234, 0.8),
          0 0 45px rgba(153, 41, 234, 1),
          0 0 90px rgba(204, 102, 218, 0.8),
          0 0 130px rgba(204, 102, 218, 0.5);
      }
    }

    .widget-main-button.dragging {
      cursor: grabbing !important;
      transform: scale(0.95);
      box-shadow: 
        0 8px 30px rgba(153, 41, 234, 0.7),
        0 0 25px rgba(153, 41, 234, 0.9),
        0 0 50px rgba(204, 102, 218, 0.7),
        0 0 80px rgba(204, 102, 218, 0.5);
      animation: none;
    }

    .widget-menu {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }

    .widget-menu.top-positioned {
      top: auto;
      bottom: 100%;
      margin-top: 0;
      margin-bottom: 10px;
      flex-direction: column-reverse; /* Reverse order so buttons appear naturally */
    }

    .widget-menu.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .menu-button {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      border: 2px solid rgba(34, 197, 94, 0.2);
      backdrop-filter: blur(10px);
      transform: translateY(-10px);
      opacity: 0;
      color: #374151;
    }

    .widget-menu.open .menu-button {
      transform: translateY(0);
      opacity: 1;
    }

    .widget-menu.open .menu-button:nth-child(1) { transition-delay: 0.05s; }
    .widget-menu.open .menu-button:nth-child(2) { transition-delay: 0.1s; }
    .widget-menu.open .menu-button:nth-child(3) { transition-delay: 0.15s; }
    .widget-menu.open .menu-button:nth-child(4) { transition-delay: 0.2s; }

    .menu-button:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
      border-color: rgba(22, 163, 74, 0.3);
    }

    .add-icon {
      font-size: 16px;
      line-height: 1;
      user-select: none;
      pointer-events: none;
    }


    .sticky-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .sticky-modal.open {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      background: linear-gradient(135deg, #FAEB92 0%, #CC66DA 100%);
      padding: 30px;
      border-radius: 15px;
      box-shadow: 
        0 20px 60px rgba(153, 41, 234, 0.5),
        0 0 0 3px rgba(0, 0, 0, 0.2),
        0 10px 30px rgba(204, 102, 218, 0.4);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      transform: scale(0.9);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 3px solid #000000;
    }

    .sticky-modal.open .modal-content {
      transform: scale(1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #000000;
      background: #FDFFB8;
      padding: 15px;
      margin: -30px -30px 20px -30px;
      border-radius: 15px 15px 0 0;
    }

    .modal-title {
      font-size: 20px;
      font-weight: 600;
      color: #000000;
      text-shadow: 0 1px 2px rgba(250, 235, 146, 0.8);
    }

    .modal-close {
      background: #9929EA;
      border: 2px solid #000000;
      font-size: 24px;
      cursor: pointer;
      color: #FAEB92;
      padding: 5px;
      border-radius: 50%;
      transition: all 0.2s ease;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }

    .modal-close:hover {
      background: #CC66DA;
      color: #000000;
      transform: scale(1.1);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
    }

    .note-input {
      width: 100%;
      min-height: 200px;
      padding: 15px;
      border: 3px solid #000000;
      border-radius: 10px;
      font-size: 14px;
      font-family: 'Comic Sans MS', cursive, sans-serif;
      resize: vertical;
      transition: border-color 0.2s ease;
      background: rgba(253, 255, 184, 0.9);
      color: #000000;
      box-shadow: inset 0 2px 5px rgba(153, 41, 234, 0.3);
    }

    .note-input:focus {
      outline: none;
      border-color: #9929EA;
      box-shadow: 
        inset 0 2px 5px rgba(153, 41, 234, 0.4),
        0 0 0 3px rgba(204, 102, 218, 0.3);
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .btn-primary {
      background: linear-gradient(135deg, #9929EA 0%, #CC66DA 100%);
      color: #FAEB92;
      border: 2px solid #000000;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #CC66DA 0%, #9929EA 100%);
      color: #000000;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(153, 41, 234, 0.5);
    }

    .btn-secondary {
      background: #FAEB92;
      color: #000000;
      border: 2px solid #000000;
    }

    .btn-secondary:hover {
      background: #CC66DA;
      color: #000000;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(204, 102, 218, 0.5);
    }

    .notes-panel {
      position: fixed;
      top: 50%;
      right: -300px;
      transform: translateY(-50%);
      width: 280px;
      max-height: 400px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15),
                  0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 999998;
      transition: right 0.3s ease;
      overflow: hidden;
      border: none;
      backdrop-filter: blur(10px);
    }

    .notes-panel.open {
      right: 20px;
    }

    .notes-header {
      background: rgba(255, 251, 147, 0.8);
      color: #4a4a4a;
      padding: 12px 16px;
      font-weight: 600;
      font-size: 14px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .panel-close-btn {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: #666;
      padding: 2px 6px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .panel-close-btn:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #000;
    }

    .notes-list {
      max-height: 300px;
      overflow-y: auto;
      padding: 8px;
      background: transparent;
    }

    .note-item {
      padding: 12px;
      margin-bottom: 8px;
      cursor: pointer;
      background: rgba(255, 251, 147, 0.6);
      border-radius: 4px;
      border: none;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .note-item:hover {
      background: rgba(255, 251, 147, 0.8);
      transform: translateX(3px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .note-item:nth-child(2n) {
      background: rgba(255, 237, 213, 0.6);
    }

    .note-item:nth-child(2n):hover {
      background: rgba(255, 237, 213, 0.8);
    }

    .note-item:nth-child(3n) {
      background: rgba(237, 255, 235, 0.6);
    }

    .note-item:nth-child(3n):hover {
      background: rgba(237, 255, 235, 0.8);
    }

    .note-preview {
      font-size: 12px;
      color: #555;
      margin-top: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }

    .note-date {
      font-size: 10px;
      color: #888;
      margin-top: 4px;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .notes-panel {
        width: 90%;
        right: -100%;
      }
      .notes-panel.open {
        right: 5%;
      }
    }
 

    /* Sticky Note Styles */
    .sticky-note {
      position: fixed;
      width: 280px;
      height: 180px;
      background: rgba(255, 251, 147, 0.95); /* Classic yellow sticky note */
      border-radius: 8px;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.15),
        0 1px 4px rgba(0, 0, 0, 0.1);
      z-index: 999997;
      font-family: 'Segoe UI', system-ui, sans-serif;
      transform: scale(0.9) rotate(var(--note-rotation, -1deg));
      opacity: var(--note-opacity, 0);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(2px);
      display: flex;
      flex-direction: column;
    }

    .sticky-note.open {
      transform: scale(1) rotate(var(--note-rotation, 0deg));
      opacity: var(--note-opacity, 1);
    }

    .sticky-note.minimized {
      height: 36px;
      overflow: hidden;
    }

    .sticky-note.minimized .sticky-note-textarea {
      display: none;
    }

    .sticky-note.minimized .note-resize-handle {
      display: none;
    }

    .sticky-note.minimized .note-controls-bottom {
      display: none;
    }

    /* Read-only state */
    .sticky-note-textarea[readonly] {
      background: rgba(0, 0, 0, 0.02);
      cursor: default !important;
    }

    /* Note highlight animation */
    .sticky-note.highlight {
      border: 3px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
      transform: scale(1.05);
      transition: all 0.3s ease;
    }

    .sticky-note.highlight-fade {
      border: 2px solid rgba(0, 0, 0, 0.1);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.15),
        0 1px 4px rgba(0, 0, 0, 0.1);
      transform: scale(1);
      transition: all 0.5s ease;
    }

    .sticky-note.pinned {
      border: 2px solid rgba(255, 193, 7, 0.6);
      box-shadow: 
        0 6px 16px rgba(255, 193, 7, 0.2),
        0 2px 8px rgba(0, 0, 0, 0.1);
      transform: scale(1) rotate(0deg) !important;
    }

    .sticky-note-header {
      background: rgba(0, 0, 0, 0.05);
      padding: 8px 12px;
      border-radius: 6px 6px 0 0;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      user-select: none;
      flex-shrink: 0;
    }

    .note-title {
      font-size: 12px;
      font-weight: 500;
      color: #666;
      text-shadow: none;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 3px;
      transition: background-color 0.2s ease;
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .note-title:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .note-title-input {
      font-size: 12px;
      font-weight: 500;
      color: #666;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #ccc;
      border-radius: 3px;
      padding: 2px 4px;
      width: 120px;
      outline: none;
    }

    .note-controls {
      display: flex;
      gap: 4px;
    }

    .note-control-btn {
      width: 20px;
      height: 20px;
      border: none;
      border-radius: 50%; /* Make buttons circular */
      background: rgba(0, 0, 0, 0.1);
      cursor: pointer;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: #666;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .note-control-btn:hover {
      background: rgba(0, 0, 0, 0.2);
      color: #333;
      transform: scale(1.1);
    }

    .note-control-btn.pin-btn.pinned {
      background: rgba(255, 193, 7, 0.8);
      color: #fff;
    }

    .note-control-btn.close-btn:hover {
      background: rgba(220, 38, 38, 0.8);
      color: #fff;
    }

    .sticky-note-textarea {
      flex: 1;
      margin: 8px;
      border: none;
      background: transparent;
      resize: none;
      outline: none !important;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 13px;
      color: #333;
      line-height: 1.5;
      placeholder-color: rgba(0, 0, 0, 0.4);
      box-shadow: none !important;
    }

    .sticky-note-textarea:focus {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
    }

    .sticky-note-textarea::placeholder {
      color: rgba(0, 0, 0, 0.4);
      font-style: italic;
    }

    .note-resize-handle {
      position: absolute;
      bottom: 3px;
      right: 3px;
      width: 16px;
      height: 16px;
      cursor: nw-resize;
      background: linear-gradient(-45deg, transparent 35%, rgba(0, 0, 0, 0.3) 50%, transparent 65%);
      border-radius: 3px;
      opacity: 0.7;
      transition: all 0.2s ease;
    }

    .note-resize-handle:hover {
      background: linear-gradient(-45deg, transparent 30%, rgba(0, 0, 0, 0.5) 50%, transparent 70%);
      opacity: 1;
      transform: scale(1.1);
    }

    /* Note Options Modal */
    .note-options-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .note-options-modal.open {
      opacity: 1;
      visibility: visible;
    }

    .note-options-content {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      transform: scale(0.9);
      transition: transform 0.3s ease;
    }

    .note-options-modal.open .note-options-content {
      transform: scale(1);
    }

    .note-preview-section {
      margin-bottom: 24px;
      padding: 16px;
      background: rgba(255, 251, 147, 0.3);
      border-radius: 8px;
      border-left: 4px solid #22c55e;
    }

    .note-preview-section h3 {
      margin: 0 0 12px 0;
      color: #374151;
      font-size: 18px;
      font-weight: 600;
    }

    .note-preview-text {
      color: #555;
      line-height: 1.5;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .note-date {
      color: #888;
      font-size: 12px;
      font-style: italic;
    }

    /* Simple Note Items */
    .note-item {
      padding: 12px 16px;
      margin: 8px 0;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .note-item:hover {
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }
    
    .note-title-display {
      font-weight: 600;
      font-size: 14px;
      color: #1f2937;
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .note-preview {
      color: #374151;
      font-size: 12px;
      line-height: 1.4;
      margin-bottom: 8px;
      font-weight: 400;
    }
    
    .note-date {
      font-size: 11px;
      color: #9ca3af;
      font-weight: 400;
    }

    /* Action Buttons - Uniform Circular Design */
    .action-btn {
      width: 28px;
      height: 28px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.3);
      color: rgba(0, 0, 0, 0.8);
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.5);
      color: rgba(0, 0, 0, 0.9);
      border-color: rgba(0, 0, 0, 0.3);
    }

    .action-btn.read-only-btn {
      background: rgba(255, 255, 255, 0.3);
      color: rgba(0, 0, 0, 0.7);
    }

    .action-btn.read-only-btn.active {
      background: rgba(255, 255, 255, 0.5);
      color: rgba(0, 0, 0, 0.9);
      border-color: rgba(0, 0, 0, 0.4);
    }

    .action-btn.delete-btn {
      background: rgba(255, 255, 255, 0.3);
      color: rgba(0, 0, 0, 0.7);
    }

    .action-btn.delete-btn:hover {
      background: rgba(255, 255, 255, 0.5);
      color: rgba(0, 0, 0, 0.9);
    }

    /* Note Controls Bottom - Left Aligned */
    .note-controls-bottom {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 6px 10px;
      background: var(--note-bg-80, rgba(255, 251, 147, 0.8));
      border-radius: 0 0 6px 6px;
      flex-shrink: 0;
      gap: 8px;
      position: relative;
    }

    /* Toolbar Toggle Button - Same size as other action buttons */
    .toolbar-toggle-btn {
      order: -1; /* Put it first in the flex layout */
      margin-right: 8px;
      flex-shrink: 0;
    }

    /* Collapsed state - hide everything except toggle button */
    .note-controls-bottom.collapsed .note-toolbar > *:not(.toolbar-toggle-btn) {
      display: none;
    }

    .note-controls-bottom.collapsed {
      padding: 6px 10px;
    }

    .note-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Transparency Control */
    .transparency-control {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tool-icon {
      width: 28px;
      height: 28px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.8);
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.2);
      background: rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tool-icon:hover {
      color: rgba(0, 0, 0, 0.9);
      background: rgba(255, 255, 255, 0.5);
      border-color: rgba(0, 0, 0, 0.3);
    }

    .transparency-slider {
      width: 60px;
      height: 5px;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.15);
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }

    .transparency-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }

    .transparency-slider::-webkit-slider-thumb:hover {
      background: rgba(0, 0, 0, 0.8);
      transform: scale(1.1);
    }

    .transparency-slider::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      cursor: pointer;
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    /* Font Size Control */
    .font-size-control {
      position: relative;
      display: flex;
      align-items: center;
    }

    .font-size-popup {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      padding: 6px;
      display: none;
      align-items: center;
      gap: 6px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
      margin-bottom: 3px;
      z-index: 1000;
    }

    .font-size-popup.active {
      display: flex;
    }

    .font-size-btn {
      width: 20px;
      height: 20px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      background: rgba(0, 0, 0, 0.05);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: rgba(0, 0, 0, 0.7);
      transition: all 0.2s ease;
    }

    .font-size-btn:hover {
      background: rgba(0, 0, 0, 0.1);
      color: rgba(0, 0, 0, 0.9);
    }

    .font-size-input {
      width: 35px;
      text-align: center;
      font-size: 11px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 3px;
      padding: 2px 4px;
      background: rgba(255, 255, 255, 0.8);
      outline: none;
    }

    .font-size-input:focus {
      border-color: rgba(0, 0, 0, 0.5);
      background: white;
    }

    /* Action Buttons */
    .note-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }



    /* ...existing code... */
  `;
  document.head.appendChild(style);
  document.body.appendChild(widget);

  // Setup image loading event listeners
  const smileyImage = document.getElementById("smiley-image") as HTMLImageElement;
  const addImage = document.getElementById("add-image") as HTMLImageElement;

  if (smileyImage) {
    smileyImage.addEventListener("load", () => {
      console.log("✅ Smiley face image loaded successfully");
    });
    smileyImage.addEventListener("error", () => {
      console.error("❌ Failed to load smiley face image:", smilyFaceUrl);
      smileyImage.style.display = "none";
    });
  }

  if (addImage) {
    addImage.addEventListener("load", () => {
      console.log("✅ Add2 image loaded successfully");
    });
    addImage.addEventListener("error", () => {
      console.error("❌ Failed to load add2 image:", add2Url);
      addImage.style.display = "none";
    });
  }

  setupWidgetEvents();
}

function setupWidgetEvents() {
  const mainButton = document.getElementById("main-button");
  const menu = document.getElementById("widget-menu");

  if (!mainButton || !menu) return;

  let dragStartTime = 0;
  let startPosition = { x: 0, y: 0 };
  let hasMovedWhileDragging = false;

  // Boundary constraint function
  function constrainToBounds(x: number, y: number): { x: number; y: number } {
    if (!widget) return { x, y };

    const widgetRect = { width: 50, height: 50 }; // Widget dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const margin = 10; // Minimum margin from edges

    // Constrain horizontal position
    let constrainedX = Math.max(margin, x);
    constrainedX = Math.min(windowWidth - widgetRect.width - margin, constrainedX);

    // Constrain vertical position
    let constrainedY = Math.max(margin, y);
    constrainedY = Math.min(windowHeight - widgetRect.height - margin, constrainedY);

    return { x: constrainedX, y: constrainedY };
  }

  // Snap to nearest edge function
  function snapToNearestEdge(x: number, y: number): { x: number; y: number } {
    if (!widget) return { x, y };

    const widgetRect = { width: 50, height: 50 };
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const snapMargin = 20; // Distance from edge to snap to

    // Calculate distances to each edge
    const distanceToLeft = x;
    const distanceToRight = windowWidth - (x + widgetRect.width);
    const distanceToTop = y;
    const distanceToBottom = windowHeight - (y + widgetRect.height);

    // Find the nearest edge
    const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);

    let snappedX = x;
    let snappedY = y;

    // Snap to the nearest edge if widget is partially hidden
    if (x < 0 || x + widgetRect.width > windowWidth || y < 0 || y + widgetRect.height > windowHeight) {
      if (minDistance === distanceToLeft) {
        snappedX = snapMargin;
      } else if (minDistance === distanceToRight) {
        snappedX = windowWidth - widgetRect.width - snapMargin;
      } else if (minDistance === distanceToTop) {
        snappedY = snapMargin;
      } else if (minDistance === distanceToBottom) {
        snappedY = windowHeight - widgetRect.height - snapMargin;
      }
    }

    return { x: snappedX, y: snappedY };
  }

  // Mouse events for main button
  mainButton.addEventListener("mousedown", (e) => {
    e.preventDefault();
    dragStartTime = Date.now();
    startPosition = { x: e.clientX, y: e.clientY };
    hasMovedWhileDragging = false;

    const rect = widget!.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    mainButton.classList.add("dragging");

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });

  // Click to open menu (primary interaction)
  mainButton.addEventListener("click", (e) => {
    if (!isDragging && !hasMovedWhileDragging) {
      e.preventDefault();
      e.stopPropagation();
      if (isMenuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }
  });

  // Hover to open menu (secondary interaction)
  mainButton.addEventListener("mouseenter", () => {
    if (!isDragging) {
      // Clear any pending close timeout
      if (menuCloseTimeout) {
        clearTimeout(menuCloseTimeout);
        menuCloseTimeout = null;
      }
      if (!isMenuOpen) {
        openMenu();
      }
    }
  });

  // Keep menu open when hovering over menu items
  menu.addEventListener("mouseenter", () => {
    if (menuCloseTimeout) {
      clearTimeout(menuCloseTimeout);
      menuCloseTimeout = null;
    }
  });

  // Close menu when leaving menu area with increased tolerance
  menu.addEventListener("mouseleave", (e) => {
    if (!isDragging) {
      // Check distance from menu with 50% tolerance
      const rect = menu.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      const tolerance = Math.max(rect.width, rect.height) * 0.5;
      
      // Only close if mouse is far from menu area
      const isFarFromMenu = mouseX < rect.left - tolerance || 
                           mouseX > rect.right + tolerance || 
                           mouseY < rect.top - tolerance || 
                           mouseY > rect.bottom + tolerance;
      
      if (isFarFromMenu) {
        menuCloseTimeout = setTimeout(() => {
          closeMenu();
          menuCloseTimeout = null;
        }, 300); // Longer delay for menu area
      }
    }
  });

  // Close menu when leaving main button area (but not if going to menu)
  mainButton.addEventListener("mouseleave", (e) => {
    if (!isDragging) {
      // Check if mouse is moving towards the menu with 50% larger tolerance area
      const rect = menu.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Calculate 50% larger tolerance area
      const tolerance = Math.max(rect.width, rect.height) * 0.5;
      
      // If mouse is within menu bounds or large tolerance area, don't close
      const isNearMenu = mouseX >= rect.left - tolerance && 
                        mouseX <= rect.right + tolerance && 
                        mouseY >= rect.top - tolerance && 
                        mouseY <= rect.bottom + tolerance;

      if (!isNearMenu) {
        menuCloseTimeout = setTimeout(() => {
          closeMenu();
          menuCloseTimeout = null;
        }, 200); // Increased delay for better UX
      }
    }
  });

  function handleMouseMove(e: MouseEvent) {
    const timeDiff = Date.now() - dragStartTime;
    const distance = Math.sqrt(Math.pow(e.clientX - startPosition.x, 2) + Math.pow(e.clientY - startPosition.y, 2));

    // Start dragging if moved > 3px or held for > 100ms
    if (!isDragging && (distance > 3 || timeDiff > 100)) {
      isDragging = true;
      hasMovedWhileDragging = true;
      closeMenu();
      document.body.style.cursor = "grabbing";
    }

    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Apply boundary constraints
      const constrainedPosition = constrainToBounds(newX, newY);

      // Use transform for smoother movement
      widget!.style.transform = `translate(${constrainedPosition.x}px, ${constrainedPosition.y}px)`;
      widget!.style.left = "0";
      widget!.style.top = "0";

      lastPosition = { x: constrainedPosition.x, y: constrainedPosition.y };
    }
  }

  function handleMouseUp() {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    if (mainButton) {
      mainButton.classList.remove("dragging");
    }
    document.body.style.cursor = "";

    if (isDragging) {
      // Apply edge snapping if widget is partially outside bounds
      const snappedPosition = snapToNearestEdge(lastPosition.x, lastPosition.y);

      // Animate to snapped position if different from current position
      if (snappedPosition.x !== lastPosition.x || snappedPosition.y !== lastPosition.y) {
        widget!.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        widget!.style.left = snappedPosition.x + "px";
        widget!.style.top = snappedPosition.y + "px";
        widget!.style.transform = "";

        // Remove transition after animation
        setTimeout(() => {
          if (widget) {
            widget.style.transition = "";
          }
        }, 300);

        lastPosition = snappedPosition;
      } else {
        // Apply final position normally
        widget!.style.left = lastPosition.x + "px";
        widget!.style.top = lastPosition.y + "px";
        widget!.style.transform = "";
      }

      saveWidgetPosition();
    }

    isDragging = false;
    
    // Reset drag tracking
    hasMovedWhileDragging = false;
  }

  // Menu button clicks with debounce
  let lastClickTime = 0;
  menu?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const action = target.dataset.action;
    const now = Date.now();

    // Debounce clicks - prevent multiple clicks within 500ms
    if (now - lastClickTime < 500) {
      return;
    }
    lastClickTime = now;

    if (action) {
      console.log("Menu button clicked:", action);
      handleMenuAction(action);
    }
  });
}

function openMenu() {
  if (isDragging) return;
  const menu = document.getElementById("widget-menu");
  const widget = document.getElementById("sticky-note-widget");
  
  if (menu && widget) {
    // Check if widget is in the lower half of the screen
    const widgetRect = widget.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const isInLowerHalf = widgetRect.top > windowHeight / 2;
    
    if (isInLowerHalf) {
      // Position menu above the widget
      menu.classList.add("top-positioned");
    } else {
      // Position menu below the widget (default)
      menu.classList.remove("top-positioned");
    }
    
    menu.classList.add("open");
    isMenuOpen = true;
    
    // Start global mouse tracking for distance-based closing
    setupGlobalMouseTracking();
  }
}

function setupGlobalMouseTracking() {
  // Remove existing handler if any
  if (globalMouseMoveHandler) {
    document.removeEventListener("mousemove", globalMouseMoveHandler);
  }
  
  globalMouseMoveHandler = (e: MouseEvent) => {
    if (!isMenuOpen || isDragging) return;
    
    const widget = document.getElementById("sticky-note-widget");
    const menu = document.getElementById("widget-menu");
    
    if (!widget || !menu) return;
    
    // Calculate distance from mouse to widget/menu area
    const widgetRect = widget.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    
    // Get the actual main button instead of the whole widget container
    const mainButton = widget.querySelector('.widget-main-button');
    const buttonRect = mainButton ? mainButton.getBoundingClientRect() : widgetRect;
    
    // Debug: Log mouse movement (only occasionally to avoid spam)
    if (Math.random() < 0.1) { // 10% of movements
      console.log('🖱️ Mouse tracking:', {
        mouse: { x: e.clientX, y: e.clientY },
        isMenuOpen,
        isDragging
      });
    }
    
    // Get mouse coordinates first
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Create a combined bounding box for button + menu (not the huge widget)
    const combinedRect = {
      left: Math.min(buttonRect.left, menuRect.left),
      right: Math.max(buttonRect.right, menuRect.right),
      top: Math.min(buttonRect.top, menuRect.top),
      bottom: Math.max(buttonRect.bottom, menuRect.bottom)
    };
    
    // Debug: Always log the rectangles with actual values
    console.log('🔍 Rectangle Debug:', {
      widget: { 
        left: widgetRect.left, 
        right: widgetRect.right, 
        width: widgetRect.width,
        height: widgetRect.height
      },
      button: { 
        left: buttonRect.left, 
        right: buttonRect.right, 
        width: buttonRect.width,
        height: buttonRect.height
      },
      menu: { 
        left: menuRect.left, 
        right: menuRect.right, 
        width: menuRect.width,
        height: menuRect.height
      },
      combined: combinedRect,
      mouse: { x: mouseX, y: mouseY }
    });
    
    // Add tolerance area (60px radius from the combined area - decreased by 60%)
    const tolerance = 60;
    
    // Simple and clear boundary check
    const leftBoundary = combinedRect.left - tolerance;
    const rightBoundary = combinedRect.right + tolerance;
    const topBoundary = combinedRect.top - tolerance;
    const bottomBoundary = combinedRect.bottom + tolerance;
    
    // Show key values for right-side debugging with detailed info
    console.log(`📊 Right side analysis:
    Mouse X: ${mouseX}
    Widget (full): ${widgetRect.left} to ${widgetRect.right} (width: ${widgetRect.width})
    Button (actual): ${buttonRect.left} to ${buttonRect.right} (width: ${buttonRect.width})
    Menu: ${menuRect.left} to ${menuRect.right} (width: ${menuRect.width})
    Combined right: ${combinedRect.right}
    Right boundary: ${rightBoundary}
    Distance from boundary: ${mouseX - rightBoundary}
    Should close when mouse > ${rightBoundary}`);
    
    // Check each boundary individually for debugging
    const leftCheck = mouseX < leftBoundary;
    const rightCheck = mouseX > rightBoundary;
    const topCheck = mouseY < topBoundary;
    const bottomCheck = mouseY > bottomBoundary;
    
    // Only log boundary checks when something might close
    if (leftCheck || rightCheck || topCheck || bottomCheck) {
      console.log('⚠️ Boundary checks - SHOULD CLOSE:', {
        mouse: { x: mouseX, y: mouseY },
        boundaries: { 
          left: leftBoundary, 
          right: rightBoundary, 
          top: topBoundary, 
          bottom: bottomBoundary 
        },
        checks: {
          leftSide: leftCheck,
          rightSide: rightCheck,
          topSide: topCheck,
          bottomSide: bottomCheck
        },
        shouldClose: true
      });
    }
    
    // Alternative simple distance check for right side specifically (using button, not widget)
    const distanceFromButtonRight = mouseX - buttonRect.right;
    const distanceFromMenuRight = mouseX - menuRect.right;
    const maxRight = Math.max(buttonRect.right, menuRect.right);
    const simpleRightCheck = mouseX > (maxRight + tolerance);
    
    // Only log simple right check when it's triggered
    if (simpleRightCheck) {
      console.log('🟢 Simple right check - TRIGGERED:', {
        mouseX,
        buttonRight: buttonRect.right,
        menuRight: menuRect.right,
        maxRight,
        tolerance,
        threshold: maxRight + tolerance,
        simpleRightCheck: true,
        distanceFromButtonRight,
        distanceFromMenuRight
      });
    }
    
    // Use either the complex check or simple right check
    const isOutsideTolerance = leftCheck || rightCheck || topCheck || bottomCheck || simpleRightCheck;
    
    if (isOutsideTolerance) {
      console.log('🔴 CLOSING MENU - Reason:', {
        leftSide: leftCheck,
        rightSide: rightCheck,
        topSide: topCheck,
        bottomSide: bottomCheck,
        simpleRightCheck
      });
      closeMenu();
    }
  };
  
  document.addEventListener("mousemove", globalMouseMoveHandler);
}

// Add click outside to close menu
document.addEventListener("click", (e) => {
  if (!isMenuOpen) return;
  
  const widget = document.getElementById("sticky-note-widget");
  const menu = document.getElementById("widget-menu");
  
  if (!widget || !menu) return;
  
  // Check if click is outside widget and menu
  const target = e.target as HTMLElement;
  const isInsideWidget = widget.contains(target);
  const isInsideMenu = menu.contains(target);
  
  if (!isInsideWidget && !isInsideMenu) {
    closeMenu();
  }
});

function closeMenu() {
  const menu = document.getElementById("widget-menu");
  if (menu) {
    menu.classList.remove("open");
    isMenuOpen = false;
  }
  // Clear any pending timeout
  if (menuCloseTimeout) {
    clearTimeout(menuCloseTimeout);
    menuCloseTimeout = null;
  }
  
  // Remove global mouse tracking when menu closes
  if (globalMouseMoveHandler) {
    document.removeEventListener("mousemove", globalMouseMoveHandler);
    globalMouseMoveHandler = null;
  }
}

function handleMenuAction(action: string) {
  console.log("Menu action triggered:", action);
  closeMenu(); // Close menu immediately when action is triggered
  
  // Add small delay to prevent multiple clicks
  setTimeout(() => {
    switch (action) {
      case "add":
        createNoteEditor();
        break;
      case "notes":
        toggleNotesPanel();
        break;
      case "settings":
        openSettingsModal();
        break;
    }
  }, 100);
}

function createNoteEditor(initialText: string = "") {
  // Check if we have an active session - if so, highlight it instead of creating new
  if (currentNoteSession && currentNoteSession.element && document.body.contains(currentNoteSession.element)) {
    highlightExistingNote(currentNoteSession.element);
    return;
  }

  const stickyNote = createStickyNote(initialText);
  
  // Auto-focus the textarea when created via shortcut
  setTimeout(() => {
    const textarea = stickyNote.querySelector(".sticky-note-textarea") as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length); // Place cursor at end
    }
  }, 100);
}

// Global note management
let currentNoteSession: any = null;
let openNotesList: Map<string, HTMLElement> = new Map(); // Track open notes by ID

function createStickyNote(content: string = "", existingNoteData: any = null) {
  // Check if note is already open (prevent duplicates)
  if (existingNoteData && openNotesList.has(existingNoteData.id)) {
    const existingNote = openNotesList.get(existingNoteData.id);
    if (existingNote && document.body.contains(existingNote)) {
      highlightExistingNote(existingNote);
      return existingNote;
    } else {
      // Remove stale reference
      openNotesList.delete(existingNoteData.id);
    }
  }

  // Check if we should reuse existing note session for new notes
  if (currentNoteSession && !existingNoteData) {
    // Highlight and focus existing note
    highlightExistingNote(currentNoteSession.element);
    return currentNoteSession.element;
  }

  const noteId = existingNoteData?.id || Date.now().toString();
  const note = document.createElement("div");
  note.className = "sticky-note";
  note.id = `sticky-note-${noteId}`;
  
  // Use existing data or create new
  let noteColor, noteTitle, fontSize, transparency, position, size;
  
  if (existingNoteData) {
    noteColor = existingNoteData.color || 'rgba(255, 251, 147, 0.95)';
    noteTitle = existingNoteData.title || (content.length > 15 ? content.substring(0, 15) + "..." : content) || "Edit Note";
    fontSize = existingNoteData.fontSize || 13;
    transparency = existingNoteData.transparency || 0.95;
    position = existingNoteData.position;
    size = existingNoteData.size;
  } else {
    // Use theme colors if available, otherwise default colors
    let stickyColors;
    
    if (currentTheme.id === 'autumn' && currentTheme.data?.colors?.noteColors) {
      stickyColors = currentTheme.data.colors.noteColors;
    } else {
      // Default realistic sticky note colors
      stickyColors = [
        'rgba(255, 251, 147, 0.95)', // Classic yellow
        'rgba(255, 237, 213, 0.95)', // Light peach
        'rgba(237, 255, 235, 0.95)', // Light green
        'rgba(235, 245, 255, 0.95)', // Light blue
        'rgba(255, 235, 255, 0.95)', // Light pink
        'rgba(255, 243, 205, 0.95)', // Light orange
        'rgba(243, 235, 255, 0.95)', // Light purple
      ];
    }
    
    noteColor = stickyColors[Math.floor(Math.random() * stickyColors.length)];
    noteTitle = content ? (content.length > 15 ? content.substring(0, 15) + "..." : content) : "New Note";
    fontSize = 13;
    transparency = 0.95;
    position = null;
    size = null;
  }
  
  note.innerHTML = `
    <div class="sticky-note-header">
      <span class="note-title" title="Click to edit title">${noteTitle}</span>
      <div class="note-controls">
        <button class="note-control-btn pin-btn" title="Pin note (always on top)">📌</button>
        <button class="note-control-btn minimize-btn" title="Minimize">−</button>
        <button class="note-control-btn close-btn" title="Close">×</button>
      </div>
    </div>
    <textarea class="sticky-note-textarea" placeholder="Write your note here..." style="font-size: ${fontSize}px;">${content}</textarea>
    <div class="note-controls-bottom">
      <div class="note-toolbar">
        <button class="action-btn toolbar-toggle-btn" title="Hide toolbar">&lt;</button>
        <div class="transparency-control">
          <input type="range" class="transparency-slider" min="0.3" max="1" step="0.1" value="${transparency}">
        </div>
        <div class="font-size-control">
          <span class="tool-icon font-size-toggle">Aa</span>
          <div class="font-size-popup">
            <button class="font-size-btn decrease-font">−</button>
            <input type="number" class="font-size-input" min="8" max="24" value="${fontSize}">
            <button class="font-size-btn increase-font">+</button>
          </div>
        </div>
        <button class="action-btn delete-btn" title="Delete Note">🗑</button>
      </div>
    </div>
    <div class="note-resize-handle"></div>
  `;

  // Apply colors and styling with proper transparency
  const actualNoteColor = existingNoteData ? 
    noteColor.replace(/rgba\(([^)]+),\s*[0-9.]+\)/, `rgba($1, ${transparency})`) : 
    noteColor;
  note.style.background = actualNoteColor;
  
  // Add slight random rotation for new notes only
  if (!existingNoteData) {
    const randomRotation = (Math.random() - 0.5) * 4; // -2 to +2 degrees
    note.style.setProperty('--note-rotation', `${randomRotation}deg`);
  }

  document.body.appendChild(note);

  // Apply theme-specific styling
  if (currentTheme.id === 'autumn') {
    note.style.border = '2px solid rgba(220, 38, 38, 0.3)';
    note.style.color = '#451a03';
    note.style.boxShadow = '0 8px 25px rgba(69, 26, 3, 0.2)';
    
    // Update toolbar for autumn theme
    const toolbar = note.querySelector('.note-toolbar') as HTMLElement;
    if (toolbar) {
      toolbar.style.background = 'rgba(69, 26, 3, 0.8)';
      
      const buttons = toolbar.querySelectorAll('button');
      buttons.forEach(button => {
        const btnElement = button as HTMLElement;
        btnElement.style.color = '#fef3c7';
        btnElement.style.background = 'rgba(220, 38, 38, 0.8)';
      });
    }
    
    // Update textarea for autumn theme
    const textarea = note.querySelector('textarea') as HTMLElement;
    if (textarea) {
      textarea.style.color = '#451a03';
      textarea.style.background = 'rgba(255, 255, 255, 0.9)';
    }
  }

  // Position the note
  if (position) {
    note.style.left = position.x + "px";
    note.style.top = position.y + "px";
  } else {
    const widget = document.getElementById("sticky-note-widget");
    if (widget) {
      const widgetRect = widget.getBoundingClientRect();
      note.style.left = Math.max(20, widgetRect.left - 320) + "px";
      note.style.top = Math.max(20, widgetRect.top) + "px";
    } else {
      note.style.left = "100px";
      note.style.top = "100px";
    }
  }

  // Restore size
  if (size) {
    note.style.width = size.width + "px";
    note.style.height = size.height + "px";
  }

  setTimeout(() => note.classList.add("open"), 10);

  // Set current session for new notes
  if (!existingNoteData) {
    currentNoteSession = {
      element: note,
      id: noteId
    };
  }

  // Track open note
  openNotesList.set(noteId, note);

  setupStickyNoteEvents(note, noteId);
  return note;
}

function highlightExistingNote(note: HTMLElement) {
  // Add highlight class
  note.classList.add("highlight");
  
  // Focus the textarea
  const textarea = note.querySelector(".sticky-note-textarea") as HTMLTextAreaElement;
  if (textarea) {
    textarea.focus();
  }

  // Remove highlight after animation
  setTimeout(() => {
    note.classList.remove("highlight");
    note.classList.add("highlight-fade");
    
    setTimeout(() => {
      note.classList.remove("highlight-fade");
    }, 500);
  }, 300);
}

function setupStickyNoteEvents(note: HTMLElement, noteId: string) {
  const header = note.querySelector(".sticky-note-header") as HTMLElement;
  const textarea = note.querySelector(".sticky-note-textarea") as HTMLTextAreaElement;
  const noteTitle = note.querySelector(".note-title") as HTMLElement;
  const closeBtn = note.querySelector(".close-btn");
  const minimizeBtn = note.querySelector(".minimize-btn");
  const pinBtn = note.querySelector(".pin-btn");
  const resizeHandle = note.querySelector(".note-resize-handle") as HTMLElement;
  const transparencySlider = note.querySelector(".transparency-slider") as HTMLInputElement;
  const deleteBtn = note.querySelector(".delete-btn");
  const fontSizeToggle = note.querySelector(".font-size-toggle") as HTMLElement;
  const fontSizePopup = note.querySelector(".font-size-popup") as HTMLElement;
  const increaseFontBtn = note.querySelector(".increase-font") as HTMLElement;
  const decreaseFontBtn = note.querySelector(".decrease-font") as HTMLElement;
  const fontSizeInput = note.querySelector(".font-size-input") as HTMLInputElement;
  const toolbarToggleBtn = note.querySelector(".toolbar-toggle-btn") as HTMLElement;
  const controlsBottom = note.querySelector(".note-controls-bottom") as HTMLElement;

  let isDragging = false;
  let isResizing = false;
  let dragOffset = { x: 0, y: 0 };
  let isPinned = false;
  let isMinimized = false;
  let currentTransparency = parseFloat(transparencySlider.value);
  let currentFontSize = parseInt(fontSizeInput.value);
  let isReadOnly = false;
  let isNewNote = !note.dataset.noteId;
  let currentTitle = noteTitle.textContent || "New Note";
  let noteData = {
    id: noteId,
    title: currentTitle,
    content: textarea.value,
    fontSize: currentFontSize,
    transparency: currentTransparency,
    color: note.style.background,
    position: { x: 0, y: 0 },
    size: { width: 280, height: 180 }
  };

  // Editable title functionality
  let isEditingTitle = false;
  
  noteTitle.addEventListener("click", () => {
    if (isEditingTitle) return;
    
    isEditingTitle = true;
    const input = document.createElement("input");
    input.className = "note-title-input";
    input.value = noteTitle.textContent || "";
    input.maxLength = 20;
    
    noteTitle.replaceWith(input);
    input.focus();
    input.select();
    
    function finishEditing() {
      const newTitle = input.value.trim() || "New Note";
      currentTitle = newTitle;
      noteData.title = newTitle;
      
      const newSpan = document.createElement("span");
      newSpan.className = "note-title";
      newSpan.title = "Click to edit title";
      newSpan.textContent = newTitle;
      
      input.replaceWith(newSpan);
      isEditingTitle = false;
      
      // Re-attach click listener
      newSpan.addEventListener("click", () => setupStickyNoteEvents(note, noteId));
    }
    
    input.addEventListener("blur", finishEditing);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        finishEditing();
      } else if (e.key === "Escape") {
        input.value = currentTitle;
        finishEditing();
      }
    });
  });

  // Set up initial color scheme based on note background with proper transparency
  const baseNoteColor = note.style.background || 'rgba(255, 251, 147, 0.95)';
  // Extract RGB values and apply current transparency
  const rgbMatch = baseNoteColor.match(/rgba?\(([^)]+)\)/);
  const rgbValues = rgbMatch ? rgbMatch[1].split(',').slice(0, 3).join(',') : '255, 251, 147';
  
  const noteColor = `rgba(${rgbValues}, ${currentTransparency})`;
  const baseColor = `rgba(${rgbValues}, ${currentTransparency * 0.8})`;
  const lighterColor = `rgba(${rgbValues}, ${currentTransparency * 0.6})`;
  
  note.style.background = noteColor;
  noteData.color = noteColor;
  note.style.setProperty('--note-bg-80', baseColor);
  note.style.setProperty('--note-bg-60', lighterColor);
  note.style.setProperty('--note-opacity', currentTransparency.toString());

  // Transparency slider functionality
  transparencySlider.addEventListener("input", () => {
    currentTransparency = parseFloat(transparencySlider.value);
    note.style.setProperty('--note-opacity', currentTransparency.toString());
    
    // Update background colors to match transparency using RGB values
    const newBg = `rgba(${rgbValues}, ${currentTransparency})`;
    const new80Bg = `rgba(${rgbValues}, ${currentTransparency * 0.8})`;
    const new60Bg = `rgba(${rgbValues}, ${currentTransparency * 0.6})`;
    
    note.style.background = newBg;
    note.style.setProperty('--note-bg-80', new80Bg);
    note.style.setProperty('--note-bg-60', new60Bg);
    
    noteData.transparency = currentTransparency;
    noteData.color = newBg;
  });



  // Dragging functionality
  header.addEventListener("mousedown", (e) => {
    if ((e.target as HTMLElement).classList.contains("note-control-btn")) return;

    isDragging = true;
    const rect = note.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    // Add smooth cursor and disable transitions during drag
    document.body.style.cursor = "grabbing";
    note.style.transition = "none";
    note.style.userSelect = "none";

    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDrag);
    e.preventDefault();
  });

  function handleDrag(e: MouseEvent) {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Constrain to viewport with padding
    const padding = 10;
    const maxX = window.innerWidth - note.offsetWidth - padding;
    const maxY = window.innerHeight - note.offsetHeight - padding;

    // Use transform for smoother performance
    const constrainedX = Math.max(padding, Math.min(maxX, newX));
    const constrainedY = Math.max(padding, Math.min(maxY, newY));
    
    note.style.left = constrainedX + "px";
    note.style.top = constrainedY + "px";
  }

  function stopDrag() {
    isDragging = false;
    document.body.style.cursor = "";
    note.style.transition = "all 0.3s ease";
    note.style.userSelect = "";
    
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDrag);
  }

  // Resizing functionality with smooth performance
  resizeHandle.addEventListener("mousedown", (e) => {
    isResizing = true;
    note.style.transition = "none"; // Disable transitions during resize
    document.body.style.cursor = "nw-resize";
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
    e.preventDefault();
    e.stopPropagation();
  });

  function handleResize(e: MouseEvent) {
    if (!isResizing) return;

    const rect = note.getBoundingClientRect();
    const newWidth = Math.max(250, Math.min(600, e.clientX - rect.left));
    const newHeight = Math.max(180, Math.min(500, e.clientY - rect.top));

    // Use requestAnimationFrame for smoother resizing
    requestAnimationFrame(() => {
      note.style.width = newWidth + "px";
      note.style.height = newHeight + "px";
    });
  }

  function stopResize() {
    isResizing = false;
    document.body.style.cursor = "";
    note.style.transition = "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"; // Re-enable transitions
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
  }

  // Control buttons
  closeBtn?.addEventListener("click", () => {
    // Remove from tracking
    openNotesList.delete(noteId);
    
    // Save before closing if there's content and it's a new note
    if (textarea.value.trim() && !isReadOnly && isNewNote) {
      saveNoteData();
    }
    
    // Keep session active - don't clear currentNoteSession for new notes
    note.classList.remove("open");
    setTimeout(() => note.remove(), 300);
  });

  minimizeBtn?.addEventListener("click", () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      // Store current size before minimizing
      noteData.size.width = note.offsetWidth;
      noteData.size.height = note.offsetHeight;
      
      note.classList.add("minimized");
      note.style.height = "36px"; // Just header height
      note.style.minHeight = "36px";
      (minimizeBtn as HTMLElement).textContent = "+";
      (minimizeBtn as HTMLElement).title = "Restore";
    } else {
      note.classList.remove("minimized");
      // Restore previous size
      note.style.height = noteData.size.height + "px";
      note.style.minHeight = "180px";
      (minimizeBtn as HTMLElement).textContent = "−";
      (minimizeBtn as HTMLElement).title = "Minimize";
    }
  });

  pinBtn?.addEventListener("click", () => {
    isPinned = !isPinned;
    if (isPinned) {
      note.classList.add("pinned");
      note.style.zIndex = "999999"; // Higher z-index for pinned notes
      (pinBtn as HTMLElement).classList.add("pinned");
      (pinBtn as HTMLElement).title = "Unpin note";
    } else {
      note.classList.remove("pinned");
      note.style.zIndex = "999997"; // Normal z-index
      (pinBtn as HTMLElement).classList.remove("pinned");
      (pinBtn as HTMLElement).title = "Pin note (always on top)";
    }
  });

  // Font size controls
  fontSizeToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    fontSizePopup.classList.toggle("active");
  });

  // Close font popup when clicking outside
  document.addEventListener("click", (e) => {
    if (!fontSizePopup.contains(e.target as Node) && !fontSizeToggle.contains(e.target as Node)) {
      fontSizePopup.classList.remove("active");
    }
  });

  function updateFontSize(newSize: number) {
    if (newSize >= 8 && newSize <= 24) {
      currentFontSize = newSize;
      textarea.style.fontSize = currentFontSize + "px";
      fontSizeInput.value = currentFontSize.toString();
      noteData.fontSize = currentFontSize;
    }
  }

  increaseFontBtn?.addEventListener("click", () => {
    updateFontSize(currentFontSize + 1);
  });

  decreaseFontBtn?.addEventListener("click", () => {
    updateFontSize(currentFontSize - 1);
  });

  // Direct font size input
  fontSizeInput?.addEventListener("input", () => {
    const newSize = parseInt(fontSizeInput.value);
    if (!isNaN(newSize)) {
      updateFontSize(newSize);
    }
  });

  fontSizeInput?.addEventListener("blur", () => {
    // Ensure valid range on blur
    const currentVal = parseInt(fontSizeInput.value);
    if (isNaN(currentVal) || currentVal < 8) {
      updateFontSize(8);
    } else if (currentVal > 24) {
      updateFontSize(24);
    }
  });

  // Toolbar toggle functionality
  let isToolbarHidden = false;
  toolbarToggleBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    isToolbarHidden = !isToolbarHidden;
    if (isToolbarHidden) {
      controlsBottom.classList.add("collapsed");
      toolbarToggleBtn.innerHTML = "&gt;";
      toolbarToggleBtn.title = "Show toolbar";
    } else {
      controlsBottom.classList.remove("collapsed");
      toolbarToggleBtn.innerHTML = "&lt;";
      toolbarToggleBtn.title = "Hide toolbar";
    }
  });

  // Delete button
  deleteBtn?.addEventListener("click", async () => {
    if (confirm("Delete this note?")) {
      // Remove from tracking
      openNotesList.delete(noteId);
      // Clear session if this is the current note
      if (currentNoteSession && currentNoteSession.id === noteId) {
        currentNoteSession = null;
      }
      
      // Delete from storage if it's a saved note
      if (!isNewNote) {
        await deleteNote(noteId);
      }
      
      note.classList.remove("open");
      setTimeout(() => note.remove(), 200);
    }
  });

  // Improved auto-save functionality to prevent duplicate notes
  let saveTimeout: NodeJS.Timeout;
  let lastSavedContent = textarea.value;
  
  function saveNoteData() {
    const currentContent = textarea.value.trim();
    noteData.content = currentContent;
    
    // Update position and size
    const rect = note.getBoundingClientRect();
    noteData.position = { x: rect.left, y: rect.top };
    noteData.size = { width: note.offsetWidth, height: note.offsetHeight };
    
    if (isNewNote && currentContent) {
      // For new notes, save for the first time
      saveCompleteNote(noteData);
      isNewNote = false;
      note.dataset.noteId = noteData.id;
    } else if (!isNewNote && currentContent !== lastSavedContent) {
      // For existing notes, update only if content changed
      updateCompleteNote(noteData);
    }
    
    lastSavedContent = currentContent;
  }
  
  textarea.addEventListener("input", () => {
    if (!isReadOnly) {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveNoteData, 2000); // Increased timeout to reduce saves
    }
  });

  // Save when note is closed or minimized
  const saveOnClose = () => {
    if (textarea.value.trim() && !isReadOnly) {
      saveNoteData();
    }
  };

  // Save when closing or losing focus
  note.addEventListener("blur", saveOnClose);
  window.addEventListener("beforeunload", saveOnClose);
}

// Global variables for panel management
let notesPanel: HTMLElement | null = null;
let panelAutoCloseTimeout: NodeJS.Timeout | null = null;
let panelCheckInactivity: (() => void) | null = null;

function toggleNotesPanel() {
  if (!notesPanel) {
    notesPanel = document.createElement("div");
    notesPanel.className = "notes-panel";
    notesPanel.innerHTML = `
      <div class="notes-header">
        📋 Recent Notes
        <button class="panel-close-btn" title="Close panel">×</button>
      </div>
      <div class="notes-list" id="notes-list"></div>
    `;
    document.body.appendChild(notesPanel);
    refreshNotesList();

    // Add close button functionality
    const closeBtn = notesPanel.querySelector(".panel-close-btn");
    closeBtn?.addEventListener("click", () => {
      if (notesPanel) {
        notesPanel.classList.remove("open");
      }
      if (panelAutoCloseTimeout) {
        clearTimeout(panelAutoCloseTimeout);
        panelAutoCloseTimeout = null;
      }
    });

    // Add auto-close behavior with mouse activity tracking
    let lastActivity = Date.now();
    
    const resetActivity = () => {
      lastActivity = Date.now();
    };
    
    notesPanel.addEventListener("mouseenter", resetActivity);
    notesPanel.addEventListener("mousemove", resetActivity);
    notesPanel.addEventListener("click", resetActivity);
    
    // Check for inactivity every second
    panelCheckInactivity = () => {
      if (notesPanel && notesPanel.classList.contains("open")) {
        const inactiveTime = Date.now() - lastActivity;
        if (inactiveTime >= 6000) { // 6 seconds
          notesPanel.classList.remove("open");
          if (panelAutoCloseTimeout) {
            clearTimeout(panelAutoCloseTimeout);
            panelAutoCloseTimeout = null;
          }
        } else {
          panelAutoCloseTimeout = setTimeout(panelCheckInactivity!, 1000);
        }
      }
    };
  }

  notesPanel.classList.toggle("open");

  if (notesPanel.classList.contains("open")) {
    refreshNotesList();
    // Start auto-close timer
    if (panelAutoCloseTimeout) {
      clearTimeout(panelAutoCloseTimeout);
    }
    panelAutoCloseTimeout = setTimeout(panelCheckInactivity!, 1000);
  }
}

function openSettingsModal() {
  const modal = document.createElement("div");
  modal.className = "sticky-modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">⚙️ Settings</h3>
        <button class="modal-close">×</button>
      </div>
      <div style="line-height: 1.6; color: #000000;">
        <h4 style="color: #000000; text-shadow: 0 1px 2px rgba(250, 235, 146, 0.8);">🎮 Keyboard Shortcuts</h4>
        <p><strong>Alt + Shift + N:</strong> Create new note</p>
        <p><strong>Alt + Shift + W:</strong> Toggle widget visibility</p>
        <p><strong>ESC:</strong> Close modals</p>
        
        <h4 style="margin-top: 25px; color: #000000; text-shadow: 0 1px 2px rgba(250, 235, 146, 0.8);">ℹ️ About</h4>
        <p><strong>StickyNoteAI v2.3</strong></p>
        <p>Smart floating notes for any webpage</p>
        
        <h4 style="margin-top: 25px; color: #000000; text-shadow: 0 1px 2px rgba(250, 235, 146, 0.8);">🎯 Usage Tips</h4>
        <p>• Hover over the ✨ button to see menu</p>
        <p>• Click and drag to move the widget</p>
        <p>• Use keyboard shortcuts for quick access</p>
        <p>• Notes auto-save as you type</p>
        <p>• Pin notes to keep them visible</p>
      </div>
      <div class="button-group">
        <button class="btn btn-secondary close-settings">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("open"), 10);

  function closeModal() {
    modal.classList.remove("open");
    setTimeout(() => modal.remove(), 300);
  }

  modal.querySelector(".modal-close")?.addEventListener("click", closeModal);
  modal.querySelector(".close-settings")?.addEventListener("click", closeModal);
}

function hideWidget() {
  if (widget) {
    widget.style.display = "none";
  }
  // Hide all sticky notes
  const stickyNotes = document.querySelectorAll(".sticky-note");
  stickyNotes.forEach((note) => {
    (note as HTMLElement).style.display = "none";
  });
}

function showWidget() {
  if (widget) {
    widget.style.display = "block";
  }
  // Show all sticky notes
  const stickyNotes = document.querySelectorAll(".sticky-note");
  stickyNotes.forEach((note) => {
    (note as HTMLElement).style.display = "block";
  });
}

function isWidgetVisible(): boolean {
  if (!widget) return false;

  // Check if display is explicitly set to none
  if (widget.style.display === "none") return false;

  // Check computed style if style.display is not set
  const computedStyle = window.getComputedStyle(widget);
  return computedStyle.display !== "none";
}

async function saveNote(content: string) {
  try {
    const result = await browser.storage.local.get("stickyNotes");
    const notes = result.stickyNotes || [];

    const newNote = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    notes.unshift(newNote);

    // Keep only last 50 notes
    if (notes.length > 50) {
      notes.splice(50);
    }

    await browser.storage.local.set({ stickyNotes: notes });
    console.log("Note saved successfully");
  } catch (error) {
    console.error("Error saving note:", error);
  }
}

// Enhanced note saving with complete data
async function saveCompleteNote(noteData: any) {
  try {
    const result = await browser.storage.local.get("stickyNotes");
    const notes = result.stickyNotes || [];

    // Check if note already exists to prevent duplicates
    const existingIndex = notes.findIndex((note: any) => note.id === noteData.id);
    
    const completeNote = {
      id: noteData.id,
      title: noteData.title,
      content: noteData.content,
      fontSize: noteData.fontSize,
      transparency: noteData.transparency,
      color: noteData.color,
      position: noteData.position,
      size: noteData.size,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    if (existingIndex !== -1) {
      // Update existing note
      notes[existingIndex] = completeNote;
    } else {
      // Add new note
      notes.unshift(completeNote);
    }

    // Keep only last 50 notes
    if (notes.length > 50) {
      notes.splice(50);
    }

    await browser.storage.local.set({ stickyNotes: notes });
    console.log("Complete note saved successfully");
    
    // Immediately refresh the notes panel if it's open
    const notesPanel = document.querySelector(".notes-panel.open");
    if (notesPanel) {
      refreshNotesList();
    }
  } catch (error) {
    console.error("Error saving complete note:", error);
  }
}

// Update existing note with complete data
async function updateCompleteNote(noteData: any) {
  try {
    const result = await browser.storage.local.get("stickyNotes");
    const notes = result.stickyNotes || [];

    const noteIndex = notes.findIndex((note: any) => note.id === noteData.id);
    if (noteIndex !== -1) {
      // Update existing note
      notes[noteIndex] = {
        ...notes[noteIndex],
        title: noteData.title,
        content: noteData.content,
        fontSize: noteData.fontSize,
        transparency: noteData.transparency,
        color: noteData.color,
        position: noteData.position,
        size: noteData.size,
        timestamp: new Date().toISOString(),
      };
    } else {
      // If not found, create new note
      await saveCompleteNote(noteData);
      return;
    }

    await browser.storage.local.set({ stickyNotes: notes });
    console.log("Complete note updated successfully");
    
    // Immediately refresh the notes panel if it's open
    const notesPanel = document.querySelector(".notes-panel.open");
    if (notesPanel) {
      refreshNotesList();
    }
  } catch (error) {
    console.error("Error updating complete note:", error);
  }
}

async function refreshNotesList() {
  const notesList = document.getElementById("notes-list");
  if (!notesList) return;

  try {
    const result = await browser.storage.local.get("stickyNotes");
    const notes = result.stickyNotes || [];

    // Remove duplicates based on ID (keep the most recent)
    const uniqueNotes = notes.filter((note: any, index: number, arr: any[]) => 
      arr.findIndex((n: any) => n.id === note.id) === index
    );

    if (uniqueNotes.length === 0) {
      notesList.innerHTML =
        '<div style="padding: 20px; text-align: center; color: #000000; font-weight: 500;">📝 No notes yet<br><small style="color: #9929EA;">Create your first note!</small></div>';
      return;
    }

    notesList.innerHTML = uniqueNotes
      .slice(0, 10)
      .map(
        (note: any) => `
      <div class="note-item" data-note-id="${note.id}">
        <div class="note-title-display">${note.title || (note.content.length > 20 ? note.content.substring(0, 20) + "..." : note.content) || "Untitled"}</div>
        <div class="note-preview">${note.content.substring(0, 80)}${note.content.length > 80 ? "..." : ""}</div>
        <div class="note-date">${new Date(note.timestamp).toLocaleDateString()}</div>
      </div>
    `
      )
      .join("");

    // Click to edit note
    notesList.querySelectorAll(".note-item").forEach((item) => {
      item.addEventListener("click", () => {
        const noteId = (item as HTMLElement).dataset.noteId;
        const note = uniqueNotes.find((n: any) => n.id === noteId);
        if (note) {
          // Open the note for editing
          openNoteForEditing(note);
        }
      });
    });
  } catch (error) {
    console.error("Error loading notes:", error);
  }
}



function openNoteForEditing(note: any) {
  // Check if note is already open
  if (openNotesList.has(note.id)) {
    const existingNote = openNotesList.get(note.id);
    if (existingNote && document.body.contains(existingNote)) {
      highlightExistingNote(existingNote);
      return;
    } else {
      // Remove stale reference
      openNotesList.delete(note.id);
    }
  }

  // Use the unified createStickyNote function with existing note data
  const stickyNote = createStickyNote(note.content, note);
  
  // Add the existing note ID to the sticky note for updating
  stickyNote.dataset.noteId = note.id;
  
  // Add read-only button for edited notes
  const toolbar = stickyNote.querySelector(".note-toolbar") as HTMLElement;
  const readOnlyBtn = document.createElement("button");
  readOnlyBtn.className = "action-btn read-only-btn";
  readOnlyBtn.title = "Lock/Unlock Note";
  readOnlyBtn.innerHTML = "🔒"; // Lock icon
  
  // Insert read-only button before delete button
  const deleteBtn = stickyNote.querySelector(".delete-btn");
  if (deleteBtn && toolbar) {
    toolbar.insertBefore(readOnlyBtn, deleteBtn);
  }

  // Handle read-only toggle
  const editTextarea = stickyNote.querySelector(".sticky-note-textarea") as HTMLTextAreaElement;
  let isReadOnly = false;
  
  readOnlyBtn.addEventListener("click", () => {
    isReadOnly = !isReadOnly;
    editTextarea.readOnly = isReadOnly;
    
    if (isReadOnly) {
      readOnlyBtn.classList.add("active");
      readOnlyBtn.innerHTML = "🔓"; // Unlock icon
      readOnlyBtn.title = "Enable Editing";
      editTextarea.style.opacity = "0.7";
      editTextarea.style.cursor = "default";
    } else {
      readOnlyBtn.classList.remove("active");
      readOnlyBtn.innerHTML = "🔒"; // Lock icon
      readOnlyBtn.title = "Lock Note";
      editTextarea.style.opacity = "1";
      editTextarea.style.cursor = "text";
    }
  });

  // Update delete button functionality
  if (deleteBtn) {
    const newDeleteBtn = deleteBtn.cloneNode(true);
    deleteBtn.parentNode?.replaceChild(newDeleteBtn, deleteBtn);
    
    newDeleteBtn.addEventListener("click", async () => {
      if (isReadOnly) {
        alert("Cannot delete note in read-only mode. Click the lock icon to enable editing.");
        return;
      }
      
      if (confirm("Delete this note?")) {
        // Delete from storage (this will also refresh the notes list)
        await deleteNote(note.id);
        // Remove from tracking
        openNotesList.delete(note.id);
        // Clear current session if this note is deleted
        if (currentNoteSession && currentNoteSession.id === note.id) {
          currentNoteSession = null;
        }
        stickyNote.classList.remove("open");
        setTimeout(() => stickyNote.remove(), 200);
      }
    });
  }
  
  // Auto-save functionality for existing notes
  let saveTimeout: any;
  editTextarea.addEventListener("input", () => {
    if (!isReadOnly) {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(async () => {
        const content = editTextarea.value.trim();
        if (content && note.id) {
          await updateNote(note.id, content);
          refreshNotesList();
        }
      }, 1000);
    }
  });
}

async function updateNote(noteId: string, newContent: string) {
  try {
    const result = await browser.storage.local.get("stickyNotes");
    const notes = result.stickyNotes || [];

    const noteIndex = notes.findIndex((note: any) => note.id === noteId);
    if (noteIndex !== -1) {
      notes[noteIndex].content = newContent;
      notes[noteIndex].timestamp = new Date().toISOString();
      await browser.storage.local.set({ stickyNotes: notes });
    }
  } catch (error) {
    console.error("Error updating note:", error);
  }
}

async function deleteNote(noteId: string) {
  try {
    const result = await browser.storage.local.get("stickyNotes");
    const notes = result.stickyNotes || [];

    const filteredNotes = notes.filter((note: any) => note.id !== noteId);
    await browser.storage.local.set({ stickyNotes: filteredNotes });
    
    // Immediately refresh the notes panel if it's open
    const notesPanel = document.querySelector(".notes-panel.open");
    if (notesPanel) {
      refreshNotesList();
    }
  } catch (error) {
    console.error("Error deleting note:", error);
  }
}

function setupKeyboardShortcuts() {
  let shortcutTimeout: NodeJS.Timeout;
  
  // Improved keyboard shortcut handlers
  document.addEventListener("keydown", (e) => {
    // Prevent multiple rapid triggers
    if (shortcutTimeout) return;
    
    // Use Alt+Shift combinations to avoid conflicts with browser shortcuts
    if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey) {
      if (e.code === "KeyN") {
        // Alt+Shift+N: Create new note or focus existing
        e.preventDefault();
        e.stopPropagation();
        console.log("StickyNoteAI: Alt+Shift+N pressed - Creating/focusing note");
        
        shortcutTimeout = setTimeout(() => {
          createNoteEditor();
          shortcutTimeout = null as any;
        }, 100);
        
      } else if (e.code === "KeyW") {
        // Alt+Shift+W: Toggle widget visibility
        e.preventDefault();
        e.stopPropagation();
        console.log("StickyNoteAI: Alt+Shift+W pressed - Toggling widget visibility");
        
        shortcutTimeout = setTimeout(() => {
          if (isWidgetVisible()) {
            hideWidget();
          } else {
            showWidget();
          }
          shortcutTimeout = null as any;
        }, 100);
      }
    }

    // ESC key to close modals and notes
    if (e.code === "Escape" && !e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      // Close any font size popups first
      const openPopup = document.querySelector(".font-size-popup.active");
      if (openPopup) {
        e.preventDefault();
        openPopup.classList.remove("active");
        return;
      }

      // Close any open modals
      const openModal = document.querySelector(".sticky-modal.open");
      if (openModal) {
        e.preventDefault();
        openModal.classList.remove("open");
        setTimeout(() => openModal.remove(), 300);
        return;
      }

      // Close notes panel
      const notesPanel = document.querySelector(".notes-panel.open");
      if (notesPanel) {
        e.preventDefault();
        notesPanel.classList.remove("open");
        return;
      }

      // Close widget menu
      if (isMenuOpen) {
        e.preventDefault();
        closeMenu();
        return;
      }

      // Close all sticky notes
      const openNotes = document.querySelectorAll(".sticky-note.open");
      if (openNotes.length > 0) {
        e.preventDefault();
        openNotes.forEach(note => {
          const element = note as HTMLElement;
          element.classList.remove("open");
          setTimeout(() => element.remove(), 300);
        });
        currentNoteSession = null;
        return;
      }
    }
  });

  console.log("StickyNoteAI: Enhanced keyboard shortcuts initialized (Alt+Shift+N, Alt+Shift+W, Esc)");
}

function setupMessageListener() {
  function applyThemeToNotes(themeId: string, theme: any) {
    console.log("StickyNoteAI: Applying theme:", themeId);
    
    // Apply theme to all existing sticky notes
    const notes = document.querySelectorAll('.sticky-note');
    notes.forEach((note, index) => {
      const noteElement = note as HTMLElement;
      
      if (themeId === 'default') {
        // Reset to default colors
        noteElement.style.removeProperty('background');
        noteElement.style.removeProperty('border');
        noteElement.style.removeProperty('color');
      } else if (theme && theme.colors) {
        // Apply theme colors
        const colorIndex = index % theme.colors.noteColors.length;
        noteElement.style.background = theme.colors.noteColors[colorIndex];
        
        // Apply autumn theme specific styling
        if (themeId === 'autumn') {
          noteElement.style.border = '2px solid rgba(220, 38, 38, 0.3)';
          noteElement.style.color = '#451a03';
          noteElement.style.boxShadow = '0 8px 25px rgba(69, 26, 3, 0.2)';
          
          // Update toolbar buttons for autumn theme
          const toolbar = noteElement.querySelector('.note-toolbar');
          if (toolbar) {
            const toolbarElement = toolbar as HTMLElement;
            toolbarElement.style.background = 'rgba(69, 26, 3, 0.8)';
            
            const buttons = toolbar.querySelectorAll('button');
            buttons.forEach(button => {
              const btnElement = button as HTMLElement;
              btnElement.style.color = '#fef3c7';
              btnElement.style.background = 'rgba(220, 38, 38, 0.8)';
            });
          }
          
          // Update textarea for autumn theme
          const textarea = noteElement.querySelector('textarea');
          if (textarea) {
            const textareaElement = textarea as HTMLElement;
            textareaElement.style.color = '#451a03';
            textareaElement.style.background = 'rgba(255, 255, 255, 0.9)';
          }
        }
      }
    });
    
    // Store current theme for new notes
    currentTheme = { id: themeId, data: theme };
  }

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("StickyNoteAI: Received message:", message);

    // Handle keyboard shortcut commands from background script
    if (message.action === "toggle-widget") {
      console.log("StickyNoteAI: Toggle widget command received");

      if (isWidgetVisible()) {
        console.log("StickyNoteAI: Hiding widget");
        hideWidget();
      } else {
        console.log("StickyNoteAI: Showing widget");
        showWidget();
      }

      sendResponse({ success: true });
      return;
    }

    if (message.action === "new-note") {
      createNoteEditor();
      sendResponse({ success: true });
      return;
    }

    // Handle context menu note creation with selected text
    if (message.action === "create-note-with-selection") {
      createNoteEditor(message.selectedText || "");
      sendResponse({ success: true });
      return;
    }

    if (message.action === "toggleStealth") {
      // Handle stealth mode toggle from popup
      const widget = document.getElementById("sticky-note-widget");
      if (widget) {
        if (message.enabled) {
          widget.style.opacity = "0.3";
        } else {
          widget.style.opacity = "1";
        }
      }
      sendResponse({ success: true });
      return;
    }

    if (message.action === "changeTheme") {
      // Apply theme to content script elements
      applyThemeToNotes(message.themeId, message.theme);
      sendResponse({ success: true });
      return;
    }

    sendResponse({ success: false, error: "Unknown action" });
  });
}

async function saveWidgetPosition() {
  if (!widget) return;

  const rect = widget.getBoundingClientRect();
  const position = {
    x: rect.left,
    y: rect.top,
  };

  try {
    await browser.storage.local.set({ widgetPosition: position });
  } catch (error) {
    console.error("Error saving position:", error);
  }
}

async function loadWidgetPosition() {
  if (!widget) return;

  // Reset to default position on page refresh
  // The widget will use the default CSS position (top: 50px, right: 50px)
  widget.style.left = "";
  widget.style.top = "";
  widget.style.transform = "";

  // Clear any saved position
  try {
    await browser.storage.local.remove("widgetPosition");
  } catch (error) {
    console.error("Error clearing position:", error);
  }
}

function deleteNoteDirectly(note: any) {
  if (confirm("Are you sure you want to delete this note?")) {
    deleteNote(note.id);
    refreshNotesList();
  }
}


