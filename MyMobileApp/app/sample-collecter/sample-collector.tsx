import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Button, Provider as PaperProvider } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import { Stack } from "expo-router";

import {
  getServiceCaseStatusList,
  getAllServiceCases,
  updateServiceCaseStatus,
} from "@/service/adminApi.ts/sample-colector-api";

interface ServiceCase {
  _id: string;
  statusDetails: string;
  bookingDate: string;
}

interface ServiceCaseStatus {
  _id: string;
  testRequestStatus: string;
  order: number;
}

export default function SampleCollectorScreen() {
  const [isAtHome, setIsAtHome] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedServiceCase, setSelectedServiceCase] =
    useState<ServiceCase | null>(null);
  const [newStatusId, setNewStatusId] = useState<string>("");

  const [statusListData, setStatusListData] = useState<ServiceCaseStatus[]>([]);
  const [serviceCasesData, setServiceCasesData] = useState<ServiceCase[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [serviceCasesError, setServiceCasesError] = useState<string | null>(
    null
  );

  const [serviceTypeOpen, setServiceTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [serviceTypeValue, setServiceTypeValue] = useState("home");
  const [statusValue, setStatusValue] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatusList = async () => {
      setIsLoadingStatus(true);
      try {
        const res = await getServiceCaseStatusList(1, 100);
        setStatusListData(res.data || []);
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error.message || "Không thể tải danh sách trạng thái."
        );
      } finally {
        setIsLoadingStatus(false);
      }
    };
    fetchStatusList();
  }, []);

  useEffect(() => {
    setIsAtHome(serviceTypeValue === "home");
  }, [serviceTypeValue]);

  useEffect(() => {
    if (!selectedStatus) {
      setServiceCasesData([]);
      return;
    }

    const fetchServiceCases = async () => {
      setIsLoadingServices(true);
      setServiceCasesError(null);
      try {
        const res = await getAllServiceCases(selectedStatus, isAtHome);
        setServiceCasesData(res.data || []);
      } catch (error: any) {
        setServiceCasesError(error.message || "Lỗi khi tải danh sách dịch vụ.");
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServiceCases();
  }, [selectedStatus, isAtHome]);

  useEffect(() => {
    if (statusValue) setSelectedStatus(statusValue);
  }, [statusValue]);

  useEffect(() => {
    setPageNumber(1);
  }, [selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Chờ xử lý":
        return "#FA8C16";
      case "Đang lấy mẫu":
        return "#1890FF";
      case "Đã nhận mẫu":
        return "#52C41A";
      default:
        return "#999";
    }
  };

  const getCurrentStatusOrder = (statusName: string) => {
    const status = statusListData.find(
      (s) => s.testRequestStatus === statusName
    );
    return status?.order || 0;
  };

  const getAvailableNextStatuses = (currentStatusName: string) => {
    const currentOrder = getCurrentStatusOrder(currentStatusName);
    return statusListData
      .filter((status) => status.order > currentOrder)
      .sort((a, b) => a.order - b.order);
  };

  const handleStatusUpdate = async () => {
    if (!selectedServiceCase || !newStatusId) return;

    setIsUpdating(true);
    try {
      await updateServiceCaseStatus(selectedServiceCase._id, newStatusId);
      Alert.alert("Thành công", "Cập nhật trạng thái thành công!");
      setUpdateModalVisible(false);
      setSelectedServiceCase(null);
      setNewStatusId("");

      const res = await getAllServiceCases(selectedStatus, isAtHome);
      setServiceCasesData(res.data || []);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Cập nhật trạng thái thất bại!");
    } finally {
      setIsUpdating(false);
    }
  };

  const paginatedData = serviceCasesData.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  const renderItem = ({ item }: { item: ServiceCase }) => {
    const availableStatuses = getAvailableNextStatuses(item.statusDetails);
    const canUpdate = availableStatuses.length > 0;

    return (
      <View style={styles.card}>
        <Text style={styles.idText}>{item._id}</Text>
        <View
          style={[
            styles.statusTag,
            { backgroundColor: getStatusColor(item.statusDetails) },
          ]}
        >
          <Text style={styles.statusText}>{item.statusDetails}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.bookingDate).toLocaleString("vi-VN")}
        </Text>

        {canUpdate ? (
          <Button
            mode="contained"
            onPress={() => {
              setSelectedServiceCase(item);
              setNewStatusId("");
              setUpdateModalVisible(true);
            }}
            style={{ marginTop: 8 }}
          >
            Cập nhật trạng thái
          </Button>
        ) : (
          <Button mode="outlined" disabled style={{ marginTop: 8 }}>
            Không thể cập nhật
          </Button>
        )}
      </View>
    );
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>Quản lý trường hợp dịch vụ</Text>

        <View style={{ zIndex: 3000, marginBottom: 16 }}>
          <Text style={styles.label}>Loại dịch vụ</Text>
          <DropDownPicker
            open={serviceTypeOpen}
            value={serviceTypeValue}
            items={[
              { label: "🏠 Tại nhà", value: "home" },
              { label: "🏥 Tại cơ sở", value: "center" },
            ]}
            setOpen={setServiceTypeOpen}
            setValue={setServiceTypeValue}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownBox}
            textStyle={styles.dropdownText}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>

        <View style={{ zIndex: 2000, marginBottom: 16 }}>
          <Text style={styles.label}>Lọc trạng thái</Text>
          <DropDownPicker
            open={statusOpen}
            value={statusValue}
            items={statusListData.map((s) => ({
              label: s.testRequestStatus,
              value: s._id,
            }))}
            setOpen={setStatusOpen}
            setValue={setStatusValue}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownBox}
            textStyle={styles.dropdownText}
            loading={isLoadingStatus}
            zIndex={2000}
            zIndexInverse={2000}
          />
        </View>

        {isLoadingServices ? (
          <ActivityIndicator
            style={{ marginTop: 50 }}
            size="large"
            color="#fff"
          />
        ) : serviceCasesError ? (
          <Text style={styles.emptyText}>Không thể tải dữ liệu dịch vụ.</Text>
        ) : paginatedData.length === 0 ? (
          <Text style={styles.emptyText}>
            Không có dịch vụ với trạng thái này.
          </Text>
        ) : (
          <>
            <FlatList
              data={paginatedData}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
            {pageNumber * pageSize < serviceCasesData.length && (
              <Button
                mode="contained"
                onPress={() => setPageNumber((prev) => prev + 1)}
              >
                Xem thêm
              </Button>
            )}
          </>
        )}

        <Modal
          visible={updateModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setUpdateModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                Xác nhận cập nhật trạng thái
              </Text>
              <Text style={{ color: "#000" }}>
                Mã dịch vụ: {selectedServiceCase?._id.slice(-8).toUpperCase()}
              </Text>
              <Text style={{ color: "#000" }}>
                Trạng thái hiện tại:{" "}
                <Text
                  style={{
                    fontWeight: "bold",
                    color: getStatusColor(
                      selectedServiceCase?.statusDetails || ""
                    ),
                  }}
                >
                  {selectedServiceCase?.statusDetails}
                </Text>
              </Text>
              <Text style={{ marginTop: 12, color: "red" }}>
                ⚠️ Việc cập nhật trạng thái không thể hoàn tác!
              </Text>

              {getAvailableNextStatuses(
                selectedServiceCase?.statusDetails || ""
              ).map((status) => (
                <Button
                  key={status._id}
                  mode="outlined"
                  onPress={() => setNewStatusId(status._id)}
                  style={{ marginVertical: 4 }}
                >
                  {status.testRequestStatus}
                </Button>
              ))}

              <View style={styles.modalButtons}>
                <Button
                  mode="contained"
                  onPress={handleStatusUpdate}
                  disabled={!newStatusId}
                  loading={isUpdating}
                >
                  Xác nhận
                </Button>
                <Button
                  onPress={() => setUpdateModalVisible(false)}
                  disabled={isUpdating}
                >
                  Hủy
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#004b91",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#BBDEFB",
  },
  dropdown: {
    borderColor: "#BBDEFB",
    backgroundColor: "#fff",
    marginTop: 8,
  },
  dropdownBox: {
    borderColor: "#BBDEFB",
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#BBDEFB",
  },
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: "#0b4c91",
  },
  idText: {
    fontSize: 12,
    marginBottom: 4,
    color: "#BBDEFB",
  },
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
  },
  dateText: {
    fontSize: 16,
    color: "#BBDEFB",
    marginBottom: 8,
  },
  emptyText: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 18,
    color: "#BBDEFB",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#004b91",
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
