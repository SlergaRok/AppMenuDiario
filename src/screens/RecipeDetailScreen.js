import React, { useLayoutEffect } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useData } from "../context/DataContext";

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipeId } = route.params;
  const { getRecipe } = useData();
  const recipe = getRecipe(recipeId);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        recipe ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("RecipeForm", { recipeId: recipe.id })}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Editar</Text>
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, recipe]);

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>Esta receta ya no existe.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {recipe.image && <Image source={{ uri: recipe.image }} style={styles.image} />}
      <Text style={styles.title}>{recipe.name}</Text>

      {!!recipe.ingredients && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          <Text style={styles.ingredients}>{recipe.ingredients}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pasos</Text>
        {recipe.steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: 200, borderRadius: 14, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: "#1F2937", marginBottom: 12 },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#374151", marginBottom: 8 },
  ingredients: { fontSize: 15, color: "#4B5563", lineHeight: 22 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FB923C",
    color: "#fff",
    textAlign: "center",
    lineHeight: 26,
    fontSize: 13,
    fontWeight: "700",
    marginRight: 10,
  },
  stepText: { flex: 1, fontSize: 15, color: "#374151", lineHeight: 22, marginTop: 2 },
});
