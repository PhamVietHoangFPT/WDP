import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

export default function HomeScreen() {
  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <BlurView intensity={50} tint="dark" style={styles.logoWrapper}>
            <FontAwesome name="connectdevelop" size={60} color="#fff" />
          </BlurView>

          <Text style={styles.title}>ADN</Text>
          <Text style={styles.subtitle}>
            Kết nối dịch vụ - Mở rộng trải nghiệm
          </Text>
          <Text style={styles.description}>
            ADN giúp bạn đặt lịch dịch vụ nhanh chóng, an toàn và tin cậy.
          </Text>

          <TouchableOpacity style={styles.button}>
            <LinearGradient
              colors={["#00BFFF", "#00FFFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Bắt đầu ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Extra Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Về ADN</Text>
          <Text style={styles.infoText}>
            ADN là nền tảng đặt lịch dịch vụ tiên phong, mang đến cho người dùng
            trải nghiệm liền mạch, kết nối nhanh chóng với hàng ngàn đối tác uy
            tín.
          </Text>

          <Text style={styles.infoTitle}>Tính năng nổi bật</Text>
          <Text style={styles.infoText}>• Đặt lịch dễ dàng, chỉ 3 bước.</Text>
          <Text style={styles.infoText}>
            • Theo dõi lịch sử và trạng thái đặt.
          </Text>
          <Text style={styles.infoText}>
            • Hỗ trợ 24/7, đội ngũ nhiệt tình.
          </Text>

          <Text style={styles.infoTitle}>Tại sao chọn ADN?</Text>
          <Text style={styles.infoText}>
            ADN luôn đặt sự an toàn và tiện lợi của bạn lên hàng đầu. Chúng tôi
            cam kết bảo mật thông tin, cung cấp dịch vụ minh bạch, giá cả hợp
            lý.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 30,
    paddingBottom: 80,
  },
  hero: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
  },
  title: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: "#BBDEFB",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#E3F2FD",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  button: {
    borderRadius: 30,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#E3F2FD",
    lineHeight: 24,
  },
});
