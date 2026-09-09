import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBJftxA--F8n9alCgJBE5sanUwxDuwa1Ao",
  authDomain: "app-comidas-familiar.firebaseapp.com",
  projectId: "app-comidas-familiar",
  storageBucket: "app-comidas-familiar.firebasestorage.app",
  messagingSenderId: "995559274803",
  appId: "1:995559274803:web:9a9b08854e684eb3dde646"
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== "TU_API_KEY";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// En web no existe el almacenamiento de React Native (AsyncStorage nativo),
// así que usamos getAuth normal ahí; getAuth ya persiste la sesión en el
// almacenamiento del navegador por defecto.
let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // initializeAuth lanza error si ya se llamó antes (p.ej. con Fast Refresh)
    auth = getAuth(app);
  }
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, firebaseConfig };
