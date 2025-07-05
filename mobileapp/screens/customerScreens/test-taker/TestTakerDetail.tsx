import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getTestTakerById } from "../../../services/customerApi/testTakerApi";

interface TestTaker {
  _id: string;
  name: string;
  personalId: string;
  gender: boolean;
  dateOfBirth: string;
  account: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function TestTakerDetail() {
  const [taker, setTaker] = useState<TestTaker | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { takerId } = route.params;

  useEffect(() => {
    const fetchTaker = async () => {
      try {
        const res = await getTestTakerById(takerId);
        setTaker(res);
      } catch (err) {
        console.error("Lỗi lấy thông tin test taker:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTaker();
  }, [takerId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime())
      ? date.toLocaleDateString("vi-VN")
      : "Không xác định";
  };

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Chi tiết người xét nghiệm</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : taker ? (
          <View style={styles.infoBox}>
            <InfoItem label="Họ tên" value={taker.name} />
            <InfoItem label="CMND/CCCD" value={taker.personalId} />
            <InfoItem label="Giới tính" value={taker.gender ? "Nam" : "Nữ"} />
            <InfoItem label="Ngày sinh" value={formatDate(taker.dateOfBirth)} />
            <InfoItem label="Tài khoản" value={taker.account?.email || ""} />

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
              <Text style={styles.backText}>Quay về hồ sơ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.warning}>Không tìm thấy thông tin.</Text>
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
  scroll: { flexGrow: 1, padding: 30, justifyContent: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  item: {
    marginBottom: 16,
  },
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
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  backButton: {
    marginTop: 24,
    flexDirection: "row",
    backgroundColor: "#0074D9",
    padding: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
