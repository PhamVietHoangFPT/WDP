import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";
import { View, TouchableOpacity, StyleSheet } from "react-native";

import Home from "./screens/Home";
import Search from "./screens/customerScreens/Search";
import Booking from "./screens/customerScreens/booking/RegisterServiceAtHome";
import Blog from "./screens/customerScreens/Blog";
import ProfileStack from "./navigation/ProfileStack";
import AtHomeServices from "./screens/customerScreens/booking/AtHomeRegistration";
import RegisterServiceAtHome from "./screens/customerScreens/booking/RegisterServiceAtHome";
import BookingStack from "./navigation/BookingStack";

const Tab = createBottomTabNavigator();

export default function MainAppContent() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
          backgroundColor: "#f2f2f2",
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "";

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Search") iconName = "search";
          else if (route.name === "Booking") iconName = "plus";
          else if (route.name === "Blog") iconName = "bell";
          else if (route.name === "Profile") iconName = "user";

          if (iconName === "plus") {
            return (
              <View style={styles.plusButton}>
                <FontAwesome name="plus" size={28} color="#fff" />
              </View>
            );
          }

          return (
            <FontAwesome
              name={iconName}
              size={24}
              color={focused ? "#3455eb" : "gray"}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Search" component={Search} />
      {/* <Tab.Screen name="Booking" component={Booking} /> */}
      <Tab.Screen name="Booking" component={BookingStack} />
      <Tab.Screen name="Blog" component={Blog} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  plusButton: {
    marginTop: -30,
    backgroundColor: "#3455eb",
    borderRadius: 35,
    padding: 16,
  },
});
