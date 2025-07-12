export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    console.log("StickyNoteAI: Initializing...");
    createFloatingWidget();

    // Initialize widget position and notes list after creation
    setTimeout(() => {
      loadWidgetPosition();
      refreshNotesList();
    }, 100);
  },
});

function createFloatingWidget() {
  // Check if widget already exists
  if (document.getElementById("sticky-note-widget")) {
    return;
  }

  // Create the main widget container
  const widget = document.createElement("div");
  widget.id = "sticky-note-widget";
  widget.innerHTML = `
    <div class="widget-header">
      <span class="widget-icon">📝</span>
      <button class="btn-add" title="Add Note">+</button>
      <button class="btn-menu" title="Menu">≡</button>
      <button class="btn-hide" title="Hide">×</button>
    </div>
    <div class="widget-body" style="display: none;">
      <div class="notes-list">
        <div class="no-notes">No notes yet. Click + to add one!</div>
      </div>
    </div>
  `;

  // Add styles
  addWidgetStyles();

  // Make widget draggable
  makeDraggable(widget);

  // Add event listeners
  addWidgetEventListeners(widget);

  // Insert widget into page
  document.body.appendChild(widget);

  console.log("StickyNoteAI: Widget created successfully");
}

function addWidgetStyles() {
  if (document.getElementById("sticky-note-styles")) {
    return;
  }

  const styles = document.createElement("style");
  styles.id = "sticky-note-styles";
  styles.textContent = `
    #sticky-note-widget {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 200px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      backdrop-filter: blur(10px);
      cursor: move;
      transition: all 0.2s ease;
    }

    #sticky-note-widget:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .widget-header {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: rgba(248, 249, 250, 0.9);
      border-radius: 8px 8px 0 0;
      border-bottom: 1px solid #eee;
      gap: 8px;
    }

    .widget-icon {
      font-size: 16px;
      flex: 1;
    }

    .widget-header button {
      background: none;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: background-color 0.2s ease;
    }

    .widget-header button:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    .btn-add {
      color: #28a745;
    }

    .btn-menu {
      color: #6c757d;
    }

    .btn-hide {
      color: #dc3545;
    }

    .widget-body {
      padding: 12px;
      max-height: 300px;
      overflow-y: auto;
    }

    .notes-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .no-notes {
      color: #6c757d;
      font-style: italic;
      text-align: center;
      padding: 20px 10px;
    }

    .note-item {
      background: #f8f9fa;
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 3px solid #007bff;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .note-item:hover {
      background: #e9ecef;
      transform: translateY(-1px);
    }

    .note-title {
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
    }

    .note-preview {
      color: #6c757d;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Hide widget when in stealth mode */
    #sticky-note-widget.stealth {
      opacity: 0.3;
      transform: scale(0.8);
    }

    #sticky-note-widget.minimized {
      width: 60px;
      height: 40px;
    }

    #sticky-note-widget.minimized .widget-body {
      display: none !important;
    }

    #sticky-note-widget.minimized .widget-header {
      padding: 8px;
      justify-content: center;
    }

    #sticky-note-widget.minimized .btn-menu,
    #sticky-note-widget.minimized .btn-add {
      display: none;
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

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "H") {
      e.preventDefault();
      widget.style.display = widget.style.display === "none" ? "block" : "none";
    }
    if (e.ctrlKey && e.shiftKey && e.key === "N") {
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
          <h3>Quick Note</h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <input type="text" placeholder="Note title..." class="note-title-input">
          <textarea placeholder="Start typing your note..." class="note-content-input"></textarea>
          <div class="modal-actions">
            <button class="btn-save">Save Note</button>
            <button class="btn-cancel">Cancel</button>
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
    }

    .modal-backdrop {
      background: rgba(0, 0, 0, 0.5);
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow: hidden;
    }

    .modal-header {
      background: #f8f9fa;
      padding: 16px 20px;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6c757d;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .modal-close:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    .modal-body {
      padding: 20px;
    }

    .note-title-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      margin-bottom: 12px;
      font-family: inherit;
    }

    .note-content-input {
      width: 100%;
      min-height: 150px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      margin-bottom: 16px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .modal-actions button {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-save {
      background: #007bff;
      color: white;
    }

    .btn-save:hover {
      background: #0056b3;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
    }

    .btn-cancel:hover {
      background: #545b62;
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
      refreshNotesList();
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

// Initialize widget position and notes list after creation
