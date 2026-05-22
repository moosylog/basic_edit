https://moosylog.github.io/basic_edit/


# Basic Editor

A lightweight, zero-dependency visual editor and starting point for tinkering with MoErgo (Glove80 / Go60) ZMK JSON configurations. 

This project serves as a proof-of-concept and an accessible playground for anyone looking to understand, modify, or build upon the MoErgo JSON schema. It runs entirely in the browser as a single HTML file—no build steps, no package managers, and no local server required.

## Features

* **Zero Setup:** A complete React application bundled into a single `.html` file. Just double-click to open in any modern browser.
* **Intelligent Geometry Rendering:** Automatically detects and visually maps your layout to either the **Glove80** or **Go60** physical matrix based on the loaded JSON.
* **Split-Pane Architecture:** A docked inspector allows you to edit the raw AST (Abstract Syntax Tree) of bindings without occluding the visual keyboard canvas.
* **Advanced ZMK Support:** Safely edit root-level behaviors like `macros`, `combos`, and `holdTaps` alongside standard layer bindings.
* **Import & Export:** Load your existing MoErgo layout JSON, tweak it visually or via the raw JSON AST, and export the updated file ready for the MoErgo firmware builder.

## Getting Started

1. Clone or download this repository.
2. Double-click the `index.html` (or whatever you named the core HTML file) to open it in your web browser.
3. Click **Load JSON** and select a valid MoErgo ZMK JSON file.
4. Select physical keys to edit their bindings directly, or use the tabs in the right-hand inspector to edit global Macros, Combos, and Hold-Taps.
5. Click **Export Config** to download your customized layout.

## Tech Stack

This project is built using CDN-hosted libraries to maintain its single-file portability:
* **React 18** (UI Components and State Management)
* **Tailwind CSS** (Styling and Layout)
* **Babel Standalone** (In-browser JSX compilation)

## Why "Basic Editor"?

ZMK configurations can get incredibly complex, and parsing MoErgo's specific JSON schema requires understanding how nested properties, macros, and layers interact. This editor is "basic" in its architecture—stripping away heavy build tools like Vite or Webpack—to make the core logic of parsing and rendering the MoErgo schema as transparent as possible for developers who want to learn or build their own tools.

## Modifying the Editor

Because everything is contained within one file, making changes is straightforward. Open the HTML file in your favorite text editor. You will find clearly marked sections:
1. **Hardware Geometry:** The physical coordinate maps for the Go60 and Glove80.
2. **Parsers & Helpers:** Functions that translate ZMK syntax into human-readable UI labels.
3. **Components:** The React UI building blocks (Keys, Canvas, Inspector).
4. **Main App:** File I/O, state management, and master layout.

## License

MIT License - Feel free to fork, modify, and use this as a foundation for your own MoErgo configuration tools.
