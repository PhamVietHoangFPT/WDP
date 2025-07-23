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
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";

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

  const handleManageAddresses = () => {
    router.push("/profile/address-management");
  };

  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.item}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  const MenuItem = ({
    icon,
    label,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.menuText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#555" />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: "https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg",
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

            <View style={{ marginTop: 20 }}>
              <MenuItem
                icon={
                  <Ionicons name="create-outline" size={24} color="#f7fafcff" />
                }
                label="Chỉnh sửa thông tin cá nhân"
                onPress={handleEditProfile}
              />
              <MenuItem
                icon={
                  <Ionicons name="people-outline" size={24} color="#f7fafcff" />
                }
                label="Người xét nghiệm"
                onPress={handleViewTestTakers}
              />
              <MenuItem
                icon={
                  <MaterialIcons name="history" size={24} color="#f7fafcff" />
                }
                label="Lịch sử trường hợp dịch vụ"
                onPress={handleViewServiceHistory}
              />
              <MenuItem
                icon={
                  <FontAwesome5
                    name="file-invoice-dollar"
                    size={24}
                    color="#f7fafcff"
                  />
                }
                label="Lịch sử thanh toán"
                onPress={handleViewPayments}
              />
              <MenuItem
                icon={
                  <Ionicons
                    name="location-outline"
                    size={24}
                    color="#f7fafcff"
                  />
                }
                label="Quản lý địa chỉ"
                onPress={handleManageAddresses}
              />
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
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
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
  logoutButton: {
    backgroundColor: "#FF4136",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 30,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#2ECC40",
    paddingVertical: 12,
    borderRadius: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
  },
  iconContainer: {
    width: 36,
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    fontSize: 18,
    color: "#fff",
    flex: 1,
  },
});
