# Design Brief: GENESIS

## Tone & Purpose
Retro 1980s computer terminal aesthetic for ICP canister management. Phosphor-green monochrome CRT interface evoking vintage Apple II / Commodore 64 computing era. Data-focused, high contrast, pixel-perfect. Brutalist, functional, nostalgic.

## Color Palette (OKLCH)

| Token | Value | Usage |
|-------|-------|-------|
| Background | 0.1 0 0 | Page base — near black, deep void |
| Card | 0.15 0 0 | Surface elevation, panels |
| Foreground | 0.75 0.18 70 | Primary text, glowing amber |
| Primary | 0.75 0.18 70 | Interactive, highlights, glowing effect |
| Accent | 0.7 0.2 120 | Active states, green accent |
| Success | 0.65 0.15 145 | Healthy/active canister state |
| Destructive | 0.50 0.2 25 | Warnings, critical status, errors |
| Border | 0.35 0 0 | Grid lines, input borders |
| Muted | 0.25 0 0 | Secondary text, disabled states |

## Typography

| Layer | Font | Scale | Usage |
|-------|------|-------|-------|
| Display | Geist Mono | 20–24px | Headers, titles — all-caps retro |
| Body | Geist Mono | 13–14px | Body text, labels, all monospace |
| Mono | Geist Mono | 12–13px | Cycle values, PIDs, data fields |

## Structural Zones

| Zone | Treatment | Details |
|------|-----------|---------|
| Header | Bordered, glowing | Logo "GENESIS", nav with amber text, solid border-b |
| Sidebar | Full-height grid | Fixed nav, pixel grid bg, border-r, amber text on black |
| Main Content | Scanline overlay | bg-background with scanline texture, card-based panels |
| Stat Cards | Glowing border | bg-card, retro-border, retro-glow text, monospace data |
| List Items | Grid dividers | Row borders, hover state with shadow, crisp edges |
| CRT Effect | Scanlines + glow | Global scanline layer, text-shadow on key values |
| Buttons | Inverted | bg-primary (amber) with dark text, pixel-perfect padding |
| Footer | Grid-based | Muted text, bordered top, compact spacing |

## Component Patterns

- **Retro Glow**: text-shadow on all critical values (cycle balance, PID, account ID)
- **Borders**: Solid 1px border-border, no radius (radius: 0), crisp grid
- **Status Badges**: Monospace, glowing glow if active (emerald/amber)
- **Copyable IDs**: Monospace font, copy icon affordance, subtle highlight on copy
- **Pagination**: Numbers with borders, arrow nav in retro style
- **Search**: Bordered input, amber focus glow
- **CRT Scanlines**: Repeating linear gradient overlay at 2px intervals

## Motion

- `transition-smooth`: 0.3s cubic-bezier(0.4, 0, 0.2, 1) for state changes
- `animate-blink`: Retro cursor blinking at 1s intervals for active states
- Hover: Slight glow increase, no rotation or bounce

## Constraints & Differentiation

- **Monospace everywhere**: No serifs, no variable fonts — pure Geist Mono
- **Zero radius**: All corners sharp, pixel-perfect, no rounded-lg defaults
- **Glowing text aesthetic**: Key data values glow via text-shadow
- **Grid-based spacing**: 4px base unit, aligned to retro aesthetic
- **No gradients**: Flat colors only, authentic CRT feel
- **Scanline texture**: Subtle horizontal lines on main surface
- **Phosphor glow**: Warm amber (hue 70°) mimics old monitor phosphor

## Signature Detail

CRT monitor emulation: scanline overlay combined with text-shadow glow on critical values creates authentic 1980s computer terminal feeling. Every interactive element has solid borders and retro styling. Brutalist data presentation — form follows function in genuine retro computing style.
