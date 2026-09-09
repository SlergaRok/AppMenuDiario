import React, { useMemo, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useData } from "../context/DataContext";
import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";
import { matchesSearch } from "../utils/textUtils";

export default function RecipesListScreen({ navigation }) {
  const { recipes } = useData();
  const [search, setSearch] = useState("");

  const filteredRecipes = useMemo(
    () => recipes.filter((r) => matchesSearch(r.name, search)),
    [recipes, search]
  );

  return (
    <View style={styles.container}>
      {recipes.length > 0 && <SearchBar value={search} onChangeText={setSearch} />}

      {recipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>📖</Text>
          <Text style={styles.emptyText}>Aún no tienes recetas.</Text>
          <Text style={styles.emptySubtext}>
            Toca el botón + para añadir tu primera receta.
          </Text>
        </View>
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>🔍</Text>
          <Text style={styles.emptyText}>Sin resultados</Text>
          <Text style={styles.emptySubtext}>
            No hay ninguna receta que coincida con "{search}".
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.id })}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("RecipeForm", {})}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#374151", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#6B7280", marginTop: 4, textAlign: "center" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FB923C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabIcon: { color: "#fff", fontSize: 30, marginTop: -2 },
});
