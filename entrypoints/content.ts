export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    console.log("StickyNoteAI: Initializing...");

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

function initializeWidget() {
  console.log("StickyNoteAI: DOM ready, creating widget...");

  // Simple test to confirm content script is running
  console.log("StickyNoteAI: Content script is running on:", window.location.href);

  createFloatingWidget();

  // Initialize widget position and notes list after creation
  setTimeout(() => {
    loadWidgetPosition();
    refreshNotesList();
  }, 100);

  // Listen for messages from background script
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

  // Check if widget already exists
  if (document.getElementById("sticky-note-widget")) {
    console.log("StickyNoteAI: Widget already exists");
    return;
  }

  // Check if we can access document.body
  if (!document.body) {
    console.log("StickyNoteAI: document.body not available, retrying...");
    setTimeout(() => createFloatingWidget(), 100);
    return;
  } // Create the main widget container
  const widget = document.createElement("div");
  widget.id = "sticky-note-widget";
  widget.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    width: 280px !important;
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
    z-index: 999999 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 14px !important;
    cursor: move !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    overflow: hidden !important;
  `;

  widget.innerHTML = `
    <div class="widget-header" style="
      display: flex; 
      align-items: center; 
      padding: 16px 20px; 
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); 
      border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
      gap: 12px;
      backdrop-filter: blur(10px);
    ">
      <span class="widget-icon" style="font-size: 18px; flex: 1; color: #6366f1; filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.3));">✨</span>
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
      ">×</button>
    </div>
    <div class="widget-body" style="
      display: none; 
      padding: 20px; 
      max-height: 400px; 
      overflow-y: auto;
      background: rgba(255, 255, 255, 0.05);
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
  `;

  // Add styles (still useful for hover effects)
  addWidgetStyles();

  // Make widget draggable
  makeDraggable(widget);

  // Add event listeners
  addWidgetEventListeners(widget);

  // Insert widget into page
  document.body.appendChild(widget);

  console.log("StickyNoteAI: Widget created successfully and added to DOM");

  // Force visibility
  widget.style.display = "block";
  widget.style.visibility = "visible";

  // Verify widget is in DOM
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

    #sticky-note-widget:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
    }

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
      opacity: 0.1 !important;
      transform: scale(0.85) !important;
      transition: all 0.3s ease !important;
    }

    #sticky-note-widget.stealth:hover {
      opacity: 0.9 !important;
      transform: scale(1) translateY(-2px) !important;
    }

    /* Minimized state */
    #sticky-note-widget.minimized {
      width: 64px !important;
      height: 64px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9)) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    #sticky-note-widget.minimized .widget-header {
      border: none !important;
      background: none !important;
      padding: 0 !important;
      justify-content: center !important;
    }

    #sticky-note-widget.minimized .widget-icon {
      font-size: 24px !important;
      color: white !important;
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5)) !important;
    }

    #sticky-note-widget.minimized .widget-body,
    #sticky-note-widget.minimized .btn-menu,
    #sticky-note-widget.minimized .btn-add,
    #sticky-note-widget.minimized .btn-hide {
      display: none !important;
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
  `;

  document.head.appendChild(styles);
}

function makeDraggable(element: HTMLElement) {
  let isDragging = false;
  let currentX = 0;
  let currentY = 0;
  let initialX = 0;
  let initialY = 0;

  const header = element.querySelector(".widget-header") as HTMLElement;

  header.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);

  function dragStart(e: MouseEvent) {
    if ((e.target as HTMLElement).tagName === "BUTTON") {
      return; // Don't drag if clicking buttons
    }

    initialX = e.clientX - currentX;
    initialY = e.clientY - currentY;

    if (e.target === header || header.contains(e.target as Node)) {
      isDragging = true;
      element.style.cursor = "grabbing";
    }
  }

  function drag(e: MouseEvent) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      // Keep widget within viewport
      const rect = element.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      currentX = Math.max(0, Math.min(currentX, maxX));
      currentY = Math.max(0, Math.min(currentY, maxY));

      element.style.left = currentX + "px";
      element.style.top = currentY + "px";
      element.style.right = "auto";
    }
  }

  function dragEnd() {
    isDragging = false;
    element.style.cursor = "move";

    // Save position to storage
    saveWidgetPosition(currentX, currentY);
  }
}

