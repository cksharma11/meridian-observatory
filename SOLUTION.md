# The Obsidian Signal — Walkthrough & Solutions

> [!WARNING]
> **SPOILER WARNING!**
> This file contains the complete step-by-step solutions, explanations, and code mechanics for all 9 hidden fragment puzzles. If you want to solve the mystery of Dr. Voss's final transmission on your own, **do not read further!**

---

## Game Overview & Mechanics

The Meridian Deep-Space Observatory website hides **9 fragments** representing Dr. Elara Voss's final decoded telemetry. The puzzles are designed to guide the player through a progression from Easy to Insane. 

As you solve puzzles:
- **Tension Heartbeat**: A low-frequency double thud heartbeat starts playing in the background, getting faster and louder as you discover more fragments (1 to 8).
- **Progress Indicator**: The 9 star dots in the header light up in green.
- **Nebula Warmth**: The background glows warmer as the CSS custom property `--nebula-warmth` is updated.
- **The Vault**: At 9 fragments, the dark drone and heartbeat resolve into a shimmering E Major 9 chord, the vault iris opens, and Dr. Voss's final message is revealed.
- **Persistence**: Progress is stored in `localStorage` as a Base64-encoded JSON string containing click stats, timestamps, and a randomized `treasure_index` determining which of the 4 text endings the player gets.

---

## Puzzle Walkthrough & Solutions

