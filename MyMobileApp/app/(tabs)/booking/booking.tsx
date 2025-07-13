import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAllServices } from "@/service/service/service-api";

interface Service {
  _id: string;
  sample: {
    name: string;
    sampleType: {
      name: string;
      sampleTypeFee: number;
    };
    fee: number;
  };
  isAdministration: boolean;
  isAgnate: boolean;
  fee: number;
  timeReturn: {
    timeReturnFee: number;
  };
}

export default function BookingScreen() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getAllServices();
        if (Array.isArray(response.data)) {
          setServices(response.data);
        } else {
          console.warn("API không trả về mảng services:", response);
        }
      } catch (error) {
        console.error("Lỗi khi load services:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách dịch vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleRegister = (id: string) => {
    // router.push(`/RegisterServiceAtHome?serviceId=${id}`);
    router.push(`/booking/register-at-home?serviceId=${id}`);
  };

  // const handleViewDetail = (id: string) => {
  //   router.push(`/ServiceDetail?serviceId=${id}`);
  // };

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>DỊCH VỤ CỦA CHÚNG TÔI</Text>
        <Text style={styles.subtitle}>Tổng hợp thông tin Dịch vụ 🧬</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#fff"
            style={{ marginTop: 40 }}
          />
        ) : services.length > 0 ? (
          services.map((item) => {
            const price =
              (item.fee || 0) +
              (item.timeReturn?.timeReturnFee || 0) +
              (item.sample?.fee || 0) +
              (item.sample?.sampleType?.sampleTypeFee || 0);

            return (
              <View key={item._id} style={styles.card}>
                <View style={styles.header}>
                  <Text style={styles.sampleName}>
                    Mẫu:{" "}
                    <Text style={{ color: "#BBDEFB" }}>
                      {item.sample?.name || "---"}
                    </Text>
                  </Text>
                  <Text style={styles.tag}>
                    {item.isAdministration ? "Hành chính" : "Dân sự"}{" "}
                    <Ionicons
                      name="person-circle-outline"
                      size={12}
                      color="#fff"
                    />
                  </Text>
                </View>

                <Text style={styles.desc}>
                  Xét nghiệm huyết thống bên {item.isAgnate ? "nội" : "ngoại"}
                </Text>
                <Text style={styles.desc}>
                  Loại mẫu: {item.sample?.sampleType?.name || "---"}
                </Text>
                <Text style={styles.price}>
                  Giá:{" "}
                  {price > 0
                    ? price.toLocaleString("vi-VN") + "₫"
                    : "Liên hệ để báo giá"}
                </Text>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.registerBtn}
                    onPress={() => handleRegister(item._id)}
                  >
                    <Text style={styles.registerText}>Đăng ký</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailBtn}
                    // onPress={() => handleViewDetail(item._id)}
                  >
                    <Text style={styles.detailText}>Xem chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>Không có dịch vụ nào.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 30,
  },
  subtitle: {
    textAlign: "center",
    color: "#BBDEFB",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sampleName: {
    fontWeight: "bold",
    color: "#fff",
  },
  tag: {
    fontStyle: "italic",
    fontSize: 12,
    color: "#fff",
  },
  desc: {
    marginTop: 4,
    color: "#BBDEFB",
  },
  price: {
    marginTop: 4,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  registerBtn: {
    backgroundColor: "#2ECC40",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  registerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  detailBtn: {
    borderWidth: 1,
    borderColor: "#FFDC00",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  detailText: {
    color: "#FFDC00",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
