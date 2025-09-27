var content = function() {
  "use strict";var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  var _a, _b;
  function defineContentScript(definition2) {
    return definition2;
  }
  const browser$1 = ((_b = (_a = globalThis.browser) == null ? void 0 : _a.runtime) == null ? void 0 : _b.id) ? globalThis.browser : globalThis.chrome;
  const browser = browser$1;
  const definition = defineContentScript({
    matches: ["<all_urls>"],
    main() {
      console.log("🎯 StickyNoteAI v2.2 CSS FIXED + MENU POSITIONING - Loading...");
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          initializeWidget();
        });
      } else {
        initializeWidget();
      }
    }
  });
  let widget = null;
  let isDragging = false;
  let isMenuOpen = false;
  let dragOffset = { x: 0, y: 0 };
  let lastPosition = { x: 0, y: 0 };
  let menuCloseTimeout = null;
  let globalSmilyFaceUrl;
  function initializeWidget() {
    console.log("StickyNoteAI: DOM ready, creating widget...");
    createFloatingWidget();
    loadWidgetPosition();
    setupKeyboardShortcuts();
    setupMessageListener();
  }
  function createFloatingWidget() {
    const existingWidget = document.getElementById("sticky-note-widget");
    if (existingWidget) {
      existingWidget.remove();
    }
    widget = document.createElement("div");
    widget.id = "sticky-note-widget";
    let smilyFaceUrl;
    let add2Url;
    try {
      smilyFaceUrl = browser.runtime.getURL("smilyface.gif");
      globalSmilyFaceUrl = smilyFaceUrl;
      add2Url = browser.runtime.getURL("add2.png");
    } catch (error) {
      console.warn("browser.runtime.getURL failed, using fallback approach:", error);
      const extensionId = browser.runtime.id || chrome.runtime.id;
      smilyFaceUrl = `chrome-extension://${extensionId}/smilyface.gif`;
      globalSmilyFaceUrl = smilyFaceUrl;
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
      outline: none;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 13px;
      color: #333;
      line-height: 1.5;
      placeholder-color: rgba(0, 0, 0, 0.4);
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
    
    .note-preview {
      color: #374151;
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .note-date {
      font-size: 11px;
      color: #9ca3af;
      font-weight: 400;
    }

    /* Action Buttons Redesigned */
    .action-btn {
      padding: 6px 8px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.05);
      color: rgba(0, 0, 0, 0.7);
      min-width: 32px;
      height: 32px;
    }

    .action-btn:hover {
      background: rgba(0, 0, 0, 0.1);
      color: rgba(0, 0, 0, 0.9);
      transform: scale(1.05);
    }

    .action-btn.read-only-btn {
      background: rgba(108, 117, 125, 0.15);
      color: rgba(108, 117, 125, 0.8);
    }

    .action-btn.read-only-btn.active {
      background: rgba(108, 117, 125, 0.3);
      color: rgba(108, 117, 125, 1);
    }

    .action-btn.delete-btn {
      background: rgba(220, 53, 69, 0.1);
      color: rgba(220, 53, 69, 0.8);
    }

    .action-btn.delete-btn:hover {
      background: rgba(220, 53, 69, 0.2);
      color: rgba(220, 53, 69, 1);
    }

    /* Note Controls Bottom - Integrated Design */
    .note-controls-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--note-bg-80, rgba(255, 251, 147, 0.8));
      border-radius: 0 0 6px 6px;
      flex-shrink: 0;
      gap: 12px;
    }

    .note-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    /* Transparency Control */
    .transparency-control {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tool-icon {
      font-size: 16px;
      color: rgba(0, 0, 0, 0.7);
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 4px;
      border-radius: 4px;
    }

    .tool-icon:hover {
      color: rgba(0, 0, 0, 0.9);
      background: rgba(0, 0, 0, 0.1);
    }

    .transparency-slider {
      width: 80px;
      height: 6px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.15);
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }

    .transparency-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }

    .transparency-slider::-webkit-slider-thumb:hover {
      background: rgba(0, 0, 0, 0.8);
      transform: scale(1.1);
    }

    .transparency-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    /* Font Size Control */
    .font-size-control {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .font-size-popup {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      padding: 8px;
      display: none;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 4px;
      z-index: 1000;
    }

    .font-size-popup.active {
      display: flex;
    }

    .font-size-btn {
      width: 24px;
      height: 24px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      color: rgba(0, 0, 0, 0.7);
      transition: all 0.2s ease;
    }

    .font-size-btn:hover {
      background: rgba(0, 0, 0, 0.1);
      color: rgba(0, 0, 0, 0.9);
    }

    .font-size-display {
      min-width: 30px;
      text-align: center;
      font-size: 12px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
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
    const smileyImage = document.getElementById("smiley-image");
    const addImage = document.getElementById("add-image");
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
    function constrainToBounds(x, y) {
      if (!widget) return { x, y };
      const widgetRect = { width: 50, height: 50 };
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const margin = 10;
      let constrainedX = Math.max(margin, x);
      constrainedX = Math.min(windowWidth - widgetRect.width - margin, constrainedX);
      let constrainedY = Math.max(margin, y);
      constrainedY = Math.min(windowHeight - widgetRect.height - margin, constrainedY);
      return { x: constrainedX, y: constrainedY };
    }
    function snapToNearestEdge(x, y) {
      if (!widget) return { x, y };
      const widgetRect = { width: 50, height: 50 };
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const snapMargin = 20;
      const distanceToLeft = x;
      const distanceToRight = windowWidth - (x + widgetRect.width);
      const distanceToTop = y;
      const distanceToBottom = windowHeight - (y + widgetRect.height);
      const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);
      let snappedX = x;
      let snappedY = y;
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
    mainButton.addEventListener("mousedown", (e) => {
      e.preventDefault();
      dragStartTime = Date.now();
      startPosition = { x: e.clientX, y: e.clientY };
      hasMovedWhileDragging = false;
      const rect = widget.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      mainButton.classList.add("dragging");
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    });
    mainButton.addEventListener("mouseenter", () => {
      if (!isDragging) {
        if (menuCloseTimeout) {
          clearTimeout(menuCloseTimeout);
          menuCloseTimeout = null;
        }
        openMenu();
      }
    });
    menu.addEventListener("mouseenter", () => {
      if (menuCloseTimeout) {
        clearTimeout(menuCloseTimeout);
        menuCloseTimeout = null;
      }
    });
    menu.addEventListener("mouseleave", () => {
      if (!isDragging) {
        menuCloseTimeout = setTimeout(() => {
          closeMenu();
          menuCloseTimeout = null;
        }, 100);
      }
    });
    mainButton.addEventListener("mouseleave", (e) => {
      if (!isDragging) {
        const rect = menu.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const isNearMenu = mouseX >= rect.left - 10 && mouseX <= rect.right + 10 && mouseY >= rect.top - 10 && mouseY <= rect.bottom + 10;
        if (!isNearMenu) {
          menuCloseTimeout = setTimeout(() => {
            closeMenu();
            menuCloseTimeout = null;
          }, 100);
        }
      }
    });
    function handleMouseMove(e) {
      const timeDiff = Date.now() - dragStartTime;
      const distance = Math.sqrt(Math.pow(e.clientX - startPosition.x, 2) + Math.pow(e.clientY - startPosition.y, 2));
      if (!isDragging && (distance > 3 || timeDiff > 100)) {
        isDragging = true;
        hasMovedWhileDragging = true;
        closeMenu();
        document.body.style.cursor = "grabbing";
      }
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        const constrainedPosition = constrainToBounds(newX, newY);
        widget.style.transform = `translate(${constrainedPosition.x}px, ${constrainedPosition.y}px)`;
        widget.style.left = "0";
        widget.style.top = "0";
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
        const snappedPosition = snapToNearestEdge(lastPosition.x, lastPosition.y);
        if (snappedPosition.x !== lastPosition.x || snappedPosition.y !== lastPosition.y) {
          widget.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
          widget.style.left = snappedPosition.x + "px";
          widget.style.top = snappedPosition.y + "px";
          widget.style.transform = "";
          setTimeout(() => {
            if (widget) {
              widget.style.transition = "";
            }
          }, 300);
          lastPosition = snappedPosition;
        } else {
          widget.style.left = lastPosition.x + "px";
          widget.style.top = lastPosition.y + "px";
          widget.style.transform = "";
        }
        saveWidgetPosition();
      }
      isDragging = false;
      setTimeout(() => {
        if (!hasMovedWhileDragging) {
          openMenu();
        }
      }, 50);
    }
    let lastClickTime = 0;
    menu == null ? void 0 : menu.addEventListener("click", (e) => {
      const target = e.target;
      const action = target.dataset.action;
      const now = Date.now();
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
    const widget2 = document.getElementById("sticky-note-widget");
    if (menu && widget2) {
      const widgetRect = widget2.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isInLowerHalf = widgetRect.top > windowHeight / 2;
      if (isInLowerHalf) {
        menu.classList.add("top-positioned");
      } else {
        menu.classList.remove("top-positioned");
      }
      menu.classList.add("open");
      isMenuOpen = true;
    }
  }
  function closeMenu() {
    const menu = document.getElementById("widget-menu");
    if (menu) {
      menu.classList.remove("open");
      isMenuOpen = false;
    }
    if (menuCloseTimeout) {
      clearTimeout(menuCloseTimeout);
      menuCloseTimeout = null;
    }
  }
  function handleMenuAction(action) {
    console.log("Menu action triggered:", action);
    closeMenu();
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
  function createNoteEditor(initialText = "") {
    const stickyNote = createStickyNote(initialText);
    setTimeout(() => {
      const textarea = stickyNote.querySelector(".sticky-note-textarea");
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 100);
  }
  function createStickyNote(content2 = "") {
    const noteId = Date.now().toString();
    const note = document.createElement("div");
    note.className = "sticky-note";
    note.id = `sticky-note-${noteId}`;
    const stickyColors = [
      "rgba(255, 251, 147, 0.95)",
      // Classic yellow
      "rgba(255, 237, 213, 0.95)",
      // Light peach
      "rgba(237, 255, 235, 0.95)",
      // Light green
      "rgba(235, 245, 255, 0.95)",
      // Light blue
      "rgba(255, 235, 255, 0.95)",
      // Light pink
      "rgba(255, 243, 205, 0.95)",
      // Light orange
      "rgba(243, 235, 255, 0.95)"
      // Light purple
    ];
    const randomColor = stickyColors[Math.floor(Math.random() * stickyColors.length)];
    note.innerHTML = `
    <div class="sticky-note-header">
      <span class="note-title">Sticky Note...</span>
      <div class="note-controls">
        <button class="note-control-btn pin-btn" title="Pin note (always on top)">📌</button>
        <button class="note-control-btn minimize-btn" title="Minimize">−</button>
        <button class="note-control-btn close-btn" title="Close">×</button>
      </div>
    </div>
    <textarea class="sticky-note-textarea" placeholder="Write your note here..." style="font-size: 13px;">${content2}</textarea>
    <div class="note-controls-bottom">
      <div class="note-toolbar">
        <div class="transparency-control">
          <span class="tool-icon">👁️</span>
          <input type="range" class="transparency-slider" min="0.3" max="1" step="0.1" value="0.95">
        </div>
        <div class="font-size-control">
          <span class="tool-icon font-size-toggle">Aa</span>
          <div class="font-size-popup">
            <button class="font-size-btn decrease-font">−</button>
            <span class="font-size-display">13</span>
            <button class="font-size-btn increase-font">+</button>
          </div>
        </div>
      </div>
      <div class="note-actions">
        <button class="action-btn delete-btn" title="Delete Note">🗑️</button>
      </div>
    </div>
    <div class="note-resize-handle"></div>
  `;
    note.style.background = randomColor;
    const randomRotation = (Math.random() - 0.5) * 4;
    note.style.setProperty("--note-rotation", `${randomRotation}deg`);
    document.body.appendChild(note);
    const widget2 = document.getElementById("sticky-note-widget");
    if (widget2) {
      const widgetRect = widget2.getBoundingClientRect();
      note.style.left = Math.max(20, widgetRect.left - 320) + "px";
      note.style.top = Math.max(20, widgetRect.top) + "px";
    } else {
      note.style.left = "100px";
      note.style.top = "100px";
    }
    setTimeout(() => note.classList.add("open"), 10);
    setupStickyNoteEvents(note);
    return note;
  }
  function setupStickyNoteEvents(note, noteId) {
    const header = note.querySelector(".sticky-note-header");
    const textarea = note.querySelector(".sticky-note-textarea");
    const closeBtn = note.querySelector(".close-btn");
    const minimizeBtn = note.querySelector(".minimize-btn");
    const pinBtn = note.querySelector(".pin-btn");
    const resizeHandle = note.querySelector(".note-resize-handle");
    const transparencySlider = note.querySelector(".transparency-slider");
    const deleteBtn = note.querySelector(".delete-btn");
    const fontSizeToggle = note.querySelector(".font-size-toggle");
    const fontSizePopup = note.querySelector(".font-size-popup");
    const increaseFontBtn = note.querySelector(".increase-font");
    const decreaseFontBtn = note.querySelector(".decrease-font");
    const fontSizeDisplay = note.querySelector(".font-size-display");
    let isDragging2 = false;
    let isResizing = false;
    let dragOffset2 = { x: 0, y: 0 };
    let isPinned = false;
    let isMinimized = false;
    let currentTransparency = 0.95;
    let currentFontSize = 13;
    const noteColor = note.style.background || "rgba(255, 251, 147, 0.95)";
    const baseColor = noteColor.replace("0.95", "0.8");
    const lighterColor = noteColor.replace("0.95", "0.6");
    note.style.setProperty("--note-bg-80", baseColor);
    note.style.setProperty("--note-bg-60", lighterColor);
    note.style.setProperty("--note-opacity", currentTransparency.toString());
    transparencySlider.addEventListener("input", () => {
      currentTransparency = parseFloat(transparencySlider.value);
      note.style.setProperty("--note-opacity", currentTransparency.toString());
      const newBg = noteColor.replace("0.95", currentTransparency.toString());
      const new80Bg = noteColor.replace("0.95", (currentTransparency * 0.8).toString());
      const new60Bg = noteColor.replace("0.95", (currentTransparency * 0.6).toString());
      note.style.background = newBg;
      note.style.setProperty("--note-bg-80", new80Bg);
      note.style.setProperty("--note-bg-60", new60Bg);
    });
    header.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("note-control-btn")) return;
      isDragging2 = true;
      const rect = note.getBoundingClientRect();
      dragOffset2.x = e.clientX - rect.left;
      dragOffset2.y = e.clientY - rect.top;
      document.body.style.cursor = "grabbing";
      note.style.transition = "none";
      note.style.userSelect = "none";
      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", stopDrag);
      e.preventDefault();
    });
    function handleDrag(e) {
      if (!isDragging2) return;
      const newX = e.clientX - dragOffset2.x;
      const newY = e.clientY - dragOffset2.y;
      const padding = 10;
      const maxX = window.innerWidth - note.offsetWidth - padding;
      const maxY = window.innerHeight - note.offsetHeight - padding;
      const constrainedX = Math.max(padding, Math.min(maxX, newX));
      const constrainedY = Math.max(padding, Math.min(maxY, newY));
      note.style.left = constrainedX + "px";
      note.style.top = constrainedY + "px";
    }
    function stopDrag() {
      isDragging2 = false;
      document.body.style.cursor = "";
      note.style.transition = "all 0.3s ease";
      note.style.userSelect = "";
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", stopDrag);
    }
    resizeHandle.addEventListener("mousedown", (e) => {
      isResizing = true;
      note.style.transition = "none";
      document.body.style.cursor = "nw-resize";
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", stopResize);
      e.preventDefault();
      e.stopPropagation();
    });
    function handleResize(e) {
      if (!isResizing) return;
      const rect = note.getBoundingClientRect();
      const newWidth = Math.max(250, Math.min(600, e.clientX - rect.left));
      const newHeight = Math.max(180, Math.min(500, e.clientY - rect.top));
      requestAnimationFrame(() => {
        note.style.width = newWidth + "px";
        note.style.height = newHeight + "px";
      });
    }
    function stopResize() {
      isResizing = false;
      document.body.style.cursor = "";
      note.style.transition = "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)";
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", stopResize);
    }
    closeBtn == null ? void 0 : closeBtn.addEventListener("click", () => {
      note.classList.remove("open");
      setTimeout(() => note.remove(), 300);
    });
    minimizeBtn == null ? void 0 : minimizeBtn.addEventListener("click", () => {
      isMinimized = !isMinimized;
      if (isMinimized) {
        note.classList.add("minimized");
        minimizeBtn.textContent = "+";
        minimizeBtn.title = "Restore";
      } else {
        note.classList.remove("minimized");
        minimizeBtn.textContent = "−";
        minimizeBtn.title = "Minimize";
      }
    });
    pinBtn == null ? void 0 : pinBtn.addEventListener("click", () => {
      isPinned = !isPinned;
      if (isPinned) {
        note.classList.add("pinned");
        note.style.zIndex = "999999";
        pinBtn.classList.add("pinned");
        pinBtn.title = "Unpin note";
      } else {
        note.classList.remove("pinned");
        note.style.zIndex = "999997";
        pinBtn.classList.remove("pinned");
        pinBtn.title = "Pin note (always on top)";
      }
    });
    fontSizeToggle == null ? void 0 : fontSizeToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      fontSizePopup.classList.toggle("active");
    });
    document.addEventListener("click", (e) => {
      if (!fontSizePopup.contains(e.target) && !fontSizeToggle.contains(e.target)) {
        fontSizePopup.classList.remove("active");
      }
    });
    increaseFontBtn == null ? void 0 : increaseFontBtn.addEventListener("click", () => {
      if (currentFontSize < 24) {
        currentFontSize += 1;
        textarea.style.fontSize = currentFontSize + "px";
        fontSizeDisplay.textContent = currentFontSize.toString();
      }
    });
    decreaseFontBtn == null ? void 0 : decreaseFontBtn.addEventListener("click", () => {
      if (currentFontSize > 8) {
        currentFontSize -= 1;
        textarea.style.fontSize = currentFontSize + "px";
        fontSizeDisplay.textContent = currentFontSize.toString();
      }
    });
    deleteBtn == null ? void 0 : deleteBtn.addEventListener("click", () => {
      if (confirm("Delete this note?")) {
        note.classList.remove("open");
        setTimeout(() => note.remove(), 200);
      }
    });
    let saveTimeout;
    textarea.addEventListener("input", () => {
      {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          saveNote(textarea.value.trim());
        }, 1e3);
      }
    });
  }
  function toggleNotesPanel() {
    let panel = document.querySelector(".notes-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "notes-panel";
      panel.innerHTML = `
      <div class="notes-header">📋 Recent Notes</div>
      <div class="notes-list" id="notes-list"></div>
    `;
      document.body.appendChild(panel);
      refreshNotesList();
    }
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      refreshNotesList();
      setTimeout(() => {
        document.addEventListener("click", function outsideClickHandler(e) {
          if (!panel.contains(e.target)) {
            panel.classList.remove("open");
            document.removeEventListener("click", outsideClickHandler);
          }
        });
      }, 100);
    }
  }
  function openSettingsModal() {
    var _a2, _b2;
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
    (_a2 = modal.querySelector(".modal-close")) == null ? void 0 : _a2.addEventListener("click", closeModal);
    (_b2 = modal.querySelector(".close-settings")) == null ? void 0 : _b2.addEventListener("click", closeModal);
  }
  function hideWidget() {
    if (widget) {
      widget.style.display = "none";
    }
    const stickyNotes = document.querySelectorAll(".sticky-note");
    stickyNotes.forEach((note) => {
      note.style.display = "none";
    });
  }
  function showWidget() {
    if (widget) {
      widget.style.display = "block";
    }
    const stickyNotes = document.querySelectorAll(".sticky-note");
    stickyNotes.forEach((note) => {
      note.style.display = "block";
    });
  }
  function isWidgetVisible() {
    if (!widget) return false;
    if (widget.style.display === "none") return false;
    const computedStyle = window.getComputedStyle(widget);
    return computedStyle.display !== "none";
  }
  async function saveNote(content2) {
    try {
      const result2 = await browser.storage.local.get("stickyNotes");
      const notes = result2.stickyNotes || [];
      const newNote = {
        id: Date.now().toString(),
        content: content2,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        url: window.location.href
      };
      notes.unshift(newNote);
      if (notes.length > 50) {
        notes.splice(50);
      }
      await browser.storage.local.set({ stickyNotes: notes });
      console.log("Note saved successfully");
    } catch (error) {
      console.error("Error saving note:", error);
    }
  }
  async function refreshNotesList() {
    const notesList = document.getElementById("notes-list");
    if (!notesList) return;
    try {
      const result2 = await browser.storage.local.get("stickyNotes");
      const notes = result2.stickyNotes || [];
      if (notes.length === 0) {
        notesList.innerHTML = '<div style="padding: 20px; text-align: center; color: #000000; font-weight: 500;">📝 No notes yet<br><small style="color: #9929EA;">Create your first note!</small></div>';
        return;
      }
      notesList.innerHTML = notes.slice(0, 10).map(
        (note) => `
      <div class="note-item" data-note-id="${note.id}">
        <div class="note-preview">${note.content.substring(0, 100)}${note.content.length > 100 ? "..." : ""}</div>
        <div class="note-date">${new Date(note.timestamp).toLocaleDateString()}</div>
      </div>
    `
      ).join("");
      notesList.querySelectorAll(".note-item").forEach((item) => {
        item.addEventListener("click", () => {
          const noteId = item.dataset.noteId;
          const note = notes.find((n) => n.id === noteId);
          if (note) {
            openNoteForEditing(note);
          }
        });
      });
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }
  function openNoteForEditing(note) {
    var _a2;
    const stickyNote = createStickyNote(note.content);
    stickyNote.dataset.noteId = note.id;
    const noteTitle = stickyNote.querySelector(".note-title");
    if (noteTitle) {
      noteTitle.textContent = "Edit Note";
    }
    const noteActions = stickyNote.querySelector(".note-actions");
    const readOnlyBtn = document.createElement("button");
    readOnlyBtn.className = "action-btn read-only-btn";
    readOnlyBtn.title = "Toggle Read Only";
    readOnlyBtn.innerHTML = "🔒";
    const deleteBtn = stickyNote.querySelector(".delete-btn");
    if (deleteBtn && noteActions) {
      noteActions.insertBefore(readOnlyBtn, deleteBtn);
    }
    const textarea = stickyNote.querySelector(".sticky-note-textarea");
    let isReadOnly = false;
    readOnlyBtn.addEventListener("click", () => {
      isReadOnly = !isReadOnly;
      textarea.readOnly = isReadOnly;
      if (isReadOnly) {
        readOnlyBtn.classList.add("active");
        readOnlyBtn.innerHTML = "🔓";
        readOnlyBtn.title = "Enable Editing";
        textarea.style.opacity = "0.7";
        textarea.style.cursor = "default";
      } else {
        readOnlyBtn.classList.remove("active");
        readOnlyBtn.innerHTML = "🔒";
        readOnlyBtn.title = "Disable Editing";
        textarea.style.opacity = "1";
        textarea.style.cursor = "text";
      }
    });
    if (deleteBtn) {
      const newDeleteBtn = deleteBtn.cloneNode(true);
      (_a2 = deleteBtn.parentNode) == null ? void 0 : _a2.replaceChild(newDeleteBtn, deleteBtn);
      newDeleteBtn.addEventListener("click", () => {
        if (isReadOnly) {
          alert("Cannot delete note in read-only mode. Click the lock icon to enable editing.");
          return;
        }
        if (confirm("Delete this note?")) {
          deleteNote(note.id);
          refreshNotesList();
          stickyNote.classList.remove("open");
          setTimeout(() => stickyNote.remove(), 200);
        }
      });
    }
    let saveTimeout;
    textarea.addEventListener("input", () => {
      if (!isReadOnly) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(async () => {
          const content2 = textarea.value.trim();
          if (content2 && note.id) {
            await updateNote(note.id, content2);
            refreshNotesList();
          }
        }, 1e3);
      }
    });
  }
  async function updateNote(noteId, newContent) {
    try {
      const result2 = await browser.storage.local.get("stickyNotes");
      const notes = result2.stickyNotes || [];
      const noteIndex = notes.findIndex((note) => note.id === noteId);
      if (noteIndex !== -1) {
        notes[noteIndex].content = newContent;
        notes[noteIndex].timestamp = (/* @__PURE__ */ new Date()).toISOString();
        await browser.storage.local.set({ stickyNotes: notes });
      }
    } catch (error) {
      console.error("Error updating note:", error);
    }
  }
  async function deleteNote(noteId) {
    try {
      const result2 = await browser.storage.local.get("stickyNotes");
      const notes = result2.stickyNotes || [];
      const filteredNotes = notes.filter((note) => note.id !== noteId);
      await browser.storage.local.set({ stickyNotes: filteredNotes });
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  }
  function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.shiftKey) {
        if (e.code === "KeyN") {
          e.preventDefault();
          console.log("StickyNoteAI: Alt+Shift+N pressed - Creating new note");
          createNoteEditor();
        } else if (e.code === "KeyW") {
          e.preventDefault();
          console.log("StickyNoteAI: Alt+Shift+W pressed - Toggling widget visibility");
          if (isWidgetVisible()) {
            hideWidget();
          } else {
            showWidget();
          }
        }
      }
      if (e.code === "Escape") {
        const openModal = document.querySelector(".sticky-modal.open");
        if (openModal) {
          e.preventDefault();
          openModal.classList.remove("open");
          setTimeout(() => openModal.remove(), 300);
          return;
        }
        const notesPanel = document.querySelector(".notes-panel.open");
        if (notesPanel) {
          e.preventDefault();
          notesPanel.classList.remove("open");
          return;
        }
        if (isMenuOpen) {
          e.preventDefault();
          closeMenu();
          return;
        }
      }
    });
    console.log("StickyNoteAI: Local keyboard shortcuts initialized (Alt+Shift+N, Alt+Shift+W, Esc)");
  }
  function setupMessageListener() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("StickyNoteAI: Received message:", message);
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
      if (message.action === "create-note-with-selection") {
        createNoteEditor(message.selectedText || "");
        sendResponse({ success: true });
        return;
      }
      if (message.action === "toggleStealth") {
        const widget2 = document.getElementById("sticky-note-widget");
        if (widget2) {
          if (message.enabled) {
            widget2.style.opacity = "0.3";
          } else {
            widget2.style.opacity = "1";
          }
        }
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
      y: rect.top
    };
    try {
      await browser.storage.local.set({ widgetPosition: position });
    } catch (error) {
      console.error("Error saving position:", error);
    }
  }
  async function loadWidgetPosition() {
    if (!widget) return;
    widget.style.left = "";
    widget.style.top = "";
    widget.style.transform = "";
    try {
      await browser.storage.local.remove("widgetPosition");
    } catch (error) {
      console.error("Error clearing position:", error);
    }
  }
  content;
  function print$1(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger$1 = {
    debug: (...args) => print$1(console.debug, ...args),
    log: (...args) => print$1(console.log, ...args),
    warn: (...args) => print$1(console.warn, ...args),
    error: (...args) => print$1(console.error, ...args)
  };
  const _WxtLocationChangeEvent = class _WxtLocationChangeEvent extends Event {
    constructor(newUrl, oldUrl) {
      super(_WxtLocationChangeEvent.EVENT_NAME, {});
      this.newUrl = newUrl;
      this.oldUrl = oldUrl;
    }
  };
  __publicField(_WxtLocationChangeEvent, "EVENT_NAME", getUniqueEventName("wxt:locationchange"));
  let WxtLocationChangeEvent = _WxtLocationChangeEvent;
  function getUniqueEventName(eventName) {
    var _a2;
    return `${(_a2 = browser == null ? void 0 : browser.runtime) == null ? void 0 : _a2.id}:${"content"}:${eventName}`;
  }
  function createLocationWatcher(ctx) {
    let interval;
    let oldUrl;
    return {
      /**
       * Ensure the location watcher is actively looking for URL changes. If it's already watching,
       * this is a noop.
       */
      run() {
        if (interval != null) return;
        oldUrl = new URL(location.href);
        interval = ctx.setInterval(() => {
          let newUrl = new URL(location.href);
          if (newUrl.href !== oldUrl.href) {
            window.dispatchEvent(new WxtLocationChangeEvent(newUrl, oldUrl));
            oldUrl = newUrl;
          }
        }, 1e3);
      }
    };
  }
  const _ContentScriptContext = class _ContentScriptContext {
    constructor(contentScriptName, options) {
      __publicField(this, "isTopFrame", window.self === window.top);
      __publicField(this, "abortController");
      __publicField(this, "locationWatcher", createLocationWatcher(this));
      __publicField(this, "receivedMessageIds", /* @__PURE__ */ new Set());
      this.contentScriptName = contentScriptName;
      this.options = options;
      this.abortController = new AbortController();
      if (this.isTopFrame) {
        this.listenForNewerScripts({ ignoreFirstEvent: true });
        this.stopOldScripts();
      } else {
        this.listenForNewerScripts();
      }
    }
    get signal() {
      return this.abortController.signal;
    }
    abort(reason) {
      return this.abortController.abort(reason);
    }
    get isInvalid() {
      if (browser.runtime.id == null) {
        this.notifyInvalidated();
      }
      return this.signal.aborted;
    }
    get isValid() {
      return !this.isInvalid;
    }
    /**
     * Add a listener that is called when the content script's context is invalidated.
     *
     * @returns A function to remove the listener.
     *
     * @example
     * browser.runtime.onMessage.addListener(cb);
     * const removeInvalidatedListener = ctx.onInvalidated(() => {
     *   browser.runtime.onMessage.removeListener(cb);
     * })
     * // ...
     * removeInvalidatedListener();
     */
    onInvalidated(cb) {
      this.signal.addEventListener("abort", cb);
      return () => this.signal.removeEventListener("abort", cb);
    }
    /**
     * Return a promise that never resolves. Useful if you have an async function that shouldn't run
     * after the context is expired.
     *
     * @example
     * const getValueFromStorage = async () => {
     *   if (ctx.isInvalid) return ctx.block();
     *
     *   // ...
     * }
     */
    block() {
      return new Promise(() => {
      });
    }
    /**
     * Wrapper around `window.setInterval` that automatically clears the interval when invalidated.
     */
    setInterval(handler, timeout) {
      const id = setInterval(() => {
        if (this.isValid) handler();
      }, timeout);
      this.onInvalidated(() => clearInterval(id));
      return id;
    }
    /**
     * Wrapper around `window.setTimeout` that automatically clears the interval when invalidated.
     */
    setTimeout(handler, timeout) {
      const id = setTimeout(() => {
        if (this.isValid) handler();
      }, timeout);
      this.onInvalidated(() => clearTimeout(id));
      return id;
    }
    /**
     * Wrapper around `window.requestAnimationFrame` that automatically cancels the request when
     * invalidated.
     */
    requestAnimationFrame(callback) {
      const id = requestAnimationFrame((...args) => {
        if (this.isValid) callback(...args);
      });
      this.onInvalidated(() => cancelAnimationFrame(id));
      return id;
    }
    /**
     * Wrapper around `window.requestIdleCallback` that automatically cancels the request when
     * invalidated.
     */
    requestIdleCallback(callback, options) {
      const id = requestIdleCallback((...args) => {
        if (!this.signal.aborted) callback(...args);
      }, options);
      this.onInvalidated(() => cancelIdleCallback(id));
      return id;
    }
    addEventListener(target, type, handler, options) {
      var _a2;
      if (type === "wxt:locationchange") {
        if (this.isValid) this.locationWatcher.run();
      }
      (_a2 = target.addEventListener) == null ? void 0 : _a2.call(
        target,
        type.startsWith("wxt:") ? getUniqueEventName(type) : type,
        handler,
        {
          ...options,
          signal: this.signal
        }
      );
    }
    /**
     * @internal
     * Abort the abort controller and execute all `onInvalidated` listeners.
     */
    notifyInvalidated() {
      this.abort("Content script context invalidated");
      logger$1.debug(
        `Content script "${this.contentScriptName}" context invalidated`
      );
    }
    stopOldScripts() {
      window.postMessage(
        {
          type: _ContentScriptContext.SCRIPT_STARTED_MESSAGE_TYPE,
          contentScriptName: this.contentScriptName,
          messageId: Math.random().toString(36).slice(2)
        },
        "*"
      );
    }
    verifyScriptStartedEvent(event) {
      var _a2, _b2, _c;
      const isScriptStartedEvent = ((_a2 = event.data) == null ? void 0 : _a2.type) === _ContentScriptContext.SCRIPT_STARTED_MESSAGE_TYPE;
      const isSameContentScript = ((_b2 = event.data) == null ? void 0 : _b2.contentScriptName) === this.contentScriptName;
      const isNotDuplicate = !this.receivedMessageIds.has((_c = event.data) == null ? void 0 : _c.messageId);
      return isScriptStartedEvent && isSameContentScript && isNotDuplicate;
    }
    listenForNewerScripts(options) {
      let isFirst = true;
      const cb = (event) => {
        if (this.verifyScriptStartedEvent(event)) {
          this.receivedMessageIds.add(event.data.messageId);
          const wasFirst = isFirst;
          isFirst = false;
          if (wasFirst && (options == null ? void 0 : options.ignoreFirstEvent)) return;
          this.notifyInvalidated();
        }
      };
      addEventListener("message", cb);
      this.onInvalidated(() => removeEventListener("message", cb));
    }
  };
  __publicField(_ContentScriptContext, "SCRIPT_STARTED_MESSAGE_TYPE", getUniqueEventName(
    "wxt:content-script-started"
  ));
  let ContentScriptContext = _ContentScriptContext;
  function initPlugins() {
  }
  function print(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  const result = (async () => {
    try {
      initPlugins();
      const { main, ...options } = definition;
      const ctx = new ContentScriptContext("content", options);
      return await main(ctx);
    } catch (err) {
      logger.error(
        `The content script "${"content"}" crashed on startup!`,
        err
      );
      throw err;
    }
  })();
  return result;
}();
content;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1jb250ZW50LXNjcmlwdC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHd4dC1kZXYvYnJvd3Nlci9zcmMvaW5kZXgubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L2Jyb3dzZXIubWpzIiwiLi4vLi4vLi4vZW50cnlwb2ludHMvY29udGVudC50cyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LWNvbnRleHQubWpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVDb250ZW50U2NyaXB0KGRlZmluaXRpb24pIHtcbiAgcmV0dXJuIGRlZmluaXRpb247XG59XG4iLCIvLyAjcmVnaW9uIHNuaXBwZXRcbmV4cG9ydCBjb25zdCBicm93c2VyID0gZ2xvYmFsVGhpcy5icm93c2VyPy5ydW50aW1lPy5pZFxuICA/IGdsb2JhbFRoaXMuYnJvd3NlclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xuLy8gI2VuZHJlZ2lvbiBzbmlwcGV0XG4iLCJpbXBvcnQgeyBicm93c2VyIGFzIF9icm93c2VyIH0gZnJvbSBcIkB3eHQtZGV2L2Jyb3dzZXJcIjtcbmV4cG9ydCBjb25zdCBicm93c2VyID0gX2Jyb3dzZXI7XG5leHBvcnQge307XG4iLCJleHBvcnQgZGVmYXVsdCBkZWZpbmVDb250ZW50U2NyaXB0KHtcbiAgbWF0Y2hlczogW1wiPGFsbF91cmxzPlwiXSxcbiAgbWFpbigpIHtcbiAgICBjb25zb2xlLmxvZyhcIvCfjq8gU3RpY2t5Tm90ZUFJIHYyLjIgQ1NTIEZJWEVEICsgTUVOVSBQT1NJVElPTklORyAtIExvYWRpbmcuLi5cIik7XG5cbiAgICAvLyBXYWl0IGZvciBET00gdG8gYmUgcmVhZHlcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICAgICAgaW5pdGlhbGl6ZVdpZGdldCgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluaXRpYWxpemVXaWRnZXQoKTtcbiAgICB9XG4gIH0sXG59KTtcblxubGV0IHdpZGdldDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbmxldCBpc0RyYWdnaW5nID0gZmFsc2U7XG5sZXQgaXNNZW51T3BlbiA9IGZhbHNlO1xubGV0IGRyYWdPZmZzZXQgPSB7IHg6IDAsIHk6IDAgfTtcbmxldCBsYXN0UG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcbmxldCBtZW51Q2xvc2VUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xubGV0IGdsb2JhbFNtaWx5RmFjZVVybDogc3RyaW5nOyAvLyBHbG9iYWwgdmFyaWFibGUgZm9yIHNtaWxleSBmYWNlIFVSTFxuXG5mdW5jdGlvbiBpbml0aWFsaXplV2lkZ2V0KCkge1xuICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogRE9NIHJlYWR5LCBjcmVhdGluZyB3aWRnZXQuLi5cIik7XG4gIGNyZWF0ZUZsb2F0aW5nV2lkZ2V0KCk7XG4gIGxvYWRXaWRnZXRQb3NpdGlvbigpO1xuICBzZXR1cEtleWJvYXJkU2hvcnRjdXRzKCk7XG4gIHNldHVwTWVzc2FnZUxpc3RlbmVyKCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUZsb2F0aW5nV2lkZ2V0KCkge1xuICAvLyBSZW1vdmUgZXhpc3Rpbmcgd2lkZ2V0IGlmIGFueVxuICBjb25zdCBleGlzdGluZ1dpZGdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RpY2t5LW5vdGUtd2lkZ2V0XCIpO1xuICBpZiAoZXhpc3RpbmdXaWRnZXQpIHtcbiAgICBleGlzdGluZ1dpZGdldC5yZW1vdmUoKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSBtYWluIHdpZGdldCBjb250YWluZXJcbiAgd2lkZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgd2lkZ2V0LmlkID0gXCJzdGlja3ktbm90ZS13aWRnZXRcIjtcblxuICAvLyBUcnkgbXVsdGlwbGUgYXBwcm9hY2hlcyB0byBnZXQgdGhlIGNvcnJlY3QgVVJMcyBmb3IgcHVibGljIGFzc2V0c1xuICBsZXQgc21pbHlGYWNlVXJsOiBzdHJpbmc7XG4gIGxldCBhZGQyVXJsOiBzdHJpbmc7XG5cbiAgdHJ5IHtcbiAgICAvLyBQcmltYXJ5IGFwcHJvYWNoOiBVc2UgYnJvd3Nlci5ydW50aW1lLmdldFVSTFxuICAgIHNtaWx5RmFjZVVybCA9IGJyb3dzZXIucnVudGltZS5nZXRVUkwoXCJzbWlseWZhY2UuZ2lmXCIgYXMgYW55KTtcbiAgICBnbG9iYWxTbWlseUZhY2VVcmwgPSBzbWlseUZhY2VVcmw7IC8vIFN0b3JlIGdsb2JhbGx5XG4gICAgYWRkMlVybCA9IGJyb3dzZXIucnVudGltZS5nZXRVUkwoXCJhZGQyLnBuZ1wiIGFzIGFueSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS53YXJuKFwiYnJvd3Nlci5ydW50aW1lLmdldFVSTCBmYWlsZWQsIHVzaW5nIGZhbGxiYWNrIGFwcHJvYWNoOlwiLCBlcnJvcik7XG4gICAgLy8gRmFsbGJhY2sgYXBwcm9hY2g6IERpcmVjdCBleHRlbnNpb24gVVJMIGNvbnN0cnVjdGlvblxuICAgIGNvbnN0IGV4dGVuc2lvbklkID0gYnJvd3Nlci5ydW50aW1lLmlkIHx8IGNocm9tZS5ydW50aW1lLmlkO1xuICAgIHNtaWx5RmFjZVVybCA9IGBjaHJvbWUtZXh0ZW5zaW9uOi8vJHtleHRlbnNpb25JZH0vc21pbHlmYWNlLmdpZmA7XG4gICAgZ2xvYmFsU21pbHlGYWNlVXJsID0gc21pbHlGYWNlVXJsOyAvLyBTdG9yZSBnbG9iYWxseVxuICAgIGFkZDJVcmwgPSBgY2hyb21lLWV4dGVuc2lvbjovLyR7ZXh0ZW5zaW9uSWR9L2FkZDIucG5nYDtcbiAgfVxuXG4gIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBJbWFnZSBVUkxzOlwiLCB7IHNtaWx5RmFjZVVybCwgYWRkMlVybCB9KTtcbiAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IEV4dGVuc2lvbiBJRDpcIiwgYnJvd3Nlci5ydW50aW1lLmlkKTtcbiAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IENocm9tZSBydW50aW1lIElEOlwiLCBjaHJvbWUucnVudGltZS5pZCk7XG5cbiAgd2lkZ2V0LmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRhaW5lclwiPlxuICAgICAgPGRpdiBjbGFzcz1cIndpZGdldC1tYWluLWJ1dHRvblwiIGlkPVwibWFpbi1idXR0b25cIj5cbiAgICAgICAgPGltZyBzcmM9XCIke3NtaWx5RmFjZVVybH1cIiBhbHQ9XCJXaWRnZXRcIiBzdHlsZT1cIndpZHRoOiAyNHB4OyBoZWlnaHQ6IDI0cHg7XCIgaWQ9XCJzbWlsZXktaW1hZ2VcIj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIndpZGdldC1tZW51XCIgaWQ9XCJ3aWRnZXQtbWVudVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibWVudS1idXR0b24gYWRkLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiYWRkXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJhZGQtaWNvblwiPvCfk508L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibWVudS1idXR0b24gbm90ZXMtYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJub3Rlc1wiPvCfk4s8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtYnV0dG9uIHNldHRpbmdzLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwic2V0dGluZ3NcIj7impnvuI88L2Rpdj5cbiAgICAgICAgXG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbiAgLy8gQWRkIHN0eWxlc1xuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgc3R5bGUudGV4dENvbnRlbnQgPSBgXG4gICAgI3N0aWNreS1ub3RlLXdpZGdldCB7XG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICBib3R0b206IDUwdmg7XG4gICAgICByaWdodDogNTBweDtcbiAgICAgIHotaW5kZXg6IDk5OTk5OTtcbiAgICAgIGZvbnQtZmFtaWx5OiAnSW50ZXInLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIHNhbnMtc2VyaWY7XG4gICAgICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAgIH1cblxuICAgIC53aWRnZXQtY29udGFpbmVyIHtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICB9XG5cbiAgICAud2lkZ2V0LW1haW4tYnV0dG9uIHtcbiAgICAgIHdpZHRoOiA1MHB4O1xuICAgICAgaGVpZ2h0OiA1MHB4O1xuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzIyYzU1ZSAwJSwgIzE2YTM0YSAxMDAlKTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBmb250LXNpemU6IDIwcHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBib3gtc2hhZG93OiAwIDRweCAxNnB4IHJnYmEoMzQsIDE5NywgOTQsIDAuMyk7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xuICAgICAgYm9yZGVyOiAycHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xuICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEwcHgpO1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWFpbi1idXR0b246aG92ZXIge1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjA1KTtcbiAgICAgIGJveC1zaGFkb3c6IDAgNnB4IDIwcHggcmdiYSgzNCwgMTk3LCA5NCwgMC40KTtcbiAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMxNmEzNGEgMCUsICMxNTgwM2QgMTAwJSk7XG4gICAgfVxuICAgICAgICAwIDAgMTAwcHggcmdiYSgyMDQsIDEwMiwgMjE4LCAwLjQpO1xuICAgICAgYW5pbWF0aW9uOiBwdWxzZUdsb3dIb3ZlciAycyBlYXNlLWluLW91dCBpbmZpbml0ZTtcbiAgICB9XG5cbiAgICBAa2V5ZnJhbWVzIHB1bHNlR2xvd0hvdmVyIHtcbiAgICAgIDAlLCAxMDAlIHtcbiAgICAgICAgYm94LXNoYWRvdzogXG4gICAgICAgICAgMCA2cHggMjVweCByZ2JhKDE1MywgNDEsIDIzNCwgMC42KSxcbiAgICAgICAgICAwIDAgMzVweCByZ2JhKDE1MywgNDEsIDIzNCwgMC44KSxcbiAgICAgICAgICAwIDAgNzBweCByZ2JhKDIwNCwgMTAyLCAyMTgsIDAuNiksXG4gICAgICAgICAgMCAwIDEwMHB4IHJnYmEoMjA0LCAxMDIsIDIxOCwgMC40KTtcbiAgICAgIH1cbiAgICAgIDUwJSB7XG4gICAgICAgIGJveC1zaGFkb3c6IFxuICAgICAgICAgIDAgOHB4IDMwcHggcmdiYSgxNTMsIDQxLCAyMzQsIDAuOCksXG4gICAgICAgICAgMCAwIDQ1cHggcmdiYSgxNTMsIDQxLCAyMzQsIDEpLFxuICAgICAgICAgIDAgMCA5MHB4IHJnYmEoMjA0LCAxMDIsIDIxOCwgMC44KSxcbiAgICAgICAgICAwIDAgMTMwcHggcmdiYSgyMDQsIDEwMiwgMjE4LCAwLjUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC53aWRnZXQtbWFpbi1idXR0b24uZHJhZ2dpbmcge1xuICAgICAgY3Vyc29yOiBncmFiYmluZyAhaW1wb3J0YW50O1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjk1KTtcbiAgICAgIGJveC1zaGFkb3c6IFxuICAgICAgICAwIDhweCAzMHB4IHJnYmEoMTUzLCA0MSwgMjM0LCAwLjcpLFxuICAgICAgICAwIDAgMjVweCByZ2JhKDE1MywgNDEsIDIzNCwgMC45KSxcbiAgICAgICAgMCAwIDUwcHggcmdiYSgyMDQsIDEwMiwgMjE4LCAwLjcpLFxuICAgICAgICAwIDAgODBweCByZ2JhKDIwNCwgMTAyLCAyMTgsIDAuNSk7XG4gICAgICBhbmltYXRpb246IG5vbmU7XG4gICAgfVxuXG4gICAgLndpZGdldC1tZW51IHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHRvcDogMTAwJTtcbiAgICAgIGxlZnQ6IDUwJTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTtcbiAgICAgIG1hcmdpbi10b3A6IDEwcHg7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIGdhcDogMTBweDtcbiAgICAgIG9wYWNpdHk6IDA7XG4gICAgICB2aXNpYmlsaXR5OiBoaWRkZW47XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgfVxuXG4gICAgLndpZGdldC1tZW51LnRvcC1wb3NpdGlvbmVkIHtcbiAgICAgIHRvcDogYXV0bztcbiAgICAgIGJvdHRvbTogMTAwJTtcbiAgICAgIG1hcmdpbi10b3A6IDA7XG4gICAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbi1yZXZlcnNlOyAvKiBSZXZlcnNlIG9yZGVyIHNvIGJ1dHRvbnMgYXBwZWFyIG5hdHVyYWxseSAqL1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudS5vcGVuIHtcbiAgICAgIG9wYWNpdHk6IDE7XG4gICAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xuICAgICAgcG9pbnRlci1ldmVudHM6IGF1dG87XG4gICAgfVxuXG4gICAgLm1lbnUtYnV0dG9uIHtcbiAgICAgIHdpZHRoOiA0MHB4O1xuICAgICAgaGVpZ2h0OiA0MHB4O1xuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2Y4ZmFmYyAwJSwgI2UyZThmMCAxMDAlKTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBib3gtc2hhZG93OiAwIDJweCA4cHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgICAgIGJvcmRlcjogMnB4IHNvbGlkIHJnYmEoMzQsIDE5NywgOTQsIDAuMik7XG4gICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCk7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTEwcHgpO1xuICAgICAgb3BhY2l0eTogMDtcbiAgICAgIGNvbG9yOiAjMzc0MTUxO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbiB7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbjpudGgtY2hpbGQoMSkgeyB0cmFuc2l0aW9uLWRlbGF5OiAwLjA1czsgfVxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbjpudGgtY2hpbGQoMikgeyB0cmFuc2l0aW9uLWRlbGF5OiAwLjFzOyB9XG4gICAgLndpZGdldC1tZW51Lm9wZW4gLm1lbnUtYnV0dG9uOm50aC1jaGlsZCgzKSB7IHRyYW5zaXRpb24tZGVsYXk6IDAuMTVzOyB9XG4gICAgLndpZGdldC1tZW51Lm9wZW4gLm1lbnUtYnV0dG9uOm50aC1jaGlsZCg0KSB7IHRyYW5zaXRpb24tZGVsYXk6IDAuMnM7IH1cblxuICAgIC5tZW51LWJ1dHRvbjpob3ZlciB7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7XG4gICAgICBib3gtc2hhZG93OiAwIDRweCAxMnB4IHJnYmEoMzQsIDE5NywgOTQsIDAuMik7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMjJjNTVlIDAlLCAjMTZhMzRhIDEwMCUpO1xuICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgYm9yZGVyLWNvbG9yOiByZ2JhKDIyLCAxNjMsIDc0LCAwLjMpO1xuICAgIH1cblxuICAgIC5hZGQtaWNvbiB7XG4gICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICBsaW5lLWhlaWdodDogMTtcbiAgICAgIHVzZXItc2VsZWN0OiBub25lO1xuICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgfVxuXG5cbiAgICAuc3RpY2t5LW1vZGFsIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIGxlZnQ6IDA7XG4gICAgICB3aWR0aDogMTAwdnc7XG4gICAgICBoZWlnaHQ6IDEwMHZoO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjYpO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIHotaW5kZXg6IDEwMDAwMDA7XG4gICAgICBvcGFjaXR5OiAwO1xuICAgICAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcbiAgICB9XG5cbiAgICAuc3RpY2t5LW1vZGFsLm9wZW4ge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHZpc2liaWxpdHk6IHZpc2libGU7XG4gICAgfVxuXG4gICAgLm1vZGFsLWNvbnRlbnQge1xuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI0ZBRUI5MiAwJSwgI0NDNjZEQSAxMDAlKTtcbiAgICAgIHBhZGRpbmc6IDMwcHg7XG4gICAgICBib3JkZXItcmFkaXVzOiAxNXB4O1xuICAgICAgYm94LXNoYWRvdzogXG4gICAgICAgIDAgMjBweCA2MHB4IHJnYmEoMTUzLCA0MSwgMjM0LCAwLjUpLFxuICAgICAgICAwIDAgMCAzcHggcmdiYSgwLCAwLCAwLCAwLjIpLFxuICAgICAgICAwIDEwcHggMzBweCByZ2JhKDIwNCwgMTAyLCAyMTgsIDAuNCk7XG4gICAgICBtYXgtd2lkdGg6IDUwMHB4O1xuICAgICAgd2lkdGg6IDkwJTtcbiAgICAgIG1heC1oZWlnaHQ6IDgwdmg7XG4gICAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjkpO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbiAgICAgIGJvcmRlcjogM3B4IHNvbGlkICMwMDAwMDA7XG4gICAgfVxuXG4gICAgLnN0aWNreS1tb2RhbC5vcGVuIC5tb2RhbC1jb250ZW50IHtcbiAgICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XG4gICAgfVxuXG4gICAgLm1vZGFsLWhlYWRlciB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIG1hcmdpbi1ib3R0b206IDIwcHg7XG4gICAgICBwYWRkaW5nLWJvdHRvbTogMTVweDtcbiAgICAgIGJvcmRlci1ib3R0b206IDNweCBzb2xpZCAjMDAwMDAwO1xuICAgICAgYmFja2dyb3VuZDogI0ZERkZCODtcbiAgICAgIHBhZGRpbmc6IDE1cHg7XG4gICAgICBtYXJnaW46IC0zMHB4IC0zMHB4IDIwcHggLTMwcHg7XG4gICAgICBib3JkZXItcmFkaXVzOiAxNXB4IDE1cHggMCAwO1xuICAgIH1cblxuICAgIC5tb2RhbC10aXRsZSB7XG4gICAgICBmb250LXNpemU6IDIwcHg7XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgY29sb3I6ICMwMDAwMDA7XG4gICAgICB0ZXh0LXNoYWRvdzogMCAxcHggMnB4IHJnYmEoMjUwLCAyMzUsIDE0NiwgMC44KTtcbiAgICB9XG5cbiAgICAubW9kYWwtY2xvc2Uge1xuICAgICAgYmFja2dyb3VuZDogIzk5MjlFQTtcbiAgICAgIGJvcmRlcjogMnB4IHNvbGlkICMwMDAwMDA7XG4gICAgICBmb250LXNpemU6IDI0cHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBjb2xvcjogI0ZBRUI5MjtcbiAgICAgIHBhZGRpbmc6IDVweDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgICBib3gtc2hhZG93OiAwIDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjMpO1xuICAgIH1cblxuICAgIC5tb2RhbC1jbG9zZTpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjQ0M2NkRBO1xuICAgICAgY29sb3I6ICMwMDAwMDA7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7XG4gICAgICBib3gtc2hhZG93OiAwIDNweCA4cHggcmdiYSgwLCAwLCAwLCAwLjQpO1xuICAgIH1cblxuICAgIC5ub3RlLWlucHV0IHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgbWluLWhlaWdodDogMjAwcHg7XG4gICAgICBwYWRkaW5nOiAxNXB4O1xuICAgICAgYm9yZGVyOiAzcHggc29saWQgIzAwMDAwMDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICBmb250LWZhbWlseTogJ0NvbWljIFNhbnMgTVMnLCBjdXJzaXZlLCBzYW5zLXNlcmlmO1xuICAgICAgcmVzaXplOiB2ZXJ0aWNhbDtcbiAgICAgIHRyYW5zaXRpb246IGJvcmRlci1jb2xvciAwLjJzIGVhc2U7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1MywgMjU1LCAxODQsIDAuOSk7XG4gICAgICBjb2xvcjogIzAwMDAwMDtcbiAgICAgIGJveC1zaGFkb3c6IGluc2V0IDAgMnB4IDVweCByZ2JhKDE1MywgNDEsIDIzNCwgMC4zKTtcbiAgICB9XG5cbiAgICAubm90ZS1pbnB1dDpmb2N1cyB7XG4gICAgICBvdXRsaW5lOiBub25lO1xuICAgICAgYm9yZGVyLWNvbG9yOiAjOTkyOUVBO1xuICAgICAgYm94LXNoYWRvdzogXG4gICAgICAgIGluc2V0IDAgMnB4IDVweCByZ2JhKDE1MywgNDEsIDIzNCwgMC40KSxcbiAgICAgICAgMCAwIDAgM3B4IHJnYmEoMjA0LCAxMDIsIDIxOCwgMC4zKTtcbiAgICB9XG5cbiAgICAuYnV0dG9uLWdyb3VwIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBnYXA6IDEwcHg7XG4gICAgICBtYXJnaW4tdG9wOiAyMHB4O1xuICAgIH1cblxuICAgIC5idG4ge1xuICAgICAgcGFkZGluZzogMTBweCAyMHB4O1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgICBib3gtc2hhZG93OiAwIDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjIpO1xuICAgIH1cblxuICAgIC5idG4tcHJpbWFyeSB7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjOTkyOUVBIDAlLCAjQ0M2NkRBIDEwMCUpO1xuICAgICAgY29sb3I6ICNGQUVCOTI7XG4gICAgICBib3JkZXI6IDJweCBzb2xpZCAjMDAwMDAwO1xuICAgIH1cblxuICAgIC5idG4tcHJpbWFyeTpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjQ0M2NkRBIDAlLCAjOTkyOUVBIDEwMCUpO1xuICAgICAgY29sb3I6ICMwMDAwMDA7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTJweCk7XG4gICAgICBib3gtc2hhZG93OiAwIDRweCAxMHB4IHJnYmEoMTUzLCA0MSwgMjM0LCAwLjUpO1xuICAgIH1cblxuICAgIC5idG4tc2Vjb25kYXJ5IHtcbiAgICAgIGJhY2tncm91bmQ6ICNGQUVCOTI7XG4gICAgICBjb2xvcjogIzAwMDAwMDtcbiAgICAgIGJvcmRlcjogMnB4IHNvbGlkICMwMDAwMDA7XG4gICAgfVxuXG4gICAgLmJ0bi1zZWNvbmRhcnk6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogI0NDNjZEQTtcbiAgICAgIGNvbG9yOiAjMDAwMDAwO1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0ycHgpO1xuICAgICAgYm94LXNoYWRvdzogMCA0cHggMTBweCByZ2JhKDIwNCwgMTAyLCAyMTgsIDAuNSk7XG4gICAgfVxuXG4gICAgLm5vdGVzLXBhbmVsIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogNTAlO1xuICAgICAgcmlnaHQ6IC0zMDBweDtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTtcbiAgICAgIHdpZHRoOiAyODBweDtcbiAgICAgIG1heC1oZWlnaHQ6IDQwMHB4O1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICAgIGJveC1zaGFkb3c6IDAgOHB4IDMycHggcmdiYSgwLCAwLCAwLCAwLjE1KSxcbiAgICAgICAgICAgICAgICAgIDAgMnB4IDhweCByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gICAgICB6LWluZGV4OiA5OTk5OTg7XG4gICAgICB0cmFuc2l0aW9uOiByaWdodCAwLjNzIGVhc2U7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEwcHgpO1xuICAgIH1cblxuICAgIC5ub3Rlcy1wYW5lbC5vcGVuIHtcbiAgICAgIHJpZ2h0OiAyMHB4O1xuICAgIH1cblxuICAgIC5ub3Rlcy1oZWFkZXIge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1MSwgMTQ3LCAwLjgpO1xuICAgICAgY29sb3I6ICM0YTRhNGE7XG4gICAgICBwYWRkaW5nOiAxMnB4IDE2cHg7XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgICB9XG5cbiAgICAubm90ZXMtbGlzdCB7XG4gICAgICBtYXgtaGVpZ2h0OiAzMDBweDtcbiAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgICBwYWRkaW5nOiA4cHg7XG4gICAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgICB9XG5cbiAgICAubm90ZS1pdGVtIHtcbiAgICAgIHBhZGRpbmc6IDEycHg7XG4gICAgICBtYXJnaW4tYm90dG9tOiA4cHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjUxLCAxNDcsIDAuNik7XG4gICAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICAgICAgYm94LXNoYWRvdzogMCAxcHggM3B4IHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgICB9XG5cbiAgICAubm90ZS1pdGVtOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTEsIDE0NywgMC44KTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgzcHgpO1xuICAgICAgYm94LXNoYWRvdzogMCAycHggOHB4IHJnYmEoMCwgMCwgMCwgMC4xNSk7XG4gICAgfVxuXG4gICAgLm5vdGUtaXRlbTpudGgtY2hpbGQoMm4pIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyMzcsIDIxMywgMC42KTtcbiAgICB9XG5cbiAgICAubm90ZS1pdGVtOm50aC1jaGlsZCgybik6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDIzNywgMjEzLCAwLjgpO1xuICAgIH1cblxuICAgIC5ub3RlLWl0ZW06bnRoLWNoaWxkKDNuKSB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDIzNywgMjU1LCAyMzUsIDAuNik7XG4gICAgfVxuXG4gICAgLm5vdGUtaXRlbTpudGgtY2hpbGQoM24pOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjM3LCAyNTUsIDIzNSwgMC44KTtcbiAgICB9XG5cbiAgICAubm90ZS1wcmV2aWV3IHtcbiAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgIGNvbG9yOiAjNTU1O1xuICAgICAgbWFyZ2luLXRvcDogNHB4O1xuICAgICAgZGlzcGxheTogLXdlYmtpdC1ib3g7XG4gICAgICAtd2Via2l0LWxpbmUtY2xhbXA6IDI7XG4gICAgICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsO1xuICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjQ7XG4gICAgfVxuXG4gICAgLm5vdGUtZGF0ZSB7XG4gICAgICBmb250LXNpemU6IDEwcHg7XG4gICAgICBjb2xvcjogIzg4ODtcbiAgICAgIG1hcmdpbi10b3A6IDRweDtcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcbiAgICB9XG5cbiAgICBAbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcbiAgICAgIC5ub3Rlcy1wYW5lbCB7XG4gICAgICAgIHdpZHRoOiA5MCU7XG4gICAgICAgIHJpZ2h0OiAtMTAwJTtcbiAgICAgIH1cbiAgICAgIC5ub3Rlcy1wYW5lbC5vcGVuIHtcbiAgICAgICAgcmlnaHQ6IDUlO1xuICAgICAgfVxuICAgIH1cbiBcblxuICAgIC8qIFN0aWNreSBOb3RlIFN0eWxlcyAqL1xuICAgIC5zdGlja3ktbm90ZSB7XG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICB3aWR0aDogMjgwcHg7XG4gICAgICBoZWlnaHQ6IDE4MHB4O1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1MSwgMTQ3LCAwLjk1KTsgLyogQ2xhc3NpYyB5ZWxsb3cgc3RpY2t5IG5vdGUgKi9cbiAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICAgIGJveC1zaGFkb3c6IFxuICAgICAgICAwIDRweCAxMnB4IHJnYmEoMCwgMCwgMCwgMC4xNSksXG4gICAgICAgIDAgMXB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gICAgICB6LWluZGV4OiA5OTk5OTc7XG4gICAgICBmb250LWZhbWlseTogJ1NlZ29lIFVJJywgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjkpIHJvdGF0ZSh2YXIoLS1ub3RlLXJvdGF0aW9uLCAtMWRlZykpO1xuICAgICAgb3BhY2l0eTogdmFyKC0tbm90ZS1vcGFjaXR5LCAwKTtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSk7XG4gICAgICBib3JkZXI6IDJweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMnB4KTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIH1cblxuICAgIC5zdGlja3ktbm90ZS5vcGVuIHtcbiAgICAgIHRyYW5zZm9ybTogc2NhbGUoMSkgcm90YXRlKHZhcigtLW5vdGUtcm90YXRpb24sIDBkZWcpKTtcbiAgICAgIG9wYWNpdHk6IHZhcigtLW5vdGUtb3BhY2l0eSwgMSk7XG4gICAgfVxuXG4gICAgLnN0aWNreS1ub3RlLm1pbmltaXplZCB7XG4gICAgICBoZWlnaHQ6IDM2cHg7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIH1cblxuICAgIC5zdGlja3ktbm90ZS5taW5pbWl6ZWQgLnN0aWNreS1ub3RlLXRleHRhcmVhIHtcbiAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuXG4gICAgLnN0aWNreS1ub3RlLm1pbmltaXplZCAubm90ZS1yZXNpemUtaGFuZGxlIHtcbiAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuXG4gICAgLnN0aWNreS1ub3RlLm1pbmltaXplZCAubm90ZS1jb250cm9scy1ib3R0b20ge1xuICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG5cbiAgICAvKiBSZWFkLW9ubHkgc3RhdGUgKi9cbiAgICAuc3RpY2t5LW5vdGUtdGV4dGFyZWFbcmVhZG9ubHldIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4wMik7XG4gICAgICBjdXJzb3I6IGRlZmF1bHQgIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAuc3RpY2t5LW5vdGUucGlubmVkIHtcbiAgICAgIGJvcmRlcjogMnB4IHNvbGlkIHJnYmEoMjU1LCAxOTMsIDcsIDAuNik7XG4gICAgICBib3gtc2hhZG93OiBcbiAgICAgICAgMCA2cHggMTZweCByZ2JhKDI1NSwgMTkzLCA3LCAwLjIpLFxuICAgICAgICAwIDJweCA4cHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxKSByb3RhdGUoMGRlZykgIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAuc3RpY2t5LW5vdGUtaGVhZGVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4wNSk7XG4gICAgICBwYWRkaW5nOiA4cHggMTJweDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDZweCA2cHggMCAwO1xuICAgICAgY3Vyc29yOiBtb3ZlO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgICBmbGV4LXNocmluazogMDtcbiAgICB9XG5cbiAgICAubm90ZS10aXRsZSB7XG4gICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgICAgY29sb3I6ICM2NjY7XG4gICAgICB0ZXh0LXNoYWRvdzogbm9uZTtcbiAgICB9XG5cbiAgICAubm90ZS1jb250cm9scyB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZ2FwOiA0cHg7XG4gICAgfVxuXG4gICAgLm5vdGUtY29udHJvbC1idG4ge1xuICAgICAgd2lkdGg6IDIwcHg7XG4gICAgICBoZWlnaHQ6IDIwcHg7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7IC8qIE1ha2UgYnV0dG9ucyBjaXJjdWxhciAqL1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgZm9udC1zaXplOiAxMHB4O1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgICBjb2xvcjogIzY2NjtcbiAgICAgIGJveC1zaGFkb3c6IDAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gICAgfVxuXG4gICAgLm5vdGUtY29udHJvbC1idG46aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjIpO1xuICAgICAgY29sb3I6ICMzMzM7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7XG4gICAgfVxuXG4gICAgLm5vdGUtY29udHJvbC1idG4ucGluLWJ0bi5waW5uZWQge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDE5MywgNywgMC44KTtcbiAgICAgIGNvbG9yOiAjZmZmO1xuICAgIH1cblxuICAgIC5ub3RlLWNvbnRyb2wtYnRuLmNsb3NlLWJ0bjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDIyMCwgMzgsIDM4LCAwLjgpO1xuICAgICAgY29sb3I6ICNmZmY7XG4gICAgfVxuXG4gICAgLnN0aWNreS1ub3RlLXRleHRhcmVhIHtcbiAgICAgIGZsZXg6IDE7XG4gICAgICBtYXJnaW46IDhweDtcbiAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgICAgcmVzaXplOiBub25lO1xuICAgICAgb3V0bGluZTogbm9uZTtcbiAgICAgIGZvbnQtZmFtaWx5OiAnU2Vnb2UgVUknLCBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7XG4gICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICBjb2xvcjogIzMzMztcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjU7XG4gICAgICBwbGFjZWhvbGRlci1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjQpO1xuICAgIH1cblxuICAgIC5zdGlja3ktbm90ZS10ZXh0YXJlYTo6cGxhY2Vob2xkZXIge1xuICAgICAgY29sb3I6IHJnYmEoMCwgMCwgMCwgMC40KTtcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcbiAgICB9XG5cbiAgICAubm90ZS1yZXNpemUtaGFuZGxlIHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIGJvdHRvbTogM3B4O1xuICAgICAgcmlnaHQ6IDNweDtcbiAgICAgIHdpZHRoOiAxNnB4O1xuICAgICAgaGVpZ2h0OiAxNnB4O1xuICAgICAgY3Vyc29yOiBudy1yZXNpemU7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoLTQ1ZGVnLCB0cmFuc3BhcmVudCAzNSUsIHJnYmEoMCwgMCwgMCwgMC4zKSA1MCUsIHRyYW5zcGFyZW50IDY1JSk7XG4gICAgICBib3JkZXItcmFkaXVzOiAzcHg7XG4gICAgICBvcGFjaXR5OiAwLjc7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICAgIH1cblxuICAgIC5ub3RlLXJlc2l6ZS1oYW5kbGU6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KC00NWRlZywgdHJhbnNwYXJlbnQgMzAlLCByZ2JhKDAsIDAsIDAsIDAuNSkgNTAlLCB0cmFuc3BhcmVudCA3MCUpO1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHRyYW5zZm9ybTogc2NhbGUoMS4xKTtcbiAgICB9XG5cbiAgICAvKiBOb3RlIE9wdGlvbnMgTW9kYWwgKi9cbiAgICAubm90ZS1vcHRpb25zLW1vZGFsIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIGxlZnQ6IDA7XG4gICAgICB3aWR0aDogMTAwdnc7XG4gICAgICBoZWlnaHQ6IDEwMHZoO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjYpO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIHotaW5kZXg6IDEwMDAwMDA7XG4gICAgICBvcGFjaXR5OiAwO1xuICAgICAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcbiAgICB9XG5cbiAgICAubm90ZS1vcHRpb25zLW1vZGFsLm9wZW4ge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHZpc2liaWxpdHk6IHZpc2libGU7XG4gICAgfVxuXG4gICAgLm5vdGUtb3B0aW9ucy1jb250ZW50IHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45NSk7XG4gICAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICAgICAgcGFkZGluZzogMjRweDtcbiAgICAgIG1heC13aWR0aDogNDAwcHg7XG4gICAgICB3aWR0aDogOTAlO1xuICAgICAgbWF4LWhlaWdodDogODB2aDtcbiAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgICBib3gtc2hhZG93OiAwIDIwcHggNjBweCByZ2JhKDAsIDAsIDAsIDAuMyk7XG4gICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCk7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDAuOSk7XG4gICAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4zcyBlYXNlO1xuICAgIH1cblxuICAgIC5ub3RlLW9wdGlvbnMtbW9kYWwub3BlbiAubm90ZS1vcHRpb25zLWNvbnRlbnQge1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcbiAgICB9XG5cbiAgICAubm90ZS1wcmV2aWV3LXNlY3Rpb24ge1xuICAgICAgbWFyZ2luLWJvdHRvbTogMjRweDtcbiAgICAgIHBhZGRpbmc6IDE2cHg7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjUxLCAxNDcsIDAuMyk7XG4gICAgICBib3JkZXItcmFkaXVzOiA4cHg7XG4gICAgICBib3JkZXItbGVmdDogNHB4IHNvbGlkICMyMmM1NWU7XG4gICAgfVxuXG4gICAgLm5vdGUtcHJldmlldy1zZWN0aW9uIGgzIHtcbiAgICAgIG1hcmdpbjogMCAwIDEycHggMDtcbiAgICAgIGNvbG9yOiAjMzc0MTUxO1xuICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICB9XG5cbiAgICAubm90ZS1wcmV2aWV3LXRleHQge1xuICAgICAgY29sb3I6ICM1NTU7XG4gICAgICBsaW5lLWhlaWdodDogMS41O1xuICAgICAgbWFyZ2luLWJvdHRvbTogOHB4O1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgIH1cblxuICAgIC5ub3RlLWRhdGUge1xuICAgICAgY29sb3I6ICM4ODg7XG4gICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICBmb250LXN0eWxlOiBpdGFsaWM7XG4gICAgfVxuXG4gICAgLyogU2ltcGxlIE5vdGUgSXRlbXMgKi9cbiAgICAubm90ZS1pdGVtIHtcbiAgICAgIHBhZGRpbmc6IDEycHggMTZweDtcbiAgICAgIG1hcmdpbjogOHB4IDA7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOSk7XG4gICAgICBib3JkZXItcmFkaXVzOiA4cHg7XG4gICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgYm94LXNoYWRvdzogMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgICB9XG4gICAgXG4gICAgLm5vdGUtaXRlbTpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDEpO1xuICAgICAgYm94LXNoYWRvdzogMCA0cHggOHB4IHJnYmEoMCwgMCwgMCwgMC4xNSk7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XG4gICAgfVxuICAgIFxuICAgIC5ub3RlLXByZXZpZXcge1xuICAgICAgY29sb3I6ICMzNzQxNTE7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICBsaW5lLWhlaWdodDogMS40O1xuICAgICAgbWFyZ2luLWJvdHRvbTogOHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICB9XG4gICAgXG4gICAgLm5vdGUtZGF0ZSB7XG4gICAgICBmb250LXNpemU6IDExcHg7XG4gICAgICBjb2xvcjogIzljYTNhZjtcbiAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgfVxuXG4gICAgLyogQWN0aW9uIEJ1dHRvbnMgUmVkZXNpZ25lZCAqL1xuICAgIC5hY3Rpb24tYnRuIHtcbiAgICAgIHBhZGRpbmc6IDZweCA4cHg7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4wNSk7XG4gICAgICBjb2xvcjogcmdiYSgwLCAwLCAwLCAwLjcpO1xuICAgICAgbWluLXdpZHRoOiAzMnB4O1xuICAgICAgaGVpZ2h0OiAzMnB4O1xuICAgIH1cblxuICAgIC5hY3Rpb24tYnRuOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgICAgIGNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuOSk7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMDUpO1xuICAgIH1cblxuICAgIC5hY3Rpb24tYnRuLnJlYWQtb25seS1idG4ge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgxMDgsIDExNywgMTI1LCAwLjE1KTtcbiAgICAgIGNvbG9yOiByZ2JhKDEwOCwgMTE3LCAxMjUsIDAuOCk7XG4gICAgfVxuXG4gICAgLmFjdGlvbi1idG4ucmVhZC1vbmx5LWJ0bi5hY3RpdmUge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgxMDgsIDExNywgMTI1LCAwLjMpO1xuICAgICAgY29sb3I6IHJnYmEoMTA4LCAxMTcsIDEyNSwgMSk7XG4gICAgfVxuXG4gICAgLmFjdGlvbi1idG4uZGVsZXRlLWJ0biB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDIyMCwgNTMsIDY5LCAwLjEpO1xuICAgICAgY29sb3I6IHJnYmEoMjIwLCA1MywgNjksIDAuOCk7XG4gICAgfVxuXG4gICAgLmFjdGlvbi1idG4uZGVsZXRlLWJ0bjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDIyMCwgNTMsIDY5LCAwLjIpO1xuICAgICAgY29sb3I6IHJnYmEoMjIwLCA1MywgNjksIDEpO1xuICAgIH1cblxuICAgIC8qIE5vdGUgQ29udHJvbHMgQm90dG9tIC0gSW50ZWdyYXRlZCBEZXNpZ24gKi9cbiAgICAubm90ZS1jb250cm9scy1ib3R0b20ge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBwYWRkaW5nOiA4cHggMTJweDtcbiAgICAgIGJhY2tncm91bmQ6IHZhcigtLW5vdGUtYmctODAsIHJnYmEoMjU1LCAyNTEsIDE0NywgMC44KSk7XG4gICAgICBib3JkZXItcmFkaXVzOiAwIDAgNnB4IDZweDtcbiAgICAgIGZsZXgtc2hyaW5rOiAwO1xuICAgICAgZ2FwOiAxMnB4O1xuICAgIH1cblxuICAgIC5ub3RlLXRvb2xiYXIge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBnYXA6IDhweDtcbiAgICAgIGZsZXg6IDE7XG4gICAgfVxuXG4gICAgLyogVHJhbnNwYXJlbmN5IENvbnRyb2wgKi9cbiAgICAudHJhbnNwYXJlbmN5LWNvbnRyb2wge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBnYXA6IDZweDtcbiAgICB9XG5cbiAgICAudG9vbC1pY29uIHtcbiAgICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgICAgIGNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNyk7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICAgICAgcGFkZGluZzogNHB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgIH1cblxuICAgIC50b29sLWljb246aG92ZXIge1xuICAgICAgY29sb3I6IHJnYmEoMCwgMCwgMCwgMC45KTtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgICB9XG5cbiAgICAudHJhbnNwYXJlbmN5LXNsaWRlciB7XG4gICAgICB3aWR0aDogODBweDtcbiAgICAgIGhlaWdodDogNnB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjE1KTtcbiAgICAgIG91dGxpbmU6IG5vbmU7XG4gICAgICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgfVxuXG4gICAgLnRyYW5zcGFyZW5jeS1zbGlkZXI6Oi13ZWJraXQtc2xpZGVyLXRodW1iIHtcbiAgICAgIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcbiAgICAgIHdpZHRoOiAxNnB4O1xuICAgICAgaGVpZ2h0OiAxNnB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjYpO1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgYm94LXNoYWRvdzogMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgfVxuXG4gICAgLnRyYW5zcGFyZW5jeS1zbGlkZXI6Oi13ZWJraXQtc2xpZGVyLXRodW1iOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC44KTtcbiAgICAgIHRyYW5zZm9ybTogc2NhbGUoMS4xKTtcbiAgICB9XG5cbiAgICAudHJhbnNwYXJlbmN5LXNsaWRlcjo6LW1vei1yYW5nZS10aHVtYiB7XG4gICAgICB3aWR0aDogMTZweDtcbiAgICAgIGhlaWdodDogMTZweDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC42KTtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgIGJveC1zaGFkb3c6IDAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMik7XG4gICAgfVxuXG4gICAgLyogRm9udCBTaXplIENvbnRyb2wgKi9cbiAgICAuZm9udC1zaXplLWNvbnRyb2wge1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBnYXA6IDZweDtcbiAgICB9XG5cbiAgICAuZm9udC1zaXplLXBvcHVwIHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIGJvdHRvbTogMTAwJTtcbiAgICAgIGxlZnQ6IDUwJTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTtcbiAgICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgICAgYm9yZGVyOiAycHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgcGFkZGluZzogOHB4O1xuICAgICAgZGlzcGxheTogbm9uZTtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBnYXA6IDhweDtcbiAgICAgIGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgwLCAwLCAwLCAwLjE1KTtcbiAgICAgIG1hcmdpbi1ib3R0b206IDRweDtcbiAgICAgIHotaW5kZXg6IDEwMDA7XG4gICAgfVxuXG4gICAgLmZvbnQtc2l6ZS1wb3B1cC5hY3RpdmUge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICB9XG5cbiAgICAuZm9udC1zaXplLWJ0biB7XG4gICAgICB3aWR0aDogMjRweDtcbiAgICAgIGhlaWdodDogMjRweDtcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4yKTtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4wNSk7XG4gICAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICBjb2xvcjogcmdiYSgwLCAwLCAwLCAwLjcpO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgICB9XG5cbiAgICAuZm9udC1zaXplLWJ0bjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gICAgICBjb2xvcjogcmdiYSgwLCAwLCAwLCAwLjkpO1xuICAgIH1cblxuICAgIC5mb250LXNpemUtZGlzcGxheSB7XG4gICAgICBtaW4td2lkdGg6IDMwcHg7XG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgICAgY29sb3I6IHJnYmEoMCwgMCwgMCwgMC43KTtcbiAgICB9XG5cbiAgICAvKiBBY3Rpb24gQnV0dG9ucyAqL1xuICAgIC5ub3RlLWFjdGlvbnMge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBnYXA6IDZweDtcbiAgICB9XG5cblxuXG4gICAgLyogLi4uZXhpc3RpbmcgY29kZS4uLiAqL1xuICBgO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh3aWRnZXQpO1xuXG4gIC8vIFNldHVwIGltYWdlIGxvYWRpbmcgZXZlbnQgbGlzdGVuZXJzXG4gIGNvbnN0IHNtaWxleUltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzbWlsZXktaW1hZ2VcIikgYXMgSFRNTEltYWdlRWxlbWVudDtcbiAgY29uc3QgYWRkSW1hZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZC1pbWFnZVwiKSBhcyBIVE1MSW1hZ2VFbGVtZW50O1xuXG4gIGlmIChzbWlsZXlJbWFnZSkge1xuICAgIHNtaWxleUltYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwi4pyFIFNtaWxleSBmYWNlIGltYWdlIGxvYWRlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgfSk7XG4gICAgc21pbGV5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsICgpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCLinYwgRmFpbGVkIHRvIGxvYWQgc21pbGV5IGZhY2UgaW1hZ2U6XCIsIHNtaWx5RmFjZVVybCk7XG4gICAgICBzbWlsZXlJbWFnZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoYWRkSW1hZ2UpIHtcbiAgICBhZGRJbWFnZS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIuKchSBBZGQyIGltYWdlIGxvYWRlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgfSk7XG4gICAgYWRkSW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsICgpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCLinYwgRmFpbGVkIHRvIGxvYWQgYWRkMiBpbWFnZTpcIiwgYWRkMlVybCk7XG4gICAgICBhZGRJbWFnZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfSk7XG4gIH1cblxuICBzZXR1cFdpZGdldEV2ZW50cygpO1xufVxuXG5mdW5jdGlvbiBzZXR1cFdpZGdldEV2ZW50cygpIHtcbiAgY29uc3QgbWFpbkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbi1idXR0b25cIik7XG4gIGNvbnN0IG1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndpZGdldC1tZW51XCIpO1xuXG4gIGlmICghbWFpbkJ1dHRvbiB8fCAhbWVudSkgcmV0dXJuO1xuXG4gIGxldCBkcmFnU3RhcnRUaW1lID0gMDtcbiAgbGV0IHN0YXJ0UG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcbiAgbGV0IGhhc01vdmVkV2hpbGVEcmFnZ2luZyA9IGZhbHNlO1xuXG4gIC8vIEJvdW5kYXJ5IGNvbnN0cmFpbnQgZnVuY3Rpb25cbiAgZnVuY3Rpb24gY29uc3RyYWluVG9Cb3VuZHMoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0ge1xuICAgIGlmICghd2lkZ2V0KSByZXR1cm4geyB4LCB5IH07XG5cbiAgICBjb25zdCB3aWRnZXRSZWN0ID0geyB3aWR0aDogNTAsIGhlaWdodDogNTAgfTsgLy8gV2lkZ2V0IGRpbWVuc2lvbnNcbiAgICBjb25zdCB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIGNvbnN0IHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBjb25zdCBtYXJnaW4gPSAxMDsgLy8gTWluaW11bSBtYXJnaW4gZnJvbSBlZGdlc1xuXG4gICAgLy8gQ29uc3RyYWluIGhvcml6b250YWwgcG9zaXRpb25cbiAgICBsZXQgY29uc3RyYWluZWRYID0gTWF0aC5tYXgobWFyZ2luLCB4KTtcbiAgICBjb25zdHJhaW5lZFggPSBNYXRoLm1pbih3aW5kb3dXaWR0aCAtIHdpZGdldFJlY3Qud2lkdGggLSBtYXJnaW4sIGNvbnN0cmFpbmVkWCk7XG5cbiAgICAvLyBDb25zdHJhaW4gdmVydGljYWwgcG9zaXRpb25cbiAgICBsZXQgY29uc3RyYWluZWRZID0gTWF0aC5tYXgobWFyZ2luLCB5KTtcbiAgICBjb25zdHJhaW5lZFkgPSBNYXRoLm1pbih3aW5kb3dIZWlnaHQgLSB3aWRnZXRSZWN0LmhlaWdodCAtIG1hcmdpbiwgY29uc3RyYWluZWRZKTtcblxuICAgIHJldHVybiB7IHg6IGNvbnN0cmFpbmVkWCwgeTogY29uc3RyYWluZWRZIH07XG4gIH1cblxuICAvLyBTbmFwIHRvIG5lYXJlc3QgZWRnZSBmdW5jdGlvblxuICBmdW5jdGlvbiBzbmFwVG9OZWFyZXN0RWRnZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB7XG4gICAgaWYgKCF3aWRnZXQpIHJldHVybiB7IHgsIHkgfTtcblxuICAgIGNvbnN0IHdpZGdldFJlY3QgPSB7IHdpZHRoOiA1MCwgaGVpZ2h0OiA1MCB9O1xuICAgIGNvbnN0IHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgY29uc3Qgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIGNvbnN0IHNuYXBNYXJnaW4gPSAyMDsgLy8gRGlzdGFuY2UgZnJvbSBlZGdlIHRvIHNuYXAgdG9cblxuICAgIC8vIENhbGN1bGF0ZSBkaXN0YW5jZXMgdG8gZWFjaCBlZGdlXG4gICAgY29uc3QgZGlzdGFuY2VUb0xlZnQgPSB4O1xuICAgIGNvbnN0IGRpc3RhbmNlVG9SaWdodCA9IHdpbmRvd1dpZHRoIC0gKHggKyB3aWRnZXRSZWN0LndpZHRoKTtcbiAgICBjb25zdCBkaXN0YW5jZVRvVG9wID0geTtcbiAgICBjb25zdCBkaXN0YW5jZVRvQm90dG9tID0gd2luZG93SGVpZ2h0IC0gKHkgKyB3aWRnZXRSZWN0LmhlaWdodCk7XG5cbiAgICAvLyBGaW5kIHRoZSBuZWFyZXN0IGVkZ2VcbiAgICBjb25zdCBtaW5EaXN0YW5jZSA9IE1hdGgubWluKGRpc3RhbmNlVG9MZWZ0LCBkaXN0YW5jZVRvUmlnaHQsIGRpc3RhbmNlVG9Ub3AsIGRpc3RhbmNlVG9Cb3R0b20pO1xuXG4gICAgbGV0IHNuYXBwZWRYID0geDtcbiAgICBsZXQgc25hcHBlZFkgPSB5O1xuXG4gICAgLy8gU25hcCB0byB0aGUgbmVhcmVzdCBlZGdlIGlmIHdpZGdldCBpcyBwYXJ0aWFsbHkgaGlkZGVuXG4gICAgaWYgKHggPCAwIHx8IHggKyB3aWRnZXRSZWN0LndpZHRoID4gd2luZG93V2lkdGggfHwgeSA8IDAgfHwgeSArIHdpZGdldFJlY3QuaGVpZ2h0ID4gd2luZG93SGVpZ2h0KSB7XG4gICAgICBpZiAobWluRGlzdGFuY2UgPT09IGRpc3RhbmNlVG9MZWZ0KSB7XG4gICAgICAgIHNuYXBwZWRYID0gc25hcE1hcmdpbjtcbiAgICAgIH0gZWxzZSBpZiAobWluRGlzdGFuY2UgPT09IGRpc3RhbmNlVG9SaWdodCkge1xuICAgICAgICBzbmFwcGVkWCA9IHdpbmRvd1dpZHRoIC0gd2lkZ2V0UmVjdC53aWR0aCAtIHNuYXBNYXJnaW47XG4gICAgICB9IGVsc2UgaWYgKG1pbkRpc3RhbmNlID09PSBkaXN0YW5jZVRvVG9wKSB7XG4gICAgICAgIHNuYXBwZWRZID0gc25hcE1hcmdpbjtcbiAgICAgIH0gZWxzZSBpZiAobWluRGlzdGFuY2UgPT09IGRpc3RhbmNlVG9Cb3R0b20pIHtcbiAgICAgICAgc25hcHBlZFkgPSB3aW5kb3dIZWlnaHQgLSB3aWRnZXRSZWN0LmhlaWdodCAtIHNuYXBNYXJnaW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgeDogc25hcHBlZFgsIHk6IHNuYXBwZWRZIH07XG4gIH1cblxuICAvLyBNb3VzZSBldmVudHMgZm9yIG1haW4gYnV0dG9uXG4gIG1haW5CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBkcmFnU3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBzdGFydFBvc2l0aW9uID0geyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSB9O1xuICAgIGhhc01vdmVkV2hpbGVEcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgY29uc3QgcmVjdCA9IHdpZGdldCEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgZHJhZ09mZnNldC54ID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgIGRyYWdPZmZzZXQueSA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgbWFpbkJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiZHJhZ2dpbmdcIik7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGhhbmRsZU1vdXNlTW92ZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgaGFuZGxlTW91c2VVcCk7XG4gIH0pO1xuXG4gIC8vIEltcHJvdmVkIGhvdmVyIGV2ZW50cyBmb3IgbWVudSB3aXRoIGJldHRlciBib3VuZGFyeSBkZXRlY3Rpb25cbiAgbWFpbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgaWYgKCFpc0RyYWdnaW5nKSB7XG4gICAgICAvLyBDbGVhciBhbnkgcGVuZGluZyBjbG9zZSB0aW1lb3V0XG4gICAgICBpZiAobWVudUNsb3NlVGltZW91dCkge1xuICAgICAgICBjbGVhclRpbWVvdXQobWVudUNsb3NlVGltZW91dCk7XG4gICAgICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBudWxsO1xuICAgICAgfVxuICAgICAgb3Blbk1lbnUoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEtlZXAgbWVudSBvcGVuIHdoZW4gaG92ZXJpbmcgb3ZlciBtZW51IGl0ZW1zXG4gIG1lbnUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGlmIChtZW51Q2xvc2VUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQobWVudUNsb3NlVGltZW91dCk7XG4gICAgICBtZW51Q2xvc2VUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIENsb3NlIG1lbnUgd2hlbiBsZWF2aW5nIG1lbnUgYXJlYVxuICBtZW51LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBpZiAoIWlzRHJhZ2dpbmcpIHtcbiAgICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY2xvc2VNZW51KCk7XG4gICAgICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBudWxsO1xuICAgICAgfSwgMTAwKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIENsb3NlIG1lbnUgd2hlbiBsZWF2aW5nIG1haW4gYnV0dG9uIGFyZWEgKGJ1dCBub3QgaWYgZ29pbmcgdG8gbWVudSlcbiAgbWFpbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZSkgPT4ge1xuICAgIGlmICghaXNEcmFnZ2luZykge1xuICAgICAgLy8gQ2hlY2sgaWYgbW91c2UgaXMgbW92aW5nIHRvd2FyZHMgdGhlIG1lbnVcbiAgICAgIGNvbnN0IHJlY3QgPSBtZW51LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3QgbW91c2VYID0gZS5jbGllbnRYO1xuICAgICAgY29uc3QgbW91c2VZID0gZS5jbGllbnRZO1xuXG4gICAgICAvLyBJZiBtb3VzZSBpcyB3aXRoaW4gbWVudSBib3VuZHMgb3IgbW92aW5nIHRvd2FyZHMgbWVudSwgZG9uJ3QgY2xvc2VcbiAgICAgIGNvbnN0IGlzTmVhck1lbnUgPSBtb3VzZVggPj0gcmVjdC5sZWZ0IC0gMTAgJiYgbW91c2VYIDw9IHJlY3QucmlnaHQgKyAxMCAmJiBtb3VzZVkgPj0gcmVjdC50b3AgLSAxMCAmJiBtb3VzZVkgPD0gcmVjdC5ib3R0b20gKyAxMDtcblxuICAgICAgaWYgKCFpc05lYXJNZW51KSB7XG4gICAgICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjbG9zZU1lbnUoKTtcbiAgICAgICAgICBtZW51Q2xvc2VUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlTW92ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgY29uc3QgdGltZURpZmYgPSBEYXRlLm5vdygpIC0gZHJhZ1N0YXJ0VGltZTtcbiAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyhlLmNsaWVudFggLSBzdGFydFBvc2l0aW9uLngsIDIpICsgTWF0aC5wb3coZS5jbGllbnRZIC0gc3RhcnRQb3NpdGlvbi55LCAyKSk7XG5cbiAgICAvLyBTdGFydCBkcmFnZ2luZyBpZiBtb3ZlZCA+IDNweCBvciBoZWxkIGZvciA+IDEwMG1zXG4gICAgaWYgKCFpc0RyYWdnaW5nICYmIChkaXN0YW5jZSA+IDMgfHwgdGltZURpZmYgPiAxMDApKSB7XG4gICAgICBpc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgIGhhc01vdmVkV2hpbGVEcmFnZ2luZyA9IHRydWU7XG4gICAgICBjbG9zZU1lbnUoKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gXCJncmFiYmluZ1wiO1xuICAgIH1cblxuICAgIGlmIChpc0RyYWdnaW5nKSB7XG4gICAgICBjb25zdCBuZXdYID0gZS5jbGllbnRYIC0gZHJhZ09mZnNldC54O1xuICAgICAgY29uc3QgbmV3WSA9IGUuY2xpZW50WSAtIGRyYWdPZmZzZXQueTtcblxuICAgICAgLy8gQXBwbHkgYm91bmRhcnkgY29uc3RyYWludHNcbiAgICAgIGNvbnN0IGNvbnN0cmFpbmVkUG9zaXRpb24gPSBjb25zdHJhaW5Ub0JvdW5kcyhuZXdYLCBuZXdZKTtcblxuICAgICAgLy8gVXNlIHRyYW5zZm9ybSBmb3Igc21vb3RoZXIgbW92ZW1lbnRcbiAgICAgIHdpZGdldCEuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke2NvbnN0cmFpbmVkUG9zaXRpb24ueH1weCwgJHtjb25zdHJhaW5lZFBvc2l0aW9uLnl9cHgpYDtcbiAgICAgIHdpZGdldCEuc3R5bGUubGVmdCA9IFwiMFwiO1xuICAgICAgd2lkZ2V0IS5zdHlsZS50b3AgPSBcIjBcIjtcblxuICAgICAgbGFzdFBvc2l0aW9uID0geyB4OiBjb25zdHJhaW5lZFBvc2l0aW9uLngsIHk6IGNvbnN0cmFpbmVkUG9zaXRpb24ueSB9O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlVXAoKSB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBoYW5kbGVNb3VzZU1vdmUpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGhhbmRsZU1vdXNlVXApO1xuXG4gICAgaWYgKG1haW5CdXR0b24pIHtcbiAgICAgIG1haW5CdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImRyYWdnaW5nXCIpO1xuICAgIH1cbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IFwiXCI7XG5cbiAgICBpZiAoaXNEcmFnZ2luZykge1xuICAgICAgLy8gQXBwbHkgZWRnZSBzbmFwcGluZyBpZiB3aWRnZXQgaXMgcGFydGlhbGx5IG91dHNpZGUgYm91bmRzXG4gICAgICBjb25zdCBzbmFwcGVkUG9zaXRpb24gPSBzbmFwVG9OZWFyZXN0RWRnZShsYXN0UG9zaXRpb24ueCwgbGFzdFBvc2l0aW9uLnkpO1xuXG4gICAgICAvLyBBbmltYXRlIHRvIHNuYXBwZWQgcG9zaXRpb24gaWYgZGlmZmVyZW50IGZyb20gY3VycmVudCBwb3NpdGlvblxuICAgICAgaWYgKHNuYXBwZWRQb3NpdGlvbi54ICE9PSBsYXN0UG9zaXRpb24ueCB8fCBzbmFwcGVkUG9zaXRpb24ueSAhPT0gbGFzdFBvc2l0aW9uLnkpIHtcbiAgICAgICAgd2lkZ2V0IS5zdHlsZS50cmFuc2l0aW9uID0gXCJhbGwgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpXCI7XG4gICAgICAgIHdpZGdldCEuc3R5bGUubGVmdCA9IHNuYXBwZWRQb3NpdGlvbi54ICsgXCJweFwiO1xuICAgICAgICB3aWRnZXQhLnN0eWxlLnRvcCA9IHNuYXBwZWRQb3NpdGlvbi55ICsgXCJweFwiO1xuICAgICAgICB3aWRnZXQhLnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRyYW5zaXRpb24gYWZ0ZXIgYW5pbWF0aW9uXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmICh3aWRnZXQpIHtcbiAgICAgICAgICAgIHdpZGdldC5zdHlsZS50cmFuc2l0aW9uID0gXCJcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDMwMCk7XG5cbiAgICAgICAgbGFzdFBvc2l0aW9uID0gc25hcHBlZFBvc2l0aW9uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXBwbHkgZmluYWwgcG9zaXRpb24gbm9ybWFsbHlcbiAgICAgICAgd2lkZ2V0IS5zdHlsZS5sZWZ0ID0gbGFzdFBvc2l0aW9uLnggKyBcInB4XCI7XG4gICAgICAgIHdpZGdldCEuc3R5bGUudG9wID0gbGFzdFBvc2l0aW9uLnkgKyBcInB4XCI7XG4gICAgICAgIHdpZGdldCEuc3R5bGUudHJhbnNmb3JtID0gXCJcIjtcbiAgICAgIH1cblxuICAgICAgc2F2ZVdpZGdldFBvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgaXNEcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgLy8gT3BlbiBtZW51IGFmdGVyIGRyYWcgaWYgbm90IG1vdmVkIG11Y2hcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICghaGFzTW92ZWRXaGlsZURyYWdnaW5nKSB7XG4gICAgICAgIG9wZW5NZW51KCk7XG4gICAgICB9XG4gICAgfSwgNTApO1xuICB9XG5cbiAgLy8gTWVudSBidXR0b24gY2xpY2tzIHdpdGggZGVib3VuY2VcbiAgbGV0IGxhc3RDbGlja1RpbWUgPSAwO1xuICBtZW51Py5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICBjb25zdCBhY3Rpb24gPSB0YXJnZXQuZGF0YXNldC5hY3Rpb247XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblxuICAgIC8vIERlYm91bmNlIGNsaWNrcyAtIHByZXZlbnQgbXVsdGlwbGUgY2xpY2tzIHdpdGhpbiA1MDBtc1xuICAgIGlmIChub3cgLSBsYXN0Q2xpY2tUaW1lIDwgNTAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxhc3RDbGlja1RpbWUgPSBub3c7XG5cbiAgICBpZiAoYWN0aW9uKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIk1lbnUgYnV0dG9uIGNsaWNrZWQ6XCIsIGFjdGlvbik7XG4gICAgICBoYW5kbGVNZW51QWN0aW9uKGFjdGlvbik7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gb3Blbk1lbnUoKSB7XG4gIGlmIChpc0RyYWdnaW5nKSByZXR1cm47XG4gIGNvbnN0IG1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndpZGdldC1tZW51XCIpO1xuICBjb25zdCB3aWRnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0aWNreS1ub3RlLXdpZGdldFwiKTtcbiAgXG4gIGlmIChtZW51ICYmIHdpZGdldCkge1xuICAgIC8vIENoZWNrIGlmIHdpZGdldCBpcyBpbiB0aGUgbG93ZXIgaGFsZiBvZiB0aGUgc2NyZWVuXG4gICAgY29uc3Qgd2lkZ2V0UmVjdCA9IHdpZGdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgY29uc3QgaXNJbkxvd2VySGFsZiA9IHdpZGdldFJlY3QudG9wID4gd2luZG93SGVpZ2h0IC8gMjtcbiAgICBcbiAgICBpZiAoaXNJbkxvd2VySGFsZikge1xuICAgICAgLy8gUG9zaXRpb24gbWVudSBhYm92ZSB0aGUgd2lkZ2V0XG4gICAgICBtZW51LmNsYXNzTGlzdC5hZGQoXCJ0b3AtcG9zaXRpb25lZFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUG9zaXRpb24gbWVudSBiZWxvdyB0aGUgd2lkZ2V0IChkZWZhdWx0KVxuICAgICAgbWVudS5jbGFzc0xpc3QucmVtb3ZlKFwidG9wLXBvc2l0aW9uZWRcIik7XG4gICAgfVxuICAgIFxuICAgIG1lbnUuY2xhc3NMaXN0LmFkZChcIm9wZW5cIik7XG4gICAgaXNNZW51T3BlbiA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xvc2VNZW51KCkge1xuICBjb25zdCBtZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3aWRnZXQtbWVudVwiKTtcbiAgaWYgKG1lbnUpIHtcbiAgICBtZW51LmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpO1xuICAgIGlzTWVudU9wZW4gPSBmYWxzZTtcbiAgfVxuICAvLyBDbGVhciBhbnkgcGVuZGluZyB0aW1lb3V0XG4gIGlmIChtZW51Q2xvc2VUaW1lb3V0KSB7XG4gICAgY2xlYXJUaW1lb3V0KG1lbnVDbG9zZVRpbWVvdXQpO1xuICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZU1lbnVBY3Rpb24oYWN0aW9uOiBzdHJpbmcpIHtcbiAgY29uc29sZS5sb2coXCJNZW51IGFjdGlvbiB0cmlnZ2VyZWQ6XCIsIGFjdGlvbik7XG4gIGNsb3NlTWVudSgpOyAvLyBDbG9zZSBtZW51IGltbWVkaWF0ZWx5IHdoZW4gYWN0aW9uIGlzIHRyaWdnZXJlZFxuICBcbiAgLy8gQWRkIHNtYWxsIGRlbGF5IHRvIHByZXZlbnQgbXVsdGlwbGUgY2xpY2tzXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlIFwiYWRkXCI6XG4gICAgICAgIGNyZWF0ZU5vdGVFZGl0b3IoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwibm90ZXNcIjpcbiAgICAgICAgdG9nZ2xlTm90ZXNQYW5lbCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJzZXR0aW5nc1wiOlxuICAgICAgICBvcGVuU2V0dGluZ3NNb2RhbCgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0sIDEwMCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5vdGVFZGl0b3IoaW5pdGlhbFRleHQ6IHN0cmluZyA9IFwiXCIpIHtcbiAgY29uc3Qgc3RpY2t5Tm90ZSA9IGNyZWF0ZVN0aWNreU5vdGUoaW5pdGlhbFRleHQpO1xuICBcbiAgLy8gQXV0by1mb2N1cyB0aGUgdGV4dGFyZWEgd2hlbiBjcmVhdGVkIHZpYSBzaG9ydGN1dFxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBjb25zdCB0ZXh0YXJlYSA9IHN0aWNreU5vdGUucXVlcnlTZWxlY3RvcihcIi5zdGlja3ktbm90ZS10ZXh0YXJlYVwiKSBhcyBIVE1MVGV4dEFyZWFFbGVtZW50O1xuICAgIGlmICh0ZXh0YXJlYSkge1xuICAgICAgdGV4dGFyZWEuZm9jdXMoKTtcbiAgICAgIHRleHRhcmVhLnNldFNlbGVjdGlvblJhbmdlKHRleHRhcmVhLnZhbHVlLmxlbmd0aCwgdGV4dGFyZWEudmFsdWUubGVuZ3RoKTsgLy8gUGxhY2UgY3Vyc29yIGF0IGVuZFxuICAgIH1cbiAgfSwgMTAwKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3RpY2t5Tm90ZShjb250ZW50OiBzdHJpbmcgPSBcIlwiKSB7XG4gIGNvbnN0IG5vdGVJZCA9IERhdGUubm93KCkudG9TdHJpbmcoKTtcbiAgY29uc3Qgbm90ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG5vdGUuY2xhc3NOYW1lID0gXCJzdGlja3ktbm90ZVwiO1xuICBub3RlLmlkID0gYHN0aWNreS1ub3RlLSR7bm90ZUlkfWA7XG4gIFxuICAvLyBBcnJheSBvZiByZWFsaXN0aWMgc3RpY2t5IG5vdGUgY29sb3JzXG4gIGNvbnN0IHN0aWNreUNvbG9ycyA9IFtcbiAgICAncmdiYSgyNTUsIDI1MSwgMTQ3LCAwLjk1KScsIC8vIENsYXNzaWMgeWVsbG93XG4gICAgJ3JnYmEoMjU1LCAyMzcsIDIxMywgMC45NSknLCAvLyBMaWdodCBwZWFjaFxuICAgICdyZ2JhKDIzNywgMjU1LCAyMzUsIDAuOTUpJywgLy8gTGlnaHQgZ3JlZW5cbiAgICAncmdiYSgyMzUsIDI0NSwgMjU1LCAwLjk1KScsIC8vIExpZ2h0IGJsdWVcbiAgICAncmdiYSgyNTUsIDIzNSwgMjU1LCAwLjk1KScsIC8vIExpZ2h0IHBpbmtcbiAgICAncmdiYSgyNTUsIDI0MywgMjA1LCAwLjk1KScsIC8vIExpZ2h0IG9yYW5nZVxuICAgICdyZ2JhKDI0MywgMjM1LCAyNTUsIDAuOTUpJywgLy8gTGlnaHQgcHVycGxlXG4gIF07XG4gIFxuICAvLyBTZWxlY3QgcmFuZG9tIGNvbG9yXG4gIGNvbnN0IHJhbmRvbUNvbG9yID0gc3RpY2t5Q29sb3JzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHN0aWNreUNvbG9ycy5sZW5ndGgpXTtcbiAgXG4gIG5vdGUuaW5uZXJIVE1MID0gYFxuICAgIDxkaXYgY2xhc3M9XCJzdGlja3ktbm90ZS1oZWFkZXJcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwibm90ZS10aXRsZVwiPlN0aWNreSBOb3RlLi4uPC9zcGFuPlxuICAgICAgPGRpdiBjbGFzcz1cIm5vdGUtY29udHJvbHNcIj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm5vdGUtY29udHJvbC1idG4gcGluLWJ0blwiIHRpdGxlPVwiUGluIG5vdGUgKGFsd2F5cyBvbiB0b3ApXCI+8J+TjDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwibm90ZS1jb250cm9sLWJ0biBtaW5pbWl6ZS1idG5cIiB0aXRsZT1cIk1pbmltaXplXCI+4oiSPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJub3RlLWNvbnRyb2wtYnRuIGNsb3NlLWJ0blwiIHRpdGxlPVwiQ2xvc2VcIj7DlzwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgPHRleHRhcmVhIGNsYXNzPVwic3RpY2t5LW5vdGUtdGV4dGFyZWFcIiBwbGFjZWhvbGRlcj1cIldyaXRlIHlvdXIgbm90ZSBoZXJlLi4uXCIgc3R5bGU9XCJmb250LXNpemU6IDEzcHg7XCI+JHtjb250ZW50fTwvdGV4dGFyZWE+XG4gICAgPGRpdiBjbGFzcz1cIm5vdGUtY29udHJvbHMtYm90dG9tXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwibm90ZS10b29sYmFyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0cmFuc3BhcmVuY3ktY29udHJvbFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwidG9vbC1pY29uXCI+8J+Rge+4jzwvc3Bhbj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgY2xhc3M9XCJ0cmFuc3BhcmVuY3ktc2xpZGVyXCIgbWluPVwiMC4zXCIgbWF4PVwiMVwiIHN0ZXA9XCIwLjFcIiB2YWx1ZT1cIjAuOTVcIj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb250LXNpemUtY29udHJvbFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwidG9vbC1pY29uIGZvbnQtc2l6ZS10b2dnbGVcIj5BYTwvc3Bhbj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9udC1zaXplLXBvcHVwXCI+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZm9udC1zaXplLWJ0biBkZWNyZWFzZS1mb250XCI+4oiSPC9idXR0b24+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtc2l6ZS1kaXNwbGF5XCI+MTM8L3NwYW4+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZm9udC1zaXplLWJ0biBpbmNyZWFzZS1mb250XCI+KzwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIm5vdGUtYWN0aW9uc1wiPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYWN0aW9uLWJ0biBkZWxldGUtYnRuXCIgdGl0bGU9XCJEZWxldGUgTm90ZVwiPvCfl5HvuI88L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJub3RlLXJlc2l6ZS1oYW5kbGVcIj48L2Rpdj5cbiAgYDtcblxuICAvLyBBcHBseSB0aGUgcmFuZG9tIGNvbG9yIGFuZCBzbGlnaHQgcm90YXRpb25cbiAgbm90ZS5zdHlsZS5iYWNrZ3JvdW5kID0gcmFuZG9tQ29sb3I7XG4gIFxuICAvLyBBZGQgc2xpZ2h0IHJhbmRvbSByb3RhdGlvbiBmb3IgcmVhbGlzdGljIGxvb2tcbiAgY29uc3QgcmFuZG9tUm90YXRpb24gPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiA0OyAvLyAtMiB0byArMiBkZWdyZWVzXG4gIG5vdGUuc3R5bGUuc2V0UHJvcGVydHkoJy0tbm90ZS1yb3RhdGlvbicsIGAke3JhbmRvbVJvdGF0aW9ufWRlZ2ApO1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm90ZSk7XG5cbiAgLy8gUG9zaXRpb24gdGhlIG5vdGUgbmVhciB0aGUgd2lkZ2V0IGJ1dCBub3Qgb3ZlcmxhcHBpbmdcbiAgY29uc3Qgd2lkZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGlja3ktbm90ZS13aWRnZXRcIik7XG4gIGlmICh3aWRnZXQpIHtcbiAgICBjb25zdCB3aWRnZXRSZWN0ID0gd2lkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIG5vdGUuc3R5bGUubGVmdCA9IE1hdGgubWF4KDIwLCB3aWRnZXRSZWN0LmxlZnQgLSAzMjApICsgXCJweFwiO1xuICAgIG5vdGUuc3R5bGUudG9wID0gTWF0aC5tYXgoMjAsIHdpZGdldFJlY3QudG9wKSArIFwicHhcIjtcbiAgfSBlbHNlIHtcbiAgICBub3RlLnN0eWxlLmxlZnQgPSBcIjEwMHB4XCI7XG4gICAgbm90ZS5zdHlsZS50b3AgPSBcIjEwMHB4XCI7XG4gIH1cblxuICBzZXRUaW1lb3V0KCgpID0+IG5vdGUuY2xhc3NMaXN0LmFkZChcIm9wZW5cIiksIDEwKTtcblxuICBzZXR1cFN0aWNreU5vdGVFdmVudHMobm90ZSwgbm90ZUlkKTtcbiAgcmV0dXJuIG5vdGU7XG59XG5cbmZ1bmN0aW9uIHNldHVwU3RpY2t5Tm90ZUV2ZW50cyhub3RlOiBIVE1MRWxlbWVudCwgbm90ZUlkOiBzdHJpbmcpIHtcbiAgY29uc3QgaGVhZGVyID0gbm90ZS5xdWVyeVNlbGVjdG9yKFwiLnN0aWNreS1ub3RlLWhlYWRlclwiKSBhcyBIVE1MRWxlbWVudDtcbiAgY29uc3QgdGV4dGFyZWEgPSBub3RlLnF1ZXJ5U2VsZWN0b3IoXCIuc3RpY2t5LW5vdGUtdGV4dGFyZWFcIikgYXMgSFRNTFRleHRBcmVhRWxlbWVudDtcbiAgY29uc3QgY2xvc2VCdG4gPSBub3RlLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2UtYnRuXCIpO1xuICBjb25zdCBtaW5pbWl6ZUJ0biA9IG5vdGUucXVlcnlTZWxlY3RvcihcIi5taW5pbWl6ZS1idG5cIik7XG4gIGNvbnN0IHBpbkJ0biA9IG5vdGUucXVlcnlTZWxlY3RvcihcIi5waW4tYnRuXCIpO1xuICBjb25zdCByZXNpemVIYW5kbGUgPSBub3RlLnF1ZXJ5U2VsZWN0b3IoXCIubm90ZS1yZXNpemUtaGFuZGxlXCIpIGFzIEhUTUxFbGVtZW50O1xuICBjb25zdCB0cmFuc3BhcmVuY3lTbGlkZXIgPSBub3RlLnF1ZXJ5U2VsZWN0b3IoXCIudHJhbnNwYXJlbmN5LXNsaWRlclwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICBjb25zdCBkZWxldGVCdG4gPSBub3RlLnF1ZXJ5U2VsZWN0b3IoXCIuZGVsZXRlLWJ0blwiKTtcbiAgY29uc3QgZm9udFNpemVUb2dnbGUgPSBub3RlLnF1ZXJ5U2VsZWN0b3IoXCIuZm9udC1zaXplLXRvZ2dsZVwiKSBhcyBIVE1MRWxlbWVudDtcbiAgY29uc3QgZm9udFNpemVQb3B1cCA9IG5vdGUucXVlcnlTZWxlY3RvcihcIi5mb250LXNpemUtcG9wdXBcIikgYXMgSFRNTEVsZW1lbnQ7XG4gIGNvbnN0IGluY3JlYXNlRm9udEJ0biA9IG5vdGUucXVlcnlTZWxlY3RvcihcIi5pbmNyZWFzZS1mb250XCIpIGFzIEhUTUxFbGVtZW50O1xuICBjb25zdCBkZWNyZWFzZUZvbnRCdG4gPSBub3RlLnF1ZXJ5U2VsZWN0b3IoXCIuZGVjcmVhc2UtZm9udFwiKSBhcyBIVE1MRWxlbWVudDtcbiAgY29uc3QgZm9udFNpemVEaXNwbGF5ID0gbm90ZS5xdWVyeVNlbGVjdG9yKFwiLmZvbnQtc2l6ZS1kaXNwbGF5XCIpIGFzIEhUTUxFbGVtZW50O1xuXG4gIGxldCBpc0RyYWdnaW5nID0gZmFsc2U7XG4gIGxldCBpc1Jlc2l6aW5nID0gZmFsc2U7XG4gIGxldCBkcmFnT2Zmc2V0ID0geyB4OiAwLCB5OiAwIH07XG4gIGxldCBpc1Bpbm5lZCA9IGZhbHNlO1xuICBsZXQgaXNNaW5pbWl6ZWQgPSBmYWxzZTtcbiAgbGV0IGN1cnJlbnRUcmFuc3BhcmVuY3kgPSAwLjk1O1xuICBsZXQgY3VycmVudEZvbnRTaXplID0gMTM7XG4gIGxldCBpc1JlYWRPbmx5ID0gZmFsc2U7XG5cbiAgLy8gU2V0IHVwIGluaXRpYWwgY29sb3Igc2NoZW1lIGJhc2VkIG9uIG5vdGUgYmFja2dyb3VuZFxuICBjb25zdCBub3RlQ29sb3IgPSBub3RlLnN0eWxlLmJhY2tncm91bmQgfHwgJ3JnYmEoMjU1LCAyNTEsIDE0NywgMC45NSknO1xuICBjb25zdCBiYXNlQ29sb3IgPSBub3RlQ29sb3IucmVwbGFjZSgnMC45NScsICcwLjgnKTtcbiAgY29uc3QgbGlnaHRlckNvbG9yID0gbm90ZUNvbG9yLnJlcGxhY2UoJzAuOTUnLCAnMC42Jyk7XG4gIFxuICBub3RlLnN0eWxlLnNldFByb3BlcnR5KCctLW5vdGUtYmctODAnLCBiYXNlQ29sb3IpO1xuICBub3RlLnN0eWxlLnNldFByb3BlcnR5KCctLW5vdGUtYmctNjAnLCBsaWdodGVyQ29sb3IpO1xuICBub3RlLnN0eWxlLnNldFByb3BlcnR5KCctLW5vdGUtb3BhY2l0eScsIGN1cnJlbnRUcmFuc3BhcmVuY3kudG9TdHJpbmcoKSk7XG5cbiAgLy8gVHJhbnNwYXJlbmN5IHNsaWRlciBmdW5jdGlvbmFsaXR5XG4gIHRyYW5zcGFyZW5jeVNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgIGN1cnJlbnRUcmFuc3BhcmVuY3kgPSBwYXJzZUZsb2F0KHRyYW5zcGFyZW5jeVNsaWRlci52YWx1ZSk7XG4gICAgbm90ZS5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1ub3RlLW9wYWNpdHknLCBjdXJyZW50VHJhbnNwYXJlbmN5LnRvU3RyaW5nKCkpO1xuICAgIFxuICAgIC8vIFVwZGF0ZSBiYWNrZ3JvdW5kIGNvbG9ycyB0byBtYXRjaCB0cmFuc3BhcmVuY3lcbiAgICBjb25zdCBuZXdCZyA9IG5vdGVDb2xvci5yZXBsYWNlKCcwLjk1JywgY3VycmVudFRyYW5zcGFyZW5jeS50b1N0cmluZygpKTtcbiAgICBjb25zdCBuZXc4MEJnID0gbm90ZUNvbG9yLnJlcGxhY2UoJzAuOTUnLCAoY3VycmVudFRyYW5zcGFyZW5jeSAqIDAuOCkudG9TdHJpbmcoKSk7XG4gICAgY29uc3QgbmV3NjBCZyA9IG5vdGVDb2xvci5yZXBsYWNlKCcwLjk1JywgKGN1cnJlbnRUcmFuc3BhcmVuY3kgKiAwLjYpLnRvU3RyaW5nKCkpO1xuICAgIFxuICAgIG5vdGUuc3R5bGUuYmFja2dyb3VuZCA9IG5ld0JnO1xuICAgIG5vdGUuc3R5bGUuc2V0UHJvcGVydHkoJy0tbm90ZS1iZy04MCcsIG5ldzgwQmcpO1xuICAgIG5vdGUuc3R5bGUuc2V0UHJvcGVydHkoJy0tbm90ZS1iZy02MCcsIG5ldzYwQmcpO1xuICB9KTtcblxuXG5cbiAgLy8gRHJhZ2dpbmcgZnVuY3Rpb25hbGl0eVxuICBoZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xuICAgIGlmICgoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmNsYXNzTGlzdC5jb250YWlucyhcIm5vdGUtY29udHJvbC1idG5cIikpIHJldHVybjtcblxuICAgIGlzRHJhZ2dpbmcgPSB0cnVlO1xuICAgIGNvbnN0IHJlY3QgPSBub3RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGRyYWdPZmZzZXQueCA9IGUuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICBkcmFnT2Zmc2V0LnkgPSBlLmNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgIC8vIEFkZCBzbW9vdGggY3Vyc29yIGFuZCBkaXNhYmxlIHRyYW5zaXRpb25zIGR1cmluZyBkcmFnXG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBcImdyYWJiaW5nXCI7XG4gICAgbm90ZS5zdHlsZS50cmFuc2l0aW9uID0gXCJub25lXCI7XG4gICAgbm90ZS5zdHlsZS51c2VyU2VsZWN0ID0gXCJub25lXCI7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGhhbmRsZURyYWcpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHN0b3BEcmFnKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZURyYWcoZTogTW91c2VFdmVudCkge1xuICAgIGlmICghaXNEcmFnZ2luZykgcmV0dXJuO1xuXG4gICAgY29uc3QgbmV3WCA9IGUuY2xpZW50WCAtIGRyYWdPZmZzZXQueDtcbiAgICBjb25zdCBuZXdZID0gZS5jbGllbnRZIC0gZHJhZ09mZnNldC55O1xuXG4gICAgLy8gQ29uc3RyYWluIHRvIHZpZXdwb3J0IHdpdGggcGFkZGluZ1xuICAgIGNvbnN0IHBhZGRpbmcgPSAxMDtcbiAgICBjb25zdCBtYXhYID0gd2luZG93LmlubmVyV2lkdGggLSBub3RlLm9mZnNldFdpZHRoIC0gcGFkZGluZztcbiAgICBjb25zdCBtYXhZID0gd2luZG93LmlubmVySGVpZ2h0IC0gbm90ZS5vZmZzZXRIZWlnaHQgLSBwYWRkaW5nO1xuXG4gICAgLy8gVXNlIHRyYW5zZm9ybSBmb3Igc21vb3RoZXIgcGVyZm9ybWFuY2VcbiAgICBjb25zdCBjb25zdHJhaW5lZFggPSBNYXRoLm1heChwYWRkaW5nLCBNYXRoLm1pbihtYXhYLCBuZXdYKSk7XG4gICAgY29uc3QgY29uc3RyYWluZWRZID0gTWF0aC5tYXgocGFkZGluZywgTWF0aC5taW4obWF4WSwgbmV3WSkpO1xuICAgIFxuICAgIG5vdGUuc3R5bGUubGVmdCA9IGNvbnN0cmFpbmVkWCArIFwicHhcIjtcbiAgICBub3RlLnN0eWxlLnRvcCA9IGNvbnN0cmFpbmVkWSArIFwicHhcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3BEcmFnKCkge1xuICAgIGlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IFwiXCI7XG4gICAgbm90ZS5zdHlsZS50cmFuc2l0aW9uID0gXCJhbGwgMC4zcyBlYXNlXCI7XG4gICAgbm90ZS5zdHlsZS51c2VyU2VsZWN0ID0gXCJcIjtcbiAgICBcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGhhbmRsZURyYWcpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHN0b3BEcmFnKTtcbiAgfVxuXG4gIC8vIFJlc2l6aW5nIGZ1bmN0aW9uYWxpdHkgd2l0aCBzbW9vdGggcGVyZm9ybWFuY2VcbiAgcmVzaXplSGFuZGxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IHtcbiAgICBpc1Jlc2l6aW5nID0gdHJ1ZTtcbiAgICBub3RlLnN0eWxlLnRyYW5zaXRpb24gPSBcIm5vbmVcIjsgLy8gRGlzYWJsZSB0cmFuc2l0aW9ucyBkdXJpbmcgcmVzaXplXG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBcIm53LXJlc2l6ZVwiO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgaGFuZGxlUmVzaXplKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBzdG9wUmVzaXplKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gaGFuZGxlUmVzaXplKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAoIWlzUmVzaXppbmcpIHJldHVybjtcblxuICAgIGNvbnN0IHJlY3QgPSBub3RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IG5ld1dpZHRoID0gTWF0aC5tYXgoMjUwLCBNYXRoLm1pbig2MDAsIGUuY2xpZW50WCAtIHJlY3QubGVmdCkpO1xuICAgIGNvbnN0IG5ld0hlaWdodCA9IE1hdGgubWF4KDE4MCwgTWF0aC5taW4oNTAwLCBlLmNsaWVudFkgLSByZWN0LnRvcCkpO1xuXG4gICAgLy8gVXNlIHJlcXVlc3RBbmltYXRpb25GcmFtZSBmb3Igc21vb3RoZXIgcmVzaXppbmdcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgbm90ZS5zdHlsZS53aWR0aCA9IG5ld1dpZHRoICsgXCJweFwiO1xuICAgICAgbm90ZS5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQgKyBcInB4XCI7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdG9wUmVzaXplKCkge1xuICAgIGlzUmVzaXppbmcgPSBmYWxzZTtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IFwiXCI7XG4gICAgbm90ZS5zdHlsZS50cmFuc2l0aW9uID0gXCJhbGwgMC4ycyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpXCI7IC8vIFJlLWVuYWJsZSB0cmFuc2l0aW9uc1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgaGFuZGxlUmVzaXplKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBzdG9wUmVzaXplKTtcbiAgfVxuXG4gIC8vIENvbnRyb2wgYnV0dG9uc1xuICBjbG9zZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBub3RlLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gbm90ZS5yZW1vdmUoKSwgMzAwKTtcbiAgfSk7XG5cbiAgbWluaW1pemVCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgaXNNaW5pbWl6ZWQgPSAhaXNNaW5pbWl6ZWQ7XG4gICAgaWYgKGlzTWluaW1pemVkKSB7XG4gICAgICBub3RlLmNsYXNzTGlzdC5hZGQoXCJtaW5pbWl6ZWRcIik7XG4gICAgICAobWluaW1pemVCdG4gYXMgSFRNTEVsZW1lbnQpLnRleHRDb250ZW50ID0gXCIrXCI7XG4gICAgICAobWluaW1pemVCdG4gYXMgSFRNTEVsZW1lbnQpLnRpdGxlID0gXCJSZXN0b3JlXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vdGUuY2xhc3NMaXN0LnJlbW92ZShcIm1pbmltaXplZFwiKTtcbiAgICAgIChtaW5pbWl6ZUJ0biBhcyBIVE1MRWxlbWVudCkudGV4dENvbnRlbnQgPSBcIuKIklwiO1xuICAgICAgKG1pbmltaXplQnRuIGFzIEhUTUxFbGVtZW50KS50aXRsZSA9IFwiTWluaW1pemVcIjtcbiAgICB9XG4gIH0pO1xuXG4gIHBpbkJ0bj8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBpc1Bpbm5lZCA9ICFpc1Bpbm5lZDtcbiAgICBpZiAoaXNQaW5uZWQpIHtcbiAgICAgIG5vdGUuY2xhc3NMaXN0LmFkZChcInBpbm5lZFwiKTtcbiAgICAgIG5vdGUuc3R5bGUuekluZGV4ID0gXCI5OTk5OTlcIjsgLy8gSGlnaGVyIHotaW5kZXggZm9yIHBpbm5lZCBub3Rlc1xuICAgICAgKHBpbkJ0biBhcyBIVE1MRWxlbWVudCkuY2xhc3NMaXN0LmFkZChcInBpbm5lZFwiKTtcbiAgICAgIChwaW5CdG4gYXMgSFRNTEVsZW1lbnQpLnRpdGxlID0gXCJVbnBpbiBub3RlXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vdGUuY2xhc3NMaXN0LnJlbW92ZShcInBpbm5lZFwiKTtcbiAgICAgIG5vdGUuc3R5bGUuekluZGV4ID0gXCI5OTk5OTdcIjsgLy8gTm9ybWFsIHotaW5kZXhcbiAgICAgIChwaW5CdG4gYXMgSFRNTEVsZW1lbnQpLmNsYXNzTGlzdC5yZW1vdmUoXCJwaW5uZWRcIik7XG4gICAgICAocGluQnRuIGFzIEhUTUxFbGVtZW50KS50aXRsZSA9IFwiUGluIG5vdGUgKGFsd2F5cyBvbiB0b3ApXCI7XG4gICAgfVxuICB9KTtcblxuICAvLyBGb250IHNpemUgY29udHJvbHNcbiAgZm9udFNpemVUb2dnbGU/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZm9udFNpemVQb3B1cC5jbGFzc0xpc3QudG9nZ2xlKFwiYWN0aXZlXCIpO1xuICB9KTtcblxuICAvLyBDbG9zZSBmb250IHBvcHVwIHdoZW4gY2xpY2tpbmcgb3V0c2lkZVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICBpZiAoIWZvbnRTaXplUG9wdXAuY29udGFpbnMoZS50YXJnZXQgYXMgTm9kZSkgJiYgIWZvbnRTaXplVG9nZ2xlLmNvbnRhaW5zKGUudGFyZ2V0IGFzIE5vZGUpKSB7XG4gICAgICBmb250U2l6ZVBvcHVwLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgfVxuICB9KTtcblxuICBpbmNyZWFzZUZvbnRCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgaWYgKGN1cnJlbnRGb250U2l6ZSA8IDI0KSB7XG4gICAgICBjdXJyZW50Rm9udFNpemUgKz0gMTtcbiAgICAgIHRleHRhcmVhLnN0eWxlLmZvbnRTaXplID0gY3VycmVudEZvbnRTaXplICsgXCJweFwiO1xuICAgICAgZm9udFNpemVEaXNwbGF5LnRleHRDb250ZW50ID0gY3VycmVudEZvbnRTaXplLnRvU3RyaW5nKCk7XG4gICAgfVxuICB9KTtcblxuICBkZWNyZWFzZUZvbnRCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgaWYgKGN1cnJlbnRGb250U2l6ZSA+IDgpIHtcbiAgICAgIGN1cnJlbnRGb250U2l6ZSAtPSAxO1xuICAgICAgdGV4dGFyZWEuc3R5bGUuZm9udFNpemUgPSBjdXJyZW50Rm9udFNpemUgKyBcInB4XCI7XG4gICAgICBmb250U2l6ZURpc3BsYXkudGV4dENvbnRlbnQgPSBjdXJyZW50Rm9udFNpemUudG9TdHJpbmcoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIERlbGV0ZSBidXR0b25cbiAgZGVsZXRlQnRuPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIGlmIChjb25maXJtKFwiRGVsZXRlIHRoaXMgbm90ZT9cIikpIHtcbiAgICAgIG5vdGUuY2xhc3NMaXN0LnJlbW92ZShcIm9wZW5cIik7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IG5vdGUucmVtb3ZlKCksIDIwMCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBBdXRvLXNhdmUgd2hlbiB0eXBpbmdcbiAgbGV0IHNhdmVUaW1lb3V0OiBOb2RlSlMuVGltZW91dDtcbiAgdGV4dGFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICBpZiAoIWlzUmVhZE9ubHkpIHtcbiAgICAgIGNsZWFyVGltZW91dChzYXZlVGltZW91dCk7XG4gICAgICBzYXZlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBzYXZlTm90ZSh0ZXh0YXJlYS52YWx1ZS50cmltKCkpO1xuICAgICAgfSwgMTAwMCk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlTm90ZXNQYW5lbCgpIHtcbiAgbGV0IHBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ub3Rlcy1wYW5lbFwiKSBhcyBIVE1MRWxlbWVudDtcblxuICBpZiAoIXBhbmVsKSB7XG4gICAgcGFuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHBhbmVsLmNsYXNzTmFtZSA9IFwibm90ZXMtcGFuZWxcIjtcbiAgICBwYW5lbC5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwibm90ZXMtaGVhZGVyXCI+8J+TiyBSZWNlbnQgTm90ZXM8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJub3Rlcy1saXN0XCIgaWQ9XCJub3Rlcy1saXN0XCI+PC9kaXY+XG4gICAgYDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBhbmVsKTtcbiAgICByZWZyZXNoTm90ZXNMaXN0KCk7XG4gIH1cblxuICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKFwib3BlblwiKTtcblxuICBpZiAocGFuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwib3BlblwiKSkge1xuICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiBvdXRzaWRlQ2xpY2tIYW5kbGVyKGUpIHtcbiAgICAgICAgaWYgKCFwYW5lbC5jb250YWlucyhlLnRhcmdldCBhcyBOb2RlKSkge1xuICAgICAgICAgIHBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpO1xuICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBvdXRzaWRlQ2xpY2tIYW5kbGVyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSwgMTAwKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvcGVuU2V0dGluZ3NNb2RhbCgpIHtcbiAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBtb2RhbC5jbGFzc05hbWUgPSBcInN0aWNreS1tb2RhbFwiO1xuICBtb2RhbC5pbm5lckhUTUwgPSBgXG4gICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1oZWFkZXJcIj5cbiAgICAgICAgPGgzIGNsYXNzPVwibW9kYWwtdGl0bGVcIj7impnvuI8gU2V0dGluZ3M8L2gzPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwibW9kYWwtY2xvc2VcIj7DlzwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IHN0eWxlPVwibGluZS1oZWlnaHQ6IDEuNjsgY29sb3I6ICMwMDAwMDA7XCI+XG4gICAgICAgIDxoNCBzdHlsZT1cImNvbG9yOiAjMDAwMDAwOyB0ZXh0LXNoYWRvdzogMCAxcHggMnB4IHJnYmEoMjUwLCAyMzUsIDE0NiwgMC44KTtcIj7wn46uIEtleWJvYXJkIFNob3J0Y3V0czwvaDQ+XG4gICAgICAgIDxwPjxzdHJvbmc+QWx0ICsgU2hpZnQgKyBOOjwvc3Ryb25nPiBDcmVhdGUgbmV3IG5vdGU8L3A+XG4gICAgICAgIDxwPjxzdHJvbmc+QWx0ICsgU2hpZnQgKyBXOjwvc3Ryb25nPiBUb2dnbGUgd2lkZ2V0IHZpc2liaWxpdHk8L3A+XG4gICAgICAgIDxwPjxzdHJvbmc+RVNDOjwvc3Ryb25nPiBDbG9zZSBtb2RhbHM8L3A+XG4gICAgICAgIFxuICAgICAgICA8aDQgc3R5bGU9XCJtYXJnaW4tdG9wOiAyNXB4OyBjb2xvcjogIzAwMDAwMDsgdGV4dC1zaGFkb3c6IDAgMXB4IDJweCByZ2JhKDI1MCwgMjM1LCAxNDYsIDAuOCk7XCI+4oS577iPIEFib3V0PC9oND5cbiAgICAgICAgPHA+PHN0cm9uZz5TdGlja3lOb3RlQUkgdjIuMzwvc3Ryb25nPjwvcD5cbiAgICAgICAgPHA+U21hcnQgZmxvYXRpbmcgbm90ZXMgZm9yIGFueSB3ZWJwYWdlPC9wPlxuICAgICAgICBcbiAgICAgICAgPGg0IHN0eWxlPVwibWFyZ2luLXRvcDogMjVweDsgY29sb3I6ICMwMDAwMDA7IHRleHQtc2hhZG93OiAwIDFweCAycHggcmdiYSgyNTAsIDIzNSwgMTQ2LCAwLjgpO1wiPvCfjq8gVXNhZ2UgVGlwczwvaDQ+XG4gICAgICAgIDxwPuKAoiBIb3ZlciBvdmVyIHRoZSDinKggYnV0dG9uIHRvIHNlZSBtZW51PC9wPlxuICAgICAgICA8cD7igKIgQ2xpY2sgYW5kIGRyYWcgdG8gbW92ZSB0aGUgd2lkZ2V0PC9wPlxuICAgICAgICA8cD7igKIgVXNlIGtleWJvYXJkIHNob3J0Y3V0cyBmb3IgcXVpY2sgYWNjZXNzPC9wPlxuICAgICAgICA8cD7igKIgTm90ZXMgYXV0by1zYXZlIGFzIHlvdSB0eXBlPC9wPlxuICAgICAgICA8cD7igKIgUGluIG5vdGVzIHRvIGtlZXAgdGhlbSB2aXNpYmxlPC9wPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWdyb3VwXCI+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeSBjbG9zZS1zZXR0aW5nc1wiPkNsb3NlPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1vZGFsKTtcbiAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5jbGFzc0xpc3QuYWRkKFwib3BlblwiKSwgMTApO1xuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XG4gICAgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZShcIm9wZW5cIik7XG4gICAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5yZW1vdmUoKSwgMzAwKTtcbiAgfVxuXG4gIG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIubW9kYWwtY2xvc2VcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZU1vZGFsKTtcbiAgbW9kYWwucXVlcnlTZWxlY3RvcihcIi5jbG9zZS1zZXR0aW5nc1wiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlTW9kYWwpO1xufVxuXG5mdW5jdGlvbiBoaWRlV2lkZ2V0KCkge1xuICBpZiAod2lkZ2V0KSB7XG4gICAgd2lkZ2V0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgfVxuICAvLyBIaWRlIGFsbCBzdGlja3kgbm90ZXNcbiAgY29uc3Qgc3RpY2t5Tm90ZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnN0aWNreS1ub3RlXCIpO1xuICBzdGlja3lOb3Rlcy5mb3JFYWNoKChub3RlKSA9PiB7XG4gICAgKG5vdGUgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNob3dXaWRnZXQoKSB7XG4gIGlmICh3aWRnZXQpIHtcbiAgICB3aWRnZXQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgfVxuICAvLyBTaG93IGFsbCBzdGlja3kgbm90ZXNcbiAgY29uc3Qgc3RpY2t5Tm90ZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnN0aWNreS1ub3RlXCIpO1xuICBzdGlja3lOb3Rlcy5mb3JFYWNoKChub3RlKSA9PiB7XG4gICAgKG5vdGUgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpc1dpZGdldFZpc2libGUoKTogYm9vbGVhbiB7XG4gIGlmICghd2lkZ2V0KSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gQ2hlY2sgaWYgZGlzcGxheSBpcyBleHBsaWNpdGx5IHNldCB0byBub25lXG4gIGlmICh3aWRnZXQuc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIpIHJldHVybiBmYWxzZTtcblxuICAvLyBDaGVjayBjb21wdXRlZCBzdHlsZSBpZiBzdHlsZS5kaXNwbGF5IGlzIG5vdCBzZXRcbiAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHdpZGdldCk7XG4gIHJldHVybiBjb21wdXRlZFN0eWxlLmRpc3BsYXkgIT09IFwibm9uZVwiO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlTm90ZShjb250ZW50OiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFwic3RpY2t5Tm90ZXNcIik7XG4gICAgY29uc3Qgbm90ZXMgPSByZXN1bHQuc3RpY2t5Tm90ZXMgfHwgW107XG5cbiAgICBjb25zdCBuZXdOb3RlID0ge1xuICAgICAgaWQ6IERhdGUubm93KCkudG9TdHJpbmcoKSxcbiAgICAgIGNvbnRlbnQsXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgfTtcblxuICAgIG5vdGVzLnVuc2hpZnQobmV3Tm90ZSk7XG5cbiAgICAvLyBLZWVwIG9ubHkgbGFzdCA1MCBub3Rlc1xuICAgIGlmIChub3Rlcy5sZW5ndGggPiA1MCkge1xuICAgICAgbm90ZXMuc3BsaWNlKDUwKTtcbiAgICB9XG5cbiAgICBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KHsgc3RpY2t5Tm90ZXM6IG5vdGVzIH0pO1xuICAgIGNvbnNvbGUubG9nKFwiTm90ZSBzYXZlZCBzdWNjZXNzZnVsbHlcIik7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIHNhdmluZyBub3RlOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaE5vdGVzTGlzdCgpIHtcbiAgY29uc3Qgbm90ZXNMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJub3Rlcy1saXN0XCIpO1xuICBpZiAoIW5vdGVzTGlzdCkgcmV0dXJuO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChcInN0aWNreU5vdGVzXCIpO1xuICAgIGNvbnN0IG5vdGVzID0gcmVzdWx0LnN0aWNreU5vdGVzIHx8IFtdO1xuXG4gICAgaWYgKG5vdGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbm90ZXNMaXN0LmlubmVySFRNTCA9XG4gICAgICAgICc8ZGl2IHN0eWxlPVwicGFkZGluZzogMjBweDsgdGV4dC1hbGlnbjogY2VudGVyOyBjb2xvcjogIzAwMDAwMDsgZm9udC13ZWlnaHQ6IDUwMDtcIj7wn5OdIE5vIG5vdGVzIHlldDxicj48c21hbGwgc3R5bGU9XCJjb2xvcjogIzk5MjlFQTtcIj5DcmVhdGUgeW91ciBmaXJzdCBub3RlITwvc21hbGw+PC9kaXY+JztcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBub3Rlc0xpc3QuaW5uZXJIVE1MID0gbm90ZXNcbiAgICAgIC5zbGljZSgwLCAxMClcbiAgICAgIC5tYXAoXG4gICAgICAgIChub3RlOiBhbnkpID0+IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJub3RlLWl0ZW1cIiBkYXRhLW5vdGUtaWQ9XCIke25vdGUuaWR9XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJub3RlLXByZXZpZXdcIj4ke25vdGUuY29udGVudC5zdWJzdHJpbmcoMCwgMTAwKX0ke25vdGUuY29udGVudC5sZW5ndGggPiAxMDAgPyBcIi4uLlwiIDogXCJcIn08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5vdGUtZGF0ZVwiPiR7bmV3IERhdGUobm90ZS50aW1lc3RhbXApLnRvTG9jYWxlRGF0ZVN0cmluZygpfTwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYFxuICAgICAgKVxuICAgICAgLmpvaW4oXCJcIik7XG5cbiAgICAvLyBDbGljayB0byBlZGl0IG5vdGVcbiAgICBub3Rlc0xpc3QucXVlcnlTZWxlY3RvckFsbChcIi5ub3RlLWl0ZW1cIikuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBjb25zdCBub3RlSWQgPSAoaXRlbSBhcyBIVE1MRWxlbWVudCkuZGF0YXNldC5ub3RlSWQ7XG4gICAgICAgIGNvbnN0IG5vdGUgPSBub3Rlcy5maW5kKChuOiBhbnkpID0+IG4uaWQgPT09IG5vdGVJZCk7XG4gICAgICAgIGlmIChub3RlKSB7XG4gICAgICAgICAgLy8gT3BlbiB0aGUgbm90ZSBmb3IgZWRpdGluZ1xuICAgICAgICAgIG9wZW5Ob3RlRm9yRWRpdGluZyhub3RlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGxvYWRpbmcgbm90ZXM6XCIsIGVycm9yKTtcbiAgfVxufVxuXG5cblxuZnVuY3Rpb24gb3Blbk5vdGVGb3JFZGl0aW5nKG5vdGU6IGFueSkge1xuICAvLyBDcmVhdGUgYSBzdGlja3kgbm90ZSB3aXRoIHRoZSBleGlzdGluZyBjb250ZW50XG4gIGNvbnN0IHN0aWNreU5vdGUgPSBjcmVhdGVTdGlja3lOb3RlKG5vdGUuY29udGVudCk7XG4gIFxuICAvLyBBZGQgdGhlIGV4aXN0aW5nIG5vdGUgSUQgdG8gdGhlIHN0aWNreSBub3RlIGZvciB1cGRhdGluZ1xuICBzdGlja3lOb3RlLmRhdGFzZXQubm90ZUlkID0gbm90ZS5pZDtcbiAgXG4gIC8vIFVwZGF0ZSB0aGUgbm90ZSB0aXRsZSB0byBzaG93IGl0J3MgYW4gZXhpc3Rpbmcgbm90ZVxuICBjb25zdCBub3RlVGl0bGUgPSBzdGlja3lOb3RlLnF1ZXJ5U2VsZWN0b3IoXCIubm90ZS10aXRsZVwiKSBhcyBIVE1MRWxlbWVudDtcbiAgaWYgKG5vdGVUaXRsZSkge1xuICAgIG5vdGVUaXRsZS50ZXh0Q29udGVudCA9IFwiRWRpdCBOb3RlXCI7XG4gIH1cblxuICAvLyBBZGQgcmVhZC1vbmx5IGJ1dHRvbiBmb3IgZWRpdGVkIG5vdGVzXG4gIGNvbnN0IG5vdGVBY3Rpb25zID0gc3RpY2t5Tm90ZS5xdWVyeVNlbGVjdG9yKFwiLm5vdGUtYWN0aW9uc1wiKSBhcyBIVE1MRWxlbWVudDtcbiAgY29uc3QgcmVhZE9ubHlCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICByZWFkT25seUJ0bi5jbGFzc05hbWUgPSBcImFjdGlvbi1idG4gcmVhZC1vbmx5LWJ0blwiO1xuICByZWFkT25seUJ0bi50aXRsZSA9IFwiVG9nZ2xlIFJlYWQgT25seVwiO1xuICByZWFkT25seUJ0bi5pbm5lckhUTUwgPSBcIvCflJJcIjtcbiAgXG4gIC8vIEluc2VydCByZWFkLW9ubHkgYnV0dG9uIGJlZm9yZSBkZWxldGUgYnV0dG9uXG4gIGNvbnN0IGRlbGV0ZUJ0biA9IHN0aWNreU5vdGUucXVlcnlTZWxlY3RvcihcIi5kZWxldGUtYnRuXCIpO1xuICBpZiAoZGVsZXRlQnRuICYmIG5vdGVBY3Rpb25zKSB7XG4gICAgbm90ZUFjdGlvbnMuaW5zZXJ0QmVmb3JlKHJlYWRPbmx5QnRuLCBkZWxldGVCdG4pO1xuICB9XG5cbiAgLy8gSGFuZGxlIHJlYWQtb25seSB0b2dnbGVcbiAgY29uc3QgdGV4dGFyZWEgPSBzdGlja3lOb3RlLnF1ZXJ5U2VsZWN0b3IoXCIuc3RpY2t5LW5vdGUtdGV4dGFyZWFcIikgYXMgSFRNTFRleHRBcmVhRWxlbWVudDtcbiAgbGV0IGlzUmVhZE9ubHkgPSBmYWxzZTtcbiAgXG4gIHJlYWRPbmx5QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgaXNSZWFkT25seSA9ICFpc1JlYWRPbmx5O1xuICAgIHRleHRhcmVhLnJlYWRPbmx5ID0gaXNSZWFkT25seTtcbiAgICBcbiAgICBpZiAoaXNSZWFkT25seSkge1xuICAgICAgcmVhZE9ubHlCdG4uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgIHJlYWRPbmx5QnRuLmlubmVySFRNTCA9IFwi8J+Uk1wiO1xuICAgICAgcmVhZE9ubHlCdG4udGl0bGUgPSBcIkVuYWJsZSBFZGl0aW5nXCI7XG4gICAgICB0ZXh0YXJlYS5zdHlsZS5vcGFjaXR5ID0gXCIwLjdcIjtcbiAgICAgIHRleHRhcmVhLnN0eWxlLmN1cnNvciA9IFwiZGVmYXVsdFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWFkT25seUJ0bi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xuICAgICAgcmVhZE9ubHlCdG4uaW5uZXJIVE1MID0gXCLwn5SSXCI7XG4gICAgICByZWFkT25seUJ0bi50aXRsZSA9IFwiRGlzYWJsZSBFZGl0aW5nXCI7XG4gICAgICB0ZXh0YXJlYS5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7XG4gICAgICB0ZXh0YXJlYS5zdHlsZS5jdXJzb3IgPSBcInRleHRcIjtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFVwZGF0ZSBkZWxldGUgYnV0dG9uIGZ1bmN0aW9uYWxpdHlcbiAgaWYgKGRlbGV0ZUJ0bikge1xuICAgIGNvbnN0IG5ld0RlbGV0ZUJ0biA9IGRlbGV0ZUJ0bi5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgZGVsZXRlQnRuLnBhcmVudE5vZGU/LnJlcGxhY2VDaGlsZChuZXdEZWxldGVCdG4sIGRlbGV0ZUJ0bik7XG4gICAgXG4gICAgbmV3RGVsZXRlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBpZiAoaXNSZWFkT25seSkge1xuICAgICAgICBhbGVydChcIkNhbm5vdCBkZWxldGUgbm90ZSBpbiByZWFkLW9ubHkgbW9kZS4gQ2xpY2sgdGhlIGxvY2sgaWNvbiB0byBlbmFibGUgZWRpdGluZy5cIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKGNvbmZpcm0oXCJEZWxldGUgdGhpcyBub3RlP1wiKSkge1xuICAgICAgICBkZWxldGVOb3RlKG5vdGUuaWQpO1xuICAgICAgICByZWZyZXNoTm90ZXNMaXN0KCk7XG4gICAgICAgIHN0aWNreU5vdGUuY2xhc3NMaXN0LnJlbW92ZShcIm9wZW5cIik7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gc3RpY2t5Tm90ZS5yZW1vdmUoKSwgMjAwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBcbiAgLy8gQXV0by1zYXZlIGZ1bmN0aW9uYWxpdHkgZm9yIGV4aXN0aW5nIG5vdGVzXG4gIGxldCBzYXZlVGltZW91dDogYW55O1xuICB0ZXh0YXJlYS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgIGlmICghaXNSZWFkT25seSkge1xuICAgICAgY2xlYXJUaW1lb3V0KHNhdmVUaW1lb3V0KTtcbiAgICAgIHNhdmVUaW1lb3V0ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZXh0YXJlYS52YWx1ZS50cmltKCk7XG4gICAgICAgIGlmIChjb250ZW50ICYmIG5vdGUuaWQpIHtcbiAgICAgICAgICBhd2FpdCB1cGRhdGVOb3RlKG5vdGUuaWQsIGNvbnRlbnQpO1xuICAgICAgICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgICAgICAgfVxuICAgICAgfSwgMTAwMCk7XG4gICAgfVxuICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlTm90ZShub3RlSWQ6IHN0cmluZywgbmV3Q29udGVudDogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChcInN0aWNreU5vdGVzXCIpO1xuICAgIGNvbnN0IG5vdGVzID0gcmVzdWx0LnN0aWNreU5vdGVzIHx8IFtdO1xuXG4gICAgY29uc3Qgbm90ZUluZGV4ID0gbm90ZXMuZmluZEluZGV4KChub3RlOiBhbnkpID0+IG5vdGUuaWQgPT09IG5vdGVJZCk7XG4gICAgaWYgKG5vdGVJbmRleCAhPT0gLTEpIHtcbiAgICAgIG5vdGVzW25vdGVJbmRleF0uY29udGVudCA9IG5ld0NvbnRlbnQ7XG4gICAgICBub3Rlc1tub3RlSW5kZXhdLnRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgIGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoeyBzdGlja3lOb3Rlczogbm90ZXMgfSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciB1cGRhdGluZyBub3RlOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlTm90ZShub3RlSWQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoXCJzdGlja3lOb3Rlc1wiKTtcbiAgICBjb25zdCBub3RlcyA9IHJlc3VsdC5zdGlja3lOb3RlcyB8fCBbXTtcblxuICAgIGNvbnN0IGZpbHRlcmVkTm90ZXMgPSBub3Rlcy5maWx0ZXIoKG5vdGU6IGFueSkgPT4gbm90ZS5pZCAhPT0gbm90ZUlkKTtcbiAgICBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KHsgc3RpY2t5Tm90ZXM6IGZpbHRlcmVkTm90ZXMgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGRlbGV0aW5nIG5vdGU6XCIsIGVycm9yKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXR1cEtleWJvYXJkU2hvcnRjdXRzKCkge1xuICAvLyBMb2NhbCBrZXlib2FyZCBzaG9ydGN1dCBoYW5kbGVycyB1c2luZyBBbHQrU2hpZnQgY29tYmluYXRpb25zXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB7XG4gICAgLy8gVXNlIEFsdCtTaGlmdCBjb21iaW5hdGlvbnMgdG8gYXZvaWQgY29uZmxpY3RzIHdpdGggYnJvd3NlciBzaG9ydGN1dHNcbiAgICBpZiAoZS5hbHRLZXkgJiYgZS5zaGlmdEtleSkge1xuICAgICAgaWYgKGUuY29kZSA9PT0gXCJLZXlOXCIpIHtcbiAgICAgICAgLy8gQWx0K1NoaWZ0K046IENyZWF0ZSBuZXcgbm90ZVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBBbHQrU2hpZnQrTiBwcmVzc2VkIC0gQ3JlYXRpbmcgbmV3IG5vdGVcIik7XG4gICAgICAgIGNyZWF0ZU5vdGVFZGl0b3IoKTtcbiAgICAgIH0gZWxzZSBpZiAoZS5jb2RlID09PSBcIktleVdcIikge1xuICAgICAgICAvLyBBbHQrU2hpZnQrVzogVG9nZ2xlIHdpZGdldCB2aXNpYmlsaXR5XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IEFsdCtTaGlmdCtXIHByZXNzZWQgLSBUb2dnbGluZyB3aWRnZXQgdmlzaWJpbGl0eVwiKTtcbiAgICAgICAgaWYgKGlzV2lkZ2V0VmlzaWJsZSgpKSB7XG4gICAgICAgICAgaGlkZVdpZGdldCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNob3dXaWRnZXQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEVTQyBrZXkgdG8gY2xvc2UgbW9kYWxzIGFuZCBub3Rlc1xuICAgIGlmIChlLmNvZGUgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgIC8vIENsb3NlIGFueSBvcGVuIG1vZGFsc1xuICAgICAgY29uc3Qgb3Blbk1vZGFsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zdGlja3ktbW9kYWwub3BlblwiKTtcbiAgICAgIGlmIChvcGVuTW9kYWwpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvcGVuTW9kYWwuY2xhc3NMaXN0LnJlbW92ZShcIm9wZW5cIik7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gb3Blbk1vZGFsLnJlbW92ZSgpLCAzMDApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENsb3NlIG5vdGVzIHBhbmVsXG4gICAgICBjb25zdCBub3Rlc1BhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ub3Rlcy1wYW5lbC5vcGVuXCIpO1xuICAgICAgaWYgKG5vdGVzUGFuZWwpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBub3Rlc1BhbmVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENsb3NlIHdpZGdldCBtZW51XG4gICAgICBpZiAoaXNNZW51T3Blbikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNsb3NlTWVudSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogTG9jYWwga2V5Ym9hcmQgc2hvcnRjdXRzIGluaXRpYWxpemVkIChBbHQrU2hpZnQrTiwgQWx0K1NoaWZ0K1csIEVzYylcIik7XG59XG5cbmZ1bmN0aW9uIHNldHVwTWVzc2FnZUxpc3RlbmVyKCkge1xuICBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBSZWNlaXZlZCBtZXNzYWdlOlwiLCBtZXNzYWdlKTtcblxuICAgIC8vIEhhbmRsZSBrZXlib2FyZCBzaG9ydGN1dCBjb21tYW5kcyBmcm9tIGJhY2tncm91bmQgc2NyaXB0XG4gICAgaWYgKG1lc3NhZ2UuYWN0aW9uID09PSBcInRvZ2dsZS13aWRnZXRcIikge1xuICAgICAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IFRvZ2dsZSB3aWRnZXQgY29tbWFuZCByZWNlaXZlZFwiKTtcblxuICAgICAgaWYgKGlzV2lkZ2V0VmlzaWJsZSgpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBIaWRpbmcgd2lkZ2V0XCIpO1xuICAgICAgICBoaWRlV2lkZ2V0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogU2hvd2luZyB3aWRnZXRcIik7XG4gICAgICAgIHNob3dXaWRnZXQoKTtcbiAgICAgIH1cblxuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5hY3Rpb24gPT09IFwibmV3LW5vdGVcIikge1xuICAgICAgY3JlYXRlTm90ZUVkaXRvcigpO1xuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgY29udGV4dCBtZW51IG5vdGUgY3JlYXRpb24gd2l0aCBzZWxlY3RlZCB0ZXh0XG4gICAgaWYgKG1lc3NhZ2UuYWN0aW9uID09PSBcImNyZWF0ZS1ub3RlLXdpdGgtc2VsZWN0aW9uXCIpIHtcbiAgICAgIGNyZWF0ZU5vdGVFZGl0b3IobWVzc2FnZS5zZWxlY3RlZFRleHQgfHwgXCJcIik7XG4gICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLmFjdGlvbiA9PT0gXCJ0b2dnbGVTdGVhbHRoXCIpIHtcbiAgICAgIC8vIEhhbmRsZSBzdGVhbHRoIG1vZGUgdG9nZ2xlIGZyb20gcG9wdXBcbiAgICAgIGNvbnN0IHdpZGdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RpY2t5LW5vdGUtd2lkZ2V0XCIpO1xuICAgICAgaWYgKHdpZGdldCkge1xuICAgICAgICBpZiAobWVzc2FnZS5lbmFibGVkKSB7XG4gICAgICAgICAgd2lkZ2V0LnN0eWxlLm9wYWNpdHkgPSBcIjAuM1wiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdpZGdldC5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBcIlVua25vd24gYWN0aW9uXCIgfSk7XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlV2lkZ2V0UG9zaXRpb24oKSB7XG4gIGlmICghd2lkZ2V0KSByZXR1cm47XG5cbiAgY29uc3QgcmVjdCA9IHdpZGdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgY29uc3QgcG9zaXRpb24gPSB7XG4gICAgeDogcmVjdC5sZWZ0LFxuICAgIHk6IHJlY3QudG9wLFxuICB9O1xuXG4gIHRyeSB7XG4gICAgYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCh7IHdpZGdldFBvc2l0aW9uOiBwb3NpdGlvbiB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igc2F2aW5nIHBvc2l0aW9uOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZFdpZGdldFBvc2l0aW9uKCkge1xuICBpZiAoIXdpZGdldCkgcmV0dXJuO1xuXG4gIC8vIFJlc2V0IHRvIGRlZmF1bHQgcG9zaXRpb24gb24gcGFnZSByZWZyZXNoXG4gIC8vIFRoZSB3aWRnZXQgd2lsbCB1c2UgdGhlIGRlZmF1bHQgQ1NTIHBvc2l0aW9uICh0b3A6IDUwcHgsIHJpZ2h0OiA1MHB4KVxuICB3aWRnZXQuc3R5bGUubGVmdCA9IFwiXCI7XG4gIHdpZGdldC5zdHlsZS50b3AgPSBcIlwiO1xuICB3aWRnZXQuc3R5bGUudHJhbnNmb3JtID0gXCJcIjtcblxuICAvLyBDbGVhciBhbnkgc2F2ZWQgcG9zaXRpb25cbiAgdHJ5IHtcbiAgICBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKFwid2lkZ2V0UG9zaXRpb25cIik7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGNsZWFyaW5nIHBvc2l0aW9uOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVsZXRlTm90ZURpcmVjdGx5KG5vdGU6IGFueSkge1xuICBpZiAoY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBub3RlP1wiKSkge1xuICAgIGRlbGV0ZU5vdGUobm90ZS5pZCk7XG4gICAgcmVmcmVzaE5vdGVzTGlzdCgpO1xuICB9XG59XG5cblxuIiwiZnVuY3Rpb24gcHJpbnQobWV0aG9kLCAuLi5hcmdzKSB7XG4gIGlmIChpbXBvcnQubWV0YS5lbnYuTU9ERSA9PT0gXCJwcm9kdWN0aW9uXCIpIHJldHVybjtcbiAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSBcInN0cmluZ1wiKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGFyZ3Muc2hpZnQoKTtcbiAgICBtZXRob2QoYFt3eHRdICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICBtZXRob2QoXCJbd3h0XVwiLCAuLi5hcmdzKTtcbiAgfVxufVxuZXhwb3J0IGNvbnN0IGxvZ2dlciA9IHtcbiAgZGVidWc6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmRlYnVnLCAuLi5hcmdzKSxcbiAgbG9nOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5sb2csIC4uLmFyZ3MpLFxuICB3YXJuOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS53YXJuLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmVycm9yLCAuLi5hcmdzKVxufTtcbiIsImltcG9ydCB7IGJyb3dzZXIgfSBmcm9tIFwid3h0L2Jyb3dzZXJcIjtcbmV4cG9ydCBjbGFzcyBXeHRMb2NhdGlvbkNoYW5nZUV2ZW50IGV4dGVuZHMgRXZlbnQge1xuICBjb25zdHJ1Y3RvcihuZXdVcmwsIG9sZFVybCkge1xuICAgIHN1cGVyKFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQuRVZFTlRfTkFNRSwge30pO1xuICAgIHRoaXMubmV3VXJsID0gbmV3VXJsO1xuICAgIHRoaXMub2xkVXJsID0gb2xkVXJsO1xuICB9XG4gIHN0YXRpYyBFVkVOVF9OQU1FID0gZ2V0VW5pcXVlRXZlbnROYW1lKFwid3h0OmxvY2F0aW9uY2hhbmdlXCIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFVuaXF1ZUV2ZW50TmFtZShldmVudE5hbWUpIHtcbiAgcmV0dXJuIGAke2Jyb3dzZXI/LnJ1bnRpbWU/LmlkfToke2ltcG9ydC5tZXRhLmVudi5FTlRSWVBPSU5UfToke2V2ZW50TmFtZX1gO1xufVxuIiwiaW1wb3J0IHsgV3h0TG9jYXRpb25DaGFuZ2VFdmVudCB9IGZyb20gXCIuL2N1c3RvbS1ldmVudHMubWpzXCI7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTG9jYXRpb25XYXRjaGVyKGN0eCkge1xuICBsZXQgaW50ZXJ2YWw7XG4gIGxldCBvbGRVcmw7XG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogRW5zdXJlIHRoZSBsb2NhdGlvbiB3YXRjaGVyIGlzIGFjdGl2ZWx5IGxvb2tpbmcgZm9yIFVSTCBjaGFuZ2VzLiBJZiBpdCdzIGFscmVhZHkgd2F0Y2hpbmcsXG4gICAgICogdGhpcyBpcyBhIG5vb3AuXG4gICAgICovXG4gICAgcnVuKCkge1xuICAgICAgaWYgKGludGVydmFsICE9IG51bGwpIHJldHVybjtcbiAgICAgIG9sZFVybCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgICBpbnRlcnZhbCA9IGN0eC5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGxldCBuZXdVcmwgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgICBpZiAobmV3VXJsLmhyZWYgIT09IG9sZFVybC5ocmVmKSB7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQobmV3VXJsLCBvbGRVcmwpKTtcbiAgICAgICAgICBvbGRVcmwgPSBuZXdVcmw7XG4gICAgICAgIH1cbiAgICAgIH0sIDFlMyk7XG4gICAgfVxuICB9O1xufVxuIiwiaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gXCJ3eHQvYnJvd3NlclwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIi4uL3V0aWxzL2ludGVybmFsL2xvZ2dlci5tanNcIjtcbmltcG9ydCB7XG4gIGdldFVuaXF1ZUV2ZW50TmFtZVxufSBmcm9tIFwiLi9pbnRlcm5hbC9jdXN0b20tZXZlbnRzLm1qc1wiO1xuaW1wb3J0IHsgY3JlYXRlTG9jYXRpb25XYXRjaGVyIH0gZnJvbSBcIi4vaW50ZXJuYWwvbG9jYXRpb24td2F0Y2hlci5tanNcIjtcbmV4cG9ydCBjbGFzcyBDb250ZW50U2NyaXB0Q29udGV4dCB7XG4gIGNvbnN0cnVjdG9yKGNvbnRlbnRTY3JpcHROYW1lLCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb250ZW50U2NyaXB0TmFtZSA9IGNvbnRlbnRTY3JpcHROYW1lO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5hYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgaWYgKHRoaXMuaXNUb3BGcmFtZSkge1xuICAgICAgdGhpcy5saXN0ZW5Gb3JOZXdlclNjcmlwdHMoeyBpZ25vcmVGaXJzdEV2ZW50OiB0cnVlIH0pO1xuICAgICAgdGhpcy5zdG9wT2xkU2NyaXB0cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpc3RlbkZvck5ld2VyU2NyaXB0cygpO1xuICAgIH1cbiAgfVxuICBzdGF0aWMgU0NSSVBUX1NUQVJURURfTUVTU0FHRV9UWVBFID0gZ2V0VW5pcXVlRXZlbnROYW1lKFxuICAgIFwid3h0OmNvbnRlbnQtc2NyaXB0LXN0YXJ0ZWRcIlxuICApO1xuICBpc1RvcEZyYW1lID0gd2luZG93LnNlbGYgPT09IHdpbmRvdy50b3A7XG4gIGFib3J0Q29udHJvbGxlcjtcbiAgbG9jYXRpb25XYXRjaGVyID0gY3JlYXRlTG9jYXRpb25XYXRjaGVyKHRoaXMpO1xuICByZWNlaXZlZE1lc3NhZ2VJZHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICBnZXQgc2lnbmFsKCkge1xuICAgIHJldHVybiB0aGlzLmFib3J0Q29udHJvbGxlci5zaWduYWw7XG4gIH1cbiAgYWJvcnQocmVhc29uKSB7XG4gICAgcmV0dXJuIHRoaXMuYWJvcnRDb250cm9sbGVyLmFib3J0KHJlYXNvbik7XG4gIH1cbiAgZ2V0IGlzSW52YWxpZCgpIHtcbiAgICBpZiAoYnJvd3Nlci5ydW50aW1lLmlkID09IG51bGwpIHtcbiAgICAgIHRoaXMubm90aWZ5SW52YWxpZGF0ZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2lnbmFsLmFib3J0ZWQ7XG4gIH1cbiAgZ2V0IGlzVmFsaWQoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzSW52YWxpZDtcbiAgfVxuICAvKipcbiAgICogQWRkIGEgbGlzdGVuZXIgdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgY29udGVudCBzY3JpcHQncyBjb250ZXh0IGlzIGludmFsaWRhdGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoY2IpO1xuICAgKiBjb25zdCByZW1vdmVJbnZhbGlkYXRlZExpc3RlbmVyID0gY3R4Lm9uSW52YWxpZGF0ZWQoKCkgPT4ge1xuICAgKiAgIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UucmVtb3ZlTGlzdGVuZXIoY2IpO1xuICAgKiB9KVxuICAgKiAvLyAuLi5cbiAgICogcmVtb3ZlSW52YWxpZGF0ZWRMaXN0ZW5lcigpO1xuICAgKi9cbiAgb25JbnZhbGlkYXRlZChjYikge1xuICAgIHRoaXMuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBjYik7XG4gICAgcmV0dXJuICgpID0+IHRoaXMuc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBjYik7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybiBhIHByb21pc2UgdGhhdCBuZXZlciByZXNvbHZlcy4gVXNlZnVsIGlmIHlvdSBoYXZlIGFuIGFzeW5jIGZ1bmN0aW9uIHRoYXQgc2hvdWxkbid0IHJ1blxuICAgKiBhZnRlciB0aGUgY29udGV4dCBpcyBleHBpcmVkLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBjb25zdCBnZXRWYWx1ZUZyb21TdG9yYWdlID0gYXN5bmMgKCkgPT4ge1xuICAgKiAgIGlmIChjdHguaXNJbnZhbGlkKSByZXR1cm4gY3R4LmJsb2NrKCk7XG4gICAqXG4gICAqICAgLy8gLi4uXG4gICAqIH1cbiAgICovXG4gIGJsb2NrKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cuc2V0SW50ZXJ2YWxgIHRoYXQgYXV0b21hdGljYWxseSBjbGVhcnMgdGhlIGludGVydmFsIHdoZW4gaW52YWxpZGF0ZWQuXG4gICAqL1xuICBzZXRJbnRlcnZhbChoYW5kbGVyLCB0aW1lb3V0KSB7XG4gICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBoYW5kbGVyKCk7XG4gICAgfSwgdGltZW91dCk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNsZWFySW50ZXJ2YWwoaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cuc2V0VGltZW91dGAgdGhhdCBhdXRvbWF0aWNhbGx5IGNsZWFycyB0aGUgaW50ZXJ2YWwgd2hlbiBpbnZhbGlkYXRlZC5cbiAgICovXG4gIHNldFRpbWVvdXQoaGFuZGxlciwgdGltZW91dCkge1xuICAgIGNvbnN0IGlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBoYW5kbGVyKCk7XG4gICAgfSwgdGltZW91dCk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNsZWFyVGltZW91dChpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIHRoYXQgYXV0b21hdGljYWxseSBjYW5jZWxzIHRoZSByZXF1ZXN0IHdoZW5cbiAgICogaW52YWxpZGF0ZWQuXG4gICAqL1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spIHtcbiAgICBjb25zdCBpZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoLi4uYXJncykgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgfSk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2tgIHRoYXQgYXV0b21hdGljYWxseSBjYW5jZWxzIHRoZSByZXF1ZXN0IHdoZW5cbiAgICogaW52YWxpZGF0ZWQuXG4gICAqL1xuICByZXF1ZXN0SWRsZUNhbGxiYWNrKGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgY29uc3QgaWQgPSByZXF1ZXN0SWRsZUNhbGxiYWNrKCguLi5hcmdzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc2lnbmFsLmFib3J0ZWQpIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgIH0sIG9wdGlvbnMpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjYW5jZWxJZGxlQ2FsbGJhY2soaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgYWRkRXZlbnRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZSA9PT0gXCJ3eHQ6bG9jYXRpb25jaGFuZ2VcIikge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgdGhpcy5sb2NhdGlvbldhdGNoZXIucnVuKCk7XG4gICAgfVxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyPy4oXG4gICAgICB0eXBlLnN0YXJ0c1dpdGgoXCJ3eHQ6XCIpID8gZ2V0VW5pcXVlRXZlbnROYW1lKHR5cGUpIDogdHlwZSxcbiAgICAgIGhhbmRsZXIsXG4gICAgICB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIHNpZ25hbDogdGhpcy5zaWduYWxcbiAgICAgIH1cbiAgICApO1xuICB9XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICogQWJvcnQgdGhlIGFib3J0IGNvbnRyb2xsZXIgYW5kIGV4ZWN1dGUgYWxsIGBvbkludmFsaWRhdGVkYCBsaXN0ZW5lcnMuXG4gICAqL1xuICBub3RpZnlJbnZhbGlkYXRlZCgpIHtcbiAgICB0aGlzLmFib3J0KFwiQ29udGVudCBzY3JpcHQgY29udGV4dCBpbnZhbGlkYXRlZFwiKTtcbiAgICBsb2dnZXIuZGVidWcoXG4gICAgICBgQ29udGVudCBzY3JpcHQgXCIke3RoaXMuY29udGVudFNjcmlwdE5hbWV9XCIgY29udGV4dCBpbnZhbGlkYXRlZGBcbiAgICApO1xuICB9XG4gIHN0b3BPbGRTY3JpcHRzKCkge1xuICAgIHdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogQ29udGVudFNjcmlwdENvbnRleHQuU0NSSVBUX1NUQVJURURfTUVTU0FHRV9UWVBFLFxuICAgICAgICBjb250ZW50U2NyaXB0TmFtZTogdGhpcy5jb250ZW50U2NyaXB0TmFtZSxcbiAgICAgICAgbWVzc2FnZUlkOiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgICAgfSxcbiAgICAgIFwiKlwiXG4gICAgKTtcbiAgfVxuICB2ZXJpZnlTY3JpcHRTdGFydGVkRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBpc1NjcmlwdFN0YXJ0ZWRFdmVudCA9IGV2ZW50LmRhdGE/LnR5cGUgPT09IENvbnRlbnRTY3JpcHRDb250ZXh0LlNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRTtcbiAgICBjb25zdCBpc1NhbWVDb250ZW50U2NyaXB0ID0gZXZlbnQuZGF0YT8uY29udGVudFNjcmlwdE5hbWUgPT09IHRoaXMuY29udGVudFNjcmlwdE5hbWU7XG4gICAgY29uc3QgaXNOb3REdXBsaWNhdGUgPSAhdGhpcy5yZWNlaXZlZE1lc3NhZ2VJZHMuaGFzKGV2ZW50LmRhdGE/Lm1lc3NhZ2VJZCk7XG4gICAgcmV0dXJuIGlzU2NyaXB0U3RhcnRlZEV2ZW50ICYmIGlzU2FtZUNvbnRlbnRTY3JpcHQgJiYgaXNOb3REdXBsaWNhdGU7XG4gIH1cbiAgbGlzdGVuRm9yTmV3ZXJTY3JpcHRzKG9wdGlvbnMpIHtcbiAgICBsZXQgaXNGaXJzdCA9IHRydWU7XG4gICAgY29uc3QgY2IgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0aGlzLnZlcmlmeVNjcmlwdFN0YXJ0ZWRFdmVudChldmVudCkpIHtcbiAgICAgICAgdGhpcy5yZWNlaXZlZE1lc3NhZ2VJZHMuYWRkKGV2ZW50LmRhdGEubWVzc2FnZUlkKTtcbiAgICAgICAgY29uc3Qgd2FzRmlyc3QgPSBpc0ZpcnN0O1xuICAgICAgICBpc0ZpcnN0ID0gZmFsc2U7XG4gICAgICAgIGlmICh3YXNGaXJzdCAmJiBvcHRpb25zPy5pZ25vcmVGaXJzdEV2ZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMubm90aWZ5SW52YWxpZGF0ZWQoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGNiKTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gcmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgY2IpKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbImRlZmluaXRpb24iLCJicm93c2VyIiwiX2Jyb3dzZXIiLCJjb250ZW50IiwiX2EiLCJfYiIsInJlc3VsdCIsInByaW50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QTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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
