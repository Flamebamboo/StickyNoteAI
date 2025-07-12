var content=function(){"use strict";var j=Object.defineProperty;var V=(b,g,a)=>g in b?j(b,g,{enumerable:!0,configurable:!0,writable:!0,value:a}):b[g]=a;var m=(b,g,a)=>V(b,typeof g!="symbol"?g+"":g,a);var z,T;function b(t){return t}const a=(T=(z=globalThis.browser)==null?void 0:z.runtime)!=null&&T.id?globalThis.browser:globalThis.chrome,M={matches:["<all_urls>"],main(){console.log("StickyNoteAI: Initializing..."),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{I()}):I()}};function I(){console.log("StickyNoteAI: DOM ready, creating widget..."),console.log("StickyNoteAI: Content script is running on:",window.location.href),E(),setTimeout(()=>{P(),N()},100),a.runtime.onMessage.addListener((t,e,o)=>{if(console.log("StickyNoteAI: Received message:",t),t.action==="toggle-widget"){const n=document.getElementById("sticky-note-widget");n&&(n.style.display=n.style.display==="none"?"block":"none",console.log("StickyNoteAI: Widget toggled via command"))}else t.action==="new-note"&&(w(),console.log("StickyNoteAI: Note editor opened via command"));o({success:!0})})}function E(){if(console.log("StickyNoteAI: Creating floating widget..."),document.getElementById("sticky-note-widget")){console.log("StickyNoteAI: Widget already exists");return}if(!document.body){console.log("StickyNoteAI: document.body not available, retrying..."),setTimeout(()=>E(),100);return}const t=document.createElement("div");t.id="sticky-note-widget",t.style.cssText=`
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    width: 280px !important;
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
    z-index: 999999 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 14px !important;
    cursor: move !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    overflow: hidden !important;
  `,t.innerHTML=`
    <div class="widget-header" style="
      display: flex; 
      align-items: center; 
      padding: 16px 20px; 
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); 
      border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
      gap: 12px;
      backdrop-filter: blur(10px);
    ">
      <span class="widget-icon" style="font-size: 18px; flex: 1; color: #6366f1; filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.3));">✨</span>
      <button class="btn-add" title="Add Note" style="
        background: linear-gradient(135deg, #10b981, #059669); 
        border: none; 
        padding: 8px 12px; 
        border-radius: 8px; 
        cursor: pointer; 
        font-size: 12px; 
        font-weight: 600; 
        color: white;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        transition: all 0.2s ease;
      ">+ Add</button>
      <button class="btn-menu" title="Menu" style="
        background: rgba(255, 255, 255, 0.1); 
        border: 1px solid rgba(255, 255, 255, 0.2); 
        padding: 8px; 
        border-radius: 8px; 
        cursor: pointer; 
        font-size: 14px; 
        font-weight: bold; 
        color: #64748b;
        transition: all 0.2s ease;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">≡</button>
      <button class="btn-hide" title="Hide" style="
        background: rgba(255, 255, 255, 0.1); 
        border: 1px solid rgba(255, 255, 255, 0.2); 
        padding: 8px; 
        border-radius: 8px; 
        cursor: pointer; 
        font-size: 14px; 
        font-weight: bold; 
        color: #ef4444;
        transition: all 0.2s ease;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    </div>
    <div class="widget-body" style="
      display: none; 
      padding: 20px; 
      max-height: 400px; 
      overflow-y: auto;
      background: rgba(255, 255, 255, 0.05);
    ">
      <div class="notes-list" style="display: flex; flex-direction: column; gap: 12px;">
        <div class="no-notes" style="
          color: #64748b; 
          font-style: italic; 
          text-align: center; 
          padding: 32px 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px dashed rgba(255, 255, 255, 0.2);
        ">
          <div style="font-size: 24px; margin-bottom: 8px;">📝</div>
          <div style="font-size: 13px; color: #94a3b8;">No notes yet</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Click + Add to create your first note</div>
        </div>
      </div>
    </div>
  `,A(),C(t),B(t),document.body.appendChild(t),console.log("StickyNoteAI: Widget created successfully and added to DOM"),t.style.display="block",t.style.visibility="visible";const e=document.getElementById("sticky-note-widget");e?(console.log("StickyNoteAI: Widget verification successful"),console.log("Widget position:",e.style.top,e.style.right)):console.error("StickyNoteAI: Widget verification failed!")}function A(){if(document.getElementById("sticky-note-styles"))return;const t=document.createElement("style");t.id="sticky-note-styles",t.textContent=`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    #sticky-note-widget {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }

    #sticky-note-widget:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
    }

    #sticky-note-widget .btn-add:hover {
      background: linear-gradient(135deg, #059669, #047857) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
    }

    #sticky-note-widget .btn-menu:hover,
    #sticky-note-widget .btn-hide:hover {
      background: rgba(255, 255, 255, 0.2) !important;
      transform: translateY(-1px) !important;
    }

    #sticky-note-widget .note-item {
      background: rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(10px) !important;
      padding: 16px !important;
      border-radius: 12px !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      cursor: pointer !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      position: relative !important;
      overflow: hidden !important;
    }

    #sticky-note-widget .note-item:before {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 3px !important;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899) !important;
      opacity: 0 !important;
      transition: opacity 0.3s ease !important;
    }

    #sticky-note-widget .note-item:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      transform: translateY(-2px) scale(1.02) !important;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
    }

    #sticky-note-widget .note-item:hover:before {
      opacity: 1 !important;
    }

    #sticky-note-widget .note-title {
      font-weight: 600 !important;
      margin-bottom: 8px !important;
      color: #1e293b !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
    }

    #sticky-note-widget .note-preview {
      color: #64748b !important;
      font-size: 12px !important;
      line-height: 1.5 !important;
      overflow: hidden !important;
      display: -webkit-box !important;
      -webkit-line-clamp: 2 !important;
      -webkit-box-orient: vertical !important;
    }

    #sticky-note-widget .note-meta {
      margin-top: 8px !important;
      font-size: 10px !important;
      color: #94a3b8 !important;
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
    }

    #sticky-note-widget .note-meta:before {
      content: '📅' !important;
      font-size: 8px !important;
    }

    /* Stealth mode - ultra minimal */
    #sticky-note-widget.stealth {
      opacity: 0.1 !important;
      transform: scale(0.85) !important;
      transition: all 0.3s ease !important;
    }

    #sticky-note-widget.stealth:hover {
      opacity: 0.9 !important;
      transform: scale(1) translateY(-2px) !important;
    }

    /* Minimized state */
    #sticky-note-widget.minimized {
      width: 64px !important;
      height: 64px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9)) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    #sticky-note-widget.minimized .widget-header {
      border: none !important;
      background: none !important;
      padding: 0 !important;
      justify-content: center !important;
    }

    #sticky-note-widget.minimized .widget-icon {
      font-size: 24px !important;
      color: white !important;
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5)) !important;
    }

    #sticky-note-widget.minimized .widget-body,
    #sticky-note-widget.minimized .btn-menu,
    #sticky-note-widget.minimized .btn-add,
    #sticky-note-widget.minimized .btn-hide {
      display: none !important;
    }

    /* Animations */
    @keyframes noteSlideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    #sticky-note-widget .note-item {
      animation: noteSlideIn 0.3s ease-out !important;
    }

    /* Scrollbar styling */
    #sticky-note-widget .widget-body::-webkit-scrollbar {
      width: 4px !important;
    }

    #sticky-note-widget .widget-body::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1) !important;
      border-radius: 2px !important;
    }

    #sticky-note-widget .widget-body::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3) !important;
      border-radius: 2px !important;
    }

    #sticky-note-widget .widget-body::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5) !important;
    }
  `,document.head.appendChild(t)}function C(t){let e=!1,o=0,n=0,i=0,r=0;const s=t.querySelector(".widget-header");s.addEventListener("mousedown",c),document.addEventListener("mousemove",d),document.addEventListener("mouseup",l);function c(p){p.target.tagName!=="BUTTON"&&(i=p.clientX-o,r=p.clientY-n,(p.target===s||s.contains(p.target))&&(e=!0,t.style.cursor="grabbing"))}function d(p){if(e){p.preventDefault(),o=p.clientX-i,n=p.clientY-r;const L=t.getBoundingClientRect(),$=window.innerWidth-L.width,O=window.innerHeight-L.height;o=Math.max(0,Math.min(o,$)),n=Math.max(0,Math.min(n,O)),t.style.left=o+"px",t.style.top=n+"px",t.style.right="auto"}}function l(){e=!1,t.style.cursor="move",W(o,n)}}function B(t){const e=t.querySelector(".btn-add"),o=t.querySelector(".btn-menu"),n=t.querySelector(".btn-hide"),i=t.querySelector(".widget-body");e.addEventListener("click",r=>{r.stopPropagation(),w()}),o.addEventListener("click",r=>{r.stopPropagation();const s=i.style.display!=="none";i.style.display=s?"none":"block",o.textContent=s?"≡":"×"}),n.addEventListener("click",r=>{r.stopPropagation(),t.classList.toggle("minimized")}),t.addEventListener("dblclick",()=>{t.classList.toggle("minimized")}),document.addEventListener("keydown",r=>{const c=navigator.platform.toUpperCase().indexOf("MAC")>=0?r.metaKey:r.ctrlKey;c&&r.shiftKey&&r.key==="W"&&(r.preventDefault(),t.style.display=t.style.display==="none"?"block":"none"),c&&r.shiftKey&&r.key==="S"&&(r.preventDefault(),w())})}function w(){if(document.getElementById("note-editor-modal"))return;const t=document.createElement("div");t.id="note-editor-modal",t.innerHTML=`
    <div class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Create Note</h3>
          <div class="auto-save-indicator">Draft saved</div>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <input type="text" placeholder="Give your note a title..." class="note-title-input">
          <textarea placeholder="Start writing your thoughts here...

💡 Tips:
• Use markdown for formatting
• Notes auto-save as you type
• Press Esc to close quickly" class="note-content-input"></textarea>
          <div class="modal-actions">
            <button class="btn-cancel">Cancel</button>
            <button class="btn-save">Save Note</button>
          </div>
        </div>
      </div>
    </div>
  `,F(),q(t),document.body.appendChild(t),t.querySelector(".note-title-input").focus()}function F(){if(document.getElementById("note-modal-styles"))return;const t=document.createElement("style");t.id="note-modal-styles",t.textContent=`
    #note-editor-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999999;
      animation: modalFadeIn 0.3s ease-out;
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-backdrop {
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-content {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow: hidden;
      animation: modalSlideIn 0.3s ease-out;
    }

    .modal-header {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
      padding: 24px 28px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-header h3:before {
      content: '✨';
      font-size: 18px;
      filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.3));
    }

    .modal-close {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 20px;
      cursor: pointer;
      color: #64748b;
      padding: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;
      transform: scale(1.05);
    }

    .modal-body {
      padding: 28px;
    }

    .note-title-input {
      width: 100%;
      padding: 16px 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(10px);
      color: #1e293b;
      transition: all 0.2s ease;
      outline: none;
    }

    .note-title-input:focus {
      border-color: rgba(99, 102, 241, 0.5);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      background: rgba(255, 255, 255, 0.8);
    }

    .note-title-input::placeholder {
      color: #94a3b8;
    }

    .note-content-input {
      width: 100%;
      min-height: 180px;
      padding: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.6;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(10px);
      color: #1e293b;
      resize: vertical;
      margin-bottom: 24px;
      transition: all 0.2s ease;
      outline: none;
    }

    .note-content-input:focus {
      border-color: rgba(99, 102, 241, 0.5);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      background: rgba(255, 255, 255, 0.8);
    }

    .note-content-input::placeholder {
      color: #94a3b8;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .modal-actions button {
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 100px;
      justify-content: center;
    }

    .btn-save {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-save:hover {
      background: linear-gradient(135deg, #059669, #047857);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-save:before {
      content: '💾';
      font-size: 12px;
    }

    .btn-cancel {
      background: rgba(255, 255, 255, 0.1);
      color: #64748b;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .btn-cancel:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      color: #475569;
      transform: translateY(-1px);
    }

    .btn-cancel:before {
      content: '✕';
      font-size: 10px;
    }

    /* Auto-save indicator */
    .auto-save-indicator {
      position: absolute;
      top: 24px;
      right: 80px;
      padding: 6px 12px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 20px;
      font-size: 11px;
      color: #059669;
      font-weight: 500;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .auto-save-indicator.show {
      opacity: 1;
    }

    .auto-save-indicator:before {
      content: '💾';
      margin-right: 4px;
      font-size: 10px;
    }
  `,document.head.appendChild(t)}function q(t){const e=t.querySelector(".modal-close"),o=t.querySelector(".btn-save"),n=t.querySelector(".btn-cancel"),i=t.querySelector(".note-title-input"),r=t.querySelector(".note-content-input");e.addEventListener("click",()=>u(t)),n.addEventListener("click",()=>u(t)),o.addEventListener("click",()=>{const d=i.value.trim()||"Untitled Note",l=r.value.trim();l&&(D(d,l),u(t))}),t.addEventListener("click",d=>{d.target===t.querySelector(".modal-backdrop")&&u(t)}),document.addEventListener("keydown",d=>{d.key==="Escape"&&u(t)});let s;const c=()=>{clearTimeout(s),s=window.setTimeout(()=>{const d=i.value.trim()||"Draft",l=r.value.trim();l&&a.storage.local.set({"sticky-note-draft":{title:d,content:l}})},2e3)};i.addEventListener("input",c),r.addEventListener("input",c),a.storage.local.get("sticky-note-draft",d=>{const l=d["sticky-note-draft"];l&&(i.value=l.title,r.value=l.content)})}function u(t){t.remove(),a.storage.local.remove("sticky-note-draft")}function D(t,e){a.storage.local.get("sticky-notes",o=>{const n=o["sticky-notes"]||[],i={id:Date.now().toString(),title:t,content:e,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};n.push(i),a.storage.local.set({"sticky-notes":n},()=>{console.log("Note saved:",i),N()})})}function N(){const t=document.getElementById("sticky-note-widget");if(!t){console.error("Widget does not exist in the DOM.");return}const e=t.querySelector(".notes-list");a.storage.local.get("sticky-notes",o=>{const n=o["sticky-notes"]||[];if(n.length===0){e.innerHTML='<div class="no-notes">No notes yet. Click + to add one!</div>';return}e.innerHTML=n.map(i=>`
      <div class="note-item" data-note-id="${i.id}">
        <div class="note-title">${i.title}</div>
        <div class="note-preview">${i.content.substring(0,50)}${i.content.length>50?"...":""}</div>
      </div>
    `).join(""),e.querySelectorAll(".note-item").forEach(i=>{i.addEventListener("click",r=>{const s=r.currentTarget.dataset.noteId;console.log("Clicked note:",s)})})})}function W(t,e){a.storage.local.set({"sticky-settings":{widgetPosition:{x:t,y:e}}})}function P(){try{a.storage.local.get("sticky-settings",t=>{const e=t["sticky-settings"];if(e&&e.widgetPosition){const{x:o,y:n}=e.widgetPosition,i=document.getElementById("sticky-note-widget");i&&(i.style.left=o+"px",i.style.top=n+"px",i.style.right="auto")}})}catch(t){console.error("Failed to load widget position:",t)}}function f(t,...e){}const Y={debug:(...t)=>f(console.debug,...t),log:(...t)=>f(console.log,...t),warn:(...t)=>f(console.warn,...t),error:(...t)=>f(console.error,...t)},x=class x extends Event{constructor(e,o){super(x.EVENT_NAME,{}),this.newUrl=e,this.oldUrl=o}};m(x,"EVENT_NAME",k("wxt:locationchange"));let v=x;function k(t){var e;return`${(e=a==null?void 0:a.runtime)==null?void 0:e.id}:content:${t}`}function U(t){let e,o;return{run(){e==null&&(o=new URL(location.href),e=t.setInterval(()=>{let n=new URL(location.href);n.href!==o.href&&(window.dispatchEvent(new v(n,o)),o=n)},1e3))}}}const y=class y{constructor(e,o){m(this,"isTopFrame",window.self===window.top);m(this,"abortController");m(this,"locationWatcher",U(this));m(this,"receivedMessageIds",new Set);this.contentScriptName=e,this.options=o,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return a.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener("abort",e),()=>this.signal.removeEventListener("abort",e)}block(){return new Promise(()=>{})}setInterval(e,o){const n=setInterval(()=>{this.isValid&&e()},o);return this.onInvalidated(()=>clearInterval(n)),n}setTimeout(e,o){const n=setTimeout(()=>{this.isValid&&e()},o);return this.onInvalidated(()=>clearTimeout(n)),n}requestAnimationFrame(e){const o=requestAnimationFrame((...n)=>{this.isValid&&e(...n)});return this.onInvalidated(()=>cancelAnimationFrame(o)),o}requestIdleCallback(e,o){const n=requestIdleCallback((...i)=>{this.signal.aborted||e(...i)},o);return this.onInvalidated(()=>cancelIdleCallback(n)),n}addEventListener(e,o,n,i){var r;o==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(r=e.addEventListener)==null||r.call(e,o.startsWith("wxt:")?k(o):o,n,{...i,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),Y.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:y.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(e){var r,s,c;const o=((r=e.data)==null?void 0:r.type)===y.SCRIPT_STARTED_MESSAGE_TYPE,n=((s=e.data)==null?void 0:s.contentScriptName)===this.contentScriptName,i=!this.receivedMessageIds.has((c=e.data)==null?void 0:c.messageId);return o&&n&&i}listenForNewerScripts(e){let o=!0;const n=i=>{if(this.verifyScriptStartedEvent(i)){this.receivedMessageIds.add(i.data.messageId);const r=o;if(o=!1,r&&(e!=null&&e.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",n),this.onInvalidated(()=>removeEventListener("message",n))}};m(y,"SCRIPT_STARTED_MESSAGE_TYPE",k("wxt:content-script-started"));let S=y;function X(){}function h(t,...e){}const R={debug:(...t)=>h(console.debug,...t),log:(...t)=>h(console.log,...t),warn:(...t)=>h(console.warn,...t),error:(...t)=>h(console.error,...t)};return(async()=>{try{const{main:t,...e}=M,o=new S("content",e);return await t(o)}catch(t){throw R.error('The content script "content" crashed on startup!',t),t}})()}();
content;
