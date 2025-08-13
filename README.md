# Secure Password Generator

A modern, accessible, and feature-rich password generator built with vanilla JavaScript, HTML, and CSS.

## Password Generation
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
  - Symbols (!@#$%^&*()_+-=[]{};:,.<>?)
  - Ambiguous characters (l1I0Oo)

## Getting Started

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

## Customization

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

## Security Considerations

- **Client-Side Only**: No data sent to external servers
- **Secure Randomness**: Uses cryptographically secure random number generation
- **No Storage**: Passwords are not stored or transmitted
- **Privacy Focused**: Works entirely offline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- **[Geist](https://fontsource.org/fonts/geist) and [Geist Mono](https://fontsource.org/fonts/geist-mono) fonts**: Variable fonts by [Vercel](https://vercel.com/home)
- **[MingCute Icon](https://www.mingcute.com/)**: SVG Icons
- **[Pattern Craft](https://github.com/megh-bari/pattern-craft)**: Beautiful pattern backgrounds

---

**Built with ❤️ for secure password generation**
