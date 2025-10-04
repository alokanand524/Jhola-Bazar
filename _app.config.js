import 'dotenv/config';

export default {
  expo: {
    name: "Jhola-Bazar",
    slug: "jhola-bazar",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/jhola-bazar.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jholabazar", // 👈 required for iOS store builds
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      package: "com.coolboy14.jholabazar",  // 👈 required for Android builds
      adaptiveIcon: {
        foregroundImage: "./assets/images/jhola-bazar1.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      API_BASE_URL: process.env.API_BASE_URL,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
      TAWK_TO_PROPERTY_ID: process.env.TAWK_TO_PROPERTY_ID,
      TAWK_TO_WIDGET_ID: process.env.TAWK_TO_WIDGET_ID,
      APP_ENV: process.env.APP_ENV,
      DEBUG_MODE: process.env.DEBUG_MODE,
      eas: {
        projectId: "1d32e2b2-88ae-4ac1-8521-459d6934f8ad"
      }
    },
    owner: "coolboy14"
  }
};
