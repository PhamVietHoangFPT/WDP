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
import { Button, Menu, Provider as PaperProvider } from "react-native-paper";

import {
  getServiceCaseStatusList,
  getAllServiceCases,
  updateServiceCaseStatus,
} from "@/service/adminApi.ts/sample-colector-api";
import { Stack } from "expo-router";

interface ServiceCase {
  _id: string;
  statusDetails: string;
  bookingDate: string;
  currentStatus?: string;
}

interface ServiceCaseStatus {
  _id: string;
  testRequestStatus: string;
  order: number;
}

export default function SampleCollectorScreen() {
  const [isAtHome, setIsAtHome] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedServiceCase, setSelectedServiceCase] =
    useState<ServiceCase | null>(null);
  const [newStatusId, setNewStatusId] = useState<string>("");
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [serviceTypeMenuVisible, setServiceTypeMenuVisible] = useState(false);

  const [statusListData, setStatusListData] = useState<ServiceCaseStatus[]>([]);
  const [serviceCasesData, setServiceCasesData] = useState<ServiceCase[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [serviceCasesError, setServiceCasesError] = useState<string | null>(
    null
  );

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
    setPageNumber(1);
  }, [selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Chờ xử lý":
        return "#FA8C16"; // cam
      case "Đang lấy mẫu":
        return "#1890FF"; // xanh dương
      case "Đã nhận mẫu":
        return "#52C41A"; // xanh lá
      default:
        return "#999"; // xám
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
      if (selectedStatus) {
        const res = await getAllServiceCases(selectedStatus, isAtHome);
        setServiceCasesData(res.data || []);
      }
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

        <Menu
          visible={menuVisible && selectedServiceCase?._id === item._id}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="contained"
              disabled={!canUpdate}
              onPress={() => {
                setSelectedServiceCase(item);
                setMenuVisible(true);
              }}
            >
              {canUpdate ? "Cập nhật trạng thái" : "Không thể cập nhật"}
            </Button>
          }
        >
          {availableStatuses.length === 0 ? (
            <Menu.Item title="Không thể cập nhật thêm" disabled />
          ) : (
            availableStatuses.map((status) => (
              <Menu.Item
                key={status._id}
                title={status.testRequestStatus}
                onPress={() => {
                  setNewStatusId(status._id);
                  setUpdateModalVisible(true);
                  setMenuVisible(false);
                }}
              />
            ))
          )}
        </Menu>
      </View>
    );
  };

  return (
    <PaperProvider>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>Quản lý trường hợp dịch vụ</Text>

        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.label, { marginBottom: 8 }]}>Loại dịch vụ</Text>
          <Menu
            visible={serviceTypeMenuVisible}
            onDismiss={() => setServiceTypeMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setServiceTypeMenuVisible(true)}
                style={{ marginBottom: 12 }}
              >
                {isAtHome ? "🏠 Tại nhà" : "🏥 Tại cơ sở"}
              </Button>
            }
          >
            <Menu.Item
              title="🏠 Tại nhà"
              onPress={() => {
                setIsAtHome(true);
                setServiceTypeMenuVisible(false);
              }}
            />
            <Menu.Item
              title="🏥 Tại cơ sở"
              onPress={() => {
                setIsAtHome(false);
                setServiceTypeMenuVisible(false);
              }}
            />
          </Menu>

          <Text style={[styles.label, { marginBottom: 8 }]}>
            Lọc trạng thái
          </Text>
          {isLoadingStatus ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setStatusMenuVisible(true)}
                  style={{ marginBottom: 12 }}
                  disabled={statusListData.length === 0}
                >
                  {selectedStatus
                    ? statusListData.find((s) => s._id === selectedStatus)
                        ?.testRequestStatus
                    : "Chọn trạng thái"}
                </Button>
              }
            >
              {statusListData.length === 0 ? (
                <Menu.Item title="Không có trạng thái" disabled />
              ) : (
                statusListData.map((status) => (
                  <Menu.Item
                    key={status._id}
                    title={status.testRequestStatus}
                    onPress={() => {
                      setSelectedStatus(status._id);
                      setStatusMenuVisible(false);
                    }}
                  />
                ))
              )}
            </Menu>
          )}
        </View>

        {isLoadingServices ? (
          <ActivityIndicator
            style={{ marginTop: 50 }}
            size="large"
            color="#fff"
          />
        ) : serviceCasesError ? (
          <Text style={[styles.emptyText, { color: "#BBDEFB" }]}>
            Không thể tải dữ liệu dịch vụ.
          </Text>
        ) : paginatedData.length === 0 ? (
          <Text style={[styles.emptyText, { color: "#BBDEFB" }]}>
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
                style={{ marginTop: 10 }}
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
              <Text style={{ color: "#000" }}>
                Trạng thái mới:{" "}
                <Text
                  style={{
                    fontWeight: "bold",
                    color: getStatusColor(
                      statusListData.find((s) => s._id === newStatusId)
                        ?.testRequestStatus || ""
                    ),
                  }}
                >
                  {
                    statusListData.find((s) => s._id === newStatusId)
                      ?.testRequestStatus
                  }
                </Text>
              </Text>
              <Text style={{ marginTop: 12, color: "red" }}>
                ⚠️ Việc cập nhật trạng thái không thể hoàn tác!
              </Text>

              <View style={styles.modalButtons}>
                <Button
                  mode="contained"
                  onPress={handleStatusUpdate}
                  loading={isUpdating}
                >
                  Xác nhận
                </Button>
                <Button
                  onPress={() => setUpdateModalVisible(false)}
                  style={{ marginLeft: 12 }}
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
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#BBDEFB",
    marginTop: 8,
  },
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: "#0b4c91",
  },
  idText: {
    fontFamily: "monospace",
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
    backgroundColor: "#004b91",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#BBDEFB",
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
