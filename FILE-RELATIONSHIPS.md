# 📁 JHOLA-BAZAR PROJECT FILE RELATIONSHIPS

## 🏗️ CORE ARCHITECTURE

### ROOT LAYOUT (`app/_layout.tsx`)
- Redux Provider (store)
- Theme Provider  
- Navigation Stack
- Status Bar
**Controls**: All app navigation, Redux state, theming

## 🗂️ NAVIGATION STRUCTURE

### TAB LAYOUT (`app/(tabs)/_layout.tsx`)
- Home (index.tsx)
- Categories (categories.tsx)
- Search (search.tsx)
- Profile (profile.tsx)
**Controls**: Bottom tab navigation, tab bar animations

### STACK SCREENS (`app/`)
- login.tsx
- cart.tsx
- checkout.tsx
- product/[id].tsx
- category/[name].tsx
- orders.tsx
- addresses.tsx
- referral.tsx

## 🏪 STATE MANAGEMENT (Redux)

### STORE (`store/store.ts`)
- cartSlice.ts → Cart items, quantities, total
- productsSlice.ts → Products, categories, filters
- userSlice.ts → User data, addresses, login
- uiSlice.ts → Theme, UI preferences

## 📊 DATA LAYER

### DATA FILES (`data/`)
- products.ts → Mock product data
- sections.ts → Home page sections
- categoryImages.ts → Category image URLs

### CONSTANTS (`constants/`)
- Colors.ts → Light/Dark theme colors

## 🧩 COMPONENTS HIERARCHY

### PRODUCT RELATED
**ProductCard.tsx**
- Uses: Product data from Redux
- Actions: Add to cart, navigate to product
- Used by: Home, Categories, Search, Category pages

### NAVIGATION RELATED
**CategoryList.tsx**
- Uses: Categories from Redux
- Actions: Filter products by category
- Used by: Home page

**CategoryCard.tsx**
- Uses: Category data
- Actions: Navigate to category page
- Used by: Categories page

### UI COMPONENTS
- BannerCarousel.tsx → Home page banners
- SectionCard.tsx → Home page sections
- SectionHeader.tsx → Section titles
- ThemeDropdown.tsx → Theme selector

## 🔄 FILE RELATIONSHIPS MAP

### HOME PAGE FLOW
```
app/(tabs)/index.tsx
├── Imports: ProductCard, CategoryList, BannerCarousel
├── Uses: products.ts, sections.ts
├── Redux: products, cart state
└── Navigation: → product/[id], cart, search
```

### PRODUCT FLOW
```
data/products.ts → store/productsSlice.ts → components/ProductCard.tsx
                                         ↓
app/(tabs)/index.tsx ← components/CategoryList.tsx ← store/productsSlice.ts
```

### CART FLOW
```
components/ProductCard.tsx → store/cartSlice.ts → app/cart.tsx → app/checkout.tsx
```

### USER FLOW
```
app/login.tsx → store/userSlice.ts → app/(tabs)/profile.tsx
                                  ↓
                              app/addresses.tsx, app/orders.tsx
```

### THEME FLOW
```
constants/Colors.ts → hooks/useTheme.ts → All components
                                       ↓
                              store/uiSlice.ts ← components/ThemeDropdown.tsx
```

## 🎯 KEY CUSTOMIZATION POINTS

### To Modify Products
1. `data/products.ts` → Add/edit products
2. `data/sections.ts` → Modify home sections
3. `components/ProductCard.tsx` → Change product display

### To Modify UI
1. `constants/Colors.ts` → Change colors
2. `components/` → Modify component styles
3. `hooks/useTheme.ts` → Theme logic

### To Modify Navigation
1. `app/_layout.tsx` → Add/remove screens
2. `app/(tabs)/_layout.tsx` → Modify tabs
3. Individual screen files → Screen content

### To Modify State
1. `store/slices/` → Add/modify Redux slices
2. `store/store.ts` → Register new slices

## 📱 SCREEN DEPENDENCIES

### Home Screen (`app/(tabs)/index.tsx`)
**Imports:**
- BannerCarousel, CategoryList, ProductCard, SectionCard, SectionHeader
- mockProducts, sections data
- Redux: products, cart state

### Categories Screen (`app/(tabs)/categories.tsx`)
**Imports:**
- ProductCard, CategoryCard
- Redux: products state

### Search Screen (`app/(tabs)/search.tsx`)
**Imports:**
- ProductCard
- Redux: products state

### Profile Screen (`app/(tabs)/profile.tsx`)
**Imports:**
- ThemeDropdown
- Redux: user state

### Cart Screen (`app/cart.tsx`)
**Imports:**
- Redux: cart state
- Navigation: → checkout

### Checkout Screen (`app/checkout.tsx`)
**Imports:**
- Redux: cart, user state
- API: Payment processing

### Product Detail (`app/product/[id].tsx`)
**Imports:**
- Redux: products, cart state
- Navigation: ← back, → cart

### Category Page (`app/category/[name].tsx`)
**Imports:**
- ProductCard, categoryImages
- Redux: products, cart state

### Login Screen (`app/login.tsx`)
**Imports:**
- Google OAuth, API calls
- Redux: user actions
- Navigation: → referral

## 🔧 HOOKS & UTILITIES

### Custom Hooks (`hooks/`)
- useTheme.ts → Theme colors and state
- useColorScheme.ts → System theme detection
- useThemeColor.ts → Color utilities

### Components UI (`components/ui/`)
- TabBarBackground → Tab styling
- IconSymbol → Icon components
- HapticTab → Tab interactions

This structure allows easy customization of any app functionality! 🚀