// Config dinámica (en vez de app.json) para poder fijar, solo en el build
// web, la ruta base bajo la que se sirve la app. GitHub Pages publica los
// proyectos en "https://usuario.github.io/nombre-repo/", así que los
// assets deben referenciarse con ese prefijo en vez de con "/". El workflow
// de despliegue (.github/workflows/deploy-web.yml) fija EXPO_PUBLIC_BASE_PATH
// al nombre del repo; en local, sin esa variable, se compila para la raíz.
const basePath = process.env.EXPO_PUBLIC_BASE_PATH || "";

module.exports = {
  expo: {
    name: "Mi Menú Mensual",
    slug: "meal-planner",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FFF7ED",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.tuusuario.mealplanner",
      infoPlist: {
        NSPhotoLibraryUsageDescription: "Necesitamos acceso a tus fotos para poner imágenes en tus recetas.",
      },
    },
    android: {
      package: "com.tuusuario.mealplanner",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFF7ED",
      },
      permissions: ["READ_EXTERNAL_STORAGE"],
      softwareKeyboardLayoutMode: "resize",
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    experiments: {
      baseUrl: basePath,
    },
  },
};
