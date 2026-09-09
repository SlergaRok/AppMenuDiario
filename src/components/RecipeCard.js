import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

export default function RecipeCard({ recipe, onPress, right }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {recipe.image ? (
        <Image source={{ uri: recipe.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={{ fontSize: 24 }}>🍽️</Text>
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {recipe.categories?.includes("comida") ? "🍲 " : ""}
          {recipe.categories?.includes("cena") ? "🌙 " : ""}
          {recipe.steps?.length || 0} pasos
        </Text>
      </View>
      {right}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: { width: 56, height: 56, borderRadius: 10 },
  placeholder: { backgroundColor: "#FEF3E7", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
});
