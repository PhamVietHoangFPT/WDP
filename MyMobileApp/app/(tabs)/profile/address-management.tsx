import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/service/customerApi/address-api"; // API bạn cung cấp
import {
  getProvinceList,
  getWardList,
} from "@/service/customerApi/location-api"; // API lấy danh sách tỉnh và xã
import { router } from "expo-router";

export default function AddressScreen() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Form state
  const [street, setStreet] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    string | null
  >(null);
  const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);

  // Địa chỉ mặc định hiện tại (ID)
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null);

  // Load addresses
  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await getAddresses();
      setAddresses(res.data || []);
      // Lấy ID mặc định từ data
      const defaultAddr = res.data?.find((addr: any) => addr.isDefault);
      setDefaultAddressId(defaultAddr?._id || null);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách địa chỉ.");
    } finally {
      setLoading(false);
    }
  };

  // Load provinces (all)
  const loadProvinces = async () => {
    try {
      const res = await getProvinceList({ pageNumber: 1, pageSize: 1000 });
      setProvinces(res.data || []);
    } catch (error) {
      Alert.alert("Lỗi", "Không tải được danh sách tỉnh/thành phố.");
    }
  };

  // Load wards based on province code
  const loadWards = async (provinceCode: string) => {
    try {
      const res = await getWardList({
        pageNumber: 1,
        pageSize: 1000,
        province_code: provinceCode,
      });
      setWards(res.data || []);
    } catch (error) {
      Alert.alert("Lỗi", "Không tải được danh sách phường/xã.");
    }
  };

  useEffect(() => {
    loadAddresses();
    loadProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvinceCode) {
      loadWards(selectedProvinceCode);
      setSelectedWardCode(null); // reset ward
    } else {
      setWards([]);
      setSelectedWardCode(null);
    }
  }, [selectedProvinceCode]);

  // Mở modal thêm mới
  const openAddModal = () => {
    setEditMode(false);
    setEditingAddress(null);
    setStreet("");
    setSelectedProvinceCode(null);
    setSelectedWardCode(null);
    setModalVisible(true);
  };

  // Mở modal chỉnh sửa
  const openEditModal = (address: any) => {
    setEditMode(true);
    setEditingAddress(address);

    // Tách địa chỉ thành street, ward, province
    setStreet(address.street || "");
    setSelectedProvinceCode(address.province_code || null);
    setSelectedWardCode(address.ward_code || null);
    setModalVisible(true);
  };

  // Xóa địa chỉ
  const handleDelete = async (id: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa địa chỉ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAddress(id);
            Alert.alert("Thành công", "Đã xóa địa chỉ.");
            loadAddresses();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa địa chỉ.");
          }
        },
      },
    ]);
  };

  // Đặt mặc định khi chọn card
  const handleSelectDefault = async (id: string) => {
    if (id === defaultAddressId) return; // nếu đã là mặc định thì không gọi
    try {
      await setDefaultAddress(id);
      setDefaultAddressId(id);
      Alert.alert("Thành công", "Đã đặt địa chỉ mặc định.");
      loadAddresses();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đặt địa chỉ mặc định.");
    }
  };

  // Lưu địa chỉ (thêm mới hoặc cập nhật)
  const handleSave = async () => {
    if (!street.trim() || !selectedProvinceCode || !selectedWardCode) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin địa chỉ.");
      return;
    }

    // Lấy tên tỉnh và xã theo code
    const province = provinces.find((p) => p.Code === selectedProvinceCode);
    const ward = wards.find((w) => w.Code === selectedWardCode);

    // Tạo fullAddress hiển thị
    const fullAddress = `${street}, ${ward?.FullName || ""}, ${
      province?.FullName || ""
    }`;

    try {
      if (editMode && editingAddress) {
        await updateAddress(editingAddress._id, {
          street,
          province_code: selectedProvinceCode,
          province_name: province?.FullName,
          ward_code: selectedWardCode,
          ward_name: ward?.FullName,
          fullAddress,
        });
        Alert.alert("Thành công", "Đã cập nhật địa chỉ.");
      } else {
        await createAddress({
          street,
          province_code: selectedProvinceCode,
          province_name: province?.FullName,
          ward_code: selectedWardCode,
          ward_name: ward?.FullName,
          fullAddress,
        });
        Alert.alert("Thành công", "Đã thêm địa chỉ mới.");
      }
      setModalVisible(false);
      loadAddresses();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu địa chỉ.");
    }
  };

  const renderAddressItem = ({ item }: { item: any }) => {
    const isDefault = item._id === defaultAddressId;

    return (
      <TouchableOpacity
        style={[styles.addressCard, isDefault && styles.addressCardDefault]}
        activeOpacity={0.8}
        onPress={() => handleSelectDefault(item._id)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.addressText}>{item.fullAddress}</Text>
          {isDefault && <Text style={styles.defaultTag}>Mặc định</Text>}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => openEditModal(item)}
            style={{ paddingHorizontal: 10 }}
          >
            <MaterialIcons name="edit" size={22} color="#00aaff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item._id)}
            style={{ paddingHorizontal: 10 }}
          >
            <MaterialIcons name="delete" size={22} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={["#001f3f", "#0074D9"]}
      style={{ flex: 1, padding: 20 }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Quản lý địa chỉ</Text>

      {loading ? (
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
          Đang tải dữ liệu...
        </Text>
      ) : (
        <>
          {addresses.length === 0 && (
            <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
              Chưa có địa chỉ nào.
            </Text>
          )}

          <FlatList
            data={addresses}
            renderItem={renderAddressItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <MaterialIcons name="add-location-alt" size={26} color="#fff" />
            <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal thêm / chỉnh sửa */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editMode ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
            </Text>

            <ScrollView keyboardShouldPersistTaps="handled">
              <TextInput
                placeholder="Địa chỉ cụ thể (Số nhà, đường, hẻm)"
                placeholderTextColor="#999"
                value={street}
                onChangeText={setStreet}
                style={styles.input}
              />

              <Text style={styles.label}>Tỉnh/Thành phố</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.picker}
              >
                {provinces.length > 0 ? (
                  provinces.map((p) => (
                    <TouchableOpacity
                      key={p.Code}
                      onPress={() => setSelectedProvinceCode(p.Code)}
                      style={[
                        styles.pickerItem,
                        selectedProvinceCode === p.Code &&
                          styles.pickerItemSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedProvinceCode === p.Code &&
                            styles.pickerItemTextSelected,
                        ]}
                      >
                        {p.FullName}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ color: "#fff" }}>Đang tải tỉnh/thành...</Text>
                )}
              </ScrollView>

              <Text style={styles.label}>Phường/Xã</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.picker}
              >
                {wards.length > 0 ? (
                  wards.map((w) => (
                    <TouchableOpacity
                      key={w.Code}
                      onPress={() => setSelectedWardCode(w.Code)}
                      style={[
                        styles.pickerItem,
                        selectedWardCode === w.Code &&
                          styles.pickerItemSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedWardCode === w.Code &&
                            styles.pickerItemTextSelected,
                        ]}
                      >
                        {w.FullName}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ color: "#fff" }}>Chọn tỉnh/thành trước</Text>
                )}
              </ScrollView>

              <View style={styles.modalButtons}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={{ marginTop: 16 }}
                >
                  {editMode ? "Cập nhật" : "Thêm địa chỉ"}
                </Button>
                <Button
                  onPress={() => setModalVisible(false)}
                  style={{ marginTop: 8 }}
                  textColor="#aaa"
                >
                  Hủy
                </Button>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  addressCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  addressCardDefault: {
    borderWidth: 2,
    borderColor: "#0074D9",
  },
  addressText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginBottom: 6,
    lineHeight: 22,
  },
  defaultTag: {
    backgroundColor: "#52C41A",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  setDefaultText: {
    color: "#00d4ff",
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 14,
  },
  actionRight: {
    alignItems: "flex-end",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    flexDirection: "row",
    backgroundColor: "#2ECC40",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    marginBottom: 50,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#001f3f",
    borderRadius: 14,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#073878",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    color: "#BBDEFB",
    marginBottom: 8,
    fontWeight: "600",
  },
  picker: {
    marginBottom: 16,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    marginRight: 10,
  },
  pickerItemSelected: {
    backgroundColor: "#0074D9",
  },
  pickerItemText: {
    color: "#BBDEFB",
    fontWeight: "600",
  },
  pickerItemTextSelected: {
    color: "#fff",
  },
  modalButtons: {
    marginTop: 12,
  },
});
