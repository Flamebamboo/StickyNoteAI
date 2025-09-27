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

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    noteColors: string[];
  };
}

const themes: Theme[] = [
  {
    id: 'autumn',
    name: 'Autumn',
    description: 'Warm autumn colors with orange, red, and golden tones',
    colors: {
      primary: 'linear-gradient(135deg, #ff6b35 0%, #d84315 100%)',
      secondary: 'linear-gradient(135deg, #ff8f00 0%, #ef6c00 100%)',
      accent: '#8d4004',
      background: 'linear-gradient(145deg, #fff3e0, #ffe0b2)',
      noteColors: [
        'rgba(255, 183, 77, 0.85)',  // Golden yellow
        'rgba(255, 138, 101, 0.85)', // Coral orange
        'rgba(198, 40, 40, 0.85)',   // Deep red
        'rgba(191, 54, 12, 0.85)',   // Burnt orange
        'rgba(239, 108, 0, 0.85)',   // Orange
        'rgba(130, 119, 23, 0.85)',  // Golden brown
      ]
    }
  }
];

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [stealthMode, setStealthMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "themes" | "settings">("notes");
  const [activeTheme, setActiveTheme] = useState<string>('default');

  useEffect(() => {
    // Load notes from storage
    loadNotes();
    loadSettings();

    // Listen for storage changes to keep popup in sync
    const handleStorageChange = (changes: any) => {
      if (changes["sticky-notes"]) {
        setNotes(changes["sticky-notes"].newValue || []);
      }
      if (changes["sticky-settings"]) {
        const newSettings = changes["sticky-settings"].newValue;
        if (newSettings) {
          setStealthMode(newSettings.stealthMode || false);
        }
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);

    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadNotes = async () => {
    try {
      browser.storage.local.get("sticky-notes", (result) => {
        const notes = result["sticky-notes"] || [];
        setNotes(notes);
      });
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  };

  const loadSettings = async () => {
    try {
      browser.storage.local.get("sticky-settings", (result) => {
        const settings = result["sticky-settings"];
        if (settings) {
          setStealthMode(settings.stealthMode || false);
          const theme = settings.activeTheme || 'default';
          setActiveTheme(theme);
          
          // Apply theme to popup body
          if (theme === 'default') {
            document.body.removeAttribute('data-theme');
          } else {
            document.body.setAttribute('data-theme', theme);
          }
        }
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = (newSettings: any) => {
    browser.storage.local.set({ "sticky-settings": newSettings });
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    browser.storage.local.set({ "sticky-notes": updatedNotes });
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
    saveSettings({ stealthMode: newStealthMode, activeTheme });

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

  const selectTheme = (themeId: string) => {
    setActiveTheme(themeId);
    saveSettings({ stealthMode, activeTheme: themeId });

    // Apply theme to popup body
    if (themeId === 'default') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', themeId);
    }

    // Send theme change to content script
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        browser.tabs.sendMessage(tabs[0].id, {
          action: "changeTheme",
          themeId: themeId,
          theme: themes.find(t => t.id === themeId),
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
          <button className={`tab ${activeTab === "themes" ? "active" : ""}`} onClick={() => setActiveTab("themes")}>
            🎨 Themes
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
                  Press <kbd>Alt+Shift+N</kbd> to create a new note anywhere on the web!
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
                      Use <kbd>Alt+Shift+W</kbd> to hide/show
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

        {activeTab === "themes" && (
          <div className="themes-section">
            <div className="section-header">
              <h2>Themes</h2>
              <div className="current-theme">
                Current: <span className="theme-name">{activeTheme === 'default' ? 'Default' : themes.find(t => t.id === activeTheme)?.name}</span>
              </div>
            </div>

            <div className="theme-description">
              <p>Choose a theme to change the overall look and feel of your sticky notes experience!</p>
            </div>

            <div className="themes-grid">
              {/* Default Theme */}
              <div className={`theme-card ${activeTheme === 'default' ? 'active' : ''}`}>
                <div className="theme-preview default-preview">
                  <div className="preview-note">Default</div>
                  <div className="preview-note">Notes</div>
                </div>
                <div className="theme-info">
                  <h3>Default</h3>
                  <p>Classic sticky notes with soft pastel colors</p>
                  <button 
                    className={`theme-btn ${activeTheme === 'default' ? 'active' : ''}`}
                    onClick={() => selectTheme('default')}
                  >
                    {activeTheme === 'default' ? '✓ Active' : 'Activate'}
                  </button>
                </div>
              </div>

              {/* Themes Grid */}
              {themes.map((theme) => (
                <div key={theme.id} className={`theme-card ${activeTheme === theme.id ? 'active' : ''}`}>
                  <div className={`theme-preview ${theme.id}-preview`}>
                    <div 
                      className="preview-note"
                      style={{ background: theme.colors.noteColors[0] }}
                    >
                      Note 1
                    </div>
                    <div 
                      className="preview-note"
                      style={{ background: theme.colors.noteColors[1] }}
                    >
                      Note 2
                    </div>
                  </div>
                  <div className="theme-info">
                    <h3>{theme.name}</h3>
                    <p>{theme.description}</p>
                    <button 
                      className={`theme-btn ${activeTheme === theme.id ? 'active' : ''}`}
                      onClick={() => selectTheme(theme.id)}
                    >
                      {activeTheme === theme.id ? '✓ Active' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="theme-note">
              <p><strong>Note:</strong> Theme changes will apply to new notes. Existing notes will keep their current appearance until refreshed.</p>
            </div>
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
                  <kbd>Alt + Shift + N</kbd>
                  <span>New Note</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Alt + Shift + W</kbd>
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
