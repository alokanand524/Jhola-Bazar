# 📊 JHOLA-BAZAR PROJECT FLOWCHARTS & DFD

## 🏗️ SYSTEM ARCHITECTURE FLOWCHART

```
┌─────────────────────────────────────────────────────────────┐
│                    JHOLA-BAZAR APP                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 ROOT LAYOUT (app/_layout.tsx)              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │Redux Provider│ │Theme Provider│ │Navigation Stack     │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              TAB LAYOUT (app/(tabs)/_layout.tsx)           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐      │
│  │  Home   │ │Categories│ │ Search  │ │   Profile   │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    REDUX STORE                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐      │
│  │cartSlice│ │products │ │userSlice│ │  uiSlice    │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 DATA FLOW DIAGRAM (DFD) - LEVEL 0

```
                    ┌─────────────┐
                    │    USER     │
                    └─────────────┘
                           │
                           ▼
    ┌─────────────────────────────────────────────────────┐
    │                                                     │
    │              JHOLA-BAZAR SYSTEM                     │
    │                                                     │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
    │  │   Browse    │  │   Cart      │  │   Order     │ │
    │  │  Products   │  │ Management  │  │ Processing  │ │
    │  └─────────────┘  └─────────────┘  └─────────────┘ │
    │                                                     │
    └─────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   BACKEND API   │
                  │ (Authentication,│
                  │ Orders, Payment)│
                  └─────────────────┘
```

## 📱 USER NAVIGATION FLOW

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   SPLASH    │───▶│   LOGIN     │───▶│  REFERRAL   │
│   SCREEN    │    │   SCREEN    │    │   SCREEN    │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                   │
                          ▼                   ▼
                   ┌─────────────┐     ┌─────────────┐
                   │  phone or   |     |             |
                   | GOOGLE      │     │    HOME     │
                   │   OAUTH     │───▶|     SCREEN   |  
                   └─────────────┘     └─────────────┘
                                             │
        ┌────────────────────────────────────┼────────────────────────────────────┐
        │                                    │                                    │
        ▼                                    ▼                                    ▼
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│ CATEGORIES  │                    │   SEARCH    │                    │  PROFILE    │
│   SCREEN    │                    │   SCREEN    │                    │   SCREEN    │
└─────────────┘                    └─────────────┘                    └─────────────┘
        │                                    │                                    │
        ▼                                    ▼                                    ▼
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│  CATEGORY   │                    │  PRODUCT    │                    │   ORDERS    │
│    PAGE     │───────────────────▶│   DETAIL    │◀───────────────────│  ADDRESSES  │
└─────────────┘                    └─────────────┘                    │   PAYMENTS  │
                                           │                          └─────────────┘
                                           ▼
                                   ┌─────────────┐
                                   │    CART     │
                                   │   SCREEN    │
                                   └─────────────┘
                                           │
                                           ▼
                                   ┌─────────────┐
                                   │  CHECKOUT   │
                                   │   SCREEN    │
                                   └─────────────┘
```

## 🛒 SHOPPING CART FLOW

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   BROWSE    │───▶│   SELECT    │───▶│   ADD TO    │───▶│   CART      │
│  PRODUCTS   │    │  PRODUCT    │    │    CART     │    │  UPDATED    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                 │
                                                                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   ORDER     │◀───│   PAYMENT   │◀───│  CHECKOUT   │◀───│   VIEW      │
│ CONFIRMED   │    │ PROCESSING  │    │   SCREEN    │    │   CART      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 🔐 AUTHENTICATION FLOW

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   LOGIN     │───▶│   PHONE     │───▶│   SEND      │
│   SCREEN    │    │   INPUT     │    │    OTP      │
└─────────────┘    └─────────────┘    └─────────────┘
       │                                      │
       │                                      ▼
       │                              ┌─────────────┐
       │                              │   VERIFY    │
       │                              │    OTP      │
       │                              └─────────────┘
       │                                      │
       ▼                                      ▼
