import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "StickyNoteAI - Student Study Extension",
    description: "Discrete sticky notes for students taking online classes. Stay organized without getting caught!",
    version: "1.0.0",
    permissions: ["storage", "activeTab", "scripting"],
    host_permissions: ["<all_urls>"],
    action: {
      default_title: "StickyNoteAI",
      default_popup: "entrypoints/popup/index.html",
    },
    web_accessible_resources: [
      {
        resources: ["assets/*", "smilyface.gif", "add2.png"],
        matches: ["<all_urls>"],
      },
    ],
    commands: {
      "toggle-widget": {
        suggested_key: {
          default: "Alt+Shift+W",
          mac: "Alt+Shift+W",
        },
        description: "Toggle widget visibility",
      },
      "new-note": {
        suggested_key: {
          default: "Alt+Shift+N",
          mac: "Alt+Shift+N",
        },
        description: "Create new note",
      },
    },
  },
});
