export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    console.log("🎯 StickyNoteAI v2.0 NEW CIRCULAR UI - Loading...");

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

function initializeWidget() {
  console.log("StickyNoteAI: DOM ready, creating widget...");
  createFloatingWidget();
  loadWidgetPosition();
  setupKeyboardShortcuts();
  setupMessageListener();
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

  // Add styles
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

  // Hover events for menu
  mainButton.addEventListener("mouseenter", () => {
    if (!isDragging) {
      openMenu();
    }
  });

  widget?.addEventListener("mouseleave", () => {
    if (!isDragging) {
      closeMenu();
    }
  });

  function handleMouseMove(e: MouseEvent) {
    const timeDiff = Date.now() - dragStartTime;
    const distance = Math.sqrt(
      Math.pow(e.clientX - startPosition.x, 2) + 
      Math.pow(e.clientY - startPosition.y, 2)
    );

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
      
      // Use transform for smoother movement
      widget!.style.transform = `translate(${newX}px, ${newY}px)`;
      widget!.style.left = "0";
      widget!.style.top = "0";
      
      lastPosition = { x: newX, y: newY };
    }
  }

  function handleMouseUp() {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    
    mainButton.classList.remove("dragging");
    document.body.style.cursor = "";
    
    if (isDragging) {
      // Apply final position
      widget!.style.left = lastPosition.x + "px";
      widget!.style.top = lastPosition.y + "px";
      widget!.style.transform = "";
      saveWidgetPosition();
    }
    
    isDragging = false;
    
    // Open menu after drag if not moved much
    setTimeout(() => {
      if (!hasMovedWhileDragging) {
        openMenu();
      }
    }, 50);
  }

  // Menu button clicks
  menu?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
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
    isMenuOpen = true;
  }
}

function closeMenu() {
  const menu = document.getElementById("widget-menu");
  if (menu) {
    menu.classList.remove("open");
    isMenuOpen = false;
  }
}

function handleMenuAction(action: string) {
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
  const textarea = modal.querySelector(".note-input") as HTMLTextAreaElement;

  function closeModal() {
    modal.classList.remove("open");
    setTimeout(() => modal.remove(), 300);
  }

  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);
  
  saveBtn?.addEventListener("click", () => {
    const content = textarea.value.trim();
    if (content) {
      saveNote(content);
      closeModal();
    }
  });

  // ESC to close
  document.addEventListener("keydown", function escHandler(e) {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escHandler);
    }
  });
}

function toggleNotesPanel() {
  let panel = document.querySelector(".notes-panel") as HTMLElement;
  
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
        if (!panel.contains(e.target as Node)) {
          panel.classList.remove("open");
          document.removeEventListener("click", outsideClickHandler);
        }
      });
    }, 100);
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

  modal.querySelector(".modal-close")?.addEventListener("click", closeModal);
  modal.querySelector(".close-settings")?.addEventListener("click", closeModal);
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

async function saveNote(content: string) {
  try {
    const result = await browser.storage.local.get("stickyNotes");
    const notes = result.stickyNotes || [];
    
    const newNote = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      url: window.location.href
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

async function refreshNotesList() {
  const notesList = document.getElementById("notes-list");
  if (!notesList) return;

  try {
    const result = await browser.storage.local.get("stickyNotes");
    const notes = result.stickyNotes || [];
    
    if (notes.length === 0) {
      notesList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No notes yet</div>';
      return;
    }
    
    notesList.innerHTML = notes.slice(0, 10).map((note: any) => `
      <div class="note-item" data-note-id="${note.id}">
        <div class="note-preview">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</div>
        <div class="note-date">${new Date(note.timestamp).toLocaleDateString()}</div>
      </div>
    `).join("");
    
    // Click to edit note
    notesList.querySelectorAll(".note-item").forEach(item => {
      item.addEventListener("click", () => {
        const noteId = (item as HTMLElement).dataset.noteId;
        const note = notes.find((n: any) => n.id === noteId);
        if (note) {
          editNote(note);
        }
      });
    });
  } catch (error) {
    console.error("Error loading notes:", error);
  }
}

function editNote(note: any) {
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

  const textarea = modal.querySelector(".note-input") as HTMLTextAreaElement;
  
  function closeModal() {
    modal.classList.remove("open");
    setTimeout(() => modal.remove(), 300);
  }

  modal.querySelector(".modal-close")?.addEventListener("click", closeModal);
  modal.querySelector(".cancel-edit")?.addEventListener("click", closeModal);
  
  modal.querySelector(".update-note")?.addEventListener("click", async () => {
    const content = textarea.value.trim();
    if (content) {
      await updateNote(note.id, content);
      refreshNotesList();
      closeModal();
    }
  });

  modal.querySelector("#delete-note")?.addEventListener("click", async () => {
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteNote(note.id);
      refreshNotesList();
      closeModal();
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
  } catch (error) {
    console.error("Error deleting note:", error);
  }
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? e.metaKey : e.ctrlKey;

    if (modifierKey && e.shiftKey) {
      if (e.code === "KeyS") {
        e.preventDefault();
        createNoteEditor();
      } else if (e.code === "KeyW") {
        e.preventDefault();
        const widget = document.getElementById("sticky-note-widget");
        if (widget) {
          if (widget.style.display === "none") {
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
      const widget = document.getElementById("sticky-note-widget");
      if (widget) {
        if (widget.style.display === "none") {
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
    const result = await browser.storage.local.get("widgetPosition");
    if (result.widgetPosition) {
      const { x, y } = result.widgetPosition;
      widget.style.left = x + "px";
      widget.style.top = y + "px";
    }
  } catch (error) {
    console.error("Error loading position:", error);
  }
}