┌─────────────┐                      ┌─────────────┐
│   GOOGLE    │─────────────────────▶│   SUCCESS   │
│   OAUTH     │                      │   LOGIN     │
└─────────────┘                      └─────────────┘
```

## 📊 COMPONENT RELATIONSHIP DIAGRAM

```
                    ┌─────────────────────────────┐
                    │        HOME SCREEN          │
                    └─────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│ CategoryList│          │ProductCard  │          │BannerCarousel│
└─────────────┘          └─────────────┘          └─────────────┘
        │                          │                          │
        ▼                          ▼                          ▼
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│CategoryCard │          │SectionCard  │          │SectionHeader│
└─────────────┘          └─────────────┘          └─────────────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │   REDUX STORE   │
                         │                 │
                         │ ┌─────────────┐ │
                         │ │ cartSlice   │ │
                         │ │ products    │ │
                         │ │ userSlice   │ │
                         │ └─────────────┘ │
                         └─────────────────┘
```

## 🗂️ FILE DEPENDENCY TREE

```
app/_layout.tsx
├── store/store.ts
│   ├── store/slices/cartSlice.ts
│   ├── store/slices/productsSlice.ts
│   ├── store/slices/userSlice.ts
│   └── store/slices/uiSlice.ts
├── hooks/useTheme.ts
│   └── constants/Colors.ts
└── app/(tabs)/_layout.tsx
    ├── app/(tabs)/index.tsx
    │   ├── components/BannerCarousel.tsx
    │   ├── components/CategoryList.tsx
    │   │   └── components/CategoryCard.tsx
    │   ├── components/ProductCard.tsx
    │   ├── components/SectionCard.tsx
    │   ├── components/SectionHeader.tsx
    │   ├── data/products.ts
    │   └── data/sections.ts
    ├── app/(tabs)/categories.tsx
    │   ├── components/ProductCard.tsx
    │   └── components/CategoryCard.tsx
    ├── app/(tabs)/search.tsx
    │   └── components/ProductCard.tsx
    └── app/(tabs)/profile.tsx
        └── components/ThemeDropdown.tsx
```

## 🔄 STATE MANAGEMENT FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                    REDUX STORE                              │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ cartSlice   │  │ products    │  │ userSlice   │        │
│  │             │  │ Slice       │  │             │        │
│  │ • items     │  │ • products  │  │ • name      │        │
│  │ • total     │  │ • categories│  │ • phone     │        │
│  │ • quantity  │  │ • selected  │  │ • addresses │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                 │                 │              │
└─────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   CART      │  │   PRODUCT   │  │    USER     │
│ COMPONENTS  │  │ COMPONENTS  │  │ COMPONENTS  │
│             │  │             │  │             │
│ • CartScreen│  │ • ProductCard│  │ • Profile   │
│ • Checkout  │  │ • Home      │  │ • Login     │
│ • ProductCard│  │ • Categories│  │ • Addresses │
└─────────────┘  └─────────────┘  └─────────────┘
```

## 🌐 API INTEGRATION FLOW

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   LOGIN     │───▶│  SEND OTP   │───▶│ VERIFY OTP  │
│   SCREEN    │    │    API      │    │    API      │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                   │
                          ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │   RESEND    │    │   GOOGLE    │
                   │   OTP API   │    │  OAUTH API  │
                   └─────────────┘    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐
                                    │   SUCCESS   │
                                    │   RESPONSE  │
                                    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐
                                    │   REDUX     │
                                    │   UPDATE    │
                                    └─────────────┘
```

## 🎨 THEME SYSTEM FLOW

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  SYSTEM     │───▶│   THEME     │───▶│   COLORS    │
│  THEME      │    │  DETECTION  │    │  CONSTANTS  │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                   │
                          ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │  useTheme   │───▶│    ALL      │
                   │    HOOK     │    │ COMPONENTS  │
                   └─────────────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ THEME       │
                   │ DROPDOWN    │
                   └─────────────┘
```

This comprehensive flowchart system shows all relationships, data flows, and dependencies in your Jhola-Bazar project! 🚀