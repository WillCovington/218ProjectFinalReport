# Cucumber Cutting Frenzy — Project Website (Playable Demo Edition)

This responsive project-documentation website is built with HTML, CSS and vanilla JavaScript. No npm/build step is required. **The starting point was the `index.html` you uploaded**, including your ME218A course-title edit.

## Open and edit

Extract the whole folder. In VS Code, select **File → Open Folder** and choose `cucumber-frenzy-website`, then open `index.html`. If your integrated browser refuses a local file, run `py -m http.server 5500` in this directory and open `http://localhost:5500`.

The ZIP includes `index.html`, `styles.css`, and `script.js`: **all three are required** to display the layout and operate the playable cutting-board game, navigation, image placeholders, and pseudocode selector. A separate standalone preview file is also available if desired.

## Playable game: how it works

The How to Play section now features a browser-only recreation inspired by the finished cutting-board prototype.

1. **Set difficulty:** drag/rotate the white knob in the lower right of the board. Five levels require 5, 10, 15, 20 or 25 cuts per cucumber. You can also focus the knob and use the arrow keys (or Home/End).
2. **Start:** click and **keep holding** the wooden knife handle. A 3-second countdown starts. If you release during this countdown, it cancels.
3. **Chop:** after the countdown, keep holding the mouse button (or your finger on touchscreens) and drag the wooden handle **up and then down**. A chop only counts after a sufficiently high lift. The timer counts down from 60 seconds.
4. **Score:** complete the chosen cut target to earn one cucumber/treat; keep playing until the timer expires. The LED dots indicate difficulty before play and cut progress during play.
5. **Deadman / recovery:** releasing the handle during gameplay starts a 3-second grace period. Re-grab to keep playing, or the round is cancelled. **Reset** starts over.

For keyboard operation, focus the wooden knife handle, **hold Space** and use **Up/Down** to raise/chop. Release Space to simulate releasing the handle.

This is a simplified browser demonstration: it does not connect to a PIC32 or drive hardware. Its visual elements are CSS/SVG recreations based on the reference product photo.

## Requested layout edits retained

- Figure 01 remains a placeholder for your completed-system photograph.
- The hero omits the former PIC32 / Events & Services blurb and decorative asterisks.
- Electrical System contains the schematic placeholder and the pin assignments table; Mechanical System is a separate section.
- The System's State Breakdown keeps the diagram slot and **Countdown Cancel, Deadman, Round End** descriptions, but no extra event-driven/timers/safety legend.
- The Software Architecture section has **only the service dropdown and the full-width pseudocode panel**, without the redundant service summaries above it.
- Test Documentation remains omitted; the image gallery stays.

## Edit the game

- In `index.html`, find `id="gameDemo"` to change the game introduction, game board markup, and text labels.
- In `script.js`, find the **PLAYABLE GAME DEMO** section to change the 60-second round duration, 3-second countdown/grace period, difficulty targets, and lifting thresholds.
- In `styles.css`, find **PLAYABLE CUCUMBER GAME** to change the wooden board, knife, cucumber, knob and HUD appearance.
- All illustrations are created in HTML/CSS/SVG. No external image or npm dependency is required to play.

## Drop in your images

Use these paths exactly, relative to `index.html`. The placeholder will be hidden automatically when the image is present. If you use a different extension, update the `src` field in `index.html`.

| Image file to add | Location |
| --- | --- |
| `assets/images/system-overview.jpg` | **Figure 01** — whole system photo |
| `assets/schematics/full-system.png` | **Figure 02** — single complete electrical schematic |
| `assets/mechanical/system-assembly.jpg` | **Figure 03** — whole mechanical system |
| `assets/mechanical/knife-timer.jpg` | **Figure 04** — knife/timer mechanism |
| `assets/mechanical/treat-dispenser.jpg` | **Figure 05** — reward dispensing mechanism |
| `assets/diagrams/final-state-diagram.png` | System's State Breakdown |
| `assets/images/final-build.jpg` | **Figure 06** — finished prototype gallery |
| `assets/images/workbench.jpg` | **Figure 07** — prototype/workbench gallery |
| `assets/images/gameplay.jpg` | **Figure 08** — gameplay gallery |

Tip: export schematics and state diagrams at readable resolution; PNG or SVG is especially suitable for dense labels.

## Where to edit the text

- **Design process:** `index.html`, `id="process"` — team design decisions, challenges and iterations.
- **Electrical System:** `id="electrical"` — pinout rows inside `<table class="pinout-table">`.
- **Mechanical System:** `id="mechanical"` — photographs and mechanical rationale.
- **System's State Breakdown:** `id="states"` — final FSM file and three key-transition descriptions.
- **Software Architecture:** `id="firmware"` — select service from the dropdown in `index.html`. Pseudocode is inside `script.js`, in the `serviceGuides` object. Each entry has `pseudocode`, `role`, `events`, and `explanation` strings.
- **Gallery:** `id="gallery"` — final project photos.
- **Team reflection:** `id="team"`.

## Accuracy note

The pinout and pseudocode follow the most recently shared project source ZIP (`cucumber-cutting-frenzy(9).zip`) and prior project discussions, not an independently reviewed final release. In particular, **confirm whether the break-beam input was ultimately wired to RB10 or RB13**, and verify the remaining electrical assignments against your final schematic. The pseudocode intentionally describes behavior, rather than copying potentially provisional calibration constants from the source snapshot. Update any details that changed in the finished project before submitting.

## File structure

```text
cucumber-frenzy-website/
├── index.html
├── styles.css
├── script.js
├── README.md
└── assets/
    ├── diagrams/
    ├── images/
    ├── mechanical/
    └── schematics/
```

Publish with GitHub Pages by placing these files at your site's repository root or in its `docs/` directory and enabling Pages for the chosen location.
