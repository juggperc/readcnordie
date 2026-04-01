# readchineseordie — Product Specification

## 1. Concept & Vision

**Core Experience**: A meditative, focused learning tool that transforms Chinese character recognition into a tactile scanning experience. The app feels like holding a magnifying glass to ancient wisdom—each scan reveals a character's soul: its strokes, sounds, and meaning. The sentence builder creates a puzzle where users piece together literal translations, making the abstract concrete.

**Emotional Tone**: Calm curiosity. Paper and ink. The quiet satisfaction of understanding.

---

## 2. Design Language

### Aesthetic Direction: "Digital Calligraphy Studio"
Inspired by Chinese ink paintings and woodblock printing—minimalist composition, generous whitespace, typography as art. Dark mode by default to make characters pop like calligraphy on aged paper.

### Color Palette

```css
:root {
  /* Core */
  --background: #0a0a0a;           /* Deep black - like ink */
  --surface: #141414;               /* Elevated surfaces */
  --surface-elevated: #1f1f1f;      /* Cards, modals */
  
  /* Character Display */
  --ink: #f5f5f5;                  /* Primary text - crisp white */
  --ink-muted: #a3a3a3;             /* Secondary text */
  --ink-subtle: #525252;            /* Tertiary - hints */
  
  /* Accents */
  --vermillion: #e63946;           /* Traditional Chinese red - primary action */
  --vermillion-glow: rgba(230, 57, 70, 0.15);
  
  --jade: #2a9d8f;                 /* Success, added to sentence */
  --jade-glow: rgba(42, 157, 143, 0.15);
  
  --gold: #d4a574;                 /* Stroke order highlight */
  
  /* Semantic */
  --border: #262626;
  --ring: #404040;
  --ring-focus: #e63946;
}
```

### Typography

```css
/* Primary: Noto Serif SC - elegant Chinese serif */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');

/* Secondary: JetBrains Mono - for pinyin, technical info */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

/* UI: Inter - clean interface text */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

:root {
  --font-character: 'Noto Serif SC', serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-ui: 'Inter', system-ui, sans-serif;
  
  /* Scale */
  --text-xs: 0.75rem;     /* 12px - hints */
  --text-sm: 0.875rem;    /* 14px - secondary */
  --text-base: 1rem;      /* 16px - body */
  --text-lg: 1.125rem;    /* 18px - emphasis */
  --text-xl: 1.5rem;      /* 24px - character meaning */
  --text-2xl: 2rem;       /* 32px - scanned character */
  --text-4xl: 4rem;       /* 64px - hero character */
}
```

### Spatial System

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-12: 3rem;      /* 48px */
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  /* Safe areas for mobile */
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
}
```

### Motion Philosophy

All animations serve comprehension—characters animate stroke-by-stroke so users see the writing order. Spring physics feel organic, not mechanical.

```typescript
// Spring configurations
const springs = {
  // Card entrance - smooth settle
  cardEntry: { type: "spring", stiffness: 300, damping: 25, mass: 0.8 },
  
  // Drag release - snappy response
  dragRelease: { type: "spring", stiffness: 500, damping: 30, mass: 0.5 },
  
  // Layout shifts - gentle flow
  layoutShift: { type: "spring", stiffness: 200, damping: 20 },
  
  // Button feedback - tactile
  buttonPress: { type: "spring", stiffness: 400, damping: 25 },
  
  // Stroke animation - deliberate pace
  strokeDraw: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
};

