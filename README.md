# Secure Password Generator

A modern, accessible, and feature-rich password generator built with vanilla JavaScript, HTML, and CSS.

## ✨ Features

### 🔐 Password Generation
- **Cryptographically Secure**: Uses `crypto.getRandomValues()` for true randomness
- **Multiple Password Types**:
  - **Random**: Fully random passwords with customizable character sets
  - **Memorable**: Word-based passwords with separators and numbers
  - **PIN**: Numeric-only passwords
- **Customizable Length**: 8-128 characters
- **Character Sets**:
  - Lowercase letters (a-z)
  - Uppercase letters (A-Z)
  - Numbers (0-9)
  - Symbols (!@#$%^&*()_+-=[]{}|;:,.<>?)
  - Ambiguous characters (l1I0Oo)

### 🎯 Password Strength Analysis
- Real-time strength calculation
- Visual strength meter with animations
- Comprehensive scoring algorithm:
  - Length contribution (up to 40 points)
  - Character variety bonus
  - Pattern detection penalties
  - Sequential character penalties

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with smooth animations
- **Accessibility**: Full ARIA support, keyboard navigation, screen reader friendly
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + G`: Generate new password
  - `Ctrl/Cmd + C`: Copy password (when input is focused)
- **Visual Feedback**: Loading states, copy confirmation, hover effects
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 🔧 Settings & Customization
- **Bottom Sheet Interface**: Modern settings panel
- **Real-time Updates**: Password regenerates automatically when settings change
- **Character Count Display**: Shows current password length
- **Settings Persistence**: Remembers your preferences

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- No build tools or dependencies required

### Installation
1. Clone or download the repository
2. Open `index.html` in your browser
3. Or serve with a local server:
   ```bash
   python3 -m http.server 8000
   # or
   npx serve .
   ```

## 🛠️ Technical Implementation

### Security Features
- **Cryptographically Secure Randomness**: Uses Web Crypto API
- **Fisher-Yates Shuffle**: Ensures unbiased character distribution
- **Character Set Validation**: Prevents empty character sets
- **Fallback Mechanisms**: Graceful error handling

### Code Quality
- **Modular Architecture**: Well-organized, maintainable code
- **Error Handling**: Comprehensive error catching and fallbacks
- **Performance Optimized**: Efficient algorithms and minimal DOM manipulation
- **Accessibility First**: WCAG 2.1 AA compliant

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full feature set with optimal layout
- **Tablet**: Adapted layout with touch-friendly controls
- **Mobile**: Single-column layout with improved touch targets

## ♿ Accessibility Features

- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG AA compliant color scheme
- **Screen Reader Support**: Semantic HTML and ARIA attributes

## 🎨 Design System

### Color Palette
- **Background**: Light, neutral background
- **Primary**: Subtle primary colors
- **Success**: Green for positive states
- **Warning**: Orange for medium strength
- **Danger**: Red for weak passwords
- **Info**: Blue for focus states

### Typography
- **Font**: Geist Variable (system fallbacks)
- **Hierarchy**: Clear heading and text hierarchy
- **Readability**: Optimized line heights and spacing

## 🔧 Customization

### Adding New Character Sets
```javascript
const CHARACTER_SETS = {
  // ... existing sets
  custom: 'your-custom-characters'
};
```

### Modifying Strength Algorithm
The strength calculation is in the `calculateStrength()` function and can be customized for different requirements.

### Styling
The application uses CSS custom properties for easy theming. Modify the `:root` variables in `style.css` to change the appearance.

## 📈 Performance

- **Lightweight**: No external dependencies
- **Fast Loading**: Optimized assets and minimal code
- **Efficient**: Smart DOM updates and event handling
- **Memory Efficient**: No memory leaks or unnecessary allocations

## 🔒 Security Considerations

- **Client-Side Only**: No data sent to external servers
- **Secure Randomness**: Uses cryptographically secure random number generation
- **No Storage**: Passwords are not stored or transmitted
- **Privacy Focused**: Works entirely offline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Geist Font**: Beautiful variable font by Vercel
- **Web Crypto API**: For secure random number generation
- **Modern CSS**: For responsive and accessible design

---

**Built with ❤️ for secure password generation**
