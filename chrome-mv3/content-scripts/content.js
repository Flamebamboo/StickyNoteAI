var content=function(){"use strict";var be=Object.defineProperty;var xe=(A,E,c)=>E in A?be(A,E,{enumerable:!0,configurable:!0,writable:!0,value:c}):A[E]=c;var I=(A,E,c)=>xe(A,typeof E!="symbol"?E+"":E,c);var V,j;function A(e){return e}const c=(j=(V=globalThis.browser)==null?void 0:V.runtime)!=null&&j.id?globalThis.browser:globalThis.chrome,_={matches:["<all_urls>"],main(){console.log("🎯 StickyNoteAI v2.2 CSS FIXED + MENU POSITIONING - Loading..."),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{H()}):H()}};let r=null,y=!1,R=!1,z={x:0,y:0},S={x:0,y:0},b=null;function H(){console.log("StickyNoteAI: DOM ready, creating widget..."),K(),de(),ae(),le()}function K(){const e=document.getElementById("sticky-note-widget");e&&e.remove(),r=document.createElement("div"),r.id="sticky-note-widget";let t,n;try{t=c.runtime.getURL("smilyface.gif"),n=c.runtime.getURL("add2.png")}catch(u){console.warn("browser.runtime.getURL failed, using fallback approach:",u);const x=c.runtime.id||chrome.runtime.id;t=`chrome-extension://${x}/smilyface.gif`,n=`chrome-extension://${x}/add2.png`}console.log("StickyNoteAI: Image URLs:",{smilyFaceUrl:t,add2Url:n}),console.log("StickyNoteAI: Extension ID:",c.runtime.id),console.log("StickyNoteAI: Chrome runtime ID:",chrome.runtime.id),r.innerHTML=`
    <div class="widget-container">
      <div class="widget-main-button" id="main-button">
        <img src="${t}" alt="Widget" style="width: 24px; height: 24px;" id="smiley-image">
      </div>
      <div class="widget-menu" id="widget-menu">
        <div class="menu-button add-button" data-action="add">
          <img src="${n}" alt="Add" style="width: 20px; height: 20px;" id="add-image">
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
  `,document.head.appendChild(o),document.body.appendChild(r);const i=document.getElementById("smiley-image"),a=document.getElementById("add-image");i&&(i.addEventListener("load",()=>{console.log("✅ Smiley face image loaded successfully")}),i.addEventListener("error",()=>{console.error("❌ Failed to load smiley face image:",t),i.style.display="none"})),a&&(a.addEventListener("load",()=>{console.log("✅ Add2 image loaded successfully")}),a.addEventListener("error",()=>{console.error("❌ Failed to load add2 image:",n),a.style.display="none"})),J()}function J(){const e=document.getElementById("main-button"),t=document.getElementById("widget-menu");if(!e||!t)return;let n=0,o={x:0,y:0},i=!1;function a(s,l){if(!r)return{x:s,y:l};const d={width:50,height:50},m=window.innerWidth,f=window.innerHeight,p=10;let w=Math.max(p,s);w=Math.min(m-d.width-p,w);let k=Math.max(p,l);return k=Math.min(f-d.height-p,k),{x:w,y:k}}function u(s,l){if(!r)return{x:s,y:l};const d={width:50,height:50},m=window.innerWidth,f=window.innerHeight,p=20,w=s,k=m-(s+d.width),C=l,g=f-(l+d.height),h=Math.min(w,k,C,g);let L=s,N=l;return(s<0||s+d.width>m||l<0||l+d.height>f)&&(h===w?L=p:h===k?L=m-d.width-p:h===C?N=p:h===g&&(N=f-d.height-p)),{x:L,y:N}}e.addEventListener("mousedown",s=>{s.preventDefault(),n=Date.now(),o={x:s.clientX,y:s.clientY},i=!1;const l=r.getBoundingClientRect();z.x=s.clientX-l.left,z.y=s.clientY-l.top,e.classList.add("dragging"),document.addEventListener("mousemove",x),document.addEventListener("mouseup",v)}),e.addEventListener("mouseenter",()=>{y||(b&&(clearTimeout(b),b=null),U())}),t.addEventListener("mouseenter",()=>{b&&(clearTimeout(b),b=null)}),t.addEventListener("mouseleave",()=>{y||(b=setTimeout(()=>{T(),b=null},100))}),e.addEventListener("mouseleave",s=>{if(!y){const l=t.getBoundingClientRect(),d=s.clientX,m=s.clientY;d>=l.left-10&&d<=l.right+10&&m>=l.top-10&&m<=l.bottom+10||(b=setTimeout(()=>{T(),b=null},100))}});function x(s){const l=Date.now()-n,d=Math.sqrt(Math.pow(s.clientX-o.x,2)+Math.pow(s.clientY-o.y,2));if(!y&&(d>3||l>100)&&(y=!0,i=!0,T(),document.body.style.cursor="grabbing"),y){const m=s.clientX-z.x,f=s.clientY-z.y,p=a(m,f);r.style.transform=`translate(${p.x}px, ${p.y}px)`,r.style.left="0",r.style.top="0",S={x:p.x,y:p.y}}}function v(){if(document.removeEventListener("mousemove",x),document.removeEventListener("mouseup",v),e&&e.classList.remove("dragging"),document.body.style.cursor="",y){const s=u(S.x,S.y);s.x!==S.x||s.y!==S.y?(r.style.transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",r.style.left=s.x+"px",r.style.top=s.y+"px",r.style.transform="",setTimeout(()=>{r&&(r.style.transition="")},300),S=s):(r.style.left=S.x+"px",r.style.top=S.y+"px",r.style.transform=""),ce()}y=!1,setTimeout(()=>{i||U()},50)}t==null||t.addEventListener("click",s=>{const d=s.target.dataset.action;d&&(Q(d),T())})}function U(){if(y)return;const e=document.getElementById("widget-menu");e&&(e.classList.add("open"),R=!0)}function T(){const e=document.getElementById("widget-menu");e&&(e.classList.remove("open"),R=!1),b&&(clearTimeout(b),b=null)}function Q(e){switch(e){case"add":D();break;case"notes":te();break;case"settings":ne();break}}function D(e=""){Z(e)}function Z(e=""){const t=Date.now().toString(),n=document.createElement("div");n.className="sticky-note",n.id=`sticky-note-${t}`,n.innerHTML=`
    <div class="sticky-note-header">
      <span class="note-title">Sticky Note...</span>
      <div class="note-controls">
        <button class="note-control-btn pin-btn" title="Pin/Unpin">📌</button>
        <button class="note-control-btn minimize-btn" title="Minimize">−</button>
        <button class="note-control-btn close-btn" title="Close">×</button>
      </div>
    </div>
    <textarea class="sticky-note-textarea" placeholder="Write your note here...">${e}</textarea>
    <div class="note-resize-handle"></div>
  `,document.body.appendChild(n);const o=document.getElementById("sticky-note-widget");if(o){const i=o.getBoundingClientRect();n.style.left=Math.max(20,i.left-320)+"px",n.style.top=Math.max(20,i.top)+"px"}else n.style.left="100px",n.style.top="100px";return setTimeout(()=>n.classList.add("open"),10),ee(n),n}function ee(e,t){const n=e.querySelector(".sticky-note-header"),o=e.querySelector(".sticky-note-textarea"),i=e.querySelector(".close-btn"),a=e.querySelector(".minimize-btn"),u=e.querySelector(".pin-btn"),x=e.querySelector(".note-resize-handle");let v=!1,s=!1,l={x:0,y:0},d=!1,m=!1,f;o.addEventListener("input",()=>{clearTimeout(f),f=setTimeout(()=>{oe(o.value.trim())},1e3)}),n.addEventListener("mousedown",g=>{if(g.target.classList.contains("note-control-btn"))return;v=!0;const h=e.getBoundingClientRect();l.x=g.clientX-h.left,l.y=g.clientY-h.top,document.addEventListener("mousemove",p),document.addEventListener("mouseup",w),g.preventDefault()});function p(g){if(!v)return;const h=g.clientX-l.x,L=g.clientY-l.y,N=window.innerWidth-e.offsetWidth,me=window.innerHeight-e.offsetHeight;e.style.left=Math.max(0,Math.min(N,h))+"px",e.style.top=Math.max(0,Math.min(me,L))+"px"}function w(){v=!1,document.removeEventListener("mousemove",p),document.removeEventListener("mouseup",w)}x.addEventListener("mousedown",g=>{s=!0,document.addEventListener("mousemove",k),document.addEventListener("mouseup",C),g.preventDefault()});function k(g){if(!s)return;const h=e.getBoundingClientRect(),L=Math.max(200,g.clientX-h.left),N=Math.max(150,g.clientY-h.top);e.style.width=L+"px",e.style.height=N+"px"}function C(){s=!1,document.removeEventListener("mousemove",k),document.removeEventListener("mouseup",C)}i==null||i.addEventListener("click",()=>{e.classList.remove("open"),setTimeout(()=>e.remove(),300)}),a==null||a.addEventListener("click",()=>{m=!m,m?(e.classList.add("minimized"),a.textContent="+",a.title="Restore"):(e.classList.remove("minimized"),a.textContent="−",a.title="Minimize")}),u==null||u.addEventListener("click",()=>{d=!d,d?(e.classList.add("pinned"),u.style.background="#4CAF50"):(e.classList.remove("pinned"),u.style.background="")})}function te(){let e=document.querySelector(".notes-panel");e||(e=document.createElement("div"),e.className="notes-panel",e.innerHTML=`
      <div class="notes-header">📋 Recent Notes</div>
      <div class="notes-list" id="notes-list"></div>
    `,document.body.appendChild(e),F()),e.classList.toggle("open"),e.classList.contains("open")&&(F(),setTimeout(()=>{document.addEventListener("click",function t(n){e.contains(n.target)||(e.classList.remove("open"),document.removeEventListener("click",t))})},100))}function ne(){var n,o;const e=document.createElement("div");e.className="sticky-modal",e.innerHTML=`
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
  `,document.body.appendChild(e),setTimeout(()=>e.classList.add("open"),10);function t(){e.classList.remove("open"),setTimeout(()=>e.remove(),300)}(n=e.querySelector(".modal-close"))==null||n.addEventListener("click",t),(o=e.querySelector(".close-settings"))==null||o.addEventListener("click",t)}function X(){r&&(r.style.display="none"),document.querySelectorAll(".sticky-note").forEach(t=>{t.style.display="none"})}function O(){r&&(r.style.display="block"),document.querySelectorAll(".sticky-note").forEach(t=>{t.style.display="block"})}function G(){return!r||r.style.display==="none"?!1:window.getComputedStyle(r).display!=="none"}async function oe(e){try{const n=(await c.storage.local.get("stickyNotes")).stickyNotes||[],o={id:Date.now().toString(),content:e,timestamp:new Date().toISOString(),url:window.location.href};n.unshift(o),n.length>50&&n.splice(50),await c.storage.local.set({stickyNotes:n}),console.log("Note saved successfully")}catch(t){console.error("Error saving note:",t)}}async function F(){const e=document.getElementById("notes-list");if(e)try{const n=(await c.storage.local.get("stickyNotes")).stickyNotes||[];if(n.length===0){e.innerHTML='<div style="padding: 20px; text-align: center; color: #000000; font-weight: 500;">📝 No notes yet<br><small style="color: #9929EA;">Create your first note!</small></div>';return}e.innerHTML=n.slice(0,10).map(o=>`
      <div class="note-item" data-note-id="${o.id}">
        <div class="note-preview">${o.content.substring(0,100)}${o.content.length>100?"...":""}</div>
        <div class="note-date">${new Date(o.timestamp).toLocaleDateString()}</div>
      </div>
    `).join(""),e.querySelectorAll(".note-item").forEach(o=>{o.addEventListener("click",()=>{const i=o.dataset.noteId,a=n.find(u=>u.id===i);a&&ie(a)})})}catch(t){console.error("Error loading notes:",t)}}function ie(e){var i,a,u,x;const t=document.createElement("div");t.className="sticky-modal",t.innerHTML=`
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">✏️ Edit Note</h3>
        <button class="modal-close">×</button>
      </div>
      <textarea class="note-input" autofocus>${e.content}</textarea>
      <div class="button-group">
        <button class="btn btn-primary update-note">💾 Update Note</button>
        <button class="btn" style="background: #dc3545; color: white;" id="delete-note">🗑️ Delete</button>
        <button class="btn btn-secondary cancel-edit">Cancel</button>
      </div>
    </div>
  `,document.body.appendChild(t),setTimeout(()=>t.classList.add("open"),10);const n=t.querySelector(".note-input");function o(){t.classList.remove("open"),setTimeout(()=>t.remove(),300)}(i=t.querySelector(".modal-close"))==null||i.addEventListener("click",o),(a=t.querySelector(".cancel-edit"))==null||a.addEventListener("click",o),(u=t.querySelector(".update-note"))==null||u.addEventListener("click",async()=>{const v=n.value.trim();v&&(await se(e.id,v),F(),o())}),(x=t.querySelector("#delete-note"))==null||x.addEventListener("click",async()=>{confirm("Are you sure you want to delete this note?")&&(await re(e.id),F(),o())})}async function se(e,t){try{const o=(await c.storage.local.get("stickyNotes")).stickyNotes||[],i=o.findIndex(a=>a.id===e);i!==-1&&(o[i].content=t,o[i].timestamp=new Date().toISOString(),await c.storage.local.set({stickyNotes:o}))}catch(n){console.error("Error updating note:",n)}}async function re(e){try{const o=((await c.storage.local.get("stickyNotes")).stickyNotes||[]).filter(i=>i.id!==e);await c.storage.local.set({stickyNotes:o})}catch(t){console.error("Error deleting note:",t)}}function ae(){document.addEventListener("keydown",e=>{if(e.altKey&&e.shiftKey&&(e.code==="KeyN"?(e.preventDefault(),console.log("StickyNoteAI: Alt+Shift+N pressed - Creating new note"),D()):e.code==="KeyW"&&(e.preventDefault(),console.log("StickyNoteAI: Alt+Shift+W pressed - Toggling widget visibility"),G()?X():O())),e.code==="Escape"){const t=document.querySelector(".sticky-modal.open");if(t){e.preventDefault(),t.classList.remove("open"),setTimeout(()=>t.remove(),300);return}const n=document.querySelector(".notes-panel.open");if(n){e.preventDefault(),n.classList.remove("open");return}if(R){e.preventDefault(),T();return}}}),console.log("StickyNoteAI: Local keyboard shortcuts initialized (Alt+Shift+N, Alt+Shift+W, Esc)")}function le(){c.runtime.onMessage.addListener((e,t,n)=>{if(console.log("StickyNoteAI: Received message:",e),e.action==="toggle-widget"){console.log("StickyNoteAI: Toggle widget command received"),G()?(console.log("StickyNoteAI: Hiding widget"),X()):(console.log("StickyNoteAI: Showing widget"),O()),n({success:!0});return}if(e.action==="new-note"){D(),n({success:!0});return}if(e.action==="create-note-with-selection"){D(e.selectedText||""),n({success:!0});return}if(e.action==="toggleStealth"){const o=document.getElementById("sticky-note-widget");o&&(e.enabled?o.style.opacity="0.3":o.style.opacity="1"),n({success:!0});return}n({success:!1,error:"Unknown action"})})}async function ce(){if(!r)return;const e=r.getBoundingClientRect(),t={x:e.left,y:e.top};try{await c.storage.local.set({widgetPosition:t})}catch(n){console.error("Error saving position:",n)}}async function de(){if(r){r.style.left="",r.style.top="",r.style.transform="";try{await c.storage.local.remove("widgetPosition")}catch(e){console.error("Error clearing position:",e)}}}function B(e,...t){}const ue={debug:(...e)=>B(console.debug,...e),log:(...e)=>B(console.log,...e),warn:(...e)=>B(console.warn,...e),error:(...e)=>B(console.error,...e)},W=class W extends Event{constructor(t,n){super(W.EVENT_NAME,{}),this.newUrl=t,this.oldUrl=n}};I(W,"EVENT_NAME",Y("wxt:locationchange"));let P=W;function Y(e){var t;return`${(t=c==null?void 0:c.runtime)==null?void 0:t.id}:content:${e}`}function pe(e){let t,n;return{run(){t==null&&(n=new URL(location.href),t=e.setInterval(()=>{let o=new URL(location.href);o.href!==n.href&&(window.dispatchEvent(new P(o,n)),n=o)},1e3))}}}const M=class M{constructor(t,n){I(this,"isTopFrame",window.self===window.top);I(this,"abortController");I(this,"locationWatcher",pe(this));I(this,"receivedMessageIds",new Set);this.contentScriptName=t,this.options=n,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(t){return this.abortController.abort(t)}get isInvalid(){return c.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(t){return this.signal.addEventListener("abort",t),()=>this.signal.removeEventListener("abort",t)}block(){return new Promise(()=>{})}setInterval(t,n){const o=setInterval(()=>{this.isValid&&t()},n);return this.onInvalidated(()=>clearInterval(o)),o}setTimeout(t,n){const o=setTimeout(()=>{this.isValid&&t()},n);return this.onInvalidated(()=>clearTimeout(o)),o}requestAnimationFrame(t){const n=requestAnimationFrame((...o)=>{this.isValid&&t(...o)});return this.onInvalidated(()=>cancelAnimationFrame(n)),n}requestIdleCallback(t,n){const o=requestIdleCallback((...i)=>{this.signal.aborted||t(...i)},n);return this.onInvalidated(()=>cancelIdleCallback(o)),o}addEventListener(t,n,o,i){var a;n==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(a=t.addEventListener)==null||a.call(t,n.startsWith("wxt:")?Y(n):n,o,{...i,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),ue.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:M.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(t){var a,u,x;const n=((a=t.data)==null?void 0:a.type)===M.SCRIPT_STARTED_MESSAGE_TYPE,o=((u=t.data)==null?void 0:u.contentScriptName)===this.contentScriptName,i=!this.receivedMessageIds.has((x=t.data)==null?void 0:x.messageId);return n&&o&&i}listenForNewerScripts(t){let n=!0;const o=i=>{if(this.verifyScriptStartedEvent(i)){this.receivedMessageIds.add(i.data.messageId);const a=n;if(n=!1,a&&(t!=null&&t.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",o),this.onInvalidated(()=>removeEventListener("message",o))}};I(M,"SCRIPT_STARTED_MESSAGE_TYPE",Y("wxt:content-script-started"));let $=M;function he(){}function q(e,...t){}const ge={debug:(...e)=>q(console.debug,...e),log:(...e)=>q(console.log,...e),warn:(...e)=>q(console.warn,...e),error:(...e)=>q(console.error,...e)};return(async()=>{try{const{main:e,...t}=_,n=new $("content",t);return await e(n)}catch(e){throw ge.error('The content script "content" crashed on startup!',e),e}})()}();
content;