// Duration shortcuts
const durations = {
  instant: 0,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
};
```

### Visual Assets

- **Icons**: Lucide React (consistent stroke weight, minimal)
- **Character rendering**: Hanzi Writer for stroke animation
- **Decorative**: Subtle ink splatter textures (CSS gradients), paper grain via noise filter

---

## 3. Layout & Structure

### Screen Architecture

```
┌─────────────────────────────────────────┐
│ ▢ ▢ ▢ ▢        Status Bar        ▢ ▢  │  ← iOS status bar safe area
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      SENTENCE BUILDER BAR      │   │  ← Fixed top, shows scanned chars
│  │   [字][意][思] + [字][意][思]  │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │                                 │   │
│  │       CAMERA VIEWFINDER        │   │  ← Live camera feed
│  │                                 │   │
│  │          ┌─────────┐            │   │
│  │          │  [  ]  │            │   │  ← Scan target reticle
│  │          └─────────┘            │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [Flash] [Capture] [Gallery]   │   │  ← Fixed bottom controls
│  └─────────────────────────────────┘   │
│ ▢ ▢ ▢ ▢        Home Bar        ▢ ▢ ▢  │  ← iOS home indicator safe area
└─────────────────────────────────────────┘
```

### Modal Card (Character Detail)

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ✕                              │   │
│  │                                 │   │
│  │           ┌─────┐                │   │
│  │           │  思 │                │   │
│  │           │ sī  │                │   │  ← Large character + pinyin
│  │           └─────┘                │   │
│  │                                 │   │
│  │      "to think / to ponder"     │   │  ← Definition
│  │                                 │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │   [Stroke Animation]    │   │   │  ← Hanzi Writer animation
│  │  │      ▶ Play button      │   │   │
│  │  └─────────────────────────┘   │   │
│  │                                 │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │                         │   │   │
│  │  │   Sentence context...   │   │   │  ← Optional: example sentence
│  │  │                         │   │   │
│  │  └─────────────────────────┘   │   │
│  │                                 │   │
│  │  ┌────────────┐ ┌────────────┐  │   │
│  │  │  Discard   │ │ Add to     │  │   │  ← Actions
│  │  │            │ │ Sentence  │  │   │
│  │  └────────────┘ └────────────┘  │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Responsive Strategy

- **Primary**: Mobile portrait (375px - 428px width)
- **Secondary**: Tablet portrait, desktop
- **Camera**: Full viewport, no scrolling during scan
- **Modals**: Bottom sheet style on mobile, centered card on desktop
- **Touch targets**: Minimum 44x44px

---

## 4. Features & Interactions

### 4.1 Camera Scanning

**Entry Flow**:
1. App opens → Camera viewfinder activates immediately
2. User points at Chinese character in book
3. Real-time detection feedback (character detection is future, not MVP)

**Capture Flow**:
1. User taps capture button
2. Current frame freezes momentarily (100ms)
3. Frame sent to Tesseract.js for OCR
4. Loading state: Pulsing scan reticle
5. Result: Character recognized OR "No character found" error

**OCR Configuration** (Tesseract.js):
```typescript
const ocrConfig = {
  language: 'chi_sim',           // Simplified Chinese
  psmMode: 10,                   // SINGLE_CHAR - critical for single character
  preprocess: {
    grayscale: true,
    threshold: 140,
    contrast: 1.8,
    scale: 2,                     // Upscale for accuracy
  }
};
```

**Error States**:
- "No character detected" - Try again, adjust angle/lighting
- "Multiple characters detected" - Please scan one at a time
- "Character not recognized" - This character isn't in our database

### 4.2 Character Detail Card

**Appearance Animation** (Framer Motion):
```typescript
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }
};
```

**Dismissal Options**:
1. Tap ✕ button (top-left)
2. Swipe down on card
3. Tap outside card (on dimmed overlay)

**Stroke Order Animation**:
- Auto-plays once when card opens
- User can replay via Play button
- Animation speed: 600ms per stroke
- Stroke color: `--gold` with fade trail

### 4.3 Sentence Builder

**Add to Sentence**:
1. User taps "Add to Sentence" button
2. Card animates out (exit variant)
3. Character mini-card appears in top bar
4. Mini-card: Character + literal meaning only

**Mini-Card States**:
```
Default:    [字] think
Hover:      [字] think (slight lift, glow)
Active:     [字] think (scale 0.95, jade border)
```

**Sentence Bar Behavior**:
- Horizontally scrollable when many characters
- Characters flow left-to-right
- Empty state: Subtle hint text "Scan characters to build a sentence"
- Max characters before scroll: 5-6 depending on screen width

**Clear Sentence**:
- Long-press on sentence bar reveals clear option
- Or: dedicated clear button appears after 3+ characters
- Confirmation: "Clear all scanned characters?"

**Drag to Reorder** (Future):
- Long-press mini-card to enter reorder mode
- Drag to rearrange word order
- Sentence meaning updates dynamically

### 4.4 Pinyin Display

- Shown below character in detail card only
- Format: `pīnyīn` (tone marks, not numbers)
- Font: JetBrains Mono for clarity
- Tappable: Tap pinyin to hear audio (future feature)

### 4.5 Offline Behavior

**Cached Data**:
- Tesseract.js worker initialized on first use, stays in memory
- Character dictionary data: ~500KB for 500 most common characters
- Hanzi Writer stroke data: Loaded per-character, cached in IndexedDB

**Offline Capability**:
- Full scanning and character lookup works offline
- Stroke animations work offline
- No server dependency after initial load

---

## 5. Component Inventory

### 5.1 CameraViewfinder

**Purpose**: Full-screen camera preview with scan targeting overlay

**States**:
- **Loading**: "Initializing camera..." with spinner
- **Active**: Live camera feed with scan reticle
- **Processing**: Captured frame, scan reticle pulses
- **Error**: Camera access denied message + fallback options
- **Disabled**: Camera not available (fallback mode)

**Visual Elements**:
- Scan reticle: Centered square, 200x200px, corner brackets in vermillion
- Subtle vignette around edges (CSS radial gradient)
- Semi-transparent top/bottom bars for status/controls

### 5.2 ScanReticle

**Purpose**: Visual guide for character placement

**States**:
- **Idle**: Subtle corner brackets, 50% opacity
- **Detecting**: Corner brackets animate inward slightly
- **Captured**: Flash white briefly
- **Error**: Shake animation (horizontal oscillation)

**Animation**:
```typescript
const reticleVariants = {
  idle: { opacity: 0.5, scale: 1 },
  active: { opacity: 1, scale: 1.02 },
  captured: { opacity: 0, scale: 1.1 },
  error: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
};
```

### 5.3 CharacterCard (Detail Modal)

**Purpose**: Display scanned character with full information

**States**:
- **Loading**: Skeleton with pulsing placeholder for character
- **Loaded**: Full content displayed
- **Error**: Error message with retry button
- **Animating**: Stroke order animation in progress

**Content Sections**:
1. Header: Close button (✕)
2. Character display: Large (64px), centered
3. Pinyin: Below character, mono font
4. Definition: Quoted, with part of speech
5. Stroke order: Hanzi Writer canvas (150x150px)
6. Actions: Discard / Add to Sentence buttons

### 5.4 MiniCharacterCard

**Purpose**: Compact character display in sentence builder

**Size**: ~80px wide, ~60px tall
**Content**: Character (32px) + Meaning (12px, truncated if needed)

**States**:
- **Default**: Subtle background, character prominent
- **Hover**: Lift shadow, slight scale up
- **Active/Pressed**: Scale down, jade border
- **Dragging**: Elevated shadow, slight rotation

### 5.5 SentenceBuilder

**Purpose**: Fixed top bar showing scanned characters

**States**:
- **Empty**: Placeholder text, very subtle
- **Populated**: MiniCharacterCards in horizontal scroll
- **Overflow**: Fade edges indicate more content
- **Clearing**: Confirmation dialog

**Interactions**:
- Tap mini-card: Show character detail (popup, not modal)
- Long-press: Enter reorder mode
- Swipe: Scroll through characters

### 5.6 CaptureButton

**Purpose**: Trigger frame capture for OCR

**Size**: 72px diameter (touch-friendly)
**Position**: Center bottom control bar

**States**:
- **Default**: White circle, vermillion ring
- **Hover**: Ring expands slightly
- **Pressed**: Scale to 0.9, ring fills with vermillion
- **Processing**: Inner spinner replaces icon
- **Disabled**: Grayed out, no interaction

### 5.7 ControlBar

**Purpose**: Bottom bar with camera controls

**Layout**: Three buttons evenly spaced
**Buttons**:
- Flash toggle (left) - icon changes based on state
- Capture (center) - CaptureButton component
- Gallery (right) - fallback image picker

### 5.8 LoadingState

**Purpose**: Indicate ongoing processing

**Variants**:
- **Card loading**: Skeleton with character placeholder
- **Stroke loading**: Pulsing Hanzi Writer outline
- **Global**: Overlay with spinner and status text

### 5.9 ErrorState

**Purpose**: Display error messages with recovery actions

**Types**:
- **Camera error**: Permission denied, no camera found
- **OCR error**: No character found, recognition failed
- **Network error**: (Future) API failures
- **General error**: Unexpected failures

**Visual**: Red-tinted background, error icon, message, action button(s)

### 5.10 EmptyState

**Purpose**: Guide user when no content

**Sentence Builder Empty**:
- Text: "Scan characters to build a sentence"
- Subtle book/scanner icon above
- Fades out once first character added

---

## 6. Technical Approach

### Framework & Architecture

```
/app
├── layout.tsx              # Root layout with fonts, providers
├── page.tsx                # Main camera/scanner page
├── globals.css             # CSS variables, base styles
├── components/
│   ├── camera/
│   │   ├── CameraViewfinder.tsx
│   │   ├── ScanReticle.tsx
│   │   ├── CaptureButton.tsx
│   │   └── ControlBar.tsx
│   ├── character/
│   │   ├── CharacterCard.tsx
│   │   ├── StrokeAnimation.tsx
│   │   └── MiniCharacterCard.tsx
│   ├── sentence/
│   │   ├── SentenceBuilder.tsx
│   │   └── ReorderableList.tsx
│   ├── ui/                  # Shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx        # Bottom sheet for mobile
│   │   └── ...
│   └── providers/
│       ├── OCRProvider.tsx   # Tesseract.js worker management
│       └── CharacterDataProvider.tsx
├── lib/
│   ├── ocr.ts              # Tesseract.js wrapper
│   ├── preprocess.ts       # Image preprocessing for OCR
│   ├── character-data.ts  # Make Me a Hanzi data access
│   ├── camera.ts           # getUserMedia utilities
│   └── utils.ts            # General utilities
├── hooks/
│   ├── useCamera.ts
│   ├── useOCR.ts
│   └── useSentence.ts
└── types/
    └── index.ts            # TypeScript interfaces
