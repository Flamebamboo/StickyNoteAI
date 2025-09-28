var content=function(){"use strict";var lt=Object.defineProperty;var ct=(j,R,x)=>R in j?lt(j,R,{enumerable:!0,configurable:!0,writable:!0,value:x}):j[R]=x;var O=(j,R,x)=>ct(j,typeof R!="symbol"?R+"":R,x);var Ce,ze;function j(e){return e}const x=(ze=(Ce=globalThis.browser)==null?void 0:Ce.runtime)!=null&&ze.id?globalThis.browser:globalThis.chrome,Re={matches:["<all_urls>"],main(){console.log("🎯 StickyNoteAI v2.2 CSS FIXED + MENU POSITIONING - Loading..."),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{fe()}):fe()}};let y=null,C=!1,$=!1,ee={x:0,y:0},D={x:0,y:0},L=null,ye,X=null,B={id:"default",data:null};function fe(){console.log("StickyNoteAI: DOM ready, creating widget..."),De(),Qe(),$e(),Ve(),_e()}async function $e(){try{const t=(await x.storage.local.get("sticky-settings"))["sticky-settings"];if(t&&t.activeTheme&&t.activeTheme!=="default"){const o=[{id:"autumn",name:"Autumn",description:"Professional autumn theme with elegant leaf aesthetics",colors:{primary:"linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",secondary:"linear-gradient(135deg, #CD853F 0%, #DAA520 100%)",accent:"#228B22",background:"linear-gradient(145deg, #FFF8DC, #F5DEB3)",noteColors:["rgba(255, 160, 122, 0.95)","rgba(255, 218, 185, 0.95)","rgba(240, 230, 140, 0.95)","rgba(222, 184, 135, 0.95)","rgba(255, 228, 181, 0.95)","rgba(255, 239, 213, 0.95)"]}}].find(i=>i.id===t.activeTheme);o&&(B={id:t.activeTheme,data:o},console.log("StickyNoteAI: Loaded theme:",t.activeTheme),setTimeout(()=>se(t.activeTheme),100))}}catch(e){console.error("StickyNoteAI: Failed to load theme:",e)}}function De(){const e=document.getElementById("sticky-note-widget");e&&e.remove(),y=document.createElement("div"),y.id="sticky-note-widget";let t,n;try{t=x.runtime.getURL("smilyface.gif"),ye=t,n=x.runtime.getURL("add2.png")}catch(r){console.warn("browser.runtime.getURL failed, using fallback approach:",r);const s=x.runtime.id||chrome.runtime.id;t=`chrome-extension://${s}/smilyface.gif`,ye=t,n=`chrome-extension://${s}/add2.png`}console.log("StickyNoteAI: Image URLs:",{smilyFaceUrl:t,add2Url:n}),console.log("StickyNoteAI: Extension ID:",x.runtime.id),console.log("StickyNoteAI: Chrome runtime ID:",chrome.runtime.id),y.innerHTML=`
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
      transition: 
        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.3s ease-out,
        background 0.2s ease-out,
        box-shadow 0.2s ease-out,
        border-radius 0.2s ease-out;
      border: 2px solid rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(2px);
      display: flex;
      flex-direction: column;
      resize: both;
      overflow: hidden;
      min-width: 200px;
      min-height: 120px;
      max-width: 600px;
      max-height: 500px;
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
      width: 24px;
      height: 24px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      font-size: 10px;
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

    .toolbar-toggle-btn {
      position: relative;
      font-weight: bold;
    }

    .note-toolbar.collapsed .transparency-control,
    .note-toolbar.collapsed .font-size-control,
    .note-toolbar.collapsed .lock-btn,
    .note-toolbar.collapsed .delete-btn {
      display: none;
    }

    .note-toolbar.collapsed .toolbar-toggle-btn::after {
      content: '›';
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
      justify-content: flex-start;
      gap: 6px;
      padding: 0;
    }

    /* Transparency Control */
    .transparency-control {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tool-icon {
      width: 24px;
      height: 24px;
      font-size: 10px;
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



    /* Autumn Theme - Falling Leaves Animation */
    @keyframes fall {
      0% {
        transform: translateY(-100vh) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }

    @keyframes sway {
      0%, 100% {
        transform: translateX(0px);
      }
      50% {
        transform: translateX(30px);
      }
    }

    .falling-leaf {
      position: fixed;
      width: 20px;
      height: 20px;
      background: linear-gradient(45deg, #FF6347, #FFD700, #8B4513);
      border-radius: 0 100% 0 100%;
      animation: fall 8s linear infinite, sway 3s ease-in-out infinite;
      z-index: 1000;
      pointer-events: none;
    }

    .falling-leaf:nth-child(2n) {
      animation-duration: 10s, 4s;
      background: linear-gradient(45deg, #CD853F, #DEB887, #D2691E);
    }

    .falling-leaf:nth-child(3n) {
      animation-duration: 12s, 5s;
      background: linear-gradient(45deg, #DAA520, #F0E68C, #B8860B);
      border-radius: 100% 0 100% 0;
    }

    .falling-leaf:nth-child(4n) {
      animation-duration: 9s, 3.5s;
      background: linear-gradient(45deg, #FF8C00, #FFA500, #FF4500);
    }

    .falling-leaf:nth-child(5n) {
      animation-duration: 11s, 4.5s;
      background: linear-gradient(45deg, #A0522D, #8B4513, #654321);
      border-radius: 50% 0 50% 50%;
    }

    /* Autumn leaf container for main extension area */
    .autumn-leaves-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999;
      overflow: hidden;
    }

    /* ...existing code... */
  `,document.head.appendChild(o),document.body.appendChild(y);const i=document.getElementById("smiley-image"),a=document.getElementById("add-image");i&&(i.addEventListener("load",()=>{console.log("✅ Smiley face image loaded successfully")}),i.addEventListener("error",()=>{console.error("❌ Failed to load smiley face image:",t),i.style.display="none"})),a&&(a.addEventListener("load",()=>{console.log("✅ Add2 image loaded successfully")}),a.addEventListener("error",()=>{console.error("❌ Failed to load add2 image:",n),a.style.display="none"})),He(),setTimeout(()=>{se(B.id)},100)}function He(){const e=document.getElementById("main-button"),t=document.getElementById("widget-menu");if(!e||!t)return;let n=0,o={x:0,y:0},i=!1;function a(c,d){if(!y)return{x:c,y:d};const u={width:50,height:50},b=window.innerWidth,h=window.innerHeight,p=10;let m=Math.max(p,c);m=Math.min(b-u.width-p,m);let k=Math.max(p,d);return k=Math.min(h-u.height-p,k),{x:m,y:k}}function r(c,d){if(!y)return{x:c,y:d};const u={width:50,height:50},b=window.innerWidth,h=window.innerHeight,p=20,m=c,k=b-(c+u.width),N=d,W=h-(d+u.height),A=Math.min(m,k,N,W);let P=c,E=d;return(c<0||c+u.width>b||d<0||d+u.height>h)&&(A===m?P=p:A===k?P=b-u.width-p:A===N?E=p:A===W&&(E=h-u.height-p)),{x:P,y:E}}e.addEventListener("mousedown",c=>{c.preventDefault(),n=Date.now(),o={x:c.clientX,y:c.clientY},i=!1;const d=y.getBoundingClientRect();ee.x=c.clientX-d.left,ee.y=c.clientY-d.top,e.classList.add("dragging"),document.addEventListener("mousemove",s),document.addEventListener("mouseup",g)}),e.addEventListener("click",c=>{!C&&!i&&(c.preventDefault(),c.stopPropagation(),$?H():he())}),e.addEventListener("mouseenter",()=>{C||(L&&(clearTimeout(L),L=null),$||he())}),t.addEventListener("mouseenter",()=>{L&&(clearTimeout(L),L=null)}),t.addEventListener("mouseleave",c=>{if(!C){const d=t.getBoundingClientRect(),u=c.clientX,b=c.clientY,h=24;(u<d.left-h||u>d.right+h||b<d.top-h||b>d.bottom+h)&&(L=setTimeout(()=>{H(),L=null},300))}}),e.addEventListener("mouseleave",c=>{if(!C){const d=t.getBoundingClientRect(),u=c.clientX,b=c.clientY,h=24;u>=d.left-h&&u<=d.right+h&&b>=d.top-h&&b<=d.bottom+h||(L=setTimeout(()=>{H(),L=null},200))}});function s(c){const d=Date.now()-n,u=Math.sqrt(Math.pow(c.clientX-o.x,2)+Math.pow(c.clientY-o.y,2));if(!C&&(u>3||d>100)&&(C=!0,i=!0,H(),document.body.style.cursor="grabbing"),C){const b=c.clientX-ee.x,h=c.clientY-ee.y,p=a(b,h);y.style.transform=`translate(${p.x}px, ${p.y}px)`,y.style.left="0",y.style.top="0",D={x:p.x,y:p.y}}}function g(){if(document.removeEventListener("mousemove",s),document.removeEventListener("mouseup",g),e&&e.classList.remove("dragging"),document.body.style.cursor="",C){const c=r(D.x,D.y);c.x!==D.x||c.y!==D.y?(y.style.transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",y.style.left=c.x+"px",y.style.top=c.y+"px",y.style.transform="",setTimeout(()=>{y&&(y.style.transition="")},300),D=c):(y.style.left=D.x+"px",y.style.top=D.y+"px",y.style.transform=""),Je()}C=!1,i=!1}let f=0;t==null||t.addEventListener("click",c=>{const u=c.target.dataset.action,b=Date.now();b-f<500||(f=b,u&&(console.log("Menu button clicked:",u),Ye(u)))})}function he(){if(C)return;const e=document.getElementById("widget-menu"),t=document.getElementById("sticky-note-widget");if(e&&t){const n=t.getBoundingClientRect(),o=window.innerHeight;n.top>o/2?e.classList.add("top-positioned"):e.classList.remove("top-positioned"),e.classList.add("open"),$=!0,We()}}function We(){X&&document.removeEventListener("mousemove",X),X=e=>{if(!$||C)return;const t=document.getElementById("sticky-note-widget"),n=document.getElementById("widget-menu");if(!t||!n)return;const o=t.getBoundingClientRect(),i=n.getBoundingClientRect(),a=t.querySelector(".widget-main-button"),r=a?a.getBoundingClientRect():o;Math.random()<.1&&console.log("🖱️ Mouse tracking:",{mouse:{x:e.clientX,y:e.clientY},isMenuOpen:$,isDragging:C});const s=e.clientX,g=e.clientY,f={left:Math.min(r.left,i.left),right:Math.max(r.right,i.right),top:Math.min(r.top,i.top),bottom:Math.max(r.bottom,i.bottom)};console.log("🔍 Rectangle Debug:",{widget:{left:o.left,right:o.right,width:o.width,height:o.height},button:{left:r.left,right:r.right,width:r.width,height:r.height},menu:{left:i.left,right:i.right,width:i.width,height:i.height},combined:f,mouse:{x:s,y:g}});const c=60,d=f.left-c,u=f.right+c,b=f.top-c,h=f.bottom+c;console.log(`📊 Right side analysis:
    Mouse X: ${s}
    Widget (full): ${o.left} to ${o.right} (width: ${o.width})
    Button (actual): ${r.left} to ${r.right} (width: ${r.width})
    Menu: ${i.left} to ${i.right} (width: ${i.width})
    Combined right: ${f.right}
    Right boundary: ${u}
    Distance from boundary: ${s-u}
    Should close when mouse > ${u}`);const p=s<d,m=s>u,k=g<b,N=g>h;(p||m||k||N)&&console.log("⚠️ Boundary checks - SHOULD CLOSE:",{mouse:{x:s,y:g},boundaries:{left:d,right:u,top:b,bottom:h},checks:{leftSide:p,rightSide:m,topSide:k,bottomSide:N},shouldClose:!0});const W=s-r.right,A=s-i.right,P=Math.max(r.right,i.right),E=s>P+c;E&&console.log("🟢 Simple right check - TRIGGERED:",{mouseX:s,buttonRight:r.right,menuRight:i.right,maxRight:P,tolerance:c,threshold:P+c,simpleRightCheck:!0,distanceFromButtonRight:W,distanceFromMenuRight:A}),(p||m||k||N||E)&&(console.log("🔴 CLOSING MENU - Reason:",{leftSide:p,rightSide:m,topSide:k,bottomSide:N,simpleRightCheck:E}),H())},document.addEventListener("mousemove",X)}document.addEventListener("click",e=>{if(!$)return;const t=document.getElementById("sticky-note-widget"),n=document.getElementById("widget-menu");if(!t||!n)return;const o=e.target,i=t.contains(o),a=n.contains(o);!i&&!a&&H()});function H(){const e=document.getElementById("widget-menu");e&&(e.classList.remove("open"),$=!1),L&&(clearTimeout(L),L=null),X&&(document.removeEventListener("mousemove",X),X=null)}function Ye(e){console.log("Menu action triggered:",e),H(),setTimeout(()=>{switch(e){case"add":oe();break;case"notes":Ue();break;case"settings":Oe();break}},100)}function xe(e){if(console.log("Creating note leaves background, current theme:",B.id),B.id!=="autumn")return;const t=document.createElement("div");t.className="note-leaves-background",t.style.cssText=`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  `,document.getElementById("note-leaves-animation")||document.head.insertAdjacentHTML("beforeend",`
      <style id="note-leaves-animation">
        .note-falling-leaf {
          position: absolute;
          width: 4px;
          height: 4px;
          opacity: 0.12;
          border-radius: 0 100% 0 100%;
          pointer-events: none;
          animation: note-leaf-fall linear infinite;
        }
        
        .note-falling-leaf:nth-child(2n) {
          border-radius: 100% 0 100% 0;
          animation-duration: 8s;
          opacity: 0.08;
        }
        
        .note-falling-leaf:nth-child(3n) {
          border-radius: 50% 0 50% 50%;
          animation-duration: 6s;
          opacity: 0.1;
        }
        
        .note-falling-leaf:nth-child(4n) {
          border-radius: 0 50% 50% 50%;
          animation-duration: 10s;
          opacity: 0.06;
        }
        
        @keyframes note-leaf-fall {
          0% {
            transform: translateY(-10px) rotate(0deg) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 0.12;
          }
          90% {
            opacity: 0.02;
          }
          100% {
            transform: translateY(200px) rotate(360deg) translateX(15px);
            opacity: 0;
          }
        }
      </style>
    `);function n(){if(!document.body.contains(e))return;const i=document.createElement("div");i.className="note-falling-leaf";const a=["#CD853F","#DAA520","#D2691E","#B8860B","#A0522D"];i.style.background=a[Math.floor(Math.random()*a.length)],i.style.left=Math.random()*100+"%",i.style.animationDelay=Math.random()*5+"s",i.style.animationDuration=6+Math.random()*4+"s",t.appendChild(i),setTimeout(()=>{i.parentNode&&i.remove()},12e3)}for(let i=0;i<6;i++)setTimeout(()=>n(),i*300);const o=setInterval(()=>{document.body.contains(e)?n():clearInterval(o)},2e3);e.appendChild(t),e.style.position="relative",e.style.overflow="hidden"}function te(e,t="widget"){if(console.log("Creating area leaves background, current theme:",B.id,"for:",t),B.id!=="autumn")return;const n=e.querySelector(".area-leaves-background");n&&n.remove();const o=document.createElement("div");o.className="area-leaves-background",o.style.cssText=`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
  `,document.getElementById("area-leaves-animation")||document.head.insertAdjacentHTML("beforeend",`
      <style id="area-leaves-animation">
        .area-falling-leaf {
          position: absolute;
          width: 3px;
          height: 3px;
          opacity: 0.15;
          border-radius: 0 100% 0 100%;
          pointer-events: none;
          animation: area-leaf-fall linear infinite;
        }
        
        .area-falling-leaf:nth-child(2n) {
          border-radius: 100% 0 100% 0;
          animation-duration: 10s;
          opacity: 0.1;
        }
        
        .area-falling-leaf:nth-child(3n) {
          border-radius: 50% 0 50% 50%;
          animation-duration: 8s;
          opacity: 0.12;
        }
        
        .area-falling-leaf:nth-child(4n) {
          border-radius: 0 50% 50% 50%;
          animation-duration: 12s;
          opacity: 0.08;
        }
        
        @keyframes area-leaf-fall {
          0% {
            transform: translateY(-20px) rotate(0deg) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 0.15;
          }
          90% {
            opacity: 0.03;
          }
          100% {
            transform: translateY(150px) rotate(360deg) translateX(10px);
            opacity: 0;
          }
        }
      </style>
    `);function i(){if(!document.body.contains(e))return;const s=document.createElement("div");s.className="area-falling-leaf";const g=["#CD853F","#DAA520","#D2691E","#B8860B","#A0522D"];s.style.background=g[Math.floor(Math.random()*g.length)],s.style.left=Math.random()*100+"%",s.style.animationDelay=Math.random()*3+"s",s.style.animationDuration=8+Math.random()*4+"s",o.appendChild(s),setTimeout(()=>{s.parentNode&&s.remove()},15e3)}const a=t==="widget"?3:5;for(let s=0;s<a;s++)setTimeout(()=>i(),s*500);const r=setInterval(()=>{document.body.contains(e)?i():clearInterval(r)},3e3);e.appendChild(o),e.style.position="relative",e.style.overflow="hidden"}function se(e){const t=document.getElementById("sticky-note-widget"),n=document.querySelector(".notes-panel");if(e==="autumn"){if(t){t.style.removeProperty("background"),t.style.removeProperty("border"),t.style.removeProperty("color");const o=t.querySelector(".widget-main-button");if(o){const r=o;r.style.removeProperty("background"),r.style.removeProperty("border"),r.style.removeProperty("color"),r.style.removeProperty("box-shadow")}const i=t.querySelector(".widget-menu");if(i){const r=i;r.style.background="linear-gradient(145deg, rgba(255, 248, 220, 0.95), rgba(245, 222, 179, 0.9))",r.style.border="2px solid rgba(139, 69, 19, 0.4)",r.style.color="#8B4513",r.style.borderRadius="12px",r.style.padding="8px",r.style.boxShadow="0 4px 12px rgba(139, 69, 19, 0.15)",te(r,"widget")}t.querySelectorAll(".menu-button").forEach(r=>{const s=r;s.style.color="#8B4513",s.style.background="rgba(222, 184, 135, 0.6)",s.style.border="1px solid rgba(139, 69, 19, 0.4)",s.style.borderRadius="6px",s.style.padding="8px 12px",s.style.margin="2px"})}if(n){n.style.background="linear-gradient(145deg, rgba(255, 248, 220, 0.95), rgba(245, 222, 179, 0.9))",n.style.border="2px solid rgba(139, 69, 19, 0.4)",n.style.color="#8B4513",te(n,"panel");const o=n.querySelector("h3");o&&(o.style.color="#8B4513"),n.querySelectorAll(".recent-note-item").forEach(a=>{const r=a;r.style.background="rgba(255, 228, 196, 0.8)",r.style.border="1px solid rgba(139, 69, 19, 0.3)",r.style.color="#8B4513",r.style.position="relative",r.style.zIndex="2"})}}else{if(t){t.style.removeProperty("background"),t.style.removeProperty("border"),t.style.removeProperty("color");const o=t.querySelector(".widget-menu");if(o){const r=o;r.style.removeProperty("background"),r.style.removeProperty("border"),r.style.removeProperty("color"),r.style.removeProperty("border-radius"),r.style.removeProperty("padding"),r.style.removeProperty("box-shadow");const s=r.querySelector(".area-leaves-background");s&&s.remove()}t.querySelectorAll(".menu-button").forEach(r=>{const s=r;s.style.removeProperty("color"),s.style.removeProperty("background"),s.style.removeProperty("border"),s.style.removeProperty("border-radius"),s.style.removeProperty("padding"),s.style.removeProperty("margin")});const a=t.querySelector(".widget-main-button");if(a){const r=a;r.style.removeProperty("background"),r.style.removeProperty("border"),r.style.removeProperty("color"),r.style.removeProperty("box-shadow"),r.style.removeProperty("position")}}if(n){n.style.removeProperty("background"),n.style.removeProperty("border"),n.style.removeProperty("color");const o=n.querySelector(".area-leaves-background");o&&o.remove();const i=n.querySelector("h3");i&&i.style.removeProperty("color"),n.querySelectorAll(".recent-note-item").forEach(r=>{const s=r;s.style.removeProperty("background"),s.style.removeProperty("border"),s.style.removeProperty("color"),s.style.removeProperty("position"),s.style.removeProperty("z-index")})}}}function oe(e=""){if(z&&z.element&&document.body.contains(z.element)){ae(z.element);return}const t=ve(e);if(!t){console.log("StickyNoteAI: Cannot create note - maximum limit reached");return}setTimeout(()=>{const n=t.querySelector(".sticky-note-textarea");n&&(n.focus(),n.setSelectionRange(n.value.length,n.value.length))},100)}let z=null,K=0;const Xe=10;let F=new Map;function ve(e="",t=null){if(t&&F.has(t.id)){const d=F.get(t.id);if(d&&document.body.contains(d))return ae(d),d;F.delete(t.id)}if(!t&&K>=Xe)return console.log("StickyNoteAI: Maximum new notes limit reached (10)"),null;const n=(t==null?void 0:t.id)||Date.now().toString(),o=document.createElement("div");o.className="sticky-note",o.id=`sticky-note-${n}`;let i,a,r,s,g,f;t?(i=t.color||"rgba(255, 251, 147, 0.95)",a=t.title||(e.length>15?e.substring(0,15)+"...":e)||"Edit Note",r=t.fontSize||13,s=t.transparency||.95,g=t.position,f=t.size):(B.id==="autumn"?i="rgba(255, 228, 196, 0.95)":i="rgba(255, 251, 147, 0.95)",a=e?e.length>15?e.substring(0,15)+"...":e:"New Note",r=13,s=.95,g=null,f=null),o.innerHTML=`
    <div class="sticky-note-header">
      <span class="note-title" contenteditable="true" title="Click to edit title (max 20 chars)" maxlength="20">${a}</span>
      <div class="note-controls">
        <button class="note-control-btn pin-btn" title="Pin note (always on top)">📌</button>
        <button class="note-control-btn minimize-btn" title="Minimize">−</button>
        <button class="note-control-btn close-btn" title="Close">×</button>
      </div>
    </div>
    <textarea class="sticky-note-textarea" placeholder="Write your note here..." style="font-size: ${r}px; outline: none; border: none;">${e}</textarea>
    <div class="note-controls-bottom">
      <div class="note-toolbar">
        <button class="action-btn toolbar-toggle-btn" title="Hide toolbar">‹</button>
        <div class="transparency-control">
          <input type="range" class="transparency-slider" min="0.3" max="1" step="0.1" value="${s}">
        </div>
        <div class="font-size-control">
          <button class="tool-icon font-size-toggle" title="Font size">Aa</button>
          <div class="font-size-popup">
            <button class="font-size-btn decrease-font">−</button>
            <input type="number" class="font-size-input" min="8" max="24" value="${r}">
            <button class="font-size-btn increase-font">+</button>
          </div>
        </div>
        ${t?'<button class="action-btn lock-btn" title="Lock/Unlock Note">⚪</button>':""}
        <button class="action-btn delete-btn" title="Delete Note">×</button>
      </div>
    </div>
    <div class="note-resize-handle"></div>
  `;const c=t?i.replace(/rgba\(([^)]+),\s*[0-9.]+\)/,`rgba($1, ${s})`):i;if(o.style.background=c,!t){const d=(Math.random()-.5)*4;o.style.setProperty("--note-rotation",`${d}deg`)}if(document.body.appendChild(o),B.id==="autumn"){o.style.borderRadius="8px",o.style.border="2px solid rgba(139, 69, 19, 0.3)",o.style.color="#8B4513",o.style.boxShadow="0 4px 12px rgba(139, 69, 19, 0.15), 0 1px 4px rgba(139, 69, 19, 0.1)",o.style.background="rgba(255, 228, 196, 0.95)",xe(o);const d=o.querySelector(".note-toolbar");d&&(d.style.background="rgba(255, 228, 196, 0.95)",d.style.position="relative",d.style.zIndex="2",d.querySelectorAll("button").forEach(p=>{const m=p;m.style.color="#8B4513",m.style.background="rgba(235, 208, 176, 0.8)",m.style.border="1px solid rgba(139, 69, 19, 0.3)"}));const u=o.querySelector("textarea");u&&(u.style.color="#8B4513",u.style.background="transparent",u.style.position="relative",u.style.zIndex="2");const b=o.querySelector(".sticky-note-header");b&&(b.style.background="rgba(245, 218, 186, 0.95)",b.style.position="relative",b.style.zIndex="2",b.querySelectorAll("button").forEach(p=>{const m=p;m.style.color="#8B4513",m.style.background="rgba(235, 208, 176, 0.8)",m.style.border="1px solid rgba(139, 69, 19, 0.3)"}))}if(o.style.position="fixed",o.style.zIndex="1000000",g){const d=Math.max(20,Math.min(g.x,window.innerWidth-320)),u=Math.max(20,Math.min(g.y,window.innerHeight-200));o.style.left=d+"px",o.style.top=u+"px"}else{const d=document.getElementById("sticky-note-widget");if(d){const u=d.getBoundingClientRect(),b=Math.max(20,Math.min(u.left-320,window.innerWidth-340)),h=Math.max(20,Math.min(u.top,window.innerHeight-220));o.style.left=b+"px",o.style.top=h+"px"}else o.style.left=Math.max(20,(window.innerWidth-300)/2)+"px",o.style.top=Math.max(20,(window.innerHeight-200)/2)+"px"}return f&&(o.style.width=f.width+"px",o.style.height=f.height+"px"),setTimeout(()=>o.classList.add("open"),10),t||(z={element:o,id:n},K++),F.set(n,o),we(o,n),o}function ae(e){e.classList.add("highlight");const t=e.querySelector(".sticky-note-textarea");t&&t.focus(),setTimeout(()=>{e.classList.remove("highlight"),e.classList.add("highlight-fade"),setTimeout(()=>{e.classList.remove("highlight-fade")},500)},300)}function we(e,t){const n=e.querySelector(".sticky-note-header"),o=e.querySelector(".sticky-note-textarea"),i=e.querySelector(".note-title"),a=e.querySelector(".close-btn"),r=e.querySelector(".minimize-btn"),s=e.querySelector(".pin-btn"),g=e.querySelector(".note-resize-handle"),f=e.querySelector(".transparency-slider"),c=e.querySelector(".delete-btn"),d=e.querySelector(".font-size-toggle"),u=e.querySelector(".font-size-popup"),b=e.querySelector(".increase-font"),h=e.querySelector(".decrease-font"),p=e.querySelector(".font-size-input"),m=e.querySelector(".toolbar-toggle-btn"),k=e.querySelector(".note-controls-bottom");let N=!1,W=!1,A={x:0,y:0},P=!1,E=!1,T=parseFloat(f.value),U=parseInt(p.value),G=!1,Y=!e.dataset.noteId,pe=i.textContent||"New Note",S={id:t,title:pe,content:o.value,fontSize:U,transparency:T,color:e.style.background,position:{x:0,y:0},size:{width:280,height:180}},ge=!1;i.addEventListener("click",()=>{if(ge)return;ge=!0;const l=document.createElement("input");l.className="note-title-input",l.value=i.textContent||"",l.maxLength=20,i.replaceWith(l),l.focus(),l.select();function v(){const I=l.value.trim()||"New Note";pe=I,S.title=I;const M=document.createElement("span");M.className="note-title",M.title="Click to edit title",M.textContent=I,l.replaceWith(M),ge=!1,M.addEventListener("click",()=>we(e,t))}l.addEventListener("blur",v),l.addEventListener("keydown",I=>{I.key==="Enter"?v():I.key==="Escape"&&(l.value=pe,v())})});const Te=(e.style.background||"rgba(255, 251, 147, 0.95)").match(/rgba?\(([^)]+)\)/),V=Te?Te[1].split(",").slice(0,3).join(","):"255, 251, 147",Ie=`rgba(${V}, ${T})`,ot=`rgba(${V}, ${T*.8})`,nt=`rgba(${V}, ${T*.6})`;e.style.background=Ie,S.color=Ie,e.style.setProperty("--note-bg-80",ot),e.style.setProperty("--note-bg-60",nt),e.style.setProperty("--note-opacity",T.toString()),f.addEventListener("input",()=>{T=parseFloat(f.value),e.style.setProperty("--note-opacity",T.toString());const l=`rgba(${V}, ${T})`,v=`rgba(${V}, ${T*.8})`,I=`rgba(${V}, ${T*.6})`;e.style.background=l,e.style.setProperty("--note-bg-80",v),e.style.setProperty("--note-bg-60",I),S.transparency=T,S.color=l}),n.addEventListener("mousedown",l=>{if(l.target.classList.contains("note-control-btn"))return;N=!0;const v=e.getBoundingClientRect();A.x=l.clientX-v.left,A.y=l.clientY-v.top,document.body.style.cursor="grabbing",e.style.transition="none",e.style.userSelect="none",document.addEventListener("mousemove",Me),document.addEventListener("mouseup",Ne),l.preventDefault()});function Me(l){if(!N)return;const v=l.clientX-A.x,I=l.clientY-A.y,M=10,it=window.innerWidth-e.offsetWidth-M,rt=window.innerHeight-e.offsetHeight-M,st=Math.max(M,Math.min(it,v)),at=Math.max(M,Math.min(rt,I));e.style.left=st+"px",e.style.top=at+"px"}function Ne(){N=!1,document.body.style.cursor="",e.style.transition="all 0.3s ease",e.style.userSelect="",document.removeEventListener("mousemove",Me),document.removeEventListener("mouseup",Ne)}g.addEventListener("mousedown",l=>{W=!0,e.style.transition="none",document.body.style.cursor="nw-resize",document.addEventListener("mousemove",Ae),document.addEventListener("mouseup",Pe),l.preventDefault(),l.stopPropagation()});function Ae(l){if(!W)return;const v=e.getBoundingClientRect(),I=Math.max(250,Math.min(600,l.clientX-v.left)),M=Math.max(180,Math.min(500,l.clientY-v.top));requestAnimationFrame(()=>{e.style.width=I+"px",e.style.height=M+"px"})}function Pe(){W=!1,document.body.style.cursor="",e.style.transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",document.removeEventListener("mousemove",Ae),document.removeEventListener("mouseup",Pe)}a==null||a.addEventListener("click",()=>{F.delete(t),o.value.trim()&&!G&&Y&&be(),Y&&(K=Math.max(0,K-1)),z&&z.id===t&&(z=null),e.classList.remove("open"),setTimeout(()=>e.remove(),300)}),r==null||r.addEventListener("click",()=>{E=!E,E?(S.size.width=e.offsetWidth,S.size.height=e.offsetHeight,e.classList.add("minimized"),e.style.height="36px",e.style.minHeight="36px",r.textContent="+",r.title="Restore"):(e.classList.remove("minimized"),e.style.height=S.size.height+"px",e.style.minHeight="180px",r.textContent="−",r.title="Minimize")}),s==null||s.addEventListener("click",()=>{P=!P,P?(e.classList.add("pinned"),e.style.zIndex="999999",s.classList.add("pinned"),s.title="Unpin note"):(e.classList.remove("pinned"),e.style.zIndex="999997",s.classList.remove("pinned"),s.title="Pin note (always on top)")}),d==null||d.addEventListener("click",l=>{l.stopPropagation(),u.classList.toggle("active")}),document.addEventListener("click",l=>{!u.contains(l.target)&&!d.contains(l.target)&&u.classList.remove("active")});function Z(l){l>=8&&l<=24&&(U=l,o.style.fontSize=U+"px",p.value=U.toString(),S.fontSize=U)}b==null||b.addEventListener("click",()=>{Z(U+1)}),h==null||h.addEventListener("click",()=>{Z(U-1)}),p==null||p.addEventListener("input",()=>{const l=parseInt(p.value);isNaN(l)||Z(l)}),p==null||p.addEventListener("blur",()=>{const l=parseInt(p.value);isNaN(l)||l<8?Z(8):l>24&&Z(24)});let me=!1;m==null||m.addEventListener("click",l=>{l.stopPropagation(),me=!me,me?(k.classList.add("collapsed"),m.innerHTML="&gt;",m.title="Show toolbar"):(k.classList.remove("collapsed"),m.innerHTML="&lt;",m.title="Hide toolbar")}),c==null||c.addEventListener("click",async()=>{confirm("Delete this note?")&&(F.delete(t),Y&&(K=Math.max(0,K-1)),z&&z.id===t&&(z=null),Y||await Ge(t),e.classList.remove("open"),setTimeout(()=>e.remove(),200))}),m==null||m.addEventListener("click",()=>{const l=e.querySelector(".note-toolbar");l.classList.contains("collapsed")?(l.classList.remove("collapsed"),m.textContent="‹",m.title="Hide toolbar"):(l.classList.add("collapsed"),m.textContent="›",m.title="Show toolbar")}),r==null||r.addEventListener("click",()=>{const l=r;E?(e.style.height=S.size.height+"px",o.style.display="block",k.style.display="block",g.style.display="block",l.textContent="−",l.title="Minimize",E=!1):(S.size={width:e.offsetWidth,height:e.offsetHeight},e.style.height="36px",o.style.display="none",k.style.display="none",g.style.display="none",l.textContent="+",l.title="Restore",E=!0)});const _=e.querySelector(".lock-btn");_&&_.addEventListener("click",()=>{G?(o.readOnly=!1,o.style.cursor="text",_.textContent="⚪",_.title="Lock Note",G=!1):(o.readOnly=!0,o.style.cursor="default",_.textContent="⚫",_.title="Unlock Note",G=!0)}),Y||(e.style.border="3px solid rgba(255, 255, 255, 0.8)",e.style.transform="scale(1.05)",setTimeout(()=>{e.style.border="",e.style.transform=""},800));let Be,qe=o.value;function be(){const l=o.value.trim();S.content=l;const v=e.getBoundingClientRect();S.position={x:v.left,y:v.top},S.size={width:e.offsetWidth,height:e.offsetHeight},Y&&l?(Le(S),Y=!1,e.dataset.noteId=S.id):!Y&&l!==qe&&je(S),qe=l}o.addEventListener("input",()=>{G||(clearTimeout(Be),Be=setTimeout(be,2e3))});const Fe=()=>{o.value.trim()&&!G&&be()};e.addEventListener("blur",Fe),window.addEventListener("beforeunload",Fe)}let w=null,q=null,le=null;function Ue(){if(!w){w=document.createElement("div"),w.className="notes-panel",w.innerHTML=`
      <div class="notes-header">
        📋 Recent Notes
        <button class="panel-close-btn" title="Close panel">×</button>
      </div>
      <div class="notes-list" id="notes-list"></div>
    `,document.body.appendChild(w),J(),setTimeout(()=>{se(B.id)},50);const e=w.querySelector(".panel-close-btn");e==null||e.addEventListener("click",()=>{w&&w.classList.remove("open"),q&&(clearTimeout(q),q=null)});let t=Date.now();const n=()=>{t=Date.now()};w.addEventListener("mouseenter",n),w.addEventListener("mousemove",n),w.addEventListener("click",n),le=()=>{w&&w.classList.contains("open")&&(Date.now()-t>=6e3?(w.classList.remove("open"),q&&(clearTimeout(q),q=null)):q=setTimeout(le,1e3))}}w.classList.toggle("open"),w.classList.contains("open")&&(J(),q&&clearTimeout(q),q=setTimeout(le,1e3))}function Oe(){var n,o;const e=document.createElement("div");e.className="sticky-modal",e.innerHTML=`
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
  `,document.body.appendChild(e),setTimeout(()=>e.classList.add("open"),10);function t(){e.classList.remove("open"),setTimeout(()=>e.remove(),300)}(n=e.querySelector(".modal-close"))==null||n.addEventListener("click",t),(o=e.querySelector(".close-settings"))==null||o.addEventListener("click",t)}function ke(){y&&(y.style.display="none"),document.querySelectorAll(".sticky-note").forEach(t=>{t.style.display="none"})}function Se(){y&&(y.style.display="block"),document.querySelectorAll(".sticky-note").forEach(t=>{t.style.display="block"})}function Ee(){return!y||y.style.display==="none"?!1:window.getComputedStyle(y).display!=="none"}async function Le(e){try{const n=(await x.storage.local.get("stickyNotes")).stickyNotes||[],o=n.findIndex(r=>r.id===e.id),i={id:e.id,title:e.title,content:e.content,fontSize:e.fontSize,transparency:e.transparency,color:e.color,position:e.position,size:e.size,timestamp:new Date().toISOString(),url:window.location.href};o!==-1?n[o]=i:n.unshift(i),n.length>50&&n.splice(50),await x.storage.local.set({stickyNotes:n}),console.log("Complete note saved successfully"),document.querySelector(".notes-panel.open")&&J()}catch(t){console.error("Error saving complete note:",t)}}async function je(e){try{const n=(await x.storage.local.get("stickyNotes")).stickyNotes||[],o=n.findIndex(a=>a.id===e.id);if(o!==-1)n[o]={...n[o],title:e.title,content:e.content,fontSize:e.fontSize,transparency:e.transparency,color:e.color,position:e.position,size:e.size,timestamp:new Date().toISOString()};else{await Le(e);return}await x.storage.local.set({stickyNotes:n}),console.log("Complete note updated successfully"),document.querySelector(".notes-panel.open")&&J()}catch(t){console.error("Error updating complete note:",t)}}async function J(){const e=document.getElementById("notes-list");if(e)try{const o=((await x.storage.local.get("stickyNotes")).stickyNotes||[]).filter((i,a,r)=>r.findIndex(s=>s.id===i.id)===a);if(o.length===0){e.innerHTML='<div style="padding: 20px; text-align: center; color: #000000; font-weight: 500;">📝 No notes yet<br><small style="color: #9929EA;">Create your first note!</small></div>';return}e.innerHTML=o.slice(0,10).map(i=>`
      <div class="note-item" data-note-id="${i.id}">
        <div class="note-title-display">${i.title||(i.content.length>20?i.content.substring(0,20)+"...":i.content)||"Untitled"}</div>
        <div class="note-preview">${i.content.substring(0,80)}${i.content.length>80?"...":""}</div>
        <div class="note-date">${new Date(i.timestamp).toLocaleDateString()}</div>
      </div>
    `).join(""),e.querySelectorAll(".note-item").forEach(i=>{i.addEventListener("click",()=>{const a=i.dataset.noteId,r=o.find(s=>s.id===a);r&&Ke(r)})})}catch(t){console.error("Error loading notes:",t)}}function Ke(e){if(F.has(e.id)){const n=F.get(e.id);if(n&&document.body.contains(n)){ae(n);return}else F.delete(e.id)}const t=ve(e.content,e);if(!t){console.log("StickyNoteAI: Cannot open note");return}t.dataset.noteId=e.id}async function Ge(e){try{const o=((await x.storage.local.get("stickyNotes")).stickyNotes||[]).filter(a=>a.id!==e);await x.storage.local.set({stickyNotes:o}),document.querySelector(".notes-panel.open")&&J()}catch(t){console.error("Error deleting note:",t)}}function Ve(){let e;document.addEventListener("keydown",t=>{if(!e&&(t.altKey&&t.shiftKey&&!t.ctrlKey&&!t.metaKey&&(t.code==="KeyN"?(t.preventDefault(),t.stopPropagation(),console.log("StickyNoteAI: Alt+Shift+N pressed - Creating/focusing note"),e=setTimeout(()=>{oe(),e=null},100)):t.code==="KeyW"&&(t.preventDefault(),t.stopPropagation(),console.log("StickyNoteAI: Alt+Shift+W pressed - Toggling widget visibility"),e=setTimeout(()=>{Ee()?ke():Se(),e=null},100))),t.code==="Escape"&&!t.altKey&&!t.shiftKey&&!t.ctrlKey&&!t.metaKey)){const n=document.querySelector(".font-size-popup.active");if(n){t.preventDefault(),n.classList.remove("active");return}const o=document.querySelector(".sticky-modal.open");if(o){t.preventDefault(),o.classList.remove("open"),setTimeout(()=>o.remove(),300);return}const i=document.querySelector(".notes-panel.open");if(i){t.preventDefault(),i.classList.remove("open");return}if($){t.preventDefault(),H();return}const a=document.querySelectorAll(".sticky-note.open");if(a.length>0){t.preventDefault(),a.forEach(r=>{const s=r;s.classList.remove("open"),setTimeout(()=>s.remove(),300)}),z=null;return}}}),console.log("StickyNoteAI: Enhanced keyboard shortcuts initialized (Alt+Shift+N, Alt+Shift+W, Esc)")}function _e(){function e(t,n){console.log("StickyNoteAI: Applying theme:",t),document.querySelectorAll(".sticky-note").forEach((r,s)=>{const g=r;if(t==="default"){g.style.removeProperty("background"),g.style.removeProperty("border"),g.style.removeProperty("color");const f=g.querySelector(".note-leaves-background");f&&f.remove()}else if(n&&n.colors&&t==="autumn"){g.style.background="rgba(255, 228, 196, 0.95)",g.style.border="2px solid rgba(139, 69, 19, 0.3)",g.style.color="#8b4513",g.style.boxShadow="0 4px 12px rgba(139, 69, 19, 0.15), 0 1px 4px rgba(139, 69, 19, 0.1)",xe(g);const f=g.querySelector(".note-toolbar");if(f){const u=f;u.style.background="rgba(255, 228, 196, 0.95)",u.style.position="relative",u.style.zIndex="2",f.querySelectorAll("button").forEach(h=>{const p=h;p.style.color="#8b4513",p.style.background="rgba(235, 208, 176, 0.8)",p.style.border="1px solid rgba(139, 69, 19, 0.3)"})}const c=g.querySelector("textarea");if(c){const u=c;u.style.color="#8b4513",u.style.background="transparent",u.style.position="relative",u.style.zIndex="2"}const d=g.querySelector(".sticky-note-header");if(d){const u=d;u.style.background="rgba(245, 218, 186, 0.95)",u.style.position="relative",u.style.zIndex="2",d.querySelectorAll("button").forEach(h=>{const p=h;p.style.color="#8b4513",p.style.background="rgba(235, 208, 176, 0.8)",p.style.border="1px solid rgba(139, 69, 19, 0.3)"})}}});const i=document.getElementById("sticky-note-widget"),a=document.querySelector(".notes-panel");if(t==="autumn"){if(i&&(i.style.background="linear-gradient(145deg, rgba(255, 248, 220, 0.95), rgba(245, 222, 179, 0.9))",i.style.border="2px solid rgba(139, 69, 19, 0.4)",i.style.color="#8B4513",te(i,"widget")),a){a.style.background="linear-gradient(145deg, rgba(255, 248, 220, 0.95), rgba(245, 222, 179, 0.9))",a.style.border="2px solid rgba(139, 69, 19, 0.4)",a.style.color="#8B4513",te(a,"panel");const r=a.querySelector("h3");r&&(r.style.color="#8B4513"),a.querySelectorAll(".recent-note-item").forEach(g=>{const f=g;f.style.background="rgba(255, 228, 196, 0.8)",f.style.border="1px solid rgba(139, 69, 19, 0.3)",f.style.color="#8B4513"})}}else{if(i){i.style.removeProperty("background"),i.style.removeProperty("border"),i.style.removeProperty("color");const r=i.querySelector(".area-leaves-background");r&&r.remove()}if(a){a.style.removeProperty("background"),a.style.removeProperty("border"),a.style.removeProperty("color");const r=a.querySelector(".area-leaves-background");r&&r.remove();const s=a.querySelector("h3");s&&s.style.removeProperty("color"),a.querySelectorAll(".recent-note-item").forEach(f=>{const c=f;c.style.removeProperty("background"),c.style.removeProperty("border"),c.style.removeProperty("color")})}}B={id:t,data:n}}x.runtime.onMessage.addListener((t,n,o)=>{if(console.log("StickyNoteAI: Received message:",t),t.action==="toggle-widget"){console.log("StickyNoteAI: Toggle widget command received"),Ee()?(console.log("StickyNoteAI: Hiding widget"),ke()):(console.log("StickyNoteAI: Showing widget"),Se()),o({success:!0});return}if(t.action==="new-note"){oe(),o({success:!0});return}if(t.action==="create-note-with-selection"){oe(t.selectedText||""),o({success:!0});return}if(t.action==="toggleStealth"){const i=document.getElementById("sticky-note-widget");i&&(t.enabled?i.style.opacity="0.3":i.style.opacity="1"),o({success:!0});return}if(t.action==="changeTheme"){e(t.themeId,t.theme),o({success:!0});return}o({success:!1,error:"Unknown action"})})}async function Je(){if(!y)return;const e=y.getBoundingClientRect(),t={x:e.left,y:e.top};try{await x.storage.local.set({widgetPosition:t})}catch(n){console.error("Error saving position:",n)}}async function Qe(){if(y){y.style.left="",y.style.top="",y.style.transform="";try{await x.storage.local.remove("widgetPosition")}catch(e){console.error("Error clearing position:",e)}}}function ne(e,...t){}const Ze={debug:(...e)=>ne(console.debug,...e),log:(...e)=>ne(console.log,...e),warn:(...e)=>ne(console.warn,...e),error:(...e)=>ne(console.error,...e)},re=class re extends Event{constructor(t,n){super(re.EVENT_NAME,{}),this.newUrl=t,this.oldUrl=n}};O(re,"EVENT_NAME",de("wxt:locationchange"));let ce=re;function de(e){var t;return`${(t=x==null?void 0:x.runtime)==null?void 0:t.id}:content:${e}`}function et(e){let t,n;return{run(){t==null&&(n=new URL(location.href),t=e.setInterval(()=>{let o=new URL(location.href);o.href!==n.href&&(window.dispatchEvent(new ce(o,n)),n=o)},1e3))}}}const Q=class Q{constructor(t,n){O(this,"isTopFrame",window.self===window.top);O(this,"abortController");O(this,"locationWatcher",et(this));O(this,"receivedMessageIds",new Set);this.contentScriptName=t,this.options=n,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(t){return this.abortController.abort(t)}get isInvalid(){return x.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(t){return this.signal.addEventListener("abort",t),()=>this.signal.removeEventListener("abort",t)}block(){return new Promise(()=>{})}setInterval(t,n){const o=setInterval(()=>{this.isValid&&t()},n);return this.onInvalidated(()=>clearInterval(o)),o}setTimeout(t,n){const o=setTimeout(()=>{this.isValid&&t()},n);return this.onInvalidated(()=>clearTimeout(o)),o}requestAnimationFrame(t){const n=requestAnimationFrame((...o)=>{this.isValid&&t(...o)});return this.onInvalidated(()=>cancelAnimationFrame(n)),n}requestIdleCallback(t,n){const o=requestIdleCallback((...i)=>{this.signal.aborted||t(...i)},n);return this.onInvalidated(()=>cancelIdleCallback(o)),o}addEventListener(t,n,o,i){var a;n==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(a=t.addEventListener)==null||a.call(t,n.startsWith("wxt:")?de(n):n,o,{...i,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),Ze.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:Q.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(t){var a,r,s;const n=((a=t.data)==null?void 0:a.type)===Q.SCRIPT_STARTED_MESSAGE_TYPE,o=((r=t.data)==null?void 0:r.contentScriptName)===this.contentScriptName,i=!this.receivedMessageIds.has((s=t.data)==null?void 0:s.messageId);return n&&o&&i}listenForNewerScripts(t){let n=!0;const o=i=>{if(this.verifyScriptStartedEvent(i)){this.receivedMessageIds.add(i.data.messageId);const a=n;if(n=!1,a&&(t!=null&&t.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",o),this.onInvalidated(()=>removeEventListener("message",o))}};O(Q,"SCRIPT_STARTED_MESSAGE_TYPE",de("wxt:content-script-started"));let ue=Q;function dt(){}function ie(e,...t){}const tt={debug:(...e)=>ie(console.debug,...e),log:(...e)=>ie(console.log,...e),warn:(...e)=>ie(console.warn,...e),error:(...e)=>ie(console.error,...e)};return(async()=>{try{const{main:e,...t}=Re,n=new ue("content",t);return await e(n)}catch(e){throw tt.error('The content script "content" crashed on startup!',e),e}})()}();
content;
