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
    text: string;
    noteColors: string[];
  };
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [stealthMode, setStealthMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "settings" | "themes">("notes");
  const [activeTheme, setActiveTheme] = useState<string>("default");

  // Available themes
  const themes: Theme[] = [
    {
      id: 'default',
      name: 'Classic Colorful',
      description: 'The original colorful sticky notes experience',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        background: '#f8fafc',
        text: '#1a202c',
        noteColors: ['#fef3c7', '#dbeafe', '#fce7f3', '#ecfdf5', '#fed7d7', '#e6fffa']
      }
    },
    {
      id: 'autumn',
      name: 'Autumn Vibes',
      description: 'Warm earth tones inspired by fall colors',
      colors: {
        primary: '#d97706',
        secondary: '#dc2626',
        accent: '#f59e0b',
        background: '#fef7ed',
        text: '#451a03',
        noteColors: ['#fed7aa', '#fecaca', '#fde68a', '#d1fae5', '#ddd6fe', '#f3e8ff']
      }
    }
  ];  useEffect(() => {
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
          setActiveTheme(newSettings.theme || "default");
        }
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);

    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    const theme = themes.find(t => t.id === activeTheme) || themes[0];
    document.documentElement.style.setProperty('--theme-primary', theme.colors.primary);
    document.documentElement.style.setProperty('--theme-secondary', theme.colors.secondary);
    document.documentElement.style.setProperty('--theme-accent', theme.colors.accent);
    document.documentElement.style.setProperty('--theme-background', theme.colors.background);
    
    // Set note colors
    theme.colors.noteColors.forEach((color, index) => {
      document.documentElement.style.setProperty(`--theme-note-${index + 1}`, color);
    });

    // Set theme class on body
    document.body.className = `theme-${activeTheme}`;
  }, [activeTheme]);

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
          setActiveTheme(settings.theme || "default");
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
    saveSettings({ stealthMode: newStealthMode, theme: activeTheme });

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
    const selectedTheme = themes.find(t => t.id === themeId);
    
    // Save theme selection
    saveSettings({ stealthMode, theme: themeId });

    // Apply theme colors to popup CSS custom properties
    if (selectedTheme) {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', selectedTheme.colors.primary);
      root.style.setProperty('--theme-secondary', selectedTheme.colors.secondary);
      root.style.setProperty('--theme-background', selectedTheme.colors.background);
      root.style.setProperty('--theme-text', selectedTheme.colors.text);
      
      // Apply note colors
      selectedTheme.colors.noteColors.forEach((color, index) => {
        root.style.setProperty(`--theme-note-color-${index}`, color);
      });
    }

    // Send message to content script to apply theme
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id && selectedTheme) {
        browser.tabs.sendMessage(tabs[0].id, {
          action: "themeChanged",
          theme: selectedTheme,
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
            <h2>Themes</h2>
            <p className="section-description">Choose your preferred theme to customize the look and feel of your notes</p>
            
            <div className="themes-grid">
              {themes.map((theme) => (
                <div key={theme.id} className={`theme-card ${activeTheme === theme.id ? 'active' : ''}`}>
                  <div className="theme-preview">
                    <div className="preview-header" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
                      <div className="preview-title">StickyNoteAI</div>
                    </div>
                    <div className="preview-content" style={{ background: theme.colors.background }}>
                      <div className="preview-notes">
                        {theme.colors.noteColors.slice(0, 3).map((color, index) => (
                          <div 
                            key={index} 
                            className="preview-note" 
                            style={{ 
                              background: color,
                              transform: `rotate(${(index - 1) * 2}deg)`
                            }}
                          >
                            Sample Note {index + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="theme-info">
                    <h3>{theme.name}</h3>
                    <p>{theme.description}</p>
                    
                    <button 
                      className={`theme-button ${activeTheme === theme.id ? 'active' : ''}`}
                      onClick={() => selectTheme(theme.id)}
                    >
                      {activeTheme === theme.id ? '✓ Active' : 'Select Theme'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="theme-note">
              <p><strong>💡 Pro Tip:</strong> Your selected theme will apply to all notes across all websites!</p>
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
