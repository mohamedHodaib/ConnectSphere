---
name: ConnectSphere Modern
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#464555'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006e2f'
  on-secondary: '#ffffff'
  secondary-container: '#6bff8f'
  on-secondary-container: '#007432'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6bff8f'
  secondary-fixed-dim: '#4ae176'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  navbar-height: 64px
  left-sidebar-width: 280px
  right-sidebar-width: 350px
  feed-max-width: 650px
  container-max: 1280px
  gutter: 1.5rem
  section-padding: 2rem
---

## Brand & Style

ConnectSphere embodies a **Corporate Modern** aesthetic tailored for social networking and community engagement. The brand personality is professional yet approachable, utilizing a "fidelity" color variant that prioritizes clarity and high-quality visual feedback. 

The design style leans into **Minimalism** with subtle **Glassmorphism** in the navigation layers. It evokes a sense of organized, optimistic energy through the use of vibrant indigo accents and ample whitespace. The target audience includes professionals and creatives who value a focused, clutter-free environment for information exchange. Visual hierarchy is maintained through precise typography and soft containerization rather than aggressive borders.

## Colors

The palette is centered around a deep indigo (**Primary**) which serves as the core action color and brand identifier. A vibrant green (**Secondary**) is reserved for success states and secondary accents, while a muted gray-blue (**Neutral**) handles structural elements and borders.

The "fidelity" approach uses a sophisticated range of surface tones:
- **Background**: A very light, tinted blue-white to reduce eye strain compared to pure white.
- **Surface**: Pure white is reserved for high-priority cards and interactive containers to make them "pop" against the background.
- **Accents**: High-contrast error reds for notifications and destructive actions, and soft indigo washes for active navigation states.

## Typography

The system utilizes a dual-font strategy. **Plus Jakarta Sans** is used for all "structural" and "navigational" text—headlines, labels, and buttons—providing a friendly, geometric presence that feels modern and approachable. 

**Be Vietnam Pro** is the workhorse for body content. Its slightly more open apertures and contemporary proportions ensure high readability for long-form social posts and comments. Letter spacing is tightened slightly on larger headings to maintain a premium "editorial" feel, while body text remains neutral and clear.

## Layout & Spacing

The system follows a **Fixed Grid** philosophy centered within a 1280px container. It uses a multi-column architecture:
- **Left**: Fixed-width navigation and utility sidebar.
- **Center**: A focused "Feed" column restricted to 650px to optimize line length for readability.
- **Right**: A secondary sidebar for discovery and trending information.

Spacing follows an 8px (0.5rem) base unit. Standard margins between layout blocks are 24px (1.5rem), creating a "breathable" interface. The top navigation utilizes a `sticky` position with a `backdrop-blur` (glassmorphism) to maintain context while scrolling.

## Elevation & Depth

ConnectSphere uses a combination of **Tonal Layers** and **Ambient Shadows** to define its z-axis:

1.  **Level 0 (Background)**: The base `#f9f9ff` surface.
2.  **Level 1 (Cards/Containers)**: Pure white `#ffffff` surfaces with a very soft, highly diffused shadow (`0 4px 24px rgba(0,0,0,0.04)`). These are used for feed items and sidebar widgets.
3.  **Level 2 (Hover/Interaction)**: On hover, shadows deepen slightly (`0 8px 32px rgba(0,0,0,0.08)`) to indicate interactivity.
4.  **Glassmorphism**: The Top Navbar uses a semi-transparent white (`bg-white/80`) with a `backdrop-blur-md` to appear as if it is floating on a separate plane above the scrolling content.

## Shapes

The shape language is **Rounded**, favoring organic and friendly curves. 
- **Standard Cards**: 0.75rem (`rounded-xl`) to 1rem.
- **Interactive Inputs/Secondary Buttons**: Fully rounded (`rounded-full`) to emphasize a tactile, "pill" aesthetic that feels inviting to click.
- **Avatars**: Circular (`rounded-full`) for a classic social feel.
- **Selection States**: Sidebar active items use a 0.5rem (`rounded-lg`) corner radius with a distinctive left-border accent.

## Components

### Buttons
- **Primary**: Pill-shaped, `bg-primary-container` with `on-primary` text. Use a subtle scale-down effect on click.
- **Icon Buttons**: Circular background on hover (`bg-surface-container-low`), utilizing Material Symbols Outlined.

### Input Fields
- **Search**: Fully rounded, subtle background fill (`bg-surface-container-low`), with an inset leading icon.
- **Compose**: Borderless text area that grows vertically, separated from actions by a light `surface-variant` horizontal rule.

### Cards
- White background, `rounded-xl` corners, and subtle ambient shadows. Cards should have consistent 16px to 20px internal padding.

### Chips/Badges
- Used for notifications; small, circular or pill-shaped containers with high-contrast backgrounds (e.g., `bg-error` for alerts or `bg-primary` for counts).

### Navigation Items
- Vertical sidebar items use a 150ms transition for color and background changes. Active states are indicated by a slight color shift and a thick vertical border on the leading edge.