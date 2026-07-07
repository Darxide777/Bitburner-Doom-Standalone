# DOOM - Standalone JavaScript Edition

A pure JavaScript implementation of a DOOM-like ASCII raycasting engine that runs in both the browser and Bitburner.

## How to Play (Browser)

1. Open `index.html` in your web browser
2. Press ENTER to start the game
3. Use WASD to move, mouse/arrow keys to turn, SPACE to shoot

## How to Play (Bitburner)

1. Download `doom.js`, `map.txt`, and `audio.json`
2. Run `doom.js` in Bitburner's terminal

## Controls

- **W/↑** - Move Forward
- **S/↓** - Move Backward
- **A/←** - Turn Left
- **D/→** - Turn Right
- **Q/E** - Strafe Left/Right
- **F** - Use Door
- **SPACE** - Shoot
- **1/2/3** - Switch Weapons (Pistol/Shotgun/Chaingun)
- **TAB** - Toggle Minimap
- **ESC** - Quit

## Map Key

- `a` = Ammo
- `h` = Health
- `P` = Player Start
- `i` = Imp
- `c` = Cacodemon
- `Y` = Cyberdemon
- `d` = Demon
- `z` = Zombie
- `l` = Lost Soul
- `D` = Door
- `K` = Locked Door (requires Blue Key)
- `E` = Exit
- `#` = Wall
- `.` = Floor

## Files

- `index.html` - Browser entry point
- `doom.js` - Main game logic (works in both browser and Bitburner)
- `map.txt` - Game map
- `audio.json` - Sound effects and music (base64 encoded)
