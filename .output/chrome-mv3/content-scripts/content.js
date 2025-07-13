var content=function(){"use strict";var Z=Object.defineProperty;var tt=(m,l,c)=>l in m?Z(m,l,{enumerable:!0,configurable:!0,writable:!0,value:c}):m[l]=c;var g=(m,l,c)=>tt(m,typeof l!="symbol"?l+"":l,c);var q,D;function m(t){return t}const c=(D=(q=globalThis.browser)==null?void 0:q.runtime)!=null&&D.id?globalThis.browser:globalThis.chrome,$={matches:["<all_urls>"],main(){console.log("🎯 StickyNoteAI v2.0 NEW CIRCULAR UI - Loading..."),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{M()}):M()}};let s=null,u=!1,b={x:0,y:0},E={x:0,y:0};function M(){console.log("StickyNoteAI: DOM ready, creating widget..."),W(),j(),V(),_()}function W(){const t=document.getElementById("sticky-note-widget");t&&t.remove(),s=document.createElement("div"),s.id="sticky-note-widget",s.innerHTML=`
    <div class="widget-main-button" id="main-button">
      ✨
    </div>
    <div class="widget-menu" id="widget-menu">
      <div class="menu-button add-button" data-action="add">➕</div>
      <div class="menu-button notes-button" data-action="notes">📋</div>
      <div class="menu-button settings-button" data-action="settings">⚙️</div>
      <div class="menu-button close-button" data-action="close">❌</div>
    </div>
  `;const e=document.createElement("style");e.textContent=`
    #sticky-note-widget {
      position: fixed;
      top: 50px;
      right: 50px;
      z-index: 999999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      user-select: none;
      pointer-events: auto;
    }

    .widget-main-button {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      position: relative;
    }

    .widget-main-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
    }

    .widget-main-button.dragging {
      cursor: grabbing !important;
      transform: scale(0.95);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5);
    }

    .widget-menu {
      position: absolute;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
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
      background: rgba(255, 255, 255, 0.95);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      transform: translateY(-10px);
      opacity: 0;
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
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    }

    .close-button:hover {
      background: rgba(255, 107, 107, 0.9) !important;
      color: white;
    }

    /* Modal styles */
    .sticky-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
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
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      transform: scale(0.9);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
      border-bottom: 1px solid #eee;
    }

    .modal-title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      padding: 5px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: #f5f5f5;
      color: #333;
    }

    .note-input {
      width: 100%;
      min-height: 200px;
      padding: 15px;
      border: 2px solid #e1e5e9;
      border-radius: 10px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      transition: border-color 0.2s ease;
    }

    .note-input:focus {
      outline: none;
      border-color: #667eea;
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
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #333;
      border: 1px solid #dee2e6;
    }

    .btn-secondary:hover {
      background: #e9ecef;
    }

    .notes-panel {
      position: fixed;
      top: 50%;
      right: -300px;
      transform: translateY(-50%);
      width: 280px;
      max-height: 400px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      z-index: 999998;
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .notes-panel.open {
      right: 20px;
    }

    .notes-header {
      background: #667eea;
      color: white;
      padding: 15px;
      font-weight: 600;
    }

    .notes-list {
      max-height: 300px;
      overflow-y: auto;
      padding: 10px;
    }

    .note-item {
      padding: 12px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .note-item:hover {
      background: #f8f9fa;
    }

    .note-preview {
      font-size: 13px;
      color: #666;
      margin-top: 5px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .note-date {
      font-size: 11px;
      color: #999;
      margin-top: 5px;
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
  `,document.head.appendChild(e),document.body.appendChild(s),F()}function F(){const t=document.getElementById("main-button"),e=document.getElementById("widget-menu");if(!t||!e)return;let n=0,o={x:0,y:0},i=!1;t.addEventListener("mousedown",a=>{a.preventDefault(),n=Date.now(),o={x:a.clientX,y:a.clientY},i=!1;const p=s.getBoundingClientRect();b.x=a.clientX-p.left,b.y=a.clientY-p.top,t.classList.add("dragging"),document.addEventListener("mousemove",r),document.addEventListener("mouseup",d)}),t.addEventListener("mouseenter",()=>{u||C()}),s==null||s.addEventListener("mouseleave",()=>{u||k()});function r(a){const p=Date.now()-n,x=Math.sqrt(Math.pow(a.clientX-o.x,2)+Math.pow(a.clientY-o.y,2));if(!u&&(x>3||p>100)&&(u=!0,i=!0,k(),document.body.style.cursor="grabbing"),u){const z=a.clientX-b.x,P=a.clientY-b.y;s.style.transform=`translate(${z}px, ${P}px)`,s.style.left="0",s.style.top="0",E={x:z,y:P}}}function d(){document.removeEventListener("mousemove",r),document.removeEventListener("mouseup",d),t.classList.remove("dragging"),document.body.style.cursor="",u&&(s.style.left=E.x+"px",s.style.top=E.y+"px",s.style.transform="",X()),u=!1,setTimeout(()=>{i||C()},50)}e==null||e.addEventListener("click",a=>{const x=a.target.dataset.action;x&&(R(x),k())})}function C(){if(u)return;const t=document.getElementById("widget-menu");t&&t.classList.add("open")}function k(){const t=document.getElementById("widget-menu");t&&t.classList.remove("open")}function R(t){switch(t){case"add":S();break;case"notes":U();break;case"settings":Y();break;case"close":L();break}}function S(){const t=document.createElement("div");t.className="sticky-modal",t.innerHTML=`
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">✏️ New Note</h3>
        <button class="modal-close">×</button>
      </div>
      <textarea class="note-input" placeholder="Write your note here..." autofocus></textarea>
      <div class="button-group">
        <button class="btn btn-primary save-note">💾 Save Note</button>
        <button class="btn btn-secondary cancel-note">Cancel</button>
      </div>
    </div>
  `,document.body.appendChild(t),setTimeout(()=>t.classList.add("open"),10);const e=t.querySelector(".modal-close"),n=t.querySelector(".save-note"),o=t.querySelector(".cancel-note"),i=t.querySelector(".note-input");function r(){t.classList.remove("open"),setTimeout(()=>t.remove(),300)}e==null||e.addEventListener("click",r),o==null||o.addEventListener("click",r),n==null||n.addEventListener("click",()=>{const d=i.value.trim();d&&(H(d),r())}),document.addEventListener("keydown",function d(a){a.key==="Escape"&&(r(),document.removeEventListener("keydown",d))})}function U(){let t=document.querySelector(".notes-panel");t||(t=document.createElement("div"),t.className="notes-panel",t.innerHTML=`
      <div class="notes-header">📋 Recent Notes</div>
      <div class="notes-list" id="notes-list"></div>
    `,document.body.appendChild(t),h()),t.classList.toggle("open"),t.classList.contains("open")&&(h(),setTimeout(()=>{document.addEventListener("click",function e(n){t.contains(n.target)||(t.classList.remove("open"),document.removeEventListener("click",e))})},100))}function Y(){var n,o;const t=document.createElement("div");t.className="sticky-modal",t.innerHTML=`
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">⚙️ Settings</h3>
        <button class="modal-close">×</button>
      </div>
      <div style="line-height: 1.6;">
        <h4>🎮 Keyboard Shortcuts</h4>
        <p><strong>Cmd/Ctrl + Shift + S:</strong> Create new note</p>
        <p><strong>Cmd/Ctrl + Shift + W:</strong> Toggle widget visibility</p>
        <p><strong>ESC:</strong> Close modals</p>
        
        <h4 style="margin-top: 25px;">ℹ️ About</h4>
        <p><strong>StickyNoteAI v2.0</strong></p>
        <p>Smart floating notes for any webpage</p>
        
        <h4 style="margin-top: 25px;">🎯 Usage Tips</h4>
        <p>• Hover over the ✨ button to see menu</p>
        <p>• Click and drag to move the widget</p>
        <p>• Use keyboard shortcuts for quick access</p>
      </div>
      <div class="button-group">
        <button class="btn btn-secondary close-settings">Close</button>
      </div>
    </div>
  `,document.body.appendChild(t),setTimeout(()=>t.classList.add("open"),10);function e(){t.classList.remove("open"),setTimeout(()=>t.remove(),300)}(n=t.querySelector(".modal-close"))==null||n.addEventListener("click",e),(o=t.querySelector(".close-settings"))==null||o.addEventListener("click",e)}function L(){s&&(s.style.display="none")}function A(){s&&(s.style.display="block")}async function H(t){try{const n=(await c.storage.local.get("stickyNotes")).stickyNotes||[],o={id:Date.now().toString(),content:t,timestamp:new Date().toISOString(),url:window.location.href};n.unshift(o),n.length>50&&n.splice(50),await c.storage.local.set({stickyNotes:n}),console.log("Note saved successfully")}catch(e){console.error("Error saving note:",e)}}async function h(){const t=document.getElementById("notes-list");if(t)try{const n=(await c.storage.local.get("stickyNotes")).stickyNotes||[];if(n.length===0){t.innerHTML='<div style="padding: 20px; text-align: center; color: #999;">No notes yet</div>';return}t.innerHTML=n.slice(0,10).map(o=>`
      <div class="note-item" data-note-id="${o.id}">
        <div class="note-preview">${o.content.substring(0,100)}${o.content.length>100?"...":""}</div>
        <div class="note-date">${new Date(o.timestamp).toLocaleDateString()}</div>
      </div>
    `).join(""),t.querySelectorAll(".note-item").forEach(o=>{o.addEventListener("click",()=>{const i=o.dataset.noteId,r=n.find(d=>d.id===i);r&&B(r)})})}catch(e){console.error("Error loading notes:",e)}}function B(t){var i,r,d,a;const e=document.createElement("div");e.className="sticky-modal",e.innerHTML=`
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">✏️ Edit Note</h3>
        <button class="modal-close">×</button>
      </div>
      <textarea class="note-input" autofocus>${t.content}</textarea>
      <div class="button-group">
        <button class="btn btn-primary update-note">💾 Update Note</button>
        <button class="btn" style="background: #dc3545; color: white;" id="delete-note">🗑️ Delete</button>
        <button class="btn btn-secondary cancel-edit">Cancel</button>
      </div>
    </div>
  `,document.body.appendChild(e),setTimeout(()=>e.classList.add("open"),10);const n=e.querySelector(".note-input");function o(){e.classList.remove("open"),setTimeout(()=>e.remove(),300)}(i=e.querySelector(".modal-close"))==null||i.addEventListener("click",o),(r=e.querySelector(".cancel-edit"))==null||r.addEventListener("click",o),(d=e.querySelector(".update-note"))==null||d.addEventListener("click",async()=>{const p=n.value.trim();p&&(await K(t.id,p),h(),o())}),(a=e.querySelector("#delete-note"))==null||a.addEventListener("click",async()=>{confirm("Are you sure you want to delete this note?")&&(await O(t.id),h(),o())})}async function K(t,e){try{const o=(await c.storage.local.get("stickyNotes")).stickyNotes||[],i=o.findIndex(r=>r.id===t);i!==-1&&(o[i].content=e,o[i].timestamp=new Date().toISOString(),await c.storage.local.set({stickyNotes:o}))}catch(n){console.error("Error updating note:",n)}}async function O(t){try{const o=((await c.storage.local.get("stickyNotes")).stickyNotes||[]).filter(i=>i.id!==t);await c.storage.local.set({stickyNotes:o})}catch(e){console.error("Error deleting note:",e)}}function V(){document.addEventListener("keydown",t=>{if((navigator.platform.toUpperCase().indexOf("MAC")>=0?t.metaKey:t.ctrlKey)&&t.shiftKey){if(t.code==="KeyS")t.preventDefault(),S();else if(t.code==="KeyW"){t.preventDefault();const o=document.getElementById("sticky-note-widget");o&&(o.style.display==="none"?A():L())}}})}function _(){c.runtime.onMessage.addListener((t,e,n)=>{if(console.log("StickyNoteAI: Received message:",t),t.action==="toggle-widget"){const o=document.getElementById("sticky-note-widget");o&&(o.style.display==="none"?A():L())}else t.action==="new-note"&&S();n({success:!0})})}async function X(){if(!s)return;const t=s.getBoundingClientRect(),e={x:t.left,y:t.top};try{await c.storage.local.set({widgetPosition:e})}catch(n){console.error("Error saving position:",n)}}async function j(){if(s)try{const t=await c.storage.local.get("widgetPosition");if(t.widgetPosition){const{x:e,y:n}=t.widgetPosition;s.style.left=e+"px",s.style.top=n+"px"}}catch(t){console.error("Error loading position:",t)}}function v(t,...e){}const G={debug:(...t)=>v(console.debug,...t),log:(...t)=>v(console.log,...t),warn:(...t)=>v(console.warn,...t),error:(...t)=>v(console.error,...t)},w=class w extends Event{constructor(e,n){super(w.EVENT_NAME,{}),this.newUrl=e,this.oldUrl=n}};g(w,"EVENT_NAME",I("wxt:locationchange"));let N=w;function I(t){var e;return`${(e=c==null?void 0:c.runtime)==null?void 0:e.id}:content:${t}`}function J(t){let e,n;return{run(){e==null&&(n=new URL(location.href),e=t.setInterval(()=>{let o=new URL(location.href);o.href!==n.href&&(window.dispatchEvent(new N(o,n)),n=o)},1e3))}}}const f=class f{constructor(e,n){g(this,"isTopFrame",window.self===window.top);g(this,"abortController");g(this,"locationWatcher",J(this));g(this,"receivedMessageIds",new Set);this.contentScriptName=e,this.options=n,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return c.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener("abort",e),()=>this.signal.removeEventListener("abort",e)}block(){return new Promise(()=>{})}setInterval(e,n){const o=setInterval(()=>{this.isValid&&e()},n);return this.onInvalidated(()=>clearInterval(o)),o}setTimeout(e,n){const o=setTimeout(()=>{this.isValid&&e()},n);return this.onInvalidated(()=>clearTimeout(o)),o}requestAnimationFrame(e){const n=requestAnimationFrame((...o)=>{this.isValid&&e(...o)});return this.onInvalidated(()=>cancelAnimationFrame(n)),n}requestIdleCallback(e,n){const o=requestIdleCallback((...i)=>{this.signal.aborted||e(...i)},n);return this.onInvalidated(()=>cancelIdleCallback(o)),o}addEventListener(e,n,o,i){var r;n==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(r=e.addEventListener)==null||r.call(e,n.startsWith("wxt:")?I(n):n,o,{...i,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),G.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:f.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(e){var r,d,a;const n=((r=e.data)==null?void 0:r.type)===f.SCRIPT_STARTED_MESSAGE_TYPE,o=((d=e.data)==null?void 0:d.contentScriptName)===this.contentScriptName,i=!this.receivedMessageIds.has((a=e.data)==null?void 0:a.messageId);return n&&o&&i}listenForNewerScripts(e){let n=!0;const o=i=>{if(this.verifyScriptStartedEvent(i)){this.receivedMessageIds.add(i.data.messageId);const r=n;if(n=!1,r&&(e!=null&&e.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",o),this.onInvalidated(()=>removeEventListener("message",o))}};g(f,"SCRIPT_STARTED_MESSAGE_TYPE",I("wxt:content-script-started"));let T=f;function et(){}function y(t,...e){}const Q={debug:(...t)=>y(console.debug,...t),log:(...t)=>y(console.log,...t),warn:(...t)=>y(console.warn,...t),error:(...t)=>y(console.error,...t)};return(async()=>{try{const{main:t,...e}=$,n=new T("content",e);return await t(n)}catch(t){throw Q.error('The content script "content" crashed on startup!',t),t}})()}();
content;
