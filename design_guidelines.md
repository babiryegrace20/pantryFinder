# Food Pantry Finder - Design Guidelines (Compacted)

## Core Principles
- **Dignity-first**: Clean, respectful interface treating users with agency
- **Mobile-primary**: Design smallest screen first
- **Accessibility-first**: WCAG 2.1 AA compliance mandatory
- **Framework**: Material Design adapted for social good

---

## Typography

**Fonts:**
- Primary: Inter (Google Fonts)
- Monospace: JetBrains Mono (data/addresses)

**Scale:**
```css
Hero/Display: text-4xl to text-5xl (36-48px) font-bold
Page Headers: text-3xl (30px) font-semibold
Section Headers: text-2xl (24px) font-semibold
Card Titles: text-xl (20px) font-medium
Body: text-base (16px) font-normal /* Minimum - never smaller */
Supporting: text-sm (14px) font-normal
Labels: text-xs (12px) font-medium uppercase
```

---

## Layout & Spacing

**Containers:**
- Main content: `max-w-7xl`
- Forms/reading: `max-w-4xl`
- Padding: `px-4 md:px-6 lg:px-8`

**Spacing Units:** 2, 3, 4, 6, 8, 12, 16, 24
- Component padding: `p-4` to `p-6`
- Sections: `py-12 md:py-16 lg:py-24`
- Cards: `gap-4` to `gap-6`
- Forms: `space-y-4`
- Buttons: `px-6 py-3` (standard), `px-4 py-2` (compact)

**Common Grids:**
```
Pantry cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
Metrics: grid-cols-2 md:grid-cols-4 gap-4
Map + list: grid-cols-1 lg:grid-cols-2 gap-6
```

---

## Components

### Navigation
- Sticky top bar: `h-16 md:h-20`, backdrop blur
- Logo left, actions right
- Mobile: Hamburger → full-screen overlay
- Role-based menu items, prominent "Get Help" button

### Pantry Card (Primary)
```
Structure:
├─ Image/Icon
├─ Title
├─ Distance badge (text-2xl font-bold)
├─ Quick stats grid (3 items)
├─ Availability indicators
└─ CTA button

Styling: p-6, border, hover shadow
Badges: Pill-shaped overlays ("Surplus Available", "Closes Soon")
```

### Forms

**Search Interface:**
- Large input: `h-14` minimum
- Icon prefix (search/location)
- Autocomplete dropdown
- Filter chips (pill-shaped, dismissible)
- "Use My Location" secondary button

**Input Fields:**
- Height: `h-12`
- Labels above (not placeholder-only)
- Helper text below
- Error states with icon + message
- Required indicators

**Multi-Step Forms:**
- Progress indicator top
- Single column, `max-w-2xl`
- Clear Back/Continue navigation

### Map
- Height: `h-96 md:h-screen`
- Clustered markers with availability status
- Selected state: enlarged + info popup
- Mobile: Toggle map/list with FAB
- Controls: Zoom (bottom-right), Re-center (top-right FAB), Filters (top-left panel)

### Buttons

**Hierarchy:**
```
Primary: h-12 rounded-lg solid fill (request, submit, save)
Secondary: h-12 outlined (cancel, back)
Tertiary: Text only, hover underline (learn more, details)
FAB: w-14 h-14 circular, fixed bottom-6 right-6 (mobile critical actions)
```

**Touch targets:** Minimum 44×44px

### Status Indicators

**Pills:**
```css
rounded-full px-3 py-1 text-xs uppercase
Variants: Available, Reserved, Claimed, Urgent, Surplus
Include icon + text where appropriate
```

**Distance/Time:**
- Icon prefix (map pin/clock)
- font-semibold text-lg

### Modals
- Centered, `max-w-md` (standard) or `max-w-sm` (confirmations)
- Padding: `p-6`
- Actions: Cancel left, Confirm right

### Data Display

**Dashboard Metrics:**
- Large number: `text-4xl font-bold` with label below
- Heroicons accompaniment
- Trend indicators (arrows + %)

**Inventory Table:**
- Sticky header, alternating rows
- Inline edit with save/cancel
- Mobile: Card-based | Desktop: Table

---

## Page Layouts

### Home/Landing
```
Hero: h-screen md:h-96, gradient overlay
  ├─ Centered max-w-3xl
  ├─ Large headline + search bar
  └─ Trust indicators ("20+ pantries • Real-time")

Below fold:
  ├─ 3-column how-it-works (icons + descriptions)
  ├─ Featured pantries (horizontal scroll mobile)
  └─ Footer (contact, about, privacy)
```

### Search Results
- Desktop: Split (map 40% | list 60%)
- Mobile: Tabbed or toggle map/list
- Filters: Sidebar (desktop) or bottom sheet (mobile)
- Empty state: Illustration + expand suggestions

### Pantry Detail
```
Header: Name, verified badge, distance, hours status
Sections (tabbed):
  ├─ Inventory (category grouping, search/filter)
  ├─ About & Eligibility
  └─ Contact & Directions

Mobile: Sticky CTA bar ("Request Items")
Map embed with directions link
```

### Pantry Dashboard (Staff)
```
Top row: Stats (total items, expiring soon, active requests, weekly distribution)
Quick actions: "Add Inventory", "Mark Surplus"
Inventory table: Bulk actions, inline edit
Requests queue: Pending with quick accept/decline
Real-time indicator: Pulsing dot/"Live" badge
```

### User Profile
- Sections: Personal Info | Addresses | Family | Preferences
- `space-y-8` between sections
- Address management: List with add/edit/delete
- Optional fields clearly marked

### Admin Dashboard
```
KPIs: Active pantries, requests today, surplus items
Charts: Demand trends, activity heatmap
Tables: Pantries list, user moderation (filterable, sortable, paginated)
```

---

## Real-time & Loading

**Live Updates:**
- Toast notifications (top-right)
- Animated count-up for metrics
- Pulsing indicators for concurrent edits
- "X people viewing" subtle indicator

**Loading States:**
- Skeleton screens (maintain layout)
- Button spinners for inline actions
- Progress bars for multi-step processes

---

## Imagery

**Hero:** Community/diverse individuals, gradient overlay for text readability, backdrop-blur buttons
**Pantry Cards:** Square thumbnails (exterior/logo) with icon fallback
**How-it-Works:** Illustration-style (not photos), warm/inclusive/hopeful

---

## Accessibility Essentials

- **Touch targets:** 44×44px minimum
- **Focus indicators:** Visible ring offset
- **ARIA labels:** Icon-only buttons
- **Skip-to-content** link
- **Form errors:** Clear messaging
- **Screen reader:** Announcements for real-time updates
- **Contrast:** 4.5:1 minimum

---

## Icons & Mobile

**Icons:** Heroicons (outline secondary, solid primary)
- Map pin (location), Clock (time), Shopping bag (requests), Alert/Check circles (status), Users (community), Calendar (scheduling)

**Mobile Optimizations:**
- Bottom navigation (Search, Requests, Profile)
- Swipe gestures for card actions
- Pull-to-refresh
- Large buttons in bottom third
- Collapsible filters

---

**Balance efficiency with empathy** - users find help quickly while maintaining dignity throughout.