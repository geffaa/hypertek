# Hyper Tek — Game UI / Interactive Interface Brief

_Created: 2026-03-20_
_Last updated: 2026-03-20_
_Source: Don Bennett's reference images + conversation brief_

---

## Overview

Three interconnected games built by Hyper Tek:

| Game | Button Color | Section |
|---|---|---|
| **Hyper Racing** | Green | ONE |
| **Hyper Quest** | Blue | TWO |
| **Overlord of the 7 Realms** | Red | THREE |

**Goal:** Create a full-screen interactive game UI that lives in the **Gaming section** of the website. When a user clicks "Games" on the landing page, the UI opens full screen. Each of the three game buttons plays the respective short in-game content video. Once real game content videos are ready, they will replace the placeholders.

**Secondary use:** The UI should be embeddable/shareable on socials, news, and blog posts.

---

## Where It Lives on the Website

- **Location:** Gaming section of the main website — route `/gaming`
- **Previous state:** A short video plays saying "games aren't ready yet"
- **Current state:** ✅ Full interactive UI installed and live at `/gaming`
- **Entry point:** "Games" button on site landing page → UI opens full screen (Navbar/Footer hidden)

---

## Persistent UI Elements (Present on ALL screens)

### Top Navigation Bar

| Element | Detail | Status |
|---|---|---|
| Profile Avatar | Top-left, circular, sci-fi warrior helmet SVG (placeholder) | ✅ Built — swap with real photo when available |
| RESOURCES button | Gray metallic button | ✅ Built |
| E-CRYSTALS | Metallic button + GiCrystalBall icon + value 3.4M | ✅ Built (hardcoded) |
| GOLD | Metallic button + GiGoldBar icon + value 1.3B | ✅ Built (hardcoded) |
| DIAMONDS | Metallic button + GiDiamonds icon + value 613K | ✅ Built (hardcoded) |
| H-BUCKS | Metallic button + GiBanknote icon + value 688K | ✅ Built (hardcoded) |
| MARKETPLACE | Metallic button → navigates to `/market-place` | ✅ Built + wired |
| WALLET | Metallic button → navigates to `/dashboard/withdraw` | ✅ Built + wired |
| LOG OUT | Circle button top-right → clears token + navigates to `/` | ✅ Built + wired |

### Left Side

| Element | Detail | Status |
|---|---|---|
| MAP | Yellow-bordered button with wireframe mini-map SVG (outline, not solid). Shows zones (Racing/Quest/Overlord), connecting lines, blinking player dot. Click → opens World Map overlay | ✅ Built + functional |
| FRIEND LIST | Vertical tab far-left edge. Click → opens Friends panel | ✅ Built + functional |

### Right Side (stacked vertically)

| Element | Detail | Status |
|---|---|---|
| EVENTS | Opens modal: list of active/upcoming events with countdown | ✅ Built + functional |
| ITEMS | Opens modal: grid of items with rarity (Legendary/Epic/Rare/Common) | ✅ Built + functional |
| SETTINGS | Opens modal: sound/music/graphics sliders + notification toggles | ✅ Built + functional |
| ALLIANCE | Opens modal: Alliance info (IRON WOLVES) + member list with online status | ✅ Built + functional |
| MAIL | Opens modal: inbox with unread/read state, click to read | ✅ Built + functional |

### Bottom Bar

| Element | Detail | Status |
|---|---|---|
| RACING | Green button → activates Racing panel + scene | ✅ Built + functional |
| QUEST | Blue button → activates Quest panel + scene | ✅ Built + functional |
| OVERLORD | Red button → activates Overlord panel + scene | ✅ Built + functional |
| VIEW | Oval button (GiDragonHead icon) + "VIEW" text. Click → cycles view modes: OVERVIEW → FIRST PERSON → 3RD PERSON → BIRD'S EYE | ✅ Built + functional |

---

## Landing Page (Default / Home Screen)

### Layout Concept
- Three sections divided by **diagonal converging lines** (CSS clip-path animation)
- Background: dark navy `#0a1a2e`
- Panel content areas: animated game previews (CSS placeholder, swap with video when ready)
- Game labels ONE / TWO / THREE visible in idle state (faint, decorative)

### Sections