```

### Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 14+ (App Router) | Client components for camera/OCR |
| Runtime | Bun | Fast install, native TypeScript |
| OCR | Tesseract.js 5 | Client-side, NOT edge runtime |
| Stroke Animation | Hanzi Writer | Free, MIT, 9k+ characters |
| Dictionary Data | Make Me a Hanzi | Local JSON, ~500 common chars |
| UI Components | Shadcn UI + Radix | Accessible primitives |
| Animation | Framer Motion | Spring physics, gestures |
| Styling | Tailwind CSS | Via Shadcn |
| Deployment | Vercel | Edge not used for OCR |

### Data Architecture

**Character Data Flow**:
```
Camera Frame → Preprocess (canvas) → Tesseract.js → Raw Character
                                                    ↓
                        Hanzi Writer ← Local JSON (dictionary)
                            ↓
                     CharacterCard (with definition + strokes)
```

**Local Character Data** (Make Me a Hanzi subset):
```typescript
interface CharacterData {
  character: string;           // "思"
  pinyin: string;              // "si1"
  definition: string;          // "to think / to ponder"
  strokes: string[];           // SVG path data
  medians: number[][][];       // Animation guide points
}
```

**Bundle Strategy**:
- Include top 500 most common characters (~400KB gzipped)
- Lazy-load additional characters from IndexedDB on demand
- Hanzi Writer auto-loads stroke data from CDN (cached)

### Camera Implementation (Safari-Safe)

```typescript
const SAFARI_CAMERA_CONFIG: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: 'environment' },  // Back camera
    width: { ideal: 1280 },                // HD for OCR accuracy
    height: { ideal: 720 },
    frameRate: { ideal: 15 },             // Battery saver
    advanced: [{ zoom: 1.0 }]             // Lock to wide lens
  },
  audio: false
};
```

**Frame Capture Pattern**:
```typescript
// Use requestVideoFrameCallback where available (Safari 15+)
if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
  video.requestVideoFrameCallback(captureFrame);
} else {
  requestAnimationFrame(captureFrame);  // Fallback
}
```

### OCR Pipeline

```typescript
// Preprocessing for Chinese OCR
async function preprocessForOCR(
  videoFrame: ImageData,
  targetSize = 300
): Promise<ImageData> {
  // 1. Convert to grayscale (Chinese chars are high contrast)
  // 2. Increase contrast (1.8x)
  // 3. Threshold/binarize for clean edges
  // 4. Scale up (2x) for Tesseract accuracy
  // Returns processed ImageData
}

