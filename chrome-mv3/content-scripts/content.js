var content=function(){"use strict";var rt=Object.defineProperty;var st=(O,B,h)=>B in O?rt(O,B,{enumerable:!0,configurable:!0,writable:!0,value:h}):O[B]=h;var X=(O,B,h)=>st(O,typeof B!="symbol"?B+"":B,h);var ke,Ee;function O(e){return e}const h=(Ee=(ke=globalThis.browser)==null?void 0:ke.runtime)!=null&&Ee.id?globalThis.browser:globalThis.chrome,$e={matches:["<all_urls>"],main(){console.log("🎯 StickyNoteAI v2.2 CSS FIXED + MENU POSITIONING - Loading..."),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{pe()}):pe()}};let g=null,T=!1,q=!1,_={x:0,y:0},F={x:0,y:0},L=null,de,Y=null;function ue(e,t){if(e.includes("rgba"))return e.replace(/,\s*[\d.]+\)$/,`, ${t})`);if(e.includes("rgb"))return e.replace("rgb(","rgba(").replace(")",`, ${t})`);if(e.startsWith("#")){const n=e.replace("#",""),o=parseInt(n.substring(0,2),16),i=parseInt(n.substring(2,4),16),r=parseInt(n.substring(4,6),16);return`rgba(${o}, ${i}, ${r}, ${t})`}return e}async function Pe(){try{const e=await h.storage.local.get(["activeTheme"]);if(e.activeTheme){const n=[{id:"default",name:"Classic Colorful",description:"The original colorful sticky notes experience",colors:{primary:"#667eea",secondary:"#764ba2",background:"#f8fafc",text:"#1a202c",noteColors:["#fef3c7","#dbeafe","#fce7f3","#ecfdf5","#fed7d7","#e6fffa"]}},{id:"autumn",name:"Autumn Vibes",description:"Warm earth tones inspired by fall colors",colors:{primary:"#d97706",secondary:"#dc2626",background:"#fef7ed",text:"#451a03",noteColors:["#fed7aa","#fecaca","#fde68a","#d1fae5","#ddd6fe","#f3e8ff"]}}].find(o=>o.id===e.activeTheme);n?(console.log("StickyNoteAI: Loading saved theme:",n.name),we(n)):console.log("StickyNoteAI: Theme not found, using default")}}catch(e){console.error("StickyNoteAI: Error loading saved theme:",e)}}function pe(){console.log("StickyNoteAI: DOM ready, creating widget..."),Re(),Ge(),Oe(),Ke(),Pe()}function Re(){const e=document.getElementById("sticky-note-widget");e&&e.remove(),g=document.createElement("div"),g.id="sticky-note-widget";let t,n;try{t=h.runtime.getURL("smilyface.gif"),de=t,n=h.runtime.getURL("add2.png")}catch(a){console.warn("browser.runtime.getURL failed, using fallback approach:",a);const c=h.runtime.id||chrome.runtime.id;t=`chrome-extension://${c}/smilyface.gif`,de=t,n=`chrome-extension://${c}/add2.png`}console.log("StickyNoteAI: Image URLs:",{smilyFaceUrl:t,add2Url:n}),console.log("StickyNoteAI: Extension ID:",h.runtime.id),console.log("StickyNoteAI: Chrome runtime ID:",chrome.runtime.id),g.innerHTML=`
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
  `,document.head.appendChild(o),document.body.appendChild(g);const i=document.getElementById("smiley-image"),r=document.getElementById("add-image");i&&(i.addEventListener("load",()=>{console.log("✅ Smiley face image loaded successfully")}),i.addEventListener("error",()=>{console.error("❌ Failed to load smiley face image:",t),i.style.display="none"})),r&&(r.addEventListener("load",()=>{console.log("✅ Add2 image loaded successfully")}),r.addEventListener("error",()=>{console.error("❌ Failed to load add2 image:",n),r.style.display="none"})),Be()}function Be(){const e=document.getElementById("main-button"),t=document.getElementById("widget-menu");if(!e||!t)return;let n=0,o={x:0,y:0},i=!1;function r(s,d){if(!g)return{x:s,y:d};const p={width:50,height:50},u=window.innerWidth,f=window.innerHeight,m=10;let x=Math.max(m,s);x=Math.min(u-p.width-m,x);let E=Math.max(m,d);return E=Math.min(f-p.height-m,E),{x,y:E}}function a(s,d){if(!g)return{x:s,y:d};const p={width:50,height:50},u=window.innerWidth,f=window.innerHeight,m=20,x=s,E=u-(s+p.width),N=d,W=f-(d+p.height),M=Math.min(x,E,N,W);let A=s,$=d;return(s<0||s+p.width>u||d<0||d+p.height>f)&&(M===x?A=m:M===E?A=u-p.width-m:M===N?$=m:M===W&&($=f-p.height-m)),{x:A,y:$}}e.addEventListener("mousedown",s=>{s.preventDefault(),n=Date.now(),o={x:s.clientX,y:s.clientY},i=!1;const d=g.getBoundingClientRect();_.x=s.clientX-d.left,_.y=s.clientY-d.top,e.classList.add("dragging"),document.addEventListener("mousemove",c),document.addEventListener("mouseup",y)}),e.addEventListener("click",s=>{!T&&!i&&(s.preventDefault(),s.stopPropagation(),q?H():ge())}),e.addEventListener("mouseenter",()=>{T||(L&&(clearTimeout(L),L=null),q||ge())}),t.addEventListener("mouseenter",()=>{L&&(clearTimeout(L),L=null)}),t.addEventListener("mouseleave",s=>{if(!T){const d=t.getBoundingClientRect(),p=s.clientX,u=s.clientY,f=Math.max(d.width,d.height)*.5;(p<d.left-f||p>d.right+f||u<d.top-f||u>d.bottom+f)&&(L=setTimeout(()=>{H(),L=null},300))}}),e.addEventListener("mouseleave",s=>{if(!T){const d=t.getBoundingClientRect(),p=s.clientX,u=s.clientY,f=Math.max(d.width,d.height)*.5;p>=d.left-f&&p<=d.right+f&&u>=d.top-f&&u<=d.bottom+f||(L=setTimeout(()=>{H(),L=null},200))}});function c(s){const d=Date.now()-n,p=Math.sqrt(Math.pow(s.clientX-o.x,2)+Math.pow(s.clientY-o.y,2));if(!T&&(p>3||d>100)&&(T=!0,i=!0,H(),document.body.style.cursor="grabbing"),T){const u=s.clientX-_.x,f=s.clientY-_.y,m=r(u,f);g.style.transform=`translate(${m.x}px, ${m.y}px)`,g.style.left="0",g.style.top="0",F={x:m.x,y:m.y}}}function y(){if(document.removeEventListener("mousemove",c),document.removeEventListener("mouseup",y),e&&e.classList.remove("dragging"),document.body.style.cursor="",T){const s=a(F.x,F.y);s.x!==F.x||s.y!==F.y?(g.style.transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",g.style.left=s.x+"px",g.style.top=s.y+"px",g.style.transform="",setTimeout(()=>{g&&(g.style.transition="")},300),F=s):(g.style.left=F.x+"px",g.style.top=F.y+"px",g.style.transform=""),Ve()}T=!1,i=!1}let b=0;t==null||t.addEventListener("click",s=>{const p=s.target.dataset.action,u=Date.now();u-b<500||(b=u,p&&(console.log("Menu button clicked:",p),Fe(p)))})}function ge(){if(T)return;const e=document.getElementById("widget-menu"),t=document.getElementById("sticky-note-widget");if(e&&t){const n=t.getBoundingClientRect(),o=window.innerHeight;n.top>o/2?e.classList.add("top-positioned"):e.classList.remove("top-positioned"),e.classList.add("open"),q=!0,qe()}}function qe(){Y&&document.removeEventListener("mousemove",Y),Y=e=>{if(!q||T)return;const t=document.getElementById("sticky-note-widget"),n=document.getElementById("widget-menu");if(!t||!n)return;const o=t.getBoundingClientRect(),i=n.getBoundingClientRect(),r=t.querySelector(".widget-main-button"),a=r?r.getBoundingClientRect():o;Math.random()<.1&&console.log("🖱️ Mouse tracking:",{mouse:{x:e.clientX,y:e.clientY},isMenuOpen:q,isDragging:T});const c=e.clientX,y=e.clientY,b={left:Math.min(a.left,i.left),right:Math.max(a.right,i.right),top:Math.min(a.top,i.top),bottom:Math.max(a.bottom,i.bottom)};console.log("🔍 Rectangle Debug:",{widget:{left:o.left,right:o.right,width:o.width,height:o.height},button:{left:a.left,right:a.right,width:a.width,height:a.height},menu:{left:i.left,right:i.right,width:i.width,height:i.height},combined:b,mouse:{x:c,y}});const s=60,d=b.left-s,p=b.right+s,u=b.top-s,f=b.bottom+s;console.log(`📊 Right side analysis:
    Mouse X: ${c}
    Widget (full): ${o.left} to ${o.right} (width: ${o.width})
    Button (actual): ${a.left} to ${a.right} (width: ${a.width})
    Menu: ${i.left} to ${i.right} (width: ${i.width})
    Combined right: ${b.right}
    Right boundary: ${p}
    Distance from boundary: ${c-p}
    Should close when mouse > ${p}`);const m=c<d,x=c>p,E=y<u,N=y>f;(m||x||E||N)&&console.log("⚠️ Boundary checks - SHOULD CLOSE:",{mouse:{x:c,y},boundaries:{left:d,right:p,top:u,bottom:f},checks:{leftSide:m,rightSide:x,topSide:E,bottomSide:N},shouldClose:!0});const W=c-a.right,M=c-i.right,A=Math.max(a.right,i.right),$=c>A+s;$&&console.log("🟢 Simple right check - TRIGGERED:",{mouseX:c,buttonRight:a.right,menuRight:i.right,maxRight:A,tolerance:s,threshold:A+s,simpleRightCheck:!0,distanceFromButtonRight:W,distanceFromMenuRight:M}),(m||x||E||N||$)&&(console.log("🔴 CLOSING MENU - Reason:",{leftSide:m,rightSide:x,topSide:E,bottomSide:N,simpleRightCheck:$}),H())},document.addEventListener("mousemove",Y)}document.addEventListener("click",e=>{if(!q)return;const t=document.getElementById("sticky-note-widget"),n=document.getElementById("widget-menu");if(!t||!n)return;const o=e.target,i=t.contains(o),r=n.contains(o);!i&&!r&&H()});function H(){const e=document.getElementById("widget-menu");e&&(e.classList.remove("open"),q=!1),L&&(clearTimeout(L),L=null),Y&&(document.removeEventListener("mousemove",Y),Y=null)}function Fe(e){console.log("Menu action triggered:",e),H(),setTimeout(()=>{switch(e){case"add":J();break;case"notes":He();break;case"settings":We();break}},100)}function J(e=""){if(k&&k.element&&document.body.contains(k.element)){Q(k.element);return}const t=me(e);setTimeout(()=>{const n=t.querySelector(".sticky-note-textarea");n&&(n.focus(),n.setSelectionRange(n.value.length,n.value.length))},100)}let k=null,P=new Map;function me(e="",t=null){if(t&&P.has(t.id)){const u=P.get(t.id);if(u&&document.body.contains(u))return Q(u),u;P.delete(t.id)}if(k&&!t)return Q(k.element),k.element;const n=(t==null?void 0:t.id)||Date.now().toString(),o=document.createElement("div");o.className="sticky-note",o.id=`sticky-note-${n}`,o.dataset.noteId=n;let i,r,a,c,y,b,s;if(t)i=t.color||"rgba(255, 251, 147, 0.95)",r=t.title||(e.length>15?e.substring(0,15)+"...":e)||"Edit Note",a=t.fontSize||13,c=t.transparency||.95,y=t.position,b=t.size,s=t.colorIndex||0;else{const u=["rgba(255, 251, 147, 0.95)","rgba(255, 237, 213, 0.95)","rgba(237, 255, 235, 0.95)","rgba(235, 245, 255, 0.95)","rgba(255, 235, 255, 0.95)","rgba(255, 243, 205, 0.95)","rgba(243, 235, 255, 0.95)"];s=Math.floor(Math.random()*u.length),i=u[s],r=e?e.length>15?e.substring(0,15)+"...":e:"New Note",a=13,c=.95,y=null,b=null}o.innerHTML=`
    <div class="sticky-note-header">
      <span class="note-title" title="Click to edit title">${r}</span>
      <div class="note-controls">
        <button class="note-control-btn pin-btn" title="Pin note (always on top)">📌</button>
        <button class="note-control-btn minimize-btn" title="Minimize">−</button>
        <button class="note-control-btn close-btn" title="Close">×</button>
      </div>
    </div>
    <textarea class="sticky-note-textarea" placeholder="Write your note here..." style="font-size: ${a}px;">${e}</textarea>
    <div class="note-controls-bottom">
      <div class="note-toolbar">
        <button class="action-btn toolbar-toggle-btn" title="Hide toolbar">&lt;</button>
        <div class="transparency-control">
          <input type="range" class="transparency-slider" min="0.3" max="1" step="0.1" value="${c}">
        </div>
        <div class="font-size-control">
          <span class="tool-icon font-size-toggle">Aa</span>
          <div class="font-size-popup">
            <button class="font-size-btn decrease-font">−</button>
            <input type="number" class="font-size-input" min="8" max="24" value="${a}">
            <button class="font-size-btn increase-font">+</button>
          </div>
        </div>
        <button class="action-btn delete-btn" title="Delete Note">🗑</button>
      </div>
    </div>
    <div class="note-resize-handle"></div>
  `,o.dataset.colorIndex=s.toString(),o.dataset.transparency=c.toString();const d=t?i.replace(/rgba\(([^)]+),\s*[0-9.]+\)/,`rgba($1, ${c})`):i;o.style.background=d;const p=document.documentElement.style.getPropertyValue(`--theme-note-color-${s}`);if(p&&p.trim()&&(o.style.background=ue(p.trim(),c)),!t){const u=(Math.random()-.5)*4;o.style.setProperty("--note-rotation",`${u}deg`)}if(document.body.appendChild(o),y)o.style.left=y.x+"px",o.style.top=y.y+"px";else{const u=document.getElementById("sticky-note-widget");if(u){const f=u.getBoundingClientRect();o.style.left=Math.max(20,f.left-320)+"px",o.style.top=Math.max(20,f.top)+"px"}else o.style.left="100px",o.style.top="100px"}return b&&(o.style.width=b.width+"px",o.style.height=b.height+"px"),setTimeout(()=>o.classList.add("open"),10),t||(k={element:o,id:n}),P.set(n,o),be(o,n),o}function Q(e){e.classList.add("highlight");const t=e.querySelector(".sticky-note-textarea");t&&t.focus(),setTimeout(()=>{e.classList.remove("highlight"),e.classList.add("highlight-fade"),setTimeout(()=>{e.classList.remove("highlight-fade")},500)},300)}function be(e,t){const n=e.querySelector(".sticky-note-header"),o=e.querySelector(".sticky-note-textarea"),i=e.querySelector(".note-title"),r=e.querySelector(".close-btn"),a=e.querySelector(".minimize-btn"),c=e.querySelector(".pin-btn"),y=e.querySelector(".note-resize-handle"),b=e.querySelector(".transparency-slider"),s=e.querySelector(".delete-btn"),d=e.querySelector(".font-size-toggle"),p=e.querySelector(".font-size-popup"),u=e.querySelector(".increase-font"),f=e.querySelector(".decrease-font"),m=e.querySelector(".font-size-input"),x=e.querySelector(".toolbar-toggle-btn"),E=e.querySelector(".note-controls-bottom");let N=!1,W=!1,M={x:0,y:0},A=!1,$=!1,I=parseFloat(b.value),U=parseInt(m.value),V=!e.dataset.noteId,se=i.textContent||"New Note",S={id:t,title:se,content:o.value,fontSize:U,transparency:I,color:e.style.background,colorIndex:parseInt(e.dataset.colorIndex||"0",10),position:{x:0,y:0},size:{width:280,height:180}},ae=!1;i.addEventListener("click",()=>{if(ae)return;ae=!0;const l=document.createElement("input");l.className="note-title-input",l.value=i.textContent||"",l.maxLength=20,i.replaceWith(l),l.focus(),l.select();function w(){const C=l.value.trim()||"New Note";se=C,S.title=C;const z=document.createElement("span");z.className="note-title",z.title="Click to edit title",z.textContent=C,l.replaceWith(z),ae=!1,z.addEventListener("click",()=>be(e,t))}l.addEventListener("blur",w),l.addEventListener("keydown",C=>{C.key==="Enter"?w():C.key==="Escape"&&(l.value=se,w())})});const Se=(e.style.background||"rgba(255, 251, 147, 0.95)").match(/rgba?\(([^)]+)\)/),j=Se?Se[1].split(",").slice(0,3).join(","):"255, 251, 147",Le=`rgba(${j}, ${I})`,Ze=`rgba(${j}, ${I*.8})`,et=`rgba(${j}, ${I*.6})`;e.style.background=Le,S.color=Le,e.style.setProperty("--note-bg-80",Ze),e.style.setProperty("--note-bg-60",et),e.style.setProperty("--note-opacity",I.toString()),b.addEventListener("input",()=>{I=parseFloat(b.value),e.style.setProperty("--note-opacity",I.toString());const l=`rgba(${j}, ${I})`,w=`rgba(${j}, ${I*.8})`,C=`rgba(${j}, ${I*.6})`;e.style.background=l,e.style.setProperty("--note-bg-80",w),e.style.setProperty("--note-bg-60",C),S.transparency=I,e.dataset.transparency=I.toString(),S.color=l}),n.addEventListener("mousedown",l=>{if(l.target.classList.contains("note-control-btn"))return;N=!0;const w=e.getBoundingClientRect();M.x=l.clientX-w.left,M.y=l.clientY-w.top,document.body.style.cursor="grabbing",e.style.transition="none",e.style.userSelect="none",document.addEventListener("mousemove",Ie),document.addEventListener("mouseup",Te),l.preventDefault()});function Ie(l){if(!N)return;const w=l.clientX-M.x,C=l.clientY-M.y,z=10,tt=window.innerWidth-e.offsetWidth-z,ot=window.innerHeight-e.offsetHeight-z,nt=Math.max(z,Math.min(tt,w)),it=Math.max(z,Math.min(ot,C));e.style.left=nt+"px",e.style.top=it+"px"}function Te(){N=!1,document.body.style.cursor="",e.style.transition="all 0.3s ease",e.style.userSelect="",document.removeEventListener("mousemove",Ie),document.removeEventListener("mouseup",Te)}y.addEventListener("mousedown",l=>{W=!0,e.style.transition="none",document.body.style.cursor="nw-resize",document.addEventListener("mousemove",Ce),document.addEventListener("mouseup",ze),l.preventDefault(),l.stopPropagation()});function Ce(l){if(!W)return;const w=e.getBoundingClientRect(),C=Math.max(250,Math.min(600,l.clientX-w.left)),z=Math.max(180,Math.min(500,l.clientY-w.top));requestAnimationFrame(()=>{e.style.width=C+"px",e.style.height=z+"px"})}function ze(){W=!1,document.body.style.cursor="",e.style.transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",document.removeEventListener("mousemove",Ce),document.removeEventListener("mouseup",ze)}r==null||r.addEventListener("click",()=>{P.delete(t),o.value.trim()&&V&&ce(),e.classList.remove("open"),setTimeout(()=>e.remove(),300)}),a==null||a.addEventListener("click",()=>{$=!$,$?(S.size.width=e.offsetWidth,S.size.height=e.offsetHeight,e.classList.add("minimized"),e.style.height="36px",e.style.minHeight="36px",a.textContent="+",a.title="Restore"):(e.classList.remove("minimized"),e.style.height=S.size.height+"px",e.style.minHeight="180px",a.textContent="−",a.title="Minimize")}),c==null||c.addEventListener("click",()=>{A=!A,A?(e.classList.add("pinned"),e.style.zIndex="999999",c.classList.add("pinned"),c.title="Unpin note"):(e.classList.remove("pinned"),e.style.zIndex="999997",c.classList.remove("pinned"),c.title="Pin note (always on top)")}),d==null||d.addEventListener("click",l=>{l.stopPropagation(),p.classList.toggle("active")}),document.addEventListener("click",l=>{!p.contains(l.target)&&!d.contains(l.target)&&p.classList.remove("active")});function G(l){l>=8&&l<=24&&(U=l,o.style.fontSize=U+"px",m.value=U.toString(),S.fontSize=U)}u==null||u.addEventListener("click",()=>{G(U+1)}),f==null||f.addEventListener("click",()=>{G(U-1)}),m==null||m.addEventListener("input",()=>{const l=parseInt(m.value);isNaN(l)||G(l)}),m==null||m.addEventListener("blur",()=>{const l=parseInt(m.value);isNaN(l)||l<8?G(8):l>24&&G(24)});let le=!1;x==null||x.addEventListener("click",l=>{l.stopPropagation(),le=!le,le?(E.classList.add("collapsed"),x.innerHTML="&gt;",x.title="Show toolbar"):(E.classList.remove("collapsed"),x.innerHTML="&lt;",x.title="Hide toolbar")}),s==null||s.addEventListener("click",async()=>{confirm("Delete this note?")&&(P.delete(t),k&&k.id===t&&(k=null),V||await ve(t),e.classList.remove("open"),setTimeout(()=>e.remove(),200))});let Ne,Me=o.value;function ce(){const l=o.value.trim();S.content=l;const w=e.getBoundingClientRect();S.position={x:w.left,y:w.top},S.size={width:e.offsetWidth,height:e.offsetHeight},V&&l?(xe(S),V=!1,e.dataset.noteId=S.id):!V&&l!==Me&&Ye(S),Me=l}o.addEventListener("input",()=>{clearTimeout(Ne),Ne=setTimeout(ce,2e3)});const Ae=()=>{o.value.trim()&&ce()};e.addEventListener("blur",Ae),window.addEventListener("beforeunload",Ae)}let v=null,R=null,oe=null;function He(){if(!v){v=document.createElement("div"),v.className="notes-panel",v.innerHTML=`
      <div class="notes-header">
        📋 Recent Notes
        <button class="panel-close-btn" title="Close panel">×</button>
      </div>
      <div class="notes-list" id="notes-list"></div>
    `,document.body.appendChild(v),D();const e=v.querySelector(".panel-close-btn");e==null||e.addEventListener("click",()=>{v&&v.classList.remove("open"),R&&(clearTimeout(R),R=null)});let t=Date.now();const n=()=>{t=Date.now()};v.addEventListener("mouseenter",n),v.addEventListener("mousemove",n),v.addEventListener("click",n),oe=()=>{v&&v.classList.contains("open")&&(Date.now()-t>=6e3?(v.classList.remove("open"),R&&(clearTimeout(R),R=null)):R=setTimeout(oe,1e3))}}v.classList.toggle("open"),v.classList.contains("open")&&(D(),R&&clearTimeout(R),R=setTimeout(oe,1e3))}function We(){var n,o;const e=document.createElement("div");e.className="sticky-modal",e.innerHTML=`
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
  `,document.body.appendChild(e),setTimeout(()=>e.classList.add("open"),10);function t(){e.classList.remove("open"),setTimeout(()=>e.remove(),300)}(n=e.querySelector(".modal-close"))==null||n.addEventListener("click",t),(o=e.querySelector(".close-settings"))==null||o.addEventListener("click",t)}function fe(){g&&(g.style.display="none"),document.querySelectorAll(".sticky-note").forEach(t=>{t.style.display="none"})}function he(){g&&(g.style.display="block"),document.querySelectorAll(".sticky-note").forEach(t=>{t.style.display="block"})}function ye(){return!g||g.style.display==="none"?!1:window.getComputedStyle(g).display!=="none"}async function xe(e){try{const n=(await h.storage.local.get("stickyNotes")).stickyNotes||[],o=n.findIndex(a=>a.id===e.id),i={id:e.id,title:e.title,content:e.content,fontSize:e.fontSize,transparency:e.transparency,color:e.color,colorIndex:e.colorIndex,position:e.position,size:e.size,timestamp:new Date().toISOString(),url:window.location.href};o!==-1?n[o]=i:n.unshift(i),n.length>50&&n.splice(50),await h.storage.local.set({stickyNotes:n}),console.log("Complete note saved successfully"),document.querySelector(".notes-panel.open")&&D()}catch(t){console.error("Error saving complete note:",t)}}async function Ye(e){try{const n=(await h.storage.local.get("stickyNotes")).stickyNotes||[],o=n.findIndex(r=>r.id===e.id);if(o!==-1)n[o]={...n[o],title:e.title,content:e.content,fontSize:e.fontSize,transparency:e.transparency,color:e.color,colorIndex:e.colorIndex,position:e.position,size:e.size,timestamp:new Date().toISOString()};else{await xe(e);return}await h.storage.local.set({stickyNotes:n}),console.log("Complete note updated successfully"),document.querySelector(".notes-panel.open")&&D()}catch(t){console.error("Error updating complete note:",t)}}async function D(){const e=document.getElementById("notes-list");if(e)try{const o=((await h.storage.local.get("stickyNotes")).stickyNotes||[]).filter((i,r,a)=>a.findIndex(c=>c.id===i.id)===r);if(o.length===0){e.innerHTML='<div style="padding: 20px; text-align: center; color: #000000; font-weight: 500;">📝 No notes yet<br><small style="color: #9929EA;">Create your first note!</small></div>';return}e.innerHTML=o.slice(0,10).map(i=>`
      <div class="note-item" data-note-id="${i.id}">
        <div class="note-title-display">${i.title||(i.content.length>20?i.content.substring(0,20)+"...":i.content)||"Untitled"}</div>
        <div class="note-preview">${i.content.substring(0,80)}${i.content.length>80?"...":""}</div>
        <div class="note-date">${new Date(i.timestamp).toLocaleDateString()}</div>
      </div>
    `).join(""),e.querySelectorAll(".note-item").forEach(i=>{i.addEventListener("click",()=>{const r=i.dataset.noteId,a=o.find(c=>c.id===r);a&&Ue(a)})})}catch(t){console.error("Error loading notes:",t)}}function Ue(e){var y;if(P.has(e.id)){const b=P.get(e.id);if(b&&document.body.contains(b)){Q(b);return}else P.delete(e.id)}const t=me(e.content,e);t.dataset.noteId=e.id;const n=t.querySelector(".note-toolbar"),o=document.createElement("button");o.className="action-btn read-only-btn",o.title="Lock/Unlock Note",o.innerHTML="🔒";const i=t.querySelector(".delete-btn");i&&n&&n.insertBefore(o,i);const r=t.querySelector(".sticky-note-textarea");let a=!1;if(o.addEventListener("click",()=>{a=!a,r.readOnly=a,a?(o.classList.add("active"),o.innerHTML="🔓",o.title="Enable Editing",r.style.opacity="0.7",r.style.cursor="default"):(o.classList.remove("active"),o.innerHTML="🔒",o.title="Lock Note",r.style.opacity="1",r.style.cursor="text")}),i){const b=i.cloneNode(!0);(y=i.parentNode)==null||y.replaceChild(b,i),b.addEventListener("click",async()=>{if(a){alert("Cannot delete note in read-only mode. Click the lock icon to enable editing.");return}confirm("Delete this note?")&&(await ve(e.id),P.delete(e.id),k&&k.id===e.id&&(k=null),t.classList.remove("open"),setTimeout(()=>t.remove(),200))})}let c;r.addEventListener("input",()=>{a||(clearTimeout(c),c=setTimeout(async()=>{const b=r.value.trim();b&&e.id&&(await Xe(e.id,b),D())},1e3))})}async function Xe(e,t){try{const o=(await h.storage.local.get("stickyNotes")).stickyNotes||[],i=o.findIndex(r=>r.id===e);i!==-1&&(o[i].content=t,o[i].timestamp=new Date().toISOString(),await h.storage.local.set({stickyNotes:o}))}catch(n){console.error("Error updating note:",n)}}async function ve(e){try{const o=((await h.storage.local.get("stickyNotes")).stickyNotes||[]).filter(r=>r.id!==e);await h.storage.local.set({stickyNotes:o}),document.querySelector(".notes-panel.open")&&D()}catch(t){console.error("Error deleting note:",t)}}function Oe(){let e;document.addEventListener("keydown",t=>{if(!e&&(t.altKey&&t.shiftKey&&!t.ctrlKey&&!t.metaKey&&(t.code==="KeyN"?(t.preventDefault(),t.stopPropagation(),console.log("StickyNoteAI: Alt+Shift+N pressed - Creating/focusing note"),e=setTimeout(()=>{J(),e=null},100)):t.code==="KeyW"&&(t.preventDefault(),t.stopPropagation(),console.log("StickyNoteAI: Alt+Shift+W pressed - Toggling widget visibility"),e=setTimeout(()=>{ye()?fe():he(),e=null},100))),t.code==="Escape"&&!t.altKey&&!t.shiftKey&&!t.ctrlKey&&!t.metaKey)){const n=document.querySelector(".font-size-popup.active");if(n){t.preventDefault(),n.classList.remove("active");return}const o=document.querySelector(".sticky-modal.open");if(o){t.preventDefault(),o.classList.remove("open"),setTimeout(()=>o.remove(),300);return}const i=document.querySelector(".notes-panel.open");if(i){t.preventDefault(),i.classList.remove("open");return}if(q){t.preventDefault(),H();return}const r=document.querySelectorAll(".sticky-note.open");if(r.length>0){t.preventDefault(),r.forEach(a=>{const c=a;c.classList.remove("open"),setTimeout(()=>c.remove(),300)}),k=null;return}}}),console.log("StickyNoteAI: Enhanced keyboard shortcuts initialized (Alt+Shift+N, Alt+Shift+W, Esc)")}function we(e){if(console.log("StickyNoteAI: Applying theme:",e),!e||!e.colors){console.warn("StickyNoteAI: Invalid theme data");return}const t=document.documentElement;t.style.setProperty("--theme-primary",e.colors.primary),t.style.setProperty("--theme-secondary",e.colors.secondary),t.style.setProperty("--theme-background",e.colors.background),t.style.setProperty("--theme-text",e.colors.text),e.colors.noteColors&&Array.isArray(e.colors.noteColors)&&e.colors.noteColors.forEach((i,r)=>{t.style.setProperty(`--theme-note-color-${r}`,i)}),document.querySelectorAll('[id^="sticky-note-"]').forEach(i=>{const r=i;r.dataset.noteId&&De(r,e)});const o=document.getElementById("sticky-note-widget");o&&je(o,e)}function De(e,t){const n=t.colors.noteColors||["#fef3c7","#dbeafe","#fce7f3","#ecfdf5"],o=parseInt(e.dataset.colorIndex||"0",10),i=n[o%n.length],r=parseFloat(e.dataset.transparency||"0.95");e.style.background=ue(i,r),e.querySelectorAll(".note-text, .note-title, .sticky-note-textarea").forEach(c=>{const y=c;y.style.color=t.colors.text})}function je(e,t){const n=e.querySelector(".widget-content");n&&(n.style.background=`linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`),e.querySelectorAll(".widget-title, .widget-text").forEach(i=>{const r=i;r.style.color="#ffffff"})}function Ke(){h.runtime.onMessage.addListener((e,t,n)=>{if(console.log("StickyNoteAI: Received message:",e),e.action==="toggle-widget"){console.log("StickyNoteAI: Toggle widget command received"),ye()?(console.log("StickyNoteAI: Hiding widget"),fe()):(console.log("StickyNoteAI: Showing widget"),he()),n({success:!0});return}if(e.action==="new-note"){J(),n({success:!0});return}if(e.action==="create-note-with-selection"){J(e.selectedText||""),n({success:!0});return}if(e.action==="toggleStealth"){const o=document.getElementById("sticky-note-widget");o&&(e.enabled?o.style.opacity="0.3":o.style.opacity="1"),n({success:!0});return}if(e.action==="themeChanged"){console.log("StickyNoteAI: Theme changed to:",e.theme),we(e.theme),n({success:!0});return}n({success:!1,error:"Unknown action"})})}async function Ve(){if(!g)return;const e=g.getBoundingClientRect(),t={x:e.left,y:e.top};try{await h.storage.local.set({widgetPosition:t})}catch(n){console.error("Error saving position:",n)}}async function Ge(){if(g){g.style.left="",g.style.top="",g.style.transform="";try{await h.storage.local.remove("widgetPosition")}catch(e){console.error("Error clearing position:",e)}}}function Z(e,...t){}const _e={debug:(...e)=>Z(console.debug,...e),log:(...e)=>Z(console.log,...e),warn:(...e)=>Z(console.warn,...e),error:(...e)=>Z(console.error,...e)},te=class te extends Event{constructor(t,n){super(te.EVENT_NAME,{}),this.newUrl=t,this.oldUrl=n}};X(te,"EVENT_NAME",ie("wxt:locationchange"));let ne=te;function ie(e){var t;return`${(t=h==null?void 0:h.runtime)==null?void 0:t.id}:content:${e}`}function Je(e){let t,n;return{run(){t==null&&(n=new URL(location.href),t=e.setInterval(()=>{let o=new URL(location.href);o.href!==n.href&&(window.dispatchEvent(new ne(o,n)),n=o)},1e3))}}}const K=class K{constructor(t,n){X(this,"isTopFrame",window.self===window.top);X(this,"abortController");X(this,"locationWatcher",Je(this));X(this,"receivedMessageIds",new Set);this.contentScriptName=t,this.options=n,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(t){return this.abortController.abort(t)}get isInvalid(){return h.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(t){return this.signal.addEventListener("abort",t),()=>this.signal.removeEventListener("abort",t)}block(){return new Promise(()=>{})}setInterval(t,n){const o=setInterval(()=>{this.isValid&&t()},n);return this.onInvalidated(()=>clearInterval(o)),o}setTimeout(t,n){const o=setTimeout(()=>{this.isValid&&t()},n);return this.onInvalidated(()=>clearTimeout(o)),o}requestAnimationFrame(t){const n=requestAnimationFrame((...o)=>{this.isValid&&t(...o)});return this.onInvalidated(()=>cancelAnimationFrame(n)),n}requestIdleCallback(t,n){const o=requestIdleCallback((...i)=>{this.signal.aborted||t(...i)},n);return this.onInvalidated(()=>cancelIdleCallback(o)),o}addEventListener(t,n,o,i){var r;n==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(r=t.addEventListener)==null||r.call(t,n.startsWith("wxt:")?ie(n):n,o,{...i,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),_e.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:K.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(t){var r,a,c;const n=((r=t.data)==null?void 0:r.type)===K.SCRIPT_STARTED_MESSAGE_TYPE,o=((a=t.data)==null?void 0:a.contentScriptName)===this.contentScriptName,i=!this.receivedMessageIds.has((c=t.data)==null?void 0:c.messageId);return n&&o&&i}listenForNewerScripts(t){let n=!0;const o=i=>{if(this.verifyScriptStartedEvent(i)){this.receivedMessageIds.add(i.data.messageId);const r=n;if(n=!1,r&&(t!=null&&t.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",o),this.onInvalidated(()=>removeEventListener("message",o))}};X(K,"SCRIPT_STARTED_MESSAGE_TYPE",ie("wxt:content-script-started"));let re=K;function at(){}function ee(e,...t){}const Qe={debug:(...e)=>ee(console.debug,...e),log:(...e)=>ee(console.log,...e),warn:(...e)=>ee(console.warn,...e),error:(...e)=>ee(console.error,...e)};return(async()=>{try{const{main:e,...t}=$e,n=new re("content",t);return await e(n)}catch(e){throw Qe.error('The content script "content" crashed on startup!',e),e}})()}();
content;
