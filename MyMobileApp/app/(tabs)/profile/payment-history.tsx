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
import { getMyPayments } from "@/service/customerApi/payment-api";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentHistoryScreen() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await getMyPayments();
        setPayments(res.data || []);
      } catch (error) {
        Alert.alert(
          "Lỗi",
          error.message || "Không thể tải lịch sử thanh toán."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const formatAmount = (amount: number) =>
    typeof amount === "number"
      ? (amount / 100).toLocaleString("vi-VN") + "₫"
      : "—";

  const formatDate = (date: string) =>
    date ? new Date(date).toLocaleString("vi-VN") : "—";

  const renderStatus = (status: string | undefined) => {
    if (!status || typeof status !== "string") {
      return (
        <Text style={[styles.statusTag, { backgroundColor: "#95a5a6" }]}>
          Không rõ
        </Text>
      );
    }

    const lower = status.toLowerCase();
    const isFail = lower.includes("không");
    return (
      <Text
        style={[
          styles.statusTag,
          { backgroundColor: isFail ? "#e74c3c" : "#27ae60" },
        ]}
      >
        {status}
      </Text>
    );
  };

  if (loading)
    return <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />;

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Lịch sử thanh toán</Text>
      <FlatList
        data={payments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.label}>
              Mã giao dịch:{" "}
              <Text style={styles.value}>
                {item.transactionReferenceNumber}
              </Text>
            </Text>
            <Text style={styles.label}>
              Ngân hàng: <Text style={styles.value}>{item.tmnCode}</Text>
            </Text>
            <Text style={styles.label}>
              Số tiền:{" "}
              <Text style={styles.value}>{formatAmount(item.amount)}</Text>
            </Text>
            <Text style={styles.label}>
              Thời gian:{" "}
              <Text style={styles.value}>{formatDate(item.payDate)}</Text>
            </Text>
            <Text style={styles.label}>
              Trạng thái: {renderStatus(item.responseCode)}
            </Text>
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={() =>
                router.push(`/profile/payment-detail?paymentId=${item._id}`)
              }
            >
              <Text style={styles.detailText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có lịch sử thanh toán.</Text>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { padding: 16 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  item: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: { color: "#fff", marginBottom: 4 },
  value: { fontWeight: "bold" },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    color: "#fff",
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  detailBtn: {
    marginTop: 10,
    paddingVertical: 6,
    backgroundColor: "#2980b9",
    borderRadius: 6,
    alignItems: "center",
  },
  detailText: { color: "#fff", fontWeight: "bold" },
  emptyText: { color: "#fff", textAlign: "center", marginTop: 50 },
});
