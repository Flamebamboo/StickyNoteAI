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
      console.log("StickyNoteAI: Initializing...");
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          initializeWidget();
        });
      } else {
        initializeWidget();
      }
    }
  });
  function initializeWidget() {
    console.log("StickyNoteAI: DOM ready, creating widget...");
    console.log("StickyNoteAI: Content script is running on:", window.location.href);
    createFloatingWidget();
    setTimeout(() => {
      loadWidgetPosition();
      refreshNotesList();
    }, 100);
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("StickyNoteAI: Received message:", message);
      if (message.action === "toggle-widget") {
        const widget = document.getElementById("sticky-note-widget");
        if (widget) {
          widget.style.display = widget.style.display === "none" ? "block" : "none";
          console.log("StickyNoteAI: Widget toggled via command");
        }
      } else if (message.action === "new-note") {
        createNoteEditor();
        console.log("StickyNoteAI: Note editor opened via command");
      }
      sendResponse({ success: true });
    });
  }
  function createFloatingWidget() {
    console.log("StickyNoteAI: Creating floating widget...");
    if (document.getElementById("sticky-note-widget")) {
      console.log("StickyNoteAI: Widget already exists");
      return;
    }
    if (!document.body) {
      console.log("StickyNoteAI: document.body not available, retrying...");
      setTimeout(() => createFloatingWidget(), 100);
      return;
    }
    const widget = document.createElement("div");
    widget.id = "sticky-note-widget";
    widget.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    width: 60px !important;
    height: 60px !important;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9)) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 50% !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
    z-index: 999999 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 14px !important;
    cursor: move !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    overflow: visible !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  `;
    widget.innerHTML = `
    <div class="widget-circle" style="
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      position: relative;
      z-index: 2;
    ">
      <span class="widget-icon" style="
        font-size: 24px; 
        color: white; 
        filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
        pointer-events: none;
      ">✨</span>
    </div>
    <div class="widget-expanded" style="
      position: absolute;
      top: 0;
      right: 0;
      width: 280px;
      height: auto;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      opacity: 0;
      visibility: hidden;
      transform: translateX(20px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      z-index: 1;
    ">
      <div class="widget-header" style="
        display: flex; 
        align-items: center; 
        padding: 16px 20px; 
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); 
        border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
        gap: 12px;
        backdrop-filter: blur(10px);
      ">
        <span class="widget-icon-header" style="font-size: 18px; flex: 1; color: #6366f1; filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.3));">✨</span>
        <button class="btn-add" title="Add Note" style="
          background: linear-gradient(135deg, #10b981, #059669); 
          border: none; 
          padding: 8px 12px; 
          border-radius: 8px; 
          cursor: pointer; 
          font-size: 12px; 
          font-weight: 600; 
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          transition: all 0.2s ease;
          pointer-events: auto;
        ">+ Add</button>
        <button class="btn-menu" title="Menu" style="
          background: rgba(255, 255, 255, 0.1); 
          border: 1px solid rgba(255, 255, 255, 0.2); 
          padding: 8px; 
          border-radius: 8px; 
          cursor: pointer; 
          font-size: 14px; 
          font-weight: bold; 
          color: #64748b;
          transition: all 0.2s ease;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
        ">≡</button>
        <button class="btn-hide" title="Hide" style="
          background: rgba(255, 255, 255, 0.1); 
          border: 1px solid rgba(255, 255, 255, 0.2); 
          padding: 8px; 
          border-radius: 8px; 
          cursor: pointer; 
          font-size: 14px; 
          font-weight: bold; 
          color: #ef4444;
          transition: all 0.2s ease;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
        ">×</button>
      </div>
      <div class="widget-body" style="
        display: none; 
        padding: 20px; 
        max-height: 400px; 
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.05);
        pointer-events: auto;
      ">
        <div class="notes-list" style="display: flex; flex-direction: column; gap: 12px;">
          <div class="no-notes" style="
            color: #64748b; 
            font-style: italic; 
            text-align: center; 
            padding: 32px 16px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            border: 1px dashed rgba(255, 255, 255, 0.2);
          ">
            <div style="font-size: 24px; margin-bottom: 8px;">📝</div>
            <div style="font-size: 13px; color: #94a3b8;">No notes yet</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Click + Add to create your first note</div>
          </div>
        </div>
      </div>
    </div>
  `;
    addWidgetStyles();
    makeDraggable(widget);
    addWidgetEventListeners(widget);
    document.body.appendChild(widget);
    console.log("StickyNoteAI: Widget created successfully and added to DOM");
    widget.style.display = "block";
    widget.style.visibility = "visible";
    const verifyWidget = document.getElementById("sticky-note-widget");
    if (verifyWidget) {
      console.log("StickyNoteAI: Widget verification successful");
      console.log("Widget position:", verifyWidget.style.top, verifyWidget.style.right);
    } else {
      console.error("StickyNoteAI: Widget verification failed!");
    }
  }
  function addWidgetStyles() {
    if (document.getElementById("sticky-note-styles")) {
      return;
    }
    const styles = document.createElement("style");
    styles.id = "sticky-note-styles";
    styles.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    #sticky-note-widget {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }

    /* Prevent text selection on entire widget */
    #sticky-note-widget * {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }

    /* Hover effect for circle widget */
    #sticky-note-widget:hover {
      transform: scale(1.1) !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3) !important;
    }

    /* Show expanded widget on hover */
    #sticky-note-widget:hover .widget-expanded {
      opacity: 1 !important;
      visibility: visible !important;
      transform: translateX(0) !important;
      pointer-events: auto !important;
    }

    /* Dragging state */
    #sticky-note-widget.dragging {
      transition: none !important;
    }

    #sticky-note-widget.dragging .widget-expanded {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* Button hover effects */
    #sticky-note-widget .btn-add:hover {
      background: linear-gradient(135deg, #059669, #047857) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
    }

    #sticky-note-widget .btn-menu:hover,
    #sticky-note-widget .btn-hide:hover {
      background: rgba(255, 255, 255, 0.2) !important;
      transform: translateY(-1px) !important;
    }

    #sticky-note-widget .note-item {
      background: rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(10px) !important;
      padding: 16px !important;
      border-radius: 12px !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      cursor: pointer !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      position: relative !important;
      overflow: hidden !important;
    }

    #sticky-note-widget .note-item:before {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 3px !important;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899) !important;
      opacity: 0 !important;
      transition: opacity 0.3s ease !important;
    }

    #sticky-note-widget .note-item:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      transform: translateY(-2px) scale(1.02) !important;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
    }

    #sticky-note-widget .note-item:hover:before {
      opacity: 1 !important;
    }

    #sticky-note-widget .note-title {
      font-weight: 600 !important;
      margin-bottom: 8px !important;
      color: #1e293b !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
    }

    #sticky-note-widget .note-preview {
      color: #64748b !important;
      font-size: 12px !important;
      line-height: 1.5 !important;
      overflow: hidden !important;
      display: -webkit-box !important;
      -webkit-line-clamp: 2 !important;
      -webkit-box-orient: vertical !important;
    }

    #sticky-note-widget .note-meta {
      margin-top: 8px !important;
      font-size: 10px !important;
      color: #94a3b8 !important;
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
    }

    #sticky-note-widget .note-meta:before {
      content: '📅' !important;
      font-size: 8px !important;
    }

    /* Stealth mode - ultra minimal */
    #sticky-note-widget.stealth {
      opacity: 0.3 !important;
      transform: scale(0.9) !important;
      transition: all 0.3s ease !important;
    }

    #sticky-note-widget.stealth:hover {
      opacity: 1 !important;
      transform: scale(1.1) !important;
    }

    /* Animations */
    @keyframes noteSlideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    #sticky-note-widget .note-item {
      animation: noteSlideIn 0.3s ease-out !important;
    }

    /* Scrollbar styling */
    #sticky-note-widget .widget-body::-webkit-scrollbar {
      width: 4px !important;
    }

    #sticky-note-widget .widget-body::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1) !important;
      border-radius: 2px !important;
    }

    #sticky-note-widget .widget-body::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3) !important;
      border-radius: 2px !important;
    }

    #sticky-note-widget .widget-body::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5) !important;
    }

    /* Ensure smooth dragging */
    #sticky-note-widget.dragging * {
      pointer-events: none !important;
    }
  `;
    document.head.appendChild(styles);
  }
  function makeDraggable(element) {
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let dragStartTime = 0;
    const circle = element.querySelector(".widget-circle");
    circle.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);
    element.addEventListener("contextmenu", (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    });
    element.addEventListener("selectstart", (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    });
    function dragStart(e) {
      if (e.button !== 0) return;
      dragStartTime = Date.now();
      e.preventDefault();
      initialX = e.clientX - currentX;
      initialY = e.clientY - currentY;
      isDragging = true;
      element.classList.add("dragging");
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
    }
    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        const rect = element.getBoundingClientRect();
        const padding = 10;
        const maxX = window.innerWidth - rect.width - padding;
        const maxY = window.innerHeight - rect.height - padding;
        currentX = Math.max(padding, Math.min(currentX, maxX));
        currentY = Math.max(padding, Math.min(currentY, maxY));
        element.style.transform = `translate(${currentX}px, ${currentY}px)`;
        element.style.left = "0";
        element.style.top = "0";
        element.style.right = "auto";
      }
    }
    function dragEnd(e) {
      if (!isDragging) return;
      isDragging = false;
      element.classList.remove("dragging");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      element.style.left = currentX + "px";
      element.style.top = currentY + "px";
      element.style.transform = "";
      saveWidgetPosition(currentX, currentY);
      const dragDuration = Date.now() - dragStartTime;
      if (dragDuration < 200) {
        const distance = Math.sqrt(Math.pow(e.clientX - (initialX + currentX), 2) + Math.pow(e.clientY - (initialY + currentY), 2));
        if (distance < 5) {
          console.log("Circle clicked");
        }
      }
    }
    circle.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0
      });
      dragStart(mouseEvent);
    });
    document.addEventListener("touchmove", (e) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousemove", {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        drag(mouseEvent);
      }
    });
    document.addEventListener("touchend", (e) => {
      if (isDragging) {
        e.preventDefault();
        const mouseEvent = new MouseEvent("mouseup", {
          clientX: 0,
          clientY: 0
        });
        dragEnd(mouseEvent);
      }
    });
  }
  function addWidgetEventListeners(widget) {
    const addBtn = widget.querySelector(".btn-add");
    const menuBtn = widget.querySelector(".btn-menu");
    const hideBtn = widget.querySelector(".btn-hide");
    const widgetBody = widget.querySelector(".widget-body");
    const expandedWidget = widget.querySelector(".widget-expanded");
    addBtn == null ? void 0 : addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      createNoteEditor();
    });
    menuBtn == null ? void 0 : menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const isVisible = widgetBody.style.display !== "none";
      widgetBody.style.display = isVisible ? "none" : "block";
      menuBtn.textContent = isVisible ? "≡" : "×";
    });
    hideBtn == null ? void 0 : hideBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      widget.style.display = "none";
    });
    expandedWidget == null ? void 0 : expandedWidget.addEventListener("mouseenter", () => {
      expandedWidget.style.opacity = "1";
      expandedWidget.style.visibility = "visible";
      expandedWidget.style.transform = "translateX(0)";
      expandedWidget.style.pointerEvents = "auto";
    });
    let hideTimeout = null;
    widget.addEventListener("mouseleave", () => {
      hideTimeout = setTimeout(() => {
        if (!widget.matches(":hover")) {
          const expanded = widget.querySelector(".widget-expanded");
          if (expanded) {
            expanded.style.opacity = "0";
            expanded.style.visibility = "hidden";
            expanded.style.transform = "translateX(20px)";
            expanded.style.pointerEvents = "none";
          }
        }
      }, 100);
    });
    widget.addEventListener("mouseenter", () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    });
    widget.addEventListener("dblclick", (e) => {
      e.preventDefault();
      widget.style.display = "none";
    });
    document.addEventListener("keydown", (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      if (cmdOrCtrl && e.shiftKey && e.key === "W") {
        e.preventDefault();
        widget.style.display = widget.style.display === "none" ? "block" : "none";
      }
      if (cmdOrCtrl && e.shiftKey && e.key === "S") {
        e.preventDefault();
        createNoteEditor();
      }
    });
  }
  function createNoteEditor() {
    if (document.getElementById("note-editor-modal")) {
      return;
    }
    const modal = document.createElement("div");
    modal.id = "note-editor-modal";
    modal.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Create Note</h3>
          <div class="auto-save-indicator">Draft saved</div>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <input type="text" placeholder="Give your note a title..." class="note-title-input">
          <textarea placeholder="Start writing your thoughts here...

💡 Tips:
• Use markdown for formatting
• Notes auto-save as you type
• Press Esc to close quickly" class="note-content-input"></textarea>
          <div class="modal-actions">
            <button class="btn-cancel">Cancel</button>
            <button class="btn-save">Save Note</button>
          </div>
        </div>
      </div>
    </div>
  `;
    addModalStyles();
    addModalEventListeners(modal);
    document.body.appendChild(modal);
    const titleInput = modal.querySelector(".note-title-input");
    titleInput.focus();
  }
  function addModalStyles() {
    if (document.getElementById("note-modal-styles")) {
      return;
    }
    const styles = document.createElement("style");
    styles.id = "note-modal-styles";
    styles.textContent = `
    #note-editor-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999999;
      animation: modalFadeIn 0.3s ease-out;
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-backdrop {
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-content {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow: hidden;
      animation: modalSlideIn 0.3s ease-out;
    }

    .modal-header {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
      padding: 24px 28px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-header h3:before {
      content: '✨';
      font-size: 18px;
      filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.3));
    }

    .modal-close {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 20px;
      cursor: pointer;
      color: #64748b;
      padding: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;
      transform: scale(1.05);
    }

    .modal-body {
      padding: 28px;
    }

    .note-title-input {
      width: 100%;
      padding: 16px 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(10px);
      color: #1e293b;
      transition: all 0.2s ease;
      outline: none;
    }

    .note-title-input:focus {
      border-color: rgba(99, 102, 241, 0.5);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      background: rgba(255, 255, 255, 0.8);
    }

    .note-title-input::placeholder {
      color: #94a3b8;
    }

    .note-content-input {
      width: 100%;
      min-height: 180px;
      padding: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.6;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(10px);
      color: #1e293b;
      resize: vertical;
      margin-bottom: 24px;
      transition: all 0.2s ease;
      outline: none;
    }

    .note-content-input:focus {
      border-color: rgba(99, 102, 241, 0.5);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      background: rgba(255, 255, 255, 0.8);
    }

    .note-content-input::placeholder {
      color: #94a3b8;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .modal-actions button {
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 100px;
      justify-content: center;
    }

    .btn-save {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-save:hover {
      background: linear-gradient(135deg, #059669, #047857);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-save:before {
      content: '💾';
      font-size: 12px;
    }

    .btn-cancel {
      background: rgba(255, 255, 255, 0.1);
      color: #64748b;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .btn-cancel:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      color: #475569;
      transform: translateY(-1px);
    }

    .btn-cancel:before {
      content: '✕';
      font-size: 10px;
    }

    /* Auto-save indicator */
    .auto-save-indicator {
      position: absolute;
      top: 24px;
      right: 80px;
      padding: 6px 12px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 20px;
      font-size: 11px;
      color: #059669;
      font-weight: 500;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .auto-save-indicator.show {
      opacity: 1;
    }

    .auto-save-indicator:before {
      content: '💾';
      margin-right: 4px;
      font-size: 10px;
    }
  `;
    document.head.appendChild(styles);
  }
  function addModalEventListeners(modal) {
    const closeBtn = modal.querySelector(".modal-close");
    const saveBtn = modal.querySelector(".btn-save");
    const cancelBtn = modal.querySelector(".btn-cancel");
    const titleInput = modal.querySelector(".note-title-input");
    const contentInput = modal.querySelector(".note-content-input");
    closeBtn.addEventListener("click", () => closeModal(modal));
    cancelBtn.addEventListener("click", () => closeModal(modal));
    saveBtn.addEventListener("click", () => {
      const title = titleInput.value.trim() || "Untitled Note";
      const content2 = contentInput.value.trim();
      if (content2) {
        saveNote(title, content2);
        closeModal(modal);
      }
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal.querySelector(".modal-backdrop")) {
        closeModal(modal);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal(modal);
      }
    });
    let autoSaveTimer;
    const autoSave = () => {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = window.setTimeout(() => {
        const title = titleInput.value.trim() || "Draft";
        const content2 = contentInput.value.trim();
        if (content2) {
          browser.storage.local.set({ "sticky-note-draft": { title, content: content2 } });
        }
      }, 2e3);
    };
    titleInput.addEventListener("input", autoSave);
    contentInput.addEventListener("input", autoSave);
    browser.storage.local.get("sticky-note-draft", (result2) => {
      const draft = result2["sticky-note-draft"];
      if (draft) {
        titleInput.value = draft.title;
        contentInput.value = draft.content;
      }
    });
  }
  function closeModal(modal) {
    modal.remove();
    browser.storage.local.remove("sticky-note-draft");
  }
  function saveNote(title, content2) {
    browser.storage.local.get("sticky-notes", (result2) => {
      const notes = result2["sticky-notes"] || [];
      const newNote = {
        id: Date.now().toString(),
        title,
        content: content2,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      notes.push(newNote);
      browser.storage.local.set({ "sticky-notes": notes }, () => {
        console.log("Note saved:", newNote);
        refreshNotesList();
      });
    });
  }
  function refreshNotesList() {
    const widget = document.getElementById("sticky-note-widget");
    if (!widget) {
      console.error("Widget does not exist in the DOM.");
      return;
    }
    const notesList = widget.querySelector(".notes-list");
    browser.storage.local.get("sticky-notes", (result2) => {
      const notes = result2["sticky-notes"] || [];
      if (notes.length === 0) {
        notesList.innerHTML = '<div class="no-notes">No notes yet. Click + to add one!</div>';
        return;
      }
      notesList.innerHTML = notes.map(
        (note) => `
      <div class="note-item" data-note-id="${note.id}">
        <div class="note-title">${note.title}</div>
        <div class="note-preview">${note.content.substring(0, 50)}${note.content.length > 50 ? "..." : ""}</div>
      </div>
    `
      ).join("");
      notesList.querySelectorAll(".note-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          const noteId = e.currentTarget.dataset.noteId;
          console.log("Clicked note:", noteId);
        });
      });
    });
  }
  function saveWidgetPosition(x, y) {
    browser.storage.local.set({
      "sticky-settings": {
        widgetPosition: { x, y }
      }
    });
  }
  function loadWidgetPosition() {
    try {
      browser.storage.local.get("sticky-settings", (result2) => {
        const settings = result2["sticky-settings"];
        if (settings && settings.widgetPosition) {
          const { x, y } = settings.widgetPosition;
          const widget = document.getElementById("sticky-note-widget");
          if (widget) {
            widget.style.left = x + "px";
            widget.style.top = y + "px";
            widget.style.right = "auto";
          }
        }
      });
    } catch (e) {
      console.error("Failed to load widget position:", e);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1jb250ZW50LXNjcmlwdC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHd4dC1kZXYvYnJvd3Nlci9zcmMvaW5kZXgubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L2Jyb3dzZXIubWpzIiwiLi4vLi4vLi4vZW50cnlwb2ludHMvY29udGVudC50cyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LWNvbnRleHQubWpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVDb250ZW50U2NyaXB0KGRlZmluaXRpb24pIHtcbiAgcmV0dXJuIGRlZmluaXRpb247XG59XG4iLCIvLyAjcmVnaW9uIHNuaXBwZXRcbmV4cG9ydCBjb25zdCBicm93c2VyID0gZ2xvYmFsVGhpcy5icm93c2VyPy5ydW50aW1lPy5pZFxuICA/IGdsb2JhbFRoaXMuYnJvd3NlclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xuLy8gI2VuZHJlZ2lvbiBzbmlwcGV0XG4iLCJpbXBvcnQgeyBicm93c2VyIGFzIF9icm93c2VyIH0gZnJvbSBcIkB3eHQtZGV2L2Jyb3dzZXJcIjtcbmV4cG9ydCBjb25zdCBicm93c2VyID0gX2Jyb3dzZXI7XG5leHBvcnQge307XG4iLCJleHBvcnQgZGVmYXVsdCBkZWZpbmVDb250ZW50U2NyaXB0KHtcbiAgbWF0Y2hlczogW1wiPGFsbF91cmxzPlwiXSxcbiAgbWFpbigpIHtcbiAgICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogSW5pdGlhbGl6aW5nLi4uXCIpO1xuXG4gICAgLy8gV2FpdCBmb3IgRE9NIHRvIGJlIHJlYWR5XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwibG9hZGluZ1wiKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgICAgIGluaXRpYWxpemVXaWRnZXQoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbml0aWFsaXplV2lkZ2V0KCk7XG4gICAgfVxuICB9LFxufSk7XG5cbmZ1bmN0aW9uIGluaXRpYWxpemVXaWRnZXQoKSB7XG4gIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBET00gcmVhZHksIGNyZWF0aW5nIHdpZGdldC4uLlwiKTtcblxuICAvLyBTaW1wbGUgdGVzdCB0byBjb25maXJtIGNvbnRlbnQgc2NyaXB0IGlzIHJ1bm5pbmdcbiAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IENvbnRlbnQgc2NyaXB0IGlzIHJ1bm5pbmcgb246XCIsIHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICBjcmVhdGVGbG9hdGluZ1dpZGdldCgpO1xuXG4gIC8vIEluaXRpYWxpemUgd2lkZ2V0IHBvc2l0aW9uIGFuZCBub3RlcyBsaXN0IGFmdGVyIGNyZWF0aW9uXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGxvYWRXaWRnZXRQb3NpdGlvbigpO1xuICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgfSwgMTAwKTtcblxuICAvLyBMaXN0ZW4gZm9yIG1lc3NhZ2VzIGZyb20gYmFja2dyb3VuZCBzY3JpcHRcbiAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogUmVjZWl2ZWQgbWVzc2FnZTpcIiwgbWVzc2FnZSk7XG5cbiAgICBpZiAobWVzc2FnZS5hY3Rpb24gPT09IFwidG9nZ2xlLXdpZGdldFwiKSB7XG4gICAgICBjb25zdCB3aWRnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0aWNreS1ub3RlLXdpZGdldFwiKTtcbiAgICAgIGlmICh3aWRnZXQpIHtcbiAgICAgICAgd2lkZ2V0LnN0eWxlLmRpc3BsYXkgPSB3aWRnZXQuc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcbiAgICAgICAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IFdpZGdldCB0b2dnbGVkIHZpYSBjb21tYW5kXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobWVzc2FnZS5hY3Rpb24gPT09IFwibmV3LW5vdGVcIikge1xuICAgICAgY3JlYXRlTm90ZUVkaXRvcigpO1xuICAgICAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IE5vdGUgZWRpdG9yIG9wZW5lZCB2aWEgY29tbWFuZFwiKTtcbiAgICB9XG5cbiAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRmxvYXRpbmdXaWRnZXQoKSB7XG4gIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBDcmVhdGluZyBmbG9hdGluZyB3aWRnZXQuLi5cIik7XG5cbiAgLy8gQ2hlY2sgaWYgd2lkZ2V0IGFscmVhZHkgZXhpc3RzXG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0aWNreS1ub3RlLXdpZGdldFwiKSkge1xuICAgIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBXaWRnZXQgYWxyZWFkeSBleGlzdHNcIik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgd2UgY2FuIGFjY2VzcyBkb2N1bWVudC5ib2R5XG4gIGlmICghZG9jdW1lbnQuYm9keSkge1xuICAgIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBkb2N1bWVudC5ib2R5IG5vdCBhdmFpbGFibGUsIHJldHJ5aW5nLi4uXCIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gY3JlYXRlRmxvYXRpbmdXaWRnZXQoKSwgMTAwKTtcbiAgICByZXR1cm47XG4gIH0gLy8gQ3JlYXRlIHRoZSBtYWluIHdpZGdldCBjb250YWluZXJcbiAgY29uc3Qgd2lkZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgd2lkZ2V0LmlkID0gXCJzdGlja3ktbm90ZS13aWRnZXRcIjtcbiAgd2lkZ2V0LnN0eWxlLmNzc1RleHQgPSBgXG4gICAgcG9zaXRpb246IGZpeGVkICFpbXBvcnRhbnQ7XG4gICAgdG9wOiAyMHB4ICFpbXBvcnRhbnQ7XG4gICAgcmlnaHQ6IDIwcHggIWltcG9ydGFudDtcbiAgICB3aWR0aDogNjBweCAhaW1wb3J0YW50O1xuICAgIGhlaWdodDogNjBweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHJnYmEoOTksIDEwMiwgMjQxLCAwLjkpLCByZ2JhKDE2OCwgODUsIDI0NywgMC45KSkgIWltcG9ydGFudDtcbiAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMjBweCkgIWltcG9ydGFudDtcbiAgICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogYmx1cigyMHB4KSAhaW1wb3J0YW50O1xuICAgIGJvcmRlcjogMnB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKSAhaW1wb3J0YW50O1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJSAhaW1wb3J0YW50O1xuICAgIGJveC1zaGFkb3c6IDAgOHB4IDMycHggcmdiYSgwLCAwLCAwLCAwLjIpICFpbXBvcnRhbnQ7XG4gICAgei1pbmRleDogOTk5OTk5ICFpbXBvcnRhbnQ7XG4gICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmICFpbXBvcnRhbnQ7XG4gICAgZm9udC1zaXplOiAxNHB4ICFpbXBvcnRhbnQ7XG4gICAgY3Vyc29yOiBtb3ZlICFpbXBvcnRhbnQ7XG4gICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKSAhaW1wb3J0YW50O1xuICAgIG92ZXJmbG93OiB2aXNpYmxlICFpbXBvcnRhbnQ7XG4gICAgdXNlci1zZWxlY3Q6IG5vbmUgIWltcG9ydGFudDtcbiAgICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lICFpbXBvcnRhbnQ7XG4gICAgLW1vei11c2VyLXNlbGVjdDogbm9uZSAhaW1wb3J0YW50O1xuICAgIC1tcy11c2VyLXNlbGVjdDogbm9uZSAhaW1wb3J0YW50O1xuICBgO1xuXG4gIHdpZGdldC5pbm5lckhUTUwgPSBgXG4gICAgPGRpdiBjbGFzcz1cIndpZGdldC1jaXJjbGVcIiBzdHlsZT1cIlxuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgei1pbmRleDogMjtcbiAgICBcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwid2lkZ2V0LWljb25cIiBzdHlsZT1cIlxuICAgICAgICBmb250LXNpemU6IDI0cHg7IFxuICAgICAgICBjb2xvcjogd2hpdGU7IFxuICAgICAgICBmaWx0ZXI6IGRyb3Atc2hhZG93KDAgMCA4cHggcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjUpKTtcbiAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgICBcIj7inKg8L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cIndpZGdldC1leHBhbmRlZFwiIHN0eWxlPVwiXG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB0b3A6IDA7XG4gICAgICByaWdodDogMDtcbiAgICAgIHdpZHRoOiAyODBweDtcbiAgICAgIGhlaWdodDogYXV0bztcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcbiAgICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cigyMHB4KTtcbiAgICAgIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiBibHVyKDIwcHgpO1xuICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpO1xuICAgICAgYm9yZGVyLXJhZGl1czogMTZweDtcbiAgICAgIGJveC1zaGFkb3c6IDAgOHB4IDMycHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgICAgb3BhY2l0eTogMDtcbiAgICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyMHB4KTtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjNzIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSk7XG4gICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICAgIHotaW5kZXg6IDE7XG4gICAgXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWhlYWRlclwiIHN0eWxlPVwiXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7IFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyBcbiAgICAgICAgcGFkZGluZzogMTZweCAyMHB4OyBcbiAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSg5OSwgMTAyLCAyNDEsIDAuMSksIHJnYmEoMTY4LCA4NSwgMjQ3LCAwLjEpKTsgXG4gICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7IFxuICAgICAgICBnYXA6IDEycHg7XG4gICAgICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxMHB4KTtcbiAgICAgIFwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cIndpZGdldC1pY29uLWhlYWRlclwiIHN0eWxlPVwiZm9udC1zaXplOiAxOHB4OyBmbGV4OiAxOyBjb2xvcjogIzYzNjZmMTsgZmlsdGVyOiBkcm9wLXNoYWRvdygwIDAgOHB4IHJnYmEoOTksIDEwMiwgMjQxLCAwLjMpKTtcIj7inKg8L3NwYW4+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4tYWRkXCIgdGl0bGU9XCJBZGQgTm90ZVwiIHN0eWxlPVwiXG4gICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzEwYjk4MSwgIzA1OTY2OSk7IFxuICAgICAgICAgIGJvcmRlcjogbm9uZTsgXG4gICAgICAgICAgcGFkZGluZzogOHB4IDEycHg7IFxuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDhweDsgXG4gICAgICAgICAgY3Vyc29yOiBwb2ludGVyOyBcbiAgICAgICAgICBmb250LXNpemU6IDEycHg7IFxuICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7IFxuICAgICAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICAgICAgICBib3gtc2hhZG93OiAwIDRweCAxMnB4IHJnYmEoMTYsIDE4NSwgMTI5LCAwLjMpO1xuICAgICAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgICAgICAgcG9pbnRlci1ldmVudHM6IGF1dG87XG4gICAgICAgIFwiPisgQWRkPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4tbWVudVwiIHRpdGxlPVwiTWVudVwiIHN0eWxlPVwiXG4gICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpOyBcbiAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7IFxuICAgICAgICAgIHBhZGRpbmc6IDhweDsgXG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogOHB4OyBcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IFxuICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDsgXG4gICAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7IFxuICAgICAgICAgIGNvbG9yOiAjNjQ3NDhiO1xuICAgICAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgICAgICAgd2lkdGg6IDMycHg7XG4gICAgICAgICAgaGVpZ2h0OiAzMnB4O1xuICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgICAgICAgXCI+4omhPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4taGlkZVwiIHRpdGxlPVwiSGlkZVwiIHN0eWxlPVwiXG4gICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpOyBcbiAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7IFxuICAgICAgICAgIHBhZGRpbmc6IDhweDsgXG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogOHB4OyBcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IFxuICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDsgXG4gICAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7IFxuICAgICAgICAgIGNvbG9yOiAjZWY0NDQ0O1xuICAgICAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgICAgICAgd2lkdGg6IDMycHg7XG4gICAgICAgICAgaGVpZ2h0OiAzMnB4O1xuICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgICAgICAgXCI+w5c8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIndpZGdldC1ib2R5XCIgc3R5bGU9XCJcbiAgICAgICAgZGlzcGxheTogbm9uZTsgXG4gICAgICAgIHBhZGRpbmc6IDIwcHg7IFxuICAgICAgICBtYXgtaGVpZ2h0OiA0MDBweDsgXG4gICAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSk7XG4gICAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAgICAgXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJub3Rlcy1saXN0XCIgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyBnYXA6IDEycHg7XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm5vLW5vdGVzXCIgc3R5bGU9XCJcbiAgICAgICAgICAgIGNvbG9yOiAjNjQ3NDhiOyBcbiAgICAgICAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYzsgXG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7IFxuICAgICAgICAgICAgcGFkZGluZzogMzJweCAxNnB4O1xuICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KTtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gICAgICAgICAgICBib3JkZXI6IDFweCBkYXNoZWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpO1xuICAgICAgICAgIFwiPlxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTogMjRweDsgbWFyZ2luLWJvdHRvbTogOHB4O1wiPvCfk508L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJmb250LXNpemU6IDEzcHg7IGNvbG9yOiAjOTRhM2I4O1wiPk5vIG5vdGVzIHlldDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTogMTJweDsgY29sb3I6ICM5NGEzYjg7IG1hcmdpbi10b3A6IDRweDtcIj5DbGljayArIEFkZCB0byBjcmVhdGUgeW91ciBmaXJzdCBub3RlPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG5cbiAgLy8gQWRkIHN0eWxlcyAoc3RpbGwgdXNlZnVsIGZvciBob3ZlciBlZmZlY3RzKVxuICBhZGRXaWRnZXRTdHlsZXMoKTtcblxuICAvLyBNYWtlIHdpZGdldCBkcmFnZ2FibGVcbiAgbWFrZURyYWdnYWJsZSh3aWRnZXQpO1xuXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnNcbiAgYWRkV2lkZ2V0RXZlbnRMaXN0ZW5lcnMod2lkZ2V0KTtcblxuICAvLyBJbnNlcnQgd2lkZ2V0IGludG8gcGFnZVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHdpZGdldCk7XG5cbiAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IFdpZGdldCBjcmVhdGVkIHN1Y2Nlc3NmdWxseSBhbmQgYWRkZWQgdG8gRE9NXCIpO1xuXG4gIC8vIEZvcmNlIHZpc2liaWxpdHlcbiAgd2lkZ2V0LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gIHdpZGdldC5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG5cbiAgLy8gVmVyaWZ5IHdpZGdldCBpcyBpbiBET01cbiAgY29uc3QgdmVyaWZ5V2lkZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGlja3ktbm90ZS13aWRnZXRcIik7XG4gIGlmICh2ZXJpZnlXaWRnZXQpIHtcbiAgICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogV2lkZ2V0IHZlcmlmaWNhdGlvbiBzdWNjZXNzZnVsXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiV2lkZ2V0IHBvc2l0aW9uOlwiLCB2ZXJpZnlXaWRnZXQuc3R5bGUudG9wLCB2ZXJpZnlXaWRnZXQuc3R5bGUucmlnaHQpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJTdGlja3lOb3RlQUk6IFdpZGdldCB2ZXJpZmljYXRpb24gZmFpbGVkIVwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRXaWRnZXRTdHlsZXMoKSB7XG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0aWNreS1ub3RlLXN0eWxlc1wiKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHN0eWxlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgc3R5bGVzLmlkID0gXCJzdGlja3ktbm90ZS1zdHlsZXNcIjtcbiAgc3R5bGVzLnRleHRDb250ZW50ID0gYFxuICAgIEBpbXBvcnQgdXJsKCdodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PUludGVyOndnaHRANDAwOzUwMDs2MDAmZGlzcGxheT1zd2FwJyk7XG4gICAgXG4gICAgI3N0aWNreS1ub3RlLXdpZGdldCB7XG4gICAgICBmb250LWZhbWlseTogJ0ludGVyJywgLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWYgIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAvKiBQcmV2ZW50IHRleHQgc2VsZWN0aW9uIG9uIGVudGlyZSB3aWRnZXQgKi9cbiAgICAjc3RpY2t5LW5vdGUtd2lkZ2V0ICoge1xuICAgICAgdXNlci1zZWxlY3Q6IG5vbmUgIWltcG9ydGFudDtcbiAgICAgIC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmUgIWltcG9ydGFudDtcbiAgICAgIC1tb3otdXNlci1zZWxlY3Q6IG5vbmUgIWltcG9ydGFudDtcbiAgICAgIC1tcy11c2VyLXNlbGVjdDogbm9uZSAhaW1wb3J0YW50O1xuICAgIH1cblxuICAgIC8qIEhvdmVyIGVmZmVjdCBmb3IgY2lyY2xlIHdpZGdldCAqL1xuICAgICNzdGlja3ktbm90ZS13aWRnZXQ6aG92ZXIge1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjEpICFpbXBvcnRhbnQ7XG4gICAgICBib3gtc2hhZG93OiAwIDEycHggNDBweCByZ2JhKDAsIDAsIDAsIDAuMykgIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAvKiBTaG93IGV4cGFuZGVkIHdpZGdldCBvbiBob3ZlciAqL1xuICAgICNzdGlja3ktbm90ZS13aWRnZXQ6aG92ZXIgLndpZGdldC1leHBhbmRlZCB7XG4gICAgICBvcGFjaXR5OiAxICFpbXBvcnRhbnQ7XG4gICAgICB2aXNpYmlsaXR5OiB2aXNpYmxlICFpbXBvcnRhbnQ7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCkgIWltcG9ydGFudDtcbiAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvICFpbXBvcnRhbnQ7XG4gICAgfVxuXG4gICAgLyogRHJhZ2dpbmcgc3RhdGUgKi9cbiAgICAjc3RpY2t5LW5vdGUtd2lkZ2V0LmRyYWdnaW5nIHtcbiAgICAgIHRyYW5zaXRpb246IG5vbmUgIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAjc3RpY2t5LW5vdGUtd2lkZ2V0LmRyYWdnaW5nIC53aWRnZXQtZXhwYW5kZWQge1xuICAgICAgb3BhY2l0eTogMCAhaW1wb3J0YW50O1xuICAgICAgdmlzaWJpbGl0eTogaGlkZGVuICFpbXBvcnRhbnQ7XG4gICAgICBwb2ludGVyLWV2ZW50czogbm9uZSAhaW1wb3J0YW50O1xuICAgIH1cblxuICAgIC8qIEJ1dHRvbiBob3ZlciBlZmZlY3RzICovXG4gICAgI3N0aWNreS1ub3RlLXdpZGdldCAuYnRuLWFkZDpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMDU5NjY5LCAjMDQ3ODU3KSAhaW1wb3J0YW50O1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpICFpbXBvcnRhbnQ7XG4gICAgICBib3gtc2hhZG93OiAwIDZweCAyMHB4IHJnYmEoMTYsIDE4NSwgMTI5LCAwLjQpICFpbXBvcnRhbnQ7XG4gICAgfVxuXG4gICAgI3N0aWNreS1ub3RlLXdpZGdldCAuYnRuLW1lbnU6aG92ZXIsXG4gICAgI3N0aWNreS1ub3RlLXdpZGdldCAuYnRuLWhpZGU6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpICFpbXBvcnRhbnQ7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCkgIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAjc3RpY2t5LW5vdGUtd2lkZ2V0IC5ub3RlLWl0ZW0ge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpICFpbXBvcnRhbnQ7XG4gICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCkgIWltcG9ydGFudDtcbiAgICAgIHBhZGRpbmc6IDE2cHggIWltcG9ydGFudDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEycHggIWltcG9ydGFudDtcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKSAhaW1wb3J0YW50O1xuICAgICAgY3Vyc29yOiBwb2ludGVyICFpbXBvcnRhbnQ7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpICFpbXBvcnRhbnQ7XG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmUgIWltcG9ydGFudDtcbiAgICAgIG92ZXJmbG93OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAjc3RpY2t5LW5vdGUtd2lkZ2V0IC5ub3RlLWl0ZW06YmVmb3JlIHtcbiAgICAgIGNvbnRlbnQ6ICcnICFpbXBvcnRhbnQ7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGUgIWltcG9ydGFudDtcbiAgICAgIHRvcDogMCAhaW1wb3J0YW50O1xuICAgICAgbGVmdDogMCAhaW1wb3J0YW50O1xuICAgICAgcmlnaHQ6IDAgIWltcG9ydGFudDtcbiAgICAgIGhlaWdodDogM3B4ICFpbXBvcnRhbnQ7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoOTBkZWcsICM2MzY2ZjEsICM4YjVjZjYsICNlYzQ4OTkpICFpbXBvcnRhbnQ7XG4gICAgICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7XG4gICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgZWFzZSAhaW1wb3J0YW50O1xuICAgIH1cblxuICAgICNzdGlja3ktbm90ZS13aWRnZXQgLm5vdGUtaXRlbTpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTUpICFpbXBvcnRhbnQ7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTJweCkgc2NhbGUoMS4wMikgIWltcG9ydGFudDtcbiAgICAgIGJveC1zaGFkb3c6IDAgOHB4IDI1cHggcmdiYSgwLCAwLCAwLCAwLjEpICFpbXBvcnRhbnQ7XG4gICAgfVxuXG4gICAgI3N0aWNreS1ub3RlLXdpZGdldCAubm90ZS1pdGVtOmhvdmVyOmJlZm9yZSB7XG4gICAgICBvcGFjaXR5OiAxICFpbXBvcnRhbnQ7XG4gICAgfVxuXG4gICAgI3N0aWNreS1ub3RlLXdpZGdldCAubm90ZS10aXRsZSB7XG4gICAgICBmb250LXdlaWdodDogNjAwICFpbXBvcnRhbnQ7XG4gICAgICBtYXJnaW4tYm90dG9tOiA4cHggIWltcG9ydGFudDtcbiAgICAgIGNvbG9yOiAjMWUyOTNiICFpbXBvcnRhbnQ7XG4gICAgICBmb250LXNpemU6IDE0cHggIWltcG9ydGFudDtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjQgIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAjc3RpY2t5LW5vdGUtd2lkZ2V0IC5ub3RlLXByZXZpZXcge1xuICAgICAgY29sb3I6ICM2NDc0OGIgIWltcG9ydGFudDtcbiAgICAgIGZvbnQtc2l6ZTogMTJweCAhaW1wb3J0YW50O1xuICAgICAgbGluZS1oZWlnaHQ6IDEuNSAhaW1wb3J0YW50O1xuICAgICAgb3ZlcmZsb3c6IGhpZGRlbiAhaW1wb3J0YW50O1xuICAgICAgZGlzcGxheTogLXdlYmtpdC1ib3ggIWltcG9ydGFudDtcbiAgICAgIC13ZWJraXQtbGluZS1jbGFtcDogMiAhaW1wb3J0YW50O1xuICAgICAgLXdlYmtpdC1ib3gtb3JpZW50OiB2ZXJ0aWNhbCAhaW1wb3J0YW50O1xuICAgIH1cblxuICAgICNzdGlja3ktbm90ZS13aWRnZXQgLm5vdGUtbWV0YSB7XG4gICAgICBtYXJnaW4tdG9wOiA4cHggIWltcG9ydGFudDtcbiAgICAgIGZvbnQtc2l6ZTogMTBweCAhaW1wb3J0YW50O1xuICAgICAgY29sb3I6ICM5NGEzYjggIWltcG9ydGFudDtcbiAgICAgIGRpc3BsYXk6IGZsZXggIWltcG9ydGFudDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXIgIWltcG9ydGFudDtcbiAgICAgIGdhcDogNHB4ICFpbXBvcnRhbnQ7XG4gICAgfVxuXG4gICAgI3N0aWNreS1ub3RlLXdpZGdldCAubm90ZS1tZXRhOmJlZm9yZSB7XG4gICAgICBjb250ZW50OiAn8J+ThScgIWltcG9ydGFudDtcbiAgICAgIGZvbnQtc2l6ZTogOHB4ICFpbXBvcnRhbnQ7XG4gICAgfVxuXG4gICAgLyogU3RlYWx0aCBtb2RlIC0gdWx0cmEgbWluaW1hbCAqL1xuICAgICNzdGlja3ktbm90ZS13aWRnZXQuc3RlYWx0aCB7XG4gICAgICBvcGFjaXR5OiAwLjMgIWltcG9ydGFudDtcbiAgICAgIHRyYW5zZm9ybTogc2NhbGUoMC45KSAhaW1wb3J0YW50O1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZSAhaW1wb3J0YW50O1xuICAgIH1cblxuICAgICNzdGlja3ktbm90ZS13aWRnZXQuc3RlYWx0aDpob3ZlciB7XG4gICAgICBvcGFjaXR5OiAxICFpbXBvcnRhbnQ7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMSkgIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAvKiBBbmltYXRpb25zICovXG4gICAgQGtleWZyYW1lcyBub3RlU2xpZGVJbiB7XG4gICAgICBmcm9tIHtcbiAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDIwcHgpO1xuICAgICAgfVxuICAgICAgdG8ge1xuICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgI3N0aWNreS1ub3RlLXdpZGdldCAubm90ZS1pdGVtIHtcbiAgICAgIGFuaW1hdGlvbjogbm90ZVNsaWRlSW4gMC4zcyBlYXNlLW91dCAhaW1wb3J0YW50O1xuICAgIH1cblxuICAgIC8qIFNjcm9sbGJhciBzdHlsaW5nICovXG4gICAgI3N0aWNreS1ub3RlLXdpZGdldCAud2lkZ2V0LWJvZHk6Oi13ZWJraXQtc2Nyb2xsYmFyIHtcbiAgICAgIHdpZHRoOiA0cHggIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAjc3RpY2t5LW5vdGUtd2lkZ2V0IC53aWRnZXQtYm9keTo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2sge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpICFpbXBvcnRhbnQ7XG4gICAgICBib3JkZXItcmFkaXVzOiAycHggIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAjc3RpY2t5LW5vdGUtd2lkZ2V0IC53aWRnZXQtYm9keTo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWIge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpICFpbXBvcnRhbnQ7XG4gICAgICBib3JkZXItcmFkaXVzOiAycHggIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAjc3RpY2t5LW5vdGUtd2lkZ2V0IC53aWRnZXQtYm9keTo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWI6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjUpICFpbXBvcnRhbnQ7XG4gICAgfVxuXG4gICAgLyogRW5zdXJlIHNtb290aCBkcmFnZ2luZyAqL1xuICAgICNzdGlja3ktbm90ZS13aWRnZXQuZHJhZ2dpbmcgKiB7XG4gICAgICBwb2ludGVyLWV2ZW50czogbm9uZSAhaW1wb3J0YW50O1xuICAgIH1cbiAgYDtcblxuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlcyk7XG59XG5cbmZ1bmN0aW9uIG1ha2VEcmFnZ2FibGUoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgbGV0IGlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgbGV0IGN1cnJlbnRYID0gMDtcbiAgbGV0IGN1cnJlbnRZID0gMDtcbiAgbGV0IGluaXRpYWxYID0gMDtcbiAgbGV0IGluaXRpYWxZID0gMDtcbiAgbGV0IGRyYWdTdGFydFRpbWUgPSAwO1xuXG4gIGNvbnN0IGNpcmNsZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aWRnZXQtY2lyY2xlXCIpIGFzIEhUTUxFbGVtZW50O1xuXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgZm9yIGJldHRlciBkcmFnIGhhbmRsaW5nXG4gIGNpcmNsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGRyYWdTdGFydCk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgZHJhZyk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGRyYWdFbmQpO1xuXG4gIC8vIFByZXZlbnQgY29udGV4dCBtZW51IG9uIHJpZ2h0IGNsaWNrIHdoaWxlIGRyYWdnaW5nXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsIChlKSA9PiB7XG4gICAgaWYgKGlzRHJhZ2dpbmcpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFByZXZlbnQgdGV4dCBzZWxlY3Rpb24gZHVyaW5nIGRyYWdcbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwic2VsZWN0c3RhcnRcIiwgKGUpID0+IHtcbiAgICBpZiAoaXNEcmFnZ2luZykge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gZHJhZ1N0YXJ0KGU6IE1vdXNlRXZlbnQpIHtcbiAgICAvLyBPbmx5IHN0YXJ0IGRyYWdnaW5nIG9uIGxlZnQgbW91c2UgYnV0dG9uXG4gICAgaWYgKGUuYnV0dG9uICE9PSAwKSByZXR1cm47XG5cbiAgICBkcmFnU3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuICAgIC8vIFByZXZlbnQgZGVmYXVsdCB0byBhdm9pZCB0ZXh0IHNlbGVjdGlvblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGluaXRpYWxYID0gZS5jbGllbnRYIC0gY3VycmVudFg7XG4gICAgaW5pdGlhbFkgPSBlLmNsaWVudFkgLSBjdXJyZW50WTtcblxuICAgIGlzRHJhZ2dpbmcgPSB0cnVlO1xuXG4gICAgLy8gQWRkIGRyYWdnaW5nIGNsYXNzIHRvIGRpc2FibGUgdHJhbnNpdGlvbnMgYW5kIGhpZGUgZXhwYW5kZWQgd2lkZ2V0XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHJhZ2dpbmdcIik7XG5cbiAgICAvLyBDaGFuZ2UgY3Vyc29yXG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBcImdyYWJiaW5nXCI7XG5cbiAgICAvLyBEaXNhYmxlIHRleHQgc2VsZWN0aW9uIG9uIGVudGlyZSBkb2N1bWVudFxuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUudXNlclNlbGVjdCA9IFwibm9uZVwiO1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUud2Via2l0VXNlclNlbGVjdCA9IFwibm9uZVwiO1xuICB9XG5cbiAgZnVuY3Rpb24gZHJhZyhlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKGlzRHJhZ2dpbmcpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgY3VycmVudFggPSBlLmNsaWVudFggLSBpbml0aWFsWDtcbiAgICAgIGN1cnJlbnRZID0gZS5jbGllbnRZIC0gaW5pdGlhbFk7XG5cbiAgICAgIC8vIEtlZXAgd2lkZ2V0IHdpdGhpbiB2aWV3cG9ydCB3aXRoIHNvbWUgcGFkZGluZ1xuICAgICAgY29uc3QgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBjb25zdCBwYWRkaW5nID0gMTA7XG4gICAgICBjb25zdCBtYXhYID0gd2luZG93LmlubmVyV2lkdGggLSByZWN0LndpZHRoIC0gcGFkZGluZztcbiAgICAgIGNvbnN0IG1heFkgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSByZWN0LmhlaWdodCAtIHBhZGRpbmc7XG5cbiAgICAgIGN1cnJlbnRYID0gTWF0aC5tYXgocGFkZGluZywgTWF0aC5taW4oY3VycmVudFgsIG1heFgpKTtcbiAgICAgIGN1cnJlbnRZID0gTWF0aC5tYXgocGFkZGluZywgTWF0aC5taW4oY3VycmVudFksIG1heFkpKTtcblxuICAgICAgLy8gVXNlIHRyYW5zZm9ybSBmb3Igc21vb3RoZXIgbW92ZW1lbnRcbiAgICAgIGVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke2N1cnJlbnRYfXB4LCAke2N1cnJlbnRZfXB4KWA7XG4gICAgICBlbGVtZW50LnN0eWxlLmxlZnQgPSBcIjBcIjtcbiAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gXCIwXCI7XG4gICAgICBlbGVtZW50LnN0eWxlLnJpZ2h0ID0gXCJhdXRvXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZHJhZ0VuZChlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKCFpc0RyYWdnaW5nKSByZXR1cm47XG5cbiAgICBpc0RyYWdnaW5nID0gZmFsc2U7XG5cbiAgICAvLyBSZW1vdmUgZHJhZ2dpbmcgY2xhc3NcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnZ2luZ1wiKTtcblxuICAgIC8vIFJlc2V0IGN1cnNvclxuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gXCJcIjtcblxuICAgIC8vIFJlLWVuYWJsZSB0ZXh0IHNlbGVjdGlvblxuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUudXNlclNlbGVjdCA9IFwiXCI7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS53ZWJraXRVc2VyU2VsZWN0ID0gXCJcIjtcblxuICAgIC8vIENvbnZlcnQgdHJhbnNmb3JtIHRvIHBvc2l0aW9uIGZvciBwZXJzaXN0ZW5jZVxuICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IGN1cnJlbnRYICsgXCJweFwiO1xuICAgIGVsZW1lbnQuc3R5bGUudG9wID0gY3VycmVudFkgKyBcInB4XCI7XG4gICAgZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiO1xuXG4gICAgLy8gU2F2ZSBwb3NpdGlvbiB0byBzdG9yYWdlXG4gICAgc2F2ZVdpZGdldFBvc2l0aW9uKGN1cnJlbnRYLCBjdXJyZW50WSk7XG5cbiAgICAvLyBDaGVjayBpZiB0aGlzIHdhcyBhIGNsaWNrIHZzIGRyYWdcbiAgICBjb25zdCBkcmFnRHVyYXRpb24gPSBEYXRlLm5vdygpIC0gZHJhZ1N0YXJ0VGltZTtcbiAgICBpZiAoZHJhZ0R1cmF0aW9uIDwgMjAwKSB7XG4gICAgICAvLyBUaGlzIHdhcyBsaWtlbHkgYSBjbGljaywgbm90IGEgZHJhZ1xuICAgICAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQoTWF0aC5wb3coZS5jbGllbnRYIC0gKGluaXRpYWxYICsgY3VycmVudFgpLCAyKSArIE1hdGgucG93KGUuY2xpZW50WSAtIChpbml0aWFsWSArIGN1cnJlbnRZKSwgMikpO1xuXG4gICAgICBpZiAoZGlzdGFuY2UgPCA1KSB7XG4gICAgICAgIC8vIEhhbmRsZSBjbGljayBvbiBjaXJjbGUgKGNvdWxkIGV4cGFuZCBvciBzaG93IHF1aWNrIG1lbnUpXG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2lyY2xlIGNsaWNrZWRcIik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVG91Y2ggZXZlbnRzIGZvciBtb2JpbGUgc3VwcG9ydFxuICBjaXJjbGUuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIiwgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgdG91Y2ggPSBlLnRvdWNoZXNbMF07XG4gICAgY29uc3QgbW91c2VFdmVudCA9IG5ldyBNb3VzZUV2ZW50KFwibW91c2Vkb3duXCIsIHtcbiAgICAgIGNsaWVudFg6IHRvdWNoLmNsaWVudFgsXG4gICAgICBjbGllbnRZOiB0b3VjaC5jbGllbnRZLFxuICAgICAgYnV0dG9uOiAwLFxuICAgIH0pO1xuICAgIGRyYWdTdGFydChtb3VzZUV2ZW50KTtcbiAgfSk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCAoZSkgPT4ge1xuICAgIGlmIChpc0RyYWdnaW5nKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zdCB0b3VjaCA9IGUudG91Y2hlc1swXTtcbiAgICAgIGNvbnN0IG1vdXNlRXZlbnQgPSBuZXcgTW91c2VFdmVudChcIm1vdXNlbW92ZVwiLCB7XG4gICAgICAgIGNsaWVudFg6IHRvdWNoLmNsaWVudFgsXG4gICAgICAgIGNsaWVudFk6IHRvdWNoLmNsaWVudFksXG4gICAgICB9KTtcbiAgICAgIGRyYWcobW91c2VFdmVudCk7XG4gICAgfVxuICB9KTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgKGUpID0+IHtcbiAgICBpZiAoaXNEcmFnZ2luZykge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc3QgbW91c2VFdmVudCA9IG5ldyBNb3VzZUV2ZW50KFwibW91c2V1cFwiLCB7XG4gICAgICAgIGNsaWVudFg6IDAsXG4gICAgICAgIGNsaWVudFk6IDAsXG4gICAgICB9KTtcbiAgICAgIGRyYWdFbmQobW91c2VFdmVudCk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkV2lkZ2V0RXZlbnRMaXN0ZW5lcnMod2lkZ2V0OiBIVE1MRWxlbWVudCkge1xuICBjb25zdCBhZGRCdG4gPSB3aWRnZXQucXVlcnlTZWxlY3RvcihcIi5idG4tYWRkXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICBjb25zdCBtZW51QnRuID0gd2lkZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIuYnRuLW1lbnVcIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gIGNvbnN0IGhpZGVCdG4gPSB3aWRnZXQucXVlcnlTZWxlY3RvcihcIi5idG4taGlkZVwiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgY29uc3Qgd2lkZ2V0Qm9keSA9IHdpZGdldC5xdWVyeVNlbGVjdG9yKFwiLndpZGdldC1ib2R5XCIpIGFzIEhUTUxFbGVtZW50O1xuICBjb25zdCBleHBhbmRlZFdpZGdldCA9IHdpZGdldC5xdWVyeVNlbGVjdG9yKFwiLndpZGdldC1leHBhbmRlZFwiKSBhcyBIVE1MRWxlbWVudDtcblxuICAvLyBBZGQgbm90ZSBidXR0b25cbiAgYWRkQnRuPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjcmVhdGVOb3RlRWRpdG9yKCk7XG4gIH0pO1xuXG4gIC8vIE1lbnUgYnV0dG9uICh0b2dnbGUgd2lkZ2V0IGJvZHkpXG4gIG1lbnVCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IGlzVmlzaWJsZSA9IHdpZGdldEJvZHkuc3R5bGUuZGlzcGxheSAhPT0gXCJub25lXCI7XG4gICAgd2lkZ2V0Qm9keS5zdHlsZS5kaXNwbGF5ID0gaXNWaXNpYmxlID8gXCJub25lXCIgOiBcImJsb2NrXCI7XG4gICAgbWVudUJ0bi50ZXh0Q29udGVudCA9IGlzVmlzaWJsZSA/IFwi4omhXCIgOiBcIsOXXCI7XG4gIH0pO1xuXG4gIC8vIEhpZGUgYnV0dG9uIC0gbm93IGhpZGVzIHRoZSBlbnRpcmUgd2lkZ2V0XG4gIGhpZGVCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHdpZGdldC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gIH0pO1xuXG4gIC8vIEtlZXAgZXhwYW5kZWQgd2lkZ2V0IHZpc2libGUgd2hlbiBob3ZlcmluZyBvdmVyIGl0XG4gIGV4cGFuZGVkV2lkZ2V0Py5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgZXhwYW5kZWRXaWRnZXQuc3R5bGUub3BhY2l0eSA9IFwiMVwiO1xuICAgIGV4cGFuZGVkV2lkZ2V0LnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICBleHBhbmRlZFdpZGdldC5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZVgoMClcIjtcbiAgICBleHBhbmRlZFdpZGdldC5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJhdXRvXCI7XG4gIH0pO1xuXG4gIC8vIEFkZCBzbGlnaHQgZGVsYXkgYmVmb3JlIGhpZGluZyB0byBwcmV2ZW50IGZsaWNrZXJpbmdcbiAgbGV0IGhpZGVUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xuXG4gIHdpZGdldC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgaGlkZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICghd2lkZ2V0Lm1hdGNoZXMoXCI6aG92ZXJcIikpIHtcbiAgICAgICAgY29uc3QgZXhwYW5kZWQgPSB3aWRnZXQucXVlcnlTZWxlY3RvcihcIi53aWRnZXQtZXhwYW5kZWRcIikgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgICAgIGV4cGFuZGVkLnN0eWxlLm9wYWNpdHkgPSBcIjBcIjtcbiAgICAgICAgICBleHBhbmRlZC5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgICBleHBhbmRlZC5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZVgoMjBweClcIjtcbiAgICAgICAgICBleHBhbmRlZC5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCAxMDApO1xuICB9KTtcblxuICB3aWRnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGlmIChoaWRlVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KGhpZGVUaW1lb3V0KTtcbiAgICAgIGhpZGVUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIERvdWJsZS1jbGljayB0byBoaWRlIHdpZGdldCBjb21wbGV0ZWx5XG4gIHdpZGdldC5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgd2lkZ2V0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgfSk7XG5cbiAgLy8gS2V5Ym9hcmQgc2hvcnRjdXRzIChNYWMtY29tcGF0aWJsZSlcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHtcbiAgICBjb25zdCBpc01hYyA9IG5hdmlnYXRvci5wbGF0Zm9ybS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoXCJNQUNcIikgPj0gMDtcbiAgICBjb25zdCBjbWRPckN0cmwgPSBpc01hYyA/IGUubWV0YUtleSA6IGUuY3RybEtleTtcblxuICAgIGlmIChjbWRPckN0cmwgJiYgZS5zaGlmdEtleSAmJiBlLmtleSA9PT0gXCJXXCIpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHdpZGdldC5zdHlsZS5kaXNwbGF5ID0gd2lkZ2V0LnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiID8gXCJibG9ja1wiIDogXCJub25lXCI7XG4gICAgfVxuICAgIGlmIChjbWRPckN0cmwgJiYgZS5zaGlmdEtleSAmJiBlLmtleSA9PT0gXCJTXCIpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNyZWF0ZU5vdGVFZGl0b3IoKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVOb3RlRWRpdG9yKCkge1xuICAvLyBDaGVjayBpZiBlZGl0b3IgYWxyZWFkeSBleGlzdHNcbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm90ZS1lZGl0b3ItbW9kYWxcIikpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG1vZGFsLmlkID0gXCJub3RlLWVkaXRvci1tb2RhbFwiO1xuICBtb2RhbC5pbm5lckhUTUwgPSBgXG4gICAgPGRpdiBjbGFzcz1cIm1vZGFsLWJhY2tkcm9wXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XG4gICAgICAgICAgPGgzPkNyZWF0ZSBOb3RlPC9oMz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYXV0by1zYXZlLWluZGljYXRvclwiPkRyYWZ0IHNhdmVkPC9kaXY+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsLWNsb3NlXCI+w5c8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJHaXZlIHlvdXIgbm90ZSBhIHRpdGxlLi4uXCIgY2xhc3M9XCJub3RlLXRpdGxlLWlucHV0XCI+XG4gICAgICAgICAgPHRleHRhcmVhIHBsYWNlaG9sZGVyPVwiU3RhcnQgd3JpdGluZyB5b3VyIHRob3VnaHRzIGhlcmUuLi5cblxu8J+SoSBUaXBzOlxu4oCiIFVzZSBtYXJrZG93biBmb3IgZm9ybWF0dGluZ1xu4oCiIE5vdGVzIGF1dG8tc2F2ZSBhcyB5b3UgdHlwZVxu4oCiIFByZXNzIEVzYyB0byBjbG9zZSBxdWlja2x5XCIgY2xhc3M9XCJub3RlLWNvbnRlbnQtaW5wdXRcIj48L3RleHRhcmVhPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1hY3Rpb25zXCI+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLWNhbmNlbFwiPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1zYXZlXCI+U2F2ZSBOb3RlPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG5cbiAgLy8gQWRkIG1vZGFsIHN0eWxlc1xuICBhZGRNb2RhbFN0eWxlcygpO1xuXG4gIC8vIEFkZCBldmVudCBsaXN0ZW5lcnNcbiAgYWRkTW9kYWxFdmVudExpc3RlbmVycyhtb2RhbCk7XG5cbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtb2RhbCk7XG5cbiAgLy8gRm9jdXMgb24gdGl0bGUgaW5wdXRcbiAgY29uc3QgdGl0bGVJbnB1dCA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIubm90ZS10aXRsZS1pbnB1dFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICB0aXRsZUlucHV0LmZvY3VzKCk7XG59XG5cbmZ1bmN0aW9uIGFkZE1vZGFsU3R5bGVzKCkge1xuICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJub3RlLW1vZGFsLXN0eWxlc1wiKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHN0eWxlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgc3R5bGVzLmlkID0gXCJub3RlLW1vZGFsLXN0eWxlc1wiO1xuICBzdHlsZXMudGV4dENvbnRlbnQgPSBgXG4gICAgI25vdGUtZWRpdG9yLW1vZGFsIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIGxlZnQ6IDA7XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgIHotaW5kZXg6IDk5OTk5OTk7XG4gICAgICBhbmltYXRpb246IG1vZGFsRmFkZUluIDAuM3MgZWFzZS1vdXQ7XG4gICAgfVxuXG4gICAgQGtleWZyYW1lcyBtb2RhbEZhZGVJbiB7XG4gICAgICBmcm9tIHtcbiAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgIH1cbiAgICAgIHRvIHtcbiAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBAa2V5ZnJhbWVzIG1vZGFsU2xpZGVJbiB7XG4gICAgICBmcm9tIHtcbiAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDIwcHgpIHNjYWxlKDAuOTUpO1xuICAgICAgfVxuICAgICAgdG8ge1xuICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCkgc2NhbGUoMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLm1vZGFsLWJhY2tkcm9wIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC42KTtcbiAgICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cig4cHgpO1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgcGFkZGluZzogMjBweDtcbiAgICB9XG5cbiAgICAubW9kYWwtY29udGVudCB7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTQ1ZGVnLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOTUpLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOSkpO1xuICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDIwcHgpO1xuICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xuICAgICAgYm9yZGVyLXJhZGl1czogMjBweDtcbiAgICAgIGJveC1zaGFkb3c6IDAgMjVweCA1MHB4IHJnYmEoMCwgMCwgMCwgMC4xNSk7XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIG1heC13aWR0aDogNTIwcHg7XG4gICAgICBtYXgtaGVpZ2h0OiA5MHZoO1xuICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgIGFuaW1hdGlvbjogbW9kYWxTbGlkZUluIDAuM3MgZWFzZS1vdXQ7XG4gICAgfVxuXG4gICAgLm1vZGFsLWhlYWRlciB7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDk5LCAxMDIsIDI0MSwgMC4xKSwgcmdiYSgxNjgsIDg1LCAyNDcsIDAuMSkpO1xuICAgICAgcGFkZGluZzogMjRweCAyOHB4O1xuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgIH1cblxuICAgIC5tb2RhbC1oZWFkZXIgaDMge1xuICAgICAgbWFyZ2luOiAwO1xuICAgICAgZm9udC1zaXplOiAyMHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgIGNvbG9yOiAjMWUyOTNiO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBnYXA6IDEycHg7XG4gICAgfVxuXG4gICAgLm1vZGFsLWhlYWRlciBoMzpiZWZvcmUge1xuICAgICAgY29udGVudDogJ+KcqCc7XG4gICAgICBmb250LXNpemU6IDE4cHg7XG4gICAgICBmaWx0ZXI6IGRyb3Atc2hhZG93KDAgMCA4cHggcmdiYSg5OSwgMTAyLCAyNDEsIDAuMykpO1xuICAgIH1cblxuICAgIC5tb2RhbC1jbG9zZSB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7XG4gICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XG4gICAgICBmb250LXNpemU6IDIwcHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBjb2xvcjogIzY0NzQ4YjtcbiAgICAgIHBhZGRpbmc6IDA7XG4gICAgICB3aWR0aDogNDBweDtcbiAgICAgIGhlaWdodDogNDBweDtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgICB9XG5cbiAgICAubW9kYWwtY2xvc2U6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyMzksIDY4LCA2OCwgMC4xKTtcbiAgICAgIGJvcmRlci1jb2xvcjogcmdiYSgyMzksIDY4LCA2OCwgMC4zKTtcbiAgICAgIGNvbG9yOiAjZWY0NDQ0O1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjA1KTtcbiAgICB9XG5cbiAgICAubW9kYWwtYm9keSB7XG4gICAgICBwYWRkaW5nOiAyOHB4O1xuICAgIH1cblxuICAgIC5ub3RlLXRpdGxlLWlucHV0IHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgcGFkZGluZzogMTZweCAyMHB4O1xuICAgICAgYm9yZGVyOiAycHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xuICAgICAgYm9yZGVyLXJhZGl1czogMTJweDtcbiAgICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICBtYXJnaW4tYm90dG9tOiAxNnB4O1xuICAgICAgZm9udC1mYW1pbHk6ICdJbnRlcicsIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjUpO1xuICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEwcHgpO1xuICAgICAgY29sb3I6ICMxZTI5M2I7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICAgICAgb3V0bGluZTogbm9uZTtcbiAgICB9XG5cbiAgICAubm90ZS10aXRsZS1pbnB1dDpmb2N1cyB7XG4gICAgICBib3JkZXItY29sb3I6IHJnYmEoOTksIDEwMiwgMjQxLCAwLjUpO1xuICAgICAgYm94LXNoYWRvdzogMCAwIDAgNHB4IHJnYmEoOTksIDEwMiwgMjQxLCAwLjEpO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjgpO1xuICAgIH1cblxuICAgIC5ub3RlLXRpdGxlLWlucHV0OjpwbGFjZWhvbGRlciB7XG4gICAgICBjb2xvcjogIzk0YTNiODtcbiAgICB9XG5cbiAgICAubm90ZS1jb250ZW50LWlucHV0IHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgbWluLWhlaWdodDogMTgwcHg7XG4gICAgICBwYWRkaW5nOiAyMHB4O1xuICAgICAgYm9yZGVyOiAycHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xuICAgICAgYm9yZGVyLXJhZGl1czogMTJweDtcbiAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjY7XG4gICAgICBmb250LWZhbWlseTogJ0ludGVyJywgLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWY7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNSk7XG4gICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCk7XG4gICAgICBjb2xvcjogIzFlMjkzYjtcbiAgICAgIHJlc2l6ZTogdmVydGljYWw7XG4gICAgICBtYXJnaW4tYm90dG9tOiAyNHB4O1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgICAgIG91dGxpbmU6IG5vbmU7XG4gICAgfVxuXG4gICAgLm5vdGUtY29udGVudC1pbnB1dDpmb2N1cyB7XG4gICAgICBib3JkZXItY29sb3I6IHJnYmEoOTksIDEwMiwgMjQxLCAwLjUpO1xuICAgICAgYm94LXNoYWRvdzogMCAwIDAgNHB4IHJnYmEoOTksIDEwMiwgMjQxLCAwLjEpO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjgpO1xuICAgIH1cblxuICAgIC5ub3RlLWNvbnRlbnQtaW5wdXQ6OnBsYWNlaG9sZGVyIHtcbiAgICAgIGNvbG9yOiAjOTRhM2I4O1xuICAgIH1cblxuICAgIC5tb2RhbC1hY3Rpb25zIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBnYXA6IDEycHg7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xuICAgIH1cblxuICAgIC5tb2RhbC1hY3Rpb25zIGJ1dHRvbiB7XG4gICAgICBwYWRkaW5nOiAxMnB4IDI0cHg7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgIGZvbnQtZmFtaWx5OiAnSW50ZXInLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZjtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGdhcDogOHB4O1xuICAgICAgbWluLXdpZHRoOiAxMDBweDtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIH1cblxuICAgIC5idG4tc2F2ZSB7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMTBiOTgxLCAjMDU5NjY5KTtcbiAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICAgIGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgxNiwgMTg1LCAxMjksIDAuMyk7XG4gICAgfVxuXG4gICAgLmJ0bi1zYXZlOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMwNTk2NjksICMwNDc4NTcpO1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpO1xuICAgICAgYm94LXNoYWRvdzogMCA2cHggMjBweCByZ2JhKDE2LCAxODUsIDEyOSwgMC40KTtcbiAgICB9XG5cbiAgICAuYnRuLXNhdmU6YmVmb3JlIHtcbiAgICAgIGNvbnRlbnQ6ICfwn5K+JztcbiAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICB9XG5cbiAgICAuYnRuLWNhbmNlbCB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7XG4gICAgICBjb2xvcjogIzY0NzQ4YjtcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKTtcbiAgICB9XG5cbiAgICAuYnRuLWNhbmNlbDpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XG4gICAgICBib3JkZXItY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC40KTtcbiAgICAgIGNvbG9yOiAjNDc1NTY5O1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpO1xuICAgIH1cblxuICAgIC5idG4tY2FuY2VsOmJlZm9yZSB7XG4gICAgICBjb250ZW50OiAn4pyVJztcbiAgICAgIGZvbnQtc2l6ZTogMTBweDtcbiAgICB9XG5cbiAgICAvKiBBdXRvLXNhdmUgaW5kaWNhdG9yICovXG4gICAgLmF1dG8tc2F2ZS1pbmRpY2F0b3Ige1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgdG9wOiAyNHB4O1xuICAgICAgcmlnaHQ6IDgwcHg7XG4gICAgICBwYWRkaW5nOiA2cHggMTJweDtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMTYsIDE4NSwgMTI5LCAwLjEpO1xuICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgxNiwgMTg1LCAxMjksIDAuMyk7XG4gICAgICBib3JkZXItcmFkaXVzOiAyMHB4O1xuICAgICAgZm9udC1zaXplOiAxMXB4O1xuICAgICAgY29sb3I6ICMwNTk2Njk7XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgICAgb3BhY2l0eTogMDtcbiAgICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBlYXNlO1xuICAgIH1cblxuICAgIC5hdXRvLXNhdmUtaW5kaWNhdG9yLnNob3cge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICB9XG5cbiAgICAuYXV0by1zYXZlLWluZGljYXRvcjpiZWZvcmUge1xuICAgICAgY29udGVudDogJ/Cfkr4nO1xuICAgICAgbWFyZ2luLXJpZ2h0OiA0cHg7XG4gICAgICBmb250LXNpemU6IDEwcHg7XG4gICAgfVxuICBgO1xuXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVzKTtcbn1cblxuZnVuY3Rpb24gYWRkTW9kYWxFdmVudExpc3RlbmVycyhtb2RhbDogSFRNTEVsZW1lbnQpIHtcbiAgY29uc3QgY2xvc2VCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsLWNsb3NlXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICBjb25zdCBzYXZlQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihcIi5idG4tc2F2ZVwiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgY29uc3QgY2FuY2VsQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihcIi5idG4tY2FuY2VsXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICBjb25zdCB0aXRsZUlucHV0ID0gbW9kYWwucXVlcnlTZWxlY3RvcihcIi5ub3RlLXRpdGxlLWlucHV0XCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gIGNvbnN0IGNvbnRlbnRJbnB1dCA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIubm90ZS1jb250ZW50LWlucHV0XCIpIGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQ7XG5cbiAgLy8gQ2xvc2UgbW9kYWxcbiAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IGNsb3NlTW9kYWwobW9kYWwpKTtcbiAgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBjbG9zZU1vZGFsKG1vZGFsKSk7XG5cbiAgLy8gU2F2ZSBub3RlXG4gIHNhdmVCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBjb25zdCB0aXRsZSA9IHRpdGxlSW5wdXQudmFsdWUudHJpbSgpIHx8IFwiVW50aXRsZWQgTm90ZVwiO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBjb250ZW50SW5wdXQudmFsdWUudHJpbSgpO1xuXG4gICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgIHNhdmVOb3RlKHRpdGxlLCBjb250ZW50KTtcbiAgICAgIGNsb3NlTW9kYWwobW9kYWwpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gQ2xvc2Ugb24gYmFja2Ryb3AgY2xpY2tcbiAgbW9kYWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgaWYgKGUudGFyZ2V0ID09PSBtb2RhbC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsLWJhY2tkcm9wXCIpKSB7XG4gICAgICBjbG9zZU1vZGFsKG1vZGFsKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIENsb3NlIG9uIEVzY2FwZSBrZXlcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgIGNsb3NlTW9kYWwobW9kYWwpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gQXV0by1zYXZlIGRyYWZ0IGV2ZXJ5IDIgc2Vjb25kc1xuICBsZXQgYXV0b1NhdmVUaW1lcjogbnVtYmVyO1xuICBjb25zdCBhdXRvU2F2ZSA9ICgpID0+IHtcbiAgICBjbGVhclRpbWVvdXQoYXV0b1NhdmVUaW1lcik7XG4gICAgYXV0b1NhdmVUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVJbnB1dC52YWx1ZS50cmltKCkgfHwgXCJEcmFmdFwiO1xuICAgICAgY29uc3QgY29udGVudCA9IGNvbnRlbnRJbnB1dC52YWx1ZS50cmltKCk7XG4gICAgICBpZiAoY29udGVudCkge1xuICAgICAgICBicm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KHsgXCJzdGlja3ktbm90ZS1kcmFmdFwiOiB7IHRpdGxlLCBjb250ZW50IH0gfSk7XG4gICAgICB9XG4gICAgfSwgMjAwMCk7XG4gIH07XG5cbiAgdGl0bGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgYXV0b1NhdmUpO1xuICBjb250ZW50SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGF1dG9TYXZlKTtcblxuICAvLyBMb2FkIGRyYWZ0IGlmIGV4aXN0c1xuICBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFwic3RpY2t5LW5vdGUtZHJhZnRcIiwgKHJlc3VsdCkgPT4ge1xuICAgIGNvbnN0IGRyYWZ0ID0gcmVzdWx0W1wic3RpY2t5LW5vdGUtZHJhZnRcIl07XG4gICAgaWYgKGRyYWZ0KSB7XG4gICAgICB0aXRsZUlucHV0LnZhbHVlID0gZHJhZnQudGl0bGU7XG4gICAgICBjb250ZW50SW5wdXQudmFsdWUgPSBkcmFmdC5jb250ZW50O1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNsb3NlTW9kYWwobW9kYWw6IEhUTUxFbGVtZW50KSB7XG4gIG1vZGFsLnJlbW92ZSgpO1xuICBicm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKFwic3RpY2t5LW5vdGUtZHJhZnRcIik7XG59XG5cbmZ1bmN0aW9uIGdldFN0b3JlZE5vdGVzKCk6IFByb21pc2U8YW55W10+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChcInN0aWNreS1ub3Rlc1wiLCAocmVzdWx0KSA9PiB7XG4gICAgICByZXNvbHZlKHJlc3VsdFtcInN0aWNreS1ub3Rlc1wiXSB8fCBbXSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzYXZlTm90ZSh0aXRsZTogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpIHtcbiAgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChcInN0aWNreS1ub3Rlc1wiLCAocmVzdWx0KSA9PiB7XG4gICAgY29uc3Qgbm90ZXMgPSByZXN1bHRbXCJzdGlja3ktbm90ZXNcIl0gfHwgW107XG4gICAgY29uc3QgbmV3Tm90ZSA9IHtcbiAgICAgIGlkOiBEYXRlLm5vdygpLnRvU3RyaW5nKCksXG4gICAgICB0aXRsZSxcbiAgICAgIGNvbnRlbnQsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH07XG5cbiAgICBub3Rlcy5wdXNoKG5ld05vdGUpO1xuICAgIGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoeyBcInN0aWNreS1ub3Rlc1wiOiBub3RlcyB9LCAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIk5vdGUgc2F2ZWQ6XCIsIG5ld05vdGUpO1xuICAgICAgLy8gUmVmcmVzaCB0aGUgbm90ZXMgbGlzdCBhZnRlciBzYXZpbmcgaXMgY29tcGxldGVcbiAgICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlZnJlc2hOb3Rlc0xpc3QoKSB7XG4gIGNvbnN0IHdpZGdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RpY2t5LW5vdGUtd2lkZ2V0XCIpO1xuICBpZiAoIXdpZGdldCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJXaWRnZXQgZG9lcyBub3QgZXhpc3QgaW4gdGhlIERPTS5cIik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3Qgbm90ZXNMaXN0ID0gd2lkZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIubm90ZXMtbGlzdFwiKSBhcyBIVE1MRWxlbWVudDtcbiAgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChcInN0aWNreS1ub3Rlc1wiLCAocmVzdWx0KSA9PiB7XG4gICAgY29uc3Qgbm90ZXMgPSByZXN1bHRbXCJzdGlja3ktbm90ZXNcIl0gfHwgW107XG5cbiAgICBpZiAobm90ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBub3Rlc0xpc3QuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJuby1ub3Rlc1wiPk5vIG5vdGVzIHlldC4gQ2xpY2sgKyB0byBhZGQgb25lITwvZGl2Pic7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbm90ZXNMaXN0LmlubmVySFRNTCA9IG5vdGVzXG4gICAgICAubWFwKFxuICAgICAgICAobm90ZTogYW55KSA9PiBgXG4gICAgICA8ZGl2IGNsYXNzPVwibm90ZS1pdGVtXCIgZGF0YS1ub3RlLWlkPVwiJHtub3RlLmlkfVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibm90ZS10aXRsZVwiPiR7bm90ZS50aXRsZX08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5vdGUtcHJldmlld1wiPiR7bm90ZS5jb250ZW50LnN1YnN0cmluZygwLCA1MCl9JHtub3RlLmNvbnRlbnQubGVuZ3RoID4gNTAgPyBcIi4uLlwiIDogXCJcIn08L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGBcbiAgICAgIClcbiAgICAgIC5qb2luKFwiXCIpO1xuXG4gICAgbm90ZXNMaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubm90ZS1pdGVtXCIpLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdGVJZCA9IChlLmN1cnJlbnRUYXJnZXQgYXMgSFRNTEVsZW1lbnQpLmRhdGFzZXQubm90ZUlkO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgbm90ZTpcIiwgbm90ZUlkKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2F2ZVdpZGdldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gIGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgIFwic3RpY2t5LXNldHRpbmdzXCI6IHtcbiAgICAgIHdpZGdldFBvc2l0aW9uOiB7IHgsIHkgfSxcbiAgICB9LFxuICB9KTtcbn1cblxuZnVuY3Rpb24gbG9hZFdpZGdldFBvc2l0aW9uKCkge1xuICB0cnkge1xuICAgIGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoXCJzdGlja3ktc2V0dGluZ3NcIiwgKHJlc3VsdDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkgPT4ge1xuICAgICAgY29uc3Qgc2V0dGluZ3MgPSByZXN1bHRbXCJzdGlja3ktc2V0dGluZ3NcIl07XG4gICAgICBpZiAoc2V0dGluZ3MgJiYgc2V0dGluZ3Mud2lkZ2V0UG9zaXRpb24pIHtcbiAgICAgICAgY29uc3QgeyB4LCB5IH0gPSBzZXR0aW5ncy53aWRnZXRQb3NpdGlvbjtcbiAgICAgICAgY29uc3Qgd2lkZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGlja3ktbm90ZS13aWRnZXRcIik7XG4gICAgICAgIGlmICh3aWRnZXQpIHtcbiAgICAgICAgICB3aWRnZXQuc3R5bGUubGVmdCA9IHggKyBcInB4XCI7XG4gICAgICAgICAgd2lkZ2V0LnN0eWxlLnRvcCA9IHkgKyBcInB4XCI7XG4gICAgICAgICAgd2lkZ2V0LnN0eWxlLnJpZ2h0ID0gXCJhdXRvXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gbG9hZCB3aWRnZXQgcG9zaXRpb246XCIsIGUpO1xuICB9XG59XG4iLCJmdW5jdGlvbiBwcmludChtZXRob2QsIC4uLmFyZ3MpIHtcbiAgaWYgKGltcG9ydC5tZXRhLmVudi5NT0RFID09PSBcInByb2R1Y3Rpb25cIikgcmV0dXJuO1xuICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09IFwic3RyaW5nXCIpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gYXJncy5zaGlmdCgpO1xuICAgIG1ldGhvZChgW3d4dF0gJHttZXNzYWdlfWAsIC4uLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIG1ldGhvZChcIlt3eHRdXCIsIC4uLmFyZ3MpO1xuICB9XG59XG5leHBvcnQgY29uc3QgbG9nZ2VyID0ge1xuICBkZWJ1ZzogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUuZGVidWcsIC4uLmFyZ3MpLFxuICBsb2c6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmxvZywgLi4uYXJncyksXG4gIHdhcm46ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLndhcm4sIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUuZXJyb3IsIC4uLmFyZ3MpXG59O1xuIiwiaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gXCJ3eHQvYnJvd3NlclwiO1xuZXhwb3J0IGNsYXNzIFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gIGNvbnN0cnVjdG9yKG5ld1VybCwgb2xkVXJsKSB7XG4gICAgc3VwZXIoV3h0TG9jYXRpb25DaGFuZ2VFdmVudC5FVkVOVF9OQU1FLCB7fSk7XG4gICAgdGhpcy5uZXdVcmwgPSBuZXdVcmw7XG4gICAgdGhpcy5vbGRVcmwgPSBvbGRVcmw7XG4gIH1cbiAgc3RhdGljIEVWRU5UX05BTUUgPSBnZXRVbmlxdWVFdmVudE5hbWUoXCJ3eHQ6bG9jYXRpb25jaGFuZ2VcIik7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0VW5pcXVlRXZlbnROYW1lKGV2ZW50TmFtZSkge1xuICByZXR1cm4gYCR7YnJvd3Nlcj8ucnVudGltZT8uaWR9OiR7aW1wb3J0Lm1ldGEuZW52LkVOVFJZUE9JTlR9OiR7ZXZlbnROYW1lfWA7XG59XG4iLCJpbXBvcnQgeyBXeHRMb2NhdGlvbkNoYW5nZUV2ZW50IH0gZnJvbSBcIi4vY3VzdG9tLWV2ZW50cy5tanNcIjtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2NhdGlvbldhdGNoZXIoY3R4KSB7XG4gIGxldCBpbnRlcnZhbDtcbiAgbGV0IG9sZFVybDtcbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBFbnN1cmUgdGhlIGxvY2F0aW9uIHdhdGNoZXIgaXMgYWN0aXZlbHkgbG9va2luZyBmb3IgVVJMIGNoYW5nZXMuIElmIGl0J3MgYWxyZWFkeSB3YXRjaGluZyxcbiAgICAgKiB0aGlzIGlzIGEgbm9vcC5cbiAgICAgKi9cbiAgICBydW4oKSB7XG4gICAgICBpZiAoaW50ZXJ2YWwgIT0gbnVsbCkgcmV0dXJuO1xuICAgICAgb2xkVXJsID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcbiAgICAgIGludGVydmFsID0gY3R4LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgbGV0IG5ld1VybCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgICAgIGlmIChuZXdVcmwuaHJlZiAhPT0gb2xkVXJsLmhyZWYpIHtcbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgV3h0TG9jYXRpb25DaGFuZ2VFdmVudChuZXdVcmwsIG9sZFVybCkpO1xuICAgICAgICAgIG9sZFVybCA9IG5ld1VybDtcbiAgICAgICAgfVxuICAgICAgfSwgMWUzKTtcbiAgICB9XG4gIH07XG59XG4iLCJpbXBvcnQgeyBicm93c2VyIH0gZnJvbSBcInd4dC9icm93c2VyXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwiLi4vdXRpbHMvaW50ZXJuYWwvbG9nZ2VyLm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0VW5pcXVlRXZlbnROYW1lXG59IGZyb20gXCIuL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzXCI7XG5pbXBvcnQgeyBjcmVhdGVMb2NhdGlvbldhdGNoZXIgfSBmcm9tIFwiLi9pbnRlcm5hbC9sb2NhdGlvbi13YXRjaGVyLm1qc1wiO1xuZXhwb3J0IGNsYXNzIENvbnRlbnRTY3JpcHRDb250ZXh0IHtcbiAgY29uc3RydWN0b3IoY29udGVudFNjcmlwdE5hbWUsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmNvbnRlbnRTY3JpcHROYW1lID0gY29udGVudFNjcmlwdE5hbWU7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBpZiAodGhpcy5pc1RvcEZyYW1lKSB7XG4gICAgICB0aGlzLmxpc3RlbkZvck5ld2VyU2NyaXB0cyh7IGlnbm9yZUZpcnN0RXZlbnQ6IHRydWUgfSk7XG4gICAgICB0aGlzLnN0b3BPbGRTY3JpcHRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlzdGVuRm9yTmV3ZXJTY3JpcHRzKCk7XG4gICAgfVxuICB9XG4gIHN0YXRpYyBTQ1JJUFRfU1RBUlRFRF9NRVNTQUdFX1RZUEUgPSBnZXRVbmlxdWVFdmVudE5hbWUoXG4gICAgXCJ3eHQ6Y29udGVudC1zY3JpcHQtc3RhcnRlZFwiXG4gICk7XG4gIGlzVG9wRnJhbWUgPSB3aW5kb3cuc2VsZiA9PT0gd2luZG93LnRvcDtcbiAgYWJvcnRDb250cm9sbGVyO1xuICBsb2NhdGlvbldhdGNoZXIgPSBjcmVhdGVMb2NhdGlvbldhdGNoZXIodGhpcyk7XG4gIHJlY2VpdmVkTWVzc2FnZUlkcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIGdldCBzaWduYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWJvcnRDb250cm9sbGVyLnNpZ25hbDtcbiAgfVxuICBhYm9ydChyZWFzb24pIHtcbiAgICByZXR1cm4gdGhpcy5hYm9ydENvbnRyb2xsZXIuYWJvcnQocmVhc29uKTtcbiAgfVxuICBnZXQgaXNJbnZhbGlkKCkge1xuICAgIGlmIChicm93c2VyLnJ1bnRpbWUuaWQgPT0gbnVsbCkge1xuICAgICAgdGhpcy5ub3RpZnlJbnZhbGlkYXRlZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zaWduYWwuYWJvcnRlZDtcbiAgfVxuICBnZXQgaXNWYWxpZCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNJbnZhbGlkO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0ZW5lciB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBjb250ZW50IHNjcmlwdCdzIGNvbnRleHQgaXMgaW52YWxpZGF0ZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoZSBsaXN0ZW5lci5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihjYik7XG4gICAqIGNvbnN0IHJlbW92ZUludmFsaWRhdGVkTGlzdGVuZXIgPSBjdHgub25JbnZhbGlkYXRlZCgoKSA9PiB7XG4gICAqICAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5yZW1vdmVMaXN0ZW5lcihjYik7XG4gICAqIH0pXG4gICAqIC8vIC4uLlxuICAgKiByZW1vdmVJbnZhbGlkYXRlZExpc3RlbmVyKCk7XG4gICAqL1xuICBvbkludmFsaWRhdGVkKGNiKSB7XG4gICAgdGhpcy5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGNiKTtcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5zaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGNiKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJuIGEgcHJvbWlzZSB0aGF0IG5ldmVyIHJlc29sdmVzLiBVc2VmdWwgaWYgeW91IGhhdmUgYW4gYXN5bmMgZnVuY3Rpb24gdGhhdCBzaG91bGRuJ3QgcnVuXG4gICAqIGFmdGVyIHRoZSBjb250ZXh0IGlzIGV4cGlyZWQuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGNvbnN0IGdldFZhbHVlRnJvbVN0b3JhZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAqICAgaWYgKGN0eC5pc0ludmFsaWQpIHJldHVybiBjdHguYmxvY2soKTtcbiAgICpcbiAgICogICAvLyAuLi5cbiAgICogfVxuICAgKi9cbiAgYmxvY2soKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5zZXRJbnRlcnZhbGAgdGhhdCBhdXRvbWF0aWNhbGx5IGNsZWFycyB0aGUgaW50ZXJ2YWwgd2hlbiBpbnZhbGlkYXRlZC5cbiAgICovXG4gIHNldEludGVydmFsKGhhbmRsZXIsIHRpbWVvdXQpIHtcbiAgICBjb25zdCBpZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIGhhbmRsZXIoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2xlYXJJbnRlcnZhbChpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5zZXRUaW1lb3V0YCB0aGF0IGF1dG9tYXRpY2FsbHkgY2xlYXJzIHRoZSBpbnRlcnZhbCB3aGVuIGludmFsaWRhdGVkLlxuICAgKi9cbiAgc2V0VGltZW91dChoYW5kbGVyLCB0aW1lb3V0KSB7XG4gICAgY29uc3QgaWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIGhhbmRsZXIoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2xlYXJUaW1lb3V0KGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZWAgdGhhdCBhdXRvbWF0aWNhbGx5IGNhbmNlbHMgdGhlIHJlcXVlc3Qgd2hlblxuICAgKiBpbnZhbGlkYXRlZC5cbiAgICovXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjaykge1xuICAgIGNvbnN0IGlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCguLi5hcmdzKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBjYWxsYmFjayguLi5hcmdzKTtcbiAgICB9KTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFja2AgdGhhdCBhdXRvbWF0aWNhbGx5IGNhbmNlbHMgdGhlIHJlcXVlc3Qgd2hlblxuICAgKiBpbnZhbGlkYXRlZC5cbiAgICovXG4gIHJlcXVlc3RJZGxlQ2FsbGJhY2soY2FsbGJhY2ssIG9wdGlvbnMpIHtcbiAgICBjb25zdCBpZCA9IHJlcXVlc3RJZGxlQ2FsbGJhY2soKC4uLmFyZ3MpID0+IHtcbiAgICAgIGlmICghdGhpcy5zaWduYWwuYWJvcnRlZCkgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgfSwgb3B0aW9ucyk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNhbmNlbElkbGVDYWxsYmFjayhpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICBhZGRFdmVudExpc3RlbmVyKHRhcmdldCwgdHlwZSwgaGFuZGxlciwgb3B0aW9ucykge1xuICAgIGlmICh0eXBlID09PSBcInd4dDpsb2NhdGlvbmNoYW5nZVwiKSB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSB0aGlzLmxvY2F0aW9uV2F0Y2hlci5ydW4oKTtcbiAgICB9XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXI/LihcbiAgICAgIHR5cGUuc3RhcnRzV2l0aChcInd4dDpcIikgPyBnZXRVbmlxdWVFdmVudE5hbWUodHlwZSkgOiB0eXBlLFxuICAgICAgaGFuZGxlcixcbiAgICAgIHtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgc2lnbmFsOiB0aGlzLnNpZ25hbFxuICAgICAgfVxuICAgICk7XG4gIH1cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKiBBYm9ydCB0aGUgYWJvcnQgY29udHJvbGxlciBhbmQgZXhlY3V0ZSBhbGwgYG9uSW52YWxpZGF0ZWRgIGxpc3RlbmVycy5cbiAgICovXG4gIG5vdGlmeUludmFsaWRhdGVkKCkge1xuICAgIHRoaXMuYWJvcnQoXCJDb250ZW50IHNjcmlwdCBjb250ZXh0IGludmFsaWRhdGVkXCIpO1xuICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgIGBDb250ZW50IHNjcmlwdCBcIiR7dGhpcy5jb250ZW50U2NyaXB0TmFtZX1cIiBjb250ZXh0IGludmFsaWRhdGVkYFxuICAgICk7XG4gIH1cbiAgc3RvcE9sZFNjcmlwdHMoKSB7XG4gICAgd2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAge1xuICAgICAgICB0eXBlOiBDb250ZW50U2NyaXB0Q29udGV4dC5TQ1JJUFRfU1RBUlRFRF9NRVNTQUdFX1RZUEUsXG4gICAgICAgIGNvbnRlbnRTY3JpcHROYW1lOiB0aGlzLmNvbnRlbnRTY3JpcHROYW1lLFxuICAgICAgICBtZXNzYWdlSWQ6IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgICB9LFxuICAgICAgXCIqXCJcbiAgICApO1xuICB9XG4gIHZlcmlmeVNjcmlwdFN0YXJ0ZWRFdmVudChldmVudCkge1xuICAgIGNvbnN0IGlzU2NyaXB0U3RhcnRlZEV2ZW50ID0gZXZlbnQuZGF0YT8udHlwZSA9PT0gQ29udGVudFNjcmlwdENvbnRleHQuU0NSSVBUX1NUQVJURURfTUVTU0FHRV9UWVBFO1xuICAgIGNvbnN0IGlzU2FtZUNvbnRlbnRTY3JpcHQgPSBldmVudC5kYXRhPy5jb250ZW50U2NyaXB0TmFtZSA9PT0gdGhpcy5jb250ZW50U2NyaXB0TmFtZTtcbiAgICBjb25zdCBpc05vdER1cGxpY2F0ZSA9ICF0aGlzLnJlY2VpdmVkTWVzc2FnZUlkcy5oYXMoZXZlbnQuZGF0YT8ubWVzc2FnZUlkKTtcbiAgICByZXR1cm4gaXNTY3JpcHRTdGFydGVkRXZlbnQgJiYgaXNTYW1lQ29udGVudFNjcmlwdCAmJiBpc05vdER1cGxpY2F0ZTtcbiAgfVxuICBsaXN0ZW5Gb3JOZXdlclNjcmlwdHMob3B0aW9ucykge1xuICAgIGxldCBpc0ZpcnN0ID0gdHJ1ZTtcbiAgICBjb25zdCBjYiA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRoaXMudmVyaWZ5U2NyaXB0U3RhcnRlZEV2ZW50KGV2ZW50KSkge1xuICAgICAgICB0aGlzLnJlY2VpdmVkTWVzc2FnZUlkcy5hZGQoZXZlbnQuZGF0YS5tZXNzYWdlSWQpO1xuICAgICAgICBjb25zdCB3YXNGaXJzdCA9IGlzRmlyc3Q7XG4gICAgICAgIGlzRmlyc3QgPSBmYWxzZTtcbiAgICAgICAgaWYgKHdhc0ZpcnN0ICYmIG9wdGlvbnM/Lmlnbm9yZUZpcnN0RXZlbnQpIHJldHVybjtcbiAgICAgICAgdGhpcy5ub3RpZnlJbnZhbGlkYXRlZCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgY2IpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiByZW1vdmVFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBjYikpO1xuICB9XG59XG4iXSwibmFtZXMiOlsiZGVmaW5pdGlvbiIsImJyb3dzZXIiLCJfYnJvd3NlciIsImNvbnRlbnQiLCJyZXN1bHQiLCJwcmludCIsImxvZ2dlciIsIl9hIiwiX2IiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFPLFdBQVMsb0JBQW9CQSxhQUFZO0FBQzlDLFdBQU9BO0FBQUEsRUFDVDtBQ0RPLFFBQU1DLGNBQVUsc0JBQVcsWUFBWCxtQkFBb0IsWUFBcEIsbUJBQTZCLE1BQ2hELFdBQVcsVUFDWCxXQUFXO0FDRlIsUUFBTSxVQUFVQztBQ0R2QixRQUFBLGFBQUEsb0JBQUE7QUFBQSxJQUFtQyxTQUFBLENBQUEsWUFBQTtBQUFBLElBQ1gsT0FBQTtBQUVwQixjQUFBLElBQUEsK0JBQUE7QUFHQSxVQUFBLFNBQUEsZUFBQSxXQUFBO0FBQ0UsaUJBQUEsaUJBQUEsb0JBQUEsTUFBQTtBQUNFLDJCQUFBO0FBQUEsUUFBaUIsQ0FBQTtBQUFBLE1BQ2xCLE9BQUE7QUFFRCx5QkFBQTtBQUFBLE1BQWlCO0FBQUEsSUFDbkI7QUFBQSxFQUVKLENBQUE7QUFFQSxXQUFBLG1CQUFBO0FBQ0UsWUFBQSxJQUFBLDZDQUFBO0FBR0EsWUFBQSxJQUFBLCtDQUFBLE9BQUEsU0FBQSxJQUFBO0FBRUEseUJBQUE7QUFHQSxlQUFBLE1BQUE7QUFDRSx5QkFBQTtBQUNBLHVCQUFBO0FBQUEsSUFBaUIsR0FBQSxHQUFBO0FBSW5CLFlBQUEsUUFBQSxVQUFBLFlBQUEsQ0FBQSxTQUFBLFFBQUEsaUJBQUE7QUFDRSxjQUFBLElBQUEsbUNBQUEsT0FBQTtBQUVBLFVBQUEsUUFBQSxXQUFBLGlCQUFBO0FBQ0UsY0FBQSxTQUFBLFNBQUEsZUFBQSxvQkFBQTtBQUNBLFlBQUEsUUFBQTtBQUNFLGlCQUFBLE1BQUEsVUFBQSxPQUFBLE1BQUEsWUFBQSxTQUFBLFVBQUE7QUFDQSxrQkFBQSxJQUFBLDBDQUFBO0FBQUEsUUFBc0Q7QUFBQSxNQUN4RCxXQUFBLFFBQUEsV0FBQSxZQUFBO0FBRUEseUJBQUE7QUFDQSxnQkFBQSxJQUFBLDhDQUFBO0FBQUEsTUFBMEQ7QUFHNUQsbUJBQUEsRUFBQSxTQUFBLE1BQUE7QUFBQSxJQUE4QixDQUFBO0FBQUEsRUFFbEM7QUFFQSxXQUFBLHVCQUFBO0FBQ0UsWUFBQSxJQUFBLDJDQUFBO0FBR0EsUUFBQSxTQUFBLGVBQUEsb0JBQUEsR0FBQTtBQUNFLGNBQUEsSUFBQSxxQ0FBQTtBQUNBO0FBQUEsSUFBQTtBQUlGLFFBQUEsQ0FBQSxTQUFBLE1BQUE7QUFDRSxjQUFBLElBQUEsd0RBQUE7QUFDQSxpQkFBQSxNQUFBLHFCQUFBLEdBQUEsR0FBQTtBQUNBO0FBQUEsSUFBQTtBQUVGLFVBQUEsU0FBQSxTQUFBLGNBQUEsS0FBQTtBQUNBLFdBQUEsS0FBQTtBQUNBLFdBQUEsTUFBQSxVQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUF3QkEsV0FBQSxZQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBMkhBLG9CQUFBO0FBR0Esa0JBQUEsTUFBQTtBQUdBLDRCQUFBLE1BQUE7QUFHQSxhQUFBLEtBQUEsWUFBQSxNQUFBO0FBRUEsWUFBQSxJQUFBLDREQUFBO0FBR0EsV0FBQSxNQUFBLFVBQUE7QUFDQSxXQUFBLE1BQUEsYUFBQTtBQUdBLFVBQUEsZUFBQSxTQUFBLGVBQUEsb0JBQUE7QUFDQSxRQUFBLGNBQUE7QUFDRSxjQUFBLElBQUEsOENBQUE7QUFDQSxjQUFBLElBQUEsb0JBQUEsYUFBQSxNQUFBLEtBQUEsYUFBQSxNQUFBLEtBQUE7QUFBQSxJQUFnRixPQUFBO0FBRWhGLGNBQUEsTUFBQSwyQ0FBQTtBQUFBLElBQXlEO0FBQUEsRUFFN0Q7QUFFQSxXQUFBLGtCQUFBO0FBQ0UsUUFBQSxTQUFBLGVBQUEsb0JBQUEsR0FBQTtBQUNFO0FBQUEsSUFBQTtBQUdGLFVBQUEsU0FBQSxTQUFBLGNBQUEsT0FBQTtBQUNBLFdBQUEsS0FBQTtBQUNBLFdBQUEsY0FBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FB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QUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FB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
