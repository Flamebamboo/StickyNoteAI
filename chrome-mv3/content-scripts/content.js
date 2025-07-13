var content=function(){"use strict";var dt=Object.defineProperty;var lt=(x,m,r)=>m in x?dt(x,m,{enumerable:!0,configurable:!0,writable:!0,value:r}):x[m]=r;var w=(x,m,r)=>lt(x,typeof m!="symbol"?m+"":m,r);var U,B;function x(t){return t}const r=(B=(U=globalThis.browser)==null?void 0:U.runtime)!=null&&B.id?globalThis.browser:globalThis.chrome,V={matches:["<all_urls>"],main(){console.log("🎯 StickyNoteAI v2.2 CSS FIXED + MENU POSITIONING - Loading..."),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{R()}):R()}};let i=null,h=!1,L={x:0,y:0},f={x:0,y:0};function R(){console.log("StickyNoteAI: DOM ready, creating widget..."),_(),st(),nt(),ot()}function _(){const t=document.getElementById("sticky-note-widget");t&&t.remove(),i=document.createElement("div"),i.id="sticky-note-widget",i.innerHTML=`
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
  `,document.head.appendChild(e),document.body.appendChild(i),K()}function K(){const t=document.getElementById("main-button"),e=document.getElementById("widget-menu");if(!t||!e)return;let n=0,o={x:0,y:0},a=!1;function c(s,d){if(!i)return{x:s,y:d};const u={width:50,height:50},v=window.innerWidth,y=window.innerHeight,p=10;let E=Math.max(p,s);E=Math.min(v-u.width-p,E);let k=Math.max(p,d);return k=Math.min(y-u.height-p,k),{x:E,y:k}}function l(s,d){if(!i)return{x:s,y:d};const u={width:50,height:50},v=window.innerWidth,y=window.innerHeight,p=20,E=s,k=v-(s+u.width),O=d,X=y-(d+u.height),D=Math.min(E,k,O,X);let $=s,F=d;return(s<0||s+u.width>v||d<0||d+u.height>y)&&(D===E?$=p:D===k?$=v-u.width-p:D===O?F=p:D===X&&(F=y-u.height-p)),{x:$,y:F}}t.addEventListener("mousedown",s=>{s.preventDefault(),n=Date.now(),o={x:s.clientX,y:s.clientY},a=!1;const d=i.getBoundingClientRect();L.x=s.clientX-d.left,L.y=s.clientY-d.top,t.classList.add("dragging"),document.addEventListener("mousemove",g),document.addEventListener("mouseup",b)}),t.addEventListener("mouseenter",()=>{h||H()}),i==null||i.addEventListener("mouseleave",()=>{h||q()});function g(s){const d=Date.now()-n,u=Math.sqrt(Math.pow(s.clientX-o.x,2)+Math.pow(s.clientY-o.y,2));if(!h&&(u>3||d>100)&&(h=!0,a=!0,q(),document.body.style.cursor="grabbing"),h){const v=s.clientX-L.x,y=s.clientY-L.y,p=c(v,y);i.style.transform=`translate(${p.x}px, ${p.y}px)`,i.style.left="0",i.style.top="0",f={x:p.x,y:p.y}}}function b(){if(document.removeEventListener("mousemove",g),document.removeEventListener("mouseup",b),t&&t.classList.remove("dragging"),document.body.style.cursor="",h){const s=l(f.x,f.y);s.x!==f.x||s.y!==f.y?(i.style.transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",i.style.left=s.x+"px",i.style.top=s.y+"px",i.style.transform="",setTimeout(()=>{i&&(i.style.transition="")},300),f=s):(i.style.left=f.x+"px",i.style.top=f.y+"px",i.style.transform=""),it()}h=!1,setTimeout(()=>{a||H()},50)}e==null||e.addEventListener("click",s=>{const u=s.target.dataset.action;u&&(j(u),q())})}function H(){if(h)return;const t=document.getElementById("widget-menu");t&&t.classList.add("open")}function q(){const t=document.getElementById("widget-menu");t&&t.classList.remove("open")}function j(t){switch(t){case"add":N();break;case"notes":G();break;case"settings":J();break;case"close":A();break}}function N(t=""){const e=document.createElement("div");e.className="sticky-modal",e.innerHTML=`
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
  `,document.body.appendChild(e),setTimeout(()=>e.classList.add("open"),10);const n=e.querySelector(".modal-close"),o=e.querySelector(".save-note"),a=e.querySelector(".cancel-note"),c=e.querySelector(".note-input");function l(){e.classList.remove("open"),setTimeout(()=>e.remove(),300)}n==null||n.addEventListener("click",l),a==null||a.addEventListener("click",l),o==null||o.addEventListener("click",()=>{const g=c.value.trim();g&&(Q(g),l())}),document.addEventListener("keydown",function g(b){b.key==="Escape"&&(l(),document.removeEventListener("keydown",g))})}function G(){let t=document.querySelector(".notes-panel");t||(t=document.createElement("div"),t.className="notes-panel",t.innerHTML=`
      <div class="notes-header">📋 Recent Notes</div>
      <div class="notes-list" id="notes-list"></div>
    `,document.body.appendChild(t),T()),t.classList.toggle("open"),t.classList.contains("open")&&(T(),setTimeout(()=>{document.addEventListener("click",function e(n){t.contains(n.target)||(t.classList.remove("open"),document.removeEventListener("click",e))})},100))}function J(){var n,o;const t=document.createElement("div");t.className="sticky-modal",t.innerHTML=`
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
  `,document.body.appendChild(t),setTimeout(()=>t.classList.add("open"),10);function e(){t.classList.remove("open"),setTimeout(()=>t.remove(),300)}(n=t.querySelector(".modal-close"))==null||n.addEventListener("click",e),(o=t.querySelector(".close-settings"))==null||o.addEventListener("click",e)}function A(){i&&(i.style.display="none")}function Y(){i&&(i.style.display="block")}async function Q(t){try{const n=(await r.storage.local.get("stickyNotes")).stickyNotes||[],o={id:Date.now().toString(),content:t,timestamp:new Date().toISOString(),url:window.location.href};n.unshift(o),n.length>50&&n.splice(50),await r.storage.local.set({stickyNotes:n}),console.log("Note saved successfully")}catch(e){console.error("Error saving note:",e)}}async function T(){const t=document.getElementById("notes-list");if(t)try{const n=(await r.storage.local.get("stickyNotes")).stickyNotes||[];if(n.length===0){t.innerHTML='<div style="padding: 20px; text-align: center; color: #999;">No notes yet</div>';return}t.innerHTML=n.slice(0,10).map(o=>`
      <div class="note-item" data-note-id="${o.id}">
        <div class="note-preview">${o.content.substring(0,100)}${o.content.length>100?"...":""}</div>
        <div class="note-date">${new Date(o.timestamp).toLocaleDateString()}</div>
      </div>
    `).join(""),t.querySelectorAll(".note-item").forEach(o=>{o.addEventListener("click",()=>{const a=o.dataset.noteId,c=n.find(l=>l.id===a);c&&Z(c)})})}catch(e){console.error("Error loading notes:",e)}}function Z(t){var a,c,l,g;const e=document.createElement("div");e.className="sticky-modal",e.innerHTML=`
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
  `,document.body.appendChild(e),setTimeout(()=>e.classList.add("open"),10);const n=e.querySelector(".note-input");function o(){e.classList.remove("open"),setTimeout(()=>e.remove(),300)}(a=e.querySelector(".modal-close"))==null||a.addEventListener("click",o),(c=e.querySelector(".cancel-edit"))==null||c.addEventListener("click",o),(l=e.querySelector(".update-note"))==null||l.addEventListener("click",async()=>{const b=n.value.trim();b&&(await tt(t.id,b),T(),o())}),(g=e.querySelector("#delete-note"))==null||g.addEventListener("click",async()=>{confirm("Are you sure you want to delete this note?")&&(await et(t.id),T(),o())})}async function tt(t,e){try{const o=(await r.storage.local.get("stickyNotes")).stickyNotes||[],a=o.findIndex(c=>c.id===t);a!==-1&&(o[a].content=e,o[a].timestamp=new Date().toISOString(),await r.storage.local.set({stickyNotes:o}))}catch(n){console.error("Error updating note:",n)}}async function et(t){try{const o=((await r.storage.local.get("stickyNotes")).stickyNotes||[]).filter(a=>a.id!==t);await r.storage.local.set({stickyNotes:o})}catch(e){console.error("Error deleting note:",e)}}function nt(){document.addEventListener("keydown",t=>{if(t.altKey&&t.shiftKey){if(t.code==="KeyN")t.preventDefault(),N();else if(t.code==="KeyW"){t.preventDefault();const e=document.getElementById("sticky-note-widget");e&&(e.style.display==="none"?Y():A())}}})}function ot(){r.runtime.onMessage.addListener((t,e,n)=>{if(console.log("StickyNoteAI: Received message:",t),t.action==="toggle-widget"){const o=document.getElementById("sticky-note-widget");o&&(o.style.display==="none"?Y():A())}else t.action==="new-note"?N():t.action==="create-note-with-selection"&&N(t.selectedText||"");n({success:!0})})}async function it(){if(!i)return;const t=i.getBoundingClientRect(),e={x:t.left,y:t.top};try{await r.storage.local.set({widgetPosition:e})}catch(n){console.error("Error saving position:",n)}}async function st(){if(i){i.style.left="",i.style.top="",i.style.transform="";try{await r.storage.local.remove("widgetPosition")}catch(t){console.error("Error clearing position:",t)}}}function I(t,...e){}const at={debug:(...t)=>I(console.debug,...t),log:(...t)=>I(console.log,...t),warn:(...t)=>I(console.warn,...t),error:(...t)=>I(console.error,...t)},C=class C extends Event{constructor(e,n){super(C.EVENT_NAME,{}),this.newUrl=e,this.oldUrl=n}};w(C,"EVENT_NAME",P("wxt:locationchange"));let z=C;function P(t){var e;return`${(e=r==null?void 0:r.runtime)==null?void 0:e.id}:content:${t}`}function rt(t){let e,n;return{run(){e==null&&(n=new URL(location.href),e=t.setInterval(()=>{let o=new URL(location.href);o.href!==n.href&&(window.dispatchEvent(new z(o,n)),n=o)},1e3))}}}const S=class S{constructor(e,n){w(this,"isTopFrame",window.self===window.top);w(this,"abortController");w(this,"locationWatcher",rt(this));w(this,"receivedMessageIds",new Set);this.contentScriptName=e,this.options=n,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return r.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener("abort",e),()=>this.signal.removeEventListener("abort",e)}block(){return new Promise(()=>{})}setInterval(e,n){const o=setInterval(()=>{this.isValid&&e()},n);return this.onInvalidated(()=>clearInterval(o)),o}setTimeout(e,n){const o=setTimeout(()=>{this.isValid&&e()},n);return this.onInvalidated(()=>clearTimeout(o)),o}requestAnimationFrame(e){const n=requestAnimationFrame((...o)=>{this.isValid&&e(...o)});return this.onInvalidated(()=>cancelAnimationFrame(n)),n}requestIdleCallback(e,n){const o=requestIdleCallback((...a)=>{this.signal.aborted||e(...a)},n);return this.onInvalidated(()=>cancelIdleCallback(o)),o}addEventListener(e,n,o,a){var c;n==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(c=e.addEventListener)==null||c.call(e,n.startsWith("wxt:")?P(n):n,o,{...a,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),at.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:S.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(e){var c,l,g;const n=((c=e.data)==null?void 0:c.type)===S.SCRIPT_STARTED_MESSAGE_TYPE,o=((l=e.data)==null?void 0:l.contentScriptName)===this.contentScriptName,a=!this.receivedMessageIds.has((g=e.data)==null?void 0:g.messageId);return n&&o&&a}listenForNewerScripts(e){let n=!0;const o=a=>{if(this.verifyScriptStartedEvent(a)){this.receivedMessageIds.add(a.data.messageId);const c=n;if(n=!1,c&&(e!=null&&e.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",o),this.onInvalidated(()=>removeEventListener("message",o))}};w(S,"SCRIPT_STARTED_MESSAGE_TYPE",P("wxt:content-script-started"));let W=S;function ut(){}function M(t,...e){}const ct={debug:(...t)=>M(console.debug,...t),log:(...t)=>M(console.log,...t),warn:(...t)=>M(console.warn,...t),error:(...t)=>M(console.error,...t)};return(async()=>{try{const{main:t,...e}=V,n=new W("content",e);return await t(n)}catch(t){throw ct.error('The content script "content" crashed on startup!',t),t}})()}();
content;
