export default defineBackground(() => {
  console.log("StickyNoteAI: Background script loaded");

  // Handle extension installation
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      console.log("StickyNoteAI: Extension installed");

      // Initialize default settings
      browser.storage.local.set({
        "sticky-settings": {
          stealthMode: false,
          autoHide: false,
          opacity: 0.95,
          widgetPosition: { x: 20, y: 20 },
        },
        "sticky-notes": [],
      });

      // Open welcome tab
      browser.tabs.create({
        url: "https://github.com/Flamebamboo/StickyNoteAI",
      });
    }
  });

  // Handle keyboard commands
  browser.commands.onCommand.addListener((command) => {
    console.log("Command received:", command);

    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.id) {
        browser.tabs
          .sendMessage(activeTab.id, {
            action: command,
            timestamp: Date.now(),
          })
          .catch((error) => {
            console.log("Could not send message to content script:", error);
          });
      }
    });
  });

  // Handle messages from content script and popup
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background received message:", message);

    switch (message.action) {
      case "save-notes":
        browser.storage.local.set({ "sticky-notes": message.notes });
        sendResponse({ success: true });
        break;

      case "load-notes":
        browser.storage.local.get(["sticky-notes"], (result) => {
          sendResponse({ notes: result["sticky-notes"] || [] });
        });
        return true; // Keep message channel open for async response

      case "save-settings":
        browser.storage.local.set({ "sticky-settings": message.settings });
        sendResponse({ success: true });
        break;

      case "load-settings":
        browser.storage.local.get(["sticky-settings"], (result) => {
          sendResponse({
            settings: result["sticky-settings"] || {
              stealthMode: false,
              autoHide: false,
              opacity: 0.95,
              widgetPosition: { x: 20, y: 20 },
            },
          });
        });
        return true; // Keep message channel open for async response

      case "get-tab-info":
        if (sender.tab) {
          sendResponse({
            tabId: sender.tab.id,
            url: sender.tab.url,
            title: sender.tab.title,
          });
        }
        break;

      default:
        console.log("Unknown action:", message.action);
    }
  });

  // Handle tab updates to reinject content script if needed
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
      // Skip chrome:// and extension pages
      if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
        return;
      }

      console.log("Tab updated:", tab.url);
    }
  });

  // Context menu for quick note creation
  browser.contextMenus.create({
    id: "create-note",
    title: "Create Sticky Note",
    contexts: ["selection", "page"],
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "create-note" && tab && tab.id) {
      browser.tabs.sendMessage(tab.id, {
        action: "create-note-with-selection",
        selectedText: info.selectionText || "",
        timestamp: Date.now(),
      });
    }
  });
});