### Fragment 1: The Flickering Star
- **Difficulty**: Easy
- **In-Game Clue**: Tagline: *"Some lights refuse to die"*. Subliminal text: *"count to seven"*, *"click the light"*.
- **How to Solve**: Look at the starry background in the header section (the Hero area). Locate a bright golden/amber star in the upper-right quadrant that flickers erratically. Click this star exactly **7 times**.
- **Mechanics**: [js/starfield.js](file:///Users/cksharma/Downloads/obsidian-signal/js/starfield.js#L47-L81) renders a custom `FlickeringStar` on the canvas. When clicked, it registers canvas pointer coordinate hits and increments a click counter. On the 7th click, it fires the `flickering-star-clicked` event, solving the puzzle.

### Fragment 2: The Patient Observer
- **Difficulty**: Not So Easy
- **In-Game Clue**: Logbook Entry 2: *"She stared at the cloud until it stared back."*
- **How to Solve**: Locate the faint purple nebula cloud in the lower-right area of the Hero section. Hover your mouse cursor over it and keep it completely still within the cloud boundaries for **5 continuous seconds**.
- **Mechanics**: [js/puzzles.js](file:///Users/cksharma/Downloads/obsidian-signal/js/puzzles.js#L64-L143) attaches `mouseenter` and `mouseleave` listeners to the nebula element. Hovering triggers a 5-second `setTimeout`. Moving the cursor away clears the timer. Remaining inside for 5 seconds triggers the `.revealed` animation class, shifting the color to golden-orange, and unlocks the fragment.

### Fragment 3: The Sequence
- **Difficulty**: Medium
- **In-Game Clue**: Logbook Entry 4: *"♀ → ◌ → ♂. Remember the order."* (Venus, Void, Mars).
- **How to Solve**: Scroll down to the **Celestial Catalog** section. Click the planet cards in this specific sequence: **Venus Card** → **The Void Between Card** (the blank card) → **Mars Card**.
- **Mechanics**: [js/puzzles.js](file:///Users/cksharma/Downloads/obsidian-signal/js/puzzles.js#L216-L282) tracks clicks on the `.planet-card` elements. If the clicked elements do not match the `['venus', 'void', 'mars']` array index-by-index, all cards play a visual glitch animation and reset the sequence. Clicking them correctly unlocks the card and reveals the hidden text.

### Fragment 4: The Redaction
- **Difficulty**: Medium-Hard
- **In-Game Clue**: Logbook Entry 5: *"Select your truth carefully — some things hide in plain sight. The redaction bars are not walls; they are doors for those who know how to knock three times."*
- **How to Solve**: Scroll down to Dr. Voss's Logbook. Locate the blacked-out redacted text bars (`████████`) under the "Redacted" entry. **Triple-click** on any of these redacted bars.
- **Mechanics**: [js/puzzles.js](file:///Users/cksharma/Downloads/obsidian-signal/js/puzzles.js#L320-L349) captures clicks on elements with the `.redacted[data-secret]` attributes. It checks the event `detail` property (which records click frequency). When `detail >= 3` (triple-click), the black background turns transparent, revealing the text.

### Fragment 5: The Whispered Word
- **Difficulty**: Hard
- **In-Game Clue**: The browser tab title slowly cycles letters, turning `Meridian Observatory` into `S.I.G.N.A.L`. Subliminal text: *"type what you seek"*.
- **How to Solve**: Type the word **`SIGNAL`** (in all lowercase or uppercase) anywhere on the keyboard. Do not click on any input fields; just type the keystrokes directly on the page.
- **Mechanics**: [js/app.js](file:///Users/cksharma/Downloads/obsidian-signal/js/app.js) and [js/puzzles.js](file:///Users/cksharma/Downloads/obsidian-signal/js/puzzles.js#L150-L178) listen to a global `keydown` event. It appends key presses to a buffer string. Once the last 6 characters in the buffer match `"signal"`, it triggers a screen-wide CRT static flash and reveals the frequency signature under the waveform section.

### Fragment 6: The Alignment
- **Difficulty**: Harder
- **In-Game Clue**: Faint vertical dotted guide lines appear between stars in the background as you scroll through the catalog.
- **How to Solve**: Scroll slowly until you reach the transition zone between the Celestial Catalog and the Logbook (approx. **2.5 times the viewport height** down the page). Stop scrolling when the three background stars align vertically, drawing a dotted constellation triangle.
- **Mechanics**: [js/starfield.js](file:///Users/cksharma/Downloads/obsidian-signal/js/starfield.js#L169-L179) calculates the user's scroll offset. When the scroll height matches `alignmentScrollY` within a tolerance of 60 pixels, it fades in the dotted constellation lines. Staying aligned triggers the `constellation-aligned` event.

### Fragment 7: The Displaced Element
- **Difficulty**: Superhard
- **In-Game Clue**: Logbook Entry 6: *"Last night I saw it move... the satellite icon on the monitoring dashboard... chasing shadows across the screen."* Faint white particles trail behind the icon.
- **How to Solve**: Locate the small floating satellite icon (`🛰️`) in the corner of the screen. Move your cursor near it. It will actively run away from you. Hover close and nudge it toward **any corner of your browser window** until it has no room left to escape and gets cornered.
- **Mechanics**: [js/puzzles.js](file:///Users/cksharma/Downloads/obsidian-signal/js/puzzles.js#L356-L462) computes the distance between your cursor and the satellite. If the distance is less than 200px, it applies a vector push away from the cursor. When the satellite is within 20px of two adjacent viewport edges (e.g. top + right), it is trapped, spins, and reveals the fragment.

### Fragment 8: The Reverse Signal
- **Difficulty**: Extremely Hard
- **In-Game Clue**: Waveform subtitle: *"Not all signals travel forward"*. Margin hint: *"try listening backwards"*.
- **How to Solve**: Right-click (or long-press on mobile) anywhere inside the **Live Waveform** monitor. A custom context menu will appear with the options: "Amplify Signal", "Filter Noise", and "Reverse Playback". Click **"Reverse Playback"**.
- **Mechanics**: [js/puzzles.js](file:///Users/cksharma/Downloads/obsidian-signal/js/puzzles.js#L480-L574) intercepts the default context menu (`contextmenu` listener) on the waveform box. Choosing "Reverse" triggers a CSS transform `scaleX(-1)` to play the canvas animation in reverse and shifts the color spectrum, revealing the reverse signature fragment.

### Fragment 9: The Konami Gate
- **Difficulty**: Insane
- **In-Game Clue**: Tiny Morse code in the footer: `·· ·–·· ···· ·–·· ...` which translates to "UP UP DOWN DOWN".
- **How to Solve**: Enter the classic Konami code sequence on your keyboard:
  **`↑` `↑` `↓` `↓` `←` `→` `←` `→` `B` `A`**
- **Mechanics**: [js/puzzles.js](file:///Users/cksharma/Downloads/obsidian-signal/js/puzzles.js#L594-L642) tracks keypress events. If the sequence matches the classic cheat code, it triggers a red `SYSTEM OVERRIDE` overlay animation, playing a loud static pop and resonant screech, and unlocks the final fragment.
