import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useHousehold } from "../context/HouseholdContext";
import { alert } from "../utils/alert";
import { shareText } from "../utils/share";

export default function GroupScreen() {
  const { householdCode, memberName, members, leaveHousehold } = useHousehold();

  function handleShareCode() {
    shareText(`Únete a nuestro menú familiar en la app "Mi Menú Mensual". Introduce este código: ${householdCode}`);
  }

  function handleLeave() {
    alert(
      "Salir del grupo",
      "Dejarás de ver el menú y las recetas compartidas en este dispositivo. Podrás volver a unirte más tarde con el mismo código.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: () => leaveHousehold() },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tu grupo familiar</Text>
        <Text style={styles.sectionSubtitle}>
          Comparte este código con quien quieras que vea y edite el mismo menú y recetas.
        </Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{householdCode}</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShareCode}>
          <Text style={styles.shareBtnText}>Compartir código</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Miembros ({members.length})</Text>
        <FlatList
          data={members}
          keyExtractor={(item) => item.uid}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.memberName}>
                {item.name}
                {item.isMe ? " (tú)" : ""}
              </Text>
            </View>
          )}
        />
      </View>

      <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
        <Text style={styles.leaveBtnText}>Salir del grupo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED", padding: 16 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: "#6B7280", marginBottom: 14, lineHeight: 18 },
  codeBox: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#FB923C",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  codeText: { fontSize: 26, fontWeight: "800", color: "#1F2937", letterSpacing: 4 },
  shareBtn: {
    backgroundColor: "#FB923C",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  shareBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  memberRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  memberAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FEF3E7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  memberAvatarText: { fontWeight: "700", color: "#C2410C" },
  memberName: { fontSize: 15, color: "#374151", fontWeight: "600" },
  leaveBtn: { alignItems: "center", paddingVertical: 14, marginTop: 4 },
  leaveBtnText: { color: "#DC2626", fontWeight: "600" },
});
