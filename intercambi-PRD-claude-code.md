# intercambi.app — Product Requirements Document (PRD)
### Demo Brief for Claude Code · v1.0 · 2026

---

## PROJECT OVERVIEW

**App name:** intercambi.app  
**Type:** Mobile-first peer-to-peer trading platform  
**Concept:** A Tinder-style interface for swapping physical products and services. Users list what they offer, declare what they want, and the platform auto-matches them based on semantic overlap between offers and wishlists.  
**Markets:** Mexico and United States (bilingual: Spanish + English)  
**Monetization:** Advertising only — no fees, no commissions, no paywalls  
**Demo goal:** A functional HTML/CSS/JS single-page prototype that demonstrates the core UX flows listed below. Mobile viewport (390px wide) simulated in browser.

---

## VISUAL IDENTITY

```
Primary color:     #1A1A2E  (deep navy — backgrounds, navbars)
Accent color:      #00F5A0  (swap green — CTAs, matches, active states)
Match color:       #FF6B6B  (coral red — match moment, hearts, alerts)
Surface:           #F7F7F2  (off-white — card backgrounds)
Text primary:      #1A1A2E
Text secondary:    #6B7280
Border/divider:    #E5E7EB
Font headline:     'Clash Display' or 'Syne' Bold (Google Fonts fallback: 'Poppins' 700)
Font body:         'DM Sans' Regular (Google Fonts fallback: 'Inter' 400)
Border radius:     20px (cards), 12px (buttons), 50px (pills/tags)
Shadow:            0 4px 24px rgba(0,0,0,0.10)
```

---

## APP STRUCTURE — 6 SECTIONS

```
1. Home (Swipe Feed)
2. Search (Trueques / Browse)
3. Messages (Chats)
4. Publish (New Listing)
5. Profile (My Account)
6. Match Screen (overlay/modal)
```

Navigation: Fixed bottom tab bar with icons + labels. Active tab uses swap-green accent.

---

## SECTION 1: HOME — SWIPE FEED

### Layout
- Full-screen card stack. One card visible at a time, next card peeking 8px below.
- Card fills ~80% of screen height.
- Bottom tab bar always visible.

### Product Card — Elements
Each card displays:
- **Hero image** (full card width, ~55% of card height) — placeholder gradient or unsplash image
- **Product name** (Clash Display Bold, 22px)
- **Estimated value** (e.g., "$800 MXN est." — user-set, no validation)
- **Category badge** (pill tag, swap-green background, e.g., "Instrumentos Musicales")
- **Location** (city + borough/colonia, with map pin icon, e.g., "Condesa, CDMX")
- **Owner mini-profile** (avatar circle + username + star rating, e.g., ⭐ 4.8)
- **Wishlist preview** — "Busca:" followed by up to 3 tags (e.g., "Viniles · Consolas · Cámara")
- **"Ver más" button** — swipe down or tap to expand card details

### Swipe Gestures (simulate with buttons for demo)
- ← Left arrow button: PASS (card flies left, red X overlay)
- → Right arrow button: LIKE (card flies right, green ✓ overlay)
- ↓ Down arrow button OR tap card: EXPAND to detail view

