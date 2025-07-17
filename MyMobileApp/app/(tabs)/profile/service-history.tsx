import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { getTestRequestHistories } from "@/service/customerApi/payment-api";

export default function ServiceHistoryScreen() {
  const [histories, setHistories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) throw new Error("Không tìm thấy token");

        const accountId = JSON.parse(atob(token.split(".")[1])).id;
        // Nếu có serviceCaseId thì truyền đúng, ví dụ hardcode hoặc lấy từ props
        const serviceCaseId = "YOUR_SERVICE_CASE_ID";

        const res = await getTestRequestHistories({ accountId, serviceCaseId });
        setHistories(res.data || []);
      } catch (error) {
        Alert.alert("Lỗi", error.message || "Không thể tải lịch sử.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistories();
  }, []);

  if (loading)
    return <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />;

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <FlatList
        data={histories}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>Mẫu: {item.sampleName}</Text>
            <Text style={styles.text}>
              Ngày xét nghiệm: {new Date(item.testDate).toLocaleDateString()}
            </Text>
            <Text style={styles.text}>Kết quả: {item.result}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có lịch sử xét nghiệm.</Text>
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
  title: { color: "#fff", fontWeight: "bold", fontSize: 16, marginBottom: 6 },
  text: { color: "#BBDEFB", fontSize: 14 },
  emptyText: { color: "#fff", textAlign: "center", marginTop: 50 },
});
