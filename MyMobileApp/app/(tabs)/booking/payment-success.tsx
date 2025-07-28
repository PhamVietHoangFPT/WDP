import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
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

  // Extract query from URL
  const extractParams = (url: string) => {
    console.log("🔗 Received return URL from VNPay:", url);
    const query = url.split("?")[1] || "";
    const parsed: { [key: string]: string } = {};
    const searchParams = new URLSearchParams(query);
    searchParams.forEach((value, key) => {
      parsed[key] = value;
    });
    console.log("📥 Parsed VNPay params:", parsed);
    setParams(parsed);
  };

  // Lấy URL khi mở app
  useEffect(() => {
    console.log("🚀 PaymentSuccessScreen mounted");

    const getInitial = async () => {
      const initialUrl = await Linking.getInitialURL();
      console.log("🌐 Initial URL:", initialUrl);
      if (initialUrl) extractParams(initialUrl);
    };

    getInitial();

    const subscription = Linking.addEventListener("url", (event) => {
      console.log("📡 Deep link event received:", event.url);
      extractParams(event.url);
    });

    return () => subscription.remove();
  }, []);

  // Gửi dữ liệu thanh toán
  useEffect(() => {
    const handlePayment = async () => {
      if (!params || !params.vnp_ResponseCode) return;

      const paymentData = {
        vnp_Amount: parseInt(params.vnp_Amount || "0"),
        vnp_BankCode: params.vnp_BankCode || "",
        vnp_BankTranNo: params.vnp_BankTranNo || "",
        vnp_CardType: params.vnp_CardType || "",
        vnp_OrderInfo: params.vnp_OrderInfo || "",
        vnp_PayDate: params.vnp_PayDate || "",
        vnp_ResponseCode: params.vnp_ResponseCode || "",
        vnp_TmnCode: params.vnp_TmnCode || "",
        vnp_TransactionNo: params.vnp_TransactionNo || "",
        vnp_TransactionStatus: params.vnp_TransactionStatus || "",
        vnp_TxnRef: params.vnp_TxnRef || "",
        vnp_SecureHash: params.vnp_SecureHash || "",
      };

      try {
        console.log("📤 Sending payment data to backend:", paymentData);
        await createServicePaymentHistory(paymentData);
        setStatus(paymentData.vnp_ResponseCode === "00" ? "success" : "error");
      } catch (err) {
        console.error("❌ Error saving payment:", err);
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
            <Text style={[styles.messageText, styles.successText]}>
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
            <Text style={[styles.messageText, styles.errorText]}>
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
  successText: {
    color: "#52c41a",
    fontWeight: "bold",
    fontSize: 22,
  },
  errorText: {
    color: "#ff4d4f",
    fontWeight: "bold",
    fontSize: 22,
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
