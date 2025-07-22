import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function NotLoggedIn() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.message}>Vui lòng đăng nhập để đặt lịch.</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.loginText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  message: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#2ECC40",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
