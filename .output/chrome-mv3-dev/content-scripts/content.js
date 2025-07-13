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
  let dragOffset = { x: 0, y: 0 };
  let lastPosition = { x: 0, y: 0 };
  let menuCloseTimeout = null;
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
    widget.innerHTML = `
    <div class="widget-container">
      <div class="widget-main-button" id="main-button">
        ✨
      </div>
      <div class="widget-menu" id="widget-menu">
        <div class="menu-button add-button" data-action="add">➕</div>
        <div class="menu-button notes-button" data-action="notes">📋</div>
        <div class="menu-button settings-button" data-action="settings">⚙️</div>
        <div class="menu-button close-button" data-action="close">❌</div>
      </div>
    </div>
  `;
    const style = document.createElement("style");
    style.textContent = `
    #sticky-note-widget {
      position: fixed;
      bottom: 0px;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      position: relative;
    }

    .widget-main-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
    }

    .widget-main-button.dragging {
      cursor: grabbing !important;
      transform: scale(0.95);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5);
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

    .widget-menu.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .menu-button {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      transform: translateY(-10px);
      opacity: 0;
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
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    }

    .close-button:hover {
      background: rgba(255, 107, 107, 0.9) !important;
      color: white;
    }

    .sticky-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
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
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      transform: scale(0.9);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
      border-bottom: 1px solid #eee;
    }

    .modal-title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      padding: 5px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: #f5f5f5;
      color: #333;
    }

    .note-input {
      width: 100%;
      min-height: 200px;
      padding: 15px;
      border: 2px solid #e1e5e9;
      border-radius: 10px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      transition: border-color 0.2s ease;
    }

    .note-input:focus {
      outline: none;
      border-color: #667eea;
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
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #333;
      border: 1px solid #dee2e6;
    }

    .btn-secondary:hover {
      background: #e9ecef;
    }

    .notes-panel {
      position: fixed;
      top: 50%;
      right: -300px;
      transform: translateY(-50%);
      width: 280px;
      max-height: 400px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      z-index: 999998;
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .notes-panel.open {
      right: 20px;
    }

    .notes-header {
      background: #667eea;
      color: white;
      padding: 15px;
      font-weight: 600;
    }

    .notes-list {
      max-height: 300px;
      overflow-y: auto;
      padding: 10px;
    }

    .note-item {
      padding: 12px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .note-item:hover {
      background: #f8f9fa;
    }

    .note-preview {
      font-size: 13px;
      color: #666;
      margin-top: 5px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .note-date {
      font-size: 11px;
      color: #999;
      margin-top: 5px;
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
  `;
    document.head.appendChild(style);
    document.body.appendChild(widget);
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
    menu == null ? void 0 : menu.addEventListener("click", (e) => {
      const target = e.target;
      const action = target.dataset.action;
      if (action) {
        handleMenuAction(action);
        closeMenu();
      }
    });
  }
  function openMenu() {
    if (isDragging) return;
    const menu = document.getElementById("widget-menu");
    if (menu) {
      menu.classList.add("open");
    }
  }
  function closeMenu() {
    const menu = document.getElementById("widget-menu");
    if (menu) {
      menu.classList.remove("open");
    }
    if (menuCloseTimeout) {
      clearTimeout(menuCloseTimeout);
      menuCloseTimeout = null;
    }
  }
  function handleMenuAction(action) {
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
      case "close":
        hideWidget();
        break;
    }
  }
  function createNoteEditor(initialText = "") {
    const modal = document.createElement("div");
    modal.className = "sticky-modal";
    modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">✏️ New Note</h3>
        <button class="modal-close">×</button>
      </div>
      <textarea class="note-input" placeholder="Write your note here..." autofocus>${initialText}</textarea>
      <div class="button-group">
        <button class="btn btn-primary save-note">💾 Save Note</button>
        <button class="btn btn-secondary cancel-note">Cancel</button>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add("open"), 10);
    const closeBtn = modal.querySelector(".modal-close");
    const saveBtn = modal.querySelector(".save-note");
    const cancelBtn = modal.querySelector(".cancel-note");
    const textarea = modal.querySelector(".note-input");
    function closeModal() {
      modal.classList.remove("open");
      setTimeout(() => modal.remove(), 300);
    }
    closeBtn == null ? void 0 : closeBtn.addEventListener("click", closeModal);
    cancelBtn == null ? void 0 : cancelBtn.addEventListener("click", closeModal);
    saveBtn == null ? void 0 : saveBtn.addEventListener("click", () => {
      const content2 = textarea.value.trim();
      if (content2) {
        saveNote(content2);
        closeModal();
      }
    });
    document.addEventListener("keydown", function escHandler(e) {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", escHandler);
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
      <div style="line-height: 1.6;">
        <h4>🎮 Keyboard Shortcuts</h4>
        <p><strong>Cmd/Ctrl + Shift + S:</strong> Create new note</p>
        <p><strong>Cmd/Ctrl + Shift + W:</strong> Toggle widget visibility</p>
        <p><strong>ESC:</strong> Close modals</p>
        
        <h4 style="margin-top: 25px;">ℹ️ About</h4>
        <p><strong>StickyNoteAI v2.0</strong></p>
        <p>Smart floating notes for any webpage</p>
        
        <h4 style="margin-top: 25px;">🎯 Usage Tips</h4>
        <p>• Hover over the ✨ button to see menu</p>
        <p>• Click and drag to move the widget</p>
        <p>• Use keyboard shortcuts for quick access</p>
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
  }
  function showWidget() {
    if (widget) {
      widget.style.display = "block";
    }
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
        notesList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No notes yet</div>';
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
            editNote(note);
          }
        });
      });
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }
  function editNote(note) {
    var _a2, _b2, _c, _d;
    const modal = document.createElement("div");
    modal.className = "sticky-modal";
    modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">✏️ Edit Note</h3>
        <button class="modal-close">×</button>
      </div>
      <textarea class="note-input" autofocus>${note.content}</textarea>
      <div class="button-group">
        <button class="btn btn-primary update-note">💾 Update Note</button>
        <button class="btn" style="background: #dc3545; color: white;" id="delete-note">🗑️ Delete</button>
        <button class="btn btn-secondary cancel-edit">Cancel</button>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add("open"), 10);
    const textarea = modal.querySelector(".note-input");
    function closeModal() {
      modal.classList.remove("open");
      setTimeout(() => modal.remove(), 300);
    }
    (_a2 = modal.querySelector(".modal-close")) == null ? void 0 : _a2.addEventListener("click", closeModal);
    (_b2 = modal.querySelector(".cancel-edit")) == null ? void 0 : _b2.addEventListener("click", closeModal);
    (_c = modal.querySelector(".update-note")) == null ? void 0 : _c.addEventListener("click", async () => {
      const content2 = textarea.value.trim();
      if (content2) {
        await updateNote(note.id, content2);
        refreshNotesList();
        closeModal();
      }
    });
    (_d = modal.querySelector("#delete-note")) == null ? void 0 : _d.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete this note?")) {
        await deleteNote(note.id);
        refreshNotesList();
        closeModal();
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
    console.log("StickyNoteAI: Keyboard shortcuts delegated to background script");
  }
  function setupMessageListener() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("StickyNoteAI: Received message:", message);
      if (message.action === "toggle-widget") {
        const widget2 = document.getElementById("sticky-note-widget");
        if (widget2) {
          if (widget2.style.display === "none") {
            showWidget();
          } else {
            hideWidget();
          }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1jb250ZW50LXNjcmlwdC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHd4dC1kZXYvYnJvd3Nlci9zcmMvaW5kZXgubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L2Jyb3dzZXIubWpzIiwiLi4vLi4vLi4vZW50cnlwb2ludHMvY29udGVudC50cyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LWNvbnRleHQubWpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVDb250ZW50U2NyaXB0KGRlZmluaXRpb24pIHtcbiAgcmV0dXJuIGRlZmluaXRpb247XG59XG4iLCIvLyAjcmVnaW9uIHNuaXBwZXRcbmV4cG9ydCBjb25zdCBicm93c2VyID0gZ2xvYmFsVGhpcy5icm93c2VyPy5ydW50aW1lPy5pZFxuICA/IGdsb2JhbFRoaXMuYnJvd3NlclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xuLy8gI2VuZHJlZ2lvbiBzbmlwcGV0XG4iLCJpbXBvcnQgeyBicm93c2VyIGFzIF9icm93c2VyIH0gZnJvbSBcIkB3eHQtZGV2L2Jyb3dzZXJcIjtcbmV4cG9ydCBjb25zdCBicm93c2VyID0gX2Jyb3dzZXI7XG5leHBvcnQge307XG4iLCJleHBvcnQgZGVmYXVsdCBkZWZpbmVDb250ZW50U2NyaXB0KHtcbiAgbWF0Y2hlczogW1wiPGFsbF91cmxzPlwiXSxcbiAgbWFpbigpIHtcbiAgICBjb25zb2xlLmxvZyhcIvCfjq8gU3RpY2t5Tm90ZUFJIHYyLjIgQ1NTIEZJWEVEICsgTUVOVSBQT1NJVElPTklORyAtIExvYWRpbmcuLi5cIik7XG5cbiAgICAvLyBXYWl0IGZvciBET00gdG8gYmUgcmVhZHlcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICAgICAgaW5pdGlhbGl6ZVdpZGdldCgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluaXRpYWxpemVXaWRnZXQoKTtcbiAgICB9XG4gIH0sXG59KTtcblxubGV0IHdpZGdldDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbmxldCBpc0RyYWdnaW5nID0gZmFsc2U7XG5sZXQgaXNNZW51T3BlbiA9IGZhbHNlO1xubGV0IGRyYWdPZmZzZXQgPSB7IHg6IDAsIHk6IDAgfTtcbmxldCBsYXN0UG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcbmxldCBtZW51Q2xvc2VUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xuXG5mdW5jdGlvbiBpbml0aWFsaXplV2lkZ2V0KCkge1xuICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogRE9NIHJlYWR5LCBjcmVhdGluZyB3aWRnZXQuLi5cIik7XG4gIGNyZWF0ZUZsb2F0aW5nV2lkZ2V0KCk7XG4gIGxvYWRXaWRnZXRQb3NpdGlvbigpO1xuICBzZXR1cEtleWJvYXJkU2hvcnRjdXRzKCk7XG4gIHNldHVwTWVzc2FnZUxpc3RlbmVyKCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUZsb2F0aW5nV2lkZ2V0KCkge1xuICAvLyBSZW1vdmUgZXhpc3Rpbmcgd2lkZ2V0IGlmIGFueVxuICBjb25zdCBleGlzdGluZ1dpZGdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RpY2t5LW5vdGUtd2lkZ2V0XCIpO1xuICBpZiAoZXhpc3RpbmdXaWRnZXQpIHtcbiAgICBleGlzdGluZ1dpZGdldC5yZW1vdmUoKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSBtYWluIHdpZGdldCBjb250YWluZXJcbiAgd2lkZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgd2lkZ2V0LmlkID0gXCJzdGlja3ktbm90ZS13aWRnZXRcIjtcbiAgd2lkZ2V0LmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LWNvbnRhaW5lclwiPlxuICAgICAgPGRpdiBjbGFzcz1cIndpZGdldC1tYWluLWJ1dHRvblwiIGlkPVwibWFpbi1idXR0b25cIj5cbiAgICAgICAg4pyoXG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJ3aWRnZXQtbWVudVwiIGlkPVwid2lkZ2V0LW1lbnVcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtYnV0dG9uIGFkZC1idXR0b25cIiBkYXRhLWFjdGlvbj1cImFkZFwiPuKelTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibWVudS1idXR0b24gbm90ZXMtYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJub3Rlc1wiPvCfk4s8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtYnV0dG9uIHNldHRpbmdzLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwic2V0dGluZ3NcIj7impnvuI88L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtYnV0dG9uIGNsb3NlLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiY2xvc2VcIj7inYw8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuICAvLyBBZGQgc3R5bGVzXG4gIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBzdHlsZS50ZXh0Q29udGVudCA9IGBcbiAgICAjc3RpY2t5LW5vdGUtd2lkZ2V0IHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIGJvdHRvbTogMHB4O1xuICAgICAgcmlnaHQ6IDUwcHg7XG4gICAgICB6LWluZGV4OiA5OTk5OTk7XG4gICAgICBmb250LWZhbWlseTogJ0ludGVyJywgLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBzYW5zLXNlcmlmO1xuICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgICB9XG5cbiAgICAud2lkZ2V0LWNvbnRhaW5lciB7XG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgfVxuXG4gICAgLndpZGdldC1tYWluLWJ1dHRvbiB7XG4gICAgICB3aWR0aDogNTBweDtcbiAgICAgIGhlaWdodDogNTBweDtcbiAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICM2NjdlZWEgMCUsICM3NjRiYTIgMTAwJSk7XG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgZm9udC1zaXplOiAyMHB4O1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgYm94LXNoYWRvdzogMCA0cHggMjBweCByZ2JhKDEwMiwgMTI2LCAyMzQsIDAuMyk7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgICAgYm9yZGVyOiAycHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpO1xuICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEwcHgpO1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWFpbi1idXR0b246aG92ZXIge1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjA1KTtcbiAgICAgIGJveC1zaGFkb3c6IDAgNnB4IDI1cHggcmdiYSgxMDIsIDEyNiwgMjM0LCAwLjQpO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWFpbi1idXR0b24uZHJhZ2dpbmcge1xuICAgICAgY3Vyc29yOiBncmFiYmluZyAhaW1wb3J0YW50O1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjk1KTtcbiAgICAgIGJveC1zaGFkb3c6IDAgOHB4IDMwcHggcmdiYSgxMDIsIDEyNiwgMjM0LCAwLjUpO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudSB7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB0b3A6IDEwMCU7XG4gICAgICBsZWZ0OiA1MCU7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XG4gICAgICBtYXJnaW4tdG9wOiAxMHB4O1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICBnYXA6IDEwcHg7XG4gICAgICBvcGFjaXR5OiAwO1xuICAgICAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbiAgICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudS5vcGVuIHtcbiAgICAgIG9wYWNpdHk6IDE7XG4gICAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xuICAgICAgcG9pbnRlci1ldmVudHM6IGF1dG87XG4gICAgfVxuXG4gICAgLm1lbnUtYnV0dG9uIHtcbiAgICAgIHdpZHRoOiA0MHB4O1xuICAgICAgaGVpZ2h0OiA0MHB4O1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBib3gtc2hhZG93OiAwIDNweCAxNXB4IHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSk7XG4gICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCk7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTEwcHgpO1xuICAgICAgb3BhY2l0eTogMDtcbiAgICB9XG5cbiAgICAud2lkZ2V0LW1lbnUub3BlbiAubWVudS1idXR0b24ge1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xuICAgICAgb3BhY2l0eTogMTtcbiAgICB9XG5cbiAgICAud2lkZ2V0LW1lbnUub3BlbiAubWVudS1idXR0b246bnRoLWNoaWxkKDEpIHsgdHJhbnNpdGlvbi1kZWxheTogMC4wNXM7IH1cbiAgICAud2lkZ2V0LW1lbnUub3BlbiAubWVudS1idXR0b246bnRoLWNoaWxkKDIpIHsgdHJhbnNpdGlvbi1kZWxheTogMC4xczsgfVxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbjpudGgtY2hpbGQoMykgeyB0cmFuc2l0aW9uLWRlbGF5OiAwLjE1czsgfVxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbjpudGgtY2hpbGQoNCkgeyB0cmFuc2l0aW9uLWRlbGF5OiAwLjJzOyB9XG5cbiAgICAubWVudS1idXR0b246aG92ZXIge1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjEpO1xuICAgICAgYm94LXNoYWRvdzogMCA1cHggMjBweCByZ2JhKDAsIDAsIDAsIDAuMTUpO1xuICAgIH1cblxuICAgIC5jbG9zZS1idXR0b246aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDEwNywgMTA3LCAwLjkpICFpbXBvcnRhbnQ7XG4gICAgICBjb2xvcjogd2hpdGU7XG4gICAgfVxuXG4gICAgLnN0aWNreS1tb2RhbCB7XG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICB0b3A6IDA7XG4gICAgICBsZWZ0OiAwO1xuICAgICAgd2lkdGg6IDEwMHZ3O1xuICAgICAgaGVpZ2h0OiAxMDB2aDtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC41KTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICB6LWluZGV4OiAxMDAwMDAwO1xuICAgICAgb3BhY2l0eTogMDtcbiAgICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2U7XG4gICAgfVxuXG4gICAgLnN0aWNreS1tb2RhbC5vcGVuIHtcbiAgICAgIG9wYWNpdHk6IDE7XG4gICAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xuICAgIH1cblxuICAgIC5tb2RhbC1jb250ZW50IHtcbiAgICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgICAgcGFkZGluZzogMzBweDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDE1cHg7XG4gICAgICBib3gtc2hhZG93OiAwIDIwcHggNjBweCByZ2JhKDAsIDAsIDAsIDAuMyk7XG4gICAgICBtYXgtd2lkdGg6IDUwMHB4O1xuICAgICAgd2lkdGg6IDkwJTtcbiAgICAgIG1heC1oZWlnaHQ6IDgwdmg7XG4gICAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjkpO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbiAgICB9XG5cbiAgICAuc3RpY2t5LW1vZGFsLm9wZW4gLm1vZGFsLWNvbnRlbnQge1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcbiAgICB9XG5cbiAgICAubW9kYWwtaGVhZGVyIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgbWFyZ2luLWJvdHRvbTogMjBweDtcbiAgICAgIHBhZGRpbmctYm90dG9tOiAxNXB4O1xuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlZWU7XG4gICAgfVxuXG4gICAgLm1vZGFsLXRpdGxlIHtcbiAgICAgIGZvbnQtc2l6ZTogMjBweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBjb2xvcjogIzMzMztcbiAgICB9XG5cbiAgICAubW9kYWwtY2xvc2Uge1xuICAgICAgYmFja2dyb3VuZDogbm9uZTtcbiAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgIGZvbnQtc2l6ZTogMjRweDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIGNvbG9yOiAjOTk5O1xuICAgICAgcGFkZGluZzogNXB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgICB9XG5cbiAgICAubW9kYWwtY2xvc2U6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogI2Y1ZjVmNTtcbiAgICAgIGNvbG9yOiAjMzMzO1xuICAgIH1cblxuICAgIC5ub3RlLWlucHV0IHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgbWluLWhlaWdodDogMjAwcHg7XG4gICAgICBwYWRkaW5nOiAxNXB4O1xuICAgICAgYm9yZGVyOiAycHggc29saWQgI2UxZTVlOTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICBmb250LWZhbWlseTogaW5oZXJpdDtcbiAgICAgIHJlc2l6ZTogdmVydGljYWw7XG4gICAgICB0cmFuc2l0aW9uOiBib3JkZXItY29sb3IgMC4ycyBlYXNlO1xuICAgIH1cblxuICAgIC5ub3RlLWlucHV0OmZvY3VzIHtcbiAgICAgIG91dGxpbmU6IG5vbmU7XG4gICAgICBib3JkZXItY29sb3I6ICM2NjdlZWE7XG4gICAgfVxuXG4gICAgLmJ1dHRvbi1ncm91cCB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZ2FwOiAxMHB4O1xuICAgICAgbWFyZ2luLXRvcDogMjBweDtcbiAgICB9XG5cbiAgICAuYnRuIHtcbiAgICAgIHBhZGRpbmc6IDEwcHggMjBweDtcbiAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICAgIH1cblxuICAgIC5idG4tcHJpbWFyeSB7XG4gICAgICBiYWNrZ3JvdW5kOiAjNjY3ZWVhO1xuICAgICAgY29sb3I6IHdoaXRlO1xuICAgIH1cblxuICAgIC5idG4tcHJpbWFyeTpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjNWE2ZmQ4O1xuICAgIH1cblxuICAgIC5idG4tc2Vjb25kYXJ5IHtcbiAgICAgIGJhY2tncm91bmQ6ICNmOGY5ZmE7XG4gICAgICBjb2xvcjogIzMzMztcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNkZWUyZTY7XG4gICAgfVxuXG4gICAgLmJ0bi1zZWNvbmRhcnk6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogI2U5ZWNlZjtcbiAgICB9XG5cbiAgICAubm90ZXMtcGFuZWwge1xuICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgdG9wOiA1MCU7XG4gICAgICByaWdodDogLTMwMHB4O1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpO1xuICAgICAgd2lkdGg6IDI4MHB4O1xuICAgICAgbWF4LWhlaWdodDogNDAwcHg7XG4gICAgICBiYWNrZ3JvdW5kOiB3aGl0ZTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDE1cHg7XG4gICAgICBib3gtc2hhZG93OiAwIDEwcHggNDBweCByZ2JhKDAsIDAsIDAsIDAuMik7XG4gICAgICB6LWluZGV4OiA5OTk5OTg7XG4gICAgICB0cmFuc2l0aW9uOiByaWdodCAwLjNzIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSk7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIH1cblxuICAgIC5ub3Rlcy1wYW5lbC5vcGVuIHtcbiAgICAgIHJpZ2h0OiAyMHB4O1xuICAgIH1cblxuICAgIC5ub3Rlcy1oZWFkZXIge1xuICAgICAgYmFja2dyb3VuZDogIzY2N2VlYTtcbiAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICAgIHBhZGRpbmc6IDE1cHg7XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgIH1cblxuICAgIC5ub3Rlcy1saXN0IHtcbiAgICAgIG1heC1oZWlnaHQ6IDMwMHB4O1xuICAgICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICAgIHBhZGRpbmc6IDEwcHg7XG4gICAgfVxuXG4gICAgLm5vdGUtaXRlbSB7XG4gICAgICBwYWRkaW5nOiAxMnB4O1xuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlZWU7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kIDAuMnMgZWFzZTtcbiAgICB9XG5cbiAgICAubm90ZS1pdGVtOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6ICNmOGY5ZmE7XG4gICAgfVxuXG4gICAgLm5vdGUtcHJldmlldyB7XG4gICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICBjb2xvcjogIzY2NjtcbiAgICAgIG1hcmdpbi10b3A6IDVweDtcbiAgICAgIGRpc3BsYXk6IC13ZWJraXQtYm94O1xuICAgICAgLXdlYmtpdC1saW5lLWNsYW1wOiAyO1xuICAgICAgLXdlYmtpdC1ib3gtb3JpZW50OiB2ZXJ0aWNhbDtcbiAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgfVxuXG4gICAgLm5vdGUtZGF0ZSB7XG4gICAgICBmb250LXNpemU6IDExcHg7XG4gICAgICBjb2xvcjogIzk5OTtcbiAgICAgIG1hcmdpbi10b3A6IDVweDtcbiAgICB9XG5cbiAgICBAbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcbiAgICAgIC5ub3Rlcy1wYW5lbCB7XG4gICAgICAgIHdpZHRoOiA5MCU7XG4gICAgICAgIHJpZ2h0OiAtMTAwJTtcbiAgICAgIH1cbiAgICAgIC5ub3Rlcy1wYW5lbC5vcGVuIHtcbiAgICAgICAgcmlnaHQ6IDUlO1xuICAgICAgfVxuICAgIH1cbiAgYDtcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQod2lkZ2V0KTtcblxuICBzZXR1cFdpZGdldEV2ZW50cygpO1xufVxuXG5mdW5jdGlvbiBzZXR1cFdpZGdldEV2ZW50cygpIHtcbiAgY29uc3QgbWFpbkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbi1idXR0b25cIik7XG4gIGNvbnN0IG1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndpZGdldC1tZW51XCIpO1xuXG4gIGlmICghbWFpbkJ1dHRvbiB8fCAhbWVudSkgcmV0dXJuO1xuXG4gIGxldCBkcmFnU3RhcnRUaW1lID0gMDtcbiAgbGV0IHN0YXJ0UG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcbiAgbGV0IGhhc01vdmVkV2hpbGVEcmFnZ2luZyA9IGZhbHNlO1xuXG4gIC8vIEJvdW5kYXJ5IGNvbnN0cmFpbnQgZnVuY3Rpb25cbiAgZnVuY3Rpb24gY29uc3RyYWluVG9Cb3VuZHMoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0ge1xuICAgIGlmICghd2lkZ2V0KSByZXR1cm4geyB4LCB5IH07XG5cbiAgICBjb25zdCB3aWRnZXRSZWN0ID0geyB3aWR0aDogNTAsIGhlaWdodDogNTAgfTsgLy8gV2lkZ2V0IGRpbWVuc2lvbnNcbiAgICBjb25zdCB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIGNvbnN0IHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBjb25zdCBtYXJnaW4gPSAxMDsgLy8gTWluaW11bSBtYXJnaW4gZnJvbSBlZGdlc1xuXG4gICAgLy8gQ29uc3RyYWluIGhvcml6b250YWwgcG9zaXRpb25cbiAgICBsZXQgY29uc3RyYWluZWRYID0gTWF0aC5tYXgobWFyZ2luLCB4KTtcbiAgICBjb25zdHJhaW5lZFggPSBNYXRoLm1pbih3aW5kb3dXaWR0aCAtIHdpZGdldFJlY3Qud2lkdGggLSBtYXJnaW4sIGNvbnN0cmFpbmVkWCk7XG5cbiAgICAvLyBDb25zdHJhaW4gdmVydGljYWwgcG9zaXRpb25cbiAgICBsZXQgY29uc3RyYWluZWRZID0gTWF0aC5tYXgobWFyZ2luLCB5KTtcbiAgICBjb25zdHJhaW5lZFkgPSBNYXRoLm1pbih3aW5kb3dIZWlnaHQgLSB3aWRnZXRSZWN0LmhlaWdodCAtIG1hcmdpbiwgY29uc3RyYWluZWRZKTtcblxuICAgIHJldHVybiB7IHg6IGNvbnN0cmFpbmVkWCwgeTogY29uc3RyYWluZWRZIH07XG4gIH1cblxuICAvLyBTbmFwIHRvIG5lYXJlc3QgZWRnZSBmdW5jdGlvblxuICBmdW5jdGlvbiBzbmFwVG9OZWFyZXN0RWRnZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB7XG4gICAgaWYgKCF3aWRnZXQpIHJldHVybiB7IHgsIHkgfTtcblxuICAgIGNvbnN0IHdpZGdldFJlY3QgPSB7IHdpZHRoOiA1MCwgaGVpZ2h0OiA1MCB9O1xuICAgIGNvbnN0IHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgY29uc3Qgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIGNvbnN0IHNuYXBNYXJnaW4gPSAyMDsgLy8gRGlzdGFuY2UgZnJvbSBlZGdlIHRvIHNuYXAgdG9cblxuICAgIC8vIENhbGN1bGF0ZSBkaXN0YW5jZXMgdG8gZWFjaCBlZGdlXG4gICAgY29uc3QgZGlzdGFuY2VUb0xlZnQgPSB4O1xuICAgIGNvbnN0IGRpc3RhbmNlVG9SaWdodCA9IHdpbmRvd1dpZHRoIC0gKHggKyB3aWRnZXRSZWN0LndpZHRoKTtcbiAgICBjb25zdCBkaXN0YW5jZVRvVG9wID0geTtcbiAgICBjb25zdCBkaXN0YW5jZVRvQm90dG9tID0gd2luZG93SGVpZ2h0IC0gKHkgKyB3aWRnZXRSZWN0LmhlaWdodCk7XG5cbiAgICAvLyBGaW5kIHRoZSBuZWFyZXN0IGVkZ2VcbiAgICBjb25zdCBtaW5EaXN0YW5jZSA9IE1hdGgubWluKGRpc3RhbmNlVG9MZWZ0LCBkaXN0YW5jZVRvUmlnaHQsIGRpc3RhbmNlVG9Ub3AsIGRpc3RhbmNlVG9Cb3R0b20pO1xuXG4gICAgbGV0IHNuYXBwZWRYID0geDtcbiAgICBsZXQgc25hcHBlZFkgPSB5O1xuXG4gICAgLy8gU25hcCB0byB0aGUgbmVhcmVzdCBlZGdlIGlmIHdpZGdldCBpcyBwYXJ0aWFsbHkgaGlkZGVuXG4gICAgaWYgKHggPCAwIHx8IHggKyB3aWRnZXRSZWN0LndpZHRoID4gd2luZG93V2lkdGggfHwgeSA8IDAgfHwgeSArIHdpZGdldFJlY3QuaGVpZ2h0ID4gd2luZG93SGVpZ2h0KSB7XG4gICAgICBpZiAobWluRGlzdGFuY2UgPT09IGRpc3RhbmNlVG9MZWZ0KSB7XG4gICAgICAgIHNuYXBwZWRYID0gc25hcE1hcmdpbjtcbiAgICAgIH0gZWxzZSBpZiAobWluRGlzdGFuY2UgPT09IGRpc3RhbmNlVG9SaWdodCkge1xuICAgICAgICBzbmFwcGVkWCA9IHdpbmRvd1dpZHRoIC0gd2lkZ2V0UmVjdC53aWR0aCAtIHNuYXBNYXJnaW47XG4gICAgICB9IGVsc2UgaWYgKG1pbkRpc3RhbmNlID09PSBkaXN0YW5jZVRvVG9wKSB7XG4gICAgICAgIHNuYXBwZWRZID0gc25hcE1hcmdpbjtcbiAgICAgIH0gZWxzZSBpZiAobWluRGlzdGFuY2UgPT09IGRpc3RhbmNlVG9Cb3R0b20pIHtcbiAgICAgICAgc25hcHBlZFkgPSB3aW5kb3dIZWlnaHQgLSB3aWRnZXRSZWN0LmhlaWdodCAtIHNuYXBNYXJnaW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgeDogc25hcHBlZFgsIHk6IHNuYXBwZWRZIH07XG4gIH1cblxuICAvLyBNb3VzZSBldmVudHMgZm9yIG1haW4gYnV0dG9uXG4gIG1haW5CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBkcmFnU3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBzdGFydFBvc2l0aW9uID0geyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSB9O1xuICAgIGhhc01vdmVkV2hpbGVEcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgY29uc3QgcmVjdCA9IHdpZGdldCEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgZHJhZ09mZnNldC54ID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgIGRyYWdPZmZzZXQueSA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgbWFpbkJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiZHJhZ2dpbmdcIik7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGhhbmRsZU1vdXNlTW92ZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgaGFuZGxlTW91c2VVcCk7XG4gIH0pO1xuXG4gIC8vIEltcHJvdmVkIGhvdmVyIGV2ZW50cyBmb3IgbWVudSB3aXRoIGJldHRlciBib3VuZGFyeSBkZXRlY3Rpb25cbiAgbWFpbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgaWYgKCFpc0RyYWdnaW5nKSB7XG4gICAgICAvLyBDbGVhciBhbnkgcGVuZGluZyBjbG9zZSB0aW1lb3V0XG4gICAgICBpZiAobWVudUNsb3NlVGltZW91dCkge1xuICAgICAgICBjbGVhclRpbWVvdXQobWVudUNsb3NlVGltZW91dCk7XG4gICAgICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBudWxsO1xuICAgICAgfVxuICAgICAgb3Blbk1lbnUoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEtlZXAgbWVudSBvcGVuIHdoZW4gaG92ZXJpbmcgb3ZlciBtZW51IGl0ZW1zXG4gIG1lbnUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xuICAgIGlmIChtZW51Q2xvc2VUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQobWVudUNsb3NlVGltZW91dCk7XG4gICAgICBtZW51Q2xvc2VUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIENsb3NlIG1lbnUgd2hlbiBsZWF2aW5nIG1lbnUgYXJlYVxuICBtZW51LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBpZiAoIWlzRHJhZ2dpbmcpIHtcbiAgICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY2xvc2VNZW51KCk7XG4gICAgICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBudWxsO1xuICAgICAgfSwgMTAwKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIENsb3NlIG1lbnUgd2hlbiBsZWF2aW5nIG1haW4gYnV0dG9uIGFyZWEgKGJ1dCBub3QgaWYgZ29pbmcgdG8gbWVudSlcbiAgbWFpbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoZSkgPT4ge1xuICAgIGlmICghaXNEcmFnZ2luZykge1xuICAgICAgLy8gQ2hlY2sgaWYgbW91c2UgaXMgbW92aW5nIHRvd2FyZHMgdGhlIG1lbnVcbiAgICAgIGNvbnN0IHJlY3QgPSBtZW51LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3QgbW91c2VYID0gZS5jbGllbnRYO1xuICAgICAgY29uc3QgbW91c2VZID0gZS5jbGllbnRZO1xuXG4gICAgICAvLyBJZiBtb3VzZSBpcyB3aXRoaW4gbWVudSBib3VuZHMgb3IgbW92aW5nIHRvd2FyZHMgbWVudSwgZG9uJ3QgY2xvc2VcbiAgICAgIGNvbnN0IGlzTmVhck1lbnUgPSBtb3VzZVggPj0gcmVjdC5sZWZ0IC0gMTAgJiYgbW91c2VYIDw9IHJlY3QucmlnaHQgKyAxMCAmJiBtb3VzZVkgPj0gcmVjdC50b3AgLSAxMCAmJiBtb3VzZVkgPD0gcmVjdC5ib3R0b20gKyAxMDtcblxuICAgICAgaWYgKCFpc05lYXJNZW51KSB7XG4gICAgICAgIG1lbnVDbG9zZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjbG9zZU1lbnUoKTtcbiAgICAgICAgICBtZW51Q2xvc2VUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlTW92ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgY29uc3QgdGltZURpZmYgPSBEYXRlLm5vdygpIC0gZHJhZ1N0YXJ0VGltZTtcbiAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyhlLmNsaWVudFggLSBzdGFydFBvc2l0aW9uLngsIDIpICsgTWF0aC5wb3coZS5jbGllbnRZIC0gc3RhcnRQb3NpdGlvbi55LCAyKSk7XG5cbiAgICAvLyBTdGFydCBkcmFnZ2luZyBpZiBtb3ZlZCA+IDNweCBvciBoZWxkIGZvciA+IDEwMG1zXG4gICAgaWYgKCFpc0RyYWdnaW5nICYmIChkaXN0YW5jZSA+IDMgfHwgdGltZURpZmYgPiAxMDApKSB7XG4gICAgICBpc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgIGhhc01vdmVkV2hpbGVEcmFnZ2luZyA9IHRydWU7XG4gICAgICBjbG9zZU1lbnUoKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gXCJncmFiYmluZ1wiO1xuICAgIH1cblxuICAgIGlmIChpc0RyYWdnaW5nKSB7XG4gICAgICBjb25zdCBuZXdYID0gZS5jbGllbnRYIC0gZHJhZ09mZnNldC54O1xuICAgICAgY29uc3QgbmV3WSA9IGUuY2xpZW50WSAtIGRyYWdPZmZzZXQueTtcblxuICAgICAgLy8gQXBwbHkgYm91bmRhcnkgY29uc3RyYWludHNcbiAgICAgIGNvbnN0IGNvbnN0cmFpbmVkUG9zaXRpb24gPSBjb25zdHJhaW5Ub0JvdW5kcyhuZXdYLCBuZXdZKTtcblxuICAgICAgLy8gVXNlIHRyYW5zZm9ybSBmb3Igc21vb3RoZXIgbW92ZW1lbnRcbiAgICAgIHdpZGdldCEuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke2NvbnN0cmFpbmVkUG9zaXRpb24ueH1weCwgJHtjb25zdHJhaW5lZFBvc2l0aW9uLnl9cHgpYDtcbiAgICAgIHdpZGdldCEuc3R5bGUubGVmdCA9IFwiMFwiO1xuICAgICAgd2lkZ2V0IS5zdHlsZS50b3AgPSBcIjBcIjtcblxuICAgICAgbGFzdFBvc2l0aW9uID0geyB4OiBjb25zdHJhaW5lZFBvc2l0aW9uLngsIHk6IGNvbnN0cmFpbmVkUG9zaXRpb24ueSB9O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlVXAoKSB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBoYW5kbGVNb3VzZU1vdmUpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGhhbmRsZU1vdXNlVXApO1xuXG4gICAgaWYgKG1haW5CdXR0b24pIHtcbiAgICAgIG1haW5CdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImRyYWdnaW5nXCIpO1xuICAgIH1cbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IFwiXCI7XG5cbiAgICBpZiAoaXNEcmFnZ2luZykge1xuICAgICAgLy8gQXBwbHkgZWRnZSBzbmFwcGluZyBpZiB3aWRnZXQgaXMgcGFydGlhbGx5IG91dHNpZGUgYm91bmRzXG4gICAgICBjb25zdCBzbmFwcGVkUG9zaXRpb24gPSBzbmFwVG9OZWFyZXN0RWRnZShsYXN0UG9zaXRpb24ueCwgbGFzdFBvc2l0aW9uLnkpO1xuXG4gICAgICAvLyBBbmltYXRlIHRvIHNuYXBwZWQgcG9zaXRpb24gaWYgZGlmZmVyZW50IGZyb20gY3VycmVudCBwb3NpdGlvblxuICAgICAgaWYgKHNuYXBwZWRQb3NpdGlvbi54ICE9PSBsYXN0UG9zaXRpb24ueCB8fCBzbmFwcGVkUG9zaXRpb24ueSAhPT0gbGFzdFBvc2l0aW9uLnkpIHtcbiAgICAgICAgd2lkZ2V0IS5zdHlsZS50cmFuc2l0aW9uID0gXCJhbGwgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpXCI7XG4gICAgICAgIHdpZGdldCEuc3R5bGUubGVmdCA9IHNuYXBwZWRQb3NpdGlvbi54ICsgXCJweFwiO1xuICAgICAgICB3aWRnZXQhLnN0eWxlLnRvcCA9IHNuYXBwZWRQb3NpdGlvbi55ICsgXCJweFwiO1xuICAgICAgICB3aWRnZXQhLnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRyYW5zaXRpb24gYWZ0ZXIgYW5pbWF0aW9uXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmICh3aWRnZXQpIHtcbiAgICAgICAgICAgIHdpZGdldC5zdHlsZS50cmFuc2l0aW9uID0gXCJcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDMwMCk7XG5cbiAgICAgICAgbGFzdFBvc2l0aW9uID0gc25hcHBlZFBvc2l0aW9uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXBwbHkgZmluYWwgcG9zaXRpb24gbm9ybWFsbHlcbiAgICAgICAgd2lkZ2V0IS5zdHlsZS5sZWZ0ID0gbGFzdFBvc2l0aW9uLnggKyBcInB4XCI7XG4gICAgICAgIHdpZGdldCEuc3R5bGUudG9wID0gbGFzdFBvc2l0aW9uLnkgKyBcInB4XCI7XG4gICAgICAgIHdpZGdldCEuc3R5bGUudHJhbnNmb3JtID0gXCJcIjtcbiAgICAgIH1cblxuICAgICAgc2F2ZVdpZGdldFBvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgaXNEcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgLy8gT3BlbiBtZW51IGFmdGVyIGRyYWcgaWYgbm90IG1vdmVkIG11Y2hcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICghaGFzTW92ZWRXaGlsZURyYWdnaW5nKSB7XG4gICAgICAgIG9wZW5NZW51KCk7XG4gICAgICB9XG4gICAgfSwgNTApO1xuICB9XG5cbiAgLy8gTWVudSBidXR0b24gY2xpY2tzXG4gIG1lbnU/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuICAgIGNvbnN0IGFjdGlvbiA9IHRhcmdldC5kYXRhc2V0LmFjdGlvbjtcblxuICAgIGlmIChhY3Rpb24pIHtcbiAgICAgIGhhbmRsZU1lbnVBY3Rpb24oYWN0aW9uKTtcbiAgICAgIGNsb3NlTWVudSgpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9wZW5NZW51KCkge1xuICBpZiAoaXNEcmFnZ2luZykgcmV0dXJuO1xuICBjb25zdCBtZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3aWRnZXQtbWVudVwiKTtcbiAgaWYgKG1lbnUpIHtcbiAgICBtZW51LmNsYXNzTGlzdC5hZGQoXCJvcGVuXCIpO1xuICAgIGlzTWVudU9wZW4gPSB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNsb3NlTWVudSgpIHtcbiAgY29uc3QgbWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2lkZ2V0LW1lbnVcIik7XG4gIGlmIChtZW51KSB7XG4gICAgbWVudS5jbGFzc0xpc3QucmVtb3ZlKFwib3BlblwiKTtcbiAgICBpc01lbnVPcGVuID0gZmFsc2U7XG4gIH1cbiAgLy8gQ2xlYXIgYW55IHBlbmRpbmcgdGltZW91dFxuICBpZiAobWVudUNsb3NlVGltZW91dCkge1xuICAgIGNsZWFyVGltZW91dChtZW51Q2xvc2VUaW1lb3V0KTtcbiAgICBtZW51Q2xvc2VUaW1lb3V0ID0gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVNZW51QWN0aW9uKGFjdGlvbjogc3RyaW5nKSB7XG4gIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgY2FzZSBcImFkZFwiOlxuICAgICAgY3JlYXRlTm90ZUVkaXRvcigpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIm5vdGVzXCI6XG4gICAgICB0b2dnbGVOb3Rlc1BhbmVsKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwic2V0dGluZ3NcIjpcbiAgICAgIG9wZW5TZXR0aW5nc01vZGFsKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiY2xvc2VcIjpcbiAgICAgIGhpZGVXaWRnZXQoKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5vdGVFZGl0b3IoaW5pdGlhbFRleHQ6IHN0cmluZyA9IFwiXCIpIHtcbiAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBtb2RhbC5jbGFzc05hbWUgPSBcInN0aWNreS1tb2RhbFwiO1xuICBtb2RhbC5pbm5lckhUTUwgPSBgXG4gICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1oZWFkZXJcIj5cbiAgICAgICAgPGgzIGNsYXNzPVwibW9kYWwtdGl0bGVcIj7inI/vuI8gTmV3IE5vdGU8L2gzPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwibW9kYWwtY2xvc2VcIj7DlzwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgICA8dGV4dGFyZWEgY2xhc3M9XCJub3RlLWlucHV0XCIgcGxhY2Vob2xkZXI9XCJXcml0ZSB5b3VyIG5vdGUgaGVyZS4uLlwiIGF1dG9mb2N1cz4ke2luaXRpYWxUZXh0fTwvdGV4dGFyZWE+XG4gICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWdyb3VwXCI+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgc2F2ZS1ub3RlXCI+8J+SviBTYXZlIE5vdGU8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5IGNhbmNlbC1ub3RlXCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1vZGFsKTtcbiAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5jbGFzc0xpc3QuYWRkKFwib3BlblwiKSwgMTApO1xuXG4gIGNvbnN0IGNsb3NlQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihcIi5tb2RhbC1jbG9zZVwiKTtcbiAgY29uc3Qgc2F2ZUJ0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIuc2F2ZS1ub3RlXCIpO1xuICBjb25zdCBjYW5jZWxCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKFwiLmNhbmNlbC1ub3RlXCIpO1xuICBjb25zdCB0ZXh0YXJlYSA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIubm90ZS1pbnB1dFwiKSBhcyBIVE1MVGV4dEFyZWFFbGVtZW50O1xuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XG4gICAgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZShcIm9wZW5cIik7XG4gICAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5yZW1vdmUoKSwgMzAwKTtcbiAgfVxuXG4gIGNsb3NlQnRuPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2VNb2RhbCk7XG4gIGNhbmNlbEJ0bj8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlTW9kYWwpO1xuXG4gIHNhdmVCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgY29uc3QgY29udGVudCA9IHRleHRhcmVhLnZhbHVlLnRyaW0oKTtcbiAgICBpZiAoY29udGVudCkge1xuICAgICAgc2F2ZU5vdGUoY29udGVudCk7XG4gICAgICBjbG9zZU1vZGFsKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBFU0MgdG8gY2xvc2VcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgZnVuY3Rpb24gZXNjSGFuZGxlcihlKSB7XG4gICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICBjbG9zZU1vZGFsKCk7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBlc2NIYW5kbGVyKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB0b2dnbGVOb3Rlc1BhbmVsKCkge1xuICBsZXQgcGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm5vdGVzLXBhbmVsXCIpIGFzIEhUTUxFbGVtZW50O1xuXG4gIGlmICghcGFuZWwpIHtcbiAgICBwYW5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcGFuZWwuY2xhc3NOYW1lID0gXCJub3Rlcy1wYW5lbFwiO1xuICAgIHBhbmVsLmlubmVySFRNTCA9IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJub3Rlcy1oZWFkZXJcIj7wn5OLIFJlY2VudCBOb3RlczwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIm5vdGVzLWxpc3RcIiBpZD1cIm5vdGVzLWxpc3RcIj48L2Rpdj5cbiAgICBgO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocGFuZWwpO1xuICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgfVxuXG4gIHBhbmVsLmNsYXNzTGlzdC50b2dnbGUoXCJvcGVuXCIpO1xuXG4gIGlmIChwYW5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJvcGVuXCIpKSB7XG4gICAgcmVmcmVzaE5vdGVzTGlzdCgpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIG91dHNpZGVDbGlja0hhbmRsZXIoZSkge1xuICAgICAgICBpZiAoIXBhbmVsLmNvbnRhaW5zKGUudGFyZ2V0IGFzIE5vZGUpKSB7XG4gICAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnJlbW92ZShcIm9wZW5cIik7XG4gICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG91dHNpZGVDbGlja0hhbmRsZXIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LCAxMDApO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9wZW5TZXR0aW5nc01vZGFsKCkge1xuICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG1vZGFsLmNsYXNzTmFtZSA9IFwic3RpY2t5LW1vZGFsXCI7XG4gIG1vZGFsLmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPlxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxuICAgICAgICA8aDMgY2xhc3M9XCJtb2RhbC10aXRsZVwiPuKame+4jyBTZXR0aW5nczwvaDM+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbC1jbG9zZVwiPsOXPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgc3R5bGU9XCJsaW5lLWhlaWdodDogMS42O1wiPlxuICAgICAgICA8aDQ+8J+OriBLZXlib2FyZCBTaG9ydGN1dHM8L2g0PlxuICAgICAgICA8cD48c3Ryb25nPkNtZC9DdHJsICsgU2hpZnQgKyBTOjwvc3Ryb25nPiBDcmVhdGUgbmV3IG5vdGU8L3A+XG4gICAgICAgIDxwPjxzdHJvbmc+Q21kL0N0cmwgKyBTaGlmdCArIFc6PC9zdHJvbmc+IFRvZ2dsZSB3aWRnZXQgdmlzaWJpbGl0eTwvcD5cbiAgICAgICAgPHA+PHN0cm9uZz5FU0M6PC9zdHJvbmc+IENsb3NlIG1vZGFsczwvcD5cbiAgICAgICAgXG4gICAgICAgIDxoNCBzdHlsZT1cIm1hcmdpbi10b3A6IDI1cHg7XCI+4oS577iPIEFib3V0PC9oND5cbiAgICAgICAgPHA+PHN0cm9uZz5TdGlja3lOb3RlQUkgdjIuMDwvc3Ryb25nPjwvcD5cbiAgICAgICAgPHA+U21hcnQgZmxvYXRpbmcgbm90ZXMgZm9yIGFueSB3ZWJwYWdlPC9wPlxuICAgICAgICBcbiAgICAgICAgPGg0IHN0eWxlPVwibWFyZ2luLXRvcDogMjVweDtcIj7wn46vIFVzYWdlIFRpcHM8L2g0PlxuICAgICAgICA8cD7igKIgSG92ZXIgb3ZlciB0aGUg4pyoIGJ1dHRvbiB0byBzZWUgbWVudTwvcD5cbiAgICAgICAgPHA+4oCiIENsaWNrIGFuZCBkcmFnIHRvIG1vdmUgdGhlIHdpZGdldDwvcD5cbiAgICAgICAgPHA+4oCiIFVzZSBrZXlib2FyZCBzaG9ydGN1dHMgZm9yIHF1aWNrIGFjY2VzczwvcD5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbi1ncm91cFwiPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnkgY2xvc2Utc2V0dGluZ3NcIj5DbG9zZTwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG5cbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtb2RhbCk7XG4gIHNldFRpbWVvdXQoKCkgPT4gbW9kYWwuY2xhc3NMaXN0LmFkZChcIm9wZW5cIiksIDEwKTtcblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCkge1xuICAgIG1vZGFsLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gbW9kYWwucmVtb3ZlKCksIDMwMCk7XG4gIH1cblxuICBtb2RhbC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsLWNsb3NlXCIpPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2VNb2RhbCk7XG4gIG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2Utc2V0dGluZ3NcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZU1vZGFsKTtcbn1cblxuZnVuY3Rpb24gaGlkZVdpZGdldCgpIHtcbiAgaWYgKHdpZGdldCkge1xuICAgIHdpZGdldC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hvd1dpZGdldCgpIHtcbiAgaWYgKHdpZGdldCkge1xuICAgIHdpZGdldC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVOb3RlKGNvbnRlbnQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoXCJzdGlja3lOb3Rlc1wiKTtcbiAgICBjb25zdCBub3RlcyA9IHJlc3VsdC5zdGlja3lOb3RlcyB8fCBbXTtcblxuICAgIGNvbnN0IG5ld05vdGUgPSB7XG4gICAgICBpZDogRGF0ZS5ub3coKS50b1N0cmluZygpLFxuICAgICAgY29udGVudCxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICB9O1xuXG4gICAgbm90ZXMudW5zaGlmdChuZXdOb3RlKTtcblxuICAgIC8vIEtlZXAgb25seSBsYXN0IDUwIG5vdGVzXG4gICAgaWYgKG5vdGVzLmxlbmd0aCA+IDUwKSB7XG4gICAgICBub3Rlcy5zcGxpY2UoNTApO1xuICAgIH1cblxuICAgIGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoeyBzdGlja3lOb3Rlczogbm90ZXMgfSk7XG4gICAgY29uc29sZS5sb2coXCJOb3RlIHNhdmVkIHN1Y2Nlc3NmdWxseVwiKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igc2F2aW5nIG5vdGU6XCIsIGVycm9yKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoTm90ZXNMaXN0KCkge1xuICBjb25zdCBub3Rlc0xpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vdGVzLWxpc3RcIik7XG4gIGlmICghbm90ZXNMaXN0KSByZXR1cm47XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFwic3RpY2t5Tm90ZXNcIik7XG4gICAgY29uc3Qgbm90ZXMgPSByZXN1bHQuc3RpY2t5Tm90ZXMgfHwgW107XG5cbiAgICBpZiAobm90ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBub3Rlc0xpc3QuaW5uZXJIVE1MID0gJzxkaXYgc3R5bGU9XCJwYWRkaW5nOiAyMHB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7IGNvbG9yOiAjOTk5O1wiPk5vIG5vdGVzIHlldDwvZGl2Pic7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbm90ZXNMaXN0LmlubmVySFRNTCA9IG5vdGVzXG4gICAgICAuc2xpY2UoMCwgMTApXG4gICAgICAubWFwKFxuICAgICAgICAobm90ZTogYW55KSA9PiBgXG4gICAgICA8ZGl2IGNsYXNzPVwibm90ZS1pdGVtXCIgZGF0YS1ub3RlLWlkPVwiJHtub3RlLmlkfVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibm90ZS1wcmV2aWV3XCI+JHtub3RlLmNvbnRlbnQuc3Vic3RyaW5nKDAsIDEwMCl9JHtub3RlLmNvbnRlbnQubGVuZ3RoID4gMTAwID8gXCIuLi5cIiA6IFwiXCJ9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJub3RlLWRhdGVcIj4ke25ldyBEYXRlKG5vdGUudGltZXN0YW1wKS50b0xvY2FsZURhdGVTdHJpbmcoKX08L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGBcbiAgICAgIClcbiAgICAgIC5qb2luKFwiXCIpO1xuXG4gICAgLy8gQ2xpY2sgdG8gZWRpdCBub3RlXG4gICAgbm90ZXNMaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubm90ZS1pdGVtXCIpLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgY29uc3Qgbm90ZUlkID0gKGl0ZW0gYXMgSFRNTEVsZW1lbnQpLmRhdGFzZXQubm90ZUlkO1xuICAgICAgICBjb25zdCBub3RlID0gbm90ZXMuZmluZCgobjogYW55KSA9PiBuLmlkID09PSBub3RlSWQpO1xuICAgICAgICBpZiAobm90ZSkge1xuICAgICAgICAgIGVkaXROb3RlKG5vdGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9hZGluZyBub3RlczpcIiwgZXJyb3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVkaXROb3RlKG5vdGU6IGFueSkge1xuICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG1vZGFsLmNsYXNzTmFtZSA9IFwic3RpY2t5LW1vZGFsXCI7XG4gIG1vZGFsLmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPlxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxuICAgICAgICA8aDMgY2xhc3M9XCJtb2RhbC10aXRsZVwiPuKcj++4jyBFZGl0IE5vdGU8L2gzPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwibW9kYWwtY2xvc2VcIj7DlzwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgICA8dGV4dGFyZWEgY2xhc3M9XCJub3RlLWlucHV0XCIgYXV0b2ZvY3VzPiR7bm90ZS5jb250ZW50fTwvdGV4dGFyZWE+XG4gICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWdyb3VwXCI+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgdXBkYXRlLW5vdGVcIj7wn5K+IFVwZGF0ZSBOb3RlPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG5cIiBzdHlsZT1cImJhY2tncm91bmQ6ICNkYzM1NDU7IGNvbG9yOiB3aGl0ZTtcIiBpZD1cImRlbGV0ZS1ub3RlXCI+8J+Xke+4jyBEZWxldGU8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5IGNhbmNlbC1lZGl0XCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1vZGFsKTtcbiAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5jbGFzc0xpc3QuYWRkKFwib3BlblwiKSwgMTApO1xuXG4gIGNvbnN0IHRleHRhcmVhID0gbW9kYWwucXVlcnlTZWxlY3RvcihcIi5ub3RlLWlucHV0XCIpIGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQ7XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpIHtcbiAgICBtb2RhbC5jbGFzc0xpc3QucmVtb3ZlKFwib3BlblwiKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IG1vZGFsLnJlbW92ZSgpLCAzMDApO1xuICB9XG5cbiAgbW9kYWwucXVlcnlTZWxlY3RvcihcIi5tb2RhbC1jbG9zZVwiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlTW9kYWwpO1xuICBtb2RhbC5xdWVyeVNlbGVjdG9yKFwiLmNhbmNlbC1lZGl0XCIpPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2VNb2RhbCk7XG5cbiAgbW9kYWwucXVlcnlTZWxlY3RvcihcIi51cGRhdGUtbm90ZVwiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBjb250ZW50ID0gdGV4dGFyZWEudmFsdWUudHJpbSgpO1xuICAgIGlmIChjb250ZW50KSB7XG4gICAgICBhd2FpdCB1cGRhdGVOb3RlKG5vdGUuaWQsIGNvbnRlbnQpO1xuICAgICAgcmVmcmVzaE5vdGVzTGlzdCgpO1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgbW9kYWwucXVlcnlTZWxlY3RvcihcIiNkZWxldGUtbm90ZVwiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcbiAgICBpZiAoY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBub3RlP1wiKSkge1xuICAgICAgYXdhaXQgZGVsZXRlTm90ZShub3RlLmlkKTtcbiAgICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgICAgIGNsb3NlTW9kYWwoKTtcbiAgICB9XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVOb3RlKG5vdGVJZDogc3RyaW5nLCBuZXdDb250ZW50OiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFwic3RpY2t5Tm90ZXNcIik7XG4gICAgY29uc3Qgbm90ZXMgPSByZXN1bHQuc3RpY2t5Tm90ZXMgfHwgW107XG5cbiAgICBjb25zdCBub3RlSW5kZXggPSBub3Rlcy5maW5kSW5kZXgoKG5vdGU6IGFueSkgPT4gbm90ZS5pZCA9PT0gbm90ZUlkKTtcbiAgICBpZiAobm90ZUluZGV4ICE9PSAtMSkge1xuICAgICAgbm90ZXNbbm90ZUluZGV4XS5jb250ZW50ID0gbmV3Q29udGVudDtcbiAgICAgIG5vdGVzW25vdGVJbmRleF0udGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCh7IHN0aWNreU5vdGVzOiBub3RlcyB9KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIHVwZGF0aW5nIG5vdGU6XCIsIGVycm9yKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVOb3RlKG5vdGVJZDogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChcInN0aWNreU5vdGVzXCIpO1xuICAgIGNvbnN0IG5vdGVzID0gcmVzdWx0LnN0aWNreU5vdGVzIHx8IFtdO1xuXG4gICAgY29uc3QgZmlsdGVyZWROb3RlcyA9IG5vdGVzLmZpbHRlcigobm90ZTogYW55KSA9PiBub3RlLmlkICE9PSBub3RlSWQpO1xuICAgIGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoeyBzdGlja3lOb3RlczogZmlsdGVyZWROb3RlcyB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZGVsZXRpbmcgbm90ZTpcIiwgZXJyb3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldHVwS2V5Ym9hcmRTaG9ydGN1dHMoKSB7XG4gIC8vIEtleWJvYXJkIHNob3J0Y3V0cyBhcmUgbm93IGhhbmRsZWQgYnkgdGhlIGJhY2tncm91bmQgc2NyaXB0IHZpYSBjb21tYW5kcyBBUElcbiAgLy8gVGhpcyBmdW5jdGlvbiBpcyBrZXB0IGZvciBmdXR1cmUgbG9jYWwga2V5Ym9hcmQgc2hvcnRjdXRzIGlmIG5lZWRlZFxuICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogS2V5Ym9hcmQgc2hvcnRjdXRzIGRlbGVnYXRlZCB0byBiYWNrZ3JvdW5kIHNjcmlwdFwiKTtcbn1cblxuZnVuY3Rpb24gc2V0dXBNZXNzYWdlTGlzdGVuZXIoKSB7XG4gIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IFJlY2VpdmVkIG1lc3NhZ2U6XCIsIG1lc3NhZ2UpO1xuXG4gICAgLy8gSGFuZGxlIGtleWJvYXJkIHNob3J0Y3V0IGNvbW1hbmRzIGZyb20gYmFja2dyb3VuZCBzY3JpcHRcbiAgICBpZiAobWVzc2FnZS5hY3Rpb24gPT09IFwidG9nZ2xlLXdpZGdldFwiKSB7XG4gICAgICBjb25zdCB3aWRnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0aWNreS1ub3RlLXdpZGdldFwiKTtcbiAgICAgIGlmICh3aWRnZXQpIHtcbiAgICAgICAgaWYgKHdpZGdldC5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIikge1xuICAgICAgICAgIHNob3dXaWRnZXQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoaWRlV2lkZ2V0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2UuYWN0aW9uID09PSBcIm5ldy1ub3RlXCIpIHtcbiAgICAgIGNyZWF0ZU5vdGVFZGl0b3IoKTtcbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIG90aGVyIGFjdGlvbnNcbiAgICBpZiAobWVzc2FnZS5hY3Rpb24gPT09IFwiY3JlYXRlLW5vdGUtd2l0aC1zZWxlY3Rpb25cIikge1xuICAgICAgLy8gSGFuZGxlIGNvbnRleHQgbWVudSBub3RlIGNyZWF0aW9uIHdpdGggc2VsZWN0ZWQgdGV4dFxuICAgICAgY3JlYXRlTm90ZUVkaXRvcihtZXNzYWdlLnNlbGVjdGVkVGV4dCB8fCBcIlwiKTtcbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2UuYWN0aW9uID09PSBcInRvZ2dsZVN0ZWFsdGhcIikge1xuICAgICAgLy8gSGFuZGxlIHN0ZWFsdGggbW9kZSB0b2dnbGUgZnJvbSBwb3B1cFxuICAgICAgY29uc3Qgd2lkZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGlja3ktbm90ZS13aWRnZXRcIik7XG4gICAgICBpZiAod2lkZ2V0KSB7XG4gICAgICAgIGlmIChtZXNzYWdlLmVuYWJsZWQpIHtcbiAgICAgICAgICB3aWRnZXQuc3R5bGUub3BhY2l0eSA9IFwiMC4zXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2lkZ2V0LnN0eWxlLm9wYWNpdHkgPSBcIjFcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwiVW5rbm93biBhY3Rpb25cIiB9KTtcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVXaWRnZXRQb3NpdGlvbigpIHtcbiAgaWYgKCF3aWRnZXQpIHJldHVybjtcblxuICBjb25zdCByZWN0ID0gd2lkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBjb25zdCBwb3NpdGlvbiA9IHtcbiAgICB4OiByZWN0LmxlZnQsXG4gICAgeTogcmVjdC50b3AsXG4gIH07XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KHsgd2lkZ2V0UG9zaXRpb246IHBvc2l0aW9uIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBzYXZpbmcgcG9zaXRpb246XCIsIGVycm9yKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkV2lkZ2V0UG9zaXRpb24oKSB7XG4gIGlmICghd2lkZ2V0KSByZXR1cm47XG5cbiAgLy8gUmVzZXQgdG8gZGVmYXVsdCBwb3NpdGlvbiBvbiBwYWdlIHJlZnJlc2hcbiAgLy8gVGhlIHdpZGdldCB3aWxsIHVzZSB0aGUgZGVmYXVsdCBDU1MgcG9zaXRpb24gKHRvcDogNTBweCwgcmlnaHQ6IDUwcHgpXG4gIHdpZGdldC5zdHlsZS5sZWZ0ID0gXCJcIjtcbiAgd2lkZ2V0LnN0eWxlLnRvcCA9IFwiXCI7XG4gIHdpZGdldC5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiO1xuXG4gIC8vIENsZWFyIGFueSBzYXZlZCBwb3NpdGlvblxuICB0cnkge1xuICAgIGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoXCJ3aWRnZXRQb3NpdGlvblwiKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgY2xlYXJpbmcgcG9zaXRpb246XCIsIGVycm9yKTtcbiAgfVxufVxuIiwiZnVuY3Rpb24gcHJpbnQobWV0aG9kLCAuLi5hcmdzKSB7XG4gIGlmIChpbXBvcnQubWV0YS5lbnYuTU9ERSA9PT0gXCJwcm9kdWN0aW9uXCIpIHJldHVybjtcbiAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSBcInN0cmluZ1wiKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGFyZ3Muc2hpZnQoKTtcbiAgICBtZXRob2QoYFt3eHRdICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICBtZXRob2QoXCJbd3h0XVwiLCAuLi5hcmdzKTtcbiAgfVxufVxuZXhwb3J0IGNvbnN0IGxvZ2dlciA9IHtcbiAgZGVidWc6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmRlYnVnLCAuLi5hcmdzKSxcbiAgbG9nOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5sb2csIC4uLmFyZ3MpLFxuICB3YXJuOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS53YXJuLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmVycm9yLCAuLi5hcmdzKVxufTtcbiIsImltcG9ydCB7IGJyb3dzZXIgfSBmcm9tIFwid3h0L2Jyb3dzZXJcIjtcbmV4cG9ydCBjbGFzcyBXeHRMb2NhdGlvbkNoYW5nZUV2ZW50IGV4dGVuZHMgRXZlbnQge1xuICBjb25zdHJ1Y3RvcihuZXdVcmwsIG9sZFVybCkge1xuICAgIHN1cGVyKFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQuRVZFTlRfTkFNRSwge30pO1xuICAgIHRoaXMubmV3VXJsID0gbmV3VXJsO1xuICAgIHRoaXMub2xkVXJsID0gb2xkVXJsO1xuICB9XG4gIHN0YXRpYyBFVkVOVF9OQU1FID0gZ2V0VW5pcXVlRXZlbnROYW1lKFwid3h0OmxvY2F0aW9uY2hhbmdlXCIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFVuaXF1ZUV2ZW50TmFtZShldmVudE5hbWUpIHtcbiAgcmV0dXJuIGAke2Jyb3dzZXI/LnJ1bnRpbWU/LmlkfToke2ltcG9ydC5tZXRhLmVudi5FTlRSWVBPSU5UfToke2V2ZW50TmFtZX1gO1xufVxuIiwiaW1wb3J0IHsgV3h0TG9jYXRpb25DaGFuZ2VFdmVudCB9IGZyb20gXCIuL2N1c3RvbS1ldmVudHMubWpzXCI7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTG9jYXRpb25XYXRjaGVyKGN0eCkge1xuICBsZXQgaW50ZXJ2YWw7XG4gIGxldCBvbGRVcmw7XG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogRW5zdXJlIHRoZSBsb2NhdGlvbiB3YXRjaGVyIGlzIGFjdGl2ZWx5IGxvb2tpbmcgZm9yIFVSTCBjaGFuZ2VzLiBJZiBpdCdzIGFscmVhZHkgd2F0Y2hpbmcsXG4gICAgICogdGhpcyBpcyBhIG5vb3AuXG4gICAgICovXG4gICAgcnVuKCkge1xuICAgICAgaWYgKGludGVydmFsICE9IG51bGwpIHJldHVybjtcbiAgICAgIG9sZFVybCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgICBpbnRlcnZhbCA9IGN0eC5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGxldCBuZXdVcmwgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgICBpZiAobmV3VXJsLmhyZWYgIT09IG9sZFVybC5ocmVmKSB7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQobmV3VXJsLCBvbGRVcmwpKTtcbiAgICAgICAgICBvbGRVcmwgPSBuZXdVcmw7XG4gICAgICAgIH1cbiAgICAgIH0sIDFlMyk7XG4gICAgfVxuICB9O1xufVxuIiwiaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gXCJ3eHQvYnJvd3NlclwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIi4uL3V0aWxzL2ludGVybmFsL2xvZ2dlci5tanNcIjtcbmltcG9ydCB7XG4gIGdldFVuaXF1ZUV2ZW50TmFtZVxufSBmcm9tIFwiLi9pbnRlcm5hbC9jdXN0b20tZXZlbnRzLm1qc1wiO1xuaW1wb3J0IHsgY3JlYXRlTG9jYXRpb25XYXRjaGVyIH0gZnJvbSBcIi4vaW50ZXJuYWwvbG9jYXRpb24td2F0Y2hlci5tanNcIjtcbmV4cG9ydCBjbGFzcyBDb250ZW50U2NyaXB0Q29udGV4dCB7XG4gIGNvbnN0cnVjdG9yKGNvbnRlbnRTY3JpcHROYW1lLCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb250ZW50U2NyaXB0TmFtZSA9IGNvbnRlbnRTY3JpcHROYW1lO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5hYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgaWYgKHRoaXMuaXNUb3BGcmFtZSkge1xuICAgICAgdGhpcy5saXN0ZW5Gb3JOZXdlclNjcmlwdHMoeyBpZ25vcmVGaXJzdEV2ZW50OiB0cnVlIH0pO1xuICAgICAgdGhpcy5zdG9wT2xkU2NyaXB0cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpc3RlbkZvck5ld2VyU2NyaXB0cygpO1xuICAgIH1cbiAgfVxuICBzdGF0aWMgU0NSSVBUX1NUQVJURURfTUVTU0FHRV9UWVBFID0gZ2V0VW5pcXVlRXZlbnROYW1lKFxuICAgIFwid3h0OmNvbnRlbnQtc2NyaXB0LXN0YXJ0ZWRcIlxuICApO1xuICBpc1RvcEZyYW1lID0gd2luZG93LnNlbGYgPT09IHdpbmRvdy50b3A7XG4gIGFib3J0Q29udHJvbGxlcjtcbiAgbG9jYXRpb25XYXRjaGVyID0gY3JlYXRlTG9jYXRpb25XYXRjaGVyKHRoaXMpO1xuICByZWNlaXZlZE1lc3NhZ2VJZHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICBnZXQgc2lnbmFsKCkge1xuICAgIHJldHVybiB0aGlzLmFib3J0Q29udHJvbGxlci5zaWduYWw7XG4gIH1cbiAgYWJvcnQocmVhc29uKSB7XG4gICAgcmV0dXJuIHRoaXMuYWJvcnRDb250cm9sbGVyLmFib3J0KHJlYXNvbik7XG4gIH1cbiAgZ2V0IGlzSW52YWxpZCgpIHtcbiAgICBpZiAoYnJvd3Nlci5ydW50aW1lLmlkID09IG51bGwpIHtcbiAgICAgIHRoaXMubm90aWZ5SW52YWxpZGF0ZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2lnbmFsLmFib3J0ZWQ7XG4gIH1cbiAgZ2V0IGlzVmFsaWQoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzSW52YWxpZDtcbiAgfVxuICAvKipcbiAgICogQWRkIGEgbGlzdGVuZXIgdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgY29udGVudCBzY3JpcHQncyBjb250ZXh0IGlzIGludmFsaWRhdGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoY2IpO1xuICAgKiBjb25zdCByZW1vdmVJbnZhbGlkYXRlZExpc3RlbmVyID0gY3R4Lm9uSW52YWxpZGF0ZWQoKCkgPT4ge1xuICAgKiAgIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UucmVtb3ZlTGlzdGVuZXIoY2IpO1xuICAgKiB9KVxuICAgKiAvLyAuLi5cbiAgICogcmVtb3ZlSW52YWxpZGF0ZWRMaXN0ZW5lcigpO1xuICAgKi9cbiAgb25JbnZhbGlkYXRlZChjYikge1xuICAgIHRoaXMuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBjYik7XG4gICAgcmV0dXJuICgpID0+IHRoaXMuc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBjYik7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybiBhIHByb21pc2UgdGhhdCBuZXZlciByZXNvbHZlcy4gVXNlZnVsIGlmIHlvdSBoYXZlIGFuIGFzeW5jIGZ1bmN0aW9uIHRoYXQgc2hvdWxkbid0IHJ1blxuICAgKiBhZnRlciB0aGUgY29udGV4dCBpcyBleHBpcmVkLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBjb25zdCBnZXRWYWx1ZUZyb21TdG9yYWdlID0gYXN5bmMgKCkgPT4ge1xuICAgKiAgIGlmIChjdHguaXNJbnZhbGlkKSByZXR1cm4gY3R4LmJsb2NrKCk7XG4gICAqXG4gICAqICAgLy8gLi4uXG4gICAqIH1cbiAgICovXG4gIGJsb2NrKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cuc2V0SW50ZXJ2YWxgIHRoYXQgYXV0b21hdGljYWxseSBjbGVhcnMgdGhlIGludGVydmFsIHdoZW4gaW52YWxpZGF0ZWQuXG4gICAqL1xuICBzZXRJbnRlcnZhbChoYW5kbGVyLCB0aW1lb3V0KSB7XG4gICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBoYW5kbGVyKCk7XG4gICAgfSwgdGltZW91dCk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNsZWFySW50ZXJ2YWwoaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cuc2V0VGltZW91dGAgdGhhdCBhdXRvbWF0aWNhbGx5IGNsZWFycyB0aGUgaW50ZXJ2YWwgd2hlbiBpbnZhbGlkYXRlZC5cbiAgICovXG4gIHNldFRpbWVvdXQoaGFuZGxlciwgdGltZW91dCkge1xuICAgIGNvbnN0IGlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBoYW5kbGVyKCk7XG4gICAgfSwgdGltZW91dCk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNsZWFyVGltZW91dChpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIHRoYXQgYXV0b21hdGljYWxseSBjYW5jZWxzIHRoZSByZXF1ZXN0IHdoZW5cbiAgICogaW52YWxpZGF0ZWQuXG4gICAqL1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spIHtcbiAgICBjb25zdCBpZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoLi4uYXJncykgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgfSk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2tgIHRoYXQgYXV0b21hdGljYWxseSBjYW5jZWxzIHRoZSByZXF1ZXN0IHdoZW5cbiAgICogaW52YWxpZGF0ZWQuXG4gICAqL1xuICByZXF1ZXN0SWRsZUNhbGxiYWNrKGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgY29uc3QgaWQgPSByZXF1ZXN0SWRsZUNhbGxiYWNrKCguLi5hcmdzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc2lnbmFsLmFib3J0ZWQpIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgIH0sIG9wdGlvbnMpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjYW5jZWxJZGxlQ2FsbGJhY2soaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgYWRkRXZlbnRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZSA9PT0gXCJ3eHQ6bG9jYXRpb25jaGFuZ2VcIikge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgdGhpcy5sb2NhdGlvbldhdGNoZXIucnVuKCk7XG4gICAgfVxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyPy4oXG4gICAgICB0eXBlLnN0YXJ0c1dpdGgoXCJ3eHQ6XCIpID8gZ2V0VW5pcXVlRXZlbnROYW1lKHR5cGUpIDogdHlwZSxcbiAgICAgIGhhbmRsZXIsXG4gICAgICB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIHNpZ25hbDogdGhpcy5zaWduYWxcbiAgICAgIH1cbiAgICApO1xuICB9XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICogQWJvcnQgdGhlIGFib3J0IGNvbnRyb2xsZXIgYW5kIGV4ZWN1dGUgYWxsIGBvbkludmFsaWRhdGVkYCBsaXN0ZW5lcnMuXG4gICAqL1xuICBub3RpZnlJbnZhbGlkYXRlZCgpIHtcbiAgICB0aGlzLmFib3J0KFwiQ29udGVudCBzY3JpcHQgY29udGV4dCBpbnZhbGlkYXRlZFwiKTtcbiAgICBsb2dnZXIuZGVidWcoXG4gICAgICBgQ29udGVudCBzY3JpcHQgXCIke3RoaXMuY29udGVudFNjcmlwdE5hbWV9XCIgY29udGV4dCBpbnZhbGlkYXRlZGBcbiAgICApO1xuICB9XG4gIHN0b3BPbGRTY3JpcHRzKCkge1xuICAgIHdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogQ29udGVudFNjcmlwdENvbnRleHQuU0NSSVBUX1NUQVJURURfTUVTU0FHRV9UWVBFLFxuICAgICAgICBjb250ZW50U2NyaXB0TmFtZTogdGhpcy5jb250ZW50U2NyaXB0TmFtZSxcbiAgICAgICAgbWVzc2FnZUlkOiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgICAgfSxcbiAgICAgIFwiKlwiXG4gICAgKTtcbiAgfVxuICB2ZXJpZnlTY3JpcHRTdGFydGVkRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBpc1NjcmlwdFN0YXJ0ZWRFdmVudCA9IGV2ZW50LmRhdGE/LnR5cGUgPT09IENvbnRlbnRTY3JpcHRDb250ZXh0LlNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRTtcbiAgICBjb25zdCBpc1NhbWVDb250ZW50U2NyaXB0ID0gZXZlbnQuZGF0YT8uY29udGVudFNjcmlwdE5hbWUgPT09IHRoaXMuY29udGVudFNjcmlwdE5hbWU7XG4gICAgY29uc3QgaXNOb3REdXBsaWNhdGUgPSAhdGhpcy5yZWNlaXZlZE1lc3NhZ2VJZHMuaGFzKGV2ZW50LmRhdGE/Lm1lc3NhZ2VJZCk7XG4gICAgcmV0dXJuIGlzU2NyaXB0U3RhcnRlZEV2ZW50ICYmIGlzU2FtZUNvbnRlbnRTY3JpcHQgJiYgaXNOb3REdXBsaWNhdGU7XG4gIH1cbiAgbGlzdGVuRm9yTmV3ZXJTY3JpcHRzKG9wdGlvbnMpIHtcbiAgICBsZXQgaXNGaXJzdCA9IHRydWU7XG4gICAgY29uc3QgY2IgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0aGlzLnZlcmlmeVNjcmlwdFN0YXJ0ZWRFdmVudChldmVudCkpIHtcbiAgICAgICAgdGhpcy5yZWNlaXZlZE1lc3NhZ2VJZHMuYWRkKGV2ZW50LmRhdGEubWVzc2FnZUlkKTtcbiAgICAgICAgY29uc3Qgd2FzRmlyc3QgPSBpc0ZpcnN0O1xuICAgICAgICBpc0ZpcnN0ID0gZmFsc2U7XG4gICAgICAgIGlmICh3YXNGaXJzdCAmJiBvcHRpb25zPy5pZ25vcmVGaXJzdEV2ZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMubm90aWZ5SW52YWxpZGF0ZWQoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGNiKTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gcmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgY2IpKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbImRlZmluaXRpb24iLCJicm93c2VyIiwiX2Jyb3dzZXIiLCJjb250ZW50IiwiX2EiLCJfYiIsInJlc3VsdCIsInByaW50IiwibG9nZ2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBTyxXQUFTLG9CQUFvQkEsYUFBWTtBQUM5QyxXQUFPQTtBQUFBLEVBQ1Q7QUNETyxRQUFNQyxjQUFVLHNCQUFXLFlBQVgsbUJBQW9CLFlBQXBCLG1CQUE2QixNQUNoRCxXQUFXLFVBQ1gsV0FBVztBQ0ZSLFFBQU0sVUFBVUM7QUNEdkIsUUFBQSxhQUFBLG9CQUFBO0FBQUEsSUFBbUMsU0FBQSxDQUFBLFlBQUE7QUFBQSxJQUNYLE9BQUE7QUFFcEIsY0FBQSxJQUFBLGdFQUFBO0FBR0EsVUFBQSxTQUFBLGVBQUEsV0FBQTtBQUNFLGlCQUFBLGlCQUFBLG9CQUFBLE1BQUE7QUFDRSwyQkFBQTtBQUFBLFFBQWlCLENBQUE7QUFBQSxNQUNsQixPQUFBO0FBRUQseUJBQUE7QUFBQSxNQUFpQjtBQUFBLElBQ25CO0FBQUEsRUFFSixDQUFBO0FBRUEsTUFBQSxTQUFBO0FBQ0EsTUFBQSxhQUFBO0FBRUEsTUFBQSxhQUFBLEVBQUEsR0FBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLE1BQUEsZUFBQSxFQUFBLEdBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxNQUFBLG1CQUFBO0FBRUEsV0FBQSxtQkFBQTtBQUNFLFlBQUEsSUFBQSw2Q0FBQTtBQUNBLHlCQUFBO0FBQ0EsdUJBQUE7QUFDQSwyQkFBQTtBQUNBLHlCQUFBO0FBQUEsRUFDRjtBQUVBLFdBQUEsdUJBQUE7QUFFRSxVQUFBLGlCQUFBLFNBQUEsZUFBQSxvQkFBQTtBQUNBLFFBQUEsZ0JBQUE7QUFDRSxxQkFBQSxPQUFBO0FBQUEsSUFBc0I7QUFJeEIsYUFBQSxTQUFBLGNBQUEsS0FBQTtBQUNBLFdBQUEsS0FBQTtBQUNBLFdBQUEsWUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWNBLFVBQUEsUUFBQSxTQUFBLGNBQUEsT0FBQTtBQUNBLFVBQUEsY0FBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBcVNBLGFBQUEsS0FBQSxZQUFBLEtBQUE7QUFDQSxhQUFBLEtBQUEsWUFBQSxNQUFBO0FBRUEsc0JBQUE7QUFBQSxFQUNGO0FBRUEsV0FBQSxvQkFBQTtBQUNFLFVBQUEsYUFBQSxTQUFBLGVBQUEsYUFBQTtBQUNBLFVBQUEsT0FBQSxTQUFBLGVBQUEsYUFBQTtBQUVBLFFBQUEsQ0FBQSxjQUFBLENBQUEsS0FBQTtBQUVBLFFBQUEsZ0JBQUE7QUFDQSxRQUFBLGdCQUFBLEVBQUEsR0FBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsd0JBQUE7QUFHQSxhQUFBLGtCQUFBLEdBQUEsR0FBQTtBQUNFLFVBQUEsQ0FBQSxPQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUE7QUFFQSxZQUFBLGFBQUEsRUFBQSxPQUFBLElBQUEsUUFBQSxHQUFBO0FBQ0EsWUFBQSxjQUFBLE9B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
