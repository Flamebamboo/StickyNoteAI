# 🍂 StickyNoteAI - Professional Autumn-Themed Chrome Extension

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?style=for-the-badge&logo=google-chrome)](https://github.com/Flamebamboo/StickyNoteAI)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![WXT Framework](https://img.shields.io/badge/WXT-Framework-orange?style=for-the-badge)](https://wxt.dev/)

> **The ultimate sticky notes extension for students and professionals** - Take discrete, beautiful notes anywhere on the web with AI-powered organization and stunning autumn aesthetics.

![StickyNoteAI Banner](https://img.shields.io/badge/StickyNoteAI-v2.2-success?style=for-the-badge)

---

## 🌟 **Key Features**

### 📝 **Smart Note Management**
- **Floating Widget**: Discrete note-taking on any webpage
- **Drag & Drop**: Move notes freely across your screen
- **Auto-Save**: Never lose your thoughts with automatic persistence
- **Rich Text Support**: Format your notes with various font sizes
- **Transparency Control**: Adjust note opacity for better focus

### 🤖 **AI-Powered Organization**
- **Smart Categorization**: Automatic note classification using rule-based AI
  - 📚 **Study** - Homework, exams, research, lectures
  - ✅ **Tasks** - Todos, deadlines, meetings, reminders
  - 💡 **Ideas** - Brainstorming, concepts, creative thoughts
  - 📋 **General** - Everything else
- **Intelligent Search**: Find notes instantly with content-based search
- **Category Filtering**: View notes by specific categories

### 🍂 **Stunning Autumn Theme**
- **Falling Leaves Background**: Subtle animated leaves in notes for ambient beauty
- **Professional Design**: Clean rectangular notes with autumn colors
- **Falling Leaves Animation**: Beautiful ambient animation in popup interface
- **Professional Color Palette**: Warm browns, golds, and creams
- **Seasonal Aesthetics**: Complete autumn atmosphere without productivity interruption

### 🎯 **Advanced Features**
- **Stealth Mode**: Ultra-discrete note-taking during online classes
- **Keyboard Shortcuts**: Lightning-fast note creation and management
- **Pin & Lock**: Keep important notes always visible and protected
- **Export Functionality**: Backup your notes as JSON files
- **Theme System**: Switch between Default and Professional Autumn themes

---

## 🚀 **Installation Guide**

### **Option 1: Load Unpacked Extension (Recommended for Development)**

1. **Clone or Download** this repository
   ```bash
   git clone https://github.com/Flamebamboo/StickyNoteAI.git
   cd StickyNoteAI
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (top-right toggle)
   - Click **Load unpacked**
   - Select the `.output/chrome-mv3/` folder
   - The extension icon will appear in your toolbar!

### **Option 2: Development Mode**
```bash
npm run dev
```
This starts the development server with hot-reload for real-time development.

---

## 📱 **User Interface Overview**

### **1. Floating Widget**
The main interaction point on any webpage:
- 📝 **Compact Design**: Minimal footprint, maximum functionality
- 🎯 **Smart Positioning**: Stays out of your way while remaining accessible
- 🎨 **Theme Adaptive**: Changes appearance based on selected theme

### **2. Popup Interface**
Comprehensive note management in a beautiful interface:

#### **📝 Notes Tab**
- **Search Bar**: 🔍 Find notes instantly with intelligent search
- **Category Filters**: Filter by Study, Tasks, Ideas, or General
- **Note Cards**: Beautiful leaf-shaped cards (in Autumn theme)
- **Quick Actions**: Keyboard shortcuts and helpful tips
- **Statistics**: See total notes and filtered counts

#### **🎨 Themes Tab**
- **Theme Preview**: See exactly how themes will look
- **Autumn Theme**: Professional seasonal design with falling leaves
- **Default Theme**: Clean, minimalist sticky note experience
- **Real-time Switching**: Instant theme application

#### **⚙️ Settings Tab**
- **Stealth Mode**: Ultra-discrete mode for sensitive environments
- **Keyboard Shortcuts**: Complete shortcut reference
- **Extension Info**: Version details and credits

---

## ⌨️ **Keyboard Shortcuts**

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Alt + Shift + N` | **New Note** | Create a new sticky note instantly |
| `Alt + Shift + W` | **Toggle Widget** | Show/hide the floating widget |
| `Esc` | **Close Note** | Close the active note editor |
| `Double Click` | **Minimize Widget** | Minimize the floating widget |

---

## 🎨 **Themes System**

### **🍂 Autumn Theme (Professional)**
Experience the beauty of fall with our signature autumn theme:

- **🍃 Falling Leaves Background**: Subtle, transparent animated leaves within notes
- **📝 Clean Design**: Professional rectangular notes optimized for productivity
- **🎨 Professional Palette**:
  - Rich Browns: `#8B4513`, `#A0522D`
  - Warm Golds: `#CD853F`, `#DAA520`  
  - Elegant Creams: `#FFF8DC`, `#F5DEB3`
- **🍂 Ambient Animation**: Falling leaves in popup interface and note backgrounds
- **✨ Enhanced Aesthetics**: Gradients, shadows, and seasonal ambiance without distraction

### **📋 Default Theme (Classic)**
Clean and minimalist for distraction-free note-taking:
- Classic yellow sticky note colors
- Simple, functional design
- Maximum readability and focus

---

## 🔧 **Technical Specifications**

### **Architecture**
- **Framework**: WXT v0.20.7 (Modern Chrome Extension Framework)
- **Frontend**: React 18.2 + TypeScript 5.0
- **Build Tool**: Vite 6.3.5 for optimized builds
- **Manifest**: Chrome Extension Manifest V3

### **Storage & Persistence**
- **Chrome Storage API**: Reliable, cross-device synchronization
- **Local Storage**: Fast access for settings and preferences
- **Auto-backup**: Automatic note saving and recovery

### **Performance**
- **Optimized Bundle**: ~291KB total extension size
- **Lazy Loading**: Components loaded on-demand
- **Memory Efficient**: Proper cleanup and resource management
- **Animation Performance**: GPU-accelerated CSS animations

---

## 🎯 **Use Cases**

### **🎓 Students**
- Take discrete notes during online classes
- Organize study materials by subject
- Track assignments and deadlines
- Capture research ideas instantly

### **💼 Professionals**
- Quick meeting notes and action items
- Project ideas and brainstorming
- Task management and reminders
- Research and reference collection

### **🖥️ Developers**
- Code snippets and documentation
- Bug reports and feature ideas
- Learning notes and tutorials
- Quick calculations and references

---

## 🔒 **Privacy & Security**

- **Local Storage Only**: All data stays on your device
- **No Data Collection**: Zero tracking or analytics
- **No External Servers**: Complete offline functionality
- **Open Source**: Transparent, auditable code

---

## 🛠️ **Development**

### **Project Structure**
```
StickyNoteAI/
├── entrypoints/
│   ├── background.ts          # Background script
│   ├── content.ts             # Main content script
│   └── popup/
│       ├── App.tsx            # React popup interface
│       ├── App.css            # Styling and themes
│       └── main.tsx           # Popup entry point
├── public/                    # Static assets
├── wxt.config.ts             # WXT configuration
└── package.json              # Dependencies
```

### **Key Technologies**
- **WXT Framework**: Modern extension development
- **React + TypeScript**: Type-safe, component-based UI
- **CSS Custom Properties**: Dynamic theming system
- **Chrome APIs**: Storage, messaging, and permissions

### **Development Commands**
```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Maintain consistent code formatting
- Add tests for new features
- Update documentation as needed

---

## 📋 **Roadmap**

### **🔮 Upcoming Features**
- [ ] **Cloud Sync**: Optional cloud backup and sync
- [ ] **More Themes**: Spring, Summer, Winter seasonal themes
- [ ] **Rich Text Editor**: Bold, italic, lists, and links
- [ ] **Note Templates**: Pre-defined note formats
- [ ] **Collaboration**: Share notes with team members
- [ ] **Mobile App**: Companion mobile application
- [ ] **AI Enhancement**: GPT-powered note suggestions

### **🐛 Bug Fixes & Improvements**
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Additional keyboard shortcuts
- [ ] Better mobile viewport support

---

## 📸 **Screenshots**

### **Floating Widget**
The discrete floating widget that appears on any webpage:
- Minimalist design that stays out of your way
- Drag to reposition anywhere on the page
- One-click note creation

### **Autumn Theme Popup**
The beautiful popup interface with autumn theme:
- Falling leaves animation
- Leaf-shaped note cards
- Professional autumn color palette
- Smart search and categorization

### **Note Editor**
The in-page note editor with full functionality:
- Leaf-shaped notes (Autumn theme)
- Transparency controls
- Font size adjustment
- Pin and lock features

---

## 📞 **Support & Feedback**

### **Getting Help**
- **Issues**: [GitHub Issues](https://github.com/Flamebamboo/StickyNoteAI/issues)
- **Documentation**: Check this README and inline help
- **Community**: Join our discussions

### **Feature Requests**
Have an idea for StickyNoteAI? We'd love to hear it!
- Open an [Issue](https://github.com/Flamebamboo/StickyNoteAI/issues) with the "enhancement" label
- Describe your use case and proposed solution
- We review all suggestions regularly

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 **Acknowledgments**

- **WXT Framework**: For making Chrome extension development enjoyable
- **React Team**: For the amazing UI library
- **Chrome Extensions Team**: For the powerful platform
- **Contributors**: Thanks to all who help improve StickyNoteAI

---

## 📊 **Stats**

- **⭐ GitHub Stars**: Star us if you find this helpful!
- **🍴 Forks**: Fork and contribute to the project
- **🐛 Issues**: Currently tracking improvements
- **🚀 Releases**: Regular updates and new features

---

<div align="center">

### **🍂 Made with ❤️ for students and professionals worldwide**

**[⬆️ Back to Top](#-stickynoteai---professional-autumn-themed-chrome-extension)**

---

*Perfect for hackathons, study sessions, and professional productivity!*

</div>
