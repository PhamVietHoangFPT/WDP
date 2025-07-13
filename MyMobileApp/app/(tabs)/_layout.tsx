import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function TabLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 70,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            position: "absolute",
            backgroundColor: "#f2f2f2",
          },
        }}
      >
        <Tabs.Screen
          name="HomeScreen"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <FontAwesome
                name="home"
                size={24}
                color={focused ? "#3455eb" : "gray"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ focused }) => (
              <FontAwesome
                name="search"
                size={24}
                color={focused ? "#3455eb" : "gray"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="booking"
          options={{
            title: "Booking",
            tabBarIcon: ({ focused }) => (
              <FontAwesome
                name="calendar"
                size={focused ? 34 : 30}
                color={focused ? "#ff6347" : "#3455eb"}
                style={{
                  marginBottom: 8,
                }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="blog"
          options={{
            title: "Blog",
            tabBarIcon: ({ focused }) => (
              <FontAwesome
                name="book"
                size={24}
                color={focused ? "#3455eb" : "gray"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <FontAwesome
                name="user"
                size={24}
                color={focused ? "#3455eb" : "gray"}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
