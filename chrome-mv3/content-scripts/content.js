var content=function(){"use strict";var lt=Object.defineProperty;var ut=(E,b,c)=>b in E?lt(E,b,{enumerable:!0,configurable:!0,writable:!0,value:c}):E[b]=c;var x=(E,b,c)=>ut(E,typeof b!="symbol"?b+"":b,c);var B,R;function E(t){return t}const c=(R=(B=globalThis.browser)==null?void 0:B.runtime)!=null&&R.id?globalThis.browser:globalThis.chrome,V={matches:["<all_urls>"],main(){console.log("🎯 StickyNoteAI v2.2 CSS FIXED + MENU POSITIONING - Loading..."),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{Y()}):Y()}};let s=null,f=!1,N={x:0,y:0},v={x:0,y:0},g=null;function Y(){console.log("StickyNoteAI: DOM ready, creating widget..."),_(),rt(),ot(),it()}function _(){const t=document.getElementById("sticky-note-widget");t&&t.remove(),s=document.createElement("div"),s.id="sticky-note-widget",s.innerHTML=`
    <div class="widget-container">
      <div class="widget-main-button" id="main-button">
        ✨
      </div>
      <div class="widget-menu" id="widget-menu">
        <div class="menu-button add-button" data-action="add">➕</div>
        <div class="menu-button notes-button" data-action="notes">📋</div>
        <div class="menu-button settings-button" data-action="settings">⚙️</div>
        <div class="menu-button close-button" data-action="close">❌</div>
      </div>
    </div>
  `;const e=document.createElement("style");e.textContent=`
    #sticky-note-widget {
      position: fixed;
      bottom: 50px;
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
  `,document.head.appendChild(e),document.body.appendChild(s),j()}function j(){const t=document.getElementById("main-button"),e=document.getElementById("widget-menu");if(!t||!e)return;let n=0,o={x:0,y:0},r=!1;function d(i,a){if(!s)return{x:i,y:a};const l={width:50,height:50},h=window.innerWidth,y=window.innerHeight,p=10;let k=Math.max(p,i);k=Math.min(h-l.width-p,k);let S=Math.max(p,a);return S=Math.min(y-l.height-p,S),{x:k,y:S}}function u(i,a){if(!s)return{x:i,y:a};const l={width:50,height:50},h=window.innerWidth,y=window.innerHeight,p=20,k=i,S=h-(i+l.width),X=a,O=y-(a+l.height),q=Math.min(k,S,X,O);let $=i,F=a;return(i<0||i+l.width>h||a<0||a+l.height>y)&&(q===k?$=p:q===S?$=h-l.width-p:q===X?F=p:q===O&&(F=y-l.height-p)),{x:$,y:F}}t.addEventListener("mousedown",i=>{i.preventDefault(),n=Date.now(),o={x:i.clientX,y:i.clientY},r=!1;const a=s.getBoundingClientRect();N.x=i.clientX-a.left,N.y=i.clientY-a.top,t.classList.add("dragging"),document.addEventListener("mousemove",m),document.addEventListener("mouseup",w)}),t.addEventListener("mouseenter",()=>{f||(g&&(clearTimeout(g),g=null),H())}),e.addEventListener("mouseenter",()=>{g&&(clearTimeout(g),g=null)}),e.addEventListener("mouseleave",()=>{f||(g=setTimeout(()=>{T(),g=null},100))}),t.addEventListener("mouseleave",i=>{if(!f){const a=e.getBoundingClientRect(),l=i.clientX,h=i.clientY;l>=a.left-10&&l<=a.right+10&&h>=a.top-10&&h<=a.bottom+10||(g=setTimeout(()=>{T(),g=null},100))}});function m(i){const a=Date.now()-n,l=Math.sqrt(Math.pow(i.clientX-o.x,2)+Math.pow(i.clientY-o.y,2));if(!f&&(l>3||a>100)&&(f=!0,r=!0,T(),document.body.style.cursor="grabbing"),f){const h=i.clientX-N.x,y=i.clientY-N.y,p=d(h,y);s.style.transform=`translate(${p.x}px, ${p.y}px)`,s.style.left="0",s.style.top="0",v={x:p.x,y:p.y}}}function w(){if(document.removeEventListener("mousemove",m),document.removeEventListener("mouseup",w),t&&t.classList.remove("dragging"),document.body.style.cursor="",f){const i=u(v.x,v.y);i.x!==v.x||i.y!==v.y?(s.style.transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",s.style.left=i.x+"px",s.style.top=i.y+"px",s.style.transform="",setTimeout(()=>{s&&(s.style.transition="")},300),v=i):(s.style.left=v.x+"px",s.style.top=v.y+"px",s.style.transform=""),st()}f=!1,setTimeout(()=>{r||H()},50)}e==null||e.addEventListener("click",i=>{const l=i.target.dataset.action;l&&(G(l),T())})}function H(){if(f)return;const t=document.getElementById("widget-menu");t&&t.classList.add("open")}function T(){const t=document.getElementById("widget-menu");t&&t.classList.remove("open"),g&&(clearTimeout(g),g=null)}function G(t){switch(t){case"add":D();break;case"notes":K();break;case"settings":J();break;case"close":U();break}}function D(t=""){const e=document.createElement("div");e.className="sticky-modal",e.innerHTML=`
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">✏️ New Note</h3>
        <button class="modal-close">×</button>
      </div>
      <textarea class="note-input" placeholder="Write your note here..." autofocus>${t}</textarea>
      <div class="button-group">
        <button class="btn btn-primary save-note">💾 Save Note</button>
        <button class="btn btn-secondary cancel-note">Cancel</button>
      </div>
    </div>
  `,document.body.appendChild(e),setTimeout(()=>e.classList.add("open"),10);const n=e.querySelector(".modal-close"),o=e.querySelector(".save-note"),r=e.querySelector(".cancel-note"),d=e.querySelector(".note-input");function u(){e.classList.remove("open"),setTimeout(()=>e.remove(),300)}n==null||n.addEventListener("click",u),r==null||r.addEventListener("click",u),o==null||o.addEventListener("click",()=>{const m=d.value.trim();m&&(Z(m),u())}),document.addEventListener("keydown",function m(w){w.key==="Escape"&&(u(),document.removeEventListener("keydown",m))})}function K(){let t=document.querySelector(".notes-panel");t||(t=document.createElement("div"),t.className="notes-panel",t.innerHTML=`
      <div class="notes-header">📋 Recent Notes</div>
      <div class="notes-list" id="notes-list"></div>
    `,document.body.appendChild(t),I()),t.classList.toggle("open"),t.classList.contains("open")&&(I(),setTimeout(()=>{document.addEventListener("click",function e(n){t.contains(n.target)||(t.classList.remove("open"),document.removeEventListener("click",e))})},100))}function J(){var n,o;const t=document.createElement("div");t.className="sticky-modal",t.innerHTML=`
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
  `,document.body.appendChild(t),setTimeout(()=>t.classList.add("open"),10);function e(){t.classList.remove("open"),setTimeout(()=>t.remove(),300)}(n=t.querySelector(".modal-close"))==null||n.addEventListener("click",e),(o=t.querySelector(".close-settings"))==null||o.addEventListener("click",e)}function U(){s&&(s.style.display="none")}function Q(){s&&(s.style.display="block")}async function Z(t){try{const n=(await c.storage.local.get("stickyNotes")).stickyNotes||[],o={id:Date.now().toString(),content:t,timestamp:new Date().toISOString(),url:window.location.href};n.unshift(o),n.length>50&&n.splice(50),await c.storage.local.set({stickyNotes:n}),console.log("Note saved successfully")}catch(e){console.error("Error saving note:",e)}}async function I(){const t=document.getElementById("notes-list");if(t)try{const n=(await c.storage.local.get("stickyNotes")).stickyNotes||[];if(n.length===0){t.innerHTML='<div style="padding: 20px; text-align: center; color: #999;">No notes yet</div>';return}t.innerHTML=n.slice(0,10).map(o=>`
      <div class="note-item" data-note-id="${o.id}">
        <div class="note-preview">${o.content.substring(0,100)}${o.content.length>100?"...":""}</div>
        <div class="note-date">${new Date(o.timestamp).toLocaleDateString()}</div>
      </div>
    `).join(""),t.querySelectorAll(".note-item").forEach(o=>{o.addEventListener("click",()=>{const r=o.dataset.noteId,d=n.find(u=>u.id===r);d&&tt(d)})})}catch(e){console.error("Error loading notes:",e)}}function tt(t){var r,d,u,m;const e=document.createElement("div");e.className="sticky-modal",e.innerHTML=`
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
  `,document.body.appendChild(e),setTimeout(()=>e.classList.add("open"),10);const n=e.querySelector(".note-input");function o(){e.classList.remove("open"),setTimeout(()=>e.remove(),300)}(r=e.querySelector(".modal-close"))==null||r.addEventListener("click",o),(d=e.querySelector(".cancel-edit"))==null||d.addEventListener("click",o),(u=e.querySelector(".update-note"))==null||u.addEventListener("click",async()=>{const w=n.value.trim();w&&(await et(t.id,w),I(),o())}),(m=e.querySelector("#delete-note"))==null||m.addEventListener("click",async()=>{confirm("Are you sure you want to delete this note?")&&(await nt(t.id),I(),o())})}async function et(t,e){try{const o=(await c.storage.local.get("stickyNotes")).stickyNotes||[],r=o.findIndex(d=>d.id===t);r!==-1&&(o[r].content=e,o[r].timestamp=new Date().toISOString(),await c.storage.local.set({stickyNotes:o}))}catch(n){console.error("Error updating note:",n)}}async function nt(t){try{const o=((await c.storage.local.get("stickyNotes")).stickyNotes||[]).filter(r=>r.id!==t);await c.storage.local.set({stickyNotes:o})}catch(e){console.error("Error deleting note:",e)}}function ot(){console.log("StickyNoteAI: Keyboard shortcuts delegated to background script")}function it(){c.runtime.onMessage.addListener((t,e,n)=>{if(console.log("StickyNoteAI: Received message:",t),t.action==="toggle-widget"){const o=document.getElementById("sticky-note-widget");o&&(o.style.display==="none"?Q():U()),n({success:!0});return}if(t.action==="new-note"){D(),n({success:!0});return}if(t.action==="create-note-with-selection"){D(t.selectedText||""),n({success:!0});return}if(t.action==="toggleStealth"){const o=document.getElementById("sticky-note-widget");o&&(t.enabled?o.style.opacity="0.3":o.style.opacity="1"),n({success:!0});return}n({success:!1,error:"Unknown action"})})}async function st(){if(!s)return;const t=s.getBoundingClientRect(),e={x:t.left,y:t.top};try{await c.storage.local.set({widgetPosition:e})}catch(n){console.error("Error saving position:",n)}}async function rt(){if(s){s.style.left="",s.style.top="",s.style.transform="";try{await c.storage.local.remove("widgetPosition")}catch(t){console.error("Error clearing position:",t)}}}function M(t,...e){}const at={debug:(...t)=>M(console.debug,...t),log:(...t)=>M(console.log,...t),warn:(...t)=>M(console.warn,...t),error:(...t)=>M(console.error,...t)},A=class A extends Event{constructor(e,n){super(A.EVENT_NAME,{}),this.newUrl=e,this.oldUrl=n}};x(A,"EVENT_NAME",P("wxt:locationchange"));let z=A;function P(t){var e;return`${(e=c==null?void 0:c.runtime)==null?void 0:e.id}:content:${t}`}function ct(t){let e,n;return{run(){e==null&&(n=new URL(location.href),e=t.setInterval(()=>{let o=new URL(location.href);o.href!==n.href&&(window.dispatchEvent(new z(o,n)),n=o)},1e3))}}}const L=class L{constructor(e,n){x(this,"isTopFrame",window.self===window.top);x(this,"abortController");x(this,"locationWatcher",ct(this));x(this,"receivedMessageIds",new Set);this.contentScriptName=e,this.options=n,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return c.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener("abort",e),()=>this.signal.removeEventListener("abort",e)}block(){return new Promise(()=>{})}setInterval(e,n){const o=setInterval(()=>{this.isValid&&e()},n);return this.onInvalidated(()=>clearInterval(o)),o}setTimeout(e,n){const o=setTimeout(()=>{this.isValid&&e()},n);return this.onInvalidated(()=>clearTimeout(o)),o}requestAnimationFrame(e){const n=requestAnimationFrame((...o)=>{this.isValid&&e(...o)});return this.onInvalidated(()=>cancelAnimationFrame(n)),n}requestIdleCallback(e,n){const o=requestIdleCallback((...r)=>{this.signal.aborted||e(...r)},n);return this.onInvalidated(()=>cancelIdleCallback(o)),o}addEventListener(e,n,o,r){var d;n==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(d=e.addEventListener)==null||d.call(e,n.startsWith("wxt:")?P(n):n,o,{...r,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),at.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:L.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(e){var d,u,m;const n=((d=e.data)==null?void 0:d.type)===L.SCRIPT_STARTED_MESSAGE_TYPE,o=((u=e.data)==null?void 0:u.contentScriptName)===this.contentScriptName,r=!this.receivedMessageIds.has((m=e.data)==null?void 0:m.messageId);return n&&o&&r}listenForNewerScripts(e){let n=!0;const o=r=>{if(this.verifyScriptStartedEvent(r)){this.receivedMessageIds.add(r.data.messageId);const d=n;if(n=!1,d&&(e!=null&&e.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",o),this.onInvalidated(()=>removeEventListener("message",o))}};x(L,"SCRIPT_STARTED_MESSAGE_TYPE",P("wxt:content-script-started"));let W=L;function pt(){}function C(t,...e){}const dt={debug:(...t)=>C(console.debug,...t),log:(...t)=>C(console.log,...t),warn:(...t)=>C(console.warn,...t),error:(...t)=>C(console.error,...t)};return(async()=>{try{const{main:t,...e}=V,n=new W("content",e);return await t(n)}catch(t){throw dt.error('The content script "content" crashed on startup!',t),t}})()}();
content;
