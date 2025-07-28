import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getAllServiceCases } from "@/service/service/service-case-api";

export default function ServiceCase() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber] = useState(1); // hiện tại mặc định trang 1
  const [pageSize] = useState(5); // giống Swagger
  const [currentStatus] = useState<string | null>(null); // có thể sau này lọc

  useEffect(() => {
    const fetchServiceCases = async () => {
      try {
        setLoading(true);
        const res = await getAllServiceCases(
          pageNumber,
          pageSize,
          currentStatus
        );
        setData(res.data);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải danh sách hồ sơ dịch vụ.");
      } finally {
        setLoading(false);
      }
    };
    fetchServiceCases();
  }, []);

  const renderStatusTag = (status: string) => {
    const lowerStatus = status?.toLowerCase() || "";
    let color = "#999"; // mặc định xám

    if (lowerStatus.includes("thất bại") || lowerStatus.includes("hủy")) {
      color = "#FF4D4F"; // đỏ
    } else if (status?.includes("Chờ thanh toán")) {
      color = "#FA8C16"; // cam
    } else if (lowerStatus.includes("đã")) {
      color = "#52C41A"; // xanh lá
    }

    return (
      <View style={[styles.statusTag, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{status || "—"}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const createdAt = new Date(item.created_at || item.createdAt);
    const formattedDate = `${createdAt.toLocaleTimeString(
      "vi-VN"
    )} ${createdAt.toLocaleDateString("vi-VN")}`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push(
            `/(tabs)/profile/service-case-detail?serviceCaseId=${item._id}`
          )
        }
      >
        <Text style={styles.cardTitle}>Mã hồ sơ: {item._id}</Text>
        <Text style={styles.cardText}>
          Số tiền (VNĐ):{" "}
          {typeof item.totalFee === "number"
            ? item.totalFee.toLocaleString("vi-VN")
            : "—"}
        </Text>
        <Text style={styles.cardText}>Ngày tạo: {formattedDate}</Text>
        {renderStatusTag(item.currentStatus?.testRequestStatus || "")}
        <Text style={styles.viewDetail}>Xem chi tiết &gt;</Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Lịch sử hồ sơ dịch vụ</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có hồ sơ dịch vụ nào.</Text>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: { paddingHorizontal: 20, marginBottom: 10 },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
  },
  cardText: {
    color: "#BBDEFB",
    fontSize: 14,
    marginBottom: 6,
  },
  statusTag: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginVertical: 6,
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
  },
  viewDetail: {
    color: "#1890ff",
    fontWeight: "600",
    marginTop: 8,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});
