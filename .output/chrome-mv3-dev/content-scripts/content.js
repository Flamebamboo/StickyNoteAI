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
      console.log("🎯 StickyNoteAI v2.0 NEW CIRCULAR UI - Loading...");
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
    <div class="widget-main-button" id="main-button">
      ✨
    </div>
    <div class="widget-menu" id="widget-menu">
      <div class="menu-button add-button" data-action="add">➕</div>
      <div class="menu-button notes-button" data-action="notes">📋</div>
      <div class="menu-button settings-button" data-action="settings">⚙️</div>
      <div class="menu-button close-button" data-action="close">❌</div>
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
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
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

    /* Modal styles */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1jb250ZW50LXNjcmlwdC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHd4dC1kZXYvYnJvd3Nlci9zcmMvaW5kZXgubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L2Jyb3dzZXIubWpzIiwiLi4vLi4vLi4vZW50cnlwb2ludHMvY29udGVudC50cyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LWNvbnRleHQubWpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVDb250ZW50U2NyaXB0KGRlZmluaXRpb24pIHtcbiAgcmV0dXJuIGRlZmluaXRpb247XG59XG4iLCIvLyAjcmVnaW9uIHNuaXBwZXRcbmV4cG9ydCBjb25zdCBicm93c2VyID0gZ2xvYmFsVGhpcy5icm93c2VyPy5ydW50aW1lPy5pZFxuICA/IGdsb2JhbFRoaXMuYnJvd3NlclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xuLy8gI2VuZHJlZ2lvbiBzbmlwcGV0XG4iLCJpbXBvcnQgeyBicm93c2VyIGFzIF9icm93c2VyIH0gZnJvbSBcIkB3eHQtZGV2L2Jyb3dzZXJcIjtcbmV4cG9ydCBjb25zdCBicm93c2VyID0gX2Jyb3dzZXI7XG5leHBvcnQge307XG4iLCJleHBvcnQgZGVmYXVsdCBkZWZpbmVDb250ZW50U2NyaXB0KHtcbiAgbWF0Y2hlczogW1wiPGFsbF91cmxzPlwiXSxcbiAgbWFpbigpIHtcbiAgICBjb25zb2xlLmxvZyhcIvCfjq8gU3RpY2t5Tm90ZUFJIHYyLjAgTkVXIENJUkNVTEFSIFVJIC0gTG9hZGluZy4uLlwiKTtcblxuICAgIC8vIFdhaXQgZm9yIERPTSB0byBiZSByZWFkeVxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImxvYWRpbmdcIikge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xuICAgICAgICBpbml0aWFsaXplV2lkZ2V0KCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5pdGlhbGl6ZVdpZGdldCgpO1xuICAgIH1cbiAgfSxcbn0pO1xuXG5sZXQgd2lkZ2V0OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xubGV0IGlzRHJhZ2dpbmcgPSBmYWxzZTtcbmxldCBpc01lbnVPcGVuID0gZmFsc2U7XG5sZXQgZHJhZ09mZnNldCA9IHsgeDogMCwgeTogMCB9O1xubGV0IGxhc3RQb3NpdGlvbiA9IHsgeDogMCwgeTogMCB9O1xuXG5mdW5jdGlvbiBpbml0aWFsaXplV2lkZ2V0KCkge1xuICBjb25zb2xlLmxvZyhcIlN0aWNreU5vdGVBSTogRE9NIHJlYWR5LCBjcmVhdGluZyB3aWRnZXQuLi5cIik7XG4gIGNyZWF0ZUZsb2F0aW5nV2lkZ2V0KCk7XG4gIGxvYWRXaWRnZXRQb3NpdGlvbigpO1xuICBzZXR1cEtleWJvYXJkU2hvcnRjdXRzKCk7XG4gIHNldHVwTWVzc2FnZUxpc3RlbmVyKCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUZsb2F0aW5nV2lkZ2V0KCkge1xuICAvLyBSZW1vdmUgZXhpc3Rpbmcgd2lkZ2V0IGlmIGFueVxuICBjb25zdCBleGlzdGluZ1dpZGdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RpY2t5LW5vdGUtd2lkZ2V0XCIpO1xuICBpZiAoZXhpc3RpbmdXaWRnZXQpIHtcbiAgICBleGlzdGluZ1dpZGdldC5yZW1vdmUoKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSBtYWluIHdpZGdldCBjb250YWluZXJcbiAgd2lkZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgd2lkZ2V0LmlkID0gXCJzdGlja3ktbm90ZS13aWRnZXRcIjtcbiAgd2lkZ2V0LmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwid2lkZ2V0LW1haW4tYnV0dG9uXCIgaWQ9XCJtYWluLWJ1dHRvblwiPlxuICAgICAg4pyoXG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cIndpZGdldC1tZW51XCIgaWQ9XCJ3aWRnZXQtbWVudVwiPlxuICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtYnV0dG9uIGFkZC1idXR0b25cIiBkYXRhLWFjdGlvbj1cImFkZFwiPuKelTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtYnV0dG9uIG5vdGVzLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwibm90ZXNcIj7wn5OLPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwibWVudS1idXR0b24gc2V0dGluZ3MtYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJzZXR0aW5nc1wiPuKame+4jzwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtYnV0dG9uIGNsb3NlLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiY2xvc2VcIj7inYw8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICAvLyBBZGQgc3R5bGVzXG4gIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBzdHlsZS50ZXh0Q29udGVudCA9IGBcbiAgICAjc3RpY2t5LW5vdGUtd2lkZ2V0IHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogNTBweDtcbiAgICAgIHJpZ2h0OiA1MHB4O1xuICAgICAgei1pbmRleDogOTk5OTk5O1xuICAgICAgZm9udC1mYW1pbHk6ICdJbnRlcicsIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgc2Fucy1zZXJpZjtcbiAgICAgIHVzZXItc2VsZWN0OiBub25lO1xuICAgICAgcG9pbnRlci1ldmVudHM6IGF1dG87XG4gICAgfVxuXG4gICAgLndpZGdldC1tYWluLWJ1dHRvbiB7XG4gICAgICB3aWR0aDogNTBweDtcbiAgICAgIGhlaWdodDogNTBweDtcbiAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICM2NjdlZWEgMCUsICM3NjRiYTIgMTAwJSk7XG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgZm9udC1zaXplOiAyMHB4O1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgYm94LXNoYWRvdzogMCA0cHggMjBweCByZ2JhKDEwMiwgMTI2LCAyMzQsIDAuMyk7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgICAgYm9yZGVyOiAycHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpO1xuICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEwcHgpO1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWFpbi1idXR0b246aG92ZXIge1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjA1KTtcbiAgICAgIGJveC1zaGFkb3c6IDAgNnB4IDI1cHggcmdiYSgxMDIsIDEyNiwgMjM0LCAwLjQpO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWFpbi1idXR0b24uZHJhZ2dpbmcge1xuICAgICAgY3Vyc29yOiBncmFiYmluZyAhaW1wb3J0YW50O1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjk1KTtcbiAgICAgIGJveC1zaGFkb3c6IDAgOHB4IDMwcHggcmdiYSgxMDIsIDEyNiwgMjM0LCAwLjUpO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudSB7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB0b3A6IDYwcHg7XG4gICAgICBsZWZ0OiA1MCU7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIGdhcDogMTBweDtcbiAgICAgIG9wYWNpdHk6IDA7XG4gICAgICB2aXNpYmlsaXR5OiBoaWRkZW47XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgfVxuXG4gICAgLndpZGdldC1tZW51Lm9wZW4ge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHZpc2liaWxpdHk6IHZpc2libGU7XG4gICAgICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgICB9XG5cbiAgICAubWVudS1idXR0b24ge1xuICAgICAgd2lkdGg6IDQwcHg7XG4gICAgICBoZWlnaHQ6IDQwcHg7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOTUpO1xuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIGJveC1zaGFkb3c6IDAgM3B4IDE1cHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxMHB4KTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMTBweCk7XG4gICAgICBvcGFjaXR5OiAwO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbiB7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgIH1cblxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbjpudGgtY2hpbGQoMSkgeyB0cmFuc2l0aW9uLWRlbGF5OiAwLjA1czsgfVxuICAgIC53aWRnZXQtbWVudS5vcGVuIC5tZW51LWJ1dHRvbjpudGgtY2hpbGQoMikgeyB0cmFuc2l0aW9uLWRlbGF5OiAwLjFzOyB9XG4gICAgLndpZGdldC1tZW51Lm9wZW4gLm1lbnUtYnV0dG9uOm50aC1jaGlsZCgzKSB7IHRyYW5zaXRpb24tZGVsYXk6IDAuMTVzOyB9XG4gICAgLndpZGdldC1tZW51Lm9wZW4gLm1lbnUtYnV0dG9uOm50aC1jaGlsZCg0KSB7IHRyYW5zaXRpb24tZGVsYXk6IDAuMnM7IH1cblxuICAgIC5tZW51LWJ1dHRvbjpob3ZlciB7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7XG4gICAgICBib3gtc2hhZG93OiAwIDVweCAyMHB4IHJnYmEoMCwgMCwgMCwgMC4xNSk7XG4gICAgfVxuXG4gICAgLmNsb3NlLWJ1dHRvbjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMTA3LCAxMDcsIDAuOSkgIWltcG9ydGFudDtcbiAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICB9XG5cbiAgICAvKiBNb2RhbCBzdHlsZXMgKi9cbiAgICAuc3RpY2t5LW1vZGFsIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIGxlZnQ6IDA7XG4gICAgICB3aWR0aDogMTAwdnc7XG4gICAgICBoZWlnaHQ6IDEwMHZoO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjUpO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIHotaW5kZXg6IDEwMDAwMDA7XG4gICAgICBvcGFjaXR5OiAwO1xuICAgICAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcbiAgICB9XG5cbiAgICAuc3RpY2t5LW1vZGFsLm9wZW4ge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHZpc2liaWxpdHk6IHZpc2libGU7XG4gICAgfVxuXG4gICAgLm1vZGFsLWNvbnRlbnQge1xuICAgICAgYmFja2dyb3VuZDogd2hpdGU7XG4gICAgICBwYWRkaW5nOiAzMHB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogMTVweDtcbiAgICAgIGJveC1zaGFkb3c6IDAgMjBweCA2MHB4IHJnYmEoMCwgMCwgMCwgMC4zKTtcbiAgICAgIG1heC13aWR0aDogNTAwcHg7XG4gICAgICB3aWR0aDogOTAlO1xuICAgICAgbWF4LWhlaWdodDogODB2aDtcbiAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDAuOSk7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgIH1cblxuICAgIC5zdGlja3ktbW9kYWwub3BlbiAubW9kYWwtY29udGVudCB7XG4gICAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xuICAgIH1cblxuICAgIC5tb2RhbC1oZWFkZXIge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xuICAgICAgcGFkZGluZy1ib3R0b206IDE1cHg7XG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2VlZTtcbiAgICB9XG5cbiAgICAubW9kYWwtdGl0bGUge1xuICAgICAgZm9udC1zaXplOiAyMHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgIGNvbG9yOiAjMzMzO1xuICAgIH1cblxuICAgIC5tb2RhbC1jbG9zZSB7XG4gICAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgZm9udC1zaXplOiAyNHB4O1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgY29sb3I6ICM5OTk7XG4gICAgICBwYWRkaW5nOiA1cHg7XG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICAgIH1cblxuICAgIC5tb2RhbC1jbG9zZTpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjZjVmNWY1O1xuICAgICAgY29sb3I6ICMzMzM7XG4gICAgfVxuXG4gICAgLm5vdGUtaW5wdXQge1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBtaW4taGVpZ2h0OiAyMDBweDtcbiAgICAgIHBhZGRpbmc6IDE1cHg7XG4gICAgICBib3JkZXI6IDJweCBzb2xpZCAjZTFlNWU5O1xuICAgICAgYm9yZGVyLXJhZGl1czogMTBweDtcbiAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgIGZvbnQtZmFtaWx5OiBpbmhlcml0O1xuICAgICAgcmVzaXplOiB2ZXJ0aWNhbDtcbiAgICAgIHRyYW5zaXRpb246IGJvcmRlci1jb2xvciAwLjJzIGVhc2U7XG4gICAgfVxuXG4gICAgLm5vdGUtaW5wdXQ6Zm9jdXMge1xuICAgICAgb3V0bGluZTogbm9uZTtcbiAgICAgIGJvcmRlci1jb2xvcjogIzY2N2VlYTtcbiAgICB9XG5cbiAgICAuYnV0dG9uLWdyb3VwIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBnYXA6IDEwcHg7XG4gICAgICBtYXJnaW4tdG9wOiAyMHB4O1xuICAgIH1cblxuICAgIC5idG4ge1xuICAgICAgcGFkZGluZzogMTBweCAyMHB4O1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgfVxuXG4gICAgLmJ0bi1wcmltYXJ5IHtcbiAgICAgIGJhY2tncm91bmQ6ICM2NjdlZWE7XG4gICAgICBjb2xvcjogd2hpdGU7XG4gICAgfVxuXG4gICAgLmJ0bi1wcmltYXJ5OmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6ICM1YTZmZDg7XG4gICAgfVxuXG4gICAgLmJ0bi1zZWNvbmRhcnkge1xuICAgICAgYmFja2dyb3VuZDogI2Y4ZjlmYTtcbiAgICAgIGNvbG9yOiAjMzMzO1xuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2RlZTJlNjtcbiAgICB9XG5cbiAgICAuYnRuLXNlY29uZGFyeTpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjZTllY2VmO1xuICAgIH1cblxuICAgIC5ub3Rlcy1wYW5lbCB7XG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICB0b3A6IDUwJTtcbiAgICAgIHJpZ2h0OiAtMzAwcHg7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7XG4gICAgICB3aWR0aDogMjgwcHg7XG4gICAgICBtYXgtaGVpZ2h0OiA0MDBweDtcbiAgICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgICAgYm9yZGVyLXJhZGl1czogMTVweDtcbiAgICAgIGJveC1zaGFkb3c6IDAgMTBweCA0MHB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcbiAgICAgIHotaW5kZXg6IDk5OTk5ODtcbiAgICAgIHRyYW5zaXRpb246IHJpZ2h0IDAuM3MgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbiAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgfVxuXG4gICAgLm5vdGVzLXBhbmVsLm9wZW4ge1xuICAgICAgcmlnaHQ6IDIwcHg7XG4gICAgfVxuXG4gICAgLm5vdGVzLWhlYWRlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjNjY3ZWVhO1xuICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgcGFkZGluZzogMTVweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgfVxuXG4gICAgLm5vdGVzLWxpc3Qge1xuICAgICAgbWF4LWhlaWdodDogMzAwcHg7XG4gICAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgICAgcGFkZGluZzogMTBweDtcbiAgICB9XG5cbiAgICAubm90ZS1pdGVtIHtcbiAgICAgIHBhZGRpbmc6IDEycHg7XG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2VlZTtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQgMC4ycyBlYXNlO1xuICAgIH1cblxuICAgIC5ub3RlLWl0ZW06aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogI2Y4ZjlmYTtcbiAgICB9XG5cbiAgICAubm90ZS1wcmV2aWV3IHtcbiAgICAgIGZvbnQtc2l6ZTogMTNweDtcbiAgICAgIGNvbG9yOiAjNjY2O1xuICAgICAgbWFyZ2luLXRvcDogNXB4O1xuICAgICAgZGlzcGxheTogLXdlYmtpdC1ib3g7XG4gICAgICAtd2Via2l0LWxpbmUtY2xhbXA6IDI7XG4gICAgICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsO1xuICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICB9XG5cbiAgICAubm90ZS1kYXRlIHtcbiAgICAgIGZvbnQtc2l6ZTogMTFweDtcbiAgICAgIGNvbG9yOiAjOTk5O1xuICAgICAgbWFyZ2luLXRvcDogNXB4O1xuICAgIH1cblxuICAgIEBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAgICAgLm5vdGVzLXBhbmVsIHtcbiAgICAgICAgd2lkdGg6IDkwJTtcbiAgICAgICAgcmlnaHQ6IC0xMDAlO1xuICAgICAgfVxuICAgICAgLm5vdGVzLXBhbmVsLm9wZW4ge1xuICAgICAgICByaWdodDogNSU7XG4gICAgICB9XG4gICAgfVxuICBgO1xuXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHdpZGdldCk7XG5cbiAgc2V0dXBXaWRnZXRFdmVudHMoKTtcbn1cblxuZnVuY3Rpb24gc2V0dXBXaWRnZXRFdmVudHMoKSB7XG4gIGNvbnN0IG1haW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW4tYnV0dG9uXCIpO1xuICBjb25zdCBtZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3aWRnZXQtbWVudVwiKTtcblxuICBpZiAoIW1haW5CdXR0b24gfHwgIW1lbnUpIHJldHVybjtcblxuICBsZXQgZHJhZ1N0YXJ0VGltZSA9IDA7XG4gIGxldCBzdGFydFBvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XG4gIGxldCBoYXNNb3ZlZFdoaWxlRHJhZ2dpbmcgPSBmYWxzZTtcblxuICAvLyBNb3VzZSBldmVudHMgZm9yIG1haW4gYnV0dG9uXG4gIG1haW5CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBkcmFnU3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBzdGFydFBvc2l0aW9uID0geyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSB9O1xuICAgIGhhc01vdmVkV2hpbGVEcmFnZ2luZyA9IGZhbHNlO1xuICAgIFxuICAgIGNvbnN0IHJlY3QgPSB3aWRnZXQhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGRyYWdPZmZzZXQueCA9IGUuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICBkcmFnT2Zmc2V0LnkgPSBlLmNsaWVudFkgLSByZWN0LnRvcDtcbiAgICBcbiAgICBtYWluQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJkcmFnZ2luZ1wiKTtcbiAgICBcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGhhbmRsZU1vdXNlTW92ZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgaGFuZGxlTW91c2VVcCk7XG4gIH0pO1xuXG4gIC8vIEhvdmVyIGV2ZW50cyBmb3IgbWVudVxuICBtYWluQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpID0+IHtcbiAgICBpZiAoIWlzRHJhZ2dpbmcpIHtcbiAgICAgIG9wZW5NZW51KCk7XG4gICAgfVxuICB9KTtcblxuICB3aWRnZXQ/LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpID0+IHtcbiAgICBpZiAoIWlzRHJhZ2dpbmcpIHtcbiAgICAgIGNsb3NlTWVudSgpO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gaGFuZGxlTW91c2VNb3ZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBjb25zdCB0aW1lRGlmZiA9IERhdGUubm93KCkgLSBkcmFnU3RhcnRUaW1lO1xuICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KFxuICAgICAgTWF0aC5wb3coZS5jbGllbnRYIC0gc3RhcnRQb3NpdGlvbi54LCAyKSArIFxuICAgICAgTWF0aC5wb3coZS5jbGllbnRZIC0gc3RhcnRQb3NpdGlvbi55LCAyKVxuICAgICk7XG5cbiAgICAvLyBTdGFydCBkcmFnZ2luZyBpZiBtb3ZlZCA+IDNweCBvciBoZWxkIGZvciA+IDEwMG1zXG4gICAgaWYgKCFpc0RyYWdnaW5nICYmIChkaXN0YW5jZSA+IDMgfHwgdGltZURpZmYgPiAxMDApKSB7XG4gICAgICBpc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgIGhhc01vdmVkV2hpbGVEcmFnZ2luZyA9IHRydWU7XG4gICAgICBjbG9zZU1lbnUoKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gXCJncmFiYmluZ1wiO1xuICAgIH1cblxuICAgIGlmIChpc0RyYWdnaW5nKSB7XG4gICAgICBjb25zdCBuZXdYID0gZS5jbGllbnRYIC0gZHJhZ09mZnNldC54O1xuICAgICAgY29uc3QgbmV3WSA9IGUuY2xpZW50WSAtIGRyYWdPZmZzZXQueTtcbiAgICAgIFxuICAgICAgLy8gVXNlIHRyYW5zZm9ybSBmb3Igc21vb3RoZXIgbW92ZW1lbnRcbiAgICAgIHdpZGdldCEuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke25ld1h9cHgsICR7bmV3WX1weClgO1xuICAgICAgd2lkZ2V0IS5zdHlsZS5sZWZ0ID0gXCIwXCI7XG4gICAgICB3aWRnZXQhLnN0eWxlLnRvcCA9IFwiMFwiO1xuICAgICAgXG4gICAgICBsYXN0UG9zaXRpb24gPSB7IHg6IG5ld1gsIHk6IG5ld1kgfTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVNb3VzZVVwKCkge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgaGFuZGxlTW91c2VNb3ZlKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBoYW5kbGVNb3VzZVVwKTtcbiAgICBcbiAgICBtYWluQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnZ2luZ1wiKTtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IFwiXCI7XG4gICAgXG4gICAgaWYgKGlzRHJhZ2dpbmcpIHtcbiAgICAgIC8vIEFwcGx5IGZpbmFsIHBvc2l0aW9uXG4gICAgICB3aWRnZXQhLnN0eWxlLmxlZnQgPSBsYXN0UG9zaXRpb24ueCArIFwicHhcIjtcbiAgICAgIHdpZGdldCEuc3R5bGUudG9wID0gbGFzdFBvc2l0aW9uLnkgKyBcInB4XCI7XG4gICAgICB3aWRnZXQhLnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XG4gICAgICBzYXZlV2lkZ2V0UG9zaXRpb24oKTtcbiAgICB9XG4gICAgXG4gICAgaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgIFxuICAgIC8vIE9wZW4gbWVudSBhZnRlciBkcmFnIGlmIG5vdCBtb3ZlZCBtdWNoXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoIWhhc01vdmVkV2hpbGVEcmFnZ2luZykge1xuICAgICAgICBvcGVuTWVudSgpO1xuICAgICAgfVxuICAgIH0sIDUwKTtcbiAgfVxuXG4gIC8vIE1lbnUgYnV0dG9uIGNsaWNrc1xuICBtZW51Py5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICBjb25zdCBhY3Rpb24gPSB0YXJnZXQuZGF0YXNldC5hY3Rpb247XG4gICAgXG4gICAgaWYgKGFjdGlvbikge1xuICAgICAgaGFuZGxlTWVudUFjdGlvbihhY3Rpb24pO1xuICAgICAgY2xvc2VNZW51KCk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gb3Blbk1lbnUoKSB7XG4gIGlmIChpc0RyYWdnaW5nKSByZXR1cm47XG4gIGNvbnN0IG1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndpZGdldC1tZW51XCIpO1xuICBpZiAobWVudSkge1xuICAgIG1lbnUuY2xhc3NMaXN0LmFkZChcIm9wZW5cIik7XG4gICAgaXNNZW51T3BlbiA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xvc2VNZW51KCkge1xuICBjb25zdCBtZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3aWRnZXQtbWVudVwiKTtcbiAgaWYgKG1lbnUpIHtcbiAgICBtZW51LmNsYXNzTGlzdC5yZW1vdmUoXCJvcGVuXCIpO1xuICAgIGlzTWVudU9wZW4gPSBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVNZW51QWN0aW9uKGFjdGlvbjogc3RyaW5nKSB7XG4gIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgY2FzZSBcImFkZFwiOlxuICAgICAgY3JlYXRlTm90ZUVkaXRvcigpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIm5vdGVzXCI6XG4gICAgICB0b2dnbGVOb3Rlc1BhbmVsKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwic2V0dGluZ3NcIjpcbiAgICAgIG9wZW5TZXR0aW5nc01vZGFsKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiY2xvc2VcIjpcbiAgICAgIGhpZGVXaWRnZXQoKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5vdGVFZGl0b3IoKSB7XG4gIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgbW9kYWwuY2xhc3NOYW1lID0gXCJzdGlja3ktbW9kYWxcIjtcbiAgbW9kYWwuaW5uZXJIVE1MID0gYFxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jb250ZW50XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XG4gICAgICAgIDxoMyBjbGFzcz1cIm1vZGFsLXRpdGxlXCI+4pyP77iPIE5ldyBOb3RlPC9oMz5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsLWNsb3NlXCI+w5c8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPHRleHRhcmVhIGNsYXNzPVwibm90ZS1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiV3JpdGUgeW91ciBub3RlIGhlcmUuLi5cIiBhdXRvZm9jdXM+PC90ZXh0YXJlYT5cbiAgICAgIDxkaXYgY2xhc3M9XCJidXR0b24tZ3JvdXBcIj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBzYXZlLW5vdGVcIj7wn5K+IFNhdmUgTm90ZTwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnkgY2FuY2VsLW5vdGVcIj5DYW5jZWw8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobW9kYWwpO1xuICBzZXRUaW1lb3V0KCgpID0+IG1vZGFsLmNsYXNzTGlzdC5hZGQoXCJvcGVuXCIpLCAxMCk7XG5cbiAgY29uc3QgY2xvc2VCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsLWNsb3NlXCIpO1xuICBjb25zdCBzYXZlQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcihcIi5zYXZlLW5vdGVcIik7XG4gIGNvbnN0IGNhbmNlbEJ0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIuY2FuY2VsLW5vdGVcIik7XG4gIGNvbnN0IHRleHRhcmVhID0gbW9kYWwucXVlcnlTZWxlY3RvcihcIi5ub3RlLWlucHV0XCIpIGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQ7XG5cbiAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpIHtcbiAgICBtb2RhbC5jbGFzc0xpc3QucmVtb3ZlKFwib3BlblwiKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IG1vZGFsLnJlbW92ZSgpLCAzMDApO1xuICB9XG5cbiAgY2xvc2VCdG4/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZU1vZGFsKTtcbiAgY2FuY2VsQnRuPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2VNb2RhbCk7XG4gIFxuICBzYXZlQnRuPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0ZXh0YXJlYS52YWx1ZS50cmltKCk7XG4gICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgIHNhdmVOb3RlKGNvbnRlbnQpO1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRVNDIHRvIGNsb3NlXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGZ1bmN0aW9uIGVzY0hhbmRsZXIoZSkge1xuICAgIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgZXNjSGFuZGxlcik7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlTm90ZXNQYW5lbCgpIHtcbiAgbGV0IHBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ub3Rlcy1wYW5lbFwiKSBhcyBIVE1MRWxlbWVudDtcbiAgXG4gIGlmICghcGFuZWwpIHtcbiAgICBwYW5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcGFuZWwuY2xhc3NOYW1lID0gXCJub3Rlcy1wYW5lbFwiO1xuICAgIHBhbmVsLmlubmVySFRNTCA9IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJub3Rlcy1oZWFkZXJcIj7wn5OLIFJlY2VudCBOb3RlczwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIm5vdGVzLWxpc3RcIiBpZD1cIm5vdGVzLWxpc3RcIj48L2Rpdj5cbiAgICBgO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocGFuZWwpO1xuICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgfVxuXG4gIHBhbmVsLmNsYXNzTGlzdC50b2dnbGUoXCJvcGVuXCIpO1xuICBcbiAgaWYgKHBhbmVsLmNsYXNzTGlzdC5jb250YWlucyhcIm9wZW5cIikpIHtcbiAgICByZWZyZXNoTm90ZXNMaXN0KCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gb3V0c2lkZUNsaWNrSGFuZGxlcihlKSB7XG4gICAgICAgIGlmICghcGFuZWwuY29udGFpbnMoZS50YXJnZXQgYXMgTm9kZSkpIHtcbiAgICAgICAgICBwYW5lbC5jbGFzc0xpc3QucmVtb3ZlKFwib3BlblwiKTtcbiAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb3V0c2lkZUNsaWNrSGFuZGxlcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sIDEwMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gb3BlblNldHRpbmdzTW9kYWwoKSB7XG4gIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgbW9kYWwuY2xhc3NOYW1lID0gXCJzdGlja3ktbW9kYWxcIjtcbiAgbW9kYWwuaW5uZXJIVE1MID0gYFxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jb250ZW50XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XG4gICAgICAgIDxoMyBjbGFzcz1cIm1vZGFsLXRpdGxlXCI+4pqZ77iPIFNldHRpbmdzPC9oMz5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm1vZGFsLWNsb3NlXCI+w5c8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cImxpbmUtaGVpZ2h0OiAxLjY7XCI+XG4gICAgICAgIDxoND7wn46uIEtleWJvYXJkIFNob3J0Y3V0czwvaDQ+XG4gICAgICAgIDxwPjxzdHJvbmc+Q21kL0N0cmwgKyBTaGlmdCArIFM6PC9zdHJvbmc+IENyZWF0ZSBuZXcgbm90ZTwvcD5cbiAgICAgICAgPHA+PHN0cm9uZz5DbWQvQ3RybCArIFNoaWZ0ICsgVzo8L3N0cm9uZz4gVG9nZ2xlIHdpZGdldCB2aXNpYmlsaXR5PC9wPlxuICAgICAgICA8cD48c3Ryb25nPkVTQzo8L3N0cm9uZz4gQ2xvc2UgbW9kYWxzPC9wPlxuICAgICAgICBcbiAgICAgICAgPGg0IHN0eWxlPVwibWFyZ2luLXRvcDogMjVweDtcIj7ihLnvuI8gQWJvdXQ8L2g0PlxuICAgICAgICA8cD48c3Ryb25nPlN0aWNreU5vdGVBSSB2Mi4wPC9zdHJvbmc+PC9wPlxuICAgICAgICA8cD5TbWFydCBmbG9hdGluZyBub3RlcyBmb3IgYW55IHdlYnBhZ2U8L3A+XG4gICAgICAgIFxuICAgICAgICA8aDQgc3R5bGU9XCJtYXJnaW4tdG9wOiAyNXB4O1wiPvCfjq8gVXNhZ2UgVGlwczwvaDQ+XG4gICAgICAgIDxwPuKAoiBIb3ZlciBvdmVyIHRoZSDinKggYnV0dG9uIHRvIHNlZSBtZW51PC9wPlxuICAgICAgICA8cD7igKIgQ2xpY2sgYW5kIGRyYWcgdG8gbW92ZSB0aGUgd2lkZ2V0PC9wPlxuICAgICAgICA8cD7igKIgVXNlIGtleWJvYXJkIHNob3J0Y3V0cyBmb3IgcXVpY2sgYWNjZXNzPC9wPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWdyb3VwXCI+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeSBjbG9zZS1zZXR0aW5nc1wiPkNsb3NlPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1vZGFsKTtcbiAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5jbGFzc0xpc3QuYWRkKFwib3BlblwiKSwgMTApO1xuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XG4gICAgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZShcIm9wZW5cIik7XG4gICAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5yZW1vdmUoKSwgMzAwKTtcbiAgfVxuXG4gIG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIubW9kYWwtY2xvc2VcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZU1vZGFsKTtcbiAgbW9kYWwucXVlcnlTZWxlY3RvcihcIi5jbG9zZS1zZXR0aW5nc1wiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlTW9kYWwpO1xufVxuXG5mdW5jdGlvbiBoaWRlV2lkZ2V0KCkge1xuICBpZiAod2lkZ2V0KSB7XG4gICAgd2lkZ2V0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgfVxufVxuXG5mdW5jdGlvbiBzaG93V2lkZ2V0KCkge1xuICBpZiAod2lkZ2V0KSB7XG4gICAgd2lkZ2V0LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gc2F2ZU5vdGUoY29udGVudDogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChcInN0aWNreU5vdGVzXCIpO1xuICAgIGNvbnN0IG5vdGVzID0gcmVzdWx0LnN0aWNreU5vdGVzIHx8IFtdO1xuICAgIFxuICAgIGNvbnN0IG5ld05vdGUgPSB7XG4gICAgICBpZDogRGF0ZS5ub3coKS50b1N0cmluZygpLFxuICAgICAgY29udGVudCxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZlxuICAgIH07XG4gICAgXG4gICAgbm90ZXMudW5zaGlmdChuZXdOb3RlKTtcbiAgICBcbiAgICAvLyBLZWVwIG9ubHkgbGFzdCA1MCBub3Rlc1xuICAgIGlmIChub3Rlcy5sZW5ndGggPiA1MCkge1xuICAgICAgbm90ZXMuc3BsaWNlKDUwKTtcbiAgICB9XG4gICAgXG4gICAgYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCh7IHN0aWNreU5vdGVzOiBub3RlcyB9KTtcbiAgICBjb25zb2xlLmxvZyhcIk5vdGUgc2F2ZWQgc3VjY2Vzc2Z1bGx5XCIpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBzYXZpbmcgbm90ZTpcIiwgZXJyb3IpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hOb3Rlc0xpc3QoKSB7XG4gIGNvbnN0IG5vdGVzTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm90ZXMtbGlzdFwiKTtcbiAgaWYgKCFub3Rlc0xpc3QpIHJldHVybjtcblxuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoXCJzdGlja3lOb3Rlc1wiKTtcbiAgICBjb25zdCBub3RlcyA9IHJlc3VsdC5zdGlja3lOb3RlcyB8fCBbXTtcbiAgICBcbiAgICBpZiAobm90ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBub3Rlc0xpc3QuaW5uZXJIVE1MID0gJzxkaXYgc3R5bGU9XCJwYWRkaW5nOiAyMHB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7IGNvbG9yOiAjOTk5O1wiPk5vIG5vdGVzIHlldDwvZGl2Pic7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIG5vdGVzTGlzdC5pbm5lckhUTUwgPSBub3Rlcy5zbGljZSgwLCAxMCkubWFwKChub3RlOiBhbnkpID0+IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJub3RlLWl0ZW1cIiBkYXRhLW5vdGUtaWQ9XCIke25vdGUuaWR9XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJub3RlLXByZXZpZXdcIj4ke25vdGUuY29udGVudC5zdWJzdHJpbmcoMCwgMTAwKX0ke25vdGUuY29udGVudC5sZW5ndGggPiAxMDAgPyAnLi4uJyA6ICcnfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibm90ZS1kYXRlXCI+JHtuZXcgRGF0ZShub3RlLnRpbWVzdGFtcCkudG9Mb2NhbGVEYXRlU3RyaW5nKCl9PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBgKS5qb2luKFwiXCIpO1xuICAgIFxuICAgIC8vIENsaWNrIHRvIGVkaXQgbm90ZVxuICAgIG5vdGVzTGlzdC5xdWVyeVNlbGVjdG9yQWxsKFwiLm5vdGUtaXRlbVwiKS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBjb25zdCBub3RlSWQgPSAoaXRlbSBhcyBIVE1MRWxlbWVudCkuZGF0YXNldC5ub3RlSWQ7XG4gICAgICAgIGNvbnN0IG5vdGUgPSBub3Rlcy5maW5kKChuOiBhbnkpID0+IG4uaWQgPT09IG5vdGVJZCk7XG4gICAgICAgIGlmIChub3RlKSB7XG4gICAgICAgICAgZWRpdE5vdGUobm90ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBsb2FkaW5nIG5vdGVzOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZWRpdE5vdGUobm90ZTogYW55KSB7XG4gIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgbW9kYWwuY2xhc3NOYW1lID0gXCJzdGlja3ktbW9kYWxcIjtcbiAgbW9kYWwuaW5uZXJIVE1MID0gYFxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jb250ZW50XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XG4gICAgICAgIDxoMyBjbGFzcz1cIm1vZGFsLXRpdGxlXCI+4pyP77iPIEVkaXQgTm90ZTwvaDM+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJtb2RhbC1jbG9zZVwiPsOXPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICAgIDx0ZXh0YXJlYSBjbGFzcz1cIm5vdGUtaW5wdXRcIiBhdXRvZm9jdXM+JHtub3RlLmNvbnRlbnR9PC90ZXh0YXJlYT5cbiAgICAgIDxkaXYgY2xhc3M9XCJidXR0b24tZ3JvdXBcIj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSB1cGRhdGUtbm90ZVwiPvCfkr4gVXBkYXRlIE5vdGU8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0blwiIHN0eWxlPVwiYmFja2dyb3VuZDogI2RjMzU0NTsgY29sb3I6IHdoaXRlO1wiIGlkPVwiZGVsZXRlLW5vdGVcIj7wn5eR77iPIERlbGV0ZTwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnkgY2FuY2VsLWVkaXRcIj5DYW5jZWw8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobW9kYWwpO1xuICBzZXRUaW1lb3V0KCgpID0+IG1vZGFsLmNsYXNzTGlzdC5hZGQoXCJvcGVuXCIpLCAxMCk7XG5cbiAgY29uc3QgdGV4dGFyZWEgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKFwiLm5vdGUtaW5wdXRcIikgYXMgSFRNTFRleHRBcmVhRWxlbWVudDtcbiAgXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XG4gICAgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZShcIm9wZW5cIik7XG4gICAgc2V0VGltZW91dCgoKSA9PiBtb2RhbC5yZW1vdmUoKSwgMzAwKTtcbiAgfVxuXG4gIG1vZGFsLnF1ZXJ5U2VsZWN0b3IoXCIubW9kYWwtY2xvc2VcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZU1vZGFsKTtcbiAgbW9kYWwucXVlcnlTZWxlY3RvcihcIi5jYW5jZWwtZWRpdFwiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlTW9kYWwpO1xuICBcbiAgbW9kYWwucXVlcnlTZWxlY3RvcihcIi51cGRhdGUtbm90ZVwiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBjb250ZW50ID0gdGV4dGFyZWEudmFsdWUudHJpbSgpO1xuICAgIGlmIChjb250ZW50KSB7XG4gICAgICBhd2FpdCB1cGRhdGVOb3RlKG5vdGUuaWQsIGNvbnRlbnQpO1xuICAgICAgcmVmcmVzaE5vdGVzTGlzdCgpO1xuICAgICAgY2xvc2VNb2RhbCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgbW9kYWwucXVlcnlTZWxlY3RvcihcIiNkZWxldGUtbm90ZVwiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcbiAgICBpZiAoY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBub3RlP1wiKSkge1xuICAgICAgYXdhaXQgZGVsZXRlTm90ZShub3RlLmlkKTtcbiAgICAgIHJlZnJlc2hOb3Rlc0xpc3QoKTtcbiAgICAgIGNsb3NlTW9kYWwoKTtcbiAgICB9XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVOb3RlKG5vdGVJZDogc3RyaW5nLCBuZXdDb250ZW50OiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFwic3RpY2t5Tm90ZXNcIik7XG4gICAgY29uc3Qgbm90ZXMgPSByZXN1bHQuc3RpY2t5Tm90ZXMgfHwgW107XG4gICAgXG4gICAgY29uc3Qgbm90ZUluZGV4ID0gbm90ZXMuZmluZEluZGV4KChub3RlOiBhbnkpID0+IG5vdGUuaWQgPT09IG5vdGVJZCk7XG4gICAgaWYgKG5vdGVJbmRleCAhPT0gLTEpIHtcbiAgICAgIG5vdGVzW25vdGVJbmRleF0uY29udGVudCA9IG5ld0NvbnRlbnQ7XG4gICAgICBub3Rlc1tub3RlSW5kZXhdLnRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgIGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoeyBzdGlja3lOb3Rlczogbm90ZXMgfSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciB1cGRhdGluZyBub3RlOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlTm90ZShub3RlSWQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoXCJzdGlja3lOb3Rlc1wiKTtcbiAgICBjb25zdCBub3RlcyA9IHJlc3VsdC5zdGlja3lOb3RlcyB8fCBbXTtcbiAgICBcbiAgICBjb25zdCBmaWx0ZXJlZE5vdGVzID0gbm90ZXMuZmlsdGVyKChub3RlOiBhbnkpID0+IG5vdGUuaWQgIT09IG5vdGVJZCk7XG4gICAgYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCh7IHN0aWNreU5vdGVzOiBmaWx0ZXJlZE5vdGVzIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBkZWxldGluZyBub3RlOlwiLCBlcnJvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0dXBLZXlib2FyZFNob3J0Y3V0cygpIHtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHtcbiAgICBjb25zdCBpc01hYyA9IG5hdmlnYXRvci5wbGF0Zm9ybS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoJ01BQycpID49IDA7XG4gICAgY29uc3QgbW9kaWZpZXJLZXkgPSBpc01hYyA/IGUubWV0YUtleSA6IGUuY3RybEtleTtcblxuICAgIGlmIChtb2RpZmllcktleSAmJiBlLnNoaWZ0S2V5KSB7XG4gICAgICBpZiAoZS5jb2RlID09PSBcIktleVNcIikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNyZWF0ZU5vdGVFZGl0b3IoKTtcbiAgICAgIH0gZWxzZSBpZiAoZS5jb2RlID09PSBcIktleVdcIikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHdpZGdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RpY2t5LW5vdGUtd2lkZ2V0XCIpO1xuICAgICAgICBpZiAod2lkZ2V0KSB7XG4gICAgICAgICAgaWYgKHdpZGdldC5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIikge1xuICAgICAgICAgICAgc2hvd1dpZGdldCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaWRlV2lkZ2V0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0dXBNZXNzYWdlTGlzdGVuZXIoKSB7XG4gIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IFJlY2VpdmVkIG1lc3NhZ2U6XCIsIG1lc3NhZ2UpO1xuXG4gICAgaWYgKG1lc3NhZ2UuYWN0aW9uID09PSBcInRvZ2dsZS13aWRnZXRcIikge1xuICAgICAgY29uc3Qgd2lkZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGlja3ktbm90ZS13aWRnZXRcIik7XG4gICAgICBpZiAod2lkZ2V0KSB7XG4gICAgICAgIGlmICh3aWRnZXQuc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIpIHtcbiAgICAgICAgICBzaG93V2lkZ2V0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGlkZVdpZGdldCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtZXNzYWdlLmFjdGlvbiA9PT0gXCJuZXctbm90ZVwiKSB7XG4gICAgICBjcmVhdGVOb3RlRWRpdG9yKCk7XG4gICAgfVxuXG4gICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVXaWRnZXRQb3NpdGlvbigpIHtcbiAgaWYgKCF3aWRnZXQpIHJldHVybjtcbiAgXG4gIGNvbnN0IHJlY3QgPSB3aWRnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGNvbnN0IHBvc2l0aW9uID0ge1xuICAgIHg6IHJlY3QubGVmdCxcbiAgICB5OiByZWN0LnRvcFxuICB9O1xuICBcbiAgdHJ5IHtcbiAgICBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KHsgd2lkZ2V0UG9zaXRpb246IHBvc2l0aW9uIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBzYXZpbmcgcG9zaXRpb246XCIsIGVycm9yKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkV2lkZ2V0UG9zaXRpb24oKSB7XG4gIGlmICghd2lkZ2V0KSByZXR1cm47XG4gIFxuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoXCJ3aWRnZXRQb3NpdGlvblwiKTtcbiAgICBpZiAocmVzdWx0LndpZGdldFBvc2l0aW9uKSB7XG4gICAgICBjb25zdCB7IHgsIHkgfSA9IHJlc3VsdC53aWRnZXRQb3NpdGlvbjtcbiAgICAgIHdpZGdldC5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcbiAgICAgIHdpZGdldC5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9hZGluZyBwb3NpdGlvbjpcIiwgZXJyb3IpO1xuICB9XG59XG4iLCJmdW5jdGlvbiBwcmludChtZXRob2QsIC4uLmFyZ3MpIHtcbiAgaWYgKGltcG9ydC5tZXRhLmVudi5NT0RFID09PSBcInByb2R1Y3Rpb25cIikgcmV0dXJuO1xuICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09IFwic3RyaW5nXCIpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gYXJncy5zaGlmdCgpO1xuICAgIG1ldGhvZChgW3d4dF0gJHttZXNzYWdlfWAsIC4uLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIG1ldGhvZChcIlt3eHRdXCIsIC4uLmFyZ3MpO1xuICB9XG59XG5leHBvcnQgY29uc3QgbG9nZ2VyID0ge1xuICBkZWJ1ZzogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUuZGVidWcsIC4uLmFyZ3MpLFxuICBsb2c6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmxvZywgLi4uYXJncyksXG4gIHdhcm46ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLndhcm4sIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUuZXJyb3IsIC4uLmFyZ3MpXG59O1xuIiwiaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gXCJ3eHQvYnJvd3NlclwiO1xuZXhwb3J0IGNsYXNzIFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gIGNvbnN0cnVjdG9yKG5ld1VybCwgb2xkVXJsKSB7XG4gICAgc3VwZXIoV3h0TG9jYXRpb25DaGFuZ2VFdmVudC5FVkVOVF9OQU1FLCB7fSk7XG4gICAgdGhpcy5uZXdVcmwgPSBuZXdVcmw7XG4gICAgdGhpcy5vbGRVcmwgPSBvbGRVcmw7XG4gIH1cbiAgc3RhdGljIEVWRU5UX05BTUUgPSBnZXRVbmlxdWVFdmVudE5hbWUoXCJ3eHQ6bG9jYXRpb25jaGFuZ2VcIik7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0VW5pcXVlRXZlbnROYW1lKGV2ZW50TmFtZSkge1xuICByZXR1cm4gYCR7YnJvd3Nlcj8ucnVudGltZT8uaWR9OiR7aW1wb3J0Lm1ldGEuZW52LkVOVFJZUE9JTlR9OiR7ZXZlbnROYW1lfWA7XG59XG4iLCJpbXBvcnQgeyBXeHRMb2NhdGlvbkNoYW5nZUV2ZW50IH0gZnJvbSBcIi4vY3VzdG9tLWV2ZW50cy5tanNcIjtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2NhdGlvbldhdGNoZXIoY3R4KSB7XG4gIGxldCBpbnRlcnZhbDtcbiAgbGV0IG9sZFVybDtcbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBFbnN1cmUgdGhlIGxvY2F0aW9uIHdhdGNoZXIgaXMgYWN0aXZlbHkgbG9va2luZyBmb3IgVVJMIGNoYW5nZXMuIElmIGl0J3MgYWxyZWFkeSB3YXRjaGluZyxcbiAgICAgKiB0aGlzIGlzIGEgbm9vcC5cbiAgICAgKi9cbiAgICBydW4oKSB7XG4gICAgICBpZiAoaW50ZXJ2YWwgIT0gbnVsbCkgcmV0dXJuO1xuICAgICAgb2xkVXJsID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcbiAgICAgIGludGVydmFsID0gY3R4LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgbGV0IG5ld1VybCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgICAgIGlmIChuZXdVcmwuaHJlZiAhPT0gb2xkVXJsLmhyZWYpIHtcbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgV3h0TG9jYXRpb25DaGFuZ2VFdmVudChuZXdVcmwsIG9sZFVybCkpO1xuICAgICAgICAgIG9sZFVybCA9IG5ld1VybDtcbiAgICAgICAgfVxuICAgICAgfSwgMWUzKTtcbiAgICB9XG4gIH07XG59XG4iLCJpbXBvcnQgeyBicm93c2VyIH0gZnJvbSBcInd4dC9icm93c2VyXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwiLi4vdXRpbHMvaW50ZXJuYWwvbG9nZ2VyLm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0VW5pcXVlRXZlbnROYW1lXG59IGZyb20gXCIuL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzXCI7XG5pbXBvcnQgeyBjcmVhdGVMb2NhdGlvbldhdGNoZXIgfSBmcm9tIFwiLi9pbnRlcm5hbC9sb2NhdGlvbi13YXRjaGVyLm1qc1wiO1xuZXhwb3J0IGNsYXNzIENvbnRlbnRTY3JpcHRDb250ZXh0IHtcbiAgY29uc3RydWN0b3IoY29udGVudFNjcmlwdE5hbWUsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmNvbnRlbnRTY3JpcHROYW1lID0gY29udGVudFNjcmlwdE5hbWU7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBpZiAodGhpcy5pc1RvcEZyYW1lKSB7XG4gICAgICB0aGlzLmxpc3RlbkZvck5ld2VyU2NyaXB0cyh7IGlnbm9yZUZpcnN0RXZlbnQ6IHRydWUgfSk7XG4gICAgICB0aGlzLnN0b3BPbGRTY3JpcHRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlzdGVuRm9yTmV3ZXJTY3JpcHRzKCk7XG4gICAgfVxuICB9XG4gIHN0YXRpYyBTQ1JJUFRfU1RBUlRFRF9NRVNTQUdFX1RZUEUgPSBnZXRVbmlxdWVFdmVudE5hbWUoXG4gICAgXCJ3eHQ6Y29udGVudC1zY3JpcHQtc3RhcnRlZFwiXG4gICk7XG4gIGlzVG9wRnJhbWUgPSB3aW5kb3cuc2VsZiA9PT0gd2luZG93LnRvcDtcbiAgYWJvcnRDb250cm9sbGVyO1xuICBsb2NhdGlvbldhdGNoZXIgPSBjcmVhdGVMb2NhdGlvbldhdGNoZXIodGhpcyk7XG4gIHJlY2VpdmVkTWVzc2FnZUlkcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIGdldCBzaWduYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWJvcnRDb250cm9sbGVyLnNpZ25hbDtcbiAgfVxuICBhYm9ydChyZWFzb24pIHtcbiAgICByZXR1cm4gdGhpcy5hYm9ydENvbnRyb2xsZXIuYWJvcnQocmVhc29uKTtcbiAgfVxuICBnZXQgaXNJbnZhbGlkKCkge1xuICAgIGlmIChicm93c2VyLnJ1bnRpbWUuaWQgPT0gbnVsbCkge1xuICAgICAgdGhpcy5ub3RpZnlJbnZhbGlkYXRlZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zaWduYWwuYWJvcnRlZDtcbiAgfVxuICBnZXQgaXNWYWxpZCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNJbnZhbGlkO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0ZW5lciB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBjb250ZW50IHNjcmlwdCdzIGNvbnRleHQgaXMgaW52YWxpZGF0ZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoZSBsaXN0ZW5lci5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihjYik7XG4gICAqIGNvbnN0IHJlbW92ZUludmFsaWRhdGVkTGlzdGVuZXIgPSBjdHgub25JbnZhbGlkYXRlZCgoKSA9PiB7XG4gICAqICAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5yZW1vdmVMaXN0ZW5lcihjYik7XG4gICAqIH0pXG4gICAqIC8vIC4uLlxuICAgKiByZW1vdmVJbnZhbGlkYXRlZExpc3RlbmVyKCk7XG4gICAqL1xuICBvbkludmFsaWRhdGVkKGNiKSB7XG4gICAgdGhpcy5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGNiKTtcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5zaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGNiKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJuIGEgcHJvbWlzZSB0aGF0IG5ldmVyIHJlc29sdmVzLiBVc2VmdWwgaWYgeW91IGhhdmUgYW4gYXN5bmMgZnVuY3Rpb24gdGhhdCBzaG91bGRuJ3QgcnVuXG4gICAqIGFmdGVyIHRoZSBjb250ZXh0IGlzIGV4cGlyZWQuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGNvbnN0IGdldFZhbHVlRnJvbVN0b3JhZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAqICAgaWYgKGN0eC5pc0ludmFsaWQpIHJldHVybiBjdHguYmxvY2soKTtcbiAgICpcbiAgICogICAvLyAuLi5cbiAgICogfVxuICAgKi9cbiAgYmxvY2soKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5zZXRJbnRlcnZhbGAgdGhhdCBhdXRvbWF0aWNhbGx5IGNsZWFycyB0aGUgaW50ZXJ2YWwgd2hlbiBpbnZhbGlkYXRlZC5cbiAgICovXG4gIHNldEludGVydmFsKGhhbmRsZXIsIHRpbWVvdXQpIHtcbiAgICBjb25zdCBpZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIGhhbmRsZXIoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2xlYXJJbnRlcnZhbChpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5zZXRUaW1lb3V0YCB0aGF0IGF1dG9tYXRpY2FsbHkgY2xlYXJzIHRoZSBpbnRlcnZhbCB3aGVuIGludmFsaWRhdGVkLlxuICAgKi9cbiAgc2V0VGltZW91dChoYW5kbGVyLCB0aW1lb3V0KSB7XG4gICAgY29uc3QgaWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIGhhbmRsZXIoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2xlYXJUaW1lb3V0KGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZWAgdGhhdCBhdXRvbWF0aWNhbGx5IGNhbmNlbHMgdGhlIHJlcXVlc3Qgd2hlblxuICAgKiBpbnZhbGlkYXRlZC5cbiAgICovXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjaykge1xuICAgIGNvbnN0IGlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCguLi5hcmdzKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBjYWxsYmFjayguLi5hcmdzKTtcbiAgICB9KTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFja2AgdGhhdCBhdXRvbWF0aWNhbGx5IGNhbmNlbHMgdGhlIHJlcXVlc3Qgd2hlblxuICAgKiBpbnZhbGlkYXRlZC5cbiAgICovXG4gIHJlcXVlc3RJZGxlQ2FsbGJhY2soY2FsbGJhY2ssIG9wdGlvbnMpIHtcbiAgICBjb25zdCBpZCA9IHJlcXVlc3RJZGxlQ2FsbGJhY2soKC4uLmFyZ3MpID0+IHtcbiAgICAgIGlmICghdGhpcy5zaWduYWwuYWJvcnRlZCkgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgfSwgb3B0aW9ucyk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNhbmNlbElkbGVDYWxsYmFjayhpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICBhZGRFdmVudExpc3RlbmVyKHRhcmdldCwgdHlwZSwgaGFuZGxlciwgb3B0aW9ucykge1xuICAgIGlmICh0eXBlID09PSBcInd4dDpsb2NhdGlvbmNoYW5nZVwiKSB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSB0aGlzLmxvY2F0aW9uV2F0Y2hlci5ydW4oKTtcbiAgICB9XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXI/LihcbiAgICAgIHR5cGUuc3RhcnRzV2l0aChcInd4dDpcIikgPyBnZXRVbmlxdWVFdmVudE5hbWUodHlwZSkgOiB0eXBlLFxuICAgICAgaGFuZGxlcixcbiAgICAgIHtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgc2lnbmFsOiB0aGlzLnNpZ25hbFxuICAgICAgfVxuICAgICk7XG4gIH1cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKiBBYm9ydCB0aGUgYWJvcnQgY29udHJvbGxlciBhbmQgZXhlY3V0ZSBhbGwgYG9uSW52YWxpZGF0ZWRgIGxpc3RlbmVycy5cbiAgICovXG4gIG5vdGlmeUludmFsaWRhdGVkKCkge1xuICAgIHRoaXMuYWJvcnQoXCJDb250ZW50IHNjcmlwdCBjb250ZXh0IGludmFsaWRhdGVkXCIpO1xuICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgIGBDb250ZW50IHNjcmlwdCBcIiR7dGhpcy5jb250ZW50U2NyaXB0TmFtZX1cIiBjb250ZXh0IGludmFsaWRhdGVkYFxuICAgICk7XG4gIH1cbiAgc3RvcE9sZFNjcmlwdHMoKSB7XG4gICAgd2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAge1xuICAgICAgICB0eXBlOiBDb250ZW50U2NyaXB0Q29udGV4dC5TQ1JJUFRfU1RBUlRFRF9NRVNTQUdFX1RZUEUsXG4gICAgICAgIGNvbnRlbnRTY3JpcHROYW1lOiB0aGlzLmNvbnRlbnRTY3JpcHROYW1lLFxuICAgICAgICBtZXNzYWdlSWQ6IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgICB9LFxuICAgICAgXCIqXCJcbiAgICApO1xuICB9XG4gIHZlcmlmeVNjcmlwdFN0YXJ0ZWRFdmVudChldmVudCkge1xuICAgIGNvbnN0IGlzU2NyaXB0U3RhcnRlZEV2ZW50ID0gZXZlbnQuZGF0YT8udHlwZSA9PT0gQ29udGVudFNjcmlwdENvbnRleHQuU0NSSVBUX1NUQVJURURfTUVTU0FHRV9UWVBFO1xuICAgIGNvbnN0IGlzU2FtZUNvbnRlbnRTY3JpcHQgPSBldmVudC5kYXRhPy5jb250ZW50U2NyaXB0TmFtZSA9PT0gdGhpcy5jb250ZW50U2NyaXB0TmFtZTtcbiAgICBjb25zdCBpc05vdER1cGxpY2F0ZSA9ICF0aGlzLnJlY2VpdmVkTWVzc2FnZUlkcy5oYXMoZXZlbnQuZGF0YT8ubWVzc2FnZUlkKTtcbiAgICByZXR1cm4gaXNTY3JpcHRTdGFydGVkRXZlbnQgJiYgaXNTYW1lQ29udGVudFNjcmlwdCAmJiBpc05vdER1cGxpY2F0ZTtcbiAgfVxuICBsaXN0ZW5Gb3JOZXdlclNjcmlwdHMob3B0aW9ucykge1xuICAgIGxldCBpc0ZpcnN0ID0gdHJ1ZTtcbiAgICBjb25zdCBjYiA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRoaXMudmVyaWZ5U2NyaXB0U3RhcnRlZEV2ZW50KGV2ZW50KSkge1xuICAgICAgICB0aGlzLnJlY2VpdmVkTWVzc2FnZUlkcy5hZGQoZXZlbnQuZGF0YS5tZXNzYWdlSWQpO1xuICAgICAgICBjb25zdCB3YXNGaXJzdCA9IGlzRmlyc3Q7XG4gICAgICAgIGlzRmlyc3QgPSBmYWxzZTtcbiAgICAgICAgaWYgKHdhc0ZpcnN0ICYmIG9wdGlvbnM/Lmlnbm9yZUZpcnN0RXZlbnQpIHJldHVybjtcbiAgICAgICAgdGhpcy5ub3RpZnlJbnZhbGlkYXRlZCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgY2IpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiByZW1vdmVFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBjYikpO1xuICB9XG59XG4iXSwibmFtZXMiOlsiZGVmaW5pdGlvbiIsImJyb3dzZXIiLCJfYnJvd3NlciIsImNvbnRlbnQiLCJfYSIsIl9iIiwicmVzdWx0IiwicHJpbnQiLCJsb2dnZXIiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFPLFdBQVMsb0JBQW9CQSxhQUFZO0FBQzlDLFdBQU9BO0FBQUEsRUFDVDtBQ0RPLFFBQU1DLGNBQVUsc0JBQVcsWUFBWCxtQkFBb0IsWUFBcEIsbUJBQTZCLE1BQ2hELFdBQVcsVUFDWCxXQUFXO0FDRlIsUUFBTSxVQUFVQztBQ0R2QixRQUFBLGFBQUEsb0JBQUE7QUFBQSxJQUFtQyxTQUFBLENBQUEsWUFBQTtBQUFBLElBQ1gsT0FBQTtBQUVwQixjQUFBLElBQUEsbURBQUE7QUFHQSxVQUFBLFNBQUEsZUFBQSxXQUFBO0FBQ0UsaUJBQUEsaUJBQUEsb0JBQUEsTUFBQTtBQUNFLDJCQUFBO0FBQUEsUUFBaUIsQ0FBQTtBQUFBLE1BQ2xCLE9BQUE7QUFFRCx5QkFBQTtBQUFBLE1BQWlCO0FBQUEsSUFDbkI7QUFBQSxFQUVKLENBQUE7QUFFQSxNQUFBLFNBQUE7QUFDQSxNQUFBLGFBQUE7QUFFQSxNQUFBLGFBQUEsRUFBQSxHQUFBLEdBQUEsR0FBQSxFQUFBO0FBQ0EsTUFBQSxlQUFBLEVBQUEsR0FBQSxHQUFBLEdBQUEsRUFBQTtBQUVBLFdBQUEsbUJBQUE7QUFDRSxZQUFBLElBQUEsNkNBQUE7QUFDQSx5QkFBQTtBQUNBLHVCQUFBO0FBQ0EsMkJBQUE7QUFDQSx5QkFBQTtBQUFBLEVBQ0Y7QUFFQSxXQUFBLHVCQUFBO0FBRUUsVUFBQSxpQkFBQSxTQUFBLGVBQUEsb0JBQUE7QUFDQSxRQUFBLGdCQUFBO0FBQ0UscUJBQUEsT0FBQTtBQUFBLElBQXNCO0FBSXhCLGFBQUEsU0FBQSxjQUFBLEtBQUE7QUFDQSxXQUFBLEtBQUE7QUFDQSxXQUFBLFlBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWFBLFVBQUEsUUFBQSxTQUFBLGNBQUEsT0FBQTtBQUNBLFVBQUEsY0FBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFpU0EsYUFBQSxLQUFBLFlBQUEsS0FBQTtBQUNBLGFBQUEsS0FBQSxZQUFBLE1BQUE7QUFFQSxzQkFBQTtBQUFBLEVBQ0Y7QUFFQSxXQUFBLG9CQUFBO0FBQ0UsVUFBQSxhQUFBLFNBQUEsZUFBQSxhQUFBO0FBQ0EsVUFBQSxPQUFBLFNBQUEsZUFBQSxhQUFBO0FBRUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxLQUFBO0FBRUEsUUFBQSxnQkFBQTtBQUNBLFFBQUEsZ0JBQUEsRUFBQSxHQUFBLEdBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSx3QkFBQTtBQUdBLGVBQUEsaUJBQUEsYUFBQSxDQUFBLE1BQUE7QUFDRSxRQUFBLGVBQUE7QUFDQSxzQkFBQSxLQUFBLElBQUE7QUFDQSxzQkFBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEdBQUEsRUFBQSxRQUFB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