// Tesseract recognition
async function recognizeCharacter(
  imageData: ImageData
): Promise<string | null> {
  const worker = await getOCRWorker();  // Singleton
  await worker.setParameters({
    tessedit_pageseg_mode: 10,  // SINGLE_CHAR
  });
  const { data: { text } } = await worker.recognize(imageData);
  return text.trim().charAt(0) || null;  // First character only
}
```

### State Management

**React Context for Global State**:
```typescript
interface AppState {
  // Sentence
  sentence: SentenceItem[];
  addToSentence: (char: CharacterData) => void;
  removeFromSentence: (id: string) => void;
  clearSentence: () => void;
  
  // Camera/OCR
  isScanning: boolean;
  isProcessing: boolean;
  lastScanned: CharacterData | null;
  
  // UI
  activeCard: CharacterData | null;  // Currently displayed card
}
```

### Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| OCR Recognition | < 2s per frame |
| Animation Frame Rate | 60fps |
| Memory (mobile) | < 150MB |
| Bundle Size (initial) | < 200KB gzipped |

### Vercel Deployment Notes

- **No Edge Runtime**: Tesseract.js requires WebAssembly + Web Workers (Node.js runtime)
- **Client Components**: All camera/OCR code must use `'use client'`
- **Large Dependencies**: Tesseract.js (~2MB) should be dynamically imported
- **ISR**: Not needed (no server-rendered content)

---

## 7. Implementation Phases

### Phase 1: Foundation
- [x] Project setup (Next.js, Tailwind, Shadcn)
- [ ] Camera viewfinder component
- [ ] Safari-safe getUserMedia
- [ ] Frame capture to canvas

### Phase 2: OCR Integration
- [ ] Tesseract.js worker setup
- [ ] Image preprocessing pipeline
- [ ] Single character recognition
- [ ] Loading/error states

### Phase 3: Character Display
- [ ] CharacterCard modal
- [ ] Hanzi Writer integration
- [ ] Stroke order animation
- [ ] Pinyin/definition display

### Phase 4: Sentence Builder
- [ ] SentenceBuilder bar
- [ ] MiniCharacterCard
- [ ] Add/remove interactions
- [ ] Framer Motion animations

### Phase 5: Polish
- [ ] Empty states
- [ ] Error recovery
- [ ] Performance optimization
- [ ] Mobile viewport handling

---

## 8. File Manifest

```
readchineseordie/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── providers/
│       └── AppProvider.tsx
├── components/
│   ├── camera/
│   │   ├── CameraViewfinder.tsx
│   │   ├── ScanReticle.tsx
│   │   ├── CaptureButton.tsx
│   │   └── ControlBar.tsx
│   ├── character/
│   │   ├── CharacterCard.tsx
│   │   ├── StrokeAnimation.tsx
│   │   └── MiniCharacterCard.tsx
│   ├── sentence/
│   │   └── SentenceBuilder.tsx
│   └── ui/                    # Shadcn components
├── lib/
│   ├── ocr.ts
│   ├── preprocess.ts
│   ├── character-data.ts
│   ├── camera.ts
│   └── utils.ts
├── hooks/
│   ├── useCamera.ts
│   ├── useOCR.ts
│   └── useSentence.ts
├── types/
│   └── index.ts
├── public/
│   └── data/
│       └── characters.json     # Make Me a Hanzi subset
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── SPEC.md
```
