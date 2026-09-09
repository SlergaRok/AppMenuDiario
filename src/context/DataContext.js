import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { useHousehold } from "./HouseholdContext";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { householdCode } = useHousehold();
  const [recipes, setRecipes] = useState([]);
  // menu: { "2026-08-15": { comida: "recipeId", cena: "recipeId" } }
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);

  // Mientras no haya un grupo activo, no hay nada que sincronizar
  useEffect(() => {
    if (!householdCode) {
      setRecipes([]);
      setMenu({});
      setLoading(false);
      return;
    }

    setLoading(true);
    let recipesLoaded = false;
    let menuLoaded = false;
    const checkBothLoaded = () => {
      if (recipesLoaded && menuLoaded) setLoading(false);
    };

    const recipesRef = collection(db, "households", householdCode, "recipes");
    const unsubscribeRecipes = onSnapshot(
      recipesRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRecipes(list);
        recipesLoaded = true;
        checkBothLoaded();
      },
      (e) => {
        console.warn("Error sincronizando recetas", e);
        recipesLoaded = true;
        checkBothLoaded();
      }
    );

    const menuRef = collection(db, "households", householdCode, "menu");
    const unsubscribeMenu = onSnapshot(
      menuRef,
      (snapshot) => {
        const next = {};
        snapshot.docs.forEach((d) => {
          next[d.id] = d.data();
        });
        setMenu(next);
        menuLoaded = true;
        checkBothLoaded();
      },
      (e) => {
        console.warn("Error sincronizando el menú", e);
        menuLoaded = true;
        checkBothLoaded();
      }
    );

    return () => {
      unsubscribeRecipes();
      unsubscribeMenu();
    };
  }, [householdCode]);

  // Sube una imagen local (uri file://...) a Firebase Storage y devuelve
  // la URL pública de descarga, para guardarla en la receta.
  async function uploadRecipeImage(recipeId, localUri) {
    const response = await fetch(localUri);
    const blob = await response.blob();
    const imageRef = ref(storage, `households/${householdCode}/recipeImages/${recipeId}.jpg`);
    await uploadBytes(imageRef, blob);
    return getDownloadURL(imageRef);
  }

  async function deleteRecipeImage(recipeId) {
    try {
      const imageRef = ref(storage, `households/${householdCode}/recipeImages/${recipeId}.jpg`);
      await deleteObject(imageRef);
    } catch (e) {
      // Si no había imagen guardada, deleteObject falla y lo ignoramos
    }
  }

  // Crea la receta en Firestore (sin imagen todavía) y devuelve su id.
  // Si hay una imagen local pendiente de subir, se sube después con
  // uploadRecipeImage() y se actualiza el documento con la URL final.
  async function addRecipe(recipe) {
    const recipesRef = collection(db, "households", householdCode, "recipes");
    const docRef = await addDoc(recipesRef, {
      ...recipe,
      image: null,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async function updateRecipe(id, updates) {
    const recipeRef = doc(db, "households", householdCode, "recipes", id);
    await updateDoc(recipeRef, updates);
  }

  async function deleteRecipe(id) {
    const recipeRef = doc(db, "households", householdCode, "recipes", id);
    await deleteDoc(recipeRef);
    deleteRecipeImage(id);

    // También la quitamos de cualquier día del menú donde estuviera puesta
    const affectedDays = Object.entries(menu).filter(
      ([, meals]) => meals.comida === id || meals.cena === id
    );
    await Promise.all(
      affectedDays.map(([dayKey, meals]) => {
        const dayRef = doc(db, "households", householdCode, "menu", dayKey);
        return setDoc(
          dayRef,
          {
            comida: meals.comida === id ? null : meals.comida,
            cena: meals.cena === id ? null : meals.cena,
          },
          { merge: true }
        );
      })
    );
  }

  function getRecipe(id) {
    return recipes.find((r) => r.id === id) || null;
  }

  async function setMealForDay(dateKey, mealType, recipeId) {
    const dayRef = doc(db, "households", householdCode, "menu", dateKey);
    try {
      await setDoc(dayRef, { [mealType]: recipeId }, { merge: true });
    } catch (e) {
      console.warn("Error guardando el menú del día", e);
    }
  }

  return (
    <DataContext.Provider
      value={{
        recipes,
        menu,
        loading,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        getRecipe,
        setMealForDay,
        uploadRecipeImage,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de <DataProvider>");
  return ctx;
}
