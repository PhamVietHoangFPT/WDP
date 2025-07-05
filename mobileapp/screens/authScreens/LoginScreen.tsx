// screens/authScreens/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { login } from "../../services/authApi";

type AuthStackParamList = {
  Login: undefined;
  Register: undefined; // Giữ nguyên hoặc xóa nếu không sử dụng RegisterScreen
  MainAppContent: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Login"
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);

      console.log("API Response Result:", result);

      const isSuccess = result.success === true;
      const isDataArray = Array.isArray(result.data);
      const isDataNotEmpty = isDataArray && result.data.length > 0;
      const firstItem = isDataNotEmpty ? result.data[0] : null;
      const hasAccessToken =
        firstItem && typeof firstItem.accessToken === "string";

      if (isSuccess && hasAccessToken) {
        const accessToken = firstItem.accessToken;

        try {
          await AsyncStorage.setItem("userToken", accessToken);
          console.log("Token đã được lưu vào AsyncStorage:", accessToken);
        } catch (storageError) {
          console.error("Lỗi khi lưu token vào AsyncStorage:", storageError);
          Alert.alert("Lỗi", "Không thể lưu thông tin đăng nhập.");
          return;
        }

        Alert.alert("Thành công", result.message || "Đăng nhập thành công!");
        console.log("Đăng nhập thành công, đang chuyển trang...");
        navigation.replace("MainAppContent");
      } else {
        console.log("Dữ liệu không hợp lệ hoặc thiếu accessToken.");
        Alert.alert(
          "Lỗi",
          result.message ||
            "Email hoặc mật khẩu không đúng hoặc phản hồi không hợp lệ."
        );
      }
    } catch (error: any) {
      console.error("Lỗi khi gọi API đăng nhập:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLogin = () => {
    console.log("Đang bỏ qua đăng nhập, chuyển trang...");
    navigation.replace("MainAppContent");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Đăng nhập ADN</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#a0a0a0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#a0a0a0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          disabled={loading}
        >
          <Text style={styles.registerText}>
            Bạn chưa có tài khoản? Đăng ký ngay
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.skipButton, loading && styles.buttonDisabled]}
          onPress={handleSkipLogin}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Không đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#3455eb",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#3455eb",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#00d4ff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#a0a0a0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerText: {
    color: "#fff",
    fontSize: 14,
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  skipButton: {
    width: "100%",
    height: 50,
    backgroundColor: "transparent",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    marginTop: 10,
  },
  skipButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
export default LoginScreen;
