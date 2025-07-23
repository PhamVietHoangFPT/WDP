import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getFacilities } from "@/service/adminApi.ts/facilities-api"; // import API lấy facilities

const defaultImage = "https://cdn-icons-png.flaticon.com/512/167/167707.png";

export default function SearchScreen() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFacilities = async () => {
    try {
      const res = await getFacilities();
      setFacilities(res.data || []);
    } catch (error) {
      Alert.alert("Lỗi", "Không tải được danh sách cơ sở.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const renderFacility = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <Image source={{ uri: defaultImage }} style={styles.image} />
      <Text style={styles.name}>{item.facilityName}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  if (facilities.length === 0) {
    return (
      <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
        <Text style={styles.noDataText}>Không có cơ sở nào để hiển thị.</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <Text style={styles.title}>Các cơ sở hoạt động</Text>
      <FlatList
        data={facilities}
        renderItem={renderFacility}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        numColumns={2}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  list: {
    paddingBottom: 16,
    marginBottom: 40,
  },
  card: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    margin: 8,
    borderRadius: 12,
    alignItems: "center",
    padding: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  noDataText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});
