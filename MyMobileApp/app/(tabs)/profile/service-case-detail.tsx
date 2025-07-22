import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getTestRequestHistories } from "@/service/service/service-case-api"; // API lấy lịch sử trạng thái
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function ServiceCaseDetail() {
  const router = useRouter();
  const { serviceCaseId } = useLocalSearchParams() as { serviceCaseId: string };

  const [accountId, setAccountId] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAccount = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          Alert.alert("Lỗi", "Bạn chưa đăng nhập.");
          return;
        }
        const base64Payload = token.split(".")[1];
        const payload = JSON.parse(atob(base64Payload));
        setAccountId(payload.id);
      } catch (err) {
        Alert.alert("Lỗi", "Không thể lấy thông tin người dùng.");
      }
    };
    getAccount();
  }, []);

  useEffect(() => {
    if (!accountId || !serviceCaseId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getTestRequestHistories({
          accountId,
          serviceCaseId,
          pageNumber: 1,
          pageSize: 100,
        });
        // Sắp xếp theo order tăng dần
        const sorted = (res.data || []).sort(
          (a, b) => a.testRequestStatus.order - b.testRequestStatus.order
        );
        setData(sorted);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải lịch sử trạng thái.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId, serviceCaseId]);

  if (loading) {
    return (
      <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{ marginTop: 50 }}
        />
      </LinearGradient>
    );
  }

  if (data.length === 0) {
    return (
      <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
        <Text style={styles.emptyText}>Chưa có lịch sử trạng thái hồ sơ.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Lịch sử trạng thái hồ sơ</Text>

        {data.map((item, index) => {
          const date = new Date(item.created_at || item.createdAt);
          const formattedDate = date.toLocaleString("vi-VN");
          const isLast = index === data.length - 1;

          return (
            <View
              key={item._id}
              style={[styles.timelineItem, isLast && styles.timelineLast]}
            >
              <View
                style={[
                  styles.timelineCircle,
                  isLast && styles.timelineCircleLast,
                ]}
              />
              <View style={styles.timelineContent}>
                <Text style={styles.dateText}>{formattedDate}</Text>
                <Text style={styles.statusText}>
                  {item.testRequestStatus?.testRequestStatus || "—"}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  backButton: { paddingHorizontal: 20, marginBottom: 10 },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  timelineLast: {
    marginBottom: 0,
  },
  timelineCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1890ff",
    marginRight: 16,
  },
  timelineCircleLast: {
    backgroundColor: "#52C41A",
  },
  timelineContent: {
    flex: 1,
  },
  dateText: {
    color: "#BBDEFB",
    fontWeight: "600",
    marginBottom: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  backText: {
    color: "#1890ff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
