import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useData } from "../context/DataContext";
import { alert } from "../utils/alert";

export default function RecipeFormScreen({ navigation, route }) {
  const { recipeId } = route.params || {};
  const { getRecipe, addRecipe, updateRecipe, deleteRecipe, uploadRecipeImage } = useData();
  const existing = recipeId ? getRecipe(recipeId) : null;

  const [name, setName] = useState(existing?.name || "");
  const [image, setImage] = useState(existing?.image || null);
  const [ingredients, setIngredients] = useState(existing?.ingredients || "");
  const [steps, setSteps] = useState(
    existing?.steps?.length ? existing.steps : [""]
  );
  const [saving, setSaving] = useState(false);
  // Si la receta no tiene categorías guardadas (recetas creadas antes de
  // esta función), la marcamos como válida para ambas por defecto.
  const [categories, setCategories] = useState(
    existing?.categories?.length ? existing.categories : ["comida", "cena"]
  );

  function toggleCategory(category) {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  const scrollRef = useRef(null);
  const fieldPositions = useRef({});

  // Guarda la posición vertical (y) de cada campo dentro del ScrollView
  function registerFieldPosition(fieldKey) {
    return (event) => {
      fieldPositions.current[fieldKey] = event.nativeEvent.layout.y;
    };
  }

  // Al enfocar un campo, desplaza el scroll para que quede visible por
  // encima del teclado en lugar de quedar oculto debajo de él.
  function scrollToField(fieldKey) {
    return () => {
      const y = fieldPositions.current[fieldKey];
      if (y != null && scrollRef.current) {
        scrollRef.current.scrollTo({ y: Math.max(y - 16, 0), animated: true });
      }
    };
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permiso necesario", "Necesitamos acceso a tus fotos para añadir una imagen.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets?.length) {
      setImage(result.assets[0].uri);
    }
  }

  function updateStep(index, text) {
    const next = [...steps];
    next[index] = text;
    setSteps(next);
  }

  function addStepField() {
    setSteps([...steps, ""]);
    // Espera a que se renderice el nuevo campo y baja el scroll hasta el final
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function removeStep(index) {
    if (steps.length === 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("Falta el nombre", "Ponle un nombre a la receta antes de guardar.");
      return;
    }
    if (categories.length === 0) {
      alert("Falta la categoría", "Marca si esta receta es para Comida, Cena o ambas.");
      return;
    }
    const cleanSteps = steps.map((s) => s.trim()).filter((s) => s.length > 0);
    if (cleanSteps.length === 0) {
      alert("Faltan los pasos", "Añade al menos un paso para cocinar la receta.");
      return;
    }

    // Si la foto es nueva (uri local del dispositivo, no una URL ya
    // subida a internet), hay que subirla a Firebase Storage.
    const isLocalImage = image && !image.startsWith("http");

    const payload = {
      name: name.trim(),
      ingredients: ingredients.trim(),
      steps: cleanSteps,
      categories,
    };

    setSaving(true);
    try {
      if (existing) {
        let imageUrl = image;
        if (isLocalImage) {
          imageUrl = await uploadRecipeImage(existing.id, image);
        }
        await updateRecipe(existing.id, { ...payload, image: imageUrl });
      } else {
        const newId = await addRecipe(payload);
        if (isLocalImage) {
          const imageUrl = await uploadRecipeImage(newId, image);
          await updateRecipe(newId, { image: imageUrl });
        }
      }
      navigation.goBack();
    } catch (e) {
      console.warn("Error guardando receta", e);
      alert(
        "No se pudo guardar",
        "Comprueba tu conexión a internet e inténtalo de nuevo."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    alert("Eliminar receta", "¿Seguro que quieres eliminarla? Se borrará para todo el grupo.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await deleteRecipe(existing.id);
            navigation.goBack();
          } catch (e) {
            alert("No se pudo eliminar", "Comprueba tu conexión a internet.");
            setSaving(false);
          }
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={{ padding: 16, paddingBottom: 220 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 30 }}>📷</Text>
              <Text style={styles.imagePlaceholderText}>Añadir foto (opcional)</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nombre de la receta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Lentejas con verduras"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>¿Para qué comida es?</Text>
        <View style={styles.categoryRow}>
          <TouchableOpacity
            style={[styles.categoryChip, categories.includes("comida") && styles.categoryChipActive]}
            onPress={() => toggleCategory("comida")}
          >
            <Text
              style={[
                styles.categoryChipText,
                categories.includes("comida") && styles.categoryChipTextActive,
              ]}
            >
              🍲 Comida
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryChip, categories.includes("cena") && styles.categoryChipActive]}
            onPress={() => toggleCategory("cena")}
          >
            <Text
              style={[
                styles.categoryChipText,
                categories.includes("cena") && styles.categoryChipTextActive,
              ]}
            >
              🌙 Cena
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.categoryHint}>Puedes marcar las dos si sirve para cualquier momento.</Text>

        <Text style={styles.label}>Ingredientes (opcional)</Text>
        <View onLayout={registerFieldPosition("ingredients")}>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Ej: 200g de lentejas, 1 zanahoria, 1 cebolla..."
            value={ingredients}
            onChangeText={setIngredients}
            onFocus={scrollToField("ingredients")}
            multiline
          />
        </View>

        <Text style={styles.label}>Pasos para cocinarlo</Text>
        {steps.map((step, index) => (
          <View
            key={index}
            style={styles.stepRow}
            onLayout={registerFieldPosition(`step-${index}`)}
          >
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder={`Paso ${index + 1}`}
              value={step}
              onChangeText={(text) => updateStep(index, text)}
              onFocus={scrollToField(`step-${index}`)}
              multiline
            />
            <TouchableOpacity onPress={() => removeStep(index)} style={styles.removeStepBtn}>
              <Text style={{ color: "#DC2626", fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addStepBtn} onPress={addStepField}>
          <Text style={styles.addStepText}>+ Añadir paso</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>{existing ? "Guardar cambios" : "Guardar receta"}</Text>
          )}
        </TouchableOpacity>

        {existing && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={saving}>
            <Text style={styles.deleteBtnText}>Eliminar receta</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED" },
  imagePicker: { alignSelf: "center", marginBottom: 20 },
  image: { width: 160, height: 120, borderRadius: 14 },
  imagePlaceholder: {
    width: 160,
    height: 120,
    borderRadius: 14,
    backgroundColor: "#FEF3E7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FDBA74",
    borderStyle: "dashed",
  },
  imagePlaceholderText: { fontSize: 12, color: "#9A6B3F", marginTop: 4 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 10 },
  categoryRow: { flexDirection: "row", gap: 10 },
  categoryChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#F3E8DA",
    alignItems: "center",
  },
  categoryChipActive: { backgroundColor: "#FB923C", borderColor: "#FB923C" },
  categoryChipText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  categoryChipTextActive: { color: "#fff" },
  categoryHint: { fontSize: 12, color: "#9CA3AF", marginTop: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#F3E8DA",
    marginBottom: 10,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FB923C",
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
    fontWeight: "700",
    marginRight: 8,
    marginTop: 10,
  },
  removeStepBtn: { padding: 10 },
  addStepBtn: { alignSelf: "flex-start", marginBottom: 20 },
  addStepText: { color: "#FB923C", fontWeight: "600" },
  saveBtn: {
    backgroundColor: "#FB923C",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  deleteBtn: { alignItems: "center", marginTop: 16, paddingVertical: 8 },
  deleteBtnText: { color: "#DC2626", fontWeight: "600" },
});
