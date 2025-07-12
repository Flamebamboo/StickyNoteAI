var content=function(){"use strict";var H=Object.defineProperty;var V=(h,u,r)=>u in h?H(h,u,{enumerable:!0,configurable:!0,writable:!0,value:r}):h[u]=r;var p=(h,u,r)=>V(h,typeof u!="symbol"?u+"":u,r);var I,T;function h(t){return t}const r=(T=(I=globalThis.browser)==null?void 0:I.runtime)!=null&&T.id?globalThis.browser:globalThis.chrome,N={matches:["<all_urls>"],main(){console.log("StickyNoteAI: Initializing..."),M(),setTimeout(()=>{D(),S()},100)}};function M(){if(document.getElementById("sticky-note-widget"))return;const t=document.createElement("div");t.id="sticky-note-widget",t.innerHTML=`
    <div class="widget-header">
      <span class="widget-icon">📝</span>
      <button class="btn-add" title="Add Note">+</button>
      <button class="btn-menu" title="Menu">≡</button>
      <button class="btn-hide" title="Hide">×</button>
    </div>
    <div class="widget-body" style="display: none;">
      <div class="notes-list">
        <div class="no-notes">No notes yet. Click + to add one!</div>
      </div>
    </div>
  `,C(),z(t),q(t),document.body.appendChild(t),console.log("StickyNoteAI: Widget created successfully")}function C(){if(document.getElementById("sticky-note-styles"))return;const t=document.createElement("style");t.id="sticky-note-styles",t.textContent=`
    #sticky-note-widget {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 200px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      backdrop-filter: blur(10px);
      cursor: move;
      transition: all 0.2s ease;
    }

    #sticky-note-widget:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .widget-header {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: rgba(248, 249, 250, 0.9);
      border-radius: 8px 8px 0 0;
      border-bottom: 1px solid #eee;
      gap: 8px;
    }

    .widget-icon {
      font-size: 16px;
      flex: 1;
    }

    .widget-header button {
      background: none;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: background-color 0.2s ease;
    }

    .widget-header button:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    .btn-add {
      color: #28a745;
    }

    .btn-menu {
      color: #6c757d;
    }

    .btn-hide {
      color: #dc3545;
    }

    .widget-body {
      padding: 12px;
      max-height: 300px;
      overflow-y: auto;
    }

    .notes-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .no-notes {
      color: #6c757d;
      font-style: italic;
      text-align: center;
      padding: 20px 10px;
    }

    .note-item {
      background: #f8f9fa;
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 3px solid #007bff;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .note-item:hover {
      background: #e9ecef;
      transform: translateY(-1px);
    }

    .note-title {
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
    }

    .note-preview {
      color: #6c757d;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Hide widget when in stealth mode */
    #sticky-note-widget.stealth {
      opacity: 0.3;
      transform: scale(0.8);
    }

    #sticky-note-widget.minimized {
      width: 60px;
      height: 40px;
    }

    #sticky-note-widget.minimized .widget-body {
      display: none !important;
    }

    #sticky-note-widget.minimized .widget-header {
      padding: 8px;
      justify-content: center;
    }

    #sticky-note-widget.minimized .btn-menu,
    #sticky-note-widget.minimized .btn-add {
      display: none;
    }
  `,document.head.appendChild(t)}function z(t){let e=!1,n=0,i=0,o=0,s=0;const a=t.querySelector(".widget-header");a.addEventListener("mousedown",g),document.addEventListener("mousemove",d),document.addEventListener("mouseup",c);function g(l){l.target.tagName!=="BUTTON"&&(o=l.clientX-n,s=l.clientY-i,(l.target===a||a.contains(l.target))&&(e=!0,t.style.cursor="grabbing"))}function d(l){if(e){l.preventDefault(),n=l.clientX-o,i=l.clientY-s;const L=t.getBoundingClientRect(),W=window.innerWidth-L.width,Y=window.innerHeight-L.height;n=Math.max(0,Math.min(n,W)),i=Math.max(0,Math.min(i,Y)),t.style.left=n+"px",t.style.top=i+"px",t.style.right="auto"}}function c(){e=!1,t.style.cursor="move",F(n,i)}}function q(t){const e=t.querySelector(".btn-add"),n=t.querySelector(".btn-menu"),i=t.querySelector(".btn-hide"),o=t.querySelector(".widget-body");e.addEventListener("click",s=>{s.stopPropagation(),E()}),n.addEventListener("click",s=>{s.stopPropagation();const a=o.style.display!=="none";o.style.display=a?"none":"block",n.textContent=a?"≡":"×"}),i.addEventListener("click",s=>{s.stopPropagation(),t.classList.toggle("minimized")}),t.addEventListener("dblclick",()=>{t.classList.toggle("minimized")}),document.addEventListener("keydown",s=>{s.ctrlKey&&s.shiftKey&&s.key==="H"&&(s.preventDefault(),t.style.display=t.style.display==="none"?"block":"none"),s.ctrlKey&&s.shiftKey&&s.key==="N"&&(s.preventDefault(),E())})}function E(){if(document.getElementById("note-editor-modal"))return;const t=document.createElement("div");t.id="note-editor-modal",t.innerHTML=`
    <div class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Quick Note</h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <input type="text" placeholder="Note title..." class="note-title-input">
          <textarea placeholder="Start typing your note..." class="note-content-input"></textarea>
          <div class="modal-actions">
            <button class="btn-save">Save Note</button>
            <button class="btn-cancel">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,A(),B(t),document.body.appendChild(t),t.querySelector(".note-title-input").focus()}function A(){if(document.getElementById("note-modal-styles"))return;const t=document.createElement("style");t.id="note-modal-styles",t.textContent=`
    #note-editor-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999999;
    }

    .modal-backdrop {
      background: rgba(0, 0, 0, 0.5);
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow: hidden;
    }

    .modal-header {
      background: #f8f9fa;
      padding: 16px 20px;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6c757d;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .modal-close:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    .modal-body {
      padding: 20px;
    }

    .note-title-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      margin-bottom: 12px;
      font-family: inherit;
    }

    .note-content-input {
      width: 100%;
      min-height: 150px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      margin-bottom: 16px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .modal-actions button {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-save {
      background: #007bff;
      color: white;
    }

    .btn-save:hover {
      background: #0056b3;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
    }

    .btn-cancel:hover {
      background: #545b62;
    }
  `,document.head.appendChild(t)}function B(t){const e=t.querySelector(".modal-close"),n=t.querySelector(".btn-save"),i=t.querySelector(".btn-cancel"),o=t.querySelector(".note-title-input"),s=t.querySelector(".note-content-input");e.addEventListener("click",()=>m(t)),i.addEventListener("click",()=>m(t)),n.addEventListener("click",()=>{const d=o.value.trim()||"Untitled Note",c=s.value.trim();c&&(P(d,c),S(),m(t))}),t.addEventListener("click",d=>{d.target===t.querySelector(".modal-backdrop")&&m(t)}),document.addEventListener("keydown",d=>{d.key==="Escape"&&m(t)});let a;const g=()=>{clearTimeout(a),a=window.setTimeout(()=>{const d=o.value.trim()||"Draft",c=s.value.trim();c&&r.storage.local.set({"sticky-note-draft":{title:d,content:c}})},2e3)};o.addEventListener("input",g),s.addEventListener("input",g),r.storage.local.get("sticky-note-draft",d=>{const c=d["sticky-note-draft"];c&&(o.value=c.title,s.value=c.content)})}function m(t){t.remove(),r.storage.local.remove("sticky-note-draft")}function P(t,e){r.storage.local.get("sticky-notes",n=>{const i=n["sticky-notes"]||[],o={id:Date.now().toString(),title:t,content:e,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};i.push(o),r.storage.local.set({"sticky-notes":i},()=>{console.log("Note saved:",o)})})}function S(){const t=document.getElementById("sticky-note-widget");if(!t){console.error("Widget does not exist in the DOM.");return}const e=t.querySelector(".notes-list");r.storage.local.get("sticky-notes",n=>{const i=n["sticky-notes"]||[];if(i.length===0){e.innerHTML='<div class="no-notes">No notes yet. Click + to add one!</div>';return}e.innerHTML=i.map(o=>`
      <div class="note-item" data-note-id="${o.id}">
        <div class="note-title">${o.title}</div>
        <div class="note-preview">${o.content.substring(0,50)}${o.content.length>50?"...":""}</div>
      </div>
    `).join(""),e.querySelectorAll(".note-item").forEach(o=>{o.addEventListener("click",s=>{const a=s.currentTarget.dataset.noteId;console.log("Clicked note:",a)})})})}function F(t,e){r.storage.local.set({"sticky-settings":{widgetPosition:{x:t,y:e}}})}function D(){try{r.storage.local.get("sticky-settings",t=>{const e=t["sticky-settings"];if(e&&e.widgetPosition){const{x:n,y:i}=e.widgetPosition,o=document.getElementById("sticky-note-widget");o&&(o.style.left=n+"px",o.style.top=i+"px",o.style.right="auto")}})}catch(t){console.error("Failed to load widget position:",t)}}function b(t,...e){}const $={debug:(...t)=>b(console.debug,...t),log:(...t)=>b(console.log,...t),warn:(...t)=>b(console.warn,...t),error:(...t)=>b(console.error,...t)},v=class v extends Event{constructor(e,n){super(v.EVENT_NAME,{}),this.newUrl=e,this.oldUrl=n}};p(v,"EVENT_NAME",w("wxt:locationchange"));let x=v;function w(t){var e;return`${(e=r==null?void 0:r.runtime)==null?void 0:e.id}:content:${t}`}function R(t){let e,n;return{run(){e==null&&(n=new URL(location.href),e=t.setInterval(()=>{let i=new URL(location.href);i.href!==n.href&&(window.dispatchEvent(new x(i,n)),n=i)},1e3))}}}const f=class f{constructor(e,n){p(this,"isTopFrame",window.self===window.top);p(this,"abortController");p(this,"locationWatcher",R(this));p(this,"receivedMessageIds",new Set);this.contentScriptName=e,this.options=n,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return r.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener("abort",e),()=>this.signal.removeEventListener("abort",e)}block(){return new Promise(()=>{})}setInterval(e,n){const i=setInterval(()=>{this.isValid&&e()},n);return this.onInvalidated(()=>clearInterval(i)),i}setTimeout(e,n){const i=setTimeout(()=>{this.isValid&&e()},n);return this.onInvalidated(()=>clearTimeout(i)),i}requestAnimationFrame(e){const n=requestAnimationFrame((...i)=>{this.isValid&&e(...i)});return this.onInvalidated(()=>cancelAnimationFrame(n)),n}requestIdleCallback(e,n){const i=requestIdleCallback((...o)=>{this.signal.aborted||e(...o)},n);return this.onInvalidated(()=>cancelIdleCallback(i)),i}addEventListener(e,n,i,o){var s;n==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(s=e.addEventListener)==null||s.call(e,n.startsWith("wxt:")?w(n):n,i,{...o,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),$.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:f.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(e){var s,a,g;const n=((s=e.data)==null?void 0:s.type)===f.SCRIPT_STARTED_MESSAGE_TYPE,i=((a=e.data)==null?void 0:a.contentScriptName)===this.contentScriptName,o=!this.receivedMessageIds.has((g=e.data)==null?void 0:g.messageId);return n&&i&&o}listenForNewerScripts(e){let n=!0;const i=o=>{if(this.verifyScriptStartedEvent(o)){this.receivedMessageIds.add(o.data.messageId);const s=n;if(n=!1,s&&(e!=null&&e.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",i),this.onInvalidated(()=>removeEventListener("message",i))}};p(f,"SCRIPT_STARTED_MESSAGE_TYPE",w("wxt:content-script-started"));let k=f;function _(){}function y(t,...e){}const U={debug:(...t)=>y(console.debug,...t),log:(...t)=>y(console.log,...t),warn:(...t)=>y(console.warn,...t),error:(...t)=>y(console.error,...t)};return(async()=>{try{const{main:t,...e}=N,n=new k("content",e);return await t(n)}catch(t){throw U.error('The content script "content" crashed on startup!',t),t}})()}();
content;
