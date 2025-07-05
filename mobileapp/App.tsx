// App.tsx (Root Navigator)
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Text,
} from "react-native";

// Import các navigator và content
import AuthNavigator from "./navigation/AuthNavigator"; // Auth Navigator
import MainAppContent from "./MainAppContent"; // Main app content (Tab Bar) - ĐÃ ĐỔI TÊN

// Định nghĩa Root Stack Param List
export type RootStackParamList = {
  Auth: undefined; // Route đến AuthNavigator
  MainApp: undefined; // Route đến MainAppContent (Tab Bar)
};

const RootStack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null); // Giả lập trạng thái đăng nhập

  useEffect(() => {
    // Giả lập việc kiểm tra token đăng nhập (có thể từ AsyncStorage)
    setTimeout(() => {
      // Trong thực tế, bạn sẽ kiểm tra token thật ở đây
      setUserToken(null); // Để ứng dụng luôn bắt đầu từ Login Screen cho mục đích demo
      setIsLoading(false);
    }, 1000); // Giả lập thời gian tải
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Đang tải ứng dụng...</Text>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          // Người dùng chưa đăng nhập, hiển thị Auth Navigator
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // Người dùng đã đăng nhập, hiển thị Main App Content
          <RootStack.Screen name="MainApp" component={MainAppContent} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3455eb", // Màu nền xanh ADN
  },
  loadingText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
  },
});
