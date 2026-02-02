# Merge Paws (HTML5 Phaser)

A mobile-friendly idle merge game prototype for Yandex Games. Built with Phaser 3 and ready for export.

## Features
- Drag-and-drop merge grid (6x8).
- Idle income from cats with boosters.
- Mini-games for bonus coins.
- Yandex Games SDK integration stubs for ads and IAP.
- Local save/load via `localStorage`.

## Project Structure
```
index.html
js/
  main.js
  scenes/
    Boot.js
    MainMenu.js
    GameScene.js
    Shop.js
    MiniGame.js
assets/
```

## Local Testing
1. Serve the project with a local HTTP server:
   ```bash
   python3 -m http.server 8080
   ```
2. Open `http://localhost:8080` in your browser.

## Export to Yandex Games
1. Zip the project (everything in this folder).
2. Upload the zip in Yandex Games console as an HTML5 game.
3. Confirm the SDK script is present in `index.html`:
   ```html
   <script src="https://yandex.ru/games/sdk/sdk.js"></script>
   ```
4. Configure monetization in the Yandex dashboard (rewarded, interstitial, IAP).

## Asset Notes
- Cat visuals are currently rectangles and emojis for placeholders.
- Replace with pixel art sprites (e.g., `kitten_level1.png`, `adult_level3.png`) and load them in `Boot.js`.
- Sound effects are minimal base64 placeholder beeps; swap in real audio in `assets/`.

## Monetization Notes
- Rewarded videos: double income for 60 minutes in the Shop.
- Interstitial ads: triggered after merges or mini-game failures.
- In-app purchase: Premium Cat Pack (stubbed in `Shop.js`).

Have fun iterating and polishing the art and economy.
