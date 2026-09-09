import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useData } from "../context/DataContext";
import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";
import { nombreMes } from "../utils/dateUtils";
import { matchesSearch } from "../utils/textUtils";

export default function DayMenuScreen({ route, navigation }) {
  const { dateKey, mealType, day, monthIndex, year } = route.params;
  const { recipes, menu, setMealForDay, getRecipe } = useData();
  const [search, setSearch] = useState("");

  const currentRecipeId = menu[dateKey]?.[mealType];
  const currentRecipe = currentRecipeId ? getRecipe(currentRecipeId) : null;
  const mealTitle = mealType === "comida" ? "Comida" : "Cena";

  // Solo mostramos recetas marcadas para esta categoría (comida o cena).
  // Las recetas antiguas sin categorías guardadas se consideran válidas
  // para ambas, para no ocultar recetas creadas antes de esta función.
  const recipesForMeal = useMemo(
    () => recipes.filter((r) => !r.categories?.length || r.categories.includes(mealType)),
    [recipes, mealType]
  );

  const filteredRecipes = useMemo(
    () => recipesForMeal.filter((r) => matchesSearch(r.name, search)),
    [recipesForMeal, search]
  );

  function selectRecipe(recipeId) {
    setMealForDay(dateKey, mealType, recipeId);
    navigation.goBack();
  }

  function clearSelection() {
    setMealForDay(dateKey, mealType, null);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {mealTitle} · {day} de {nombreMes(monthIndex)} {year}
      </Text>

      {currentRecipe && (
        <TouchableOpacity
          style={styles.selectedCard}
          onPress={() => navigation.navigate("RecipeDetail", { recipeId: currentRecipe.id })}
          activeOpacity={0.8}
        >
          {currentRecipe.image ? (
            <Image source={{ uri: currentRecipe.image }} style={styles.selectedImage} />
          ) : (
            <View style={[styles.selectedImage, styles.selectedImagePlaceholder]}>
              <Text style={{ fontSize: 22 }}>🍽️</Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.selectedLabel}>Receta elegida</Text>
            <Text style={styles.selectedName} numberOfLines={1}>
              {currentRecipe.name}
            </Text>
            <Text style={styles.selectedLink}>Ver pasos e ingredientes ›</Text>
          </View>
        </TouchableOpacity>
      )}

      {recipesForMeal.length > 0 && <SearchBar value={search} onChangeText={setSearch} />}

      {recipesForMeal.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>🍽️</Text>
          <Text style={styles.emptyText}>
            No tienes recetas marcadas como {mealTitle.toLowerCase()}.
          </Text>
          <Text style={styles.emptySubtext}>
            Ve a la pestaña Recetas y crea o edita alguna para marcarla.
          </Text>
        </View>
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>🔍</Text>
          <Text style={styles.emptyText}>Sin resultados</Text>
          <Text style={styles.emptySubtext}>
            No hay ninguna receta de {mealTitle.toLowerCase()} que coincida con "{search}".
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            currentRecipe ? (
              <Text style={styles.changeLabel}>O elige otra receta:</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => selectRecipe(item.id)}
              right={
                currentRecipeId === item.id ? (
                  <Text style={{ fontSize: 18, color: "#FB923C" }}>✓</Text>
                ) : null
              }
            />
          )}
          ListFooterComponent={
            currentRecipeId ? (
              <TouchableOpacity style={styles.clearBtn} onPress={clearSelection}>
                <Text style={styles.clearBtnText}>Quitar receta de este {mealTitle.toLowerCase()}</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED" },
  header: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  selectedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEDD5",
    margin: 16,
    marginBottom: 4,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#FB923C",
  },
  selectedImage: { width: 54, height: 54, borderRadius: 10 },
  selectedImagePlaceholder: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedLabel: { fontSize: 11, color: "#9A6B3F", fontWeight: "700" },
  selectedName: { fontSize: 15, fontWeight: "700", color: "#1F2937", marginTop: 1 },
  selectedLink: { fontSize: 12, color: "#C2410C", fontWeight: "600", marginTop: 2 },
  changeLabel: { fontSize: 13, color: "#9CA3AF", fontWeight: "600", marginBottom: 8 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#374151", marginTop: 12, textAlign: "center" },
  emptySubtext: { fontSize: 14, color: "#6B7280", marginTop: 4, textAlign: "center" },
  clearBtn: { alignItems: "center", paddingVertical: 14 },
  clearBtnText: { color: "#DC2626", fontWeight: "600" },
});
