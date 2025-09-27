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
      border-radius: 0px;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.15),
        0 1px 4px rgba(0, 0, 0, 0.1);
      z-index: 999997;
      font-family: 'Segoe UI', system-ui, sans-serif;
      transform: scale(0.9) rotate(var(--note-rotation, -1deg));
      opacity: 0;
      transition: all 0.3s ease;
      border: none;
      backdrop-filter: blur(2px);
    }

    .sticky-note.open {
      transform: scale(1) rotate(var(--note-rotation, 0deg));
      opacity: 1;
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

    .sticky-note.pinned {
      border: 2px solid rgba(255, 193, 7, 0.6);
      box-shadow: 
        0 6px 16px rgba(255, 193, 7, 0.2),
        0 2px 8px rgba(0, 0, 0, 0.1);
      transform: scale(1) rotate(0deg) !important;
    }

    .sticky-note-header {
      background: transparent;
      padding: 8px 12px;
      border-radius: 0;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      user-select: none;
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
      width: calc(100% - 16px);
      height: calc(100% - 50px);
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
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      cursor: nw-resize;
      background: linear-gradient(-45deg, transparent 40%, rgba(0, 0, 0, 0.2) 50%, transparent 60%);
      border-radius: 0;
    }

    .note-resize-handle:hover {
      background: linear-gradient(-45deg, transparent 35%, rgba(0, 0, 0, 0.3) 50%, transparent 65%);
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

    /* Note Action Buttons */
    .note-action-buttons {
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.3);
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      margin: 0;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      font-weight: 500;
    }

    .action-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .action-btn.edit-btn {
      background: #22c55e;
      color: white;
    }

    .action-btn.edit-btn:hover {
      background: #16a34a;
    }

    .action-btn.delete-btn {
      background: #ef4444;
      color: white;
    }

    .action-btn.delete-btn:hover {
      background: #dc2626;
    }

    .action-btn.cancel-btn {
      background: #6b7280;
      color: white;
    }

    .action-btn.cancel-btn:hover {
      background: #4b5563;
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
    <textarea class="sticky-note-textarea" placeholder="Write your note here...">${content2}</textarea>
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
    let isDragging2 = false;
    let isResizing = false;
    let dragOffset2 = { x: 0, y: 0 };
    let isPinned = false;
    let isMinimized = false;
    let saveTimeout;
    textarea.addEventListener("input", () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveNote(textarea.value.trim());
      }, 1e3);
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
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", stopResize);
      e.preventDefault();
    });
    function handleResize(e) {
      if (!isResizing) return;
      const rect = note.getBoundingClientRect();
      const newWidth = Math.max(200, e.clientX - rect.left);
      const newHeight = Math.max(150, e.clientY - rect.top);
      note.style.width = newWidth + "px";
      note.style.height = newHeight + "px";
    }
    function stopResize() {
      isResizing = false;
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
    const stickyNote = createStickyNote(note.content);
    stickyNote.dataset.noteId = note.id;
    const noteTitle = stickyNote.querySelector(".note-title");
    if (noteTitle) {
      noteTitle.textContent = "Edit Note";
    }
    const actionButtons = document.createElement("div");
    actionButtons.className = "note-action-buttons";
    actionButtons.innerHTML = `
    <button class="action-btn edit-btn" title="Save & Close">✓</button>
    <button class="action-btn delete-btn" title="Delete Note">🗑️</button>
    <button class="action-btn cancel-btn" title="Cancel">×</button>
  `;
    const header = stickyNote.querySelector(".sticky-note-header");
    if (header) {
      header.after(actionButtons);
    }
    const editBtn = actionButtons.querySelector(".edit-btn");
    const deleteBtn = actionButtons.querySelector(".delete-btn");
    const cancelBtn = actionButtons.querySelector(".cancel-btn");
    editBtn == null ? void 0 : editBtn.addEventListener("click", () => {
      const textarea2 = stickyNote.querySelector(".sticky-note-textarea");
      const content2 = textarea2.value.trim();
      if (content2) {
        updateNote(note.id, content2);
        refreshNotesList();
      }
      stickyNote.remove();
    });
    deleteBtn == null ? void 0 : deleteBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this note?")) {
        deleteNote(note.id);
        refreshNotesList();
        stickyNote.remove();
      }
    });
    cancelBtn == null ? void 0 : cancelBtn.addEventListener("click", () => {
      stickyNote.remove();
    });
    const textarea = stickyNote.querySelector(".sticky-note-textarea");
    let saveTimeout;
    textarea.removeEventListener("input", () => {
    });
    textarea.addEventListener("input", () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(async () => {
        const content2 = textarea.value.trim();
        if (content2 && note.id) {
          await updateNote(note.id, content2);
          refreshNotesList();
        }
      }, 1e3);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1jb250ZW50LXNjcmlwdC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHd4dC1kZXYvYnJvd3Nlci9zcmMvaW5kZXgubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L2Jyb3dzZXIubWpzIiwiLi4vLi4vLi4vZW50cnlwb2ludHMvY29udGVudC50cyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LWNvbnRleHQubWpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVDb250ZW50U2NyaXB0KGRlZmluaXRpb24pIHtcbiAgcmV0dXJuIGRlZmluaXRpb247XG59XG4iLCIvLyAjcmVnaW9uIHNuaXBwZXRcbmV4cG9ydCBjb25zdCBicm93c2VyID0gZ2xvYmFsVGhpcy5icm93c2VyPy5ydW50aW1lPy5pZFxuICA/IGdsb2JhbFRoaXMuYnJvd3NlclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xuLy8gI2VuZHJlZ2lvbiBzbmlwcGV0XG4iLCJpbXBvcnQgeyBicm93c2VyIGFzIF9icm93c2VyIH0gZnJvbSBcIkB3eHQtZGV2L2Jyb3dzZXJcIjtcbmV4cG9ydCBjb25zdCBicm93c2VyID0gX2Jyb3dzZXI7XG5leHBvcnQge307XG4iLCJleHBvcnQgZGVmYXVsdCBkZWZpbmVDb250ZW50U2NyaXB0KHtcbiAgbWF0Y2hlczogW1wiPGFsbF91cmxzPlwiXSxcbiAgbWFpbigpIHtcbiAgICBjb25zb2xlLmxvZyhcIvCfjq8gU3RpY2t5Tm90ZUFJIHYyLjIgQ1NTIEZJWEVEICsgTUVOVSBQT1NJVElPTklORyAtIExvYWRpbmcuLi5cIik7XG5cbiAgICAvLyBXYWl0IGZvciBET00gdG8gYmUgcmVhZHlcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICAgICAgaW5pdGlhbGl6ZVdpZGdldCgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluaXRpYWxpemVXaWRnZXQoKTtcbiAgICB9XG4gIH0sXG59KTtcblxubGV0IHdpZGdldDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbmxldCBpc0RyYWdnaW5nID0gZmFsc2U7XG5sZXQgaXNNZW51T3BlbiA9IGZhbHNlO1xubGV0IGRyYWdPZmZzZXQgPSB7IHg6IDAsIHk6IDAgfTtcbmxldCBsYXN0UG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcbmxldCBtZW51Q2xvc2VUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xubGV0IGdsb2JhbFNtaWx5RmFjZVVybDogc3RyaW5nOyAvLyBHbG9iYWwgdmFyaWFibGUgZm9yIHNtaWxleSBmYWNlIFVSTFxuXG5mdW5jdGlvbiBpbml0aWFsaXplV2lkZ2V0KCkge1xuICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogRE9NIHJlYWR5LCBjcmVhdGluZyB3aWRnZXQuLi5cIik7XG4gIGNyZWF0ZUZsb2F0aW5nV2lkZ2V0KCk7XG4gIGxvYWRXaWRnZXRQb3NpdGlvbigpO1xuICBzZXR1cEtleWJvYXJkU2hvcnRjdXRzKCk7XG4gIHNldHVwTWVzc2FnZUxpc3RlbmVyKCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUZsb2F0aW5nV2lkZ2V0KCkge1xuICAvLyBSZW1vdmUgZXhpc3Rpbmcgd2lkZ2V0IGlmIGFueVxuICBjb25zdCBleGlzdGluZ1dpZGdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RpY2t5LW5vdGUtd2lkZ2V0XCIpO1xuICBpZiAoZXhpc3RpbmdXaWRnZXQpIHtcbiAgICBleGlzdGluZ1dpZGdldC5yZW1vdmUoKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSBtYWluIHdpZGdldCBjb250YWluZXJcbiAgd2lkZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgd2lkZ2V0LmlkID0gXCJzdGlja3ktbm90ZS13aWRnZXRcIjtcblxuICAvLyBUcnkgbXVsdGlwbGUgYXBwcm9hY2hlcyB0byBnZXQgdGhlIGNvcnJlY3QgVVJMcyBmb3IgcHVibGljIGFzc2V0c1xuICBsZXQgc21pbHlGYWNlVXJsOiBzdHJpbmc7XG4gIGxldCBhZGQyVXJsOiBzdHJpbmc7XG5cbiAgdHJ5IHtcbiAgICAvLyBQcmltYXJ5IGFwcHJvYWNoOiBVc2UgYnJvd3Nlci5ydW50aW1lLmdldFVSTFxuICAgIHNtaWx5RmFjZVVybCA9IGJyb3dzZXIucnVudGltZS5nZXRVUkwoXCJzbWlseWZhY2UuZ2lmXCIgYXMgYW55KTtcbiAgICBnbG9iYWxTbWlseUZhY2VVcmwgPSBzbWlseUZhY2VVcmw7IC8vIFN0b3JlIGdsb2JhbGx5XG4gICAgYWRkMlVybCA9IGJyb3dzZXIucnVudGltZS5nZXRVUkwoXCJhZGQyLnBuZ1wiIGFzIGFueSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS53YXJuKFwiYnJvd3Nlci5ydW50aW1lLmdldFVSTCBmYWlsZWQsIHVzaW5nIGZhbGxiYWNrIGFwcHJvYWNoOlwiLCBlcnJvcik7XG4gICAgLy8gRmFsbGJhY2sgYXBwcm9hY2g6IERpcmVjdCBleHRlbnNpb24gVVJMIGNvbnN0cnVjdGlvblxuICAgIGNvbnN0IGV4dGVuc2lvbklkID0gYnJvd3Nlci5ydW50aW1lLmlkIHx8IGNocm9tZS5ydW50aW1lLmlkO1xuICAgIHNtaWx5RmFjZVVybCA9IGBjaHJvbWUtZXh0ZW5zaW9uOi8vJHtleHRlbnNpb25JZH0vc21pbHlmYWNlLmdpZmA7XG4gICAgZ2xvYmFsU21pbHlGYWNlVXJsID0gc21pbHlGYWNlVXJsOyAvLyBTdG9yZSBnbG9iYWxseVxuICAgIGFkZDJVcmwgPSBgY2hyb21lLWV4dGVuc2lvbjovLyR7ZXh0ZW5zaW9uSWR9L2FkZDIucG5nYDtcbiAgfVxuXG4gIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBJbWFnZSBVUkxzOlwiLCB7IHNtaWx5RmFjZVVybCwgYWRkMlVybCB9KTtcbiAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IEV4dGVuc2lvbiBJRDpcIiwgYnJvd3Nlci5ydW50aW1lLmlkKTtcbiAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IENocm9tZSBydW50aW1lIElEOlwiLCBjaHJvbWUucnVudGltZS5pZCk7XG5cbiAgd2lkZ2V0LmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRhaW5lclwiPlxuICAgICAgPGRpdiBjbGFzcz1cIndpZGdldC1tYWluLWJ1dHRvblwiIGlkPVwibWFpbi1idXR0b25cIj5cbiAgICAgICAgPGltZyBzcmM9XCIke3NtaWx5RmFjZVVybH1cIiBhbHQ9XCJXaWRnZXRcIiBzdHlsZT1cIndpZHRoOiAyNHB4OyBoZWlnaHQ6IDI0cHg7XCIgaWQ9XCJzbWlsZXktaW1hZ2VcIj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIndpZGdldC1tZW51XCIgaWQ9XCJ3aWRnZXQtbWVudVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibWVudS1idXR0b24gYWRkLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiYWRkXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJhZGQtaWNvblwiPvCfk508L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibWVudS1idXR0b24gbm90ZXMtYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJub3Rlc1wiPvCfk4s8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtYnV0dG9uIHNldHRpbmdzLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwic2V0dGluZ3NcIj7impnvuI88L2Rpdj5cbiAgICAgICAgXG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbiAgLy8gQWRkIHN0eWxlc1xuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgc3R5bGUudGV4dENvbnRlbnQgPSBgXG4gICAgI3N0aWNreS1ub3RlLXdpZGdldCB7XG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICBib3R0b206IDUwdmg7XG4gICAgICByaWdodDogNTBweDtcbiAgICAgIHotaW5kZXg6IDk5OTk5OTtcbiAgICAgIGZvbnQtZmFtaWx5OiAnSW50ZXInLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIHNhbnMtc2VyaWY7XG4gICAgICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAgIH1cblxuICAgIC53aWRnZXQtY29udGFpbmVyIHtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICB9XG5cbiAgICAud2lkZ2V0LW1haW4tYnV0dG9uIHtcbiAgICAgIHdpZHRoOiA1MHB4O1xuICAgICAgaGVpZ2h0OiA1MHB4O1xuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzIyYzU1ZSAwJSwgIzE2YTM0YSAxMDAlKTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBmb250LXNpemU6IDIwcHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBib3gtc2hhZG93OiAwIDRweCAxNnB4IHJnYmEoMzQsIDE5NywgOTQsIDAuMyk7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xuICAgICAgYm9yZGVyOiAycHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xuICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEwcHgpO1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWFpbi1idXR0b246aG92ZXIge1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjA1KTtcbiAgICAgIGJveC1zaGFkb3c6IDAgNnB4IDIwcHggcmdiYSgzNCwgMTk3LCA5NCwgMC40KTtcbiAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMxNmEzNGEgMCUsICMxNTgwM2QgMTAwJSk7XG4gICAgfVxuICAgICAgICAwIDAgMTAwcHggcmdiYSgyMDQsIDEwMiwgMjE4LCAwLjQpO1xuICAgICAgYW5pbWF0aW9uOiBwdWxzZUdsb3dIb3ZlciAycyBlYXNlLWluLW91dCBpbmZpbml0ZTtcbiAgICB9XG5cbiAgICBAa2V5ZnJhbWVzIHB1bHNlR2xvd0hvdmVyIHtcbiAgICAgIDAlLCAxMDAlIHtcbiAgICAgICAgYm94LXNoYWRvdzogXG4gICAgICAgICAgMCA2cHggMjVweCByZ2JhKDE1MywgNDEsIDIzNCwgMC42KSxcbiAgICAgICAgICAwIDAgMzVweCByZ2JhKDE1MywgNDEsIDIzNCwgMC44KSxcbiAgICAgICAgICAwIDAgNzBweCByZ2JhKDIwNCwgMTAyLCAyMTgsIDAuNiksXG4gICAgICAgICAgMCAwIDEwMHB4IHJnYmEoMjA0LCAxMDIsIDIxOCwgMC40KTtcbiAgICAgIH1cbiAgICAgIDUwJSB7XG4gICAgICAgIGJveC1zaGFkb3c6IFxuICAgICAgICAgIDAgOHB4IDMwcHggcmdiYSgxNTMsIDQxLCAyMzQsIDAuOCksXG4gICAgICAgICAgMCAwIDQ1cHggcmdiYSgxNTMsIDQxLCAyMzQsIDEpLFxuICAgICAgICAgIDAgMCA5MHB4IHJnYmEoMjA0LCAxMDIsIDIxOCwgMC44KSxcbiAgICAgICAgICAwIDAgMTMwcHggcmdiYSgyMDQsIDEwMiwgMjE4LCAwLjUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC53aWRnZXQtbWFpbi1idXR0b24uZHJhZ2dpbmcge1xuICAgICAgY3Vyc29yOiBncmFiYmluZyAhaW1wb3J0YW50O1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjk1KTtcbiAgICAgIGJveC1zaGFkb3c6IFxuICAgICAgICAwIDhweCAzMHB4IHJnYmEoMTUzLCA0MSwgMjM0LCAwLjcpLFxuICAgICAgICAwIDAgMjVweCByZ2JhKDE1MywgNDEsIDIzNCwgMC45KSxcbiAgICAgICAgMCAwIDUwcHggcmdiYSgyMDQsIDEwMiwgMjE4LCAwLjcpLFxuICAgICAgICAwIDAgODBweCByZ2JhKDIwNCwgMTAyLCAyMTgsIDAuNSk7XG4gICAgICBhbmltYXRpb246IG5vbmU7XG4gICAgfVxuXG4gICAgLndpZGdldC1tZW51IHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHRvcDogMTAwJTtcbiAgICAgIGxlZnQ6IDUwJTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTtcbiAgICAgIG1hcmdpbi10b3A6IDEwcHg7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIGdhcDogMTBweDtcbiAgICAgIG9wYWNpdHk6IDA7XG4gICAgICB2aXNpYmlsaXR5OiBoaWRkZW47XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgfVxuXG4gICAgLndpZGdldC1tZW51LnRvcC1wb3NpdGlvbmVkIHtcbiAgICAgIHRvcDogYXV0bztcbiAgICAgIGJvdHRvbTogMTAwJTtcbiAgICAgIG1hcmdpbi10b3A6IDA7XG4gICAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbi1yZXZlcnNlOyAvKiBSZXZlcnNlIG9yZGVyIHNvIGJ1dHRvbnMgYXBwZWFyIG5hdHVyYWxseSAqL1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudS5vcGVuIHtcbiAgICAgIG9wYWNpdHk6IDE7XG4gICAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xuICAgICAgcG9pbnRlci1ldmVudHM6IGF1dG87XG4gICAgfVxuXG4gICAgLm1lbnUtYnV0dG9uIHtcbiAgICAgIHdpZHRoOiA0MHB4O1xuICAgICAgaGVpZ2h0OiA0MHB4O1xuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2Y4ZmFmYyAwJSwgI2UyZThmMCAxMDAlKTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBib3gtc2hhZG93OiAwIDJweCA4cHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgICAgIGJvcmRlcjogMnB4IHNvbGlkIHJnYmEoMzQsIDE5NywgOTQsIDAuMik7XG4gICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCk7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTEwcHgpO1xuICAgICAgb3BhY2l0eTogMDtcbiAgICAgIGNvbG9yOiAjMzc0MTUxO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbiB7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbjpudGgtY2hpbGQoMSkgeyB0cmFuc2l0aW9uLWRlbGF5OiAwLjA1czsgfVxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbjpudGgtY2hpbGQoMikgeyB0cmFuc2l0aW9uLWRlbGF5OiAwLjFzOyB9XG4gICAgLndpZGdldC1tZW51Lm9wZW4gLm1lbnUtYnV0dG9uOm50aC1jaGlsZCgzKSB7IHRyYW5zaXRpb24tZGVsYXk6IDAuMTVzOyB9XG4gICAgLndpZGdldC1tZW51Lm9wZW4gLm1lbnUtYnV0dG9uOm50aC1jaGlsZCg0KSB7IHRyYW5zaXRpb24tZGVsYXk6IDAuMnM7IH1cblxuICAgIC5tZW51LWJ1dHRvbjpob3ZlciB7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7XG4gICAgICBib3gtc2hhZG93OiAwIDRweCAxMnB4IHJnYmEoMzQsIDE5NywgOTQsIDAuMik7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMjJjNTVlIDAlLCAjMTZhMzRhIDEwMCUpO1xuICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgYm9yZGVyLWNvbG9yOiByZ2JhKDIyLCAxNjMsIDc0LCAwLjMpO1xuICAgIH1cblxuICAgIC5hZGQtaWNvbiB7XG4gICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICBsaW5lLWhlaWdodDogMTtcbiAgICAgIHVzZXItc2VsZWN0OiBub25lO1xuICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgfVxuXG5cbiAgICAuc3RpY2t5LW1vZGFsIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIGxlZnQ6IDA7XG4gICAgICB3aWR0aDogMTAwdnc7XG4gICAgICBoZWlnaHQ6IDEwMHZoO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjYpO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIHotaW5kZXg6IDEwMDAwMDA7XG4gICAgICBvcGFjaXR5OiAwO1xuICAgICAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcbiAgICB9XG5cbiAgICAuc3RpY2t5LW1vZGFsLm9wZW4ge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHZpc2liaWxpdHk6IHZpc2libGU7XG4gICAgfVxuXG4gICAgLm1vZGFsLWNvbnRlbnQge1xuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI0ZBRUI5MiAwJSwgI0NDNjZEQSAxMDAlKTtcbiAgICAgIHBhZGRpbmc6IDMwcHg7XG4gICAgICBib3JkZXItcmFkaXVzOiAxNXB4O1xuICAgICAgYm94LXNoYWRvdzogXG4gICAgICAgIDAgMjBweCA2MHB4IHJnYmEoMTUzLCA0MSwgMjM0LCAwLjUpLFxuICAgICAgICAwIDAgMCAzcHggcmdiYSgwLCAwLCAwLCAwLjIpLFxuICAgICAgICAwIDEwcHggMzBweCByZ2JhKDIwNCwgMTAyLCAyMTgsIDAuNCk7XG4gICAgICBtYXgtd2lkdGg6IDUwMHB4O1xuICAgICAgd2lkdGg6IDkwJTtcbiAgICAgIG1heC1oZWlnaHQ6IDgwdmg7XG4gICAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjkpO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbiAgICAgIGJvcmRlcjogM3B4IHNvbGlkICMwMDAwMDA7XG4gICAgfVxuXG4gICAgLnN0aWNreS1tb2RhbC5vcGVuIC5tb2RhbC1jb250ZW50IHtcbiAgICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XG4gICAgfVxuXG4gICAgLm1vZGFsLWhlYWRlciB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIG1hcmdpbi1ib3R0b206IDIwcHg7XG4gICAgICBwYWRkaW5nLWJvdHRvbTogMTVweDtcbiAgICAgIGJvcmRlci1ib3R0b206IDNweCBzb2xpZCAjMDAwMDAwO1xuICAgICAgYmFja2dyb3VuZDogI0ZERkZCODtcbiAgICAgIHBhZGRpbmc6IDE1cHg7XG4gICAgICBtYXJnaW46IC0zMHB4IC0zMHB4IDIwcHggLTMwcHg7XG4gICAgICBib3JkZXItcmFkaXVzOiAxNXB4IDE1cHggMCAwO1xuICAgIH1cblxuICAgIC5tb2RhbC10aXRsZSB7XG4gICAgICBmb250LXNpemU6IDIwcHg7XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgY29sb3I6ICMwMDAwMDA7XG4gICAgICB0ZXh0LXNoYWRvdzogMCAxcHggMnB4IHJnYmEoMjUwLCAyMzUsIDE0NiwgMC44KTtcbiAgICB9XG5cbiAgICAubW9kYWwtY2xvc2Uge1xuICAgICAgYmFja2dyb3VuZDogIzk5MjlFQTtcbiAgICAgIGJvcmRlcjogMnB4IHNvbGlkICMwMDAwMDA7XG4gICAgICBmb250LXNpemU6IDI0cHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBjb2xvcjogI0ZBRUI5MjtcbiAgICAgIHBhZGRpbmc6IDVweDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgICBib3gtc2hhZG93OiAwIDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjMpO1xuICAgIH1cblxuICAgIC5tb2RhbC1jbG9zZTpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjQ0M2NkRBO1xuICAgICAgY29sb3I6ICMwMDAwMDA7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7XG4gICAgICBib3gtc2hhZG93OiAwIDNweCA4cHggcmdiYSgwLCAwLCAwLCAwLjQpO1xuICAgIH1cblxuICAgIC5ub3RlLWlucHV0IHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgbWluLWhlaWdodDogMjAwcHg7XG4gICAgICBwYWRkaW5nOiAxNXB4O1xuICAgICAgYm9yZGVyOiAzcHggc29saWQgIzAwMDAwMDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICBmb250LWZhbWlseTogJ0NvbWljIFNhbnMgTVMnLCBjdXJzaXZlLCBzYW5zLXNlcmlmO1xuICAgICAgcmVzaXplOiB2ZXJ0aWNhbDtcbiAgICAgIHRyYW5zaXRpb246IGJvcmRlci1jb2xvciAwLjJzIGVhc2U7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1MywgMjU1LCAxODQsIDAuOSk7XG4gICAgICBjb2xvcjogIzAwMDAwMDtcbiAgICAgIGJveC1zaGFkb3c6IGluc2V0IDAgMnB4IDVweCByZ2JhKDE1MywgNDEsIDIzNCwgMC4zKTtcbiAgICB9XG5cbiAgICAubm90ZS1pbnB1dDpmb2N1cyB7XG4gICAgICBvdXRsaW5lOiBub25lO1xuICAgICAgYm9yZGVyLWNvbG9yOiAjOTkyOUVBO1xuICAgICAgYm94LXNoYWRvdzogXG4gICAgICAgIGluc2V0IDAgMnB4IDVweCByZ2JhKDE1MywgNDEsIDIzNCwgMC40KSxcbiAgICAgICAgMCAwIDAgM3B4IHJnYmEoMjA0LCAxMDIsIDIxOCwgMC4zKTtcbiAgICB9XG5cbiAgICAuYnV0dG9uLWdyb3VwIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBnYXA6IDEwcHg7XG4gICAgICBtYXJnaW4tdG9wOiAyMHB4O1xuICAgIH1cblxuICAgIC5idG4ge1xuICAgICAgcGFkZGluZzogMTBweCAyMHB4O1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgICBib3gtc2hhZG93OiAwIDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjIpO1xuICAgIH1cblxuICAgIC5idG4tcHJpbWFyeSB7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjOTkyOUVBIDAlLCAjQ0M2NkRBIDEwMCUpO1xuICAgICAgY29sb3I6ICNGQUVCOTI7XG4gICAgICBib3JkZXI6IDJweCBzb2xpZCAjMDAwMDAwO1xuICAgIH1cblxuICAgIC5idG4tcHJpbWFyeTpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjQ0M2NkRBIDAlLCAjOTkyOUVBIDEwMCUpO1xuICAgICAgY29sb3I6ICMwMDAwMDA7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTJweCk7XG4gICAgICBib3gtc2hhZG93OiAwIDRweCAxMHB4IHJnYmEoMTUzLCA0MSwgMjM0LCAwLjUpO1xuICAgIH1cblxuICAgIC5idG4tc2Vjb25kYXJ5IHtcbiAgICAgIGJhY2tncm91bmQ6ICNGQUVCOTI7XG4gICAgICBjb2xvcjogIzAwMDAwMDtcbiAgICAgIGJvcmRlcjogMnB4IHNvbGlkICMwMDAwMDA7XG4gICAgfVxuXG4gICAgLmJ0bi1zZWNvbmRhcnk6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogI0NDNjZEQTtcbiAgICAgIGNvbG9yOiAjMDAwMDAwO1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0ycHgpO1xuICAgICAgYm94LXNoYWRvdzogMCA0cHggMTBweCByZ2JhKDIwNCwgMTAyLCAyMTgsIDAuNSk7XG4gICAgfVxuXG4gICAgLm5vdGVzLXBhbmVsIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogNTAlO1xuICAgICAgcmlnaHQ6IC0zMDBweDtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTtcbiAgICAgIHdpZHRoOiAyODBweDtcbiAgICAgIG1heC1oZWlnaHQ6IDQwMHB4O1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICAgIGJveC1zaGFkb3c6IDAgOHB4IDMycHggcmdiYSgwLCAwLCAwLCAwLjE1KSxcbiAgICAgICAgICAgICAgICAgIDAgMnB4IDhweCByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gICAgICB6LWluZGV4OiA5OTk5OTg7XG4gICAgICB0cmFuc2l0aW9uOiByaWdodCAwLjNzIGVhc2U7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEwcHgpO1xuICAgIH1cblxuICAgIC5ub3Rlcy1wYW5lbC5vcGVuIHtcbiAgICAgIHJpZ2h0OiAyMHB4O1xuICAgIH1cblxuICAgIC5ub3Rlcy1oZWFkZXIge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1MSwgMTQ3LCAwLjgpO1xuICAgICAgY29sb3I6ICM0YTRhNGE7XG4gICAgICBwYWRkaW5nOiAxMnB4IDE2cHg7XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgICB9XG5cbiAgICAubm90ZXMtbGlzdCB7XG4gICAgICBtYXgtaGVpZ2h0OiAzMDBweDtcbiAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgICBwYWRkaW5nOiA4cHg7XG4gICAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgICB9XG5cbiAgICAubm90ZS1pdGVtIHtcbiAgICAgIHBhZGRpbmc6IDEycHg7XG4gICAgICBtYXJnaW4tYm90dG9tOiA4cHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjUxLCAxNDcsIDAuNik7XG4gICAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICAgICAgYm94LXNoYWRvdzogMCAxcHggM3B4IHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgICB9XG5cbiAgICAubm90ZS1pdGVtOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTEsIDE0NywgMC44KTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgzcHgpO1xuICAgICAgYm94LXNoYWRvdzogMCAycHggOHB4IHJnYmEoMCwgMCwgMCwgMC4xNSk7XG4gICAgfVxuXG4gICAgLm5vdGUtaXRlbTpudGgtY2hpbGQoMm4pIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyMzcsIDIxMywgMC42KTtcbiAgICB9XG5cbiAgICAubm90ZS1pdGVtOm50aC1jaGlsZCgybik6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDIzNywgMjEzLCAwLjgpO1xuICAgIH1cblxuICAgIC5ub3RlLWl0ZW06bnRoLWNoaWxkKDNuKSB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDIzNywgMjU1LCAyMzUsIDAuNik7XG4gICAgfVxuXG4gICAgLm5vdGUtaXRlbTpudGgtY2hpbGQoM24pOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjM3LCAyNTUsIDIzNSwgMC44KTtcbiAgICB9XG5cbiAgICAubm90ZS1wcmV2aWV3IHtcbiAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgIGNvbG9yOiAjNTU1O1xuICAgICAgbWFyZ2luLXRvcDogNHB4O1xuICAgICAgZGlzcGxheTogLXdlYmtpdC1ib3g7XG4gICAgICAtd2Via2l0LWxpbmUtY2xhbXA6IDI7XG4gICAgICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsO1xuICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjQ7XG4gICAgfVxuXG4gICAgLm5vdGUtZGF0ZSB7XG4gICAgICBmb250LXNpemU6IDEwcHg7XG4gICAgICBjb2xvcjogIzg4ODtcbiAgICAgIG1hcmdpbi10b3A6IDRweDtcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcbiAgICB9XG5cbiAgICBAbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcbiAgICAgIC5ub3Rlcy1wYW5lbCB7XG4gICAgICAgIHdpZHRoOiA5MCU7XG4gICAgICAgIHJpZ2h0OiAtMTAwJTtcbiAgICAgIH1cbiAgICAgIC5ub3Rlcy1wYW5lbC5vcGVuIHtcbiAgICAgICAgcmlnaHQ6IDUlO1xuICAgICAgfVxuICAgIH1cbiBcblxuICAgIC8qIFN0aWNreSBOb3RlIFN0eWxlcyAqL1xuICAgIC5zdGlja3ktbm90ZSB7XG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICB3aWR0aDogMjgwcHg7XG4gICAgICBoZWlnaHQ6IDE4MHB4O1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1MSwgMTQ3LCAwLjk1KTsgLyogQ2xhc3NpYyB5ZWxsb3cgc3RpY2t5IG5vdGUgKi9cbiAgICAgIGJvcmRlci1yYWRpdXM6IDBweDtcbiAgICAgIGJveC1zaGFkb3c6IFxuICAgICAgICAwIDRweCAxMnB4IHJnYmEoMCwgMCwgMCwgMC4xNSksXG4gICAgICAgIDAgMXB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gICAgICB6LWluZGV4OiA5OTk5OTc7XG4gICAgICBmb250LWZhbWlseTogJ1NlZ29lIFVJJywgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjkpIHJvdGF0ZSh2YXIoLS1ub3RlLXJvdGF0aW9uLCAtMWRlZykpO1xuICAgICAgb3BhY2l0eTogMDtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2U7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMnB4KTtcbiAgICB9XG5cbiAgICAuc3RpY2t5LW5vdGUub3BlbiB7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEpIHJvdGF0ZSh2YXIoLS1ub3RlLXJvdGF0aW9uLCAwZGVnKSk7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgIH1cblxuICAgIC5zdGlja3ktbm90ZS5taW5pbWl6ZWQge1xuICAgICAgaGVpZ2h0OiAzNnB4O1xuICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICB9XG5cbiAgICAuc3RpY2t5LW5vdGUubWluaW1pemVkIC5zdGlja3ktbm90ZS10ZXh0YXJlYSB7XG4gICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cblxuICAgIC5zdGlja3ktbm90ZS5taW5pbWl6ZWQgLm5vdGUtcmVzaXplLWhhbmRsZSB7XG4gICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cblxuICAgIC5zdGlja3ktbm90ZS5waW5uZWQge1xuICAgICAgYm9yZGVyOiAycHggc29saWQgcmdiYSgyNTUsIDE5MywgNywgMC42KTtcbiAgICAgIGJveC1zaGFkb3c6IFxuICAgICAgICAwIDZweCAxNnB4IHJnYmEoMjU1LCAxOTMsIDcsIDAuMiksXG4gICAgICAgIDAgMnB4IDhweCByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEpIHJvdGF0ZSgwZGVnKSAhaW1wb3J0YW50O1xuICAgIH1cblxuICAgIC5zdGlja3ktbm90ZS1oZWFkZXIge1xuICAgICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gICAgICBwYWRkaW5nOiA4cHggMTJweDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDA7XG4gICAgICBjdXJzb3I6IG1vdmU7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gICAgICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgICB9XG5cbiAgICAubm90ZS10aXRsZSB7XG4gICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgICAgY29sb3I6ICM2NjY7XG4gICAgICB0ZXh0LXNoYWRvdzogbm9uZTtcbiAgICB9XG5cbiAgICAubm90ZS1jb250cm9scyB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZ2FwOiA0cHg7XG4gICAgfVxuXG4gICAgLm5vdGUtY29udHJvbC1idG4ge1xuICAgICAgd2lkdGg6IDIwcHg7XG4gICAgICBoZWlnaHQ6IDIwcHg7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7IC8qIE1ha2UgYnV0dG9ucyBjaXJjdWxhciAqL1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgZm9udC1zaXplOiAxMHB4O1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgICBjb2xvcjogIzY2NjtcbiAgICAgIGJveC1zaGFkb3c6IDAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gICAgfVxuXG4gICAgLm5vdGUtY29udHJvbC1idG46aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjIpO1xuICAgICAgY29sb3I6ICMzMzM7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7XG4gICAgfVxuXG4gICAgLm5vdGUtY29udHJvbC1idG4ucGluLWJ0bi5waW5uZWQge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDE5MywgNywgMC44KTtcbiAgICAgIGNvbG9yOiAjZmZmO1xuICAgIH1cblxuICAgIC5ub3RlLWNvbnRyb2wtYnRuLmNsb3NlLWJ0bjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDIyMCwgMzgsIDM4LCAwLjgpO1xuICAgICAgY29sb3I6ICNmZmY7XG4gICAgfVxuXG4gICAgLnN0aWNreS1ub3RlLXRleHRhcmVhIHtcbiAgICAgIHdpZHRoOiBjYWxjKDEwMCUgLSAxNnB4KTtcbiAgICAgIGhlaWdodDogY2FsYygxMDAlIC0gNTBweCk7XG4gICAgICBtYXJnaW46IDhweDtcbiAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgICAgcmVzaXplOiBub25lO1xuICAgICAgb3V0bGluZTogbm9uZTtcbiAgICAgIGZvbnQtZmFtaWx5OiAnU2Vnb2UgVUknLCBzeXN0ZW0tdWksIHNhbnMtc2VyaWY7XG4gICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICBjb2xvcjogIzMzMztcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjU7XG4gICAgICBwbGFjZWhvbGRlci1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjQpO1xuICAgIH1cblxuICAgIC5zdGlja3ktbm90ZS10ZXh0YXJlYTo6cGxhY2Vob2xkZXIge1xuICAgICAgY29sb3I6IHJnYmEoMCwgMCwgMCwgMC40KTtcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcbiAgICB9XG5cbiAgICAubm90ZS1yZXNpemUtaGFuZGxlIHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIGJvdHRvbTogMnB4O1xuICAgICAgcmlnaHQ6IDJweDtcbiAgICAgIHdpZHRoOiAxMnB4O1xuICAgICAgaGVpZ2h0OiAxMnB4O1xuICAgICAgY3Vyc29yOiBudy1yZXNpemU7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoLTQ1ZGVnLCB0cmFuc3BhcmVudCA0MCUsIHJnYmEoMCwgMCwgMCwgMC4yKSA1MCUsIHRyYW5zcGFyZW50IDYwJSk7XG4gICAgICBib3JkZXItcmFkaXVzOiAwO1xuICAgIH1cblxuICAgIC5ub3RlLXJlc2l6ZS1oYW5kbGU6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KC00NWRlZywgdHJhbnNwYXJlbnQgMzUlLCByZ2JhKDAsIDAsIDAsIDAuMykgNTAlLCB0cmFuc3BhcmVudCA2NSUpO1xuICAgIH1cblxuICAgIC8qIE5vdGUgT3B0aW9ucyBNb2RhbCAqL1xuICAgIC5ub3RlLW9wdGlvbnMtbW9kYWwge1xuICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgdG9wOiAwO1xuICAgICAgbGVmdDogMDtcbiAgICAgIHdpZHRoOiAxMDB2dztcbiAgICAgIGhlaWdodDogMTAwdmg7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuNik7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgei1pbmRleDogMTAwMDAwMDtcbiAgICAgIG9wYWNpdHk6IDA7XG4gICAgICB2aXNpYmlsaXR5OiBoaWRkZW47XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xuICAgIH1cblxuICAgIC5ub3RlLW9wdGlvbnMtbW9kYWwub3BlbiB7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgICAgdmlzaWJpbGl0eTogdmlzaWJsZTtcbiAgICB9XG5cbiAgICAubm90ZS1vcHRpb25zLWNvbnRlbnQge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gICAgICBwYWRkaW5nOiAyNHB4O1xuICAgICAgbWF4LXdpZHRoOiA0MDBweDtcbiAgICAgIHdpZHRoOiA5MCU7XG4gICAgICBtYXgtaGVpZ2h0OiA4MHZoO1xuICAgICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICAgIGJveC1zaGFkb3c6IDAgMjBweCA2MHB4IHJnYmEoMCwgMCwgMCwgMC4zKTtcbiAgICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxMHB4KTtcbiAgICAgIHRyYW5zZm9ybTogc2NhbGUoMC45KTtcbiAgICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjNzIGVhc2U7XG4gICAgfVxuXG4gICAgLm5vdGUtb3B0aW9ucy1tb2RhbC5vcGVuIC5ub3RlLW9wdGlvbnMtY29udGVudCB7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xuICAgIH1cblxuICAgIC5ub3RlLXByZXZpZXctc2VjdGlvbiB7XG4gICAgICBtYXJnaW4tYm90dG9tOiAyNHB4O1xuICAgICAgcGFkZGluZzogMTZweDtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTEsIDE0NywgMC4zKTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICAgIGJvcmRlci1sZWZ0OiA0cHggc29saWQgIzIyYzU1ZTtcbiAgICB9XG5cbiAgICAubm90ZS1wcmV2aWV3LXNlY3Rpb24gaDMge1xuICAgICAgbWFyZ2luOiAwIDAgMTJweCAwO1xuICAgICAgY29sb3I6ICMzNzQxNTE7XG4gICAgICBmb250LXNpemU6IDE4cHg7XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgIH1cblxuICAgIC5ub3RlLXByZXZpZXctdGV4dCB7XG4gICAgICBjb2xvcjogIzU1NTtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjU7XG4gICAgICBtYXJnaW4tYm90dG9tOiA4cHg7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgfVxuXG4gICAgLm5vdGUtZGF0ZSB7XG4gICAgICBjb2xvcjogIzg4ODtcbiAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcbiAgICB9XG5cbiAgICAvKiBTaW1wbGUgTm90ZSBJdGVtcyAqL1xuICAgIC5ub3RlLWl0ZW0ge1xuICAgICAgcGFkZGluZzogMTJweCAxNnB4O1xuICAgICAgbWFyZ2luOiA4cHggMDtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45KTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBib3gtc2hhZG93OiAwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgIH1cbiAgICBcbiAgICAubm90ZS1pdGVtOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMSk7XG4gICAgICBib3gtc2hhZG93OiAwIDRweCA4cHggcmdiYSgwLCAwLCAwLCAwLjE1KTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXB4KTtcbiAgICB9XG4gICAgXG4gICAgLm5vdGUtcHJldmlldyB7XG4gICAgICBjb2xvcjogIzM3NDE1MTtcbiAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjQ7XG4gICAgICBtYXJnaW4tYm90dG9tOiA4cHg7XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgIH1cbiAgICBcbiAgICAubm90ZS1kYXRlIHtcbiAgICAgIGZvbnQtc2l6ZTogMTFweDtcbiAgICAgIGNvbG9yOiAjOWNhM2FmO1xuICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgICB9XG5cbiAgICAvKiBOb3RlIEFjdGlvbiBCdXR0b25zICovXG4gICAgLm5vdGUtYWN0aW9uLWJ1dHRvbnMge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgZ2FwOiA4cHg7XG4gICAgICBwYWRkaW5nOiA4cHg7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyk7XG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgICAgbWFyZ2luOiAwO1xuICAgIH1cblxuICAgIC5hY3Rpb24tYnRuIHtcbiAgICAgIHdpZHRoOiAzMnB4O1xuICAgICAgaGVpZ2h0OiAzMnB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBib3gtc2hhZG93OiAwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICB9XG5cbiAgICAuYWN0aW9uLWJ0bjpob3ZlciB7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7XG4gICAgICBib3gtc2hhZG93OiAwIDRweCA4cHggcmdiYSgwLCAwLCAwLCAwLjIpO1xuICAgIH1cblxuICAgIC5hY3Rpb24tYnRuLmVkaXQtYnRuIHtcbiAgICAgIGJhY2tncm91bmQ6ICMyMmM1NWU7XG4gICAgICBjb2xvcjogd2hpdGU7XG4gICAgfVxuXG4gICAgLmFjdGlvbi1idG4uZWRpdC1idG46aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogIzE2YTM0YTtcbiAgICB9XG5cbiAgICAuYWN0aW9uLWJ0bi5kZWxldGUtYnRuIHtcbiAgICAgIGJhY2tncm91bmQ6ICNlZjQ0NDQ7XG4gICAgICBjb2xvcjogd2hpdGU7XG4gICAgfVxuXG4gICAgLmFjdGlvbi1idG4uZGVsZXRlLWJ0bjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjZGMyNjI2O1xuICAgIH1cblxuICAgIC5hY3Rpb24tYnRuLmNhbmNlbC1idG4ge1xuICAgICAgYmFja2dyb3VuZDogIzZiNzI4MDtcbiAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICB9XG5cbiAgICAuYWN0aW9uLWJ0bi5jYW5jZWwtYnRuOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6ICM0YjU1NjM7XG4gICAgfVxuXG4gICAgLyogLi4uZXhpc3RpbmcgY29kZS4uLiAqL1xuICBgO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh3aWRnZXQpO1xuXG4gIC8vIFNldHVwIGltYWdlIGxvYWRpbmcgZXZlbnQgbGlzdGVuZXJzXG4gIGNvbnN0IHNtaWxleUltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzbWlsZXktaW1hZ2VcIikgYXMgSFRNTEltYWdlRWxlbWVudDtcbiAgY29uc3QgYWRkSW1hZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZC1pbWFnZVwiKSBhcyBIVE1MSW1hZ2VFbGVtZW50O1xuXG4gIGlmIChzbWlsZXlJbWFnZSkge1xuICAgIHNtaWxleUltYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwi4pyFIFNtaWxleSBmYWNlIGltYWdlIGxvYWRlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgfSk7XG4gICAgc21pbGV5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsICgpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCLinYwgRmFpbGVkIHRvIGxvYWQgc21pbGV5IGZhY2UgaW1hZ2U6XCIsIHNtaWx5RmFjZVVybCk7XG4gICAgICBzbWlsZXlJbWFnZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoYWRkSW1hZ2UpIHtcbiAgICBhZGRJbWFnZS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIuKchSBBZGQyIGltYWdlIGxvYWRlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgfSk7XG4gICAgYWRkSW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsICgpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCLinYwgRmFpbGVkIHRvIGxvYWQgYWRkMiBpbWFnZTpcIiwgYWRkMlVybCk7XG4gICAgICBhZGRJbWFnZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfSk7XG4gIH1cblxuICBzZXR1cFdpZGdldEV2ZW50cygpO1xufVxuXG5mdW5jdGlvbiBzZXR1cFdpZGdldEV2ZW50cygpIHtcbiAgY29uc3QgbWFpbkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbi1idXR0b25cIik7XG4gIGNvbnN0IG1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndpZGdldC1tZW51XCIpO1xuXG4gIGlmICghbWFpbkJ1dHRvbiB8fCAhbWVudSkgcmV0dXJuO1xuXG4gIGxldCBkcmFnU3RhcnRUaW1lID0gMDtcbiAgbGV0IHN0YXJ0UG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcbiAgbGV0IGhhc01vdmVkV2hpbGVEcmFnZ2luZyA9IGZhbHNlO1xuXG4gIC8vIEJvdW5kYXJ5IGNvbnN0cmFpbnQgZnVuY3Rpb25cbiAgZnVuY3Rpb24gY29uc3RyYWluVG9Cb3VuZHMoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0ge1xuICAgIGlmICghd2lkZ2V0KSByZXR1cm4geyB4LCB5IH07XG5cbiAgICBjb25zdCB3aWRnZXRSZWN0ID0geyB3aWR0aDogNTAsIGhlaWdodDogNTAgfTsgLy8gV2lkZ2V0IGRpbWVuc2lvbnNcbiAgICBjb25zdCB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIGNvbnN0IHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBjb25zdCBtYXJnaW4gPSAxMDsgLy8gTWluaW11bSBtYXJnaW4gZnJvbSBlZGdlc1xuXG4gICAgLy8gQ29uc3RyYWluIGhvcml6b250YWwgcG9zaXRpb25cbiAgICBsZXQgY29uc3RyYWluZWRYID0gTWF0aC5tYXgobWFyZ2luLCB4KTtcbiAgICBjb25zdHJhaW5lZFggPSBNYXRoLm1pbih3aW5kb3dXaWR0aCAtIHdpZGdldFJlY3Qud2lkdGggLSBtYXJnaW4sIGNvbnN0cmFpbmVkWCk7XG5cbiAgICAvLyBDb25zdHJhaW4gdmVydGljYWwgcG9zaXRpb25cbiAgICBsZXQgY29uc3RyYWluZWRZID0gTWF0aC5tYXgobWFyZ2luLCB5KTtcbiAgICBjb25zdHJhaW5lZFkgPSBNYXRoLm1pbih3aW5kb3dIZWlnaHQgLSB3aWRnZXRSZWN0LmhlaWdodCAtIG1hcmdpbiwgY29uc3RyYWluZWRZKTtcblxuICAgIHJldHVybiB7IHg6IGNvbnN0cmFpbmVkWCwgeTogY29uc3RyYWluZWRZIH07XG4gIH1cblxuICAvLyBTbmFwIHRvIG5lYXJlc3QgZWRnZSBmdW5jdGlvblxuICBmdW5jdGlvbiBzbmFwVG9OZWFyZXN0RWRnZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB7XG4gICAgaWYgKCF3aWRnZXQpIHJldHVybiB7IHgsIHkgfTtcblxuICAgIGNvbnN0IHdpZGdldFJlY3QgPSB7IHdpZHRoOiA1MCwgaGVpZ2h0OiA1MCB9O1xuICAgIGNvbnN0IHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgY29uc3Qgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIGNvbnN0IHNuYXBNYXJnaW4gPSAyMDsgLy8gRGlzdGFuY2UgZnJvbSBlZGdlIHRvIHNuYXAgdG9cblxuICAgIC8vIENhbGN1bGF0ZSBkaXN0YW5jZXMgdG8gZWFjaCBlZGdlXG4gICAgY29uc3QgZGlzdGFuY2VUb0xlZnQgPSB4O1xuICAgIGNvbnN0IGRpc3RhbmNlVG9SaWdodCA9IHdpbmRvd1dpZHRoIC0gKHggKyB3aWRnZXRSZWN0LndpZHRoKTtcbiAgICBjb25zdCBkaXN0YW5jZVRvVG9wID0geTtcbiAgICBjb25zdCBkaXN0YW5jZVRvQm90dG9tID0gd2luZG93SGVpZ2h0IC0gKHkgKyB3aWRnZXRSZWN0LmhlaWdodCk7XG5cbiAgICAvLyBGaW5kIHRoZSBuZWFyZXN0IGVkZ2VcbiAgICBjb25zdCBtaW5EaXN0YW5jZSA9IE1hdGgubWluKGRpc3RhbmNlVG9MZWZ0LCBkaXN0YW5jZVRvUmlnaHQsIGRpc3RhbmNlVG9Ub3AsIGRpc3RhbmNlVG9Cb3R0b20pO1xuXG4gICAgbGV0IHNuYXBwZWRYID0geDtcbiAgICBsZXQgc25hcHBlZFkgPSB5O1xuXG4gICAgLy8gU25hcCB0byB0aGUgbmVhcmVzdCBlZGdlIGlmIHdpZGdldCBpcyBwYXJ0aWFsbHkgaGlkZGVuXG4gICAgaWYgKHggPCAwIHx8IHggKyB3aWRnZXRSZWN0LndpZHRoID4gd2luZG93V2lkdGggfHwgeSA8IDAgfHwgeSArIHdpZGdldFJlY3QuaGVpZ2h0ID4gd2luZG93SGVpZ2h0KSB7XG4gICAgICBpZiAobWluRGlzdGFuY2UgPT09IGRpc3RhbmNlVG9MZWZ0KSB7XG4gICAgICAgIHNuYXBwZWRYID0gc25hcE1hcmdpbjtcbiAgICAgIH0gZWxzZSBpZiAobWluRGlzdGFuY2UgPT09IGRpc3RhbmNlVG9SaWdodCkge1xuICAgICAgICBzbmFwcGVkWCA9IHdpbmRvd1dpZHRoIC0gd2lkZ2V0UmVjdC53aWR0aCAtIHNuYXBNYXJnaW47XG4gICAgICB9IGVsc2UgaWYgKG1pbkRpc3RhbmNlID09PSBkaXN0YW5jZVRvVG9wKSB7XG4gICAgICAgIHNuYXBwZWRZID0gc25hcE1hcmdpbjtcbiAgICAgIH0gZWxzZSBpZiAobWluRGlzdGFuY2UgPT09IGRpc3RhbmNlVG9Cb3R0b20pIHtcbiAgICAgICAgc25hcHBlZFkgPSB3aW5kb3dIZWlnaHQgLSB3aWRnZXRSZWN0LmhlaWdodCAtIHNuYXBNYXJnaW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgeDogc25hcHBlZFgsIHk6IHNuYXBwZWRZIH07XG4gIH1cblxuICAvLyBNb3VzZSBldmVudHMgZm9yIG1haW4gYnV0dG9uXG4gIG1haW5CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBkcmFnU3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBzdGFydFBvc2l0aW9uID0geyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSB9O1xuICAgIGhhc01vdmVkV2hpbGVEcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgY29uc3QgcmVjdCA9IHdpZGdldCEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgZHJhZ09mZnNldC54ID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgIGRyYWdPZmZzZXQueSA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgbWFpbkJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiZHJhZ2dpbmdcIik7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGhhbmRsZU1vdXNlTW92ZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgaGFuZGxlTW91c2VVcCk7XG4gIH0pO1xuXG4gIC8vIEltcHJvdmVkIGhvdmVyIGV2ZW50cyBmb3IgbWVudSB3aXRoIGJldHRlciBib3VuZGFyeSBkZXRlY3Rpb25cbiAgbWFpbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgaWYgKCFpc0RyYWdnaW5nKSB7XG4gICAgICAvLyBDbGVhciBhbnkgcGVuZGluZyBjbG9zZSB0aW1lb3V0XG4gICAgICBpZiAobWVudUNsb3NlVGltZW91dCkge1xuICAgICAgICBjbGVhclRpbWVvdXQobWVudUNsb3NlVGltZW91dCk7XG4gICAgICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBudWxsO1xuICAgICAgfVxuICAgICAgb3Blbk1lbnUoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEtlZXAgbWVudSBvcGVuIHdoZW4gaG92ZXJpbmcgb3ZlciBtZW51IGl0ZW1zXG4gIG1lbnUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGlmIChtZW51Q2xvc2VUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQobWVudUNsb3NlVGltZW91dCk7XG4gICAgICBtZW51Q2xvc2VUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIENsb3NlIG1lbnUgd2hlbiBsZWF2aW5nIG1lbnUgYXJlYVxuICBtZW51LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBpZiAoIWlzRHJhZ2dpbmcpIHtcbiAgICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY2xvc2VNZW51KCk7XG4gICAgICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBudWxsO1xuICAgICAgfSwgMTAwKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIENsb3NlIG1lbnUgd2hlbiBsZWF2aW5nIG1haW4gYnV0dG9uIGFyZWEgKGJ1dCBub3QgaWYgZ29pbmcgdG8gbWVudSlcbiAgbWFpbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZSkgPT4ge1xuICAgIGlmICghaXNEcmFnZ2luZykge1xuICAgICAgLy8gQ2hlY2sgaWYgbW91c2UgaXMgbW92aW5nIHRvd2FyZHMgdGhlIG1lbnVcbiAgICAgIGNvbnN0IHJlY3QgPSBtZW51LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3QgbW91c2VYID0gZS5jbGllbnRYO1xuICAgICAgY29uc3QgbW91c2VZID0gZS5jbGllbnRZO1xuXG4gICAgICAvLyBJZiBtb3VzZSBpcyB3aXRoaW4gbWVudSBib3VuZHMgb3IgbW92aW5nIHRvd2FyZHMgbWVudSwgZG9uJ3QgY2xvc2VcbiAgICAgIGNvbnN0IGlzTmVhck1lbnUgPSBtb3VzZVggPj0gcmVjdC5sZWZ0IC0gMTAgJiYgbW91c2VYIDw9IHJlY3QucmlnaHQgKyAxMCAmJiBtb3VzZVkgPj0gcmVjdC50b3AgLSAxMCAmJiBtb3VzZVkgPD0gcmVjdC5ib3R0b20gKyAxMDtcblxuICAgICAgaWYgKCFpc05lYXJNZW51KSB7XG4gICAgICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjbG9zZU1lbnUoKTtcbiAgICAgICAgICBtZW51Q2xvc2VUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlTW92ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgY29uc3QgdGltZURpZmYgPSBEYXRlLm5vdygpIC0gZHJhZ1N0YXJ0VGltZTtcbiAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyhlLmNsaWVudFggLSBzdGFydFBvc2l0aW9uLngsIDIpICsgTWF0aC5wb3coZS5jbGllbnRZIC0gc3RhcnRQb3NpdGlvbi55LCAyKSk7XG5cbiAgICAvLyBTdGFydCBkcmFnZ2luZyBpZiBtb3ZlZCA+IDNweCBvciBoZWxkIGZvciA+IDEwMG1zXG4gICAgaWYgKCFpc0RyYWdnaW5nICYmIChkaXN0YW5jZSA+IDMgfHwgdGltZURpZmYgPiAxMDApKSB7XG4gICAgICBpc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgIGhhc01vdmVkV2hpbGVEcmFnZ2luZyA9IHRydWU7XG4gICAgICBjbG9zZU1lbnUoKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gXCJncmFiYmluZ1wiO1xuICAgIH1cblxuICAgIGlmIChpc0RyYWdnaW5nKSB7XG4gICAgICBjb25zdCBuZXdYID0gZS5jbGllbnRYIC0gZHJhZ09mZnNldC54O1xuICAgICAgY29uc3QgbmV3WSA9IGUuY2xpZW50WSAtIGRyYWdPZmZzZXQueTtcblxuICAgICAgLy8gQXBwbHkgYm91bmRhcnkgY29uc3RyYWludHNcbiAgICAgIGNvbnN0IGNvbnN0cmFpbmVkUG9zaXRpb24gPSBjb25zdHJhaW5Ub0JvdW5kcyhuZXdYLCBuZXdZKTtcblxuICAgICAgLy8gVXNlIHRyYW5zZm9ybSBmb3Igc21vb3RoZXIgbW92ZW1lbnRcbiAgICAgIHdpZGdldCEuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke2NvbnN0cmFpbmVkUG9zaXRpb24ueH1weCwgJHtjb25zdHJhaW5lZFBvc2l0aW9uLnl9cHgpYDtcbiAgICAgIHdpZGdldCEuc3R5bGUubGVmdCA9IFwiMFwiO1xuICAgICAgd2lkZ2V0IS5zdHlsZS50b3AgPSBcIjBcIjtcblxuICAgICAgbGFzdFBvc2l0aW9uID0geyB4OiBjb25zdHJhaW5lZFBvc2l0aW9uLngsIHk6IGNvbnN0cmFpbmVkUG9zaXRpb24ueSB9O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlVXAoKSB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBoYW5kbGVNb3VzZU1vdmUpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGhhbmRsZU1vdXNlVXApO1xuXG4gICAgaWYgKG1haW5CdXR0b24pIHtcbiAgICAgIG1haW5CdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImRyYWdnaW5nXCIpO1xuICAgIH1cbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IFwiXCI7XG5cbiAgICBpZiAoaXNEcmFnZ2luZykge1xuICAgICAgLy8gQXBwbHkgZWRnZSBzbmFwcGluZyBpZiB3aWRnZXQgaXMgcGFydGlhbGx5IG91dHNpZGUgYm91bmRzXG4gICAgICBjb25zdCBzbmFwcGVkUG9zaXRpb24gPSBzbmFwVG9OZWFyZXN0RWRnZShsYXN0UG9zaXRpb24ueCwgbGFzdFBvc2l0aW9uLnkpO1xuXG4gICAgICAvLyBBbmltYXRlIHRvIHNuYXBwZWQgcG9zaXRpb24gaWYgZGlmZmVyZW50IGZyb20gY3VycmVudCBwb3NpdGlvblxuICAgICAgaWYgKHNuYXBwZWRQb3NpdGlvbi54ICE9PSBsYXN0UG9zaXRpb24ueCB8fCBzbmFwcGVkUG9zaXRpb24ueSAhPT0gbGFzdFBvc2l0aW9uLnkpIHtcbiAgICAgICAgd2lkZ2V0IS5zdHlsZS50cmFuc2l0aW9uID0gXCJhbGwgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpXCI7XG4gICAgICAgIHdpZGdldCEuc3R5bGUubGVmdCA9IHNuYXBwZWRQb3NpdGlvbi54ICsgXCJweFwiO1xuICAgICAgICB3aWRnZXQhLnN0eWxlLnRvcCA9IHNuYXBwZWRQb3NpdGlvbi55ICsgXCJweFwiO1xuICAgICAgICB3aWRnZXQhLnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRyYW5zaXRpb24gYWZ0ZXIgYW5pbWF0aW9uXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmICh3aWRnZXQpIHtcbiAgICAgICAgICAgIHdpZGdldC5zdHlsZS50cmFuc2l0aW9uID0gXCJcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDMwMCk7XG5cbiAgICAgICAgbGFzdFBvc2l0aW9uID0gc25hcHBlZFBvc2l0aW9uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXBwbHkgZmluYWwgcG9zaXRpb24gbm9ybWFsbHlcbiAgICAgICAgd2lkZ2V0IS5zdHlsZS5sZWZ0ID0gbGFzdFBvc2l0aW9uLnggKyBcInB4XCI7XG4gICAgICAgIHdpZGdldCEuc3R5bGUudG9wID0gbGFzdFBvc2l0aW9uLnkgKyBcInB4XCI7XG4gICAgICAgIHdpZGdldCEuc3R5bGUudHJhbnNmb3JtID0gXCJcIjtcbiAgICAgIH1cblxuICAgICAgc2F2ZVdpZGdldFBvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgaXNEcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgLy8gT3BlbiBtZW51IGFmdGVyIGRyYWcgaWYgbm90IG1vdmVkIG11Y2hcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICghaGFzTW92ZWRXaGlsZURyYWdnaW5nKSB7XG4gICAgICAgIG9wZW5NZW51KCk7XG4gICAgICB9XG4gICAgfSwgNTApO1xuICB9XG5cbiAgLy8gTWVudSBidXR0b24gY2xpY2tzIHdpdGggZGVib3VuY2VcbiAgbGV0IGxhc3RDbGlja1RpbWUgPSAwO1xuICBtZW51Py5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICBjb25zdCBhY3Rpb24gPSB0YXJnZXQuZGF0YXNldC5hY3Rpb247XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblxuICAgIC8vIERlYm91bmNlIGNsaWNrcyAtIHByZXZlbnQgbXVsdGlwbGUgY2xpY2tzIHdpdGhpbiA1MDBtc1xuICAgIGlmIChub3cgLSBsYXN0Q2xpY2tUaW1lIDwgNTAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxhc3RDbGlja1RpbWUgPSBub3c7XG5cbiAgICBpZiAoYWN0aW9uKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIk1lbnUgYnV0dG9uIGNsaWNrZWQ6XCIsIGFjdGlvbik7XG4gICAgICBoYW5kbGVNZW51QWN0aW9uKGFjdGlvbik7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gb3Blbk1lbnUoKSB7XG4gIGlmIChpc0RyYWdnaW5nKSByZXR1cm47XG4gIGNvbnN0IG1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndpZGdldC1tZW51XCIpO1xuICBjb25zdCB3aWRnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0aWNreS1ub3RlLXdpZGdldFwiKTtcbiAgXG4gIGlmIChtZW51ICYmIHdpZGdldCkge1xuICAgIC8vIENoZWNrIGlmIHdpZGdldCBpcyBpbiB0aGUgbG93ZXIgaGFsZiBvZiB0aGUgc2NyZWVuXG4gICAgY29uc3Qgd2lkZ2V0UmVjdCA9IHdpZGdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgY29uc3QgaXNJbkxvd2VySGFsZiA9IHdpZGdldFJlY3QudG9wID4gd2luZG93SGVpZ2h0IC8gMjtcbiAgICBcbiAgICBpZiAoaXNJbkxvd2VySGFsZikge1xuICAgICAgLy8gUG9zaXRpb24gbWVudSBhYm92ZSB0aGUgd2lkZ2V0XG4gICAgICBtZW51LmNsYXNzTGlzdC5hZGQoXCJ0b3AtcG9zaXRpb25lZFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUG9zaXRpb24gbWVudSBiZWxvdyB0aGUgd2lkZ2V0IChkZWZhdWx0KVxuICAgICAgbWVudS5jbGFzc0xpc3QucmVtb3ZlKFwidG9wLXBvc2l0aW9uZWRcIik7XG4gICAgfVxuICAgIFxuICAgIG1lbnUuY2xhc3NMaXN0LmFkZChcIm9wZW5cIik7XG4gICAgaXNNZW51T3BlbiA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xvc2VNZW51KCkge1xuICBjb25zdCBtZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3aWRnZXQtbWVudVwiKTtcbiAgaWYgKG1lbnUpIHtcbiAgICBtZW51LmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpO1xuICAgIGlzTWVudU9wZW4gPSBmYWxzZTtcbiAgfVxuICAvLyBDbGVhciBhbnkgcGVuZGluZyB0aW1lb3V0XG4gIGlmIChtZW51Q2xvc2VUaW1lb3V0KSB7XG4gICAgY2xlYXJUaW1lb3V0KG1lbnVDbG9zZVRpbWVvdXQpO1xuICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZU1lbnVBY3Rpb24oYWN0aW9uOiBzdHJpbmcpIHtcbiAgY29uc29sZS5sb2coXCJNZW51IGFjdGlvbiB0cmlnZ2VyZWQ6XCIsIGFjdGlvbik7XG4gIGNsb3NlTWVudSgpOyAvLyBDbG9zZSBtZW51IGltbWVkaWF0ZWx5IHdoZW4gYWN0aW9uIGlzIHRyaWdnZXJlZFxuICBcbiAgLy8gQWRkIHNtYWxsIGRlbGF5IHRvIHByZXZlbnQgbXVsdGlwbGUgY2xpY2tzXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlIFwiYWRkXCI6XG4gICAgICAgIGNyZWF0ZU5vdGVFZGl0b3IoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwibm90ZXNcIjpcbiAgICAgICAgdG9nZ2xlTm90ZXNQYW5lbCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJzZXR0aW5nc1wiOlxuICAgICAgICBvcGVuU2V0dGluZ3NNb2RhbCgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0sIDEwMCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5vdGVFZGl0b3IoaW5pdGlhbFRleHQ6IHN0cmluZyA9IFwiXCIpIHtcbiAgY29uc3Qgc3RpY2t5Tm90ZSA9IGNyZWF0ZVN0aWNreU5vdGUoaW5pdGlhbFRleHQpO1xuICBcbiAgLy8gQXV0by1mb2N1cyB0aGUgdGV4dGFyZWEgd2hlbiBjcmVhdGVkIHZpYSBzaG9ydGN1dFxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBjb25zdCB0ZXh0YXJlYSA9IHN0aWNreU5vdGUucXVlcnlTZWxlY3RvcihcIi5zdGlja3ktbm90ZS10ZXh0YXJlYVwiKSBhcyBIVE1MVGV4dEFyZWFFbGVtZW50O1xuICAgIGlmICh0ZXh0YXJlYSkge1xuICAgICAgdGV4dGFyZWEuZm9jdXMoKTtcbiAgICAgIHRleHRhcmVhLnNldFNlbGVjdGlvblJhbmdlKHRleHRhcmVhLnZhbHVlLmxlbmd0aCwgdGV4dGFyZWEudmFsdWUubGVuZ3RoKTsgLy8gUGxhY2UgY3Vyc29yIGF0IGVuZFxuICAgIH1cbiAgfSwgMTAwKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3RpY2t5Tm90ZShjb250ZW50OiBzdHJpbmcgPSBcIlwiKSB7XG4gIGNvbnN0IG5vdGVJZCA9IERhdGUubm93KCkudG9TdHJpbmcoKTtcbiAgY29uc3Qgbm90ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG5vdGUuY2xhc3NOYW1lID0gXCJzdGlja3ktbm90ZVwiO1xuICBub3RlLmlkID0gYHN0aWNreS1ub3RlLSR7bm90ZUlkfWA7XG4gIFxuICAvLyBBcnJheSBvZiByZWFsaXN0aWMgc3RpY2t5IG5vdGUgY29sb3JzXG4gIGNvbnN0IHN0aWNreUNvbG9ycyA9IFtcbiAgICAncmdiYSgyNTUsIDI1MSwgMTQ3LCAwLjk1KScsIC8vIENsYXNzaWMgeWVsbG93XG4gICAgJ3JnYmEoMjU1LCAyMzcsIDIxMywgMC45NSknLCAvLyBMaWdodCBwZWFjaFxuICAgICdyZ2JhKDIzNywgMjU1LCAyMzUsIDAuOTUpJywgLy8gTGlnaHQgZ3JlZW5cbiAgICAncmdiYSgyMzUsIDI0NSwgMjU1LCAwLjk1KScsIC8vIExpZ2h0IGJsdWVcbiAgICAncmdiYSgyNTUsIDIzNSwgMjU1LCAwLjk1KScsIC8vIExpZ2h0IHBpbmtcbiAgICAncmdiYSgyNTUsIDI0MywgMjA1LCAwLjk1KScsIC8vIExpZ2h0IG9yYW5nZVxuICAgICdyZ2JhKDI0MywgMjM1LCAyNTUsIDAuOTUpJywgLy8gTGlnaHQgcHVycGxlXG4gIF07XG4gIFxuICAvLyBTZWxlY3QgcmFuZG9tIGNvbG9yXG4gIGNvbnN0IHJhbmRvbUNvbG9yID0gc3RpY2t5Q29sb3JzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHN0aWNreUNvbG9ycy5sZW5ndGgpXTtcbiAgXG4gIG5vdGUuaW5uZXJIVE1MID0gYFxuICAgIDxkaXYgY2xhc3M9XCJzdGlja3ktbm90ZS1oZWFkZXJcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwibm90ZS10aXRsZVwiPlN0aWNreSBOb3RlLi4uPC9zcGFuPlxuICAgICAgPGRpdiBjbGFzcz1cIm5vdGUtY29udHJvbHNcIj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm5vdGUtY29udHJvbC1idG4gcGluLWJ0blwiIHRpdGxlPVwiUGluIG5vdGUgKGFsd2F5cyBvbiB0b3ApXCI+8J+TjDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwibm90ZS1jb250cm9sLWJ0biBtaW5pbWl6ZS1idG5cIiB0aXRsZT1cIk1pbmltaXplXCI+4oiSPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJub3RlLWNvbnRyb2wtYnRuIGNsb3NlLWJ0blwiIHRpdGxlPVwiQ2xvc2VcIj7DlzwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgPHRleHRhcmVhIGNsYXNzPVwic3RpY2t5LW5vdGUtdGV4dGFyZWFcIiBwbGFjZWhvbGRlcj1cIldyaXRlIHlvdXIgbm90ZSBoZXJlLi4uXCI+JHtjb250ZW50fTwvdGV4dGFyZWE+XG4gICAgPGRpdiBjbGFzcz1cIm5vdGUtcmVzaXplLWhhbmRsZVwiPjwvZGl2PlxuICBgO1xuXG4gIC8vIEFwcGx5IHRoZSByYW5kb20gY29sb3IgYW5kIHNsaWdodCByb3RhdGlvblxuICBub3RlLnN0eWxlLmJhY2tncm91bmQgPSByYW5kb21Db2xvcjtcbiAgXG4gIC8vIEFkZCBzbGlnaHQgcmFuZG9tIHJvdGF0aW9uIGZvciByZWFsaXN0aWMgbG9va1xuICBjb25zdCByYW5kb21Sb3RhdGlvbiA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDQ7IC8vIC0yIHRvICsyIGRlZ3JlZXNcbiAgbm90ZS5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1ub3RlLXJvdGF0aW9uJywgYCR7cmFuZG9tUm90YXRpb259ZGVnYCk7XG5cbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub3RlKTtcblxuICAvLyBQb3NpdGlvbiB0aGUgbm90ZSBuZWFyIHRoZSB3aWRnZXQgYnV0IG5vdCBvdmVybGFwcGluZ1xuICBjb25zdCB3aWRnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0aWNreS1ub3RlLXdpZGdldFwiKTtcbiAgaWYgKHdpZGdldCkge1xuICAgIGNvbnN0IHdpZGdldFJlY3QgPSB3aWRnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgbm90ZS5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoMjAsIHdpZGdldFJlY3QubGVmdCAtIDMyMCkgKyBcInB4XCI7XG4gICAgbm90ZS5zdHlsZS50b3AgPSBNYXRoLm1heCgyMCwgd2lkZ2V0UmVjdC50b3ApICsgXCJweFwiO1xuICB9IGVsc2Uge1xuICAgIG5vdGUuc3R5bGUubGVmdCA9IFwiMTAwcHhcIjtcbiAgICBub3RlLnN0eWxlLnRvcCA9IFwiMTAwcHhcIjtcbiAgfVxuXG4gIHNldFRpbWVvdXQoKCkgPT4gbm90ZS5jbGFzc0xpc3QuYWRkKFwib3BlblwiKSwgMTApO1xuXG4gIHNldHVwU3RpY2t5Tm90ZUV2ZW50cyhub3RlLCBub3RlSWQpO1xuICByZXR1cm4gbm90ZTtcbn1cblxuZnVuY3Rpb24gc2V0dXBTdGlja3lOb3RlRXZlbnRzKG5vdGU6IEhUTUxFbGVtZW50LCBub3RlSWQ6IHN0cmluZykge1xuICBjb25zdCBoZWFkZXIgPSBub3RlLnF1ZXJ5U2VsZWN0b3IoXCIuc3RpY2t5LW5vdGUtaGVhZGVyXCIpIGFzIEhUTUxFbGVtZW50O1xuICBjb25zdCB0ZXh0YXJlYSA9IG5vdGUucXVlcnlTZWxlY3RvcihcIi5zdGlja3ktbm90ZS10ZXh0YXJlYVwiKSBhcyBIVE1MVGV4dEFyZWFFbGVtZW50O1xuICBjb25zdCBjbG9zZUJ0biA9IG5vdGUucXVlcnlTZWxlY3RvcihcIi5jbG9zZS1idG5cIik7XG4gIGNvbnN0IG1pbmltaXplQnRuID0gbm90ZS5xdWVyeVNlbGVjdG9yKFwiLm1pbmltaXplLWJ0blwiKTtcbiAgY29uc3QgcGluQnRuID0gbm90ZS5xdWVyeVNlbGVjdG9yKFwiLnBpbi1idG5cIik7XG4gIGNvbnN0IHJlc2l6ZUhhbmRsZSA9IG5vdGUucXVlcnlTZWxlY3RvcihcIi5ub3RlLXJlc2l6ZS1oYW5kbGVcIikgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgbGV0IGlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgbGV0IGlzUmVzaXppbmcgPSBmYWxzZTtcbiAgbGV0IGRyYWdPZmZzZXQgPSB7IHg6IDAsIHk6IDAgfTtcbiAgbGV0IGlzUGlubmVkID0gZmFsc2U7XG4gIGxldCBpc01pbmltaXplZCA9IGZhbHNlO1xuXG4gIC8vIEF1dG8tc2F2ZSBmdW5jdGlvbmFsaXR5XG4gIGxldCBzYXZlVGltZW91dDogTm9kZUpTLlRpbWVvdXQ7XG4gIHRleHRhcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgY2xlYXJUaW1lb3V0KHNhdmVUaW1lb3V0KTtcbiAgICBzYXZlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2F2ZU5vdGUodGV4dGFyZWEudmFsdWUudHJpbSgpKTtcbiAgICB9LCAxMDAwKTsgLy8gQXV0by1zYXZlIGFmdGVyIDEgc2Vjb25kIG9mIG5vIHR5cGluZ1xuICB9KTtcblxuICAvLyBEcmFnZ2luZyBmdW5jdGlvbmFsaXR5XG4gIGhlYWRlci5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlKSA9PiB7XG4gICAgaWYgKChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuY2xhc3NMaXN0LmNvbnRhaW5zKFwibm90ZS1jb250cm9sLWJ0blwiKSkgcmV0dXJuO1xuXG4gICAgaXNEcmFnZ2luZyA9IHRydWU7XG4gICAgY29uc3QgcmVjdCA9IG5vdGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgZHJhZ09mZnNldC54ID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgIGRyYWdPZmZzZXQueSA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgLy8gQWRkIHNtb290aCBjdXJzb3IgYW5kIGRpc2FibGUgdHJhbnNpdGlvbnMgZHVyaW5nIGRyYWdcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IFwiZ3JhYmJpbmdcIjtcbiAgICBub3RlLnN0eWxlLnRyYW5zaXRpb24gPSBcIm5vbmVcIjtcbiAgICBub3RlLnN0eWxlLnVzZXJTZWxlY3QgPSBcIm5vbmVcIjtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgaGFuZGxlRHJhZyk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgc3RvcERyYWcpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gaGFuZGxlRHJhZyhlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKCFpc0RyYWdnaW5nKSByZXR1cm47XG5cbiAgICBjb25zdCBuZXdYID0gZS5jbGllbnRYIC0gZHJhZ09mZnNldC54O1xuICAgIGNvbnN0IG5ld1kgPSBlLmNsaWVudFkgLSBkcmFnT2Zmc2V0Lnk7XG5cbiAgICAvLyBDb25zdHJhaW4gdG8gdmlld3BvcnQgd2l0aCBwYWRkaW5nXG4gICAgY29uc3QgcGFkZGluZyA9IDEwO1xuICAgIGNvbnN0IG1heFggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIG5vdGUub2Zmc2V0V2lkdGggLSBwYWRkaW5nO1xuICAgIGNvbnN0IG1heFkgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSBub3RlLm9mZnNldEhlaWdodCAtIHBhZGRpbmc7XG5cbiAgICAvLyBVc2UgdHJhbnNmb3JtIGZvciBzbW9vdGhlciBwZXJmb3JtYW5jZVxuICAgIGNvbnN0IGNvbnN0cmFpbmVkWCA9IE1hdGgubWF4KHBhZGRpbmcsIE1hdGgubWluKG1heFgsIG5ld1gpKTtcbiAgICBjb25zdCBjb25zdHJhaW5lZFkgPSBNYXRoLm1heChwYWRkaW5nLCBNYXRoLm1pbihtYXhZLCBuZXdZKSk7XG4gICAgXG4gICAgbm90ZS5zdHlsZS5sZWZ0ID0gY29uc3RyYWluZWRYICsgXCJweFwiO1xuICAgIG5vdGUuc3R5bGUudG9wID0gY29uc3RyYWluZWRZICsgXCJweFwiO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RvcERyYWcoKSB7XG4gICAgaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gXCJcIjtcbiAgICBub3RlLnN0eWxlLnRyYW5zaXRpb24gPSBcImFsbCAwLjNzIGVhc2VcIjtcbiAgICBub3RlLnN0eWxlLnVzZXJTZWxlY3QgPSBcIlwiO1xuICAgIFxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgaGFuZGxlRHJhZyk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgc3RvcERyYWcpO1xuICB9XG5cbiAgLy8gUmVzaXppbmcgZnVuY3Rpb25hbGl0eVxuICByZXNpemVIYW5kbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xuICAgIGlzUmVzaXppbmcgPSB0cnVlO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgaGFuZGxlUmVzaXplKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBzdG9wUmVzaXplKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZVJlc2l6ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKCFpc1Jlc2l6aW5nKSByZXR1cm47XG5cbiAgICBjb25zdCByZWN0ID0gbm90ZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBuZXdXaWR0aCA9IE1hdGgubWF4KDIwMCwgZS5jbGllbnRYIC0gcmVjdC5sZWZ0KTtcbiAgICBjb25zdCBuZXdIZWlnaHQgPSBNYXRoLm1heCgxNTAsIGUuY2xpZW50WSAtIHJlY3QudG9wKTtcblxuICAgIG5vdGUuc3R5bGUud2lkdGggPSBuZXdXaWR0aCArIFwicHhcIjtcbiAgICBub3RlLnN0eWxlLmhlaWdodCA9IG5ld0hlaWdodCArIFwicHhcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3BSZXNpemUoKSB7XG4gICAgaXNSZXNpemluZyA9IGZhbHNlO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgaGFuZGxlUmVzaXplKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBzdG9wUmVzaXplKTtcbiAgfVxuXG4gIC8vIENvbnRyb2wgYnV0dG9uc1xuICBjbG9zZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBub3RlLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gbm90ZS5yZW1vdmUoKSwgMzAwKTtcbiAgfSk7XG5cbiAgbWluaW1pemVCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgaXNNaW5pbWl6ZWQgPSAhaXNNaW5pbWl6ZWQ7XG4gICAgaWYgKGlzTWluaW1pemVkKSB7XG4gICAgICBub3RlLmNsYXNzTGlzdC5hZGQoXCJtaW5pbWl6ZWRcIik7XG4gICAgICAobWluaW1pemVCdG4gYXMgSFRNTEVsZW1lbnQpLnRleHRDb250ZW50ID0gXCIrXCI7XG4gICAgICAobWluaW1pemVCdG4gYXMgSFRNTEVsZW1lbnQpLnRpdGxlID0gXCJSZXN0b3JlXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vdGUuY2xhc3NMaXN0LnJlbW92ZShcIm1pbmltaXplZFwiKTtcbiAgICAgIChtaW5pbWl6ZUJ0biBhcyBIVE1MRWxlbWVudCkudGV4dENvbnRlbnQgPSBcIuKIklwiO1xuICAgICAgKG1pbmltaXplQnRuIGFzIEhUTUxFbGVtZW50KS50aXRsZSA9IFwiTWluaW1pemVcIjtcbiAgICB9XG4gIH0pO1xuXG4gIHBpbkJ0bj8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBpc1Bpbm5lZCA9ICFpc1Bpbm5lZDtcbiAgICBpZiAoaXNQaW5uZWQpIHtcbiAgICAgIG5vdGUuY2xhc3NMaXN0LmFkZChcInBpbm5lZFwiKTtcbiAgICAgIG5vdGUuc3R5bGUuekluZGV4ID0gXCI5OTk5OTlcIjsgLy8gSGlnaGVyIHotaW5kZXggZm9yIHBpbm5lZCBub3Rlc1xuICAgICAgKHBpbkJ0biBhcyBIVE1MRWxlbWVudCkuY2xhc3NMaXN0LmFkZChcInBpbm5lZFwiKTtcbiAgICAgIChwaW5CdG4gYXMgSFRNTEVsZW1lbnQpLnRpdGxlID0gXCJVbnBpbiBub3RlXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vdGUuY2xhc3NMaXN0LnJlbW92ZShcInBpbm5lZFwiKTtcbiAgICAgIG5vdGUuc3R5bGUuekluZGV4ID0gXCI5OTk5OTdcIjsgLy8gTm9ybWFsIHotaW5kZXhcbiAgICAgIChwaW5CdG4gYXMgSFRNTEVsZW1lbnQpLmNsYXNzTGlzdC5yZW1vdmUoXCJwaW5uZWRcIik7XG4gICAgICAocGluQnRuIGFzIEhUTUxFbGVtZW50KS50aXRsZSA9IFwiUGluIG5vdGUgKGFsd2F5cyBvbiB0b3ApXCI7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlTm90ZXNQYW5lbCgpIHtcbiAgbGV0IHBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ub3Rlcy1wYW5lbFwiKSBhcyBIVE1MRWxlbWVudDtcblxuICBpZiAoIXBhbmVsKSB7XG4gICAgcGFuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHBhbmVsLmNsYXNzTmFtZSA9IFwibm90ZXMtcGFuZWxcIjtcbiAgICBwYW5lbC5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwibm90ZXMtaGVhZGVyXCI+8J+TiyBSZWNlbnQgTm90ZXM8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJub3Rlcy1saXN0XCIgaWQ9XCJub3Rlcy1saXN0XCI+PC9kaXY+XG4gICAgYDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBhbmVsKTtcbiAgICByZWZyZXNoTm90ZXNMaXN0KCk7XG4gIH1cblxuICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKFwib3BlblwiKTtcblxuICBpZiAocGFuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwib3BlblwiKSkge1xuICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiBvdXRzaWRlQ2xpY2tIYW5kbGVyKGUpIHtcbiAgICAgICAgaWYgKCFwYW5lbC5jb250YWlucyhlLnRhcmdldCBhcyBOb2RlKSkge1xuICAgICAgICAgIHBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpO1xuICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBvdXRzaWRlQ2xpY2tIYW5kbGVyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSwgMTAwKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvcGVuU2V0dGluZ3NNb2RhbCgpIHtcbiAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBtb2RhbC5jbGFzc05hbWUgPSBcInN0aWNreS1tb2RhbFwiO1xuICBtb2RhbC5pbm5lckhUTUwgPSBgXG4gICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1oZWFkZXJcIj5cbiAgICAgICAgPGgzIGNsYXNzPVwibW9kYWwtdGl0bGVcIj7impnvuI8gU2V0dGluZ3M8L2gzPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwibW9kYWwtY2xvc2VcIj7DlzwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IHN0eWxlPVwibGluZS1oZWlnaHQ6IDEuNjsgY29sb3I6ICMwMDAwMDA7XCI+XG4gICAgICAgIDxoNCBzdHlsZT1cImNvbG9yOiAjMDAwMDAwOyB0ZXh0LXNoYWRvdzogMCAxcHggMnB4IHJnYmEoMjUwLCAyMzUsIDE0NiwgMC44KTtcIj7wn46uIEtleWJvYXJkIFNob3J0Y3V0czwvaDQ+XG4gICAgICAgIDxwPjxzdHJvbmc+QWx0ICsgU2hpZnQgKyBOOjwvc3Ryb25nPiBDcmVhdGUgbmV3IG5vdGU8L3A+XG4gICAgICAgIDxwPjxzdHJvbmc+QWx0ICsgU2hpZnQgKyBXOjwvc3Ryb25nPiBUb2dnbGUgd2lkZ2V0IHZpc2liaWxpdHk8L3A+XG4gICAgICAgIDxwPjxzdHJvbmc+RVNDOjwvc3Ryb25nPiBDbG9zZSBtb2RhbHM8L3A+XG4gICAgICAgIFxuICAgICAgICA8aDQgc3R5bGU9XCJtYXJnaW4tdG9wOiAyNXB4OyBjb2xvcjogIzAwMDAwMDsgdGV4dC1zaGFkb3c6IDAgMXB4IDJweCByZ2JhKDI1MCwgMjM1LCAxNDYsIDAuOCk7XCI+4oS577iPIEFib3V0PC9oND5cbiAgICAgICAgPHA+PHN0cm9uZz5TdGlja3lOb3RlQUkgdjIuMzwvc3Ryb25nPjwvcD5cbiAgICAgICAgPHA+U21hcnQgZmxvYXRpbmcgbm90ZXMgZm9yIGFueSB3ZWJwYWdlPC9wPlxuICAgICAgICBcbiAgICAgICAgPGg0IHN0eWxlPVwibWFyZ2luLXRvcDogMjVweDsgY29sb3I6ICMwMDAwMDA7IHRleHQtc2hhZG93OiAwIDFweCAycHggcmdiYSgyNTAsIDIzNSwgMTQ2LCAwLjgpO1wiPvCfjq8gVXNhZ2UgVGlwczwvaDQ+XG4gICAgICAgIDxwPuKAoiBIb3ZlciBvdmVyIHRoZSDinKggYnV0dG9uIHRvIHNlZSBtZW51PC9wPlxuICAgICAgICA8cD7igKIgQ2xpY2sgYW5kIGRyYWcgdG8gbW92ZSB0aGUgd2lkZ2V0PC9wPlxuICAgICAgICA8cD7igKIgVXNlIGtleWJvYXJkIHNob3J0Y3V0cyBmb3IgcXVpY2sgYWNjZXNzPC9wPlxuICAgICAgICA8cD7igKIgTm90ZXMgYXV0by1zYXZlIGFzIHlvdSB0eXBlPC9wPlxuICAgICAgICA8cD7igKIgUGluIG5vdGVzIHRvIGtlZXAgdGhlbSB2aXNpYmxlPC9wPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWdyb3VwXCI+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeSBjbG9zZS1zZXR0aW5nc1wiPkNsb3NlPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1vZGFsKTtcbiAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5jbGFzc0xpc3QuYWRkKFwib3BlblwiKSwgMTApO1xuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XG4gICAgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZShcIm9wZW5cIik7XG4gICAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5yZW1vdmUoKSwgMzAwKTtcbiAgfVxuXG4gIG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIubW9kYWwtY2xvc2VcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZU1vZGFsKTtcbiAgbW9kYWwucXVlcnlTZWxlY3RvcihcIi5jbG9zZS1zZXR0aW5nc1wiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlTW9kYWwpO1xufVxuXG5mdW5jdGlvbiBoaWRlV2lkZ2V0KCkge1xuICBpZiAod2lkZ2V0KSB7XG4gICAgd2lkZ2V0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgfVxuICAvLyBIaWRlIGFsbCBzdGlja3kgbm90ZXNcbiAgY29uc3Qgc3RpY2t5Tm90ZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnN0aWNreS1ub3RlXCIpO1xuICBzdGlja3lOb3Rlcy5mb3JFYWNoKChub3RlKSA9PiB7XG4gICAgKG5vdGUgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNob3dXaWRnZXQoKSB7XG4gIGlmICh3aWRnZXQpIHtcbiAgICB3aWRnZXQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgfVxuICAvLyBTaG93IGFsbCBzdGlja3kgbm90ZXNcbiAgY29uc3Qgc3RpY2t5Tm90ZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnN0aWNreS1ub3RlXCIpO1xuICBzdGlja3lOb3Rlcy5mb3JFYWNoKChub3RlKSA9PiB7XG4gICAgKG5vdGUgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpc1dpZGdldFZpc2libGUoKTogYm9vbGVhbiB7XG4gIGlmICghd2lkZ2V0KSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gQ2hlY2sgaWYgZGlzcGxheSBpcyBleHBsaWNpdGx5IHNldCB0byBub25lXG4gIGlmICh3aWRnZXQuc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIpIHJldHVybiBmYWxzZTtcblxuICAvLyBDaGVjayBjb21wdXRlZCBzdHlsZSBpZiBzdHlsZS5kaXNwbGF5IGlzIG5vdCBzZXRcbiAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHdpZGdldCk7XG4gIHJldHVybiBjb21wdXRlZFN0eWxlLmRpc3BsYXkgIT09IFwibm9uZVwiO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlTm90ZShjb250ZW50OiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFwic3RpY2t5Tm90ZXNcIik7XG4gICAgY29uc3Qgbm90ZXMgPSByZXN1bHQuc3RpY2t5Tm90ZXMgfHwgW107XG5cbiAgICBjb25zdCBuZXdOb3RlID0ge1xuICAgICAgaWQ6IERhdGUubm93KCkudG9TdHJpbmcoKSxcbiAgICAgIGNvbnRlbnQsXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgfTtcblxuICAgIG5vdGVzLnVuc2hpZnQobmV3Tm90ZSk7XG5cbiAgICAvLyBLZWVwIG9ubHkgbGFzdCA1MCBub3Rlc1xuICAgIGlmIChub3Rlcy5sZW5ndGggPiA1MCkge1xuICAgICAgbm90ZXMuc3BsaWNlKDUwKTtcbiAgICB9XG5cbiAgICBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KHsgc3RpY2t5Tm90ZXM6IG5vdGVzIH0pO1xuICAgIGNvbnNvbGUubG9nKFwiTm90ZSBzYXZlZCBzdWNjZXNzZnVsbHlcIik7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIHNhdmluZyBub3RlOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaE5vdGVzTGlzdCgpIHtcbiAgY29uc3Qgbm90ZXNMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJub3Rlcy1saXN0XCIpO1xuICBpZiAoIW5vdGVzTGlzdCkgcmV0dXJuO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChcInN0aWNreU5vdGVzXCIpO1xuICAgIGNvbnN0IG5vdGVzID0gcmVzdWx0LnN0aWNreU5vdGVzIHx8IFtdO1xuXG4gICAgaWYgKG5vdGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbm90ZXNMaXN0LmlubmVySFRNTCA9XG4gICAgICAgICc8ZGl2IHN0eWxlPVwicGFkZGluZzogMjBweDsgdGV4dC1hbGlnbjogY2VudGVyOyBjb2xvcjogIzAwMDAwMDsgZm9udC13ZWlnaHQ6IDUwMDtcIj7wn5OdIE5vIG5vdGVzIHlldDxicj48c21hbGwgc3R5bGU9XCJjb2xvcjogIzk5MjlFQTtcIj5DcmVhdGUgeW91ciBmaXJzdCBub3RlITwvc21hbGw+PC9kaXY+JztcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBub3Rlc0xpc3QuaW5uZXJIVE1MID0gbm90ZXNcbiAgICAgIC5zbGljZSgwLCAxMClcbiAgICAgIC5tYXAoXG4gICAgICAgIChub3RlOiBhbnkpID0+IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJub3RlLWl0ZW1cIiBkYXRhLW5vdGUtaWQ9XCIke25vdGUuaWR9XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJub3RlLXByZXZpZXdcIj4ke25vdGUuY29udGVudC5zdWJzdHJpbmcoMCwgMTAwKX0ke25vdGUuY29udGVudC5sZW5ndGggPiAxMDAgPyBcIi4uLlwiIDogXCJcIn08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5vdGUtZGF0ZVwiPiR7bmV3IERhdGUobm90ZS50aW1lc3RhbXApLnRvTG9jYWxlRGF0ZVN0cmluZygpfTwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYFxuICAgICAgKVxuICAgICAgLmpvaW4oXCJcIik7XG5cbiAgICAvLyBDbGljayB0byBlZGl0IG5vdGVcbiAgICBub3Rlc0xpc3QucXVlcnlTZWxlY3RvckFsbChcIi5ub3RlLWl0ZW1cIikuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBjb25zdCBub3RlSWQgPSAoaXRlbSBhcyBIVE1MRWxlbWVudCkuZGF0YXNldC5ub3RlSWQ7XG4gICAgICAgIGNvbnN0IG5vdGUgPSBub3Rlcy5maW5kKChuOiBhbnkpID0+IG4uaWQgPT09IG5vdGVJZCk7XG4gICAgICAgIGlmIChub3RlKSB7XG4gICAgICAgICAgLy8gT3BlbiB0aGUgbm90ZSBmb3IgZWRpdGluZ1xuICAgICAgICAgIG9wZW5Ob3RlRm9yRWRpdGluZyhub3RlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGxvYWRpbmcgbm90ZXM6XCIsIGVycm9yKTtcbiAgfVxufVxuXG5cblxuZnVuY3Rpb24gb3Blbk5vdGVGb3JFZGl0aW5nKG5vdGU6IGFueSkge1xuICAvLyBDcmVhdGUgYSBzdGlja3kgbm90ZSB3aXRoIHRoZSBleGlzdGluZyBjb250ZW50XG4gIGNvbnN0IHN0aWNreU5vdGUgPSBjcmVhdGVTdGlja3lOb3RlKG5vdGUuY29udGVudCk7XG4gIFxuICAvLyBBZGQgdGhlIGV4aXN0aW5nIG5vdGUgSUQgdG8gdGhlIHN0aWNreSBub3RlIGZvciB1cGRhdGluZ1xuICBzdGlja3lOb3RlLmRhdGFzZXQubm90ZUlkID0gbm90ZS5pZDtcbiAgXG4gIC8vIFVwZGF0ZSB0aGUgbm90ZSB0aXRsZSB0byBzaG93IGl0J3MgYW4gZXhpc3Rpbmcgbm90ZVxuICBjb25zdCBub3RlVGl0bGUgPSBzdGlja3lOb3RlLnF1ZXJ5U2VsZWN0b3IoXCIubm90ZS10aXRsZVwiKSBhcyBIVE1MRWxlbWVudDtcbiAgaWYgKG5vdGVUaXRsZSkge1xuICAgIG5vdGVUaXRsZS50ZXh0Q29udGVudCA9IFwiRWRpdCBOb3RlXCI7XG4gIH1cblxuICAvLyBBZGQgY2lyY3VsYXIgYWN0aW9uIGJ1dHRvbnMgbWVyZ2VkIHdpdGggdGhlIG5vdGUgKGFsd2F5cyBiZWxvdyBoZWFkZXIpXG4gIGNvbnN0IGFjdGlvbkJ1dHRvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBhY3Rpb25CdXR0b25zLmNsYXNzTmFtZSA9IFwibm90ZS1hY3Rpb24tYnV0dG9uc1wiO1xuICBhY3Rpb25CdXR0b25zLmlubmVySFRNTCA9IGBcbiAgICA8YnV0dG9uIGNsYXNzPVwiYWN0aW9uLWJ0biBlZGl0LWJ0blwiIHRpdGxlPVwiU2F2ZSAmIENsb3NlXCI+4pyTPC9idXR0b24+XG4gICAgPGJ1dHRvbiBjbGFzcz1cImFjdGlvbi1idG4gZGVsZXRlLWJ0blwiIHRpdGxlPVwiRGVsZXRlIE5vdGVcIj7wn5eR77iPPC9idXR0b24+XG4gICAgPGJ1dHRvbiBjbGFzcz1cImFjdGlvbi1idG4gY2FuY2VsLWJ0blwiIHRpdGxlPVwiQ2FuY2VsXCI+w5c8L2J1dHRvbj5cbiAgYDtcbiAgXG4gIC8vIEFsd2F5cyBwbGFjZSBidXR0b25zIGFmdGVyIGhlYWRlciAobm9ybWFsIHBvc2l0aW9uKVxuICBjb25zdCBoZWFkZXIgPSBzdGlja3lOb3RlLnF1ZXJ5U2VsZWN0b3IoXCIuc3RpY2t5LW5vdGUtaGVhZGVyXCIpO1xuICBpZiAoaGVhZGVyKSB7XG4gICAgaGVhZGVyLmFmdGVyKGFjdGlvbkJ1dHRvbnMpO1xuICB9XG5cbiAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyBmb3IgYWN0aW9uIGJ1dHRvbnNcbiAgY29uc3QgZWRpdEJ0biA9IGFjdGlvbkJ1dHRvbnMucXVlcnlTZWxlY3RvcihcIi5lZGl0LWJ0blwiKTtcbiAgY29uc3QgZGVsZXRlQnRuID0gYWN0aW9uQnV0dG9ucy5xdWVyeVNlbGVjdG9yKFwiLmRlbGV0ZS1idG5cIik7XG4gIGNvbnN0IGNhbmNlbEJ0biA9IGFjdGlvbkJ1dHRvbnMucXVlcnlTZWxlY3RvcihcIi5jYW5jZWwtYnRuXCIpO1xuXG4gIGVkaXRCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgLy8gU2F2ZSBhbmQgY2xvc2VcbiAgICBjb25zdCB0ZXh0YXJlYSA9IHN0aWNreU5vdGUucXVlcnlTZWxlY3RvcihcIi5zdGlja3ktbm90ZS10ZXh0YXJlYVwiKSBhcyBIVE1MVGV4dEFyZWFFbGVtZW50O1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0ZXh0YXJlYS52YWx1ZS50cmltKCk7XG4gICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgIHVwZGF0ZU5vdGUobm90ZS5pZCwgY29udGVudCk7XG4gICAgICByZWZyZXNoTm90ZXNMaXN0KCk7XG4gICAgfVxuICAgIHN0aWNreU5vdGUucmVtb3ZlKCk7XG4gIH0pO1xuXG4gIGRlbGV0ZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBpZiAoY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBub3RlP1wiKSkge1xuICAgICAgZGVsZXRlTm90ZShub3RlLmlkKTtcbiAgICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgICAgIHN0aWNreU5vdGUucmVtb3ZlKCk7XG4gICAgfVxuICB9KTtcblxuICBjYW5jZWxCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgLy8gSnVzdCBjbG9zZSB3aXRob3V0IHNhdmluZ1xuICAgIHN0aWNreU5vdGUucmVtb3ZlKCk7XG4gIH0pO1xuICBcbiAgLy8gT3ZlcnJpZGUgdGhlIGF1dG8tc2F2ZSB0byB1cGRhdGUgdGhlIGV4aXN0aW5nIG5vdGUgaW5zdGVhZCBvZiBjcmVhdGluZyBuZXdcbiAgY29uc3QgdGV4dGFyZWEgPSBzdGlja3lOb3RlLnF1ZXJ5U2VsZWN0b3IoXCIuc3RpY2t5LW5vdGUtdGV4dGFyZWFcIikgYXMgSFRNTFRleHRBcmVhRWxlbWVudDtcbiAgbGV0IHNhdmVUaW1lb3V0OiBhbnk7XG4gIFxuICAvLyBSZW1vdmUgdGhlIGRlZmF1bHQgaW5wdXQgbGlzdGVuZXIgYW5kIGFkZCBvdXIgY3VzdG9tIG9uZVxuICB0ZXh0YXJlYS5yZW1vdmVFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge30pO1xuICB0ZXh0YXJlYS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgIGNsZWFyVGltZW91dChzYXZlVGltZW91dCk7XG4gICAgc2F2ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZXh0YXJlYS52YWx1ZS50cmltKCk7XG4gICAgICBpZiAoY29udGVudCAmJiBub3RlLmlkKSB7XG4gICAgICAgIGF3YWl0IHVwZGF0ZU5vdGUobm90ZS5pZCwgY29udGVudCk7XG4gICAgICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgICAgIH1cbiAgICB9LCAxMDAwKTtcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZU5vdGUobm90ZUlkOiBzdHJpbmcsIG5ld0NvbnRlbnQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoXCJzdGlja3lOb3Rlc1wiKTtcbiAgICBjb25zdCBub3RlcyA9IHJlc3VsdC5zdGlja3lOb3RlcyB8fCBbXTtcblxuICAgIGNvbnN0IG5vdGVJbmRleCA9IG5vdGVzLmZpbmRJbmRleCgobm90ZTogYW55KSA9PiBub3RlLmlkID09PSBub3RlSWQpO1xuICAgIGlmIChub3RlSW5kZXggIT09IC0xKSB7XG4gICAgICBub3Rlc1tub3RlSW5kZXhdLmNvbnRlbnQgPSBuZXdDb250ZW50O1xuICAgICAgbm90ZXNbbm90ZUluZGV4XS50aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KHsgc3RpY2t5Tm90ZXM6IG5vdGVzIH0pO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgdXBkYXRpbmcgbm90ZTpcIiwgZXJyb3IpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZU5vdGUobm90ZUlkOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFwic3RpY2t5Tm90ZXNcIik7XG4gICAgY29uc3Qgbm90ZXMgPSByZXN1bHQuc3RpY2t5Tm90ZXMgfHwgW107XG5cbiAgICBjb25zdCBmaWx0ZXJlZE5vdGVzID0gbm90ZXMuZmlsdGVyKChub3RlOiBhbnkpID0+IG5vdGUuaWQgIT09IG5vdGVJZCk7XG4gICAgYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCh7IHN0aWNreU5vdGVzOiBmaWx0ZXJlZE5vdGVzIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBkZWxldGluZyBub3RlOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0dXBLZXlib2FyZFNob3J0Y3V0cygpIHtcbiAgLy8gTG9jYWwga2V5Ym9hcmQgc2hvcnRjdXQgaGFuZGxlcnMgdXNpbmcgQWx0K1NoaWZ0IGNvbWJpbmF0aW9uc1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4ge1xuICAgIC8vIFVzZSBBbHQrU2hpZnQgY29tYmluYXRpb25zIHRvIGF2b2lkIGNvbmZsaWN0cyB3aXRoIGJyb3dzZXIgc2hvcnRjdXRzXG4gICAgaWYgKGUuYWx0S2V5ICYmIGUuc2hpZnRLZXkpIHtcbiAgICAgIGlmIChlLmNvZGUgPT09IFwiS2V5TlwiKSB7XG4gICAgICAgIC8vIEFsdCtTaGlmdCtOOiBDcmVhdGUgbmV3IG5vdGVcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogQWx0K1NoaWZ0K04gcHJlc3NlZCAtIENyZWF0aW5nIG5ldyBub3RlXCIpO1xuICAgICAgICBjcmVhdGVOb3RlRWRpdG9yKCk7XG4gICAgICB9IGVsc2UgaWYgKGUuY29kZSA9PT0gXCJLZXlXXCIpIHtcbiAgICAgICAgLy8gQWx0K1NoaWZ0K1c6IFRvZ2dsZSB3aWRnZXQgdmlzaWJpbGl0eVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBBbHQrU2hpZnQrVyBwcmVzc2VkIC0gVG9nZ2xpbmcgd2lkZ2V0IHZpc2liaWxpdHlcIik7XG4gICAgICAgIGlmIChpc1dpZGdldFZpc2libGUoKSkge1xuICAgICAgICAgIGhpZGVXaWRnZXQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzaG93V2lkZ2V0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFU0Mga2V5IHRvIGNsb3NlIG1vZGFscyBhbmQgbm90ZXNcbiAgICBpZiAoZS5jb2RlID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICAvLyBDbG9zZSBhbnkgb3BlbiBtb2RhbHNcbiAgICAgIGNvbnN0IG9wZW5Nb2RhbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3RpY2t5LW1vZGFsLm9wZW5cIik7XG4gICAgICBpZiAob3Blbk1vZGFsKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb3Blbk1vZGFsLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IG9wZW5Nb2RhbC5yZW1vdmUoKSwgMzAwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBDbG9zZSBub3RlcyBwYW5lbFxuICAgICAgY29uc3Qgbm90ZXNQYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubm90ZXMtcGFuZWwub3BlblwiKTtcbiAgICAgIGlmIChub3Rlc1BhbmVsKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbm90ZXNQYW5lbC5jbGFzc0xpc3QucmVtb3ZlKFwib3BlblwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBDbG9zZSB3aWRnZXQgbWVudVxuICAgICAgaWYgKGlzTWVudU9wZW4pIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjbG9zZU1lbnUoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IExvY2FsIGtleWJvYXJkIHNob3J0Y3V0cyBpbml0aWFsaXplZCAoQWx0K1NoaWZ0K04sIEFsdCtTaGlmdCtXLCBFc2MpXCIpO1xufVxuXG5mdW5jdGlvbiBzZXR1cE1lc3NhZ2VMaXN0ZW5lcigpIHtcbiAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogUmVjZWl2ZWQgbWVzc2FnZTpcIiwgbWVzc2FnZSk7XG5cbiAgICAvLyBIYW5kbGUga2V5Ym9hcmQgc2hvcnRjdXQgY29tbWFuZHMgZnJvbSBiYWNrZ3JvdW5kIHNjcmlwdFxuICAgIGlmIChtZXNzYWdlLmFjdGlvbiA9PT0gXCJ0b2dnbGUtd2lkZ2V0XCIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBUb2dnbGUgd2lkZ2V0IGNvbW1hbmQgcmVjZWl2ZWRcIik7XG5cbiAgICAgIGlmIChpc1dpZGdldFZpc2libGUoKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogSGlkaW5nIHdpZGdldFwiKTtcbiAgICAgICAgaGlkZVdpZGdldCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IFNob3dpbmcgd2lkZ2V0XCIpO1xuICAgICAgICBzaG93V2lkZ2V0KCk7XG4gICAgICB9XG5cbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2UuYWN0aW9uID09PSBcIm5ldy1ub3RlXCIpIHtcbiAgICAgIGNyZWF0ZU5vdGVFZGl0b3IoKTtcbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGNvbnRleHQgbWVudSBub3RlIGNyZWF0aW9uIHdpdGggc2VsZWN0ZWQgdGV4dFxuICAgIGlmIChtZXNzYWdlLmFjdGlvbiA9PT0gXCJjcmVhdGUtbm90ZS13aXRoLXNlbGVjdGlvblwiKSB7XG4gICAgICBjcmVhdGVOb3RlRWRpdG9yKG1lc3NhZ2Uuc2VsZWN0ZWRUZXh0IHx8IFwiXCIpO1xuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5hY3Rpb24gPT09IFwidG9nZ2xlU3RlYWx0aFwiKSB7XG4gICAgICAvLyBIYW5kbGUgc3RlYWx0aCBtb2RlIHRvZ2dsZSBmcm9tIHBvcHVwXG4gICAgICBjb25zdCB3aWRnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0aWNreS1ub3RlLXdpZGdldFwiKTtcbiAgICAgIGlmICh3aWRnZXQpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2UuZW5hYmxlZCkge1xuICAgICAgICAgIHdpZGdldC5zdHlsZS5vcGFjaXR5ID0gXCIwLjNcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3aWRnZXQuc3R5bGUub3BhY2l0eSA9IFwiMVwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJVbmtub3duIGFjdGlvblwiIH0pO1xuICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2F2ZVdpZGdldFBvc2l0aW9uKCkge1xuICBpZiAoIXdpZGdldCkgcmV0dXJuO1xuXG4gIGNvbnN0IHJlY3QgPSB3aWRnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGNvbnN0IHBvc2l0aW9uID0ge1xuICAgIHg6IHJlY3QubGVmdCxcbiAgICB5OiByZWN0LnRvcCxcbiAgfTtcblxuICB0cnkge1xuICAgIGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoeyB3aWRnZXRQb3NpdGlvbjogcG9zaXRpb24gfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIHNhdmluZyBwb3NpdGlvbjpcIiwgZXJyb3IpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRXaWRnZXRQb3NpdGlvbigpIHtcbiAgaWYgKCF3aWRnZXQpIHJldHVybjtcblxuICAvLyBSZXNldCB0byBkZWZhdWx0IHBvc2l0aW9uIG9uIHBhZ2UgcmVmcmVzaFxuICAvLyBUaGUgd2lkZ2V0IHdpbGwgdXNlIHRoZSBkZWZhdWx0IENTUyBwb3NpdGlvbiAodG9wOiA1MHB4LCByaWdodDogNTBweClcbiAgd2lkZ2V0LnN0eWxlLmxlZnQgPSBcIlwiO1xuICB3aWRnZXQuc3R5bGUudG9wID0gXCJcIjtcbiAgd2lkZ2V0LnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XG5cbiAgLy8gQ2xlYXIgYW55IHNhdmVkIHBvc2l0aW9uXG4gIHRyeSB7XG4gICAgYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZShcIndpZGdldFBvc2l0aW9uXCIpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBjbGVhcmluZyBwb3NpdGlvbjpcIiwgZXJyb3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlbGV0ZU5vdGVEaXJlY3RseShub3RlOiBhbnkpIHtcbiAgaWYgKGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgbm90ZT9cIikpIHtcbiAgICBkZWxldGVOb3RlKG5vdGUuaWQpO1xuICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgfVxufVxuXG5cbiIsImZ1bmN0aW9uIHByaW50KG1ldGhvZCwgLi4uYXJncykge1xuICBpZiAoaW1wb3J0Lm1ldGEuZW52Lk1PREUgPT09IFwicHJvZHVjdGlvblwiKSByZXR1cm47XG4gIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBhcmdzLnNoaWZ0KCk7XG4gICAgbWV0aG9kKGBbd3h0XSAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgbWV0aG9kKFwiW3d4dF1cIiwgLi4uYXJncyk7XG4gIH1cbn1cbmV4cG9ydCBjb25zdCBsb2dnZXIgPSB7XG4gIGRlYnVnOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5kZWJ1ZywgLi4uYXJncyksXG4gIGxvZzogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUubG9nLCAuLi5hcmdzKSxcbiAgd2FybjogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUud2FybiwgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5lcnJvciwgLi4uYXJncylcbn07XG4iLCJpbXBvcnQgeyBicm93c2VyIH0gZnJvbSBcInd4dC9icm93c2VyXCI7XG5leHBvcnQgY2xhc3MgV3h0TG9jYXRpb25DaGFuZ2VFdmVudCBleHRlbmRzIEV2ZW50IHtcbiAgY29uc3RydWN0b3IobmV3VXJsLCBvbGRVcmwpIHtcbiAgICBzdXBlcihXeHRMb2NhdGlvbkNoYW5nZUV2ZW50LkVWRU5UX05BTUUsIHt9KTtcbiAgICB0aGlzLm5ld1VybCA9IG5ld1VybDtcbiAgICB0aGlzLm9sZFVybCA9IG9sZFVybDtcbiAgfVxuICBzdGF0aWMgRVZFTlRfTkFNRSA9IGdldFVuaXF1ZUV2ZW50TmFtZShcInd4dDpsb2NhdGlvbmNoYW5nZVwiKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRVbmlxdWVFdmVudE5hbWUoZXZlbnROYW1lKSB7XG4gIHJldHVybiBgJHticm93c2VyPy5ydW50aW1lPy5pZH06JHtpbXBvcnQubWV0YS5lbnYuRU5UUllQT0lOVH06JHtldmVudE5hbWV9YDtcbn1cbiIsImltcG9ydCB7IFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQgfSBmcm9tIFwiLi9jdXN0b20tZXZlbnRzLm1qc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvY2F0aW9uV2F0Y2hlcihjdHgpIHtcbiAgbGV0IGludGVydmFsO1xuICBsZXQgb2xkVXJsO1xuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIEVuc3VyZSB0aGUgbG9jYXRpb24gd2F0Y2hlciBpcyBhY3RpdmVseSBsb29raW5nIGZvciBVUkwgY2hhbmdlcy4gSWYgaXQncyBhbHJlYWR5IHdhdGNoaW5nLFxuICAgICAqIHRoaXMgaXMgYSBub29wLlxuICAgICAqL1xuICAgIHJ1bigpIHtcbiAgICAgIGlmIChpbnRlcnZhbCAhPSBudWxsKSByZXR1cm47XG4gICAgICBvbGRVcmwgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgaW50ZXJ2YWwgPSBjdHguc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBsZXQgbmV3VXJsID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgaWYgKG5ld1VybC5ocmVmICE9PSBvbGRVcmwuaHJlZikge1xuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBXeHRMb2NhdGlvbkNoYW5nZUV2ZW50KG5ld1VybCwgb2xkVXJsKSk7XG4gICAgICAgICAgb2xkVXJsID0gbmV3VXJsO1xuICAgICAgICB9XG4gICAgICB9LCAxZTMpO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7IGJyb3dzZXIgfSBmcm9tIFwid3h0L2Jyb3dzZXJcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCIuLi91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzXCI7XG5pbXBvcnQge1xuICBnZXRVbmlxdWVFdmVudE5hbWVcbn0gZnJvbSBcIi4vaW50ZXJuYWwvY3VzdG9tLWV2ZW50cy5tanNcIjtcbmltcG9ydCB7IGNyZWF0ZUxvY2F0aW9uV2F0Y2hlciB9IGZyb20gXCIuL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzXCI7XG5leHBvcnQgY2xhc3MgQ29udGVudFNjcmlwdENvbnRleHQge1xuICBjb25zdHJ1Y3Rvcihjb250ZW50U2NyaXB0TmFtZSwgb3B0aW9ucykge1xuICAgIHRoaXMuY29udGVudFNjcmlwdE5hbWUgPSBjb250ZW50U2NyaXB0TmFtZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuYWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGlmICh0aGlzLmlzVG9wRnJhbWUpIHtcbiAgICAgIHRoaXMubGlzdGVuRm9yTmV3ZXJTY3JpcHRzKHsgaWdub3JlRmlyc3RFdmVudDogdHJ1ZSB9KTtcbiAgICAgIHRoaXMuc3RvcE9sZFNjcmlwdHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5saXN0ZW5Gb3JOZXdlclNjcmlwdHMoKTtcbiAgICB9XG4gIH1cbiAgc3RhdGljIFNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRSA9IGdldFVuaXF1ZUV2ZW50TmFtZShcbiAgICBcInd4dDpjb250ZW50LXNjcmlwdC1zdGFydGVkXCJcbiAgKTtcbiAgaXNUb3BGcmFtZSA9IHdpbmRvdy5zZWxmID09PSB3aW5kb3cudG9wO1xuICBhYm9ydENvbnRyb2xsZXI7XG4gIGxvY2F0aW9uV2F0Y2hlciA9IGNyZWF0ZUxvY2F0aW9uV2F0Y2hlcih0aGlzKTtcbiAgcmVjZWl2ZWRNZXNzYWdlSWRzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbiAgZ2V0IHNpZ25hbCgpIHtcbiAgICByZXR1cm4gdGhpcy5hYm9ydENvbnRyb2xsZXIuc2lnbmFsO1xuICB9XG4gIGFib3J0KHJlYXNvbikge1xuICAgIHJldHVybiB0aGlzLmFib3J0Q29udHJvbGxlci5hYm9ydChyZWFzb24pO1xuICB9XG4gIGdldCBpc0ludmFsaWQoKSB7XG4gICAgaWYgKGJyb3dzZXIucnVudGltZS5pZCA9PSBudWxsKSB7XG4gICAgICB0aGlzLm5vdGlmeUludmFsaWRhdGVkKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNpZ25hbC5hYm9ydGVkO1xuICB9XG4gIGdldCBpc1ZhbGlkKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0ludmFsaWQ7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIGNvbnRlbnQgc2NyaXB0J3MgY29udGV4dCBpcyBpbnZhbGlkYXRlZC5cbiAgICpcbiAgICogQHJldHVybnMgQSBmdW5jdGlvbiB0byByZW1vdmUgdGhlIGxpc3RlbmVyLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGNiKTtcbiAgICogY29uc3QgcmVtb3ZlSW52YWxpZGF0ZWRMaXN0ZW5lciA9IGN0eC5vbkludmFsaWRhdGVkKCgpID0+IHtcbiAgICogICBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLnJlbW92ZUxpc3RlbmVyKGNiKTtcbiAgICogfSlcbiAgICogLy8gLi4uXG4gICAqIHJlbW92ZUludmFsaWRhdGVkTGlzdGVuZXIoKTtcbiAgICovXG4gIG9uSW52YWxpZGF0ZWQoY2IpIHtcbiAgICB0aGlzLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgY2IpO1xuICAgIHJldHVybiAoKSA9PiB0aGlzLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgY2IpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm4gYSBwcm9taXNlIHRoYXQgbmV2ZXIgcmVzb2x2ZXMuIFVzZWZ1bCBpZiB5b3UgaGF2ZSBhbiBhc3luYyBmdW5jdGlvbiB0aGF0IHNob3VsZG4ndCBydW5cbiAgICogYWZ0ZXIgdGhlIGNvbnRleHQgaXMgZXhwaXJlZC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogY29uc3QgZ2V0VmFsdWVGcm9tU3RvcmFnZSA9IGFzeW5jICgpID0+IHtcbiAgICogICBpZiAoY3R4LmlzSW52YWxpZCkgcmV0dXJuIGN0eC5ibG9jaygpO1xuICAgKlxuICAgKiAgIC8vIC4uLlxuICAgKiB9XG4gICAqL1xuICBibG9jaygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnNldEludGVydmFsYCB0aGF0IGF1dG9tYXRpY2FsbHkgY2xlYXJzIHRoZSBpbnRlcnZhbCB3aGVuIGludmFsaWRhdGVkLlxuICAgKi9cbiAgc2V0SW50ZXJ2YWwoaGFuZGxlciwgdGltZW91dCkge1xuICAgIGNvbnN0IGlkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgaGFuZGxlcigpO1xuICAgIH0sIHRpbWVvdXQpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjbGVhckludGVydmFsKGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnNldFRpbWVvdXRgIHRoYXQgYXV0b21hdGljYWxseSBjbGVhcnMgdGhlIGludGVydmFsIHdoZW4gaW52YWxpZGF0ZWQuXG4gICAqL1xuICBzZXRUaW1lb3V0KGhhbmRsZXIsIHRpbWVvdXQpIHtcbiAgICBjb25zdCBpZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgaGFuZGxlcigpO1xuICAgIH0sIHRpbWVvdXQpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjbGVhclRpbWVvdXQoaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lYCB0aGF0IGF1dG9tYXRpY2FsbHkgY2FuY2VscyB0aGUgcmVxdWVzdCB3aGVuXG4gICAqIGludmFsaWRhdGVkLlxuICAgKi9cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKC4uLmFyZ3MpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgIH0pO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjYW5jZWxBbmltYXRpb25GcmFtZShpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrYCB0aGF0IGF1dG9tYXRpY2FsbHkgY2FuY2VscyB0aGUgcmVxdWVzdCB3aGVuXG4gICAqIGludmFsaWRhdGVkLlxuICAgKi9cbiAgcmVxdWVzdElkbGVDYWxsYmFjayhjYWxsYmFjaywgb3B0aW9ucykge1xuICAgIGNvbnN0IGlkID0gcmVxdWVzdElkbGVDYWxsYmFjaygoLi4uYXJncykgPT4ge1xuICAgICAgaWYgKCF0aGlzLnNpZ25hbC5hYm9ydGVkKSBjYWxsYmFjayguLi5hcmdzKTtcbiAgICB9LCBvcHRpb25zKTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2FuY2VsSWRsZUNhbGxiYWNrKGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIGFkZEV2ZW50TGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBoYW5kbGVyLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGUgPT09IFwid3h0OmxvY2F0aW9uY2hhbmdlXCIpIHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIHRoaXMubG9jYXRpb25XYXRjaGVyLnJ1bigpO1xuICAgIH1cbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcj8uKFxuICAgICAgdHlwZS5zdGFydHNXaXRoKFwid3h0OlwiKSA/IGdldFVuaXF1ZUV2ZW50TmFtZSh0eXBlKSA6IHR5cGUsXG4gICAgICBoYW5kbGVyLFxuICAgICAge1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICBzaWduYWw6IHRoaXMuc2lnbmFsXG4gICAgICB9XG4gICAgKTtcbiAgfVxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqIEFib3J0IHRoZSBhYm9ydCBjb250cm9sbGVyIGFuZCBleGVjdXRlIGFsbCBgb25JbnZhbGlkYXRlZGAgbGlzdGVuZXJzLlxuICAgKi9cbiAgbm90aWZ5SW52YWxpZGF0ZWQoKSB7XG4gICAgdGhpcy5hYm9ydChcIkNvbnRlbnQgc2NyaXB0IGNvbnRleHQgaW52YWxpZGF0ZWRcIik7XG4gICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgYENvbnRlbnQgc2NyaXB0IFwiJHt0aGlzLmNvbnRlbnRTY3JpcHROYW1lfVwiIGNvbnRleHQgaW52YWxpZGF0ZWRgXG4gICAgKTtcbiAgfVxuICBzdG9wT2xkU2NyaXB0cygpIHtcbiAgICB3aW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIHR5cGU6IENvbnRlbnRTY3JpcHRDb250ZXh0LlNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRSxcbiAgICAgICAgY29udGVudFNjcmlwdE5hbWU6IHRoaXMuY29udGVudFNjcmlwdE5hbWUsXG4gICAgICAgIG1lc3NhZ2VJZDogTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMilcbiAgICAgIH0sXG4gICAgICBcIipcIlxuICAgICk7XG4gIH1cbiAgdmVyaWZ5U2NyaXB0U3RhcnRlZEV2ZW50KGV2ZW50KSB7XG4gICAgY29uc3QgaXNTY3JpcHRTdGFydGVkRXZlbnQgPSBldmVudC5kYXRhPy50eXBlID09PSBDb250ZW50U2NyaXB0Q29udGV4dC5TQ1JJUFRfU1RBUlRFRF9NRVNTQUdFX1RZUEU7XG4gICAgY29uc3QgaXNTYW1lQ29udGVudFNjcmlwdCA9IGV2ZW50LmRhdGE/LmNvbnRlbnRTY3JpcHROYW1lID09PSB0aGlzLmNvbnRlbnRTY3JpcHROYW1lO1xuICAgIGNvbnN0IGlzTm90RHVwbGljYXRlID0gIXRoaXMucmVjZWl2ZWRNZXNzYWdlSWRzLmhhcyhldmVudC5kYXRhPy5tZXNzYWdlSWQpO1xuICAgIHJldHVybiBpc1NjcmlwdFN0YXJ0ZWRFdmVudCAmJiBpc1NhbWVDb250ZW50U2NyaXB0ICYmIGlzTm90RHVwbGljYXRlO1xuICB9XG4gIGxpc3RlbkZvck5ld2VyU2NyaXB0cyhvcHRpb25zKSB7XG4gICAgbGV0IGlzRmlyc3QgPSB0cnVlO1xuICAgIGNvbnN0IGNiID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAodGhpcy52ZXJpZnlTY3JpcHRTdGFydGVkRXZlbnQoZXZlbnQpKSB7XG4gICAgICAgIHRoaXMucmVjZWl2ZWRNZXNzYWdlSWRzLmFkZChldmVudC5kYXRhLm1lc3NhZ2VJZCk7XG4gICAgICAgIGNvbnN0IHdhc0ZpcnN0ID0gaXNGaXJzdDtcbiAgICAgICAgaXNGaXJzdCA9IGZhbHNlO1xuICAgICAgICBpZiAod2FzRmlyc3QgJiYgb3B0aW9ucz8uaWdub3JlRmlyc3RFdmVudCkgcmV0dXJuO1xuICAgICAgICB0aGlzLm5vdGlmeUludmFsaWRhdGVkKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBhZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBjYik7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IHJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGNiKSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJkZWZpbml0aW9uIiwiYnJvd3NlciIsIl9icm93c2VyIiwiY29udGVudCIsIl9hIiwiX2IiLCJyZXN1bHQiLCJwcmludCIsImxvZ2dlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQU8sV0FBUyxvQkFBb0JBLGFBQVk7QUFDOUMsV0FBT0E7QUFBQSxFQUNUO0FDRE8sUUFBTUMsY0FBVSxzQkFBVyxZQUFYLG1CQUFvQixZQUFwQixtQkFBNkIsTUFDaEQsV0FBVyxVQUNYLFdBQVc7QUNGUixRQUFNLFVBQVVDO0FDRHZCLFFBQUEsYUFBQSxvQkFBQTtBQUFBLElBQW1DLFNBQUEsQ0FBQSxZQUFBO0FBQUEsSUFDWCxPQUFBO0FBRXBCLGNBQUEsSUFBQSxnRUFBQTtBQUdBLFVBQUEsU0FBQSxlQUFBLFdBQUE7QUFDRSxpQkFBQSxpQkFBQSxvQkFBQSxNQUFBO0FBQ0UsMkJBQUE7QUFBQSxRQUFpQixDQUFBO0FBQUEsTUFDbEIsT0FBQTtBQUVELHlCQUFBO0FBQUEsTUFBaUI7QUFBQSxJQUNuQjtBQUFBLEVBRUosQ0FBQTtBQUVBLE1BQUEsU0FBQTtBQUNBLE1BQUEsYUFBQTtBQUNBLE1BQUEsYUFBQTtBQUNBLE1BQUEsYUFBQSxFQUFBLEdBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxNQUFBLGVBQUEsRUFBQSxHQUFBLEdBQUEsR0FBQSxFQUFBO0FBQ0EsTUFBQSxtQkFBQTtBQUNBLE1BQUE7QUFFQSxXQUFBLG1CQUFBO0FBQ0UsWUFBQSxJQUFBLDZDQUFBO0FBQ0EseUJBQUE7QUFDQSx1QkFBQTtBQUNBLDJCQUFBO0FBQ0EseUJBQUE7QUFBQSxFQUNGO0FBRUEsV0FBQSx1QkFBQTtBQUVFLFVBQUEsaUJBQUEsU0FBQSxlQUFBLG9CQUFBO0FBQ0EsUUFBQSxnQkFBQTtBQUNFLHFCQUFBLE9BQUE7QUFBQSxJQUFzQjtBQUl4QixhQUFBLFNBQUEsY0FBQSxLQUFBO0FBQ0EsV0FBQSxLQUFBO0FBR0EsUUFBQTtBQUNBLFFBQUE7QUFFQSxRQUFBO0FBRUUscUJBQUEsUUFBQSxRQUFBLE9BQUEsZUFBQTtBQUNBLDJCQUFBO0FBQ0EsZ0JBQUEsUUFBQSxRQUFBLE9BQUEsVUFBQTtBQUFBLElBQWtELFNBQUEsT0FBQTtBQUVsRCxjQUFBLEtBQUEsMkRBQUEsS0FBQTtBQUVBLFlBQUEsY0FBQSxRQUFBLFFBQUEsTUFBQSxPQUFBLFFBQUE7QUFDQSxxQkFBQSxzQkFBQSxXQUFBO0FBQ0EsMkJBQUE7QUFDQSxnQkFBQSxzQkFBQSxXQUFBO0FBQUEsSUFBMkM7QUFHN0MsWUFBQSxJQUFBLDZCQUFBLEVBQUEsY0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsK0JBQUEsUUFBQSxRQUFBLEVBQUE7QUFDQSxZQUFBLElBQUEsb0NBQUEsT0FBQSxRQUFBLEVBQUE7QUFFQSxXQUFBLFlBQUE7QUFBQTtBQUFBO0FBQUEsb0JBQW1CLFlBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBZ0JuQixVQUFBLFFBQUEsU0FBQSxjQUFBLE9BQUE7QUFDQSxVQUFBLGNBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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
