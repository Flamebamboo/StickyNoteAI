import { useState, useEffect } from "react";
import wxtLogo from "@/public/wxt.svg";
import "./App.css";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [stealthMode, setStealthMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "settings">("notes");

  useEffect(() => {
    // Load notes from storage
    loadNotes();
    loadSettings();
  }, []);

  const loadNotes = async () => {
    try {
      // In a real extension, we'd use chrome.storage.local
      const storedNotes = localStorage.getItem("sticky-notes");
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const settings = localStorage.getItem("sticky-settings");
      if (settings) {
        const { stealthMode: storedStealth } = JSON.parse(settings);
        setStealthMode(storedStealth || false);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = (newSettings: any) => {
    localStorage.setItem("sticky-settings", JSON.stringify(newSettings));
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem("sticky-notes", JSON.stringify(updatedNotes));
  };

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sticky-notes-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleStealthMode = () => {
    const newStealthMode = !stealthMode;
    setStealthMode(newStealthMode);
    saveSettings({ stealthMode: newStealthMode });

    // Send message to content script to toggle stealth
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        browser.tabs.sendMessage(tabs[0].id, {
          action: "toggleStealth",
          enabled: newStealthMode,
        });
      }
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-section">
          <img src={wxtLogo} className="logo" alt="StickyNoteAI" />
          <h1>StickyNoteAI</h1>
        </div>
        <div className="tab-nav">
          <button className={`tab ${activeTab === "notes" ? "active" : ""}`} onClick={() => setActiveTab("notes")}>
            📝 Notes
          </button>
          <button className={`tab ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
            ⚙️ Settings
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === "notes" && (
          <div className="notes-section">
            <div className="section-header">
              <h2>Your Notes ({notes.length})</h2>
              <button className="btn-export" onClick={exportNotes}>
                📤 Export
              </button>
            </div>

            <div className="quick-actions">
              <div className="action-card">
                <h3>Quick Start</h3>
                <p>
                  Press <kbd>Ctrl+Shift+N</kbd> to create a new note anywhere on the web!
                </p>
              </div>
            </div>

            {notes.length === 0 ? (
              <div className="empty-state">
                <p>No notes yet! Visit any webpage and look for the floating widget to get started.</p>
                <div className="help-text">
                  <strong>How to use:</strong>
                  <ul>
                    <li>Look for the 📝 widget on any webpage</li>
                    <li>Click the + button to add a note</li>
                    <li>Drag the widget to move it around</li>
                    <li>
                      Use <kbd>Ctrl+Shift+H</kbd> to hide/show
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="notes-list">
                {notes.map((note) => (
                  <div key={note.id} className="note-card">
                    <div className="note-header">
                      <h3>{note.title}</h3>
                      <button className="btn-delete" onClick={() => deleteNote(note.id)} title="Delete note">
                        🗑️
                      </button>
                    </div>
                    <p className="note-content">{note.content}</p>
                    <div className="note-meta">Created: {new Date(note.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="settings-section">
            <h2>Settings</h2>

            <div className="setting-group">
              <div className="setting-item">
                <label className="setting-label">
                  <input type="checkbox" checked={stealthMode} onChange={toggleStealthMode} />
                  <span className="setting-title">Stealth Mode</span>
                </label>
                <p className="setting-description">Makes the widget more transparent and discrete</p>
              </div>
            </div>

            <div className="setting-group">
              <h3>Keyboard Shortcuts</h3>
              <div className="shortcuts-list">
                <div className="shortcut-item">
                  <kbd>Ctrl + Shift + N</kbd>
                  <span>New Note</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Ctrl + Shift + H</kbd>
                  <span>Hide/Show Widget</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Esc</kbd>
                  <span>Close Note Editor</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Double Click</kbd>
                  <span>Minimize Widget</span>
                </div>
              </div>
            </div>

            <div className="setting-group">
              <h3>About</h3>
              <p>StickyNoteAI v1.0 - Built for students who need to take discrete notes during online classes.</p>
              <div className="credits">
                <p>🚀 Perfect for hackathons and study sessions!</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
