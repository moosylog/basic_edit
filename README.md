# ⌨️ Basic Edit

[![Live Demo](https://img.shields.io/badge/Live_Demo-Playground-0ea5e9?style=for-the-badge&logo=vercel)](https://moosylog.github.io/basic_edit/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Zero Build](https://img.shields.io/badge/Zero_Dependencies-HTML5-orange?style=for-the-badge&logo=html5)](#)

**A lightweight**, zero-dependency visual editor that serves as a foundation for **tinkering with the MoErgo Layout Editor JSON file**. By providing the exact hardware geometry coordinates needed to render the physical keyboard matrix on screen, it gives you a great starting point for your project.

It runs entirely in the browser as a single HTML file—no build steps, no package managers, and no local server required.

---


  <img src="screenshot.png" alt="Basic Edit Screenshot" width="800" />


## ✨ Features

* **Visual Foundation:** The tedious work of mapping physical key coordinates is already done. The app understands the geometry of both the **Glove80** and **Go60** and automatically displays the correct keyboard canvas based on your loaded JSON.
* **Zero Setup:** A complete React application bundled into a single `.html` file. Just double-click to open it in any modern browser.
* **Split-Pane Architecture:** A docked inspector allows you to edit the raw AST (Abstract Syntax Tree) of bindings without occluding the visual keyboard.
* **Advanced ZMK Support:** Safely edit root-level behaviors like `macros`, `combos`, and `holdTaps` alongside standard layer bindings.
* **Import & Export:** Load an existing MoErgo layout JSON, tweak it visually or via the raw JSON AST, and immediately export the updated file ready for the firmware builder.

---

## 🚀 Getting Started

You can try the editor immediately via the [Live Demo](https://moosylog.github.io/basic_edit/), or run it locally in seconds:

1. **Clone or download** this repository.
2. **Double-click** `index.html` to open it in your web browser.
3. Click **Load JSON Layout** and select a valid MoErgo ZMK JSON file.
4. **Select physical keys** on the canvas to edit their bindings directly, or use the tabs in the right-hand inspector to edit global Macros, Combos, and Hold-Taps.
5. Click **Export Configuration** to download your customized, builder-ready layout.

---

## 🛠️ Tech Stack

This project is built using CDN-hosted libraries to maintain strict single-file portability:

| Technology | Purpose |
| :--- | :--- |
| **React 18** | UI Components, Context, and State Management |
| **Tailwind CSS** | Utility-first styling and responsive layout |
| **Babel Standalone** | In-browser JSX compilation for zero-build execution |

---

## 🧠 Why "Basic Edit"?

ZMK configurations can get incredibly complex, and rendering a physical split keyboard in a browser usually requires painstakingly plotting CSS coordinates for every single key. 

This editor is purposefully "basic" in its architecture. By stripping away heavy build tools like Vite or Webpack, the core logic of mapping the hardware geometry, parsing the MoErgo schema, and rendering the matrix remains completely transparent. It is designed to be highly readable for developers who want a solid visual foundation to learn the schema, build custom layout utilities, or create more beginner-friendly tools for the community.

---

## 🏗️ Modifying the Editor

Because everything is contained within one file, hacking on the editor is straightforward. Open `index.html` in your favorite text editor. The codebase is distinctly organized into four main sections:

1. **Hardware Geometry (The Foundation):** The physical coordinate mapping arrays (`x`, `y`, `rotation`, and `transform-origin`) for the Go60 and Glove80. 
2. **Parsers & Helpers:** Pure functions that translate complex ZMK syntax into human-readable UI labels.
3. **Components:** The React UI building blocks (Keys, Keyboard Canvas, Docked Inspector).
4. **Main App:** File I/O, state management, and the master application layout.

---

## 📄 License

This project is licensed under the **MIT License**. 

Feel free to fork, modify, and use this geometry and code as a foundation or stepping stone for your own MoErgo configuration utilities and community tools!
