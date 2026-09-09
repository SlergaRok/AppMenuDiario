import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, deleteField } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { generateHouseholdCode, normalizeCode } from "../utils/householdCode";

const HOUSEHOLD_CODE_KEY = "@meal_planner_household_code";
const MEMBER_NAME_KEY = "@meal_planner_member_name";

const HouseholdContext = createContext(null);

export function HouseholdProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [householdCode, setHouseholdCode] = useState(null);
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState({});
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicia sesión anónima en Firebase: identifica el dispositivo (sin
  // pedir email ni contraseña) para que las reglas de seguridad de
  // Firestore/Storage sepan que quien escribe está autenticado.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        setAuthReady(true);
      } else {
        signInAnonymously(auth).catch((e) => {
          console.warn("Error al iniciar sesión anónima:", e);
          setError(
            "No se pudo conectar con el servidor. Revisa tu conexión a internet y que Firebase esté bien configurado (ver FIREBASE_SETUP.md)."
          );
          setLoading(false);
        });
      }
    });
    return unsubscribe;
  }, []);

  // Una vez autenticados, recuperamos el código de grupo y el nombre
  // guardados en este dispositivo (si ya se había unido antes).
  useEffect(() => {
    if (!authReady) return;
    (async () => {
      try {
        const [savedCode, savedName] = await Promise.all([
          AsyncStorage.getItem(HOUSEHOLD_CODE_KEY),
          AsyncStorage.getItem(MEMBER_NAME_KEY),
        ]);
        if (savedCode) setHouseholdCode(savedCode);
        if (savedName) setMemberName(savedName);
      } catch (e) {
        console.warn("Error leyendo el grupo guardado", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [authReady]);

  // Escucha en tiempo real la lista de miembros del grupo activo
  useEffect(() => {
    if (!householdCode) {
      setMembers({});
      return;
    }
    const ref = doc(db, "households", householdCode);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) setMembers(snap.data().members || {});
      },
      (e) => console.warn("Error escuchando miembros del grupo", e)
    );
    return unsubscribe;
  }, [householdCode]);

  // Crea el documento del grupo en Firestore y devuelve el código, pero
  // NO activa el grupo todavía: así la pantalla puede mostrar el código
  // para compartirlo antes de entrar en la app.
  async function createHousehold(name) {
    setError(null);
    const trimmedName = name.trim() || "Yo";
    let code = generateHouseholdCode();
    for (let attempts = 0; attempts < 5; attempts++) {
      const snap = await getDoc(doc(db, "households", code));
      if (!snap.exists()) break;
      code = generateHouseholdCode();
    }
    await setDoc(doc(db, "households", code), {
      createdAt: serverTimestamp(),
      members: { [uid]: { name: trimmedName, joinedAt: Date.now() } },
    });
    return code;
  }

  // Guarda el código y el nombre localmente y activa el grupo (esto hace
  // que la app cambie de la pantalla de bienvenida a las pestañas normales).
  async function activateHousehold(code, name) {
    const trimmedName = name.trim() || "Yo";
    await AsyncStorage.setItem(HOUSEHOLD_CODE_KEY, code);
    await AsyncStorage.setItem(MEMBER_NAME_KEY, trimmedName);
    setMemberName(trimmedName);
    setHouseholdCode(code);
  }

  async function joinHousehold(rawCode, name) {
    setError(null);
    const code = normalizeCode(rawCode);
    if (!code) {
      throw new Error("Introduce un código válido.");
    }
    const ref = doc(db, "households", code);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error("No existe ningún grupo con ese código. Revísalo con quien te lo haya dado.");
    }
    const trimmedName = name.trim() || "Yo";
    await setDoc(ref, { members: { [uid]: { name: trimmedName, joinedAt: Date.now() } } }, { merge: true });
    await activateHousehold(code, trimmedName);
    return code;
  }

  async function leaveHousehold() {
    if (householdCode && uid) {
      try {
        await setDoc(doc(db, "households", householdCode), { members: { [uid]: deleteField() } }, { merge: true });
      } catch (e) {
        // Sin conexión: salimos igualmente en local, no bloqueamos al usuario
      }
    }
    await AsyncStorage.removeItem(HOUSEHOLD_CODE_KEY);
    setHouseholdCode(null);
  }

  const membersList = Object.entries(members).map(([memberUid, data]) => ({
    uid: memberUid,
    name: data?.name || "Familiar",
    isMe: memberUid === uid,
  }));

  return (
    <HouseholdContext.Provider
      value={{
        uid,
        householdCode,
        memberName,
        members: membersList,
        loading: loading || !authReady,
        error,
        createHousehold,
        activateHousehold,
        joinHousehold,
        leaveHousehold,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext);
  if (!ctx) throw new Error("useHousehold debe usarse dentro de <HouseholdProvider>");
  return ctx;
}
