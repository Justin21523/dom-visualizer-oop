# DOM Visualizer (OOP)

An interactive, object‑oriented ES6 application to visualize and compare core browser metrics: **Window**, **Document**, **Viewport** and **Screen** properties in real time.

---

## 🚀 Features

* **Modular Architecture**: Fully split into ES6 modules and CSS components, following OOP and single‑responsibility principles.
* **Real‑time Updates**: Automatically reflects changes to `window.innerWidth`, `scrollY`, `documentHeight`, and more as you resize or scroll.
* **Interactive Controls**: Sliders and buttons for simulating window size, document dimensions, scroll position, and animated demonstrations.
* **Visual Diagram**: Layered colored rectangles illustrate containment relationships between Screen → Window → Document → Viewport.
* **Timeline Playback**: Records and replays the history of property changes in an animated timeline at the bottom of the page.
* **Responsive & Performant**: Lightweight vanilla JavaScript, no frameworks—ideal for learning core DOM APIs and event handling.

---

## 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/justin21523/dom‑visualizer‑oop.git
   cd dom‑visualizer‑oop
   ```

2. **Install dependencies** (optional, if using Vite for local dev)

   ```bash
   npm install
   ```

3. **Run locally**

   * **Without bundler**: Simply open `index.html` in your browser.
   * **With Vite**:

     ```bash
     npm run dev
     ```

4. **Build for production** (if using Vite)

   ```bash
   npm run build
   ```

---

## ⚙️ Usage

* Adjust the **Window** and **Document** sliders to see the rectangles resize.
* Scroll the page to update the **Scroll X/Y** values and move the scroll indicator.
* Click **Refresh** to manually re‑read all metrics, or **Animate** buttons for guided demos.
* Use the **Timeline** controls to record, play back, and clear the history of property changes.

---

## 📁 Project Structure

```
dom-visualizer-oop/              # root
├── index.html                   # main HTML
├── package.json                 # npm scripts & dependencies
├── .gitignore                   # ignored files
├── README.md                    # this documentation
├── src/                         # source files
│   ├── css/                     # all styling modules
│   │   ├── reset.css            # CSS reset rules
│   │   ├── variables.css        # color, spacing, typography variables
│   │   ├── base.css             # global layout & base styles
│   │   ├── layout.css           # grid & flexbox layouts
│   │   ├── components.css       # controls, cards, buttons, timeline styles
│   │   └── animations.css       # keyframes & transition classes
│   └── js/                      # ES6 JavaScript modules
│       ├── constants.js         # DOM selectors & shared constants
│       ├── properties.js        # PropertyManager: render/update cards
│       ├── visualization.js     # Visualizer: draw & scale rectangles
│       ├── animations.js        # reusable animation utilities
│       ├── timeline.js          # Timeline: record & replay data
│       ├── events.js            # setupEventListeners: bind UI & window events
│       └── main.js              # entry point: initialize and wire modules
└── dist/                        # build output (auto-generated)
```

---

## 🤝 Contributing

1. Fork this repository.
2. Create a feature branch: `git checkout -b feature/YourFeature`.
3. Commit your changes: `git commit -m "feat: add ..."`.
4. Push to the branch: `git push origin feature/YourFeature`.
5. Open a Pull Request.

Please follow the commit message conventions (`feat:`, `fix:`, `docs:`, `chore:`, etc.).

---

## 📄 License

This project is released under the [MIT License](LICENSE).
