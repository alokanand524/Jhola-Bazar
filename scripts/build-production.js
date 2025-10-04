const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build process...');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Please create one from .env.example');
  process.exit(1);
}

// Validate required environment variables
const requiredVars = [
  'API_BASE_URL',
  'RAZORPAY_KEY_ID',
  'APP_ENV'
];

const envContent = fs.readFileSync(envPath, 'utf8');
const missingVars = requiredVars.filter(varName => 
  !envContent.includes(`${varName}=`)
);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🔍 Running type check...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });

  console.log('🧹 Running linter...');
  execSync('npm run lint', { stdio: 'inherit' });

  console.log('🏗️ Building for production...');
  execSync('npx expo export', { stdio: 'inherit' });

  console.log('✅ Production build completed successfully!');
  console.log('📱 Ready for deployment to app stores');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}