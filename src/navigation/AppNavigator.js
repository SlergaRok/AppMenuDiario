import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";

import RecipesListScreen from "../screens/RecipesListScreen";
import RecipeFormScreen from "../screens/RecipeFormScreen";
import RecipeDetailScreen from "../screens/RecipeDetailScreen";
import MonthlyMenuScreen from "../screens/MonthlyMenuScreen";
import DayMenuScreen from "../screens/DayMenuScreen";
import GroupScreen from "../screens/GroupScreen";
import JoinHouseholdScreen from "../screens/JoinHouseholdScreen";
import { useHousehold } from "../context/HouseholdContext";
import { DataProvider } from "../context/DataContext";

const RecipesStack = createNativeStackNavigator();
const MenuStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: "#FB923C" },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700" },
};

function RecipesStackNavigator() {
  return (
    <RecipesStack.Navigator screenOptions={headerStyle}>
      <RecipesStack.Screen
        name="RecipesList"
        component={RecipesListScreen}
        options={{ title: "Mis Recetas" }}
      />
      <RecipesStack.Screen
        name="RecipeForm"
        component={RecipeFormScreen}
        options={({ route }) => ({
          title: route.params?.recipeId ? "Editar receta" : "Nueva receta",
        })}
      />
      <RecipesStack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ title: "Receta" }}
      />
    </RecipesStack.Navigator>
  );
}

function MenuStackNavigator() {
  return (
    <MenuStack.Navigator screenOptions={headerStyle}>
      <MenuStack.Screen
        name="MonthlyMenu"
        component={MonthlyMenuScreen}
        options={{ title: "Menú Mensual" }}
      />
      <MenuStack.Screen
        name="DayMenu"
        component={DayMenuScreen}
        options={{ title: "Elegir receta" }}
      />
      <MenuStack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ title: "Receta" }}
      />
      <MenuStack.Screen
        name="RecipeForm"
        component={RecipeFormScreen}
        options={({ route }) => ({
          title: route.params?.recipeId ? "Editar receta" : "Nueva receta",
        })}
      />
    </MenuStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FB923C",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tab.Screen
        name="Recetas"
        component={RecipesStackNavigator}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🍳</Text>,
        }}
      />
      <Tab.Screen
        name="Menú"
        component={MenuStackNavigator}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Grupo"
        component={GroupScreen}
        options={{
          headerShown: true,
          ...headerStyle,
          title: "Tu Grupo Familiar",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👨‍👩‍👧‍👦</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { householdCode, loading } = useHousehold();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FB923C" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {householdCode ? (
        // DataProvider solo se monta cuando hay un grupo activo, ya que
        // necesita el código del grupo para saber qué datos sincronizar.
        <DataProvider>
          <MainTabs />
        </DataProvider>
      ) : (
        <JoinHouseholdScreen />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF7ED" },
});
