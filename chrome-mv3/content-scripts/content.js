var content=function(){"use strict";var V=Object.defineProperty;var H=(y,m,d)=>m in y?V(y,m,{enumerable:!0,configurable:!0,writable:!0,value:d}):y[m]=d;var b=(y,m,d)=>H(y,typeof m!="symbol"?m+"":m,d);var T,z;function y(t){return t}const d=(z=(T=globalThis.browser)==null?void 0:T.runtime)!=null&&z.id?globalThis.browser:globalThis.chrome,D={matches:["<all_urls>"],main(){console.log("StickyNoteAI: Initializing..."),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{L()}):L()}};function L(){console.log("StickyNoteAI: DOM ready, creating widget..."),console.log("StickyNoteAI: Content script is running on:",window.location.href),M(),setTimeout(()=>{X(),N()},100),d.runtime.onMessage.addListener((t,e,o)=>{if(console.log("StickyNoteAI: Received message:",t),t.action==="toggle-widget"){const n=document.getElementById("sticky-note-widget");n&&(n.style.display=n.style.display==="none"?"block":"none",console.log("StickyNoteAI: Widget toggled via command"))}else t.action==="new-note"&&(k(),console.log("StickyNoteAI: Note editor opened via command"));o({success:!0})})}function M(){if(console.log("StickyNoteAI: Creating floating widget..."),document.getElementById("sticky-note-widget")){console.log("StickyNoteAI: Widget already exists");return}if(!document.body){console.log("StickyNoteAI: document.body not available, retrying..."),setTimeout(()=>M(),100);return}const t=document.createElement("div");t.id="sticky-note-widget",t.style.cssText=`
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    width: 60px !important;
    height: 60px !important;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9)) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 50% !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
    z-index: 999999 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 14px !important;
    cursor: move !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    overflow: visible !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  `,t.innerHTML=`
    <div class="widget-circle" style="
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      position: relative;
      z-index: 2;
    ">
      <span class="widget-icon" style="
        font-size: 24px; 
        color: white; 
        filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
        pointer-events: none;
      ">✨</span>
    </div>
    <div class="widget-expanded" style="
      position: absolute;
      top: 0;
      right: 0;
      width: 280px;
      height: auto;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      opacity: 0;
      visibility: hidden;
      transform: translateX(20px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      z-index: 1;
    ">
      <div class="widget-header" style="
        display: flex; 
        align-items: center; 
        padding: 16px 20px; 
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); 
        border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
        gap: 12px;
        backdrop-filter: blur(10px);
      ">
        <span class="widget-icon-header" style="font-size: 18px; flex: 1; color: #6366f1; filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.3));">✨</span>
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
          pointer-events: auto;
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
          pointer-events: auto;
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
          pointer-events: auto;
        ">×</button>
      </div>
      <div class="widget-body" style="
        display: none; 
        padding: 20px; 
        max-height: 400px; 
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.05);
        pointer-events: auto;
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
    </div>
  `,C(),q(t),F(t),document.body.appendChild(t),console.log("StickyNoteAI: Widget created successfully and added to DOM"),t.style.display="block",t.style.visibility="visible";const e=document.getElementById("sticky-note-widget");e?(console.log("StickyNoteAI: Widget verification successful"),console.log("Widget position:",e.style.top,e.style.right)):console.error("StickyNoteAI: Widget verification failed!")}function C(){if(document.getElementById("sticky-note-styles"))return;const t=document.createElement("style");t.id="sticky-note-styles",t.textContent=`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    #sticky-note-widget {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }

    /* Prevent text selection on entire widget */
    #sticky-note-widget * {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }

    /* Hover effect for circle widget */
    #sticky-note-widget:hover {
      transform: scale(1.1) !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3) !important;
    }

    /* Show expanded widget on hover */
    #sticky-note-widget:hover .widget-expanded {
      opacity: 1 !important;
      visibility: visible !important;
      transform: translateX(0) !important;
      pointer-events: auto !important;
    }

    /* Dragging state */
    #sticky-note-widget.dragging {
      transition: none !important;
    }

    #sticky-note-widget.dragging .widget-expanded {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* Button hover effects */
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
      opacity: 0.3 !important;
      transform: scale(0.9) !important;
      transition: all 0.3s ease !important;
    }

    #sticky-note-widget.stealth:hover {
      opacity: 1 !important;
      transform: scale(1.1) !important;
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

    /* Ensure smooth dragging */
    #sticky-note-widget.dragging * {
      pointer-events: none !important;
    }
  `,document.head.appendChild(t)}function q(t){let e=!1,o=0,n=0,i=0,a=0,c=0;const r=t.querySelector(".widget-circle");r.addEventListener("mousedown",l),document.addEventListener("mousemove",p),document.addEventListener("mouseup",A),t.addEventListener("contextmenu",s=>{e&&s.preventDefault()}),t.addEventListener("selectstart",s=>{e&&s.preventDefault()});function l(s){s.button===0&&(c=Date.now(),s.preventDefault(),i=s.clientX-o,a=s.clientY-n,e=!0,t.classList.add("dragging"),document.body.style.cursor="grabbing",document.body.style.userSelect="none",document.body.style.webkitUserSelect="none")}function p(s){if(e){s.preventDefault(),o=s.clientX-i,n=s.clientY-a;const g=t.getBoundingClientRect(),u=10,O=window.innerWidth-g.width-u,j=window.innerHeight-g.height-u;o=Math.max(u,Math.min(o,O)),n=Math.max(u,Math.min(n,j)),t.style.transform=`translate(${o}px, ${n}px)`,t.style.left="0",t.style.top="0",t.style.right="auto"}}function A(s){if(!e)return;e=!1,t.classList.remove("dragging"),document.body.style.cursor="",document.body.style.userSelect="",document.body.style.webkitUserSelect="",t.style.left=o+"px",t.style.top=n+"px",t.style.transform="",W(o,n),Date.now()-c<200&&Math.sqrt(Math.pow(s.clientX-(i+o),2)+Math.pow(s.clientY-(a+n),2))<5&&console.log("Circle clicked")}r.addEventListener("touchstart",s=>{s.preventDefault();const g=s.touches[0],u=new MouseEvent("mousedown",{clientX:g.clientX,clientY:g.clientY,button:0});l(u)}),document.addEventListener("touchmove",s=>{if(e){s.preventDefault();const g=s.touches[0],u=new MouseEvent("mousemove",{clientX:g.clientX,clientY:g.clientY});p(u)}}),document.addEventListener("touchend",s=>{if(e){s.preventDefault();const g=new MouseEvent("mouseup",{clientX:0,clientY:0});A(g)}})}function F(t){const e=t.querySelector(".btn-add"),o=t.querySelector(".btn-menu"),n=t.querySelector(".btn-hide"),i=t.querySelector(".widget-body"),a=t.querySelector(".widget-expanded");e==null||e.addEventListener("click",r=>{r.stopPropagation(),r.preventDefault(),k()}),o==null||o.addEventListener("click",r=>{r.stopPropagation(),r.preventDefault();const l=i.style.display!=="none";i.style.display=l?"none":"block",o.textContent=l?"≡":"×"}),n==null||n.addEventListener("click",r=>{r.stopPropagation(),r.preventDefault(),t.style.display="none"}),a==null||a.addEventListener("mouseenter",()=>{a.style.opacity="1",a.style.visibility="visible",a.style.transform="translateX(0)",a.style.pointerEvents="auto"});let c=null;t.addEventListener("mouseleave",()=>{c=setTimeout(()=>{if(!t.matches(":hover")){const r=t.querySelector(".widget-expanded");r&&(r.style.opacity="0",r.style.visibility="hidden",r.style.transform="translateX(20px)",r.style.pointerEvents="none")}},100)}),t.addEventListener("mouseenter",()=>{c&&(clearTimeout(c),c=null)}),t.addEventListener("dblclick",r=>{r.preventDefault(),t.style.display="none"}),document.addEventListener("keydown",r=>{const p=navigator.platform.toUpperCase().indexOf("MAC")>=0?r.metaKey:r.ctrlKey;p&&r.shiftKey&&r.key==="W"&&(r.preventDefault(),t.style.display=t.style.display==="none"?"block":"none"),p&&r.shiftKey&&r.key==="S"&&(r.preventDefault(),k())})}function k(){if(document.getElementById("note-editor-modal"))return;const t=document.createElement("div");t.id="note-editor-modal",t.innerHTML=`
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
  `,Y(),P(t),document.body.appendChild(t),t.querySelector(".note-title-input").focus()}function Y(){if(document.getElementById("note-modal-styles"))return;const t=document.createElement("style");t.id="note-modal-styles",t.textContent=`
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
  `,document.head.appendChild(t)}function P(t){const e=t.querySelector(".modal-close"),o=t.querySelector(".btn-save"),n=t.querySelector(".btn-cancel"),i=t.querySelector(".note-title-input"),a=t.querySelector(".note-content-input");e.addEventListener("click",()=>f(t)),n.addEventListener("click",()=>f(t)),o.addEventListener("click",()=>{const l=i.value.trim()||"Untitled Note",p=a.value.trim();p&&(U(l,p),f(t))}),t.addEventListener("click",l=>{l.target===t.querySelector(".modal-backdrop")&&f(t)}),document.addEventListener("keydown",l=>{l.key==="Escape"&&f(t)});let c;const r=()=>{clearTimeout(c),c=window.setTimeout(()=>{const l=i.value.trim()||"Draft",p=a.value.trim();p&&d.storage.local.set({"sticky-note-draft":{title:l,content:p}})},2e3)};i.addEventListener("input",r),a.addEventListener("input",r),d.storage.local.get("sticky-note-draft",l=>{const p=l["sticky-note-draft"];p&&(i.value=p.title,a.value=p.content)})}function f(t){t.remove(),d.storage.local.remove("sticky-note-draft")}function U(t,e){d.storage.local.get("sticky-notes",o=>{const n=o["sticky-notes"]||[],i={id:Date.now().toString(),title:t,content:e,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};n.push(i),d.storage.local.set({"sticky-notes":n},()=>{console.log("Note saved:",i),N()})})}function N(){const t=document.getElementById("sticky-note-widget");if(!t){console.error("Widget does not exist in the DOM.");return}const e=t.querySelector(".notes-list");d.storage.local.get("sticky-notes",o=>{const n=o["sticky-notes"]||[];if(n.length===0){e.innerHTML='<div class="no-notes">No notes yet. Click + to add one!</div>';return}e.innerHTML=n.map(i=>`
      <div class="note-item" data-note-id="${i.id}">
        <div class="note-title">${i.title}</div>
        <div class="note-preview">${i.content.substring(0,50)}${i.content.length>50?"...":""}</div>
      </div>
    `).join(""),e.querySelectorAll(".note-item").forEach(i=>{i.addEventListener("click",a=>{const c=a.currentTarget.dataset.noteId;console.log("Clicked note:",c)})})})}function W(t,e){d.storage.local.set({"sticky-settings":{widgetPosition:{x:t,y:e}}})}function X(){try{d.storage.local.get("sticky-settings",t=>{const e=t["sticky-settings"];if(e&&e.widgetPosition){const{x:o,y:n}=e.widgetPosition,i=document.getElementById("sticky-note-widget");i&&(i.style.left=o+"px",i.style.top=n+"px",i.style.right="auto")}})}catch(t){console.error("Failed to load widget position:",t)}}function x(t,...e){}const B={debug:(...t)=>x(console.debug,...t),log:(...t)=>x(console.log,...t),warn:(...t)=>x(console.warn,...t),error:(...t)=>x(console.error,...t)},w=class w extends Event{constructor(e,o){super(w.EVENT_NAME,{}),this.newUrl=e,this.oldUrl=o}};b(w,"EVENT_NAME",E("wxt:locationchange"));let S=w;function E(t){var e;return`${(e=d==null?void 0:d.runtime)==null?void 0:e.id}:content:${t}`}function R(t){let e,o;return{run(){e==null&&(o=new URL(location.href),e=t.setInterval(()=>{let n=new URL(location.href);n.href!==o.href&&(window.dispatchEvent(new S(n,o)),o=n)},1e3))}}}const h=class h{constructor(e,o){b(this,"isTopFrame",window.self===window.top);b(this,"abortController");b(this,"locationWatcher",R(this));b(this,"receivedMessageIds",new Set);this.contentScriptName=e,this.options=o,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return d.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener("abort",e),()=>this.signal.removeEventListener("abort",e)}block(){return new Promise(()=>{})}setInterval(e,o){const n=setInterval(()=>{this.isValid&&e()},o);return this.onInvalidated(()=>clearInterval(n)),n}setTimeout(e,o){const n=setTimeout(()=>{this.isValid&&e()},o);return this.onInvalidated(()=>clearTimeout(n)),n}requestAnimationFrame(e){const o=requestAnimationFrame((...n)=>{this.isValid&&e(...n)});return this.onInvalidated(()=>cancelAnimationFrame(o)),o}requestIdleCallback(e,o){const n=requestIdleCallback((...i)=>{this.signal.aborted||e(...i)},o);return this.onInvalidated(()=>cancelIdleCallback(n)),n}addEventListener(e,o,n,i){var a;o==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(a=e.addEventListener)==null||a.call(e,o.startsWith("wxt:")?E(o):o,n,{...i,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),B.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:h.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(e){var a,c,r;const o=((a=e.data)==null?void 0:a.type)===h.SCRIPT_STARTED_MESSAGE_TYPE,n=((c=e.data)==null?void 0:c.contentScriptName)===this.contentScriptName,i=!this.receivedMessageIds.has((r=e.data)==null?void 0:r.messageId);return o&&n&&i}listenForNewerScripts(e){let o=!0;const n=i=>{if(this.verifyScriptStartedEvent(i)){this.receivedMessageIds.add(i.data.messageId);const a=o;if(o=!1,a&&(e!=null&&e.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",n),this.onInvalidated(()=>removeEventListener("message",n))}};b(h,"SCRIPT_STARTED_MESSAGE_TYPE",E("wxt:content-script-started"));let I=h;function _(){}function v(t,...e){}const $={debug:(...t)=>v(console.debug,...t),log:(...t)=>v(console.log,...t),warn:(...t)=>v(console.warn,...t),error:(...t)=>v(console.error,...t)};return(async()=>{try{const{main:t,...e}=D,o=new I("content",e);return await t(o)}catch(t){throw $.error('The content script "content" crashed on startup!',t),t}})()}();
content;
