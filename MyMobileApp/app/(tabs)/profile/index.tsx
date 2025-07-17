import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface UserPayload {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  facility: string | null;
  gender: boolean;
  iat: number;
  exp: number;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          const decoded: UserPayload = jwtDecode(token);
          setUser(decoded);
          setHasToken(true);
        } else {
          setHasToken(false);
        }
      } catch (error) {
        console.error("Lỗi decode token:", error);
        setHasToken(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    Alert.alert("Đăng xuất", "Bạn đã đăng xuất thành công.");
    router.replace("/(auth)/login");
  };

  const handleLoginRedirect = () => {
    router.replace("/(auth)/login");
  };

  const handleEditProfile = () => {
    router.push({
      pathname: "/edit-profile",
      params: user ? { user: JSON.stringify(user) } : {},
    });
  };

  const handleViewTestTakers = () => {
    router.push("/profile/test-taker-list");
  };

  const handleViewServiceHistory = () => {
    router.push("/profile/service-history");
  };

  const handleViewPayments = () => {
    router.push("/profile/payment-history");
  };

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: "https://tse3.mm.bing.net/th/id/OIP._Z-nVr4Y_E2EmJQFOuFr9AHaHa?r=0&w=512&h=512&rs=1&pid=ImgDetMain&o=7&rm=3https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg", // Ảnh avatar cố định
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
          {hasToken && user ? (
            <Text style={styles.name}>{user.name}</Text>
          ) : (
            <Text style={styles.name}>Guest</Text>
          )}
        </View>

        {hasToken && user ? (
          <View style={styles.infoBox}>
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="SĐT" value={user.phoneNumber} />
            <InfoItem label="Giới tính" value={user.gender ? "Nam" : "Nữ"} />
            <InfoItem
              label="Thời gian hiệu lực"
              value={new Date(user.iat * 1000).toLocaleString()}
            />
            <InfoItem
              label="Hết hạn"
              value={new Date(user.exp * 1000).toLocaleString()}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditProfile}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Chỉnh sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.viewButton}
                onPress={handleViewTestTakers}
              >
                <Ionicons name="people-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Người xét nghiệm</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={handleViewServiceHistory}
              >
                <Ionicons name="albums-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>
                  Lịch sử trường hợp dịch vụ
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.paymentButton}
                onPress={handleViewPayments}
              >
                <Ionicons name="card-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Lịch sử thanh toán</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoBox}>
            <Text style={styles.warning}>
              Bạn chưa đăng nhập. Vui lòng đăng nhập để xem thông tin cá nhân.
            </Text>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLoginRedirect}
            >
              <Text style={styles.logoutText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 30,
    justifyContent: "flex-start",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    resizeMode: "cover",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subText: {
    color: "#BBDEFB",
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  item: { marginBottom: 15 },
  label: {
    fontSize: 16,
    color: "#BBDEFB",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  warning: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF851B",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ECC40",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A9AD9",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  paymentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8763FF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  logoutButton: {
    backgroundColor: "#FF4136",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: "#2ECC40",
    paddingVertical: 12,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  buttonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },
});
