export default {
  expo: {
    name: "golf-gps",
    slug: "golf-gps",
    version: "0.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "golfgps",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app needs access to location when open to track your golf shots.",
        NSLocationAlwaysUsageDescription: "This app needs access to location when in the background to track your golf shots.",
        UIBackgroundModes: ["location"],
      },
      bundleIdentifier: "com.anonymous.golf-gps",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
      ],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
        },
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location to track your golf shots.",
          locationAlwaysPermission: "Allow $(PRODUCT_NAME) to use your location to track your golf shots.",
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
