# StickyNoteAI - Stealth Study Extension 📚

## Project Overview

A Chrome extension designed specifically for students to take discrete notes during online classes without getting caught. Features draggable widgets, quick note creation, and a stealth-first design.

## Core Features

### 🎯 Primary Functionality

- **Draggable Floating Widget**: Small, discrete widget that can be moved around the browser window
- **Quick Note Creation**: One-click note addition with markdown support
- **Stealth Mode**: Minimal, teacher-proof interface design
- **Instant Hide**: Quick escape mechanism to hide all notes
- **Persistent Storage**: Notes saved across browser sessions

### 🛠 Technical Architecture

- **Framework**: WXT (Web Extension Framework)
- **Frontend**: React + TypeScript
- **Styling**: CSS with custom animations
- **Storage**: Chrome Extension Storage API
- **Content Scripts**: DOM manipulation for widget injection

## 10-Hour Hackathon Roadmap

### Hour 1-2: Foundation & Widget System

- [x] Project setup with WXT + React
- [ ] Create draggable floating widget component
- [ ] Implement widget positioning and drag functionality
- [ ] Add widget to content script injection
- [ ] Basic CSS for minimal, discrete appearance

### Hour 3-4: Note Management Core

- [ ] Design expandable widget with action buttons
- [ ] Implement + button for new note creation
- [ ] Create note editor modal/popup
- [ ] Add basic text editing capabilities
- [ ] Implement note saving mechanism

### Hour 5-6: Advanced Note Features

- [ ] Add markdown support for notes
- [ ] Implement note categories/tags
- [ ] Create note list view within widget
- [ ] Add edit/delete functionality for existing notes
- [ ] Implement note search functionality

### Hour 7-8: Stealth & UX Features

- [ ] Implement "panic button" - instant hide all notes
- [ ] Add keyboard shortcuts (Ctrl+H to hide, Ctrl+S for new note)
- [ ] Create transparency/opacity controls
- [ ] Add minimized state for widget
- [ ] Implement auto-hide timer

### Hour 9-10: Polish & Deployment

- [ ] Cross-page persistence of widget position
- [ ] Export/import notes functionality
- [ ] Extension popup dashboard
- [ ] Performance optimization
- [ ] Package for Chrome Web Store

## Detailed Feature Specifications

### 1. Floating Widget System

```
┌─────────────────┐
│ 📝 [+] [≡] [×] │  ← Always visible, draggable
└─────────────────┘
        ↓ (on hover/click)
┌─────────────────┐
│ 📝 [+] [≡] [×] │
│ ┌─────────────┐ │
│ │ Quick Notes │ │
│ │ - Class 1   │ │
│ │ - Class 2   │ │
│ │ + Add Note  │ │
│ └─────────────┘ │
└─────────────────┘
```

### 2. Note Creation Flow

1. Click [+] button → Opens note editor
2. Type content with markdown support
3. Auto-save every 2 seconds
4. Quick close with Esc key
5. Notes appear in widget list

### 3. Stealth Features

- **Minimal Size**: Widget starts as 60x30px
- **Discrete Colors**: Gray/translucent design
- **Quick Hide**: Double-click to minimize
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+H`: Hide/show all notes
  - `Ctrl+Shift+N`: New note
  - `Esc`: Close current note editor

### 4. Storage Structure

```javascript
{
  notes: [
    {
      id: "uuid",
      title: "Class Notes",
      content: "# Important points\n- Remember this",
      createdAt: "timestamp",
      updatedAt: "timestamp",
      tags: ["class", "important"]
    }
  ],
  settings: {
    widgetPosition: { x: 100, y: 100 },
    opacity: 0.8,
    stealthMode: true,
    autoHide: false
  }
}
```

## Technical Implementation Priority

### High Priority (Must Have)

1. Draggable widget injection via content script
2. Note CRUD operations with storage
3. Panic hide functionality
4. Cross-page persistence

### Medium Priority (Should Have)

1. Markdown rendering
2. Keyboard shortcuts
3. Note categories
4. Export functionality

### Low Priority (Nice to Have)

1. AI-powered note suggestions
2. OCR for handwritten notes
3. Integration with study platforms
4. Collaborative notes

## Development Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Create extension package
npm run zip
```

## Success Metrics

- Widget appears on any webpage
- Notes persist across browser sessions
- Panic hide works instantly
- Extension loads in <100ms
- Widget stays draggable and responsive

## Future Enhancements (Post-Hackathon)

- AI-powered note summarization
- Integration with Google Classroom
- Voice-to-text note creation
- Team collaboration features
- Analytics dashboard for study patterns

---

_Built for students, by students. Study smart, stay discrete! 🤫_
