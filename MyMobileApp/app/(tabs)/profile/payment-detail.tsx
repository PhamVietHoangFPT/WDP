import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { getPaymentById } from "@/service/customerApi/payment-api";
import { Ionicons } from "@expo/vector-icons";

const formatCurrency = (value: number) =>
  typeof value === "number"
    ? value.toLocaleString("vi-VN") + " VNĐ"
    : String(value || "—");

const formatDate = (datetime: string) => {
  const date = new Date(datetime);
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()}`;
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export default function PaymentDetailScreen() {
  const { paymentId } = useLocalSearchParams();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getPaymentById(String(paymentId));
        setPayment(res);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết thanh toán", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [paymentId]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#fff" />;
  }

  if (!payment) {
    return (
      <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
        <Text style={styles.title}>Không tìm thấy dữ liệu thanh toán.</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Chi tiết thanh toán</Text>
      <View style={styles.box}>
        <Row label="Mã giao dịch" value={payment._id} />
        <Row label="Số giao dịch VNPAY" value={payment.transactionNo || "—"} />
        <Row label="Số tiền" value={formatCurrency(payment.amount)} />
        <Row label="Thời gian thanh toán" value={formatDate(payment.payDate)} />
        <Row label="Trạng thái" value={payment.transactionStatus || "—"} />
        <Row label="Mã TMN" value={payment.tmnCode || "—"} />
        <Row
          label="Loại thanh toán"
          value={payment.paymentType?.paymentType || "—"}
        />
        <Row label="Thông tin đơn hàng" value={payment.orderInfo || "—"} />
        <Row label="Mã phản hồi" value={payment.responseCode || "—"} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  box: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.3,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  label: {
    color: "#fff",
    fontWeight: "bold",
    width: "50%",
  },
  backBtn: { padding: 16 },
  value: {
    color: "#fff",
    textAlign: "right",
    width: "50%",
  },
});
