import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Linking } from "react-native";
import { createServicePaymentHistory } from "@/service/customerApi/payment-api";

export default function PaymentSuccessScreen() {
  const router = useRouter();

  const [params, setParams] = useState<URLSearchParams | null>(null);
  const [status, setStatus] = useState<"success" | "error" | "processing">(
    "processing"
  );
  const effectRan = useRef(false);

  useEffect(() => {
    const getUrlParams = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const queryString = initialUrl.split("?")[1] || "";
        setParams(new URLSearchParams(queryString));
      } else {
        setStatus("error");
      }
    };
    getUrlParams();
  }, []);

  useEffect(() => {
    const callApi = async () => {
      if (!params) return;

      try {
        const responseCode = params.get("vnp_ResponseCode");

        if (!responseCode) {
          setStatus("error");
          effectRan.current = true;
          return;
        }

        // Chuyển URLSearchParams thành object để gửi API
        const paramObj: { [key: string]: string } = {};
        params.forEach((value, key) => {
          paramObj[key] = value;
        });

        await createServicePaymentHistory(paramObj);
        setStatus(responseCode === "00" ? "success" : "error");
      } catch (err) {
        console.error("Không thể lưu trạng thái thanh toán:", err);
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái thanh toán");
        setStatus("error");
      } finally {
        effectRan.current = true;
      }
    };

    if (!effectRan.current && params) {
      callApi();
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
              Chúng tôi đã nhận được thanh toán của bạn. Xin cảm ơn!!!
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
