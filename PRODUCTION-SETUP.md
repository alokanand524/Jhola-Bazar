# Production Setup Guide

## 🔐 Security Configuration

### 1. Environment Variables Setup

Copy `.env.example` to `.env` and fill in your production values:

```bash
cp .env.example .env
```

Required variables:
- `API_BASE_URL`: Your production API endpoint
- `RAZORPAY_KEY_ID`: Your Razorpay production key
- `RAZORPAY_KEY_SECRET`: Your Razorpay secret (keep secure)
- `TAWK_TO_PROPERTY_ID`: Your Tawk.to property ID
- `TAWK_TO_WIDGET_ID`: Your Tawk.to widget ID
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `APP_ENV`: Set to "production"
- `DEBUG_MODE`: Set to "false"

### 2. Security Checklist

✅ All hardcoded credentials removed
✅ Input validation implemented
✅ Secure logging system in place
✅ Error boundaries configured
✅ HTTPS-only API calls
✅ Path traversal protection
✅ Log injection prevention

## 🚀 Build Process

### Development Build
```bash
npm run start
```

### Production Build
```bash
npm run build:production
```

### Platform-specific Builds
```bash
# Android
npm run build:android

# iOS
npm run build:ios
```

## 🧪 Testing

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Security Audit
```bash
npm run security-check
```

## 📱 Deployment

### Prerequisites
1. EAS CLI installed: `npm install -g @expo/eas-cli`
2. Expo account configured: `eas login`
3. Environment variables configured in EAS

### App Store Deployment
1. Update version in `app.json`
2. Run production build
3. Submit to stores via EAS

## 🔍 Monitoring

### Error Tracking
- Error boundaries catch and log all React errors
- Secure logging prevents sensitive data exposure
- All API errors are properly handled

### Performance
- Image optimization enabled
- Bundle splitting configured
- Lazy loading implemented

## 🛡️ Security Features

### Input Validation
- Phone number validation
- Email validation
- OTP validation
- URL sanitization
- File path sanitization

### Secure Communication
- All API calls use HTTPS
- Token-based authentication
- Automatic token refresh
- Request/response validation

### Data Protection
- No sensitive data in logs
- Secure storage for tokens
- Input sanitization everywhere
- XSS protection

## 📋 Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Security audit passed
- [ ] Type checking passed
- [ ] Linting passed
- [ ] Error boundaries tested
- [ ] API endpoints verified
- [ ] Payment gateway tested
- [ ] Push notifications configured
- [ ] App store assets ready
- [ ] Privacy policy updated
- [ ] Terms of service updated

## 🚨 Emergency Procedures

### Rollback Process
1. Revert to previous EAS build
2. Update API endpoints if needed
3. Monitor error logs

### Security Incident Response
1. Rotate API keys immediately
2. Update environment variables
3. Force app update if needed
4. Monitor for suspicious activity

## 📞 Support

For production issues:
1. Check error logs in secure logger
2. Verify environment configuration
3. Test API connectivity
4. Contact development team