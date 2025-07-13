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
      top: 50px;
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
        openMenu();
      }
    });
    widget == null ? void 0 : widget.addEventListener("mouseleave", () => {
      if (!isDragging) {
        closeMenu();
      }
    });
    function handleMouseMove(e) {
      const timeDiff = Date.now() - dragStartTime;
      const distance = Math.sqrt(
        Math.pow(e.clientX - startPosition.x, 2) + Math.pow(e.clientY - startPosition.y, 2)
      );
      if (!isDragging && (distance > 3 || timeDiff > 100)) {
        isDragging = true;
        hasMovedWhileDragging = true;
        closeMenu();
        document.body.style.cursor = "grabbing";
      }
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        widget.style.transform = `translate(${newX}px, ${newY}px)`;
        widget.style.left = "0";
        widget.style.top = "0";
        lastPosition = { x: newX, y: newY };
      }
    }
    function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      mainButton.classList.remove("dragging");
      document.body.style.cursor = "";
      if (isDragging) {
        widget.style.left = lastPosition.x + "px";
        widget.style.top = lastPosition.y + "px";
        widget.style.transform = "";
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
  function createNoteEditor() {
    const modal = document.createElement("div");
    modal.className = "sticky-modal";
    modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">✏️ New Note</h3>
        <button class="modal-close">×</button>
      </div>
      <textarea class="note-input" placeholder="Write your note here..." autofocus></textarea>
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
      notesList.innerHTML = notes.slice(0, 10).map((note) => `
      <div class="note-item" data-note-id="${note.id}">
        <div class="note-preview">${note.content.substring(0, 100)}${note.content.length > 100 ? "..." : ""}</div>
        <div class="note-date">${new Date(note.timestamp).toLocaleDateString()}</div>
      </div>
    `).join("");
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
    document.addEventListener("keydown", (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;
      if (modifierKey && e.shiftKey) {
        if (e.code === "KeyS") {
          e.preventDefault();
          createNoteEditor();
        } else if (e.code === "KeyW") {
          e.preventDefault();
          const widget2 = document.getElementById("sticky-note-widget");
          if (widget2) {
            if (widget2.style.display === "none") {
              showWidget();
            } else {
              hideWidget();
            }
          }
        }
      }
    });
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
      } else if (message.action === "new-note") {
        createNoteEditor();
      }
      sendResponse({ success: true });
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
    try {
      const result2 = await browser.storage.local.get("widgetPosition");
      if (result2.widgetPosition) {
        const { x, y } = result2.widgetPosition;
        widget.style.left = x + "px";
        widget.style.top = y + "px";
      }
    } catch (error) {
      console.error("Error loading position:", error);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1jb250ZW50LXNjcmlwdC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHd4dC1kZXYvYnJvd3Nlci9zcmMvaW5kZXgubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L2Jyb3dzZXIubWpzIiwiLi4vLi4vLi4vZW50cnlwb2ludHMvY29udGVudC50cyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LWNvbnRleHQubWpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVDb250ZW50U2NyaXB0KGRlZmluaXRpb24pIHtcbiAgcmV0dXJuIGRlZmluaXRpb247XG59XG4iLCIvLyAjcmVnaW9uIHNuaXBwZXRcbmV4cG9ydCBjb25zdCBicm93c2VyID0gZ2xvYmFsVGhpcy5icm93c2VyPy5ydW50aW1lPy5pZFxuICA/IGdsb2JhbFRoaXMuYnJvd3NlclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xuLy8gI2VuZHJlZ2lvbiBzbmlwcGV0XG4iLCJpbXBvcnQgeyBicm93c2VyIGFzIF9icm93c2VyIH0gZnJvbSBcIkB3eHQtZGV2L2Jyb3dzZXJcIjtcbmV4cG9ydCBjb25zdCBicm93c2VyID0gX2Jyb3dzZXI7XG5leHBvcnQge307XG4iLCJleHBvcnQgZGVmYXVsdCBkZWZpbmVDb250ZW50U2NyaXB0KHtcbiAgbWF0Y2hlczogW1wiPGFsbF91cmxzPlwiXSxcbiAgbWFpbigpIHtcbiAgICBjb25zb2xlLmxvZyhcIvCfjq8gU3RpY2t5Tm90ZUFJIHYyLjIgQ1NTIEZJWEVEICsgTUVOVSBQT1NJVElPTklORyAtIExvYWRpbmcuLi5cIik7XG5cbiAgICAvLyBXYWl0IGZvciBET00gdG8gYmUgcmVhZHlcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICAgICAgaW5pdGlhbGl6ZVdpZGdldCgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluaXRpYWxpemVXaWRnZXQoKTtcbiAgICB9XG4gIH0sXG59KTtcblxubGV0IHdpZGdldDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbmxldCBpc0RyYWdnaW5nID0gZmFsc2U7XG5sZXQgaXNNZW51T3BlbiA9IGZhbHNlO1xubGV0IGRyYWdPZmZzZXQgPSB7IHg6IDAsIHk6IDAgfTtcbmxldCBsYXN0UG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcblxuZnVuY3Rpb24gaW5pdGlhbGl6ZVdpZGdldCgpIHtcbiAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IERPTSByZWFkeSwgY3JlYXRpbmcgd2lkZ2V0Li4uXCIpO1xuICBjcmVhdGVGbG9hdGluZ1dpZGdldCgpO1xuICBsb2FkV2lkZ2V0UG9zaXRpb24oKTtcbiAgc2V0dXBLZXlib2FyZFNob3J0Y3V0cygpO1xuICBzZXR1cE1lc3NhZ2VMaXN0ZW5lcigpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVGbG9hdGluZ1dpZGdldCgpIHtcbiAgLy8gUmVtb3ZlIGV4aXN0aW5nIHdpZGdldCBpZiBhbnlcbiAgY29uc3QgZXhpc3RpbmdXaWRnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0aWNreS1ub3RlLXdpZGdldFwiKTtcbiAgaWYgKGV4aXN0aW5nV2lkZ2V0KSB7XG4gICAgZXhpc3RpbmdXaWRnZXQucmVtb3ZlKCk7XG4gIH1cblxuICAvLyBDcmVhdGUgbWFpbiB3aWRnZXQgY29udGFpbmVyXG4gIHdpZGdldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIHdpZGdldC5pZCA9IFwic3RpY2t5LW5vdGUtd2lkZ2V0XCI7XG4gIHdpZGdldC5pbm5lckhUTUwgPSBgXG4gICAgPGRpdiBjbGFzcz1cIndpZGdldC1jb250YWluZXJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJ3aWRnZXQtbWFpbi1idXR0b25cIiBpZD1cIm1haW4tYnV0dG9uXCI+XG4gICAgICAgIOKcqFxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LW1lbnVcIiBpZD1cIndpZGdldC1tZW51XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtZW51LWJ1dHRvbiBhZGQtYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJhZGRcIj7inpU8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtYnV0dG9uIG5vdGVzLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwibm90ZXNcIj7wn5OLPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtZW51LWJ1dHRvbiBzZXR0aW5ncy1idXR0b25cIiBkYXRhLWFjdGlvbj1cInNldHRpbmdzXCI+4pqZ77iPPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtZW51LWJ1dHRvbiBjbG9zZS1idXR0b25cIiBkYXRhLWFjdGlvbj1cImNsb3NlXCI+4p2MPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbiAgLy8gQWRkIHN0eWxlc1xuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgc3R5bGUudGV4dENvbnRlbnQgPSBgXG4gICAgI3N0aWNreS1ub3RlLXdpZGdldCB7XG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICB0b3A6IDUwcHg7XG4gICAgICByaWdodDogNTBweDtcbiAgICAgIHotaW5kZXg6IDk5OTk5OTtcbiAgICAgIGZvbnQtZmFtaWx5OiAnSW50ZXInLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIHNhbnMtc2VyaWY7XG4gICAgICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAgIH1cblxuICAgIC53aWRnZXQtY29udGFpbmVyIHtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICB9XG5cbiAgICAud2lkZ2V0LW1haW4tYnV0dG9uIHtcbiAgICAgIHdpZHRoOiA1MHB4O1xuICAgICAgaGVpZ2h0OiA1MHB4O1xuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzY2N2VlYSAwJSwgIzc2NGJhMiAxMDAlKTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBmb250LXNpemU6IDIwcHg7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBib3gtc2hhZG93OiAwIDRweCAyMHB4IHJnYmEoMTAyLCAxMjYsIDIzNCwgMC4zKTtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSk7XG4gICAgICBib3JkZXI6IDJweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XG4gICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCk7XG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgfVxuXG4gICAgLndpZGdldC1tYWluLWJ1dHRvbjpob3ZlciB7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMDUpO1xuICAgICAgYm94LXNoYWRvdzogMCA2cHggMjVweCByZ2JhKDEwMiwgMTI2LCAyMzQsIDAuNCk7XG4gICAgfVxuXG4gICAgLndpZGdldC1tYWluLWJ1dHRvbi5kcmFnZ2luZyB7XG4gICAgICBjdXJzb3I6IGdyYWJiaW5nICFpbXBvcnRhbnQ7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDAuOTUpO1xuICAgICAgYm94LXNoYWRvdzogMCA4cHggMzBweCByZ2JhKDEwMiwgMTI2LCAyMzQsIDAuNSk7XG4gICAgfVxuXG4gICAgLndpZGdldC1tZW51IHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHRvcDogMTAwJTtcbiAgICAgIGxlZnQ6IDUwJTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTtcbiAgICAgIG1hcmdpbi10b3A6IDEwcHg7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIGdhcDogMTBweDtcbiAgICAgIG9wYWNpdHk6IDA7XG4gICAgICB2aXNpYmlsaXR5OiBoaWRkZW47XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgfVxuXG4gICAgLndpZGdldC1tZW51Lm9wZW4ge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHZpc2liaWxpdHk6IHZpc2libGU7XG4gICAgICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgICB9XG5cbiAgICAubWVudS1idXR0b24ge1xuICAgICAgd2lkdGg6IDQwcHg7XG4gICAgICBoZWlnaHQ6IDQwcHg7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOTUpO1xuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIGJveC1zaGFkb3c6IDAgM3B4IDE1cHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxMHB4KTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMTBweCk7XG4gICAgICBvcGFjaXR5OiAwO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbiB7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbjpudGgtY2hpbGQoMSkgeyB0cmFuc2l0aW9uLWRlbGF5OiAwLjA1czsgfVxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbjpudGgtY2hpbGQoMikgeyB0cmFuc2l0aW9uLWRlbGF5OiAwLjFzOyB9XG4gICAgLndpZGdldC1tZW51Lm9wZW4gLm1lbnUtYnV0dG9uOm50aC1jaGlsZCgzKSB7IHRyYW5zaXRpb24tZGVsYXk6IDAuMTVzOyB9XG4gICAgLndpZGdldC1tZW51Lm9wZW4gLm1lbnUtYnV0dG9uOm50aC1jaGlsZCg0KSB7IHRyYW5zaXRpb24tZGVsYXk6IDAuMnM7IH1cblxuICAgIC5tZW51LWJ1dHRvbjpob3ZlciB7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7XG4gICAgICBib3gtc2hhZG93OiAwIDVweCAyMHB4IHJnYmEoMCwgMCwgMCwgMC4xNSk7XG4gICAgfVxuXG4gICAgLmNsb3NlLWJ1dHRvbjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMTA3LCAxMDcsIDAuOSkgIWltcG9ydGFudDtcbiAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICB9XG5cbiAgICAuc3RpY2t5LW1vZGFsIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIGxlZnQ6IDA7XG4gICAgICB3aWR0aDogMTAwdnc7XG4gICAgICBoZWlnaHQ6IDEwMHZoO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjUpO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIHotaW5kZXg6IDEwMDAwMDA7XG4gICAgICBvcGFjaXR5OiAwO1xuICAgICAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcbiAgICB9XG5cbiAgICAuc3RpY2t5LW1vZGFsLm9wZW4ge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHZpc2liaWxpdHk6IHZpc2libGU7XG4gICAgfVxuXG4gICAgLm1vZGFsLWNvbnRlbnQge1xuICAgICAgYmFja2dyb3VuZDogd2hpdGU7XG4gICAgICBwYWRkaW5nOiAzMHB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogMTVweDtcbiAgICAgIGJveC1zaGFkb3c6IDAgMjBweCA2MHB4IHJnYmEoMCwgMCwgMCwgMC4zKTtcbiAgICAgIG1heC13aWR0aDogNTAwcHg7XG4gICAgICB3aWR0aDogOTAlO1xuICAgICAgbWF4LWhlaWdodDogODB2aDtcbiAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDAuOSk7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgIH1cblxuICAgIC5zdGlja3ktbW9kYWwub3BlbiAubW9kYWwtY29udGVudCB7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xuICAgIH1cblxuICAgIC5tb2RhbC1oZWFkZXIge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xuICAgICAgcGFkZGluZy1ib3R0b206IDE1cHg7XG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2VlZTtcbiAgICB9XG5cbiAgICAubW9kYWwtdGl0bGUge1xuICAgICAgZm9udC1zaXplOiAyMHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgIGNvbG9yOiAjMzMzO1xuICAgIH1cblxuICAgIC5tb2RhbC1jbG9zZSB7XG4gICAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgZm9udC1zaXplOiAyNHB4O1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgY29sb3I6ICM5OTk7XG4gICAgICBwYWRkaW5nOiA1cHg7XG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICAgIH1cblxuICAgIC5tb2RhbC1jbG9zZTpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjZjVmNWY1O1xuICAgICAgY29sb3I6ICMzMzM7XG4gICAgfVxuXG4gICAgLm5vdGUtaW5wdXQge1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBtaW4taGVpZ2h0OiAyMDBweDtcbiAgICAgIHBhZGRpbmc6IDE1cHg7XG4gICAgICBib3JkZXI6IDJweCBzb2xpZCAjZTFlNWU5O1xuICAgICAgYm9yZGVyLXJhZGl1czogMTBweDtcbiAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgIGZvbnQtZmFtaWx5OiBpbmhlcml0O1xuICAgICAgcmVzaXplOiB2ZXJ0aWNhbDtcbiAgICAgIHRyYW5zaXRpb246IGJvcmRlci1jb2xvciAwLjJzIGVhc2U7XG4gICAgfVxuXG4gICAgLm5vdGUtaW5wdXQ6Zm9jdXMge1xuICAgICAgb3V0bGluZTogbm9uZTtcbiAgICAgIGJvcmRlci1jb2xvcjogIzY2N2VlYTtcbiAgICB9XG5cbiAgICAuYnV0dG9uLWdyb3VwIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBnYXA6IDEwcHg7XG4gICAgICBtYXJnaW4tdG9wOiAyMHB4O1xuICAgIH1cblxuICAgIC5idG4ge1xuICAgICAgcGFkZGluZzogMTBweCAyMHB4O1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgfVxuXG4gICAgLmJ0bi1wcmltYXJ5IHtcbiAgICAgIGJhY2tncm91bmQ6ICM2NjdlZWE7XG4gICAgICBjb2xvcjogd2hpdGU7XG4gICAgfVxuXG4gICAgLmJ0bi1wcmltYXJ5OmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6ICM1YTZmZDg7XG4gICAgfVxuXG4gICAgLmJ0bi1zZWNvbmRhcnkge1xuICAgICAgYmFja2dyb3VuZDogI2Y4ZjlmYTtcbiAgICAgIGNvbG9yOiAjMzMzO1xuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2RlZTJlNjtcbiAgICB9XG5cbiAgICAuYnRuLXNlY29uZGFyeTpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjZTllY2VmO1xuICAgIH1cblxuICAgIC5ub3Rlcy1wYW5lbCB7XG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICB0b3A6IDUwJTtcbiAgICAgIHJpZ2h0OiAtMzAwcHg7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7XG4gICAgICB3aWR0aDogMjgwcHg7XG4gICAgICBtYXgtaGVpZ2h0OiA0MDBweDtcbiAgICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgICAgYm9yZGVyLXJhZGl1czogMTVweDtcbiAgICAgIGJveC1zaGFkb3c6IDAgMTBweCA0MHB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcbiAgICAgIHotaW5kZXg6IDk5OTk5ODtcbiAgICAgIHRyYW5zaXRpb246IHJpZ2h0IDAuM3MgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbiAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgfVxuXG4gICAgLm5vdGVzLXBhbmVsLm9wZW4ge1xuICAgICAgcmlnaHQ6IDIwcHg7XG4gICAgfVxuXG4gICAgLm5vdGVzLWhlYWRlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjNjY3ZWVhO1xuICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgcGFkZGluZzogMTVweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgfVxuXG4gICAgLm5vdGVzLWxpc3Qge1xuICAgICAgbWF4LWhlaWdodDogMzAwcHg7XG4gICAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgICAgcGFkZGluZzogMTBweDtcbiAgICB9XG5cbiAgICAubm90ZS1pdGVtIHtcbiAgICAgIHBhZGRpbmc6IDEycHg7XG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2VlZTtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQgMC4ycyBlYXNlO1xuICAgIH1cblxuICAgIC5ub3RlLWl0ZW06aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogI2Y4ZjlmYTtcbiAgICB9XG5cbiAgICAubm90ZS1wcmV2aWV3IHtcbiAgICAgIGZvbnQtc2l6ZTogMTNweDtcbiAgICAgIGNvbG9yOiAjNjY2O1xuICAgICAgbWFyZ2luLXRvcDogNXB4O1xuICAgICAgZGlzcGxheTogLXdlYmtpdC1ib3g7XG4gICAgICAtd2Via2l0LWxpbmUtY2xhbXA6IDI7XG4gICAgICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsO1xuICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICB9XG5cbiAgICAubm90ZS1kYXRlIHtcbiAgICAgIGZvbnQtc2l6ZTogMTFweDtcbiAgICAgIGNvbG9yOiAjOTk5O1xuICAgICAgbWFyZ2luLXRvcDogNXB4O1xuICAgIH1cblxuICAgIEBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAgICAgLm5vdGVzLXBhbmVsIHtcbiAgICAgICAgd2lkdGg6IDkwJTtcbiAgICAgICAgcmlnaHQ6IC0xMDAlO1xuICAgICAgfVxuICAgICAgLm5vdGVzLXBhbmVsLm9wZW4ge1xuICAgICAgICByaWdodDogNSU7XG4gICAgICB9XG4gICAgfVxuICBgO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh3aWRnZXQpO1xuXG4gIHNldHVwV2lkZ2V0RXZlbnRzKCk7XG59XG5cbmZ1bmN0aW9uIHNldHVwV2lkZ2V0RXZlbnRzKCkge1xuICBjb25zdCBtYWluQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluLWJ1dHRvblwiKTtcbiAgY29uc3QgbWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2lkZ2V0LW1lbnVcIik7XG5cbiAgaWYgKCFtYWluQnV0dG9uIHx8ICFtZW51KSByZXR1cm47XG5cbiAgbGV0IGRyYWdTdGFydFRpbWUgPSAwO1xuICBsZXQgc3RhcnRQb3NpdGlvbiA9IHsgeDogMCwgeTogMCB9O1xuICBsZXQgaGFzTW92ZWRXaGlsZURyYWdnaW5nID0gZmFsc2U7XG5cbiAgLy8gTW91c2UgZXZlbnRzIGZvciBtYWluIGJ1dHRvblxuICBtYWluQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZHJhZ1N0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgc3RhcnRQb3NpdGlvbiA9IHsgeDogZS5jbGllbnRYLCB5OiBlLmNsaWVudFkgfTtcbiAgICBoYXNNb3ZlZFdoaWxlRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICBcbiAgICBjb25zdCByZWN0ID0gd2lkZ2V0IS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBkcmFnT2Zmc2V0LnggPSBlLmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgZHJhZ09mZnNldC55ID0gZS5jbGllbnRZIC0gcmVjdC50b3A7XG4gICAgXG4gICAgbWFpbkJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiZHJhZ2dpbmdcIik7XG4gICAgXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBoYW5kbGVNb3VzZU1vdmUpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGhhbmRsZU1vdXNlVXApO1xuICB9KTtcblxuICAvLyBIb3ZlciBldmVudHMgZm9yIG1lbnVcbiAgbWFpbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKSA9PiB7XG4gICAgaWYgKCFpc0RyYWdnaW5nKSB7XG4gICAgICBvcGVuTWVudSgpO1xuICAgIH1cbiAgfSk7XG5cbiAgd2lkZ2V0Py5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XG4gICAgaWYgKCFpc0RyYWdnaW5nKSB7XG4gICAgICBjbG9zZU1lbnUoKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlTW92ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgY29uc3QgdGltZURpZmYgPSBEYXRlLm5vdygpIC0gZHJhZ1N0YXJ0VGltZTtcbiAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChcbiAgICAgIE1hdGgucG93KGUuY2xpZW50WCAtIHN0YXJ0UG9zaXRpb24ueCwgMikgKyBcbiAgICAgIE1hdGgucG93KGUuY2xpZW50WSAtIHN0YXJ0UG9zaXRpb24ueSwgMilcbiAgICApO1xuXG4gICAgLy8gU3RhcnQgZHJhZ2dpbmcgaWYgbW92ZWQgPiAzcHggb3IgaGVsZCBmb3IgPiAxMDBtc1xuICAgIGlmICghaXNEcmFnZ2luZyAmJiAoZGlzdGFuY2UgPiAzIHx8IHRpbWVEaWZmID4gMTAwKSkge1xuICAgICAgaXNEcmFnZ2luZyA9IHRydWU7XG4gICAgICBoYXNNb3ZlZFdoaWxlRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgY2xvc2VNZW51KCk7XG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IFwiZ3JhYmJpbmdcIjtcbiAgICB9XG5cbiAgICBpZiAoaXNEcmFnZ2luZykge1xuICAgICAgY29uc3QgbmV3WCA9IGUuY2xpZW50WCAtIGRyYWdPZmZzZXQueDtcbiAgICAgIGNvbnN0IG5ld1kgPSBlLmNsaWVudFkgLSBkcmFnT2Zmc2V0Lnk7XG4gICAgICBcbiAgICAgIC8vIFVzZSB0cmFuc2Zvcm0gZm9yIHNtb290aGVyIG1vdmVtZW50XG4gICAgICB3aWRnZXQhLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtuZXdYfXB4LCAke25ld1l9cHgpYDtcbiAgICAgIHdpZGdldCEuc3R5bGUubGVmdCA9IFwiMFwiO1xuICAgICAgd2lkZ2V0IS5zdHlsZS50b3AgPSBcIjBcIjtcbiAgICAgIFxuICAgICAgbGFzdFBvc2l0aW9uID0geyB4OiBuZXdYLCB5OiBuZXdZIH07XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTW91c2VVcCgpIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGhhbmRsZU1vdXNlTW92ZSk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgaGFuZGxlTW91c2VVcCk7XG4gICAgXG4gICAgbWFpbkJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKFwiZHJhZ2dpbmdcIik7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBcIlwiO1xuICAgIFxuICAgIGlmIChpc0RyYWdnaW5nKSB7XG4gICAgICAvLyBBcHBseSBmaW5hbCBwb3NpdGlvblxuICAgICAgd2lkZ2V0IS5zdHlsZS5sZWZ0ID0gbGFzdFBvc2l0aW9uLnggKyBcInB4XCI7XG4gICAgICB3aWRnZXQhLnN0eWxlLnRvcCA9IGxhc3RQb3NpdGlvbi55ICsgXCJweFwiO1xuICAgICAgd2lkZ2V0IS5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiO1xuICAgICAgc2F2ZVdpZGdldFBvc2l0aW9uKCk7XG4gICAgfVxuICAgIFxuICAgIGlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICBcbiAgICAvLyBPcGVuIG1lbnUgYWZ0ZXIgZHJhZyBpZiBub3QgbW92ZWQgbXVjaFxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKCFoYXNNb3ZlZFdoaWxlRHJhZ2dpbmcpIHtcbiAgICAgICAgb3Blbk1lbnUoKTtcbiAgICAgIH1cbiAgICB9LCA1MCk7XG4gIH1cblxuICAvLyBNZW51IGJ1dHRvbiBjbGlja3NcbiAgbWVudT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgY29uc3QgYWN0aW9uID0gdGFyZ2V0LmRhdGFzZXQuYWN0aW9uO1xuICAgIFxuICAgIGlmIChhY3Rpb24pIHtcbiAgICAgIGhhbmRsZU1lbnVBY3Rpb24oYWN0aW9uKTtcbiAgICAgIGNsb3NlTWVudSgpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9wZW5NZW51KCkge1xuICBpZiAoaXNEcmFnZ2luZykgcmV0dXJuO1xuICBjb25zdCBtZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3aWRnZXQtbWVudVwiKTtcbiAgaWYgKG1lbnUpIHtcbiAgICBtZW51LmNsYXNzTGlzdC5hZGQoXCJvcGVuXCIpO1xuICAgIGlzTWVudU9wZW4gPSB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNsb3NlTWVudSgpIHtcbiAgY29uc3QgbWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2lkZ2V0LW1lbnVcIik7XG4gIGlmIChtZW51KSB7XG4gICAgbWVudS5jbGFzc0xpc3QucmVtb3ZlKFwib3BlblwiKTtcbiAgICBpc01lbnVPcGVuID0gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlTWVudUFjdGlvbihhY3Rpb246IHN0cmluZykge1xuICBzd2l0Y2ggKGFjdGlvbikge1xuICAgIGNhc2UgXCJhZGRcIjpcbiAgICAgIGNyZWF0ZU5vdGVFZGl0b3IoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJub3Rlc1wiOlxuICAgICAgdG9nZ2xlTm90ZXNQYW5lbCgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInNldHRpbmdzXCI6XG4gICAgICBvcGVuU2V0dGluZ3NNb2RhbCgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImNsb3NlXCI6XG4gICAgICBoaWRlV2lkZ2V0KCk7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVOb3RlRWRpdG9yKCkge1xuICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG1vZGFsLmNsYXNzTmFtZSA9IFwic3RpY2t5LW1vZGFsXCI7XG4gIG1vZGFsLmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPlxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxuICAgICAgICA8aDMgY2xhc3M9XCJtb2RhbC10aXRsZVwiPuKcj++4jyBOZXcgTm90ZTwvaDM+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbC1jbG9zZVwiPsOXPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICAgIDx0ZXh0YXJlYSBjbGFzcz1cIm5vdGUtaW5wdXRcIiBwbGFjZWhvbGRlcj1cIldyaXRlIHlvdXIgbm90ZSBoZXJlLi4uXCIgYXV0b2ZvY3VzPjwvdGV4dGFyZWE+XG4gICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWdyb3VwXCI+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgc2F2ZS1ub3RlXCI+8J+SviBTYXZlIE5vdGU8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5IGNhbmNlbC1ub3RlXCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1vZGFsKTtcbiAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5jbGFzc0xpc3QuYWRkKFwib3BlblwiKSwgMTApO1xuXG4gIGNvbnN0IGNsb3NlQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihcIi5tb2RhbC1jbG9zZVwiKTtcbiAgY29uc3Qgc2F2ZUJ0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIuc2F2ZS1ub3RlXCIpO1xuICBjb25zdCBjYW5jZWxCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKFwiLmNhbmNlbC1ub3RlXCIpO1xuICBjb25zdCB0ZXh0YXJlYSA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIubm90ZS1pbnB1dFwiKSBhcyBIVE1MVGV4dEFyZWFFbGVtZW50O1xuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XG4gICAgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZShcIm9wZW5cIik7XG4gICAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5yZW1vdmUoKSwgMzAwKTtcbiAgfVxuXG4gIGNsb3NlQnRuPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2VNb2RhbCk7XG4gIGNhbmNlbEJ0bj8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlTW9kYWwpO1xuICBcbiAgc2F2ZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBjb25zdCBjb250ZW50ID0gdGV4dGFyZWEudmFsdWUudHJpbSgpO1xuICAgIGlmIChjb250ZW50KSB7XG4gICAgICBzYXZlTm90ZShjb250ZW50KTtcbiAgICAgIGNsb3NlTW9kYWwoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEVTQyB0byBjbG9zZVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBmdW5jdGlvbiBlc2NIYW5kbGVyKGUpIHtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgIGNsb3NlTW9kYWwoKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGVzY0hhbmRsZXIpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZU5vdGVzUGFuZWwoKSB7XG4gIGxldCBwYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubm90ZXMtcGFuZWxcIikgYXMgSFRNTEVsZW1lbnQ7XG4gIFxuICBpZiAoIXBhbmVsKSB7XG4gICAgcGFuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHBhbmVsLmNsYXNzTmFtZSA9IFwibm90ZXMtcGFuZWxcIjtcbiAgICBwYW5lbC5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwibm90ZXMtaGVhZGVyXCI+8J+TiyBSZWNlbnQgTm90ZXM8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJub3Rlcy1saXN0XCIgaWQ9XCJub3Rlcy1saXN0XCI+PC9kaXY+XG4gICAgYDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBhbmVsKTtcbiAgICByZWZyZXNoTm90ZXNMaXN0KCk7XG4gIH1cblxuICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKFwib3BlblwiKTtcbiAgXG4gIGlmIChwYW5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJvcGVuXCIpKSB7XG4gICAgcmVmcmVzaE5vdGVzTGlzdCgpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIG91dHNpZGVDbGlja0hhbmRsZXIoZSkge1xuICAgICAgICBpZiAoIXBhbmVsLmNvbnRhaW5zKGUudGFyZ2V0IGFzIE5vZGUpKSB7XG4gICAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnJlbW92ZShcIm9wZW5cIik7XG4gICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG91dHNpZGVDbGlja0hhbmRsZXIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LCAxMDApO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9wZW5TZXR0aW5nc01vZGFsKCkge1xuICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG1vZGFsLmNsYXNzTmFtZSA9IFwic3RpY2t5LW1vZGFsXCI7XG4gIG1vZGFsLmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPlxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxuICAgICAgICA8aDMgY2xhc3M9XCJtb2RhbC10aXRsZVwiPuKame+4jyBTZXR0aW5nczwvaDM+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbC1jbG9zZVwiPsOXPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgc3R5bGU9XCJsaW5lLWhlaWdodDogMS42O1wiPlxuICAgICAgICA8aDQ+8J+OriBLZXlib2FyZCBTaG9ydGN1dHM8L2g0PlxuICAgICAgICA8cD48c3Ryb25nPkNtZC9DdHJsICsgU2hpZnQgKyBTOjwvc3Ryb25nPiBDcmVhdGUgbmV3IG5vdGU8L3A+XG4gICAgICAgIDxwPjxzdHJvbmc+Q21kL0N0cmwgKyBTaGlmdCArIFc6PC9zdHJvbmc+IFRvZ2dsZSB3aWRnZXQgdmlzaWJpbGl0eTwvcD5cbiAgICAgICAgPHA+PHN0cm9uZz5FU0M6PC9zdHJvbmc+IENsb3NlIG1vZGFsczwvcD5cbiAgICAgICAgXG4gICAgICAgIDxoNCBzdHlsZT1cIm1hcmdpbi10b3A6IDI1cHg7XCI+4oS577iPIEFib3V0PC9oND5cbiAgICAgICAgPHA+PHN0cm9uZz5TdGlja3lOb3RlQUkgdjIuMDwvc3Ryb25nPjwvcD5cbiAgICAgICAgPHA+U21hcnQgZmxvYXRpbmcgbm90ZXMgZm9yIGFueSB3ZWJwYWdlPC9wPlxuICAgICAgICBcbiAgICAgICAgPGg0IHN0eWxlPVwibWFyZ2luLXRvcDogMjVweDtcIj7wn46vIFVzYWdlIFRpcHM8L2g0PlxuICAgICAgICA8cD7igKIgSG92ZXIgb3ZlciB0aGUg4pyoIGJ1dHRvbiB0byBzZWUgbWVudTwvcD5cbiAgICAgICAgPHA+4oCiIENsaWNrIGFuZCBkcmFnIHRvIG1vdmUgdGhlIHdpZGdldDwvcD5cbiAgICAgICAgPHA+4oCiIFVzZSBrZXlib2FyZCBzaG9ydGN1dHMgZm9yIHF1aWNrIGFjY2VzczwvcD5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbi1ncm91cFwiPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnkgY2xvc2Utc2V0dGluZ3NcIj5DbG9zZTwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG5cbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtb2RhbCk7XG4gIHNldFRpbWVvdXQoKCkgPT4gbW9kYWwuY2xhc3NMaXN0LmFkZChcIm9wZW5cIiksIDEwKTtcblxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCkge1xuICAgIG1vZGFsLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gbW9kYWwucmVtb3ZlKCksIDMwMCk7XG4gIH1cblxuICBtb2RhbC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsLWNsb3NlXCIpPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2VNb2RhbCk7XG4gIG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2Utc2V0dGluZ3NcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZU1vZGFsKTtcbn1cblxuZnVuY3Rpb24gaGlkZVdpZGdldCgpIHtcbiAgaWYgKHdpZGdldCkge1xuICAgIHdpZGdldC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hvd1dpZGdldCgpIHtcbiAgaWYgKHdpZGdldCkge1xuICAgIHdpZGdldC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVOb3RlKGNvbnRlbnQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoXCJzdGlja3lOb3Rlc1wiKTtcbiAgICBjb25zdCBub3RlcyA9IHJlc3VsdC5zdGlja3lOb3RlcyB8fCBbXTtcbiAgICBcbiAgICBjb25zdCBuZXdOb3RlID0ge1xuICAgICAgaWQ6IERhdGUubm93KCkudG9TdHJpbmcoKSxcbiAgICAgIGNvbnRlbnQsXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgICB9O1xuICAgIFxuICAgIG5vdGVzLnVuc2hpZnQobmV3Tm90ZSk7XG4gICAgXG4gICAgLy8gS2VlcCBvbmx5IGxhc3QgNTAgbm90ZXNcbiAgICBpZiAobm90ZXMubGVuZ3RoID4gNTApIHtcbiAgICAgIG5vdGVzLnNwbGljZSg1MCk7XG4gICAgfVxuICAgIFxuICAgIGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoeyBzdGlja3lOb3Rlczogbm90ZXMgfSk7XG4gICAgY29uc29sZS5sb2coXCJOb3RlIHNhdmVkIHN1Y2Nlc3NmdWxseVwiKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igc2F2aW5nIG5vdGU6XCIsIGVycm9yKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoTm90ZXNMaXN0KCkge1xuICBjb25zdCBub3Rlc0xpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vdGVzLWxpc3RcIik7XG4gIGlmICghbm90ZXNMaXN0KSByZXR1cm47XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFwic3RpY2t5Tm90ZXNcIik7XG4gICAgY29uc3Qgbm90ZXMgPSByZXN1bHQuc3RpY2t5Tm90ZXMgfHwgW107XG4gICAgXG4gICAgaWYgKG5vdGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbm90ZXNMaXN0LmlubmVySFRNTCA9ICc8ZGl2IHN0eWxlPVwicGFkZGluZzogMjBweDsgdGV4dC1hbGlnbjogY2VudGVyOyBjb2xvcjogIzk5OTtcIj5ObyBub3RlcyB5ZXQ8L2Rpdj4nO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBub3Rlc0xpc3QuaW5uZXJIVE1MID0gbm90ZXMuc2xpY2UoMCwgMTApLm1hcCgobm90ZTogYW55KSA9PiBgXG4gICAgICA8ZGl2IGNsYXNzPVwibm90ZS1pdGVtXCIgZGF0YS1ub3RlLWlkPVwiJHtub3RlLmlkfVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibm90ZS1wcmV2aWV3XCI+JHtub3RlLmNvbnRlbnQuc3Vic3RyaW5nKDAsIDEwMCl9JHtub3RlLmNvbnRlbnQubGVuZ3RoID4gMTAwID8gJy4uLicgOiAnJ308L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5vdGUtZGF0ZVwiPiR7bmV3IERhdGUobm90ZS50aW1lc3RhbXApLnRvTG9jYWxlRGF0ZVN0cmluZygpfTwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgYCkuam9pbihcIlwiKTtcbiAgICBcbiAgICAvLyBDbGljayB0byBlZGl0IG5vdGVcbiAgICBub3Rlc0xpc3QucXVlcnlTZWxlY3RvckFsbChcIi5ub3RlLWl0ZW1cIikuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgY29uc3Qgbm90ZUlkID0gKGl0ZW0gYXMgSFRNTEVsZW1lbnQpLmRhdGFzZXQubm90ZUlkO1xuICAgICAgICBjb25zdCBub3RlID0gbm90ZXMuZmluZCgobjogYW55KSA9PiBuLmlkID09PSBub3RlSWQpO1xuICAgICAgICBpZiAobm90ZSkge1xuICAgICAgICAgIGVkaXROb3RlKG5vdGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9hZGluZyBub3RlczpcIiwgZXJyb3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVkaXROb3RlKG5vdGU6IGFueSkge1xuICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG1vZGFsLmNsYXNzTmFtZSA9IFwic3RpY2t5LW1vZGFsXCI7XG4gIG1vZGFsLmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPlxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWhlYWRlclwiPlxuICAgICAgICA8aDMgY2xhc3M9XCJtb2RhbC10aXRsZVwiPuKcj++4jyBFZGl0IE5vdGU8L2gzPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwibW9kYWwtY2xvc2VcIj7DlzwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgICA8dGV4dGFyZWEgY2xhc3M9XCJub3RlLWlucHV0XCIgYXV0b2ZvY3VzPiR7bm90ZS5jb250ZW50fTwvdGV4dGFyZWE+XG4gICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWdyb3VwXCI+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgdXBkYXRlLW5vdGVcIj7wn5K+IFVwZGF0ZSBOb3RlPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG5cIiBzdHlsZT1cImJhY2tncm91bmQ6ICNkYzM1NDU7IGNvbG9yOiB3aGl0ZTtcIiBpZD1cImRlbGV0ZS1ub3RlXCI+8J+Xke+4jyBEZWxldGU8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5IGNhbmNlbC1lZGl0XCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1vZGFsKTtcbiAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5jbGFzc0xpc3QuYWRkKFwib3BlblwiKSwgMTApO1xuXG4gIGNvbnN0IHRleHRhcmVhID0gbW9kYWwucXVlcnlTZWxlY3RvcihcIi5ub3RlLWlucHV0XCIpIGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQ7XG4gIFxuICBmdW5jdGlvbiBjbG9zZU1vZGFsKCkge1xuICAgIG1vZGFsLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gbW9kYWwucmVtb3ZlKCksIDMwMCk7XG4gIH1cblxuICBtb2RhbC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsLWNsb3NlXCIpPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2VNb2RhbCk7XG4gIG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIuY2FuY2VsLWVkaXRcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZU1vZGFsKTtcbiAgXG4gIG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIudXBkYXRlLW5vdGVcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgY29udGVudCA9IHRleHRhcmVhLnZhbHVlLnRyaW0oKTtcbiAgICBpZiAoY29udGVudCkge1xuICAgICAgYXdhaXQgdXBkYXRlTm90ZShub3RlLmlkLCBjb250ZW50KTtcbiAgICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgICAgIGNsb3NlTW9kYWwoKTtcbiAgICB9XG4gIH0pO1xuXG4gIG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIjZGVsZXRlLW5vdGVcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG4gICAgaWYgKGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgbm90ZT9cIikpIHtcbiAgICAgIGF3YWl0IGRlbGV0ZU5vdGUobm90ZS5pZCk7XG4gICAgICByZWZyZXNoTm90ZXNMaXN0KCk7XG4gICAgICBjbG9zZU1vZGFsKCk7XG4gICAgfVxuICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlTm90ZShub3RlSWQ6IHN0cmluZywgbmV3Q29udGVudDogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChcInN0aWNreU5vdGVzXCIpO1xuICAgIGNvbnN0IG5vdGVzID0gcmVzdWx0LnN0aWNreU5vdGVzIHx8IFtdO1xuICAgIFxuICAgIGNvbnN0IG5vdGVJbmRleCA9IG5vdGVzLmZpbmRJbmRleCgobm90ZTogYW55KSA9PiBub3RlLmlkID09PSBub3RlSWQpO1xuICAgIGlmIChub3RlSW5kZXggIT09IC0xKSB7XG4gICAgICBub3Rlc1tub3RlSW5kZXhdLmNvbnRlbnQgPSBuZXdDb250ZW50O1xuICAgICAgbm90ZXNbbm90ZUluZGV4XS50aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KHsgc3RpY2t5Tm90ZXM6IG5vdGVzIH0pO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgdXBkYXRpbmcgbm90ZTpcIiwgZXJyb3IpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZU5vdGUobm90ZUlkOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFwic3RpY2t5Tm90ZXNcIik7XG4gICAgY29uc3Qgbm90ZXMgPSByZXN1bHQuc3RpY2t5Tm90ZXMgfHwgW107XG4gICAgXG4gICAgY29uc3QgZmlsdGVyZWROb3RlcyA9IG5vdGVzLmZpbHRlcigobm90ZTogYW55KSA9PiBub3RlLmlkICE9PSBub3RlSWQpO1xuICAgIGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoeyBzdGlja3lOb3RlczogZmlsdGVyZWROb3RlcyB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZGVsZXRpbmcgbm90ZTpcIiwgZXJyb3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldHVwS2V5Ym9hcmRTaG9ydGN1dHMoKSB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB7XG4gICAgY29uc3QgaXNNYWMgPSBuYXZpZ2F0b3IucGxhdGZvcm0udG9VcHBlckNhc2UoKS5pbmRleE9mKCdNQUMnKSA+PSAwO1xuICAgIGNvbnN0IG1vZGlmaWVyS2V5ID0gaXNNYWMgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXk7XG5cbiAgICBpZiAobW9kaWZpZXJLZXkgJiYgZS5zaGlmdEtleSkge1xuICAgICAgaWYgKGUuY29kZSA9PT0gXCJLZXlTXCIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjcmVhdGVOb3RlRWRpdG9yKCk7XG4gICAgICB9IGVsc2UgaWYgKGUuY29kZSA9PT0gXCJLZXlXXCIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCB3aWRnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0aWNreS1ub3RlLXdpZGdldFwiKTtcbiAgICAgICAgaWYgKHdpZGdldCkge1xuICAgICAgICAgIGlmICh3aWRnZXQuc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIpIHtcbiAgICAgICAgICAgIHNob3dXaWRnZXQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGlkZVdpZGdldCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldHVwTWVzc2FnZUxpc3RlbmVyKCkge1xuICBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBSZWNlaXZlZCBtZXNzYWdlOlwiLCBtZXNzYWdlKTtcblxuICAgIGlmIChtZXNzYWdlLmFjdGlvbiA9PT0gXCJ0b2dnbGUtd2lkZ2V0XCIpIHtcbiAgICAgIGNvbnN0IHdpZGdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RpY2t5LW5vdGUtd2lkZ2V0XCIpO1xuICAgICAgaWYgKHdpZGdldCkge1xuICAgICAgICBpZiAod2lkZ2V0LnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiKSB7XG4gICAgICAgICAgc2hvd1dpZGdldCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhpZGVXaWRnZXQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobWVzc2FnZS5hY3Rpb24gPT09IFwibmV3LW5vdGVcIikge1xuICAgICAgY3JlYXRlTm90ZUVkaXRvcigpO1xuICAgIH1cblxuICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlV2lkZ2V0UG9zaXRpb24oKSB7XG4gIGlmICghd2lkZ2V0KSByZXR1cm47XG4gIFxuICBjb25zdCByZWN0ID0gd2lkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBjb25zdCBwb3NpdGlvbiA9IHtcbiAgICB4OiByZWN0LmxlZnQsXG4gICAgeTogcmVjdC50b3BcbiAgfTtcbiAgXG4gIHRyeSB7XG4gICAgYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCh7IHdpZGdldFBvc2l0aW9uOiBwb3NpdGlvbiB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igc2F2aW5nIHBvc2l0aW9uOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZFdpZGdldFBvc2l0aW9uKCkge1xuICBpZiAoIXdpZGdldCkgcmV0dXJuO1xuICBcbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFwid2lkZ2V0UG9zaXRpb25cIik7XG4gICAgaWYgKHJlc3VsdC53aWRnZXRQb3NpdGlvbikge1xuICAgICAgY29uc3QgeyB4LCB5IH0gPSByZXN1bHQud2lkZ2V0UG9zaXRpb247XG4gICAgICB3aWRnZXQuc3R5bGUubGVmdCA9IHggKyBcInB4XCI7XG4gICAgICB3aWRnZXQuc3R5bGUudG9wID0geSArIFwicHhcIjtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGxvYWRpbmcgcG9zaXRpb246XCIsIGVycm9yKTtcbiAgfVxufVxuIiwiZnVuY3Rpb24gcHJpbnQobWV0aG9kLCAuLi5hcmdzKSB7XG4gIGlmIChpbXBvcnQubWV0YS5lbnYuTU9ERSA9PT0gXCJwcm9kdWN0aW9uXCIpIHJldHVybjtcbiAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSBcInN0cmluZ1wiKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGFyZ3Muc2hpZnQoKTtcbiAgICBtZXRob2QoYFt3eHRdICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICBtZXRob2QoXCJbd3h0XVwiLCAuLi5hcmdzKTtcbiAgfVxufVxuZXhwb3J0IGNvbnN0IGxvZ2dlciA9IHtcbiAgZGVidWc6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmRlYnVnLCAuLi5hcmdzKSxcbiAgbG9nOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5sb2csIC4uLmFyZ3MpLFxuICB3YXJuOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS53YXJuLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmVycm9yLCAuLi5hcmdzKVxufTtcbiIsImltcG9ydCB7IGJyb3dzZXIgfSBmcm9tIFwid3h0L2Jyb3dzZXJcIjtcbmV4cG9ydCBjbGFzcyBXeHRMb2NhdGlvbkNoYW5nZUV2ZW50IGV4dGVuZHMgRXZlbnQge1xuICBjb25zdHJ1Y3RvcihuZXdVcmwsIG9sZFVybCkge1xuICAgIHN1cGVyKFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQuRVZFTlRfTkFNRSwge30pO1xuICAgIHRoaXMubmV3VXJsID0gbmV3VXJsO1xuICAgIHRoaXMub2xkVXJsID0gb2xkVXJsO1xuICB9XG4gIHN0YXRpYyBFVkVOVF9OQU1FID0gZ2V0VW5pcXVlRXZlbnROYW1lKFwid3h0OmxvY2F0aW9uY2hhbmdlXCIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFVuaXF1ZUV2ZW50TmFtZShldmVudE5hbWUpIHtcbiAgcmV0dXJuIGAke2Jyb3dzZXI/LnJ1bnRpbWU/LmlkfToke2ltcG9ydC5tZXRhLmVudi5FTlRSWVBPSU5UfToke2V2ZW50TmFtZX1gO1xufVxuIiwiaW1wb3J0IHsgV3h0TG9jYXRpb25DaGFuZ2VFdmVudCB9IGZyb20gXCIuL2N1c3RvbS1ldmVudHMubWpzXCI7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTG9jYXRpb25XYXRjaGVyKGN0eCkge1xuICBsZXQgaW50ZXJ2YWw7XG4gIGxldCBvbGRVcmw7XG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogRW5zdXJlIHRoZSBsb2NhdGlvbiB3YXRjaGVyIGlzIGFjdGl2ZWx5IGxvb2tpbmcgZm9yIFVSTCBjaGFuZ2VzLiBJZiBpdCdzIGFscmVhZHkgd2F0Y2hpbmcsXG4gICAgICogdGhpcyBpcyBhIG5vb3AuXG4gICAgICovXG4gICAgcnVuKCkge1xuICAgICAgaWYgKGludGVydmFsICE9IG51bGwpIHJldHVybjtcbiAgICAgIG9sZFVybCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgICBpbnRlcnZhbCA9IGN0eC5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGxldCBuZXdVcmwgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgICBpZiAobmV3VXJsLmhyZWYgIT09IG9sZFVybC5ocmVmKSB7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQobmV3VXJsLCBvbGRVcmwpKTtcbiAgICAgICAgICBvbGRVcmwgPSBuZXdVcmw7XG4gICAgICAgIH1cbiAgICAgIH0sIDFlMyk7XG4gICAgfVxuICB9O1xufVxuIiwiaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gXCJ3eHQvYnJvd3NlclwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIi4uL3V0aWxzL2ludGVybmFsL2xvZ2dlci5tanNcIjtcbmltcG9ydCB7XG4gIGdldFVuaXF1ZUV2ZW50TmFtZVxufSBmcm9tIFwiLi9pbnRlcm5hbC9jdXN0b20tZXZlbnRzLm1qc1wiO1xuaW1wb3J0IHsgY3JlYXRlTG9jYXRpb25XYXRjaGVyIH0gZnJvbSBcIi4vaW50ZXJuYWwvbG9jYXRpb24td2F0Y2hlci5tanNcIjtcbmV4cG9ydCBjbGFzcyBDb250ZW50U2NyaXB0Q29udGV4dCB7XG4gIGNvbnN0cnVjdG9yKGNvbnRlbnRTY3JpcHROYW1lLCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb250ZW50U2NyaXB0TmFtZSA9IGNvbnRlbnRTY3JpcHROYW1lO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5hYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgaWYgKHRoaXMuaXNUb3BGcmFtZSkge1xuICAgICAgdGhpcy5saXN0ZW5Gb3JOZXdlclNjcmlwdHMoeyBpZ25vcmVGaXJzdEV2ZW50OiB0cnVlIH0pO1xuICAgICAgdGhpcy5zdG9wT2xkU2NyaXB0cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpc3RlbkZvck5ld2VyU2NyaXB0cygpO1xuICAgIH1cbiAgfVxuICBzdGF0aWMgU0NSSVBUX1NUQVJURURfTUVTU0FHRV9UWVBFID0gZ2V0VW5pcXVlRXZlbnROYW1lKFxuICAgIFwid3h0OmNvbnRlbnQtc2NyaXB0LXN0YXJ0ZWRcIlxuICApO1xuICBpc1RvcEZyYW1lID0gd2luZG93LnNlbGYgPT09IHdpbmRvdy50b3A7XG4gIGFib3J0Q29udHJvbGxlcjtcbiAgbG9jYXRpb25XYXRjaGVyID0gY3JlYXRlTG9jYXRpb25XYXRjaGVyKHRoaXMpO1xuICByZWNlaXZlZE1lc3NhZ2VJZHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICBnZXQgc2lnbmFsKCkge1xuICAgIHJldHVybiB0aGlzLmFib3J0Q29udHJvbGxlci5zaWduYWw7XG4gIH1cbiAgYWJvcnQocmVhc29uKSB7XG4gICAgcmV0dXJuIHRoaXMuYWJvcnRDb250cm9sbGVyLmFib3J0KHJlYXNvbik7XG4gIH1cbiAgZ2V0IGlzSW52YWxpZCgpIHtcbiAgICBpZiAoYnJvd3Nlci5ydW50aW1lLmlkID09IG51bGwpIHtcbiAgICAgIHRoaXMubm90aWZ5SW52YWxpZGF0ZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2lnbmFsLmFib3J0ZWQ7XG4gIH1cbiAgZ2V0IGlzVmFsaWQoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzSW52YWxpZDtcbiAgfVxuICAvKipcbiAgICogQWRkIGEgbGlzdGVuZXIgdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgY29udGVudCBzY3JpcHQncyBjb250ZXh0IGlzIGludmFsaWRhdGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoY2IpO1xuICAgKiBjb25zdCByZW1vdmVJbnZhbGlkYXRlZExpc3RlbmVyID0gY3R4Lm9uSW52YWxpZGF0ZWQoKCkgPT4ge1xuICAgKiAgIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UucmVtb3ZlTGlzdGVuZXIoY2IpO1xuICAgKiB9KVxuICAgKiAvLyAuLi5cbiAgICogcmVtb3ZlSW52YWxpZGF0ZWRMaXN0ZW5lcigpO1xuICAgKi9cbiAgb25JbnZhbGlkYXRlZChjYikge1xuICAgIHRoaXMuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBjYik7XG4gICAgcmV0dXJuICgpID0+IHRoaXMuc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBjYik7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybiBhIHByb21pc2UgdGhhdCBuZXZlciByZXNvbHZlcy4gVXNlZnVsIGlmIHlvdSBoYXZlIGFuIGFzeW5jIGZ1bmN0aW9uIHRoYXQgc2hvdWxkbid0IHJ1blxuICAgKiBhZnRlciB0aGUgY29udGV4dCBpcyBleHBpcmVkLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBjb25zdCBnZXRWYWx1ZUZyb21TdG9yYWdlID0gYXN5bmMgKCkgPT4ge1xuICAgKiAgIGlmIChjdHguaXNJbnZhbGlkKSByZXR1cm4gY3R4LmJsb2NrKCk7XG4gICAqXG4gICAqICAgLy8gLi4uXG4gICAqIH1cbiAgICovXG4gIGJsb2NrKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cuc2V0SW50ZXJ2YWxgIHRoYXQgYXV0b21hdGljYWxseSBjbGVhcnMgdGhlIGludGVydmFsIHdoZW4gaW52YWxpZGF0ZWQuXG4gICAqL1xuICBzZXRJbnRlcnZhbChoYW5kbGVyLCB0aW1lb3V0KSB7XG4gICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBoYW5kbGVyKCk7XG4gICAgfSwgdGltZW91dCk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNsZWFySW50ZXJ2YWwoaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cuc2V0VGltZW91dGAgdGhhdCBhdXRvbWF0aWNhbGx5IGNsZWFycyB0aGUgaW50ZXJ2YWwgd2hlbiBpbnZhbGlkYXRlZC5cbiAgICovXG4gIHNldFRpbWVvdXQoaGFuZGxlciwgdGltZW91dCkge1xuICAgIGNvbnN0IGlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBoYW5kbGVyKCk7XG4gICAgfSwgdGltZW91dCk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNsZWFyVGltZW91dChpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIHRoYXQgYXV0b21hdGljYWxseSBjYW5jZWxzIHRoZSByZXF1ZXN0IHdoZW5cbiAgICogaW52YWxpZGF0ZWQuXG4gICAqL1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spIHtcbiAgICBjb25zdCBpZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoLi4uYXJncykgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgfSk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2tgIHRoYXQgYXV0b21hdGljYWxseSBjYW5jZWxzIHRoZSByZXF1ZXN0IHdoZW5cbiAgICogaW52YWxpZGF0ZWQuXG4gICAqL1xuICByZXF1ZXN0SWRsZUNhbGxiYWNrKGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgY29uc3QgaWQgPSByZXF1ZXN0SWRsZUNhbGxiYWNrKCguLi5hcmdzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc2lnbmFsLmFib3J0ZWQpIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgIH0sIG9wdGlvbnMpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjYW5jZWxJZGxlQ2FsbGJhY2soaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgYWRkRXZlbnRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZSA9PT0gXCJ3eHQ6bG9jYXRpb25jaGFuZ2VcIikge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgdGhpcy5sb2NhdGlvbldhdGNoZXIucnVuKCk7XG4gICAgfVxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyPy4oXG4gICAgICB0eXBlLnN0YXJ0c1dpdGgoXCJ3eHQ6XCIpID8gZ2V0VW5pcXVlRXZlbnROYW1lKHR5cGUpIDogdHlwZSxcbiAgICAgIGhhbmRsZXIsXG4gICAgICB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIHNpZ25hbDogdGhpcy5zaWduYWxcbiAgICAgIH1cbiAgICApO1xuICB9XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICogQWJvcnQgdGhlIGFib3J0IGNvbnRyb2xsZXIgYW5kIGV4ZWN1dGUgYWxsIGBvbkludmFsaWRhdGVkYCBsaXN0ZW5lcnMuXG4gICAqL1xuICBub3RpZnlJbnZhbGlkYXRlZCgpIHtcbiAgICB0aGlzLmFib3J0KFwiQ29udGVudCBzY3JpcHQgY29udGV4dCBpbnZhbGlkYXRlZFwiKTtcbiAgICBsb2dnZXIuZGVidWcoXG4gICAgICBgQ29udGVudCBzY3JpcHQgXCIke3RoaXMuY29udGVudFNjcmlwdE5hbWV9XCIgY29udGV4dCBpbnZhbGlkYXRlZGBcbiAgICApO1xuICB9XG4gIHN0b3BPbGRTY3JpcHRzKCkge1xuICAgIHdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogQ29udGVudFNjcmlwdENvbnRleHQuU0NSSVBUX1NUQVJURURfTUVTU0FHRV9UWVBFLFxuICAgICAgICBjb250ZW50U2NyaXB0TmFtZTogdGhpcy5jb250ZW50U2NyaXB0TmFtZSxcbiAgICAgICAgbWVzc2FnZUlkOiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgICAgfSxcbiAgICAgIFwiKlwiXG4gICAgKTtcbiAgfVxuICB2ZXJpZnlTY3JpcHRTdGFydGVkRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBpc1NjcmlwdFN0YXJ0ZWRFdmVudCA9IGV2ZW50LmRhdGE/LnR5cGUgPT09IENvbnRlbnRTY3JpcHRDb250ZXh0LlNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRTtcbiAgICBjb25zdCBpc1NhbWVDb250ZW50U2NyaXB0ID0gZXZlbnQuZGF0YT8uY29udGVudFNjcmlwdE5hbWUgPT09IHRoaXMuY29udGVudFNjcmlwdE5hbWU7XG4gICAgY29uc3QgaXNOb3REdXBsaWNhdGUgPSAhdGhpcy5yZWNlaXZlZE1lc3NhZ2VJZHMuaGFzKGV2ZW50LmRhdGE/Lm1lc3NhZ2VJZCk7XG4gICAgcmV0dXJuIGlzU2NyaXB0U3RhcnRlZEV2ZW50ICYmIGlzU2FtZUNvbnRlbnRTY3JpcHQgJiYgaXNOb3REdXBsaWNhdGU7XG4gIH1cbiAgbGlzdGVuRm9yTmV3ZXJTY3JpcHRzKG9wdGlvbnMpIHtcbiAgICBsZXQgaXNGaXJzdCA9IHRydWU7XG4gICAgY29uc3QgY2IgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0aGlzLnZlcmlmeVNjcmlwdFN0YXJ0ZWRFdmVudChldmVudCkpIHtcbiAgICAgICAgdGhpcy5yZWNlaXZlZE1lc3NhZ2VJZHMuYWRkKGV2ZW50LmRhdGEubWVzc2FnZUlkKTtcbiAgICAgICAgY29uc3Qgd2FzRmlyc3QgPSBpc0ZpcnN0O1xuICAgICAgICBpc0ZpcnN0ID0gZmFsc2U7XG4gICAgICAgIGlmICh3YXNGaXJzdCAmJiBvcHRpb25zPy5pZ25vcmVGaXJzdEV2ZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMubm90aWZ5SW52YWxpZGF0ZWQoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGNiKTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gcmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgY2IpKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbImRlZmluaXRpb24iLCJicm93c2VyIiwiX2Jyb3dzZXIiLCJjb250ZW50IiwiX2EiLCJfYiIsInJlc3VsdCIsInByaW50IiwibG9nZ2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBTyxXQUFTLG9CQUFvQkEsYUFBWTtBQUM5QyxXQUFPQTtBQUFBLEVBQ1Q7QUNETyxRQUFNQyxjQUFVLHNCQUFXLFlBQVgsbUJBQW9CLFlBQXBCLG1CQUE2QixNQUNoRCxXQUFXLFVBQ1gsV0FBVztBQ0ZSLFFBQU0sVUFBVUM7QUNEdkIsUUFBQSxhQUFBLG9CQUFBO0FBQUEsSUFBbUMsU0FBQSxDQUFBLFlBQUE7QUFBQSxJQUNYLE9BQUE7QUFFcEIsY0FBQSxJQUFBLGdFQUFBO0FBR0EsVUFBQSxTQUFBLGVBQUEsV0FBQTtBQUNFLGlCQUFBLGlCQUFBLG9CQUFBLE1BQUE7QUFDRSwyQkFBQTtBQUFBLFFBQWlCLENBQUE7QUFBQSxNQUNsQixPQUFBO0FBRUQseUJBQUE7QUFBQSxNQUFpQjtBQUFBLElBQ25CO0FBQUEsRUFFSixDQUFBO0FBRUEsTUFBQSxTQUFBO0FBQ0EsTUFBQSxhQUFBO0FBRUEsTUFBQSxhQUFBLEVBQUEsR0FBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLE1BQUEsZUFBQSxFQUFBLEdBQUEsR0FBQSxHQUFBLEVBQUE7QUFFQSxXQUFBLG1CQUFBO0FBQ0UsWUFBQSxJQUFBLDZDQUFBO0FBQ0EseUJBQUE7QUFDQSx1QkFBQTtBQUNBLDJCQUFBO0FBQ0EseUJBQUE7QUFBQSxFQUNGO0FBRUEsV0FBQSx1QkFBQTtBQUVFLFVBQUEsaUJBQUEsU0FBQSxlQUFBLG9CQUFBO0FBQ0EsUUFBQSxnQkFBQTtBQUNFLHFCQUFBLE9BQUE7QUFBQSxJQUFzQjtBQUl4QixhQUFBLFNBQUEsY0FBQSxLQUFBO0FBQ0EsV0FBQSxLQUFBO0FBQ0EsV0FBQSxZQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBY0EsVUFBQSxRQUFBLFNBQUEsY0FBQSxPQUFBO0FBQ0EsVUFBQSxjQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFxU0EsYUFBQSxLQUFBLFlBQUEsS0FBQTtBQUNBLGFBQUEsS0FBQSxZQUFBLE1BQUE7QUFFQSxzQkFBQTtBQUFBLEVBQ0Y7QUFFQSxXQUFBLG9CQUFBO0FBQ0UsVUFBQSxhQUFBLFNBQUEsZUFBQSxhQUFBO0FBQ0EsVUFBQSxPQUFBLFNBQUEsZUFBQSxhQUFBO0FBRUEsUUFBQSxD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
