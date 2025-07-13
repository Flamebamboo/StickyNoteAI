var background = function() {
  "use strict";
  var _a, _b;
  function defineBackground(arg) {
    if (arg == null || typeof arg === "function") return { main: arg };
    return arg;
  }
  const browser$1 = ((_b = (_a = globalThis.browser) == null ? void 0 : _a.runtime) == null ? void 0 : _b.id) ? globalThis.browser : globalThis.chrome;
  const browser = browser$1;
  const definition = defineBackground(() => {
    console.log("StickyNoteAI: Background script loaded");
    browser.runtime.onInstalled.addListener((details) => {
      if (details.reason === "install") {
        console.log("StickyNoteAI: Extension installed");
        browser.storage.local.set({
          "sticky-settings": {
            stealthMode: false,
            autoHide: false,
            opacity: 0.95,
            widgetPosition: { x: 20, y: 20 }
          },
          "sticky-notes": []
        });
        browser.tabs.create({
          url: "https://github.com/Flamebamboo/StickyNoteAI"
        });
      }
    });
    browser.commands.onCommand.addListener((command) => {
      console.log("Command received:", command);
      browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.id) {
          browser.tabs.sendMessage(activeTab.id, {
            action: command,
            timestamp: Date.now()
          }).catch((error) => {
            console.log("Could not send message to content script:", error);
          });
        }
      });
    });
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Background received message:", message);
      switch (message.action) {
        case "save-notes":
          browser.storage.local.set({ "sticky-notes": message.notes });
          sendResponse({ success: true });
          break;
        case "load-notes":
          browser.storage.local.get(["sticky-notes"], (result2) => {
            sendResponse({ notes: result2["sticky-notes"] || [] });
          });
          return true;
        // Keep message channel open for async response
        case "save-settings":
          browser.storage.local.set({ "sticky-settings": message.settings });
          sendResponse({ success: true });
          break;
        case "load-settings":
          browser.storage.local.get(["sticky-settings"], (result2) => {
            sendResponse({
              settings: result2["sticky-settings"] || {
                stealthMode: false,
                autoHide: false,
                opacity: 0.95,
                widgetPosition: { x: 20, y: 20 }
              }
            });
          });
          return true;
        // Keep message channel open for async response
        case "get-tab-info":
          if (sender.tab) {
            sendResponse({
              tabId: sender.tab.id,
              url: sender.tab.url,
              title: sender.tab.title
            });
          }
          break;
        default:
          console.log("Unknown action:", message.action);
      }
    });
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete" && tab.url) {
        if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
          return;
        }
        console.log("Tab updated:", tab.url);
      }
    });
    browser.contextMenus.create({
      id: "create-note",
      title: "Create Sticky Note",
      contexts: ["selection", "page"]
    });
    browser.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === "create-note" && tab && tab.id) {
        browser.tabs.sendMessage(tab.id, {
          action: "create-note-with-selection",
          selectedText: info.selectionText || "",
          timestamp: Date.now()
        });
      }
    });
  });
  background;
  function initPlugins() {
  }
  var _MatchPattern = class {
    constructor(matchPattern) {
      if (matchPattern === "<all_urls>") {
        this.isAllUrls = true;
        this.protocolMatches = [..._MatchPattern.PROTOCOLS];
        this.hostnameMatch = "*";
        this.pathnameMatch = "*";
      } else {
        const groups = /(.*):\/\/(.*?)(\/.*)/.exec(matchPattern);
        if (groups == null)
          throw new InvalidMatchPattern(matchPattern, "Incorrect format");
        const [_, protocol, hostname, pathname] = groups;
        validateProtocol(matchPattern, protocol);
        validateHostname(matchPattern, hostname);
        this.protocolMatches = protocol === "*" ? ["http", "https"] : [protocol];
        this.hostnameMatch = hostname;
        this.pathnameMatch = pathname;
      }
    }
    includes(url) {
      if (this.isAllUrls)
        return true;
      const u = typeof url === "string" ? new URL(url) : url instanceof Location ? new URL(url.href) : url;
      return !!this.protocolMatches.find((protocol) => {
        if (protocol === "http")
          return this.isHttpMatch(u);
        if (protocol === "https")
          return this.isHttpsMatch(u);
        if (protocol === "file")
          return this.isFileMatch(u);
        if (protocol === "ftp")
          return this.isFtpMatch(u);
        if (protocol === "urn")
          return this.isUrnMatch(u);
      });
    }
    isHttpMatch(url) {
      return url.protocol === "http:" && this.isHostPathMatch(url);
    }
    isHttpsMatch(url) {
      return url.protocol === "https:" && this.isHostPathMatch(url);
    }
    isHostPathMatch(url) {
      if (!this.hostnameMatch || !this.pathnameMatch)
        return false;
      const hostnameMatchRegexs = [
        this.convertPatternToRegex(this.hostnameMatch),
        this.convertPatternToRegex(this.hostnameMatch.replace(/^\*\./, ""))
      ];
      const pathnameMatchRegex = this.convertPatternToRegex(this.pathnameMatch);
      return !!hostnameMatchRegexs.find((regex) => regex.test(url.hostname)) && pathnameMatchRegex.test(url.pathname);
    }
    isFileMatch(url) {
      throw Error("Not implemented: file:// pattern matching. Open a PR to add support");
    }
    isFtpMatch(url) {
      throw Error("Not implemented: ftp:// pattern matching. Open a PR to add support");
    }
    isUrnMatch(url) {
      throw Error("Not implemented: urn:// pattern matching. Open a PR to add support");
    }
    convertPatternToRegex(pattern) {
      const escaped = this.escapeForRegex(pattern);
      const starsReplaced = escaped.replace(/\\\*/g, ".*");
      return RegExp(`^${starsReplaced}$`);
    }
    escapeForRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  };
  var MatchPattern = _MatchPattern;
  MatchPattern.PROTOCOLS = ["http", "https", "file", "ftp", "urn"];
  var InvalidMatchPattern = class extends Error {
    constructor(matchPattern, reason) {
      super(`Invalid match pattern "${matchPattern}": ${reason}`);
    }
  };
  function validateProtocol(matchPattern, protocol) {
    if (!MatchPattern.PROTOCOLS.includes(protocol) && protocol !== "*")
      throw new InvalidMatchPattern(
        matchPattern,
        `${protocol} not a valid protocol (${MatchPattern.PROTOCOLS.join(", ")})`
      );
  }
  function validateHostname(matchPattern, hostname) {
    if (hostname.includes(":"))
      throw new InvalidMatchPattern(matchPattern, `Hostname cannot include a port`);
    if (hostname.includes("*") && hostname.length > 1 && !hostname.startsWith("*."))
      throw new InvalidMatchPattern(
        matchPattern,
        `If using a wildcard (*), it must go at the start of the hostname`
      );
  }
  function print(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  let ws;
  function getDevServerWebSocket() {
    if (ws == null) {
      const serverUrl = "http://localhost:3000";
      logger.debug("Connecting to dev server @", serverUrl);
      ws = new WebSocket(serverUrl, "vite-hmr");
      ws.addWxtEventListener = ws.addEventListener.bind(ws);
      ws.sendCustom = (event, payload) => ws == null ? void 0 : ws.send(JSON.stringify({ type: "custom", event, payload }));
      ws.addEventListener("open", () => {
        logger.debug("Connected to dev server");
      });
      ws.addEventListener("close", () => {
        logger.debug("Disconnected from dev server");
      });
      ws.addEventListener("error", (event) => {
        logger.error("Failed to connect to dev server", event);
      });
      ws.addEventListener("message", (e) => {
        try {
          const message = JSON.parse(e.data);
          if (message.type === "custom") {
            ws == null ? void 0 : ws.dispatchEvent(
              new CustomEvent(message.event, { detail: message.data })
            );
          }
        } catch (err) {
          logger.error("Failed to handle message", err);
        }
      });
    }
    return ws;
  }
  function keepServiceWorkerAlive() {
    setInterval(async () => {
      await browser.runtime.getPlatformInfo();
    }, 5e3);
  }
  function reloadContentScript(payload) {
    const manifest = browser.runtime.getManifest();
    if (manifest.manifest_version == 2) {
      void reloadContentScriptMv2();
    } else {
      void reloadContentScriptMv3(payload);
    }
  }
  async function reloadContentScriptMv3({
    registration,
    contentScript
  }) {
    if (registration === "runtime") {
      await reloadRuntimeContentScriptMv3(contentScript);
    } else {
      await reloadManifestContentScriptMv3(contentScript);
    }
  }
  async function reloadManifestContentScriptMv3(contentScript) {
    const id = `wxt:${contentScript.js[0]}`;
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const existing = registered.find((cs) => cs.id === id);
    if (existing) {
      logger.debug("Updating content script", existing);
      await browser.scripting.updateContentScripts([{ ...contentScript, id }]);
    } else {
      logger.debug("Registering new content script...");
      await browser.scripting.registerContentScripts([{ ...contentScript, id }]);
    }
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadRuntimeContentScriptMv3(contentScript) {
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const matches = registered.filter((cs) => {
      var _a2, _b2;
      const hasJs = (_a2 = contentScript.js) == null ? void 0 : _a2.find((js) => {
        var _a3;
        return (_a3 = cs.js) == null ? void 0 : _a3.includes(js);
      });
      const hasCss = (_b2 = contentScript.css) == null ? void 0 : _b2.find((css) => {
        var _a3;
        return (_a3 = cs.css) == null ? void 0 : _a3.includes(css);
      });
      return hasJs || hasCss;
    });
    if (matches.length === 0) {
      logger.log(
        "Content script is not registered yet, nothing to reload",
        contentScript
      );
      return;
    }
    await browser.scripting.updateContentScripts(matches);
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadTabsForContentScript(contentScript) {
    const allTabs = await browser.tabs.query({});
    const matchPatterns = contentScript.matches.map(
      (match) => new MatchPattern(match)
    );
    const matchingTabs = allTabs.filter((tab) => {
      const url = tab.url;
      if (!url) return false;
      return !!matchPatterns.find((pattern) => pattern.includes(url));
    });
    await Promise.all(
      matchingTabs.map(async (tab) => {
        try {
          await browser.tabs.reload(tab.id);
        } catch (err) {
          logger.warn("Failed to reload tab:", err);
        }
      })
    );
  }
  async function reloadContentScriptMv2(_payload) {
    throw Error("TODO: reloadContentScriptMv2");
  }
  {
    try {
      const ws2 = getDevServerWebSocket();
      ws2.addWxtEventListener("wxt:reload-extension", () => {
        browser.runtime.reload();
      });
      ws2.addWxtEventListener("wxt:reload-content-script", (event) => {
        reloadContentScript(event.detail);
      });
      if (true) {
        ws2.addEventListener(
          "open",
          () => ws2.sendCustom("wxt:background-initialized")
        );
        keepServiceWorkerAlive();
      }
    } catch (err) {
      logger.error("Failed to setup web socket connection with dev server", err);
    }
    browser.commands.onCommand.addListener((command) => {
      if (command === "wxt:reload-extension") {
        browser.runtime.reload();
      }
    });
  }
  let result;
  try {
    initPlugins();
    result = definition.main();
    if (result instanceof Promise) {
      console.warn(
        "The background's main() function return a promise, but it must be synchronous"
      );
    }
  } catch (err) {
    logger.error("The background crashed on startup!");
    throw err;
  }
  const result$1 = result;
  return result$1;
}();
background;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1iYWNrZ3JvdW5kLm1qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Ad3h0LWRldi9icm93c2VyL3NyYy9pbmRleC5tanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvYnJvd3Nlci5tanMiLCIuLi8uLi9lbnRyeXBvaW50cy9iYWNrZ3JvdW5kLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0B3ZWJleHQtY29yZS9tYXRjaC1wYXR0ZXJucy9saWIvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUJhY2tncm91bmQoYXJnKSB7XG4gIGlmIChhcmcgPT0gbnVsbCB8fCB0eXBlb2YgYXJnID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB7IG1haW46IGFyZyB9O1xuICByZXR1cm4gYXJnO1xufVxuIiwiLy8gI3JlZ2lvbiBzbmlwcGV0XG5leHBvcnQgY29uc3QgYnJvd3NlciA9IGdsb2JhbFRoaXMuYnJvd3Nlcj8ucnVudGltZT8uaWRcbiAgPyBnbG9iYWxUaGlzLmJyb3dzZXJcbiAgOiBnbG9iYWxUaGlzLmNocm9tZTtcbi8vICNlbmRyZWdpb24gc25pcHBldFxuIiwiaW1wb3J0IHsgYnJvd3NlciBhcyBfYnJvd3NlciB9IGZyb20gXCJAd3h0LWRldi9icm93c2VyXCI7XG5leHBvcnQgY29uc3QgYnJvd3NlciA9IF9icm93c2VyO1xuZXhwb3J0IHt9O1xuIiwiZXhwb3J0IGRlZmF1bHQgZGVmaW5lQmFja2dyb3VuZCgoKSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiU3RpY2t5Tm90ZUFJOiBCYWNrZ3JvdW5kIHNjcmlwdCBsb2FkZWRcIik7XG5cbiAgLy8gSGFuZGxlIGV4dGVuc2lvbiBpbnN0YWxsYXRpb25cbiAgYnJvd3Nlci5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKChkZXRhaWxzKSA9PiB7XG4gICAgaWYgKGRldGFpbHMucmVhc29uID09PSBcImluc3RhbGxcIikge1xuICAgICAgY29uc29sZS5sb2coXCJTdGlja3lOb3RlQUk6IEV4dGVuc2lvbiBpbnN0YWxsZWRcIik7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgZGVmYXVsdCBzZXR0aW5nc1xuICAgICAgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgIFwic3RpY2t5LXNldHRpbmdzXCI6IHtcbiAgICAgICAgICBzdGVhbHRoTW9kZTogZmFsc2UsXG4gICAgICAgICAgYXV0b0hpZGU6IGZhbHNlLFxuICAgICAgICAgIG9wYWNpdHk6IDAuOTUsXG4gICAgICAgICAgd2lkZ2V0UG9zaXRpb246IHsgeDogMjAsIHk6IDIwIH0sXG4gICAgICAgIH0sXG4gICAgICAgIFwic3RpY2t5LW5vdGVzXCI6IFtdLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIE9wZW4gd2VsY29tZSB0YWJcbiAgICAgIGJyb3dzZXIudGFicy5jcmVhdGUoe1xuICAgICAgICB1cmw6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZsYW1lYmFtYm9vL1N0aWNreU5vdGVBSVwiLFxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBIYW5kbGUga2V5Ym9hcmQgY29tbWFuZHNcbiAgYnJvd3Nlci5jb21tYW5kcy5vbkNvbW1hbmQuYWRkTGlzdGVuZXIoKGNvbW1hbmQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIkNvbW1hbmQgcmVjZWl2ZWQ6XCIsIGNvbW1hbmQpO1xuXG4gICAgYnJvd3Nlci50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlIH0sICh0YWJzKSA9PiB7XG4gICAgICBjb25zdCBhY3RpdmVUYWIgPSB0YWJzWzBdO1xuICAgICAgaWYgKGFjdGl2ZVRhYiAmJiBhY3RpdmVUYWIuaWQpIHtcbiAgICAgICAgYnJvd3Nlci50YWJzXG4gICAgICAgICAgLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYi5pZCwge1xuICAgICAgICAgICAgYWN0aW9uOiBjb21tYW5kLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDb3VsZCBub3Qgc2VuZCBtZXNzYWdlIHRvIGNvbnRlbnQgc2NyaXB0OlwiLCBlcnJvcik7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIEhhbmRsZSBtZXNzYWdlcyBmcm9tIGNvbnRlbnQgc2NyaXB0IGFuZCBwb3B1cFxuICBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiQmFja2dyb3VuZCByZWNlaXZlZCBtZXNzYWdlOlwiLCBtZXNzYWdlKTtcblxuICAgIHN3aXRjaCAobWVzc2FnZS5hY3Rpb24pIHtcbiAgICAgIGNhc2UgXCJzYXZlLW5vdGVzXCI6XG4gICAgICAgIGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoeyBcInN0aWNreS1ub3Rlc1wiOiBtZXNzYWdlLm5vdGVzIH0pO1xuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImxvYWQtbm90ZXNcIjpcbiAgICAgICAgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChbXCJzdGlja3ktbm90ZXNcIl0sIChyZXN1bHQpID0+IHtcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBub3RlczogcmVzdWx0W1wic3RpY2t5LW5vdGVzXCJdIHx8IFtdIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIEtlZXAgbWVzc2FnZSBjaGFubmVsIG9wZW4gZm9yIGFzeW5jIHJlc3BvbnNlXG5cbiAgICAgIGNhc2UgXCJzYXZlLXNldHRpbmdzXCI6XG4gICAgICAgIGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoeyBcInN0aWNreS1zZXR0aW5nc1wiOiBtZXNzYWdlLnNldHRpbmdzIH0pO1xuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImxvYWQtc2V0dGluZ3NcIjpcbiAgICAgICAgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChbXCJzdGlja3ktc2V0dGluZ3NcIl0sIChyZXN1bHQpID0+IHtcbiAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgICAgc2V0dGluZ3M6IHJlc3VsdFtcInN0aWNreS1zZXR0aW5nc1wiXSB8fCB7XG4gICAgICAgICAgICAgIHN0ZWFsdGhNb2RlOiBmYWxzZSxcbiAgICAgICAgICAgICAgYXV0b0hpZGU6IGZhbHNlLFxuICAgICAgICAgICAgICBvcGFjaXR5OiAwLjk1LFxuICAgICAgICAgICAgICB3aWRnZXRQb3NpdGlvbjogeyB4OiAyMCwgeTogMjAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gS2VlcCBtZXNzYWdlIGNoYW5uZWwgb3BlbiBmb3IgYXN5bmMgcmVzcG9uc2VcblxuICAgICAgY2FzZSBcImdldC10YWItaW5mb1wiOlxuICAgICAgICBpZiAoc2VuZGVyLnRhYikge1xuICAgICAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICB0YWJJZDogc2VuZGVyLnRhYi5pZCxcbiAgICAgICAgICAgIHVybDogc2VuZGVyLnRhYi51cmwsXG4gICAgICAgICAgICB0aXRsZTogc2VuZGVyLnRhYi50aXRsZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS5sb2coXCJVbmtub3duIGFjdGlvbjpcIiwgbWVzc2FnZS5hY3Rpb24pO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gSGFuZGxlIHRhYiB1cGRhdGVzIHRvIHJlaW5qZWN0IGNvbnRlbnQgc2NyaXB0IGlmIG5lZWRlZFxuICBicm93c2VyLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKCh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSA9PiB7XG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09PSBcImNvbXBsZXRlXCIgJiYgdGFiLnVybCkge1xuICAgICAgLy8gU2tpcCBjaHJvbWU6Ly8gYW5kIGV4dGVuc2lvbiBwYWdlc1xuICAgICAgaWYgKHRhYi51cmwuc3RhcnRzV2l0aChcImNocm9tZTovL1wiKSB8fCB0YWIudXJsLnN0YXJ0c1dpdGgoXCJjaHJvbWUtZXh0ZW5zaW9uOi8vXCIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coXCJUYWIgdXBkYXRlZDpcIiwgdGFiLnVybCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBDb250ZXh0IG1lbnUgZm9yIHF1aWNrIG5vdGUgY3JlYXRpb25cbiAgYnJvd3Nlci5jb250ZXh0TWVudXMuY3JlYXRlKHtcbiAgICBpZDogXCJjcmVhdGUtbm90ZVwiLFxuICAgIHRpdGxlOiBcIkNyZWF0ZSBTdGlja3kgTm90ZVwiLFxuICAgIGNvbnRleHRzOiBbXCJzZWxlY3Rpb25cIiwgXCJwYWdlXCJdLFxuICB9KTtcblxuICBicm93c2VyLmNvbnRleHRNZW51cy5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoKGluZm8sIHRhYikgPT4ge1xuICAgIGlmIChpbmZvLm1lbnVJdGVtSWQgPT09IFwiY3JlYXRlLW5vdGVcIiAmJiB0YWIgJiYgdGFiLmlkKSB7XG4gICAgICBicm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCB7XG4gICAgICAgIGFjdGlvbjogXCJjcmVhdGUtbm90ZS13aXRoLXNlbGVjdGlvblwiLFxuICAgICAgICBzZWxlY3RlZFRleHQ6IGluZm8uc2VsZWN0aW9uVGV4dCB8fCBcIlwiLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufSk7XG4iLCIvLyBzcmMvaW5kZXgudHNcbnZhciBfTWF0Y2hQYXR0ZXJuID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihtYXRjaFBhdHRlcm4pIHtcbiAgICBpZiAobWF0Y2hQYXR0ZXJuID09PSBcIjxhbGxfdXJscz5cIikge1xuICAgICAgdGhpcy5pc0FsbFVybHMgPSB0cnVlO1xuICAgICAgdGhpcy5wcm90b2NvbE1hdGNoZXMgPSBbLi4uX01hdGNoUGF0dGVybi5QUk9UT0NPTFNdO1xuICAgICAgdGhpcy5ob3N0bmFtZU1hdGNoID0gXCIqXCI7XG4gICAgICB0aGlzLnBhdGhuYW1lTWF0Y2ggPSBcIipcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZ3JvdXBzID0gLyguKik6XFwvXFwvKC4qPykoXFwvLiopLy5leGVjKG1hdGNoUGF0dGVybik7XG4gICAgICBpZiAoZ3JvdXBzID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKG1hdGNoUGF0dGVybiwgXCJJbmNvcnJlY3QgZm9ybWF0XCIpO1xuICAgICAgY29uc3QgW18sIHByb3RvY29sLCBob3N0bmFtZSwgcGF0aG5hbWVdID0gZ3JvdXBzO1xuICAgICAgdmFsaWRhdGVQcm90b2NvbChtYXRjaFBhdHRlcm4sIHByb3RvY29sKTtcbiAgICAgIHZhbGlkYXRlSG9zdG5hbWUobWF0Y2hQYXR0ZXJuLCBob3N0bmFtZSk7XG4gICAgICB2YWxpZGF0ZVBhdGhuYW1lKG1hdGNoUGF0dGVybiwgcGF0aG5hbWUpO1xuICAgICAgdGhpcy5wcm90b2NvbE1hdGNoZXMgPSBwcm90b2NvbCA9PT0gXCIqXCIgPyBbXCJodHRwXCIsIFwiaHR0cHNcIl0gOiBbcHJvdG9jb2xdO1xuICAgICAgdGhpcy5ob3N0bmFtZU1hdGNoID0gaG9zdG5hbWU7XG4gICAgICB0aGlzLnBhdGhuYW1lTWF0Y2ggPSBwYXRobmFtZTtcbiAgICB9XG4gIH1cbiAgaW5jbHVkZXModXJsKSB7XG4gICAgaWYgKHRoaXMuaXNBbGxVcmxzKVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgY29uc3QgdSA9IHR5cGVvZiB1cmwgPT09IFwic3RyaW5nXCIgPyBuZXcgVVJMKHVybCkgOiB1cmwgaW5zdGFuY2VvZiBMb2NhdGlvbiA/IG5ldyBVUkwodXJsLmhyZWYpIDogdXJsO1xuICAgIHJldHVybiAhIXRoaXMucHJvdG9jb2xNYXRjaGVzLmZpbmQoKHByb3RvY29sKSA9PiB7XG4gICAgICBpZiAocHJvdG9jb2wgPT09IFwiaHR0cFwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0h0dHBNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJodHRwc1wiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0h0dHBzTWF0Y2godSk7XG4gICAgICBpZiAocHJvdG9jb2wgPT09IFwiZmlsZVwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0ZpbGVNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJmdHBcIilcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNGdHBNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJ1cm5cIilcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNVcm5NYXRjaCh1KTtcbiAgICB9KTtcbiAgfVxuICBpc0h0dHBNYXRjaCh1cmwpIHtcbiAgICByZXR1cm4gdXJsLnByb3RvY29sID09PSBcImh0dHA6XCIgJiYgdGhpcy5pc0hvc3RQYXRoTWF0Y2godXJsKTtcbiAgfVxuICBpc0h0dHBzTWF0Y2godXJsKSB7XG4gICAgcmV0dXJuIHVybC5wcm90b2NvbCA9PT0gXCJodHRwczpcIiAmJiB0aGlzLmlzSG9zdFBhdGhNYXRjaCh1cmwpO1xuICB9XG4gIGlzSG9zdFBhdGhNYXRjaCh1cmwpIHtcbiAgICBpZiAoIXRoaXMuaG9zdG5hbWVNYXRjaCB8fCAhdGhpcy5wYXRobmFtZU1hdGNoKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGhvc3RuYW1lTWF0Y2hSZWdleHMgPSBbXG4gICAgICB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLmhvc3RuYW1lTWF0Y2gpLFxuICAgICAgdGhpcy5jb252ZXJ0UGF0dGVyblRvUmVnZXgodGhpcy5ob3N0bmFtZU1hdGNoLnJlcGxhY2UoL15cXCpcXC4vLCBcIlwiKSlcbiAgICBdO1xuICAgIGNvbnN0IHBhdGhuYW1lTWF0Y2hSZWdleCA9IHRoaXMuY29udmVydFBhdHRlcm5Ub1JlZ2V4KHRoaXMucGF0aG5hbWVNYXRjaCk7XG4gICAgcmV0dXJuICEhaG9zdG5hbWVNYXRjaFJlZ2V4cy5maW5kKChyZWdleCkgPT4gcmVnZXgudGVzdCh1cmwuaG9zdG5hbWUpKSAmJiBwYXRobmFtZU1hdGNoUmVnZXgudGVzdCh1cmwucGF0aG5hbWUpO1xuICB9XG4gIGlzRmlsZU1hdGNoKHVybCkge1xuICAgIHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiBmaWxlOi8vIHBhdHRlcm4gbWF0Y2hpbmcuIE9wZW4gYSBQUiB0byBhZGQgc3VwcG9ydFwiKTtcbiAgfVxuICBpc0Z0cE1hdGNoKHVybCkge1xuICAgIHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiBmdHA6Ly8gcGF0dGVybiBtYXRjaGluZy4gT3BlbiBhIFBSIHRvIGFkZCBzdXBwb3J0XCIpO1xuICB9XG4gIGlzVXJuTWF0Y2godXJsKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQ6IHVybjovLyBwYXR0ZXJuIG1hdGNoaW5nLiBPcGVuIGEgUFIgdG8gYWRkIHN1cHBvcnRcIik7XG4gIH1cbiAgY29udmVydFBhdHRlcm5Ub1JlZ2V4KHBhdHRlcm4pIHtcbiAgICBjb25zdCBlc2NhcGVkID0gdGhpcy5lc2NhcGVGb3JSZWdleChwYXR0ZXJuKTtcbiAgICBjb25zdCBzdGFyc1JlcGxhY2VkID0gZXNjYXBlZC5yZXBsYWNlKC9cXFxcXFwqL2csIFwiLipcIik7XG4gICAgcmV0dXJuIFJlZ0V4cChgXiR7c3RhcnNSZXBsYWNlZH0kYCk7XG4gIH1cbiAgZXNjYXBlRm9yUmVnZXgoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIik7XG4gIH1cbn07XG52YXIgTWF0Y2hQYXR0ZXJuID0gX01hdGNoUGF0dGVybjtcbk1hdGNoUGF0dGVybi5QUk9UT0NPTFMgPSBbXCJodHRwXCIsIFwiaHR0cHNcIiwgXCJmaWxlXCIsIFwiZnRwXCIsIFwidXJuXCJdO1xudmFyIEludmFsaWRNYXRjaFBhdHRlcm4gPSBjbGFzcyBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWF0Y2hQYXR0ZXJuLCByZWFzb24pIHtcbiAgICBzdXBlcihgSW52YWxpZCBtYXRjaCBwYXR0ZXJuIFwiJHttYXRjaFBhdHRlcm59XCI6ICR7cmVhc29ufWApO1xuICB9XG59O1xuZnVuY3Rpb24gdmFsaWRhdGVQcm90b2NvbChtYXRjaFBhdHRlcm4sIHByb3RvY29sKSB7XG4gIGlmICghTWF0Y2hQYXR0ZXJuLlBST1RPQ09MUy5pbmNsdWRlcyhwcm90b2NvbCkgJiYgcHJvdG9jb2wgIT09IFwiKlwiKVxuICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKFxuICAgICAgbWF0Y2hQYXR0ZXJuLFxuICAgICAgYCR7cHJvdG9jb2x9IG5vdCBhIHZhbGlkIHByb3RvY29sICgke01hdGNoUGF0dGVybi5QUk9UT0NPTFMuam9pbihcIiwgXCIpfSlgXG4gICAgKTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlSG9zdG5hbWUobWF0Y2hQYXR0ZXJuLCBob3N0bmFtZSkge1xuICBpZiAoaG9zdG5hbWUuaW5jbHVkZXMoXCI6XCIpKVxuICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKG1hdGNoUGF0dGVybiwgYEhvc3RuYW1lIGNhbm5vdCBpbmNsdWRlIGEgcG9ydGApO1xuICBpZiAoaG9zdG5hbWUuaW5jbHVkZXMoXCIqXCIpICYmIGhvc3RuYW1lLmxlbmd0aCA+IDEgJiYgIWhvc3RuYW1lLnN0YXJ0c1dpdGgoXCIqLlwiKSlcbiAgICB0aHJvdyBuZXcgSW52YWxpZE1hdGNoUGF0dGVybihcbiAgICAgIG1hdGNoUGF0dGVybixcbiAgICAgIGBJZiB1c2luZyBhIHdpbGRjYXJkICgqKSwgaXQgbXVzdCBnbyBhdCB0aGUgc3RhcnQgb2YgdGhlIGhvc3RuYW1lYFxuICAgICk7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZVBhdGhuYW1lKG1hdGNoUGF0dGVybiwgcGF0aG5hbWUpIHtcbiAgcmV0dXJuO1xufVxuZXhwb3J0IHtcbiAgSW52YWxpZE1hdGNoUGF0dGVybixcbiAgTWF0Y2hQYXR0ZXJuXG59O1xuIl0sIm5hbWVzIjpbImJyb3dzZXIiLCJfYnJvd3NlciIsInJlc3VsdCJdLCJtYXBwaW5ncyI6Ijs7O0FBQU8sV0FBUyxpQkFBaUIsS0FBSztBQUNwQyxRQUFJLE9BQU8sUUFBUSxPQUFPLFFBQVEsV0FBWSxRQUFPLEVBQUUsTUFBTSxJQUFHO0FBQ2hFLFdBQU87QUFBQSxFQUNUO0FDRk8sUUFBTUEsY0FBVSxzQkFBVyxZQUFYLG1CQUFvQixZQUFwQixtQkFBNkIsTUFDaEQsV0FBVyxVQUNYLFdBQVc7QUNGUixRQUFNLFVBQVVDO0FDRHZCLFFBQUEsYUFBQSxpQkFBQSxNQUFBO0FBQ0UsWUFBQSxJQUFBLHdDQUFBO0FBR0EsWUFBQSxRQUFBLFlBQUEsWUFBQSxDQUFBLFlBQUE7QUFDRSxVQUFBLFFBQUEsV0FBQSxXQUFBO0FBQ0UsZ0JBQUEsSUFBQSxtQ0FBQTtBQUdBLGdCQUFBLFFBQUEsTUFBQSxJQUFBO0FBQUEsVUFBMEIsbUJBQUE7QUFBQSxZQUNMLGFBQUE7QUFBQSxZQUNKLFVBQUE7QUFBQSxZQUNILFNBQUE7QUFBQSxZQUNELGdCQUFBLEVBQUEsR0FBQSxJQUFBLEdBQUEsR0FBQTtBQUFBLFVBQ3NCO0FBQUEsVUFDakMsZ0JBQUEsQ0FBQTtBQUFBLFFBQ2lCLENBQUE7QUFJbkIsZ0JBQUEsS0FBQSxPQUFBO0FBQUEsVUFBb0IsS0FBQTtBQUFBLFFBQ2IsQ0FBQTtBQUFBLE1B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
