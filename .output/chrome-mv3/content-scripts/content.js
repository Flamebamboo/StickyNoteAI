var content=function(){"use strict";var yt=Object.defineProperty;var wt=(M,L,c)=>L in M?yt(M,L,{enumerable:!0,configurable:!0,writable:!0,value:c}):M[L]=c;var T=(M,L,c)=>wt(M,typeof L!="symbol"?L+"":L,c);var J,Q;function M(t){return t}const c=(Q=(J=globalThis.browser)==null?void 0:J.runtime)!=null&&Q.id?globalThis.browser:globalThis.chrome,Z={matches:["<all_urls>"],main(){console.log("🎯 StickyNoteAI v2.2 CSS FIXED + MENU POSITIONING - Loading..."),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{X()}):X()}};let a=null,v=!1,B=!1,R={x:0,y:0},N={x:0,y:0},h=null,$;function X(){console.log("StickyNoteAI: DOM ready, creating widget..."),tt(),ut(),ct(),dt()}function tt(){const t=document.getElementById("sticky-note-widget");t&&t.remove(),a=document.createElement("div"),a.id="sticky-note-widget";let e,n;try{e=c.runtime.getURL("smilyface.gif"),$=e,n=c.runtime.getURL("add2.png")}catch(d){console.warn("browser.runtime.getURL failed, using fallback approach:",d);const u=c.runtime.id||chrome.runtime.id;e=`chrome-extension://${u}/smilyface.gif`,$=e,n=`chrome-extension://${u}/add2.png`}console.log("StickyNoteAI: Image URLs:",{smilyFaceUrl:e,add2Url:n}),console.log("StickyNoteAI: Extension ID:",c.runtime.id),console.log("StickyNoteAI: Chrome runtime ID:",chrome.runtime.id),a.innerHTML=`
    <div class="widget-container">
      <div class="widget-main-button" id="main-button">
        <img src="${e}" alt="Widget" style="width: 24px; height: 24px;" id="smiley-image">
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
      border-radius: 0px;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.15),
        0 1px 4px rgba(0, 0, 0, 0.1);
      z-index: 999997;
      font-family: 'Segoe UI', system-ui, sans-serif;
      transform: scale(0.9) rotate(var(--note-rotation, -1deg));
      opacity: 0;
      transition: all 0.3s ease;
      border: none;
      backdrop-filter: blur(2px);
    }

    .sticky-note.open {
      transform: scale(1) rotate(var(--note-rotation, 0deg));
      opacity: 1;
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

    .sticky-note.pinned {
      border: 2px solid rgba(255, 193, 7, 0.6);
      box-shadow: 
        0 6px 16px rgba(255, 193, 7, 0.2),
        0 2px 8px rgba(0, 0, 0, 0.1);
      transform: scale(1) rotate(0deg) !important;
    }

    .sticky-note-header {
      background: transparent;
      padding: 8px 12px;
      border-radius: 0;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      user-select: none;
    }

    .note-title {
      font-size: 12px;
      font-weight: 500;
      color: #666;
      text-shadow: none;
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
      width: calc(100% - 16px);
      height: calc(100% - 50px);
      margin: 8px;
      border: none;
      background: transparent;
      resize: none;
      outline: none;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 13px;
      color: #333;
      line-height: 1.5;
      placeholder-color: rgba(0, 0, 0, 0.4);
    }

    .sticky-note-textarea::placeholder {
      color: rgba(0, 0, 0, 0.4);
      font-style: italic;
    }

    .note-resize-handle {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      cursor: nw-resize;
      background: linear-gradient(-45deg, transparent 40%, rgba(0, 0, 0, 0.2) 50%, transparent 60%);
      border-radius: 0;
    }

    .note-resize-handle:hover {
      background: linear-gradient(-45deg, transparent 35%, rgba(0, 0, 0, 0.3) 50%, transparent 65%);
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
    
    .note-preview {
      color: #374151;
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .note-date {
      font-size: 11px;
      color: #9ca3af;
      font-weight: 400;
    }

    /* Note Action Buttons */
    .note-action-buttons {
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.3);
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      margin: 0;
    }

    .note-action-buttons.top-positioned {
      border-bottom: none;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      order: -1; /* Ensure it appears first */
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      font-weight: 500;
    }

    .action-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .action-btn.edit-btn {
      background: #22c55e;
      color: white;
    }

    .action-btn.edit-btn:hover {
      background: #16a34a;
    }

    .action-btn.delete-btn {
      background: #ef4444;
      color: white;
    }

    .action-btn.delete-btn:hover {
      background: #dc2626;
    }

    .action-btn.cancel-btn {
      background: #6b7280;
      color: white;
    }

    .action-btn.cancel-btn:hover {
      background: #4b5563;
    }

    /* ...existing code... */
  `,document.head.appendChild(o),document.body.appendChild(a);const s=document.getElementById("smiley-image"),r=document.getElementById("add-image");s&&(s.addEventListener("load",()=>{console.log("✅ Smiley face image loaded successfully")}),s.addEventListener("error",()=>{console.error("❌ Failed to load smiley face image:",e),s.style.display="none"})),r&&(r.addEventListener("load",()=>{console.log("✅ Add2 image loaded successfully")}),r.addEventListener("error",()=>{console.error("❌ Failed to load add2 image:",n),r.style.display="none"})),et()}function et(){const t=document.getElementById("main-button"),e=document.getElementById("widget-menu");if(!t||!e)return;let n=0,o={x:0,y:0},s=!1;function r(i,l){if(!a)return{x:i,y:l};const p={width:50,height:50},m=window.innerWidth,f=window.innerHeight,g=10;let E=Math.max(g,i);E=Math.min(m-p.width-g,E);let S=Math.max(g,l);return S=Math.min(f-p.height-g,S),{x:E,y:S}}function d(i,l){if(!a)return{x:i,y:l};const p={width:50,height:50},m=window.innerWidth,f=window.innerHeight,g=20,E=i,S=m-(i+p.width),b=l,y=f-(l+p.height),I=Math.min(E,S,b,y);let w=i,D=l;return(i<0||i+p.width>m||l<0||l+p.height>f)&&(I===E?w=g:I===S?w=m-p.width-g:I===b?D=g:I===y&&(D=f-p.height-g)),{x:w,y:D}}t.addEventListener("mousedown",i=>{i.preventDefault(),n=Date.now(),o={x:i.clientX,y:i.clientY},s=!1;const l=a.getBoundingClientRect();R.x=i.clientX-l.left,R.y=i.clientY-l.top,t.classList.add("dragging"),document.addEventListener("mousemove",u),document.addEventListener("mouseup",x)}),t.addEventListener("mouseenter",()=>{v||(h&&(clearTimeout(h),h=null),O())}),e.addEventListener("mouseenter",()=>{h&&(clearTimeout(h),h=null)}),e.addEventListener("mouseleave",()=>{v||(h=setTimeout(()=>{C(),h=null},100))}),t.addEventListener("mouseleave",i=>{if(!v){const l=e.getBoundingClientRect(),p=i.clientX,m=i.clientY;p>=l.left-10&&p<=l.right+10&&m>=l.top-10&&m<=l.bottom+10||(h=setTimeout(()=>{C(),h=null},100))}});function u(i){const l=Date.now()-n,p=Math.sqrt(Math.pow(i.clientX-o.x,2)+Math.pow(i.clientY-o.y,2));if(!v&&(p>3||l>100)&&(v=!0,s=!0,C(),document.body.style.cursor="grabbing"),v){const m=i.clientX-R.x,f=i.clientY-R.y,g=r(m,f);a.style.transform=`translate(${g.x}px, ${g.y}px)`,a.style.left="0",a.style.top="0",N={x:g.x,y:g.y}}}function x(){if(document.removeEventListener("mousemove",u),document.removeEventListener("mouseup",x),t&&t.classList.remove("dragging"),document.body.style.cursor="",v){const i=d(N.x,N.y);i.x!==N.x||i.y!==N.y?(a.style.transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",a.style.left=i.x+"px",a.style.top=i.y+"px",a.style.transform="",setTimeout(()=>{a&&(a.style.transition="")},300),N=i):(a.style.left=N.x+"px",a.style.top=N.y+"px",a.style.transform=""),pt()}v=!1,setTimeout(()=>{s||O()},50)}let k=0;e==null||e.addEventListener("click",i=>{const p=i.target.dataset.action,m=Date.now();m-k<500||(k=m,p&&(console.log("Menu button clicked:",p),nt(p)))})}function O(){if(v)return;const t=document.getElementById("widget-menu"),e=document.getElementById("sticky-note-widget");if(t&&e){const n=e.getBoundingClientRect(),o=window.innerHeight;n.top>o/2?t.classList.add("top-positioned"):t.classList.remove("top-positioned"),t.classList.add("open"),B=!0}}function C(){const t=document.getElementById("widget-menu");t&&(t.classList.remove("open"),B=!1),h&&(clearTimeout(h),h=null)}function nt(t){console.log("Menu action triggered:",t),C(),setTimeout(()=>{switch(t){case"add":q();break;case"notes":it();break;case"settings":st();break}},100)}function q(t=""){const e=j(t);setTimeout(()=>{const n=e.querySelector(".sticky-note-textarea");n&&(n.focus(),n.setSelectionRange(n.value.length,n.value.length))},100)}function j(t=""){const e=Date.now().toString(),n=document.createElement("div");n.className="sticky-note",n.id=`sticky-note-${e}`;const o=["rgba(255, 251, 147, 0.95)","rgba(255, 237, 213, 0.95)","rgba(237, 255, 235, 0.95)","rgba(235, 245, 255, 0.95)","rgba(255, 235, 255, 0.95)","rgba(255, 243, 205, 0.95)","rgba(243, 235, 255, 0.95)"],s=o[Math.floor(Math.random()*o.length)];n.innerHTML=`
    <div class="sticky-note-header">
      <span class="note-title">Sticky Note...</span>
      <div class="note-controls">
        <button class="note-control-btn pin-btn" title="Pin note (always on top)">📌</button>
        <button class="note-control-btn minimize-btn" title="Minimize">−</button>
        <button class="note-control-btn close-btn" title="Close">×</button>
      </div>
    </div>
    <textarea class="sticky-note-textarea" placeholder="Write your note here...">${t}</textarea>
    <div class="note-resize-handle"></div>
  `,n.style.background=s;const r=(Math.random()-.5)*4;n.style.setProperty("--note-rotation",`${r}deg`),document.body.appendChild(n);const d=document.getElementById("sticky-note-widget");if(d){const u=d.getBoundingClientRect();n.style.left=Math.max(20,u.left-320)+"px",n.style.top=Math.max(20,u.top)+"px"}else n.style.left="100px",n.style.top="100px";return setTimeout(()=>n.classList.add("open"),10),ot(n),n}function ot(t,e){const n=t.querySelector(".sticky-note-header"),o=t.querySelector(".sticky-note-textarea"),s=t.querySelector(".close-btn"),r=t.querySelector(".minimize-btn"),d=t.querySelector(".pin-btn"),u=t.querySelector(".note-resize-handle");let x=!1,k=!1,i={x:0,y:0},l=!1,p=!1,m;o.addEventListener("input",()=>{clearTimeout(m),m=setTimeout(()=>{rt(o.value.trim())},1e3)}),n.addEventListener("mousedown",b=>{if(b.target.classList.contains("note-control-btn"))return;x=!0;const y=t.getBoundingClientRect();i.x=b.clientX-y.left,i.y=b.clientY-y.top,document.body.style.cursor="grabbing",t.style.transition="none",t.style.userSelect="none",document.addEventListener("mousemove",f),document.addEventListener("mouseup",g),b.preventDefault()});function f(b){if(!x)return;const y=b.clientX-i.x,I=b.clientY-i.y,w=10,D=window.innerWidth-t.offsetWidth-w,ht=window.innerHeight-t.offsetHeight-w,ft=Math.max(w,Math.min(D,y)),xt=Math.max(w,Math.min(ht,I));t.style.left=ft+"px",t.style.top=xt+"px"}function g(){x=!1,document.body.style.cursor="",t.style.transition="all 0.3s ease",t.style.userSelect="",document.removeEventListener("mousemove",f),document.removeEventListener("mouseup",g)}u.addEventListener("mousedown",b=>{k=!0,document.addEventListener("mousemove",E),document.addEventListener("mouseup",S),b.preventDefault()});function E(b){if(!k)return;const y=t.getBoundingClientRect(),I=Math.max(200,b.clientX-y.left),w=Math.max(150,b.clientY-y.top);t.style.width=I+"px",t.style.height=w+"px"}function S(){k=!1,document.removeEventListener("mousemove",E),document.removeEventListener("mouseup",S)}s==null||s.addEventListener("click",()=>{t.classList.remove("open"),setTimeout(()=>t.remove(),300)}),r==null||r.addEventListener("click",()=>{p=!p,p?(t.classList.add("minimized"),r.textContent="+",r.title="Restore"):(t.classList.remove("minimized"),r.textContent="−",r.title="Minimize")}),d==null||d.addEventListener("click",()=>{l=!l,l?(t.classList.add("pinned"),t.style.zIndex="999999",d.classList.add("pinned"),d.title="Unpin note"):(t.classList.remove("pinned"),t.style.zIndex="999997",d.classList.remove("pinned"),d.title="Pin note (always on top)")})}function it(){let t=document.querySelector(".notes-panel");t||(t=document.createElement("div"),t.className="notes-panel",t.innerHTML=`
      <div class="notes-header">📋 Recent Notes</div>
      <div class="notes-list" id="notes-list"></div>
    `,document.body.appendChild(t),A()),t.classList.toggle("open"),t.classList.contains("open")&&(A(),setTimeout(()=>{document.addEventListener("click",function e(n){t.contains(n.target)||(t.classList.remove("open"),document.removeEventListener("click",e))})},100))}function st(){var n,o;const t=document.createElement("div");t.className="sticky-modal",t.innerHTML=`
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
  `,document.body.appendChild(t),setTimeout(()=>t.classList.add("open"),10);function e(){t.classList.remove("open"),setTimeout(()=>t.remove(),300)}(n=t.querySelector(".modal-close"))==null||n.addEventListener("click",e),(o=t.querySelector(".close-settings"))==null||o.addEventListener("click",e)}function V(){a&&(a.style.display="none"),document.querySelectorAll(".sticky-note").forEach(e=>{e.style.display="none"})}function _(){a&&(a.style.display="block"),document.querySelectorAll(".sticky-note").forEach(e=>{e.style.display="block"})}function G(){return!a||a.style.display==="none"?!1:window.getComputedStyle(a).display!=="none"}async function rt(t){try{const n=(await c.storage.local.get("stickyNotes")).stickyNotes||[],o={id:Date.now().toString(),content:t,timestamp:new Date().toISOString(),url:window.location.href};n.unshift(o),n.length>50&&n.splice(50),await c.storage.local.set({stickyNotes:n}),console.log("Note saved successfully")}catch(e){console.error("Error saving note:",e)}}async function A(){const t=document.getElementById("notes-list");if(t)try{const n=(await c.storage.local.get("stickyNotes")).stickyNotes||[];if(n.length===0){t.innerHTML='<div style="padding: 20px; text-align: center; color: #000000; font-weight: 500;">📝 No notes yet<br><small style="color: #9929EA;">Create your first note!</small></div>';return}t.innerHTML=n.slice(0,10).map(o=>`
      <div class="note-item" data-note-id="${o.id}">
        <div class="note-preview">${o.content.substring(0,100)}${o.content.length>100?"...":""}</div>
        <div class="note-date">${new Date(o.timestamp).toLocaleDateString()}</div>
      </div>
    `).join(""),t.querySelectorAll(".note-item").forEach(o=>{o.addEventListener("click",()=>{const s=o.dataset.noteId,r=n.find(d=>d.id===s);r&&at(r)})})}catch(e){console.error("Error loading notes:",e)}}function at(t){const e=j(t.content);e.dataset.noteId=t.id;const n=e.querySelector(".note-title");n&&(n.textContent="Edit Note");const o=document.createElement("div");o.className="note-action-buttons",o.innerHTML=`
    <button class="action-btn edit-btn" title="Save & Close">✓</button>
    <button class="action-btn delete-btn" title="Delete Note">🗑️</button>
    <button class="action-btn cancel-btn" title="Cancel">×</button>
  `;const s=e.querySelector(".sticky-note-header");s&&s.after(o),setTimeout(()=>{const i=e.getBoundingClientRect(),l=window.innerHeight;i.top>l/2&&(o.classList.add("top-positioned"),s&&s.before(o))},50);const r=o.querySelector(".edit-btn"),d=o.querySelector(".delete-btn"),u=o.querySelector(".cancel-btn");r==null||r.addEventListener("click",()=>{const l=e.querySelector(".sticky-note-textarea").value.trim();l&&(K(t.id,l),A()),e.remove()}),d==null||d.addEventListener("click",()=>{confirm("Are you sure you want to delete this note?")&&(lt(t.id),A(),e.remove())}),u==null||u.addEventListener("click",()=>{e.remove()});const x=e.querySelector(".sticky-note-textarea");let k;x.removeEventListener("input",()=>{}),x.addEventListener("input",()=>{clearTimeout(k),k=setTimeout(async()=>{const i=x.value.trim();i&&t.id&&(await K(t.id,i),A())},1e3)})}async function K(t,e){try{const o=(await c.storage.local.get("stickyNotes")).stickyNotes||[],s=o.findIndex(r=>r.id===t);s!==-1&&(o[s].content=e,o[s].timestamp=new Date().toISOString(),await c.storage.local.set({stickyNotes:o}))}catch(n){console.error("Error updating note:",n)}}async function lt(t){try{const o=((await c.storage.local.get("stickyNotes")).stickyNotes||[]).filter(s=>s.id!==t);await c.storage.local.set({stickyNotes:o})}catch(e){console.error("Error deleting note:",e)}}function ct(){document.addEventListener("keydown",t=>{if(t.altKey&&t.shiftKey&&(t.code==="KeyN"?(t.preventDefault(),console.log("StickyNoteAI: Alt+Shift+N pressed - Creating new note"),q()):t.code==="KeyW"&&(t.preventDefault(),console.log("StickyNoteAI: Alt+Shift+W pressed - Toggling widget visibility"),G()?V():_())),t.code==="Escape"){const e=document.querySelector(".sticky-modal.open");if(e){t.preventDefault(),e.classList.remove("open"),setTimeout(()=>e.remove(),300);return}const n=document.querySelector(".notes-panel.open");if(n){t.preventDefault(),n.classList.remove("open");return}if(B){t.preventDefault(),C();return}}}),console.log("StickyNoteAI: Local keyboard shortcuts initialized (Alt+Shift+N, Alt+Shift+W, Esc)")}function dt(){c.runtime.onMessage.addListener((t,e,n)=>{if(console.log("StickyNoteAI: Received message:",t),t.action==="toggle-widget"){console.log("StickyNoteAI: Toggle widget command received"),G()?(console.log("StickyNoteAI: Hiding widget"),V()):(console.log("StickyNoteAI: Showing widget"),_()),n({success:!0});return}if(t.action==="new-note"){q(),n({success:!0});return}if(t.action==="create-note-with-selection"){q(t.selectedText||""),n({success:!0});return}if(t.action==="toggleStealth"){const o=document.getElementById("sticky-note-widget");o&&(t.enabled?o.style.opacity="0.3":o.style.opacity="1"),n({success:!0});return}n({success:!1,error:"Unknown action"})})}async function pt(){if(!a)return;const t=a.getBoundingClientRect(),e={x:t.left,y:t.top};try{await c.storage.local.set({widgetPosition:e})}catch(n){console.error("Error saving position:",n)}}async function ut(){if(a){a.style.left="",a.style.top="",a.style.transform="";try{await c.storage.local.remove("widgetPosition")}catch(t){console.error("Error clearing position:",t)}}}function H(t,...e){}const gt={debug:(...t)=>H(console.debug,...t),log:(...t)=>H(console.log,...t),warn:(...t)=>H(console.warn,...t),error:(...t)=>H(console.error,...t)},W=class W extends Event{constructor(e,n){super(W.EVENT_NAME,{}),this.newUrl=e,this.oldUrl=n}};T(W,"EVENT_NAME",Y("wxt:locationchange"));let P=W;function Y(t){var e;return`${(e=c==null?void 0:c.runtime)==null?void 0:e.id}:content:${t}`}function mt(t){let e,n;return{run(){e==null&&(n=new URL(location.href),e=t.setInterval(()=>{let o=new URL(location.href);o.href!==n.href&&(window.dispatchEvent(new P(o,n)),n=o)},1e3))}}}const z=class z{constructor(e,n){T(this,"isTopFrame",window.self===window.top);T(this,"abortController");T(this,"locationWatcher",mt(this));T(this,"receivedMessageIds",new Set);this.contentScriptName=e,this.options=n,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return c.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener("abort",e),()=>this.signal.removeEventListener("abort",e)}block(){return new Promise(()=>{})}setInterval(e,n){const o=setInterval(()=>{this.isValid&&e()},n);return this.onInvalidated(()=>clearInterval(o)),o}setTimeout(e,n){const o=setTimeout(()=>{this.isValid&&e()},n);return this.onInvalidated(()=>clearTimeout(o)),o}requestAnimationFrame(e){const n=requestAnimationFrame((...o)=>{this.isValid&&e(...o)});return this.onInvalidated(()=>cancelAnimationFrame(n)),n}requestIdleCallback(e,n){const o=requestIdleCallback((...s)=>{this.signal.aborted||e(...s)},n);return this.onInvalidated(()=>cancelIdleCallback(o)),o}addEventListener(e,n,o,s){var r;n==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(r=e.addEventListener)==null||r.call(e,n.startsWith("wxt:")?Y(n):n,o,{...s,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),gt.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:z.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(e){var r,d,u;const n=((r=e.data)==null?void 0:r.type)===z.SCRIPT_STARTED_MESSAGE_TYPE,o=((d=e.data)==null?void 0:d.contentScriptName)===this.contentScriptName,s=!this.receivedMessageIds.has((u=e.data)==null?void 0:u.messageId);return n&&o&&s}listenForNewerScripts(e){let n=!0;const o=s=>{if(this.verifyScriptStartedEvent(s)){this.receivedMessageIds.add(s.data.messageId);const r=n;if(n=!1,r&&(e!=null&&e.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",o),this.onInvalidated(()=>removeEventListener("message",o))}};T(z,"SCRIPT_STARTED_MESSAGE_TYPE",Y("wxt:content-script-started"));let U=z;function vt(){}function F(t,...e){}const bt={debug:(...t)=>F(console.debug,...t),log:(...t)=>F(console.log,...t),warn:(...t)=>F(console.warn,...t),error:(...t)=>F(console.error,...t)};return(async()=>{try{const{main:t,...e}=Z,n=new U("content",e);return await t(n)}catch(t){throw bt.error('The content script "content" crashed on startup!',t),t}})()}();
content;