| Section | Label | Content Now | Content When Videos Ready |
|---|---|---|---|
| Left | ONE | Animated road track (CSS) | Hyper Racing preview video |
| Center | TWO | Animated jungle scene (CSS) | Hyper Quest preview video |
| Right | THREE | Animated star field + spaceships (CSS) | Overlord preview video |

### Animation States — ✅ All implemented

1. **Idle (all three equal)** — three panels balanced, animations loop
2. **Racing selected** — left panel expands (clip-path transition 0.65s), Racing scene loads
3. **Quest selected** — center panel expands, Quest scene loads
4. **Overlord selected** — right panel expands, Overlord scene loads
5. **Click same button again** → returns to idle (three-panel view)

### Diagonal Dividing Lines
- SVG `<line>` elements overlaid on panels
- Coordinates animate with CSS transition in sync with clip-path

---

## Hyper Racing — In-Game UI Screen ✅

### Controls

| Control | Position | Behaviour |
|---|---|---|
| **Joystick** | Bottom-left | Blue rectangle base + green knob. **Mouse-draggable** left/right with pointer capture. Springs back to centre on release |
| **Speed Slider** | Right side | Vertical green/red/amber gradient track. **Mouse-draggable** up/down. Speed label changes: FAST / MED / SLOW with colour |

### Animated Background (placeholder)
- Dark track with moving dashed yellow centre line
- Road edge lines, grey boulder rocks, small moving vehicles

---

## Hyper Quest — In-Game UI Screen ✅

### Controls

| Control | Position | Behaviour |
|---|---|---|
| **Joystick** | Bottom-left | Circular base (360° ring). **Mouse-draggable** in all directions. Springs back to centre |
| **SCOPE** | Bottom-right | Toggle button. ON → dark vignette overlay with scope ring, crosshair, centre dot, distance markers. Click overlay to close |
| **KNEEL** | Bottom-right | Toggle button. ON → "▼ CROUCHING" indicator appears top-center. Character posture indicator |
| **WEAPON** | Bottom-right | Cycles through 5 weapons: M4A1 → SNIPER MK-II → PLASMA RIFLE → SHOTGUN-X → PLASMA PISTOL. Name shown below button |

### Animated Background (placeholder)
- Jungle vertical tree lines, character silhouette (bobbing), gun barrel (first-person), muzzle flash every ~1.8s, explosion bursts

---

## Overlord of the 7 Realms — In-Game UI Screen ✅

### Controls

| Control | Position | Behaviour |
|---|---|---|
| **SCOPE** | Bottom-right | Toggle button. ON → purple vignette scope overlay with "TARGET LOCK" label. Click to close |
| **WEAPON** | Bottom-right | Cycles through 4 weapons: PLASMA CANNON → RAIL GUN MK-V → ION BLASTER → PHOTON TORPEDO |

### Animated Background (placeholder)
- Star field (twinkling), floating green planet (sine drift), 4 spaceships, yellow/red laser beams, nebula glow, hit flash every ~2s

---

## MAP Button & Overlay ✅

- **Button:** Wireframe mini-map SVG inside yellow-bordered button. Shows territory outline, interior zone dividers, 3 coloured zone dots (green=Racing, blue=Quest, red=Overlord), blinking yellow player position dot
- **Overlay (click):** Full world map with 6 named zones: NORTH REALM, EAST SECTOR, CENTRAL HUB, WEST OUTPOST, SOUTH BASE, RACING CIRCUIT — connected with dashed lines

---

## Friend List Panel ✅

- Slide opens on click
- Shows 6 friends with online/offline status dot
- Online friends show which game they're in (OVERLORD / RACING / QUEST)
- **INVITE** button visible for online friends

---

## Panel/Modal System ✅

All overlals use the `GameOverlay` component. Dark backdrop + click-outside-to-close. Panels:

| Panel ID | Trigger | Content |
|---|---|---|
| `map` | MAP button | World map SVG with zones |
| `friends` | FRIEND LIST tab | Friend list + invite |
| `events` | EVENTS button | Event list with countdowns |
| `items` | ITEMS button | Item grid with rarity |
| `settings` | SETTINGS button | Volume/graphics sliders + toggles |
| `alliance` | ALLIANCE button | Alliance info + members |
| `mail` | MAIL button | Inbox with read/unread state |