function addWidgetEventListeners(widget: HTMLElement) {
  const addBtn = widget.querySelector(".btn-add") as HTMLButtonElement;
  const menuBtn = widget.querySelector(".btn-menu") as HTMLButtonElement;
  const hideBtn = widget.querySelector(".btn-hide") as HTMLButtonElement;
  const widgetBody = widget.querySelector(".widget-body") as HTMLElement;

  // Add note button
  addBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    createNoteEditor();
  });

  // Menu button (toggle widget body)
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isVisible = widgetBody.style.display !== "none";
    widgetBody.style.display = isVisible ? "none" : "block";
    menuBtn.textContent = isVisible ? "≡" : "×";
  });

  // Hide button
  hideBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    widget.classList.toggle("minimized");
  });

  // Double-click to minimize
  widget.addEventListener("dblclick", () => {
    widget.classList.toggle("minimized");
  });

  // Keyboard shortcuts (Mac-compatible)
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
  // Check if editor already exists
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

  // Add modal styles
  addModalStyles();

  // Add event listeners
  addModalEventListeners(modal);

  document.body.appendChild(modal);

  // Focus on title input
  const titleInput = modal.querySelector(".note-title-input") as HTMLInputElement;
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

function addModalEventListeners(modal: HTMLElement) {
  const closeBtn = modal.querySelector(".modal-close") as HTMLButtonElement;
  const saveBtn = modal.querySelector(".btn-save") as HTMLButtonElement;
  const cancelBtn = modal.querySelector(".btn-cancel") as HTMLButtonElement;
  const titleInput = modal.querySelector(".note-title-input") as HTMLInputElement;
  const contentInput = modal.querySelector(".note-content-input") as HTMLTextAreaElement;

  // Close modal
  closeBtn.addEventListener("click", () => closeModal(modal));
  cancelBtn.addEventListener("click", () => closeModal(modal));

  // Save note
  saveBtn.addEventListener("click", () => {
    const title = titleInput.value.trim() || "Untitled Note";
    const content = contentInput.value.trim();

    if (content) {
      saveNote(title, content);
      closeModal(modal);
    }
  });

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal.querySelector(".modal-backdrop")) {
      closeModal(modal);
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(modal);
    }
  });

  // Auto-save draft every 2 seconds
  let autoSaveTimer: number;
  const autoSave = () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = window.setTimeout(() => {
      const title = titleInput.value.trim() || "Draft";
      const content = contentInput.value.trim();
      if (content) {
        browser.storage.local.set({ "sticky-note-draft": { title, content } });
      }
    }, 2000);
  };

  titleInput.addEventListener("input", autoSave);
  contentInput.addEventListener("input", autoSave);

  // Load draft if exists
  browser.storage.local.get("sticky-note-draft", (result) => {
    const draft = result["sticky-note-draft"];
    if (draft) {
      titleInput.value = draft.title;
      contentInput.value = draft.content;
    }
  });
}

function closeModal(modal: HTMLElement) {
  modal.remove();
  browser.storage.local.remove("sticky-note-draft");
}

function getStoredNotes(): Promise<any[]> {
  return new Promise((resolve) => {
    browser.storage.local.get("sticky-notes", (result) => {
      resolve(result["sticky-notes"] || []);
    });
  });
}

function saveNote(title: string, content: string) {
  browser.storage.local.get("sticky-notes", (result) => {
    const notes = result["sticky-notes"] || [];
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notes.push(newNote);
    browser.storage.local.set({ "sticky-notes": notes }, () => {
      console.log("Note saved:", newNote);
      // Refresh the notes list after saving is complete
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

  const notesList = widget.querySelector(".notes-list") as HTMLElement;
  browser.storage.local.get("sticky-notes", (result) => {
    const notes = result["sticky-notes"] || [];

    if (notes.length === 0) {
      notesList.innerHTML = '<div class="no-notes">No notes yet. Click + to add one!</div>';
      return;
    }

    notesList.innerHTML = notes
      .map(
        (note: any) => `
      <div class="note-item" data-note-id="${note.id}">
        <div class="note-title">${note.title}</div>
        <div class="note-preview">${note.content.substring(0, 50)}${note.content.length > 50 ? "..." : ""}</div>
      </div>
    `
      )
      .join("");

    notesList.querySelectorAll(".note-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const noteId = (e.currentTarget as HTMLElement).dataset.noteId;
        console.log("Clicked note:", noteId);
      });
    });
  });
}

function saveWidgetPosition(x: number, y: number) {
  browser.storage.local.set({
    "sticky-settings": {
      widgetPosition: { x, y },
    },
  });
}

function loadWidgetPosition() {
  try {
    browser.storage.local.get("sticky-settings", (result: { [key: string]: any }) => {
      const settings = result["sticky-settings"];
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
