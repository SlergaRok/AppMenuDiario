import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useHousehold } from "../context/HouseholdContext";
import { alert } from "../utils/alert";
import { shareText } from "../utils/share";

export default function JoinHouseholdScreen() {
  const { createHousehold, activateHousehold, joinHousehold, memberName: savedName, error: authError } =
    useHousehold();
  const [mode, setMode] = useState(null); // null | "create" | "join"
  const [name, setName] = useState(savedName || "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdCode, setCreatedCode] = useState(null);

  function validateName() {
    if (!name.trim()) {
      alert("Falta tu nombre", "Escribe cómo quieres que te vean los demás (ej: Mamá, Alex).");
      return false;
    }
    return true;
  }

  async function handleCreate() {
    if (!validateName()) return;
    setBusy(true);
    try {
      const newCode = await createHousehold(name);
      setCreatedCode(newCode);
    } catch (e) {
      alert("No se pudo crear el grupo", e.message || "Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEnterApp() {
    setBusy(true);
    try {
      await activateHousehold(createdCode, name);
    } catch (e) {
      alert("Algo falló", "No se pudo entrar al grupo. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  function handleShareCode() {
    shareText(`Únete a nuestro menú familiar en la app "Mi Menú Mensual". Introduce este código: ${createdCode}`);
  }

  async function handleJoin() {
    if (!validateName()) return;
    if (!code.trim()) {
      alert("Falta el código", "Escribe el código que te haya pasado tu familiar.");
      return;
    }
    setBusy(true);
    try {
      await joinHousehold(code, name);
    } catch (e) {
      alert("No se pudo unir al grupo", e.message || "Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  // Pantalla de bienvenida: elegir crear o unirse
  if (mode === null) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 56 }}>🍽️</Text>
        <Text style={styles.title}>Mi Menú Mensual</Text>
        <Text style={styles.subtitle}>
          Comparte el menú y las recetas con tu familia. Todos los que tengan el mismo código
          verán los mismos datos, sincronizados al instante.
        </Text>

        {authError && <Text style={styles.errorText}>{authError}</Text>}

        <TouchableOpacity style={styles.primaryBtn} onPress={() => setMode("create")}>
          <Text style={styles.primaryBtnText}>Crear un grupo nuevo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setMode("join")}>
          <Text style={styles.secondaryBtnText}>Unirme con un código</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Flujo de creación: pedir nombre → generar código → compartirlo → entrar
  if (mode === "create") {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {createdCode ? (
            <>
              <Text style={{ fontSize: 48 }}>🎉</Text>
              <Text style={styles.title}>¡Grupo creado!</Text>
              <Text style={styles.subtitle}>
                Comparte este código con tu familia para que se unan desde su móvil:
              </Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{createdCode}</Text>
              </View>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleShareCode}>
                <Text style={styles.secondaryBtnText}>Compartir código</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleEnterApp} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Entrar a la app</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 48 }}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.title}>Crear grupo nuevo</Text>
              <Text style={styles.subtitle}>
                Se generará un código único para tu familia. Podrás compartirlo cuando quieras
                desde la pestaña Grupo.
              </Text>

              <TextInput
                style={styles.nameInput}
                placeholder="Tu nombre (ej: Mamá, Alex)"
                placeholderTextColor="#D1B89A"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Generar código</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkBtn} onPress={() => setMode(null)}>
                <Text style={styles.linkBtnText}>‹ Volver</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Formulario para unirse con un código existente
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 48 }}>🔑</Text>
        <Text style={styles.title}>Unirme a un grupo</Text>
        <Text style={styles.subtitle}>Escribe tu nombre y el código que te haya pasado tu familiar.</Text>

        <TextInput
          style={styles.nameInput}
          placeholder="Tu nombre (ej: Mamá, Alex)"
          placeholderTextColor="#D1B89A"
          value={name}
          onChangeText={setName}
          autoCorrect={false}
        />

        <TextInput
          style={styles.codeInput}
          placeholder="Ej: AB3F9K"
          placeholderTextColor="#D1B89A"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={10}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleJoin} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Unirme</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => setMode(null)}>
          <Text style={styles.linkBtnText}>‹ Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#1F2937", marginTop: 12, textAlign: "center" },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 20,
  },
  errorText: { fontSize: 13, color: "#DC2626", textAlign: "center", marginBottom: 16 },
  primaryBtn: {
    backgroundColor: "#FB923C",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: {
    marginTop: 12,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FB923C",
  },
  secondaryBtnText: { color: "#C2410C", fontWeight: "700", fontSize: 15 },
  linkBtn: { marginTop: 16, padding: 8 },
  linkBtnText: { color: "#9A6B3F", fontWeight: "600" },
  codeBox: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FB923C",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  codeText: { fontSize: 32, fontWeight: "800", color: "#1F2937", letterSpacing: 4 },
  nameInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#F3E8DA",
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: "center",
    width: "100%",
    marginBottom: 14,
    color: "#1F2937",
  },
  codeInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#F3E8DA",
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 3,
    textAlign: "center",
    width: "100%",
    marginBottom: 20,
    color: "#1F2937",
  },
});