### Detail View (expanded card)
When expanded, show:
- Full description text (2–3 paragraphs of placeholder lorem)
- Up to 5 wishlist items (full list)
- "Video disponible" badge (placeholder — no actual video in demo)
- Full owner profile block (avatar, username, rating, # of exchanges, badges)
- "Me interesa" CTA button (swap-green, full width)

### Filter Bar (top of Home, collapsible)
Three toggle options (radio behavior — only one active):
1. **Mostrar todo** (default)
2. **Solo lo que busco** — show cards matching user's wishlist
3. **Perfiles que buscan lo que ofrezco** — show cards whose wishlist matches user's offers

Plus: **Distance slider** — 5km / 10km / 25km / 50km / Nacional

### Ad Placement
- Every 5 cards, inject an "Ad card" styled differently:
  - Light background, small "Publicidad" label top-right
  - Placeholder brand image + "Conoce más" CTA
  - Same swipe mechanics apply (user can pass ads)

---

## SECTION 2: SEARCH — BUSCADOR DE TRUEQUES

### Layout
- Search bar at top (placeholder: "Busca guitarras, vinilos, bicicletas...")
- Category filter pills below (horizontal scroll):
  - Todos · Electrónica · Ropa · Libros · Instrumentos · Deportes · Hogar · Videojuegos · Arte · Plantas · Servicios
- Results grid: 2-column card grid, smaller card format
- Each mini-card: image + name + location + estimated value + category badge

### Search behavior (demo)
- Typing filters the displayed mock results by keyword match on product name
- Category pills filter by category
- No backend required — filter from a hardcoded array of 20 mock products

---

## SECTION 3: MESSAGES — CHATS

### Layout
- List of active conversations
- Each row: avatar + username + last message preview + timestamp + unread badge
- Conversations only exist after a confirmed match

### Inside a Conversation
- Standard chat bubbles (sent right/swap-green, received left/gray)
- Input bar at bottom with:
  - Text input
  - 📎 Attach photo (placeholder — no upload needed in demo)
  - 🎤 Audio (placeholder button)
  - 📍 Location pin (placeholder button)
  - Send button
- **Ad banner** fixed above input bar:
  - 48px height, light background, placeholder "Publicidad" text + small brand name
- No video sharing in messages (by design)

### Match notification (entry point to chat)
When a match occurs (see Match Screen), user taps "Iniciar chat" and lands here.

---

## SECTION 4: PUBLISH — NEW LISTING

### Form Fields (in order)
1. **Fotos** — up to 6 photo slots (tap to add, placeholder grid, first slot required)
2. **Video** — optional, up to 15 seconds label ("Video corto opcional · máx 15 seg")
3. **Nombre del producto** — text input
4. **Descripción** — textarea
5. **Valor estimado** — number input + currency selector (MXN / USD)
6. **Categoría** — dropdown (10 categories listed above)
7. **Colonia y ciudad** — text input (e.g., "Roma Norte, CDMX")
8. **¿Qué quieres a cambio?** — up to 5 items (dynamic add/remove tags, optional)
   - "Acepto efectivo también" checkbox below

### Submit
- "Publicar intercambio" button (swap-green, full width)
- Success state: confirmation screen with confetti animation + "¡Tu producto está en vivo!"

---

## SECTION 5: PROFILE — MY ACCOUNT

### Header Block
- Avatar (large circle, editable)
- Display name + username
- Location (city)
- Star rating (e.g., ⭐ 4.9) + total exchanges count (e.g., "23 intercambios")
- Bio / short description

### Badges Section
Label: "Mis badges"
Display earned badges as icon + name chips. Unearned badges shown grayed out.

**Performance Badges:**
| Badge | Trigger |
|---|---|
| 🔰 Novato del Trueque | First completed exchange |
| 📦 Coleccionista | 10 completed exchanges |
| 🏪 El Mercader | 50 completed exchanges |
| 👑 Rey del Swap | 100+ completed exchanges |
| ⚡ Respuesta Rápida | Avg. response time under 1 hour |
| ⭐ 5 Estrellas | Rating of 5.0 with 10+ reviews |
| 🌎 Políglota del Trueque | Exchanges completed in both MX and USA |
| 🔀 Multitrueque | Exchanges in 5+ different categories |

**Category Badges:**
| Badge | Category | Trigger |
|---|---|---|
| 💻 Techie Swapper | Electrónica y gadgets | 3+ exchanges |
| 👗 Fashion Trader | Ropa y accesorios | 3+ exchanges |
| 📚 Biblionauta | Libros y coleccionables | 3+ exchanges |
| 🎸 Rockstar del Trueque | Instrumentos musicales | 3+ exchanges |
| 🏋️ Atleta del Swap | Deportes y fitness | 3+ exchanges |
| 🏠 Home Dealer | Hogar y decoración | 3+ exchanges |
| 🎮 Player One | Juguetes y videojuegos | 3+ exchanges |
| 🎨 Artesano del Cambio | Arte y manualidades | 3+ exchanges |
| 🌿 Green Trader | Plantas y jardín | 3+ exchanges |
| 🤝 Skill Swapper | Servicios y habilidades | 3+ exchanges |

*Note: Full badge system is in development. Demo shows a representative selection.*

### My Listings
Horizontal scroll row of user's active product cards (smaller format).
Each card: image + product name + status pill (Activo / En negociación / Intercambiado)

### Stats Block
3 numbers side by side:
- Intercambios completados
- Calificación promedio
- Tiempo de respuesta promedio

### Rating History
Recent reviews from trading partners. Each: avatar + username + star rating + short comment + date.

---

## MATCH SYSTEM — LOGIC & SCREENS

### Match Logic (how it works)
A match is triggered when:

**Condition A (mutual like):**
- User A likes Product B
- AND Product B's owner listed a wishlist item that overlaps with any of User A's active listings

**Condition B (manual request — no match):**
- User A likes Product B but has no overlapping listing
- User A can send a "notificación de interés" — a ping to Product B's owner
- Owner manually reviews and can approve the match → chat unlocks

### Match Screen (Modal overlay)
Triggered on Condition A match. Full-screen animated overlay:
- Background: dark navy with animated swap-green particles
- Two product cards flying together with "💚 ¡Es un match!" headline
- Both user avatars shown side by side
- Product names listed: "Tu guitarra × Su vinil"
- Two buttons:
  - "Iniciar chat" (swap-green, primary)
  - "Ver más tarde" (ghost button)

### Post-Match: Chat Flow
- Chat opens automatically if "Iniciar chat" tapped
- First message is a system message: "🎉 ¡Hicieron match! Ya pueden negociar los detalles de su intercambio."
- Users negotiate freely — logistics, meetup point, shipping, all up to them
- intercambi.app is not responsible for exchange logistics (add small disclaimer in chat header)

### Confirming an Exchange
- Either party taps "Confirmar intercambio" button in chat options (⋮ menu)
- Both parties must confirm
- After both confirm → Rating flow triggers

### Rating Flow
After both confirm:
- Full-screen rating screen: "¿Cómo te fue con [username]?"
- 1–5 star selector (large stars, tap to select)
- Short comment textarea (optional)
- "Enviar calificación" button
- After rating: Badge check animation — if new badge earned, show badge unlock screen with confetti

---

## MOCK DATA — PRODUCT LISTINGS

Build demo with these 20 mock products (mix of MX and US items):

```javascript
const mockProducts = [
  { id: 1, name: "Guitarra Fender Stratocaster", category: "Instrumentos", value: 8500, currency: "MXN", location: "Condesa, CDMX", image: "guitar", owner: "carlos_mx", rating: 4.9, exchanges: 12, wishlist: ["Sintetizador", "Teclado MIDI", "Bajo eléctrico"] },
  { id: 2, name: "Colección de Viniles 80s", category: "Libros y coleccionables", value: 2200, currency: "MXN", location: "Roma Norte, CDMX", image: "vinyl", owner: "ana_records", rating: 5.0, exchanges: 34, wishlist: ["Tornamesa", "Amplificador", "Casetes"] },
  { id: 3, name: "Bicicleta de montaña Trek", category: "Deportes", value: 6000, currency: "MXN", location: "Polanco, CDMX", image: "bike", owner: "bike_trader", rating: 4.7, exchanges: 8, wishlist: ["Patines", "Longboard", "Casco premium"] },
  { id: 4, name: "PlayStation 5 + 3 juegos", category: "Videojuegos", value: 14000, currency: "MXN", location: "Monterrey, NL", image: "ps5", owner: "gamer_mty", rating: 4.8, exchanges: 5, wishlist: ["Xbox Series X", "Nintendo Switch", "PC gaming"] },
  { id: 5, name: "Album Mundial 2026 completo", category: "Libros y coleccionables", value: 1500, currency: "MXN", location: "Guadalajara, JAL", image: "album", owner: "futbol_fan", rating: 4.6, exchanges: 19, wishlist: ["Camiseta selección", "Memorabilia", "Cromos raros"] },
  { id: 6, name: "iPhone 14 Pro 256GB", category: "Electrónica", value: 12000, currency: "MXN", location: "Santa Fe, CDMX", image: "iphone", owner: "techseller_mx", rating: 4.9, exchanges: 27, wishlist: ["Samsung S24", "iPad", "MacBook Air"] },
  { id: 7, name: "Cafetera Nespresso Vertuo", category: "Hogar", value: 3500, currency: "MXN", location: "Napoles, CDMX", image: "coffee", owner: "cafe_lover", rating: 4.5, exchanges: 3, wishlist: ["Licuadora Vitamix", "Freidora de aire", "Batidora KitchenAid"] },
  { id: 8, name: "Colección manga One Piece 1-50", category: "Libros y coleccionables", value: 4000, currency: "MXN", location: "Coyoacán, CDMX", image: "manga", owner: "otaku_mx", rating: 5.0, exchanges: 41, wishlist: ["Figura coleccionable", "Otros mangas", "Anime merch"] },
  { id: 9, name: "Tabla de surf 6'2\"", category: "Deportes", value: 7500, currency: "MXN", location: "Puerto Escondido, OAX", image: "surfboard", owner: "surf_mx", rating: 4.8, exchanges: 6, wishlist: ["Kayak", "SUP", "Equipo buceo"] },
  { id: 10, name: "Cámara Sony Alpha A6000", category: "Electrónica", value: 9000, currency: "MXN", location: "Juárez, CDMX", image: "camera", owner: "foto_pro", rating: 4.7, exchanges: 15, wishlist: ["Drone", "Gopro", "Lentes adicionales"] },
  { id: 11, name: "Vintage Levis 501 Collection", category: "Ropa", value: 3200, currency: "MXN", location: "Hipódromo, CDMX", image: "jeans", owner: "vintage_moda", rating: 4.9, exchanges: 52, wishlist: ["Chamarras vintage", "Tenis retro", "Accesorios 90s"] },
  { id: 12, name: "Clases de inglés (10 sesiones)", category: "Servicios", value: 2000, currency: "MXN", location: "Online / CDMX", image: "english", owner: "teacher_mx", rating: 5.0, exchanges: 18, wishlist: ["Clases de diseño", "Clases de programación", "Coaching"] },
  { id: 13, name: "Macbook Pro M1 2021", category: "Electrónica", value: 25000, currency: "MXN", location: "Los Angeles, CA", image: "macbook", owner: "tech_la", rating: 4.8, exchanges: 9, wishlist: ["iPad Pro", "Monitor 4K", "Teclado mecánico"] },
  { id: 14, name: "Jordan 1 Retro High OG size 10", category: "Ropa", value: 280, currency: "USD", location: "Houston, TX", image: "jordans", owner: "sneaker_tx", rating: 4.6, exchanges: 23, wishlist: ["Air Force 1", "Yeezy", "New Balance 990"] },
  { id: 15, name: "Planta Monstera Deliciosa grande", category: "Plantas", value: 800, currency: "MXN", location: "Xochimilco, CDMX", image: "plant", owner: "green_soul", rating: 5.0, exchanges: 7, wishlist: ["Suculentas raras", "Orquídeas", "Cactus"] },
  { id: 16, name: "Mesa de billar plegable", category: "Hogar", value: 5500, currency: "MXN", location: "Naucalpan, EDOMEX", image: "pool", owner: "casa_gamer", rating: 4.4, exchanges: 2, wishlist: ["Futbolito", "Ping pong", "Consola retro"] },
  { id: 17, name: "Set de óleos y lienzos artista", category: "Arte", value: 2800, currency: "MXN", location: "San Ángel, CDMX", image: "paint", owner: "artista_mx", rating: 4.9, exchanges: 11, wishlist: ["Tablet Wacom", "Cámara", "Curso arte digital"] },
  { id: 18, name: "Teclado mecánico Keychron K2", category: "Electrónica", value: 4500, currency: "MXN", location: "Satelite, EDOMEX", image: "keyboard", owner: "dev_mx", rating: 4.7, exchanges: 14, wishlist: ["Monitor gaming", "Mouse ergonómico", "Webcam 4K"] },
  { id: 19, name: "Mochila North Face 40L", category: "Deportes", value: 2200, currency: "MXN", location: "Puebla, PUE", image: "backpack", owner: "aventurero", rating: 4.6, exchanges: 8, wishlist: ["Sleeping bag", "Tienda de campaña", "Botas hiking"] },
  { id: 20, name: "Colección Funko Pop Marvel (12 pzs)", category: "Libros y coleccionables", value: 3600, currency: "MXN", location: "Tlalpan, CDMX", image: "funko", owner: "collector_mx", rating: 4.8, exchanges: 31, wishlist: ["Figuras anime", "LEGO sets", "Hot Wheels edición especial"] }
];
```

---

## USER PROFILE — DEMO USER

```javascript
const currentUser = {
  username: "cesar_intercambi",
  displayName: "César R.",
  location: "Condesa, CDMX",
  avatar: null, // placeholder initials
  rating: 4.9,
  totalExchanges: 7,
  responseTime: "< 1 hora",
  bio: "Me gustan los intercambios justos y rápidos. Sin dramas.",
  listings: [
    { id: 101, name: "Guitarra eléctrica Squier", category: "Instrumentos", value: 4500, currency: "MXN", status: "Activo" },
    { id: 102, name: "Album Mundial 2026 incompleto", category: "Coleccionables", value: 600, currency: "MXN", status: "Activo" },
    { id: 103, name: "Bicicleta urbana Mercier", category: "Deportes", value: 3200, currency: "MXN", status: "En negociación" }
  ],
  wishlist: ["Viniles", "Sintetizador", "Cámara analógica"],
  badges: {
    earned: ["novato", "respuesta_rapida", "rockstar"],
    locked: ["coleccionista", "mercader", "rey", "cinco_estrellas", "poliglota", "multitrueque", "techie", "fashion", "biblionauta", "atleta", "home_dealer", "player_one", "artesano", "green_trader", "skill_swapper"]
  }
};
```

---

## DEMO FLOWS TO DEMONSTRATE

### Flow 1: Home Swipe
1. User sees card stack (product 1 visible)
2. Taps ← → ↓ buttons to interact
3. On card 5: Ad card appears
4. On specific card: triggers Match Screen

### Flow 2: Match Screen
1. User swipes right on "Colección de Viniles 80s" (product 2)
2. System detects: ana_records wishlist = ["Tornamesa", "Amplificador", "Casetes"] — no match
3. User swipes right on "Macbook Pro M1" (product 13)
4. System detects: tech_la wishlist = ["iPad Pro", "Monitor 4K", "Teclado mecánico"] — no match with current user
5. **Trigger match manually:** Swipe right on product that has "Instrumentos" in wishlist
6. Match screen fires → "Iniciar chat" → opens conversation

### Flow 3: Publish a Listing
1. Tap + tab
2. Fill form fields (demo pre-fills some data)
3. Tap "Publicar"
4. Confetti success screen

### Flow 4: Profile + Badges
1. Tap Profile tab
2. See current user stats
3. Earned badges are highlighted, locked badges grayed out
4. Tap a locked badge to see tooltip: "Completa X intercambios en esta categoría"

---

## TECHNICAL NOTES FOR CLAUDE CODE

- **Single HTML file** preferred for demo (or React if needed for animations)
- **No backend required** — all data is hardcoded mock data
- **Mobile viewport** — design for 390px width, simulate in browser
- **No actual file uploads, video playback, or real-time chat** — all placeholder UI
- **Swipe gestures** — simulate with visible tap/button controls for demo reliability
- **Animations:** Card swipe animation (translate + rotate), match screen entrance (scale + fade), badge unlock (confetti + scale)
- Use Google Fonts: Poppins (fallback for Clash Display) + DM Sans
- All text must be in **Spanish** (the primary market is Mexico)
- Include a small "🇺🇸 / 🇲🇽" language toggle in the header (non-functional in demo, visual only)

---

## OUT OF SCOPE FOR DEMO

- Real authentication / login
- Real image uploads or video playback
- Push notifications
- Actual geolocation
- Payment or shipping integration (by design — intercambi.app never handles transactions)
- Admin panel or moderation tools
- Reporting or blocking users (placeholder menu item only)

---

*intercambi.app PRD v1.0 — Demo scope only. Full product spec to follow post-seed.*