---

## Technical Requirements

### Must-Have
- [x] Full-screen layout at `/gaming` (Navbar/Footer hidden via `hideLayoutRoutes`)
- [x] Persistent top nav bar on all screens
- [x] Persistent left/right side buttons on all screens
- [x] Landing page with 3 animated placeholder panels (looping CSS animations)
- [x] Click RACING → expand Racing panel → Racing scene with controls
- [x] Click QUEST → expand Quest panel → Quest scene with controls
- [x] Click OVERLORD → expand Overlord panel → Overlord scene with controls
- [x] Joystick rendered and **mouse-draggable** (Racing: L/R, Quest: 360°)
- [x] Speed slider rendered and **mouse-draggable** with speed readout
- [x] Scope / Kneel / Weapon buttons functional on Quest screen
- [x] Scope / Weapon buttons functional on Overlord screen
- [x] MAP button opens wireframe map overlay
- [x] Embeddable / shareable via `/gaming` URL

### Phase 2 — Completed Early
- [x] Joystick actually interactive (drag to move) ← done
- [x] Speed slider actually draggable ← done
- [x] MAP shows wireframe territory outline ← done (SVG)
- [x] VIEW button cycles through view modes ← done

### Still Pending (waiting for Don's assets/videos)
- [ ] Replace CSS animated panels with real game preview videos (3× landing + 3× in-game)
- [ ] Replace profile avatar SVG placeholder with real male face photo
- [ ] Live currency values from backend API (E-Crystals, Gold, Diamonds need new endpoints; H-Bucks can use existing `GET /api/v1/hb/balance`)
- [ ] Profile avatar loads from real user session (`GET /api/v1/user/profile`)
- [ ] Connect "Games" button on main site landing page to navigate to `/gaming`

---

## File Structure

```
frontend/src/
├── pages/
│   └── Gaming.jsx                      ← Main page (state orchestrator)
└── Components/Gaming/
    ├── GameTopNav.jsx                  ← Top navigation bar
    ├── GamePanels.jsx                  ← Diagonal panel animation + MAP button
    ├── GameBottomBar.jsx               ← RACING / QUEST / OVERLORD / VIEW
    ├── GameOverlay.jsx                 ← All modal panels (events/items/settings/alliance/mail/map/friends)
    ├── RacingScene.jsx                 ← Racing in-game screen + draggable controls
    ├── QuestScene.jsx                  ← Quest in-game screen + draggable controls + scope
    └── OverlordScene.jsx               ← Overlord in-game screen + scope + weapons

App.jsx — /gaming route added, navbar/footer hidden on this route
```

---

## Asset Placeholders — Current Status

| Asset | Brief Requirement | Current State |
|---|---|---|
| Profile Avatar | Sci-fi male warrior face (photo) | SVG helmet illustration (placeholder) |
| E-Crystals icon | Red crystal image | `GiCrystalBall` react-icon |
| Gold icon | Gold coin stack image | `GiGoldBar` react-icon |
| Diamonds icon | Diamond/gem image | `GiDiamonds` react-icon |
| H-Bucks icon | Banknote with "HB" | `GiBanknote` react-icon |
| Wallet icon | Wallet image | `FaWallet` react-icon |
| MAP thumbnail | Dark sci-fi map outline | SVG wireframe map (built) |
| VIEW button image | Eagle or dragon head | `GiDragonHead` react-icon |
| Racing video | Vehicles racing, folded-paper track | CSS animated road (placeholder) |
| Quest video | Jungle firefight, sniper scope | CSS animated jungle (placeholder) |
| Overlord video | Space battle, laser beams | CSS animated star field (placeholder) |
| Landing video ×3 | Three game preview loops | CSS animated panels (placeholder) |

---

## Reference: Style Inspiration

Game screenshot ("Cosmic Assassin #2378") — sci-fi dark theme with gold/teal accents, metallic buttons, glowing UI elements. The Hyper Tek UI follows this aesthetic.

---

_Brief compiled by: Engineering team_
_Source: Don Bennett's wireframe images + conversation notes_
_Last updated: 2026-03-20_
