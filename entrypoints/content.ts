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

  // Try multiple approaches to get the correct URLs for public assets
  let smilyFaceUrl: string;
  let add2Url: string;

  try {
    // Primary approach: Use browser.runtime.getURL
    smilyFaceUrl = browser.runtime.getURL("smilyface.gif" as any);
    add2Url = browser.runtime.getURL("add2.png" as any);
  } catch (error) {
    console.warn("browser.runtime.getURL failed, using fallback approach:", error);
    // Fallback approach: Direct extension URL construction
    const extensionId = browser.runtime.id || chrome.runtime.id;
    smilyFaceUrl = `chrome-extension://${extensionId}/smilyface.gif`;
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
          <img src="${add2Url}" alt="Add" style="width: 20px; height: 20px;" id="add-image">
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
      background: linear-gradient(135deg, #9929EA 0%, #CC66DA 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 
        0 4px 20px rgba(153, 41, 234, 0.4),
        0 0 20px rgba(153, 41, 234, 0.5),
        0 0 40px rgba(204, 102, 218, 0.3),
        0 0 60px rgba(204, 102, 218, 0.2);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid rgba(250, 235, 146, 0.3);
      backdrop-filter: blur(10px);
      position: relative;
      animation: pulseGlow 3s ease-in-out infinite;
    }

    @keyframes pulseGlow {
      0%, 100% {
        box-shadow: 
          0 4px 20px rgba(153, 41, 234, 0.4),
          0 0 20px rgba(153, 41, 234, 0.5),
          0 0 40px rgba(204, 102, 218, 0.3),
          0 0 60px rgba(204, 102, 218, 0.2);
      }
      50% {
        box-shadow: 
          0 4px 25px rgba(153, 41, 234, 0.6),
          0 0 30px rgba(153, 41, 234, 0.7),
          0 0 60px rgba(204, 102, 218, 0.5),
          0 0 90px rgba(204, 102, 218, 0.3);
      }
    }

    .widget-main-button:hover {
      transform: scale(1.05);
      box-shadow: 
        0 6px 25px rgba(153, 41, 234, 0.6),
        0 0 35px rgba(153, 41, 234, 0.8),
        0 0 70px rgba(204, 102, 218, 0.6),
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

    .widget-menu.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .menu-button {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #FAEB92 0%, #CC66DA 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 3px 15px rgba(153, 41, 234, 0.3);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid rgba(153, 41, 234, 0.2);
      backdrop-filter: blur(10px);
      transform: translateY(-10px);
      opacity: 0;
      color: #000000;
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
      box-shadow: 0 5px 20px rgba(153, 41, 234, 0.5);
      background: linear-gradient(135deg, #FAEB92 0%, #9929EA 100%);
      color: #FAEB92;
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
      background: linear-gradient(135deg, #FAEB92 0%, #CC66DA 100%);
      border-radius: 15px;
      box-shadow: 
        0 10px 40px rgba(153, 41, 234, 0.5),
        0 0 0 3px #000000,
        0 5px 20px rgba(204, 102, 218, 0.4);
      z-index: 999998;
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      border: 3px solid #000000;
    }

    .notes-panel.open {
      right: 20px;
    }

    .notes-header {
      background: #FDFFB8;
      color: #000000;
      padding: 15px;
      font-weight: 600;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      border-bottom: 3px solid #000000;
    }

    .notes-list {
      max-height: 300px;
      overflow-y: auto;
      padding: 10px;
      background: rgba(0, 0, 0, 0.1);
    }

    .note-item {
      padding: 12px;
      border-bottom: 2px solid #000000;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 8px;
      margin-bottom: 5px;
      background: rgba(253, 255, 184, 0.4);
      backdrop-filter: blur(5px);
    }

    .note-item:hover {
      background: rgba(253, 255, 184, 0.7);
      transform: translateX(5px);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
    }

    .note-preview {
      font-size: 13px;
      color: #000000;
      margin-top: 5px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      font-weight: 500;
    }

    .note-date {
      font-size: 11px;
      color: #9929EA;
      margin-top: 5px;
      font-weight: 600;
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
      width: 300px;
      height: 200px;
      background: #FAEB92;
      border-radius: 15px 15px 5px 15px;
      box-shadow: 
        0 8px 25px rgba(153, 41, 234, 0.6), 
        0 0 0 3px #000000,
        0 4px 15px rgba(204, 102, 218, 0.5);
      z-index: 999997;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      transform: scale(0.8) rotate(-2deg);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 3px solid #000000;
      backdrop-filter: blur(10px);
    }

    .sticky-note.open {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }

    .sticky-note.minimized {
      height: 40px;
      overflow: hidden;
    }

    .sticky-note.minimized .sticky-note-textarea {
      display: none;
    }

    .sticky-note.minimized .note-resize-handle {
      display: none;
    }

    .sticky-note.pinned {
      border: 3px solid #9929EA;
      box-shadow: 
        0 8px 25px rgba(153, 41, 234, 0.8), 
        0 0 0 3px rgba(153, 41, 234, 0.5),
        0 4px 15px rgba(153, 41, 234, 0.6);
    }

    .sticky-note-header {
      background: #FDFFB8;
      padding: 8px 12px;
      border-radius: 12px 12px 0 0;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #000000;
      user-select: none;
    }

    .note-title {
      font-size: 12px;
      font-weight: 600;
      color: #000000;
      text-shadow: 0 1px 2px rgba(250, 235, 146, 0.8);
    }

    .note-controls {
      display: flex;
      gap: 4px;
    }

    .note-control-btn {
      width: 20px;
      height: 20px;
      border: 2px solid #000000;
      border-radius: 50%;
      background: #FDFFB8;
      cursor: pointer;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: #000000;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }

    .note-control-btn:hover {
      background: #9929EA;
      color: #FAEB92;
      transform: scale(1.1);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
    }

    .sticky-note-textarea {
      width: calc(100% - 24px);
      height: calc(100% - 60px);
      margin: 12px;
      border: none;
      background: transparent;
      resize: none;
      outline: none;
      font-family: 'Comic Sans MS', cursive, sans-serif;
      font-size: 14px;
      color: #000000;
      line-height: 1.4;
      placeholder-color: rgba(0, 0, 0, 0.6);
    }

    .sticky-note-textarea::placeholder {
      color: rgba(0, 0, 0, 0.6);
      font-style: italic;
    }

    .note-resize-handle {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      cursor: nw-resize;
      background: linear-gradient(-45deg, transparent 40%, rgba(0, 0, 0, 0.7) 50%, transparent 60%);
      border-radius: 0 0 3px 0;
    }

    .note-resize-handle:hover {
      background: linear-gradient(-45deg, transparent 35%, rgba(153, 41, 234, 0.8) 50%, transparent 65%);
    }
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

  // Improved hover events for menu with better boundary detection
  mainButton.addEventListener("mouseenter", () => {
    if (!isDragging) {
      // Clear any pending close timeout
      if (menuCloseTimeout) {
        clearTimeout(menuCloseTimeout);
        menuCloseTimeout = null;
      }
      openMenu();
    }
  });

  // Keep menu open when hovering over menu items
  menu.addEventListener("mouseenter", () => {
    if (menuCloseTimeout) {
      clearTimeout(menuCloseTimeout);
      menuCloseTimeout = null;
    }
  });

  // Close menu when leaving menu area
  menu.addEventListener("mouseleave", () => {
    if (!isDragging) {
      menuCloseTimeout = setTimeout(() => {
        closeMenu();
        menuCloseTimeout = null;
      }, 100);
    }
  });

  // Close menu when leaving main button area (but not if going to menu)
  mainButton.addEventListener("mouseleave", (e) => {
    if (!isDragging) {
      // Check if mouse is moving towards the menu
      const rect = menu.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // If mouse is within menu bounds or moving towards menu, don't close
      const isNearMenu = mouseX >= rect.left - 10 && mouseX <= rect.right + 10 && mouseY >= rect.top - 10 && mouseY <= rect.bottom + 10;

      if (!isNearMenu) {
        menuCloseTimeout = setTimeout(() => {
          closeMenu();
          menuCloseTimeout = null;
        }, 100);
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
  // Clear any pending timeout
  if (menuCloseTimeout) {
    clearTimeout(menuCloseTimeout);
    menuCloseTimeout = null;
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
  }
}

function createNoteEditor(initialText: string = "") {
  createStickyNote(initialText);
}

function createStickyNote(content: string = "") {
  const noteId = Date.now().toString();
  const note = document.createElement("div");
  note.className = "sticky-note";
  note.id = `sticky-note-${noteId}`;
  note.innerHTML = `
    <div class="sticky-note-header">
      <span class="note-title">Sticky Note...</span>
      <div class="note-controls">
        <button class="note-control-btn pin-btn" title="Pin/Unpin">📌</button>
        <button class="note-control-btn minimize-btn" title="Minimize">−</button>
        <button class="note-control-btn close-btn" title="Close">×</button>
      </div>
    </div>
    <textarea class="sticky-note-textarea" placeholder="Write your note here...">${content}</textarea>
    <div class="note-resize-handle"></div>
  `;

  document.body.appendChild(note);

  // Position the note near the widget but not overlapping
  const widget = document.getElementById("sticky-note-widget");
  if (widget) {
    const widgetRect = widget.getBoundingClientRect();
    note.style.left = Math.max(20, widgetRect.left - 320) + "px";
    note.style.top = Math.max(20, widgetRect.top) + "px";
  } else {
    note.style.left = "100px";
    note.style.top = "100px";
  }

  setTimeout(() => note.classList.add("open"), 10);

  setupStickyNoteEvents(note, noteId);
  return note;
}

function setupStickyNoteEvents(note: HTMLElement, noteId: string) {
  const header = note.querySelector(".sticky-note-header") as HTMLElement;
  const textarea = note.querySelector(".sticky-note-textarea") as HTMLTextAreaElement;
  const closeBtn = note.querySelector(".close-btn");
  const minimizeBtn = note.querySelector(".minimize-btn");
  const pinBtn = note.querySelector(".pin-btn");
  const resizeHandle = note.querySelector(".note-resize-handle") as HTMLElement;

  let isDragging = false;
  let isResizing = false;
  let dragOffset = { x: 0, y: 0 };
  let isPinned = false;
  let isMinimized = false;

  // Auto-save functionality
  let saveTimeout: NodeJS.Timeout;
  textarea.addEventListener("input", () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveNote(textarea.value.trim());
    }, 1000); // Auto-save after 1 second of no typing
  });

  // Dragging functionality
  header.addEventListener("mousedown", (e) => {
    if ((e.target as HTMLElement).classList.contains("note-control-btn")) return;

    isDragging = true;
    const rect = note.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDrag);
    e.preventDefault();
  });

  function handleDrag(e: MouseEvent) {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Constrain to viewport
    const maxX = window.innerWidth - note.offsetWidth;
    const maxY = window.innerHeight - note.offsetHeight;

    note.style.left = Math.max(0, Math.min(maxX, newX)) + "px";
    note.style.top = Math.max(0, Math.min(maxY, newY)) + "px";
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDrag);
  }

  // Resizing functionality
  resizeHandle.addEventListener("mousedown", (e) => {
    isResizing = true;
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
    e.preventDefault();
  });

  function handleResize(e: MouseEvent) {
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

  // Control buttons
  closeBtn?.addEventListener("click", () => {
    note.classList.remove("open");
    setTimeout(() => note.remove(), 300);
  });

  minimizeBtn?.addEventListener("click", () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      note.classList.add("minimized");
      (minimizeBtn as HTMLElement).textContent = "+";
      (minimizeBtn as HTMLElement).title = "Restore";
    } else {
      note.classList.remove("minimized");
      (minimizeBtn as HTMLElement).textContent = "−";
      (minimizeBtn as HTMLElement).title = "Minimize";
    }
  });

  pinBtn?.addEventListener("click", () => {
    isPinned = !isPinned;
    if (isPinned) {
      note.classList.add("pinned");
      (pinBtn as HTMLElement).style.background = "#4CAF50";
    } else {
      note.classList.remove("pinned");
      (pinBtn as HTMLElement).style.background = "";
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

async function refreshNotesList() {
  const notesList = document.getElementById("notes-list");
  if (!notesList) return;

  try {
    const result = await browser.storage.local.get("stickyNotes");
    const notes = result.stickyNotes || [];

    if (notes.length === 0) {
      notesList.innerHTML =
        '<div style="padding: 20px; text-align: center; color: #000000; font-weight: 500;">📝 No notes yet<br><small style="color: #9929EA;">Create your first note!</small></div>';
      return;
    }

    notesList.innerHTML = notes
      .slice(0, 10)
      .map(
        (note: any) => `
      <div class="note-item" data-note-id="${note.id}">
        <div class="note-preview">${note.content.substring(0, 100)}${note.content.length > 100 ? "..." : ""}</div>
        <div class="note-date">${new Date(note.timestamp).toLocaleDateString()}</div>
      </div>
    `
      )
      .join("");

    // Click to edit note
    notesList.querySelectorAll(".note-item").forEach((item) => {
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
  // Local keyboard shortcut handlers using Alt+Shift combinations
  document.addEventListener("keydown", (e) => {
    // Use Alt+Shift combinations to avoid conflicts with browser shortcuts
    if (e.altKey && e.shiftKey) {
      if (e.code === "KeyN") {
        // Alt+Shift+N: Create new note
        e.preventDefault();
        console.log("StickyNoteAI: Alt+Shift+N pressed - Creating new note");
        createNoteEditor();
      } else if (e.code === "KeyW") {
        // Alt+Shift+W: Toggle widget visibility
        e.preventDefault();
        console.log("StickyNoteAI: Alt+Shift+W pressed - Toggling widget visibility");
        if (isWidgetVisible()) {
          hideWidget();
        } else {
          showWidget();
        }
      }
    }

    // ESC key to close modals and notes
    if (e.code === "Escape") {
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
    }
  });

  console.log("StickyNoteAI: Local keyboard shortcuts initialized (Alt+Shift+N, Alt+Shift+W, Esc)");
}

function setupMessageListener() {
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

    // Handle other actions
    if (message.action === "create-note-with-selection") {
      // Handle context menu note creation with selected text
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
