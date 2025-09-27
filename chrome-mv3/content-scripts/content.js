var content=function(){"use strict";var ot=Object.defineProperty;var nt=(O,P,f)=>P in O?ot(O,P,{enumerable:!0,configurable:!0,writable:!0,value:f}):O[P]=f;var X=(O,P,f)=>nt(O,typeof P!="symbol"?P+"":P,f);var we,ke;function O(e){return e}const f=(ke=(we=globalThis.browser)==null?void 0:we.runtime)!=null&&ke.id?globalThis.browser:globalThis.chrome,Ae={matches:["<all_urls>"],main(){console.log("🎯 StickyNoteAI v2.2 CSS FIXED + MENU POSITIONING - Loading..."),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{ge()}):ge()}};let b=null,T=!1,B=!1,J={x:0,y:0},F={x:0,y:0},L=null,ue,Y=null,D={id:"default",data:null};function ge(){console.log("StickyNoteAI: DOM ready, creating widget..."),Re(),je(),$e(),Xe(),Oe()}async function $e(){try{const t=(await f.storage.local.get("sticky-settings"))["sticky-settings"];if(t&&t.activeTheme&&t.activeTheme!=="default"){const o=[{id:"autumn",name:"Autumn",description:"Warm autumn colors with orange, red, and golden tones",colors:{primary:"linear-gradient(135deg, #ff6b35 0%, #d84315 100%)",secondary:"linear-gradient(135deg, #ff8f00 0%, #ef6c00 100%)",accent:"#8d4004",background:"linear-gradient(145deg, #fff3e0, #ffe0b2)",noteColors:["rgba(255, 183, 77, 0.85)","rgba(255, 138, 101, 0.85)","rgba(198, 40, 40, 0.85)","rgba(191, 54, 12, 0.85)","rgba(239, 108, 0, 0.85)","rgba(130, 119, 23, 0.85)"]}}].find(i=>i.id===t.activeTheme);o&&(D={id:t.activeTheme,data:o},console.log("StickyNoteAI: Loaded theme:",t.activeTheme))}}catch(e){console.error("StickyNoteAI: Failed to load theme:",e)}}function Re(){const e=document.getElementById("sticky-note-widget");e&&e.remove(),b=document.createElement("div"),b.id="sticky-note-widget";let t,n;try{t=f.runtime.getURL("smilyface.gif"),ue=t,n=f.runtime.getURL("add2.png")}catch(r){console.warn("browser.runtime.getURL failed, using fallback approach:",r);const d=f.runtime.id||chrome.runtime.id;t=`chrome-extension://${d}/smilyface.gif`,ue=t,n=`chrome-extension://${d}/add2.png`}console.log("StickyNoteAI: Image URLs:",{smilyFaceUrl:t,add2Url:n}),console.log("StickyNoteAI: Extension ID:",f.runtime.id),console.log("StickyNoteAI: Chrome runtime ID:",chrome.runtime.id),b.innerHTML=`
    <div class="widget-container">
      <div class="widget-main-button" id="main-button">
        <img src="${t}" alt="Widget" style="width: 24px; height: 24px;" id="smiley-image">
      </div>
      <div class="widget-menu" id="widget-menu">
        <div class="menu-button add-button" data-action="add">
          <span class="add-icon">📝</span>
        </div>
        <div class="menu-button notes-button" data-action="notes">📋</div>
        <div class="menu-button settings-button" data-action="settings">⚙️</div>
        
      </div>
    </div>
  `;const o=document.createElement("style");o.textContent=`
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
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .panel-close-btn {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: #666;
      padding: 2px 6px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .panel-close-btn:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #000;
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

    /* Note highlight animation */
    .sticky-note.highlight {
      border: 3px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
      transform: scale(1.05);
      transition: all 0.3s ease;
    }

    .sticky-note.highlight-fade {
      border: 2px solid rgba(0, 0, 0, 0.1);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.15),
        0 1px 4px rgba(0, 0, 0, 0.1);
      transform: scale(1);
      transition: all 0.5s ease;
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
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 3px;
      transition: background-color 0.2s ease;
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .note-title:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .note-title-input {
      font-size: 12px;
      font-weight: 500;
      color: #666;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #ccc;
      border-radius: 3px;
      padding: 2px 4px;
      width: 120px;
      outline: none;
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
      outline: none !important;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 13px;
      color: #333;
      line-height: 1.5;
      placeholder-color: rgba(0, 0, 0, 0.4);
      box-shadow: none !important;
    }

    .sticky-note-textarea:focus {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
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
    
    .note-title-display {
      font-weight: 600;
      font-size: 14px;
      color: #1f2937;
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .note-preview {
      color: #374151;
      font-size: 12px;
      line-height: 1.4;
      margin-bottom: 8px;
      font-weight: 400;
    }
    
    .note-date {
      font-size: 11px;
      color: #9ca3af;
      font-weight: 400;
    }

    /* Action Buttons - Uniform Circular Design */
    .action-btn {
      width: 28px;
      height: 28px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.3);
      color: rgba(0, 0, 0, 0.8);
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.5);
      color: rgba(0, 0, 0, 0.9);
      border-color: rgba(0, 0, 0, 0.3);
    }

    .action-btn.read-only-btn {
      background: rgba(255, 255, 255, 0.3);
      color: rgba(0, 0, 0, 0.7);
    }

    .action-btn.read-only-btn.active {
      background: rgba(255, 255, 255, 0.5);
      color: rgba(0, 0, 0, 0.9);
      border-color: rgba(0, 0, 0, 0.4);
    }

    .action-btn.delete-btn {
      background: rgba(255, 255, 255, 0.3);
      color: rgba(0, 0, 0, 0.7);
    }

    .action-btn.delete-btn:hover {
      background: rgba(255, 255, 255, 0.5);
      color: rgba(0, 0, 0, 0.9);
    }

    /* Note Controls Bottom - Left Aligned */
    .note-controls-bottom {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 6px 10px;
      background: var(--note-bg-80, rgba(255, 251, 147, 0.8));
      border-radius: 0 0 6px 6px;
      flex-shrink: 0;
      gap: 8px;
      position: relative;
    }

    /* Toolbar Toggle Button - Same size as other action buttons */
    .toolbar-toggle-btn {
      order: -1; /* Put it first in the flex layout */
      margin-right: 8px;
      flex-shrink: 0;
    }

    /* Collapsed state - hide everything except toggle button */
    .note-controls-bottom.collapsed .note-toolbar > *:not(.toolbar-toggle-btn) {
      display: none;
    }

    .note-controls-bottom.collapsed {
      padding: 6px 10px;
    }

    .note-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Transparency Control */
    .transparency-control {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tool-icon {
      width: 28px;
      height: 28px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.8);
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.2);
      background: rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tool-icon:hover {
      color: rgba(0, 0, 0, 0.9);
      background: rgba(255, 255, 255, 0.5);
      border-color: rgba(0, 0, 0, 0.3);
    }

    .transparency-slider {
      width: 60px;
      height: 5px;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.15);
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }

    .transparency-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }

    .transparency-slider::-webkit-slider-thumb:hover {
      background: rgba(0, 0, 0, 0.8);
      transform: scale(1.1);
    }

    .transparency-slider::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      cursor: pointer;
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    /* Font Size Control */
    .font-size-control {
      position: relative;
      display: flex;
      align-items: center;
    }

    .font-size-popup {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      padding: 6px;
      display: none;
      align-items: center;
      gap: 6px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
      margin-bottom: 3px;
      z-index: 1000;
    }

    .font-size-popup.active {
      display: flex;
    }

    .font-size-btn {
      width: 20px;
      height: 20px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      background: rgba(0, 0, 0, 0.05);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: rgba(0, 0, 0, 0.7);
      transition: all 0.2s ease;
    }

    .font-size-btn:hover {
      background: rgba(0, 0, 0, 0.1);
      color: rgba(0, 0, 0, 0.9);
    }

    .font-size-input {
      width: 35px;
      text-align: center;
      font-size: 11px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 3px;
      padding: 2px 4px;
      background: rgba(255, 255, 255, 0.8);
      outline: none;
    }

    .font-size-input:focus {
      border-color: rgba(0, 0, 0, 0.5);
      background: white;
    }

    /* Action Buttons */
    .note-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }



    /* ...existing code... */
  `,document.head.appendChild(o),document.body.appendChild(b);const i=document.getElementById("smiley-image"),a=document.getElementById("add-image");i&&(i.addEventListener("load",()=>{console.log("✅ Smiley face image loaded successfully")}),i.addEventListener("error",()=>{console.error("❌ Failed to load smiley face image:",t),i.style.display="none"})),a&&(a.addEventListener("load",()=>{console.log("✅ Add2 image loaded successfully")}),a.addEventListener("error",()=>{console.error("❌ Failed to load add2 image:",n),a.style.display="none"})),qe()}function qe(){const e=document.getElementById("main-button"),t=document.getElementById("widget-menu");if(!e||!t)return;let n=0,o={x:0,y:0},i=!1;function a(s,u){if(!b)return{x:s,y:u};const g={width:50,height:50},c=window.innerWidth,h=window.innerHeight,p=10;let x=Math.max(p,s);x=Math.min(c-g.width-p,x);let v=Math.max(p,u);return v=Math.min(h-g.height-p,v),{x,y:v}}function r(s,u){if(!b)return{x:s,y:u};const g={width:50,height:50},c=window.innerWidth,h=window.innerHeight,p=20,x=s,v=c-(s+g.width),I=u,W=h-(u+g.height),M=Math.min(x,v,I,W);let A=s,$=u;return(s<0||s+g.width>c||u<0||u+g.height>h)&&(M===x?A=p:M===v?A=c-g.width-p:M===I?$=p:M===W&&($=h-g.height-p)),{x:A,y:$}}e.addEventListener("mousedown",s=>{s.preventDefault(),n=Date.now(),o={x:s.clientX,y:s.clientY},i=!1;const u=b.getBoundingClientRect();J.x=s.clientX-u.left,J.y=s.clientY-u.top,e.classList.add("dragging"),document.addEventListener("mousemove",d),document.addEventListener("mouseup",y)}),e.addEventListener("click",s=>{!T&&!i&&(s.preventDefault(),s.stopPropagation(),B?H():pe())}),e.addEventListener("mouseenter",()=>{T||(L&&(clearTimeout(L),L=null),B||pe())}),t.addEventListener("mouseenter",()=>{L&&(clearTimeout(L),L=null)}),t.addEventListener("mouseleave",s=>{if(!T){const u=t.getBoundingClientRect(),g=s.clientX,c=s.clientY,h=Math.max(u.width,u.height)*.5;(g<u.left-h||g>u.right+h||c<u.top-h||c>u.bottom+h)&&(L=setTimeout(()=>{H(),L=null},300))}}),e.addEventListener("mouseleave",s=>{if(!T){const u=t.getBoundingClientRect(),g=s.clientX,c=s.clientY,h=Math.max(u.width,u.height)*.5;g>=u.left-h&&g<=u.right+h&&c>=u.top-h&&c<=u.bottom+h||(L=setTimeout(()=>{H(),L=null},200))}});function d(s){const u=Date.now()-n,g=Math.sqrt(Math.pow(s.clientX-o.x,2)+Math.pow(s.clientY-o.y,2));if(!T&&(g>3||u>100)&&(T=!0,i=!0,H(),document.body.style.cursor="grabbing"),T){const c=s.clientX-J.x,h=s.clientY-J.y,p=a(c,h);b.style.transform=`translate(${p.x}px, ${p.y}px)`,b.style.left="0",b.style.top="0",F={x:p.x,y:p.y}}}function y(){if(document.removeEventListener("mousemove",d),document.removeEventListener("mouseup",y),e&&e.classList.remove("dragging"),document.body.style.cursor="",T){const s=r(F.x,F.y);s.x!==F.x||s.y!==F.y?(b.style.transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",b.style.left=s.x+"px",b.style.top=s.y+"px",b.style.transform="",setTimeout(()=>{b&&(b.style.transition="")},300),F=s):(b.style.left=F.x+"px",b.style.top=F.y+"px",b.style.transform=""),De()}T=!1,i=!1}let m=0;t==null||t.addEventListener("click",s=>{const g=s.target.dataset.action,c=Date.now();c-m<500||(m=c,g&&(console.log("Menu button clicked:",g),Be(g)))})}function pe(){if(T)return;const e=document.getElementById("widget-menu"),t=document.getElementById("sticky-note-widget");if(e&&t){const n=t.getBoundingClientRect(),o=window.innerHeight;n.top>o/2?e.classList.add("top-positioned"):e.classList.remove("top-positioned"),e.classList.add("open"),B=!0,Pe()}}function Pe(){Y&&document.removeEventListener("mousemove",Y),Y=e=>{if(!B||T)return;const t=document.getElementById("sticky-note-widget"),n=document.getElementById("widget-menu");if(!t||!n)return;const o=t.getBoundingClientRect(),i=n.getBoundingClientRect(),a=t.querySelector(".widget-main-button"),r=a?a.getBoundingClientRect():o;Math.random()<.1&&console.log("🖱️ Mouse tracking:",{mouse:{x:e.clientX,y:e.clientY},isMenuOpen:B,isDragging:T});const d=e.clientX,y=e.clientY,m={left:Math.min(r.left,i.left),right:Math.max(r.right,i.right),top:Math.min(r.top,i.top),bottom:Math.max(r.bottom,i.bottom)};console.log("🔍 Rectangle Debug:",{widget:{left:o.left,right:o.right,width:o.width,height:o.height},button:{left:r.left,right:r.right,width:r.width,height:r.height},menu:{left:i.left,right:i.right,width:i.width,height:i.height},combined:m,mouse:{x:d,y}});const s=60,u=m.left-s,g=m.right+s,c=m.top-s,h=m.bottom+s;console.log(`📊 Right side analysis:
    Mouse X: ${d}
    Widget (full): ${o.left} to ${o.right} (width: ${o.width})
    Button (actual): ${r.left} to ${r.right} (width: ${r.width})
    Menu: ${i.left} to ${i.right} (width: ${i.width})
    Combined right: ${m.right}
    Right boundary: ${g}
    Distance from boundary: ${d-g}
    Should close when mouse > ${g}`);const p=d<u,x=d>g,v=y<c,I=y>h;(p||x||v||I)&&console.log("⚠️ Boundary checks - SHOULD CLOSE:",{mouse:{x:d,y},boundaries:{left:u,right:g,top:c,bottom:h},checks:{leftSide:p,rightSide:x,topSide:v,bottomSide:I},shouldClose:!0});const W=d-r.right,M=d-i.right,A=Math.max(r.right,i.right),$=d>A+s;$&&console.log("🟢 Simple right check - TRIGGERED:",{mouseX:d,buttonRight:r.right,menuRight:i.right,maxRight:A,tolerance:s,threshold:A+s,simpleRightCheck:!0,distanceFromButtonRight:W,distanceFromMenuRight:M}),(p||x||v||I||$)&&(console.log("🔴 CLOSING MENU - Reason:",{leftSide:p,rightSide:x,topSide:v,bottomSide:I,simpleRightCheck:$}),H())},document.addEventListener("mousemove",Y)}document.addEventListener("click",e=>{if(!B)return;const t=document.getElementById("sticky-note-widget"),n=document.getElementById("widget-menu");if(!t||!n)return;const o=e.target,i=t.contains(o),a=n.contains(o);!i&&!a&&H()});function H(){const e=document.getElementById("widget-menu");e&&(e.classList.remove("open"),B=!1),L&&(clearTimeout(L),L=null),Y&&(document.removeEventListener("mousemove",Y),Y=null)}function Be(e){console.log("Menu action triggered:",e),H(),setTimeout(()=>{switch(e){case"add":Q();break;case"notes":Fe();break;case"settings":He();break}},100)}function Q(e=""){if(S&&S.element&&document.body.contains(S.element)){Z(S.element);return}const t=be(e);setTimeout(()=>{const n=t.querySelector(".sticky-note-textarea");n&&(n.focus(),n.setSelectionRange(n.value.length,n.value.length))},100)}let S=null,R=new Map;function be(e="",t=null){var u,g;if(t&&R.has(t.id)){const c=R.get(t.id);if(c&&document.body.contains(c))return Z(c),c;R.delete(t.id)}if(S&&!t)return Z(S.element),S.element;const n=(t==null?void 0:t.id)||Date.now().toString(),o=document.createElement("div");o.className="sticky-note",o.id=`sticky-note-${n}`;let i,a,r,d,y,m;if(t)i=t.color||"rgba(255, 251, 147, 0.95)",a=t.title||(e.length>15?e.substring(0,15)+"...":e)||"Edit Note",r=t.fontSize||13,d=t.transparency||.95,y=t.position,m=t.size;else{let c;D.id==="autumn"&&((g=(u=D.data)==null?void 0:u.colors)!=null&&g.noteColors)?c=D.data.colors.noteColors:c=["rgba(255, 251, 147, 0.95)","rgba(255, 237, 213, 0.95)","rgba(237, 255, 235, 0.95)","rgba(235, 245, 255, 0.95)","rgba(255, 235, 255, 0.95)","rgba(255, 243, 205, 0.95)","rgba(243, 235, 255, 0.95)"],i=c[Math.floor(Math.random()*c.length)],a=e?e.length>15?e.substring(0,15)+"...":e:"New Note",r=13,d=.95,y=null,m=null}o.innerHTML=`
    <div class="sticky-note-header">
      <span class="note-title" title="Click to edit title">${a}</span>
      <div class="note-controls">
        <button class="note-control-btn pin-btn" title="Pin note (always on top)">📌</button>
        <button class="note-control-btn minimize-btn" title="Minimize">−</button>
        <button class="note-control-btn close-btn" title="Close">×</button>
      </div>
    </div>
    <textarea class="sticky-note-textarea" placeholder="Write your note here..." style="font-size: ${r}px;">${e}</textarea>
    <div class="note-controls-bottom">
      <div class="note-toolbar">
        <button class="action-btn toolbar-toggle-btn" title="Hide toolbar">&lt;</button>
        <div class="transparency-control">
          <input type="range" class="transparency-slider" min="0.3" max="1" step="0.1" value="${d}">
        </div>
        <div class="font-size-control">
          <span class="tool-icon font-size-toggle">Aa</span>
          <div class="font-size-popup">
            <button class="font-size-btn decrease-font">−</button>
            <input type="number" class="font-size-input" min="8" max="24" value="${r}">
            <button class="font-size-btn increase-font">+</button>
          </div>
        </div>
        <button class="action-btn delete-btn" title="Delete Note">🗑</button>
      </div>
    </div>
    <div class="note-resize-handle"></div>
  `;const s=t?i.replace(/rgba\(([^)]+),\s*[0-9.]+\)/,`rgba($1, ${d})`):i;if(o.style.background=s,!t){const c=(Math.random()-.5)*4;o.style.setProperty("--note-rotation",`${c}deg`)}if(document.body.appendChild(o),D.id==="autumn"){o.style.border="2px solid rgba(220, 38, 38, 0.3)",o.style.color="#451a03",o.style.boxShadow="0 8px 25px rgba(69, 26, 3, 0.2)";const c=o.querySelector(".note-toolbar");c&&(c.style.background="rgba(69, 26, 3, 0.8)",c.querySelectorAll("button").forEach(x=>{const v=x;v.style.color="#fef3c7",v.style.background="rgba(220, 38, 38, 0.8)"}));const h=o.querySelector("textarea");h&&(h.style.color="#451a03",h.style.background="rgba(255, 255, 255, 0.9)")}if(y)o.style.left=y.x+"px",o.style.top=y.y+"px";else{const c=document.getElementById("sticky-note-widget");if(c){const h=c.getBoundingClientRect();o.style.left=Math.max(20,h.left-320)+"px",o.style.top=Math.max(20,h.top)+"px"}else o.style.left="100px",o.style.top="100px"}return m&&(o.style.width=m.width+"px",o.style.height=m.height+"px"),setTimeout(()=>o.classList.add("open"),10),t||(S={element:o,id:n}),R.set(n,o),me(o,n),o}function Z(e){e.classList.add("highlight");const t=e.querySelector(".sticky-note-textarea");t&&t.focus(),setTimeout(()=>{e.classList.remove("highlight"),e.classList.add("highlight-fade"),setTimeout(()=>{e.classList.remove("highlight-fade")},500)},300)}function me(e,t){const n=e.querySelector(".sticky-note-header"),o=e.querySelector(".sticky-note-textarea"),i=e.querySelector(".note-title"),a=e.querySelector(".close-btn"),r=e.querySelector(".minimize-btn"),d=e.querySelector(".pin-btn"),y=e.querySelector(".note-resize-handle"),m=e.querySelector(".transparency-slider"),s=e.querySelector(".delete-btn"),u=e.querySelector(".font-size-toggle"),g=e.querySelector(".font-size-popup"),c=e.querySelector(".increase-font"),h=e.querySelector(".decrease-font"),p=e.querySelector(".font-size-input"),x=e.querySelector(".toolbar-toggle-btn"),v=e.querySelector(".note-controls-bottom");let I=!1,W=!1,M={x:0,y:0},A=!1,$=!1,z=parseFloat(m.value),U=parseInt(p.value),V=!e.dataset.noteId,ae=i.textContent||"New Note",E={id:t,title:ae,content:o.value,fontSize:U,transparency:z,color:e.style.background,position:{x:0,y:0},size:{width:280,height:180}},le=!1;i.addEventListener("click",()=>{if(le)return;le=!0;const l=document.createElement("input");l.className="note-title-input",l.value=i.textContent||"",l.maxLength=20,i.replaceWith(l),l.focus(),l.select();function k(){const C=l.value.trim()||"New Note";ae=C,E.title=C;const N=document.createElement("span");N.className="note-title",N.title="Click to edit title",N.textContent=C,l.replaceWith(N),le=!1,N.addEventListener("click",()=>me(e,t))}l.addEventListener("blur",k),l.addEventListener("keydown",C=>{C.key==="Enter"?k():C.key==="Escape"&&(l.value=ae,k())})});const Se=(e.style.background||"rgba(255, 251, 147, 0.95)").match(/rgba?\(([^)]+)\)/),K=Se?Se[1].split(",").slice(0,3).join(","):"255, 251, 147",Ee=`rgba(${K}, ${z})`,_e=`rgba(${K}, ${z*.8})`,Je=`rgba(${K}, ${z*.6})`;e.style.background=Ee,E.color=Ee,e.style.setProperty("--note-bg-80",_e),e.style.setProperty("--note-bg-60",Je),e.style.setProperty("--note-opacity",z.toString()),m.addEventListener("input",()=>{z=parseFloat(m.value),e.style.setProperty("--note-opacity",z.toString());const l=`rgba(${K}, ${z})`,k=`rgba(${K}, ${z*.8})`,C=`rgba(${K}, ${z*.6})`;e.style.background=l,e.style.setProperty("--note-bg-80",k),e.style.setProperty("--note-bg-60",C),E.transparency=z,E.color=l}),n.addEventListener("mousedown",l=>{if(l.target.classList.contains("note-control-btn"))return;I=!0;const k=e.getBoundingClientRect();M.x=l.clientX-k.left,M.y=l.clientY-k.top,document.body.style.cursor="grabbing",e.style.transition="none",e.style.userSelect="none",document.addEventListener("mousemove",Le),document.addEventListener("mouseup",Te),l.preventDefault()});function Le(l){if(!I)return;const k=l.clientX-M.x,C=l.clientY-M.y,N=10,Qe=window.innerWidth-e.offsetWidth-N,Ze=window.innerHeight-e.offsetHeight-N,et=Math.max(N,Math.min(Qe,k)),tt=Math.max(N,Math.min(Ze,C));e.style.left=et+"px",e.style.top=tt+"px"}function Te(){I=!1,document.body.style.cursor="",e.style.transition="all 0.3s ease",e.style.userSelect="",document.removeEventListener("mousemove",Le),document.removeEventListener("mouseup",Te)}y.addEventListener("mousedown",l=>{W=!0,e.style.transition="none",document.body.style.cursor="nw-resize",document.addEventListener("mousemove",ze),document.addEventListener("mouseup",Ce),l.preventDefault(),l.stopPropagation()});function ze(l){if(!W)return;const k=e.getBoundingClientRect(),C=Math.max(250,Math.min(600,l.clientX-k.left)),N=Math.max(180,Math.min(500,l.clientY-k.top));requestAnimationFrame(()=>{e.style.width=C+"px",e.style.height=N+"px"})}function Ce(){W=!1,document.body.style.cursor="",e.style.transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",document.removeEventListener("mousemove",ze),document.removeEventListener("mouseup",Ce)}a==null||a.addEventListener("click",()=>{R.delete(t),o.value.trim()&&V&&de(),e.classList.remove("open"),setTimeout(()=>e.remove(),300)}),r==null||r.addEventListener("click",()=>{$=!$,$?(E.size.width=e.offsetWidth,E.size.height=e.offsetHeight,e.classList.add("minimized"),e.style.height="36px",e.style.minHeight="36px",r.textContent="+",r.title="Restore"):(e.classList.remove("minimized"),e.style.height=E.size.height+"px",e.style.minHeight="180px",r.textContent="−",r.title="Minimize")}),d==null||d.addEventListener("click",()=>{A=!A,A?(e.classList.add("pinned"),e.style.zIndex="999999",d.classList.add("pinned"),d.title="Unpin note"):(e.classList.remove("pinned"),e.style.zIndex="999997",d.classList.remove("pinned"),d.title="Pin note (always on top)")}),u==null||u.addEventListener("click",l=>{l.stopPropagation(),g.classList.toggle("active")}),document.addEventListener("click",l=>{!g.contains(l.target)&&!u.contains(l.target)&&g.classList.remove("active")});function _(l){l>=8&&l<=24&&(U=l,o.style.fontSize=U+"px",p.value=U.toString(),E.fontSize=U)}c==null||c.addEventListener("click",()=>{_(U+1)}),h==null||h.addEventListener("click",()=>{_(U-1)}),p==null||p.addEventListener("input",()=>{const l=parseInt(p.value);isNaN(l)||_(l)}),p==null||p.addEventListener("blur",()=>{const l=parseInt(p.value);isNaN(l)||l<8?_(8):l>24&&_(24)});let ce=!1;x==null||x.addEventListener("click",l=>{l.stopPropagation(),ce=!ce,ce?(v.classList.add("collapsed"),x.innerHTML="&gt;",x.title="Show toolbar"):(v.classList.remove("collapsed"),x.innerHTML="&lt;",x.title="Hide toolbar")}),s==null||s.addEventListener("click",async()=>{confirm("Delete this note?")&&(R.delete(t),S&&S.id===t&&(S=null),V||await ve(t),e.classList.remove("open"),setTimeout(()=>e.remove(),200))});let Ne,Ie=o.value;function de(){const l=o.value.trim();E.content=l;const k=e.getBoundingClientRect();E.position={x:k.left,y:k.top},E.size={width:e.offsetWidth,height:e.offsetHeight},V&&l?(xe(E),V=!1,e.dataset.noteId=E.id):!V&&l!==Ie&&We(E),Ie=l}o.addEventListener("input",()=>{clearTimeout(Ne),Ne=setTimeout(de,2e3)});const Me=()=>{o.value.trim()&&de()};e.addEventListener("blur",Me),window.addEventListener("beforeunload",Me)}let w=null,q=null,ne=null;function Fe(){if(!w){w=document.createElement("div"),w.className="notes-panel",w.innerHTML=`
      <div class="notes-header">
        📋 Recent Notes
        <button class="panel-close-btn" title="Close panel">×</button>
      </div>
      <div class="notes-list" id="notes-list"></div>
    `,document.body.appendChild(w),j();const e=w.querySelector(".panel-close-btn");e==null||e.addEventListener("click",()=>{w&&w.classList.remove("open"),q&&(clearTimeout(q),q=null)});let t=Date.now();const n=()=>{t=Date.now()};w.addEventListener("mouseenter",n),w.addEventListener("mousemove",n),w.addEventListener("click",n),ne=()=>{w&&w.classList.contains("open")&&(Date.now()-t>=6e3?(w.classList.remove("open"),q&&(clearTimeout(q),q=null)):q=setTimeout(ne,1e3))}}w.classList.toggle("open"),w.classList.contains("open")&&(j(),q&&clearTimeout(q),q=setTimeout(ne,1e3))}function He(){var n,o;const e=document.createElement("div");e.className="sticky-modal",e.innerHTML=`
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
  `,document.body.appendChild(e),setTimeout(()=>e.classList.add("open"),10);function t(){e.classList.remove("open"),setTimeout(()=>e.remove(),300)}(n=e.querySelector(".modal-close"))==null||n.addEventListener("click",t),(o=e.querySelector(".close-settings"))==null||o.addEventListener("click",t)}function he(){b&&(b.style.display="none"),document.querySelectorAll(".sticky-note").forEach(t=>{t.style.display="none"})}function fe(){b&&(b.style.display="block"),document.querySelectorAll(".sticky-note").forEach(t=>{t.style.display="block"})}function ye(){return!b||b.style.display==="none"?!1:window.getComputedStyle(b).display!=="none"}async function xe(e){try{const n=(await f.storage.local.get("stickyNotes")).stickyNotes||[],o=n.findIndex(r=>r.id===e.id),i={id:e.id,title:e.title,content:e.content,fontSize:e.fontSize,transparency:e.transparency,color:e.color,position:e.position,size:e.size,timestamp:new Date().toISOString(),url:window.location.href};o!==-1?n[o]=i:n.unshift(i),n.length>50&&n.splice(50),await f.storage.local.set({stickyNotes:n}),console.log("Complete note saved successfully"),document.querySelector(".notes-panel.open")&&j()}catch(t){console.error("Error saving complete note:",t)}}async function We(e){try{const n=(await f.storage.local.get("stickyNotes")).stickyNotes||[],o=n.findIndex(a=>a.id===e.id);if(o!==-1)n[o]={...n[o],title:e.title,content:e.content,fontSize:e.fontSize,transparency:e.transparency,color:e.color,position:e.position,size:e.size,timestamp:new Date().toISOString()};else{await xe(e);return}await f.storage.local.set({stickyNotes:n}),console.log("Complete note updated successfully"),document.querySelector(".notes-panel.open")&&j()}catch(t){console.error("Error updating complete note:",t)}}async function j(){const e=document.getElementById("notes-list");if(e)try{const o=((await f.storage.local.get("stickyNotes")).stickyNotes||[]).filter((i,a,r)=>r.findIndex(d=>d.id===i.id)===a);if(o.length===0){e.innerHTML='<div style="padding: 20px; text-align: center; color: #000000; font-weight: 500;">📝 No notes yet<br><small style="color: #9929EA;">Create your first note!</small></div>';return}e.innerHTML=o.slice(0,10).map(i=>`
      <div class="note-item" data-note-id="${i.id}">
        <div class="note-title-display">${i.title||(i.content.length>20?i.content.substring(0,20)+"...":i.content)||"Untitled"}</div>
        <div class="note-preview">${i.content.substring(0,80)}${i.content.length>80?"...":""}</div>
        <div class="note-date">${new Date(i.timestamp).toLocaleDateString()}</div>
      </div>
    `).join(""),e.querySelectorAll(".note-item").forEach(i=>{i.addEventListener("click",()=>{const a=i.dataset.noteId,r=o.find(d=>d.id===a);r&&Ye(r)})})}catch(t){console.error("Error loading notes:",t)}}function Ye(e){var y;if(R.has(e.id)){const m=R.get(e.id);if(m&&document.body.contains(m)){Z(m);return}else R.delete(e.id)}const t=be(e.content,e);t.dataset.noteId=e.id;const n=t.querySelector(".note-toolbar"),o=document.createElement("button");o.className="action-btn read-only-btn",o.title="Lock/Unlock Note",o.innerHTML="🔒";const i=t.querySelector(".delete-btn");i&&n&&n.insertBefore(o,i);const a=t.querySelector(".sticky-note-textarea");let r=!1;if(o.addEventListener("click",()=>{r=!r,a.readOnly=r,r?(o.classList.add("active"),o.innerHTML="🔓",o.title="Enable Editing",a.style.opacity="0.7",a.style.cursor="default"):(o.classList.remove("active"),o.innerHTML="🔒",o.title="Lock Note",a.style.opacity="1",a.style.cursor="text")}),i){const m=i.cloneNode(!0);(y=i.parentNode)==null||y.replaceChild(m,i),m.addEventListener("click",async()=>{if(r){alert("Cannot delete note in read-only mode. Click the lock icon to enable editing.");return}confirm("Delete this note?")&&(await ve(e.id),R.delete(e.id),S&&S.id===e.id&&(S=null),t.classList.remove("open"),setTimeout(()=>t.remove(),200))})}let d;a.addEventListener("input",()=>{r||(clearTimeout(d),d=setTimeout(async()=>{const m=a.value.trim();m&&e.id&&(await Ue(e.id,m),j())},1e3))})}async function Ue(e,t){try{const o=(await f.storage.local.get("stickyNotes")).stickyNotes||[],i=o.findIndex(a=>a.id===e);i!==-1&&(o[i].content=t,o[i].timestamp=new Date().toISOString(),await f.storage.local.set({stickyNotes:o}))}catch(n){console.error("Error updating note:",n)}}async function ve(e){try{const o=((await f.storage.local.get("stickyNotes")).stickyNotes||[]).filter(a=>a.id!==e);await f.storage.local.set({stickyNotes:o}),document.querySelector(".notes-panel.open")&&j()}catch(t){console.error("Error deleting note:",t)}}function Xe(){let e;document.addEventListener("keydown",t=>{if(!e&&(t.altKey&&t.shiftKey&&!t.ctrlKey&&!t.metaKey&&(t.code==="KeyN"?(t.preventDefault(),t.stopPropagation(),console.log("StickyNoteAI: Alt+Shift+N pressed - Creating/focusing note"),e=setTimeout(()=>{Q(),e=null},100)):t.code==="KeyW"&&(t.preventDefault(),t.stopPropagation(),console.log("StickyNoteAI: Alt+Shift+W pressed - Toggling widget visibility"),e=setTimeout(()=>{ye()?he():fe(),e=null},100))),t.code==="Escape"&&!t.altKey&&!t.shiftKey&&!t.ctrlKey&&!t.metaKey)){const n=document.querySelector(".font-size-popup.active");if(n){t.preventDefault(),n.classList.remove("active");return}const o=document.querySelector(".sticky-modal.open");if(o){t.preventDefault(),o.classList.remove("open"),setTimeout(()=>o.remove(),300);return}const i=document.querySelector(".notes-panel.open");if(i){t.preventDefault(),i.classList.remove("open");return}if(B){t.preventDefault(),H();return}const a=document.querySelectorAll(".sticky-note.open");if(a.length>0){t.preventDefault(),a.forEach(r=>{const d=r;d.classList.remove("open"),setTimeout(()=>d.remove(),300)}),S=null;return}}}),console.log("StickyNoteAI: Enhanced keyboard shortcuts initialized (Alt+Shift+N, Alt+Shift+W, Esc)")}function Oe(){function e(t,n){console.log("StickyNoteAI: Applying theme:",t),document.querySelectorAll(".sticky-note").forEach((i,a)=>{const r=i;if(t==="default")r.style.removeProperty("background"),r.style.removeProperty("border"),r.style.removeProperty("color");else if(n&&n.colors){const d=a%n.colors.noteColors.length;if(r.style.background=n.colors.noteColors[d],t==="autumn"){r.style.border="2px solid rgba(220, 38, 38, 0.3)",r.style.color="#451a03",r.style.boxShadow="0 8px 25px rgba(69, 26, 3, 0.2)";const y=r.querySelector(".note-toolbar");if(y){const s=y;s.style.background="rgba(69, 26, 3, 0.8)",y.querySelectorAll("button").forEach(g=>{const c=g;c.style.color="#fef3c7",c.style.background="rgba(220, 38, 38, 0.8)"})}const m=r.querySelector("textarea");if(m){const s=m;s.style.color="#451a03",s.style.background="rgba(255, 255, 255, 0.9)"}}}}),D={id:t,data:n}}f.runtime.onMessage.addListener((t,n,o)=>{if(console.log("StickyNoteAI: Received message:",t),t.action==="toggle-widget"){console.log("StickyNoteAI: Toggle widget command received"),ye()?(console.log("StickyNoteAI: Hiding widget"),he()):(console.log("StickyNoteAI: Showing widget"),fe()),o({success:!0});return}if(t.action==="new-note"){Q(),o({success:!0});return}if(t.action==="create-note-with-selection"){Q(t.selectedText||""),o({success:!0});return}if(t.action==="toggleStealth"){const i=document.getElementById("sticky-note-widget");i&&(t.enabled?i.style.opacity="0.3":i.style.opacity="1"),o({success:!0});return}if(t.action==="changeTheme"){e(t.themeId,t.theme),o({success:!0});return}o({success:!1,error:"Unknown action"})})}async function De(){if(!b)return;const e=b.getBoundingClientRect(),t={x:e.left,y:e.top};try{await f.storage.local.set({widgetPosition:t})}catch(n){console.error("Error saving position:",n)}}async function je(){if(b){b.style.left="",b.style.top="",b.style.transform="";try{await f.storage.local.remove("widgetPosition")}catch(e){console.error("Error clearing position:",e)}}}function ee(e,...t){}const Ke={debug:(...e)=>ee(console.debug,...e),log:(...e)=>ee(console.log,...e),warn:(...e)=>ee(console.warn,...e),error:(...e)=>ee(console.error,...e)},oe=class oe extends Event{constructor(t,n){super(oe.EVENT_NAME,{}),this.newUrl=t,this.oldUrl=n}};X(oe,"EVENT_NAME",re("wxt:locationchange"));let ie=oe;function re(e){var t;return`${(t=f==null?void 0:f.runtime)==null?void 0:t.id}:content:${e}`}function Ge(e){let t,n;return{run(){t==null&&(n=new URL(location.href),t=e.setInterval(()=>{let o=new URL(location.href);o.href!==n.href&&(window.dispatchEvent(new ie(o,n)),n=o)},1e3))}}}const G=class G{constructor(t,n){X(this,"isTopFrame",window.self===window.top);X(this,"abortController");X(this,"locationWatcher",Ge(this));X(this,"receivedMessageIds",new Set);this.contentScriptName=t,this.options=n,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(t){return this.abortController.abort(t)}get isInvalid(){return f.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(t){return this.signal.addEventListener("abort",t),()=>this.signal.removeEventListener("abort",t)}block(){return new Promise(()=>{})}setInterval(t,n){const o=setInterval(()=>{this.isValid&&t()},n);return this.onInvalidated(()=>clearInterval(o)),o}setTimeout(t,n){const o=setTimeout(()=>{this.isValid&&t()},n);return this.onInvalidated(()=>clearTimeout(o)),o}requestAnimationFrame(t){const n=requestAnimationFrame((...o)=>{this.isValid&&t(...o)});return this.onInvalidated(()=>cancelAnimationFrame(n)),n}requestIdleCallback(t,n){const o=requestIdleCallback((...i)=>{this.signal.aborted||t(...i)},n);return this.onInvalidated(()=>cancelIdleCallback(o)),o}addEventListener(t,n,o,i){var a;n==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(a=t.addEventListener)==null||a.call(t,n.startsWith("wxt:")?re(n):n,o,{...i,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),Ke.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:G.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(t){var a,r,d;const n=((a=t.data)==null?void 0:a.type)===G.SCRIPT_STARTED_MESSAGE_TYPE,o=((r=t.data)==null?void 0:r.contentScriptName)===this.contentScriptName,i=!this.receivedMessageIds.has((d=t.data)==null?void 0:d.messageId);return n&&o&&i}listenForNewerScripts(t){let n=!0;const o=i=>{if(this.verifyScriptStartedEvent(i)){this.receivedMessageIds.add(i.data.messageId);const a=n;if(n=!1,a&&(t!=null&&t.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",o),this.onInvalidated(()=>removeEventListener("message",o))}};X(G,"SCRIPT_STARTED_MESSAGE_TYPE",re("wxt:content-script-started"));let se=G;function it(){}function te(e,...t){}const Ve={debug:(...e)=>te(console.debug,...e),log:(...e)=>te(console.log,...e),warn:(...e)=>te(console.warn,...e),error:(...e)=>te(console.error,...e)};return(async()=>{try{const{main:e,...t}=Ae,n=new se("content",t);return await e(n)}catch(e){throw Ve.error('The content script "content" crashed on startup!',e),e}})()}();
content;
