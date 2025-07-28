import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createServicePaymentHistory } from "@/service/customerApi/payment-api";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<"success" | "error" | "processing">(
    "processing"
  );
  const [params, setParams] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const extractParamsFromUrl = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          const query = url.split("?")[1] || "";
          const parsed: { [key: string]: string } = {};
          const searchParams = new URLSearchParams(query);
          searchParams.forEach((value, key) => {
            parsed[key] = value;
          });
          setParams(parsed);
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Không lấy được URL:", err);
        setStatus("error");
      }
    };

    extractParamsFromUrl();
  }, []);

  useEffect(() => {
    const handlePayment = async () => {
      if (!params || !params.vnp_ResponseCode) return;

      try {
        await createServicePaymentHistory(params);
        setStatus(params.vnp_ResponseCode === "00" ? "success" : "error");
      } catch (err) {
        console.error("Lỗi khi gọi API lưu trạng thái:", err);
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái thanh toán.");
        setStatus("error");
      }
    };

    if (Object.keys(params).length > 0) {
      handlePayment();
    }
  }, [params]);

  const renderContent = () => {
    switch (status) {
      case "processing":
        return <Text style={styles.messageText}>Đang xử lý thanh toán...</Text>;
      case "success":
        return (
          <>
            <Ionicons
              name="checkmark-circle"
              size={80}
              color="#52c41a"
              style={{ marginBottom: 20 }}
            />
            <Text
              style={[
                styles.messageText,
                { color: "#52c41a", fontWeight: "bold", fontSize: 22 },
              ]}
            >
              🎉 Thanh toán thành công!
            </Text>
            <Text style={styles.messageText}>
              Chúng tôi đã nhận được thanh toán của bạn. Xin cảm ơn!
            </Text>
          </>
        );
      case "error":
      default:
        return (
          <>
            <Ionicons
              name="close-circle"
              size={80}
              color="#ff4d4f"
              style={{ marginBottom: 20 }}
            />
            <Text
              style={[
                styles.messageText,
                { color: "#ff4d4f", fontWeight: "bold", fontSize: 22 },
              ]}
            >
              ❌ Thanh toán thất bại!
            </Text>
            <Text style={styles.messageText}>
              Giao dịch không thành công hoặc bị từ chối.
            </Text>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      {status !== "processing" && (
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.homeButtonText}>Về trang chủ</Text>
        </TouchableOpacity>
      )}
      {status === "processing" && (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001f3f",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  messageText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  homeButton: {
    marginTop: 30,
    backgroundColor: "#0074D9",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
