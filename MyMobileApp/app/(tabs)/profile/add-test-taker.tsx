import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { createTestTaker } from "@/service/customerApi/testTaker-api";

export default function AddTestTaker() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    personalId: "",
    gender: "Nam",
    dateOfBirth: new Date(),
  });
  const [errors, setErrors] = useState({
    name: "",
    personalId: "",
    gender: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field: string, value: string | Date) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    let valid = true;
    let newErrors: any = {};

    if (!form.name.trim()) {
      newErrors.name = "Họ tên không được để trống.";
      valid = false;
    }
    if (!/^\d{12}$/.test(form.personalId)) {
      newErrors.personalId = "CMND/CCCD phải gồm đúng 12 chữ số.";
      valid = false;
    }
    if (!["Nam", "Nữ"].includes(form.gender)) {
      newErrors.gender = "Giới tính không hợp lệ.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const genderBoolean = form.gender === "Nam";
      await createTestTaker({
        name: form.name,
        personalId: form.personalId,
        gender: genderBoolean,
        dateOfBirth: form.dateOfBirth.toISOString().split("T")[0],
      });
      Alert.alert("Thành công", "Đã thêm người xét nghiệm mới");
      router.back();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể thêm người xét nghiệm");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={["#001f3f", "#0074D9"]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>Thêm người xét nghiệm</Text>
            <View style={styles.infoBox}>
              <Text style={styles.label}>Họ tên</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                placeholder="Nhập họ tên"
                placeholderTextColor="#ccc"
                onChangeText={(text) => handleChange("name", text)}
              />
              {errors.name ? (
                <Text style={styles.error}>{errors.name}</Text>
              ) : null}

              <Text style={styles.label}>CMND/CCCD</Text>
              <TextInput
                style={styles.input}
                value={form.personalId}
                placeholder="12 chữ số"
                keyboardType="numeric"
                placeholderTextColor="#ccc"
                onChangeText={(text) => handleChange("personalId", text)}
              />
              {errors.personalId ? (
                <Text style={styles.error}>{errors.personalId}</Text>
              ) : null}

              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.genderRow}>
                {["Nam", "Nữ"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderOption,
                      form.gender === g && styles.genderOptionSelected,
                    ]}
                    onPress={() => handleChange("gender", g)}
                  >
                    <Text style={styles.genderText}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender ? (
                <Text style={styles.error}>{errors.gender}</Text>
              ) : null}

              <Text style={styles.label}>Ngày sinh</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: "#fff" }}>
                  {form.dateOfBirth.toLocaleDateString("vi-VN")}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.dateOfBirth}
                  mode="date"
                  display="calendar"
                  onChange={(e, date) => {
                    setShowDatePicker(false);
                    if (date) handleChange("dateOfBirth", date);
                  }}
                  maximumDate={new Date()}
                />
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Thêm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: "#aaa" }]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: 30,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 20,
  },
  label: {
    color: "#BBDEFB",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    color: "#fff",
  },
  error: {
    color: "#ffcccc",
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  genderOption: {
    flex: 1,
    padding: 12,
    backgroundColor: "#444",
    marginRight: 8,
    borderRadius: 8,
  },
  genderOptionSelected: {
    backgroundColor: "#2ECC40",
  },
  genderText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#2ECC40",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
