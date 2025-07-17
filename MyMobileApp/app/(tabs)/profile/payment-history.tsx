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

  if (loading)
    return <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />;

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Lịch sử thanh toán</Text>
      <FlatList
        data={payments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title1}>Số tiền: {item.amount}₫</Text>
            <Text style={styles.text}>
              Ngày: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.text}>Trạng thái: {item.status}</Text>
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
  item: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  title1: { color: "#fff", fontWeight: "bold", fontSize: 16, marginBottom: 6 },
  text: { color: "#BBDEFB", fontSize: 14 },
  emptyText: { color: "#fff", textAlign: "center", marginTop: 50 },
});
