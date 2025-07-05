import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import {
  getTestTakers,
  deleteTestTaker,
} from "../../../services/customerApi/testTakerApi";
import { Ionicons } from "@expo/vector-icons";

interface UserPayload {
  id: string;
}

interface TestTaker {
  _id: string;
  name: string;
  personalId: string;
  gender: boolean;
  dateOfBirth: string;
  account: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function TestTakerList() {
  const [testTakers, setTestTakers] = useState<TestTaker[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchUserAndTakers = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const decoded: UserPayload = jwtDecode(token);
      try {
        const res = await getTestTakers();
        setTestTakers(res.data);
      } catch (error) {
        console.error("Lỗi load test takers:", error);
      }
    };

    fetchUserAndTakers();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert("Xác nhận xoá", "Bạn có chắc muốn xoá người này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        onPress: async () => {
          try {
            await deleteTestTaker(id);
            setTestTakers((prev) => prev.filter((t) => t._id !== id));
          } catch (e) {
            Alert.alert("Lỗi xoá", "Không thể xoá test taker");
          }
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Người xét nghiệm ADN</Text>

        {testTakers.length > 0 ? (
          testTakers.map((taker) => (
            <TouchableOpacity
              key={taker._id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("TestTakerDetail", { takerId: taker._id })
              }
            >
              <Text style={styles.name}>Tên: {taker.name}</Text>
              <Text style={styles.text}>CMND/CCCD: {taker.personalId}</Text>
              <Text style={styles.text}>
                Giới tính: {taker.gender ? "Nam" : "Nữ"}
              </Text>
              <Text style={styles.text}>
                Ngày sinh: {new Date(taker.dateOfBirth).toLocaleDateString()}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("EditTestTaker", {
                      takerId: taker._id,
                    })
                  }
                >
                  <Ionicons name="create-outline" size={24} color="#FFDC00" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(taker._id)}>
                  <Ionicons name="trash-outline" size={24} color="#FF4136" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>
            Không có người xét nghiệm nào, hãy thêm mới.
          </Text>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddTestTaker")}
        >
          <Text style={styles.addText}>+ Thêm người xét nghiệm</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 140 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  name: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  text: {
    color: "#BBDEFB",
    fontSize: 15,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 16,
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#2ECC40",
    marginBottom: 40,
  },
  addText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
