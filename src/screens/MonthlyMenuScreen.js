import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useData } from "../context/DataContext";
import { nombreMes, nombreDiaCorto, dateKey } from "../utils/dateUtils";

export default function MonthlyMenuScreen({ navigation }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState(today.getMonth());

  const { menu, getRecipe } = useData();
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const allDays = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Si estamos viendo el mes y año actuales, ocultamos los días que ya
  // pasaron para que "Hoy" aparezca siempre el primero de la lista.
  const isCurrentMonth = monthIndex === today.getMonth() && year === today.getFullYear();
  const days = isCurrentMonth
    ? allDays.filter((day) => day >= today.getDate())
    : allDays;

  function changeMonth(delta) {
    let newMonth = monthIndex + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    // No permitimos ir a meses anteriores al actual: el menú de días
    // pasados ya no es útil para consultar.
    const isBeforeCurrentMonth =
      newYear < today.getFullYear() ||
      (newYear === today.getFullYear() && newMonth < today.getMonth());
    if (isBeforeCurrentMonth) return;

    setMonthIndex(newMonth);
    setYear(newYear);
  }

  const isCurrentMonthShown = monthIndex === today.getMonth() && year === today.getFullYear();

  function goToDayMeal(day, mealType) {
    const key = dateKey(year, monthIndex, day);
    navigation.navigate("DayMenu", { dateKey: key, mealType, day, monthIndex, year });
  }

  function mealLabel(key, mealType) {
    const entry = menu[key];
    const recipeId = entry?.[mealType];
    if (!recipeId) return null;
    const recipe = getRecipe(recipeId);
    return recipe ? recipe.name : null;
  }

  const isToday = (day) =>
    day === today.getDate() && monthIndex === today.getMonth() && year === today.getFullYear();

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <TouchableOpacity
          onPress={() => changeMonth(-1)}
          style={styles.monthArrow}
          disabled={isCurrentMonthShown}
        >
          <Text style={[styles.monthArrowText, isCurrentMonthShown && styles.monthArrowDisabled]}>
            ‹
          </Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {nombreMes(monthIndex)} {year}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthArrow}>
          <Text style={styles.monthArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={days}
        keyExtractor={(d) => d.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={({ item: day }) => {
          const key = dateKey(year, monthIndex, day);
          const comida = mealLabel(key, "comida");
          const cena = mealLabel(key, "cena");
          return (
            <View style={[styles.dayCard, isToday(day) && styles.todayCard]}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayNumber}>{day}</Text>
                <Text style={styles.dayWeekName}>
                  {nombreDiaCorto(year, monthIndex, day)}
                  {isToday(day) ? " · Hoy" : ""}
                </Text>
              </View>

              <View style={styles.mealsRow}>
                <TouchableOpacity
                  style={styles.mealSlot}
                  onPress={() => goToDayMeal(day, "comida")}
                >
                  <Text style={styles.mealLabel}>🍲 Comida</Text>
                  <Text style={comida ? styles.mealValue : styles.mealEmpty} numberOfLines={1}>
                    {comida || "Elegir receta"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mealSlot}
                  onPress={() => goToDayMeal(day, "cena")}
                >
                  <Text style={styles.mealLabel}>🌙 Cena</Text>
                  <Text style={cena ? styles.mealValue : styles.mealEmpty} numberOfLines={1}>
                    {cena || "Elegir receta"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED" },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#FFF7ED",
  },
  monthArrow: { paddingHorizontal: 24 },
  monthArrowText: { fontSize: 26, color: "#FB923C", fontWeight: "700" },
  monthArrowDisabled: { color: "#F3D9BE" },
  monthTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937", minWidth: 160, textAlign: "center" },
  dayCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  todayCard: { borderWidth: 1.5, borderColor: "#FB923C" },
  dayHeader: { flexDirection: "row", alignItems: "baseline", marginBottom: 8 },
  dayNumber: { fontSize: 18, fontWeight: "700", color: "#1F2937", marginRight: 8 },
  dayWeekName: { fontSize: 13, color: "#9CA3AF", fontWeight: "600" },
  mealsRow: { flexDirection: "row", gap: 10 },
  mealSlot: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    borderRadius: 10,
    padding: 10,
  },
  mealLabel: { fontSize: 11, color: "#9A6B3F", fontWeight: "600", marginBottom: 3 },
  mealValue: { fontSize: 13, color: "#1F2937", fontWeight: "600" },
  mealEmpty: { fontSize: 13, color: "#D1B89A" },
});
