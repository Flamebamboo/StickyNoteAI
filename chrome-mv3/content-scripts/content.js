var content=function(){"use strict";var ve=Object.defineProperty;var we=(I,E,c)=>E in I?ve(I,E,{enumerable:!0,configurable:!0,writable:!0,value:c}):I[E]=c;var N=(I,E,c)=>we(I,typeof E!="symbol"?E+"":E,c);var K,J;function I(e){return e}const c=(J=(K=globalThis.browser)==null?void 0:K.runtime)!=null&&J.id?globalThis.browser:globalThis.chrome,Q={matches:["<all_urls>"],main(){console.log("🎯 StickyNoteAI v2.2 CSS FIXED + MENU POSITIONING - Loading..."),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{X()}):X()}};let a=null,v=!1,Y=!1,D={x:0,y:0},S={x:0,y:0},h=null,H;function X(){console.log("StickyNoteAI: DOM ready, creating widget..."),Z(),ue(),ce(),de()}function Z(){const e=document.getElementById("sticky-note-widget");e&&e.remove(),a=document.createElement("div"),a.id="sticky-note-widget";let n,t;try{n=c.runtime.getURL("smilyface.gif"),H=n,t=c.runtime.getURL("add2.png")}catch(d){console.warn("browser.runtime.getURL failed, using fallback approach:",d);const m=c.runtime.id||chrome.runtime.id;n=`chrome-extension://${m}/smilyface.gif`,H=n,t=`chrome-extension://${m}/add2.png`}console.log("StickyNoteAI: Image URLs:",{smilyFaceUrl:n,add2Url:t}),console.log("StickyNoteAI: Extension ID:",c.runtime.id),console.log("StickyNoteAI: Chrome runtime ID:",chrome.runtime.id),a.innerHTML=`
    <div class="widget-container">
      <div class="widget-main-button" id="main-button">
        <img src="${n}" alt="Widget" style="width: 24px; height: 24px;" id="smiley-image">
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

    /* ...existing code... */
  `,document.head.appendChild(o),document.body.appendChild(a);const i=document.getElementById("smiley-image"),r=document.getElementById("add-image");i&&(i.addEventListener("load",()=>{console.log("✅ Smiley face image loaded successfully")}),i.addEventListener("error",()=>{console.error("❌ Failed to load smiley face image:",n),i.style.display="none"})),r&&(r.addEventListener("load",()=>{console.log("✅ Add2 image loaded successfully")}),r.addEventListener("error",()=>{console.error("❌ Failed to load add2 image:",t),r.style.display="none"})),ee()}function ee(){const e=document.getElementById("main-button"),n=document.getElementById("widget-menu");if(!e||!n)return;let t=0,o={x:0,y:0},i=!1;function r(s,l){if(!a)return{x:s,y:l};const p={width:50,height:50},g=window.innerWidth,f=window.innerHeight,u=10;let w=Math.max(u,s);w=Math.min(g-p.width-u,w);let k=Math.max(u,l);return k=Math.min(f-p.height-u,k),{x:w,y:k}}function d(s,l){if(!a)return{x:s,y:l};const p={width:50,height:50},g=window.innerWidth,f=window.innerHeight,u=20,w=s,k=g-(s+p.width),b=l,x=f-(l+p.height),L=Math.min(w,k,b,x);let y=s,z=l;return(s<0||s+p.width>g||l<0||l+p.height>f)&&(L===w?y=u:L===k?y=g-p.width-u:L===b?z=u:L===x&&(z=f-p.height-u)),{x:y,y:z}}e.addEventListener("mousedown",s=>{s.preventDefault(),t=Date.now(),o={x:s.clientX,y:s.clientY},i=!1;const l=a.getBoundingClientRect();D.x=s.clientX-l.left,D.y=s.clientY-l.top,e.classList.add("dragging"),document.addEventListener("mousemove",m),document.addEventListener("mouseup",T)}),e.addEventListener("mouseenter",()=>{v||(h&&(clearTimeout(h),h=null),O())}),n.addEventListener("mouseenter",()=>{h&&(clearTimeout(h),h=null)}),n.addEventListener("mouseleave",()=>{v||(h=setTimeout(()=>{C(),h=null},100))}),e.addEventListener("mouseleave",s=>{if(!v){const l=n.getBoundingClientRect(),p=s.clientX,g=s.clientY;p>=l.left-10&&p<=l.right+10&&g>=l.top-10&&g<=l.bottom+10||(h=setTimeout(()=>{C(),h=null},100))}});function m(s){const l=Date.now()-t,p=Math.sqrt(Math.pow(s.clientX-o.x,2)+Math.pow(s.clientY-o.y,2));if(!v&&(p>3||l>100)&&(v=!0,i=!0,C(),document.body.style.cursor="grabbing"),v){const g=s.clientX-D.x,f=s.clientY-D.y,u=r(g,f);a.style.transform=`translate(${u.x}px, ${u.y}px)`,a.style.left="0",a.style.top="0",S={x:u.x,y:u.y}}}function T(){if(document.removeEventListener("mousemove",m),document.removeEventListener("mouseup",T),e&&e.classList.remove("dragging"),document.body.style.cursor="",v){const s=d(S.x,S.y);s.x!==S.x||s.y!==S.y?(a.style.transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",a.style.left=s.x+"px",a.style.top=s.y+"px",a.style.transform="",setTimeout(()=>{a&&(a.style.transition="")},300),S=s):(a.style.left=S.x+"px",a.style.top=S.y+"px",a.style.transform=""),pe()}v=!1,setTimeout(()=>{i||O()},50)}let M=0;n==null||n.addEventListener("click",s=>{const p=s.target.dataset.action,g=Date.now();g-M<500||(M=g,p&&(console.log("Menu button clicked:",p),te(p)))})}function O(){if(v)return;const e=document.getElementById("widget-menu");e&&(e.classList.add("open"),Y=!0)}function C(){const e=document.getElementById("widget-menu");e&&(e.classList.remove("open"),Y=!1),h&&(clearTimeout(h),h=null)}function te(e){console.log("Menu action triggered:",e),C(),setTimeout(()=>{switch(e){case"add":F();break;case"notes":oe();break;case"settings":ie();break}},100)}function F(e=""){const n=j(e);setTimeout(()=>{const t=n.querySelector(".sticky-note-textarea");t&&(t.focus(),t.setSelectionRange(t.value.length,t.value.length))},100)}function j(e=""){const n=Date.now().toString(),t=document.createElement("div");t.className="sticky-note",t.id=`sticky-note-${n}`;const o=["rgba(255, 251, 147, 0.95)","rgba(255, 237, 213, 0.95)","rgba(237, 255, 235, 0.95)","rgba(235, 245, 255, 0.95)","rgba(255, 235, 255, 0.95)","rgba(255, 243, 205, 0.95)","rgba(243, 235, 255, 0.95)"],i=o[Math.floor(Math.random()*o.length)];t.innerHTML=`
    <div class="sticky-note-header">
      <span class="note-title">Sticky Note...</span>
      <div class="note-controls">
        <button class="note-control-btn pin-btn" title="Pin note (always on top)">📌</button>
        <button class="note-control-btn minimize-btn" title="Minimize">−</button>
        <button class="note-control-btn close-btn" title="Close">×</button>
      </div>
    </div>
    <textarea class="sticky-note-textarea" placeholder="Write your note here...">${e}</textarea>
    <div class="note-resize-handle"></div>
  `,t.style.background=i;const r=(Math.random()-.5)*4;t.style.setProperty("--note-rotation",`${r}deg`),document.body.appendChild(t);const d=document.getElementById("sticky-note-widget");if(d){const m=d.getBoundingClientRect();t.style.left=Math.max(20,m.left-320)+"px",t.style.top=Math.max(20,m.top)+"px"}else t.style.left="100px",t.style.top="100px";return setTimeout(()=>t.classList.add("open"),10),ne(t),t}function ne(e,n){const t=e.querySelector(".sticky-note-header"),o=e.querySelector(".sticky-note-textarea"),i=e.querySelector(".close-btn"),r=e.querySelector(".minimize-btn"),d=e.querySelector(".pin-btn"),m=e.querySelector(".note-resize-handle");let T=!1,M=!1,s={x:0,y:0},l=!1,p=!1,g;o.addEventListener("input",()=>{clearTimeout(g),g=setTimeout(()=>{se(o.value.trim())},1e3)}),t.addEventListener("mousedown",b=>{if(b.target.classList.contains("note-control-btn"))return;T=!0;const x=e.getBoundingClientRect();s.x=b.clientX-x.left,s.y=b.clientY-x.top,document.body.style.cursor="grabbing",e.style.transition="none",e.style.userSelect="none",document.addEventListener("mousemove",f),document.addEventListener("mouseup",u),b.preventDefault()});function f(b){if(!T)return;const x=b.clientX-s.x,L=b.clientY-s.y,y=10,z=window.innerWidth-e.offsetWidth-y,fe=window.innerHeight-e.offsetHeight-y,xe=Math.max(y,Math.min(z,x)),ye=Math.max(y,Math.min(fe,L));e.style.left=xe+"px",e.style.top=ye+"px"}function u(){T=!1,document.body.style.cursor="",e.style.transition="all 0.3s ease",e.style.userSelect="",document.removeEventListener("mousemove",f),document.removeEventListener("mouseup",u)}m.addEventListener("mousedown",b=>{M=!0,document.addEventListener("mousemove",w),document.addEventListener("mouseup",k),b.preventDefault()});function w(b){if(!M)return;const x=e.getBoundingClientRect(),L=Math.max(200,b.clientX-x.left),y=Math.max(150,b.clientY-x.top);e.style.width=L+"px",e.style.height=y+"px"}function k(){M=!1,document.removeEventListener("mousemove",w),document.removeEventListener("mouseup",k)}i==null||i.addEventListener("click",()=>{e.classList.remove("open"),setTimeout(()=>e.remove(),300)}),r==null||r.addEventListener("click",()=>{p=!p,p?(e.classList.add("minimized"),r.textContent="+",r.title="Restore"):(e.classList.remove("minimized"),r.textContent="−",r.title="Minimize")}),d==null||d.addEventListener("click",()=>{l=!l,l?(e.classList.add("pinned"),e.style.zIndex="999999",d.classList.add("pinned"),d.title="Unpin note"):(e.classList.remove("pinned"),e.style.zIndex="999997",d.classList.remove("pinned"),d.title="Pin note (always on top)")})}function oe(){let e=document.querySelector(".notes-panel");e||(e=document.createElement("div"),e.className="notes-panel",e.innerHTML=`
      <div class="notes-header">📋 Recent Notes</div>
      <div class="notes-list" id="notes-list"></div>
    `,document.body.appendChild(e),R()),e.classList.toggle("open"),e.classList.contains("open")&&(R(),setTimeout(()=>{document.addEventListener("click",function n(t){e.contains(t.target)||(e.classList.remove("open"),document.removeEventListener("click",n))})},100))}function ie(){var t,o;const e=document.createElement("div");e.className="sticky-modal",e.innerHTML=`
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
  `,document.body.appendChild(e),setTimeout(()=>e.classList.add("open"),10);function n(){e.classList.remove("open"),setTimeout(()=>e.remove(),300)}(t=e.querySelector(".modal-close"))==null||t.addEventListener("click",n),(o=e.querySelector(".close-settings"))==null||o.addEventListener("click",n)}function V(){a&&(a.style.display="none"),document.querySelectorAll(".sticky-note").forEach(n=>{n.style.display="none"})}function _(){a&&(a.style.display="block"),document.querySelectorAll(".sticky-note").forEach(n=>{n.style.display="block"})}function G(){return!a||a.style.display==="none"?!1:window.getComputedStyle(a).display!=="none"}async function se(e){try{const t=(await c.storage.local.get("stickyNotes")).stickyNotes||[],o={id:Date.now().toString(),content:e,timestamp:new Date().toISOString(),url:window.location.href};t.unshift(o),t.length>50&&t.splice(50),await c.storage.local.set({stickyNotes:t}),console.log("Note saved successfully")}catch(n){console.error("Error saving note:",n)}}async function R(){const e=document.getElementById("notes-list");if(e)try{const t=(await c.storage.local.get("stickyNotes")).stickyNotes||[];if(t.length===0){e.innerHTML='<div style="padding: 20px; text-align: center; color: #000000; font-weight: 500;">📝 No notes yet<br><small style="color: #9929EA;">Create your first note!</small></div>';return}e.innerHTML=t.slice(0,10).map(o=>`
      <div class="note-item" data-note-id="${o.id}">
        <div class="note-preview">${o.content.substring(0,100)}${o.content.length>100?"...":""}</div>
        <div class="note-date">${new Date(o.timestamp).toLocaleDateString()}</div>
      </div>
    `).join(""),e.querySelectorAll(".note-item").forEach(o=>{o.addEventListener("click",()=>{const i=o.dataset.noteId,r=t.find(d=>d.id===i);r&&re(r)}),o.addEventListener("contextmenu",i=>{i.preventDefault();const r=o.dataset.noteId,d=t.find(m=>m.id===r);d&&ge(d)})})}catch(n){console.error("Error loading notes:",n)}}function re(e){const n=j(e.content);n.dataset.noteId=e.id;const t=n.querySelector(".note-title");t&&(t.textContent="Edit Note");const o=n.querySelector(".sticky-note-textarea");let i;o.removeEventListener("input",()=>{}),o.addEventListener("input",()=>{clearTimeout(i),i=setTimeout(async()=>{const r=o.value.trim();r&&e.id&&(await ae(e.id,r),R())},1e3)})}async function ae(e,n){try{const o=(await c.storage.local.get("stickyNotes")).stickyNotes||[],i=o.findIndex(r=>r.id===e);i!==-1&&(o[i].content=n,o[i].timestamp=new Date().toISOString(),await c.storage.local.set({stickyNotes:o}))}catch(t){console.error("Error updating note:",t)}}async function le(e){try{const o=((await c.storage.local.get("stickyNotes")).stickyNotes||[]).filter(i=>i.id!==e);await c.storage.local.set({stickyNotes:o})}catch(n){console.error("Error deleting note:",n)}}function ce(){document.addEventListener("keydown",e=>{if(e.altKey&&e.shiftKey&&(e.code==="KeyN"?(e.preventDefault(),console.log("StickyNoteAI: Alt+Shift+N pressed - Creating new note"),F()):e.code==="KeyW"&&(e.preventDefault(),console.log("StickyNoteAI: Alt+Shift+W pressed - Toggling widget visibility"),G()?V():_())),e.code==="Escape"){const n=document.querySelector(".sticky-modal.open");if(n){e.preventDefault(),n.classList.remove("open"),setTimeout(()=>n.remove(),300);return}const t=document.querySelector(".notes-panel.open");if(t){e.preventDefault(),t.classList.remove("open");return}if(Y){e.preventDefault(),C();return}}}),console.log("StickyNoteAI: Local keyboard shortcuts initialized (Alt+Shift+N, Alt+Shift+W, Esc)")}function de(){c.runtime.onMessage.addListener((e,n,t)=>{if(console.log("StickyNoteAI: Received message:",e),e.action==="toggle-widget"){console.log("StickyNoteAI: Toggle widget command received"),G()?(console.log("StickyNoteAI: Hiding widget"),V()):(console.log("StickyNoteAI: Showing widget"),_()),t({success:!0});return}if(e.action==="new-note"){F(),t({success:!0});return}if(e.action==="create-note-with-selection"){F(e.selectedText||""),t({success:!0});return}if(e.action==="toggleStealth"){const o=document.getElementById("sticky-note-widget");o&&(e.enabled?o.style.opacity="0.3":o.style.opacity="1"),t({success:!0});return}t({success:!1,error:"Unknown action"})})}async function pe(){if(!a)return;const e=a.getBoundingClientRect(),n={x:e.left,y:e.top};try{await c.storage.local.set({widgetPosition:n})}catch(t){console.error("Error saving position:",t)}}async function ue(){if(a){a.style.left="",a.style.top="",a.style.transform="";try{await c.storage.local.remove("widgetPosition")}catch(e){console.error("Error clearing position:",e)}}}function ge(e){confirm("Are you sure you want to delete this note?")&&(le(e.id),R())}function W(e,...n){}const me={debug:(...e)=>W(console.debug,...e),log:(...e)=>W(console.log,...e),warn:(...e)=>W(console.warn,...e),error:(...e)=>W(console.error,...e)},P=class P extends Event{constructor(n,t){super(P.EVENT_NAME,{}),this.newUrl=n,this.oldUrl=t}};N(P,"EVENT_NAME",U("wxt:locationchange"));let B=P;function U(e){var n;return`${(n=c==null?void 0:c.runtime)==null?void 0:n.id}:content:${e}`}function be(e){let n,t;return{run(){n==null&&(t=new URL(location.href),n=e.setInterval(()=>{let o=new URL(location.href);o.href!==t.href&&(window.dispatchEvent(new B(o,t)),t=o)},1e3))}}}const A=class A{constructor(n,t){N(this,"isTopFrame",window.self===window.top);N(this,"abortController");N(this,"locationWatcher",be(this));N(this,"receivedMessageIds",new Set);this.contentScriptName=n,this.options=t,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(n){return this.abortController.abort(n)}get isInvalid(){return c.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(n){return this.signal.addEventListener("abort",n),()=>this.signal.removeEventListener("abort",n)}block(){return new Promise(()=>{})}setInterval(n,t){const o=setInterval(()=>{this.isValid&&n()},t);return this.onInvalidated(()=>clearInterval(o)),o}setTimeout(n,t){const o=setTimeout(()=>{this.isValid&&n()},t);return this.onInvalidated(()=>clearTimeout(o)),o}requestAnimationFrame(n){const t=requestAnimationFrame((...o)=>{this.isValid&&n(...o)});return this.onInvalidated(()=>cancelAnimationFrame(t)),t}requestIdleCallback(n,t){const o=requestIdleCallback((...i)=>{this.signal.aborted||n(...i)},t);return this.onInvalidated(()=>cancelIdleCallback(o)),o}addEventListener(n,t,o,i){var r;t==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(r=n.addEventListener)==null||r.call(n,t.startsWith("wxt:")?U(t):t,o,{...i,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),me.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:A.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(n){var r,d,m;const t=((r=n.data)==null?void 0:r.type)===A.SCRIPT_STARTED_MESSAGE_TYPE,o=((d=n.data)==null?void 0:d.contentScriptName)===this.contentScriptName,i=!this.receivedMessageIds.has((m=n.data)==null?void 0:m.messageId);return t&&o&&i}listenForNewerScripts(n){let t=!0;const o=i=>{if(this.verifyScriptStartedEvent(i)){this.receivedMessageIds.add(i.data.messageId);const r=t;if(t=!1,r&&(n!=null&&n.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",o),this.onInvalidated(()=>removeEventListener("message",o))}};N(A,"SCRIPT_STARTED_MESSAGE_TYPE",U("wxt:content-script-started"));let $=A;function ke(){}function q(e,...n){}const he={debug:(...e)=>q(console.debug,...e),log:(...e)=>q(console.log,...e),warn:(...e)=>q(console.warn,...e),error:(...e)=>q(console.error,...e)};return(async()=>{try{const{main:e,...n}=Q,t=new $("content",n);return await e(t)}catch(e){throw he.error('The content script "content" crashed on startup!',e),e}})()}();
content;
