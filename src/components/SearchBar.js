import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from "react-native";

export default function SearchBar({ value, onChangeText, placeholder = "Buscar receta..." }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#B8A38A"
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")} style={styles.clearBtn}>
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#F3E8DA",
  },
  icon: { fontSize: 14, marginRight: 8 },
  input: { flex: 1, paddingVertical: 10, fontSize: 15, color: "#1F2937" },
  clearBtn: { padding: 6 },
  clearIcon: { fontSize: 14, color: "#9CA3AF" },
});
