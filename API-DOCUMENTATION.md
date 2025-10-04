# Jhola-Bazar API Documentation

Base URL: `https://api.jholabazar.com/api/v1`

## 🔐 Authentication APIs

### Send OTP
- **Endpoint**: `POST /auth/login` or `POST /auth/signup`
- **Purpose**: Send OTP to user's phone number (tries login first, then signup)
- **Body**: `{ "phone": "1234567890" }`
- **Response**: `{ "success": true, "message": "OTP sent successfully" }`

### Verify OTP
- **Endpoint**: `POST /auth/otp/verify`
- **Purpose**: Verify OTP and get access/refresh tokens
- **Body**: `{ "phone": "1234567890", "otp": "123456" }`
- **Response**: 
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "name": "User Name",
      "phone": "1234567890",
      "email": "user@example.com"
    }
  }
}
```

### Refresh Token
- **Endpoint**: `POST /auth/refresh`
- **Purpose**: Get new access token using refresh token
- **Body**: `{ "refreshToken": "refresh_token" }`
- **Response**: `{ "success": true, "data": { "accessToken": "new_jwt_token", "refreshToken": "new_refresh_token" } }`

## 👤 Profile APIs

### Get Profile
- **Endpoint**: `GET /profile`
- **Purpose**: Fetch user profile information
- **Headers**: `Authorization: Bearer {accessToken}`
- **Response**: 
```json
{
  "success": true,
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "gender": "Male",
    "dateOfBirth": "1990-01-01",
    "referralCode": "JB123456"
  }
}
```

### Update Profile
- **Endpoint**: `PUT /profile`
- **Purpose**: Update user profile information
- **Headers**: `Authorization: Bearer {accessToken}`
- **Body**: 
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "gender": "Male",
  "dateOfBirth": "1990-01-01"
}
```

## 🛒 Cart APIs

### Get Cart
- **Endpoint**: `GET /cart`
- **Purpose**: Fetch user's cart items
- **Headers**: `Authorization: Bearer {accessToken}`
- **Response**: `{ "success": true, "data": { "items": [...] } }`

### Add to Cart
- **Endpoint**: `POST /cart/add`
- **Purpose**: Add product variant to cart
- **Headers**: `Authorization: Bearer {accessToken}`
- **Body**: `{ "variantId": "variant_id", "quantity": "1" }`

### Update Cart Item
- **Endpoint**: `PATCH /cart/items/{id}`
- **Purpose**: Update quantity of cart item
- **Headers**: `Authorization: Bearer {accessToken}`
- **Body**: `{ "quantity": 2 }`

### Remove Cart Item
- **Endpoint**: `DELETE /cart/items/{id}`
- **Purpose**: Remove specific item from cart
- **Headers**: `Authorization: Bearer {accessToken}`

### Clear Cart
- **Endpoint**: `POST /cart/clear`
- **Purpose**: Remove all items from cart
- **Headers**: `Authorization: Bearer {accessToken}`

## 📍 Address APIs

### Get Addresses
- **Endpoint**: `GET /profile/addresses`
- **Purpose**: Fetch user's saved addresses
- **Headers**: `Authorization: Bearer {accessToken}`

### Create Address
- **Endpoint**: `POST /profile/addresses`
- **Purpose**: Add new delivery address
- **Headers**: `Authorization: Bearer {accessToken}`
- **Body**: 
```json
{
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "landmark": "Near Park",
  "pincodeId": "pincode_id",
  "type": "home"
}
```

### Update Address
- **Endpoint**: `PUT /profile/addresses/{id}`
- **Purpose**: Update existing address
- **Headers**: `Authorization: Bearer {accessToken}`
- **Body**: Same as create address

### Delete Address
- **Endpoint**: `DELETE /profile/addresses/{id}`
- **Purpose**: Remove saved address
- **Headers**: `Authorization: Bearer {accessToken}`

### Get Pincodes
- **Endpoint**: `GET /profile/pincodes`
- **Purpose**: Fetch available pincodes for delivery
- **Headers**: None (public endpoint)

## 📦 Product APIs

### Get All Products
- **Endpoint**: `GET /products`
- **Purpose**: Fetch all available products
- **Headers**: None (public endpoint)

### Get Products by Category
- **Endpoint**: `GET /products?categoryId={id}`
- **Purpose**: Fetch products filtered by category
- **Headers**: None (public endpoint)

### Get Product by ID
- **Endpoint**: `GET /products/{id}`
- **Purpose**: Fetch detailed product information
- **Headers**: None (public endpoint)

## 🏷️ Category APIs

### Get All Categories
- **Endpoint**: `GET /categories`
- **Purpose**: Fetch all product categories
- **Headers**: None (public endpoint)

### Get Category by ID
- **Endpoint**: `GET /categories/{id}`
- **Purpose**: Fetch category with children and products
- **Headers**: None (public endpoint)

## 🔒 Authentication Flow

1. **Send OTP**: User enters phone → App calls `/auth/login` or `/auth/signup`
2. **Verify OTP**: User enters OTP → App calls `/auth/otp/verify` → Receives tokens
3. **Store Tokens**: App stores `accessToken` and `refreshToken` securely
4. **API Calls**: All authenticated requests include `Authorization: Bearer {accessToken}`
5. **Token Refresh**: If API returns 401 → App calls `/auth/refresh` → Retries original request
6. **Logout**: App clears stored tokens

## 📱 Usage in App

- **Authentication**: Login screen, token management
- **Profile**: Edit profile screen, user data display
- **Cart**: Add to cart, cart screen, checkout process
- **Products**: Home screen, category browsing, search
- **Addresses**: Checkout, delivery address management

## 🛡️ Error Handling

All APIs return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/expired token)
- `404`: Not Found
- `500`: Internal Server Error