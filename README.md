# Bitburner DOOM - Standalone Edition

Play the Bitburner DOOM game in any desktop browser. No downloads, no setup.

## Play Now

**[Open Game](https://raw.githack.com/Darxide777/Bitburner-Doom-Standalone/main/index.html)**

The first load downloads about 24 MB of sounds, so give it a moment (a status line shows progress). After that your
browser keeps them. Press **Enter** at the title screen to start.

## Controls

| Key | Action |
|---|---|
| W / Up, S / Down | Move forward / backward |
| A / Left, D / Right | Turn left / right |
| Q / E | Strafe left / right |
| F | Use (open doors, find secret walls) |
| Space | Shoot |
| 1-7 | Select a weapon (only once you have picked it up): Pistol, Shotgun, Chaingun, Rocket Launcher, Plasma Rifle, BFG 9000, Chainsaw |
| Tab | Toggle the minimap |
| M | Full-screen automap (pauses the game) |
| P | Pause / resume (it also pauses when the window loses focus) |
| Mouse | Turn (click the game once to capture the mouse); left click shoots |
| Enter | After dying: retry the level. After a level: go to the next one |
| Esc | Quit (with the mouse captured, the first Esc only releases it) |

## Features

- ASCII raycasting engine with textured walls, doors, floors and ceilings, plus sprite art for enemies, items and scenery
- Many enemies with their own AI, including summoners (Pain Elemental, Arch-vile) that run away between summons
- Seven weapons, armor, keys and locked doors, secrets, and an automap
- Sound effects and music

## How it works

The page loads the newest `doom.js`, `map.txt`, `sprites.json` and `audio.json` straight from the
[Bitburner-Doom](https://github.com/Darxide777/Bitburner-Doom) repository every time, so it is always up to date and
there is nothing to update here. `bitburner-adapter.js` supplies a small stand-in for Bitburner's `ns` object so the same
`doom.js` runs in the browser.

Useful address options: `?debug` shows a log box, and `?base=<url>` loads the game files from another web address
(for testing a copy of the game).

Needs a keyboard (and works best with a mouse), so it is not meant for phones.
