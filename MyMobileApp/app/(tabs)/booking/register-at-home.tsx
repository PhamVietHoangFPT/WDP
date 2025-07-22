import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "react-native-elements";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { jwtDecode } from "jwt-decode";
import { getFacilities } from "@/service/adminApi.ts/facilities-api";
import { getTestTakers } from "@/service/customerApi/testTaker-api";
import { getSlots } from "@/service/adminApi.ts/slot-api";
import { createBooking } from "@/service/customerApi/booking-api";
import { createCaseMember } from "@/service/adminApi.ts/case-members";
import { createServiceCase } from "@/service/service/service-case-api";
import { createVNPayServicePayment } from "@/service/customerApi/vnpay-api";
import { getServiceById } from "@/service/service/service-api";
import { Ionicons } from "@expo/vector-icons";
import NotLoggedIn from "@/app/NotLoggedIn";

// Hàm tính khoảng cách km giữa 2 điểm kinh độ vĩ độ
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface TokenPayload {
  id: string;
}

const getAccountIdFromToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return null;
    const decoded: TokenPayload = jwtDecode(token);
    return decoded.id;
  } catch {
    return null;
  }
};

interface Facility {
  _id: string;
  facilityName: string;
  address?: {
    location?: {
      coordinates?: [number, number]; // [lon, lat]
    };
  };
  distance?: number;
}

interface TestTaker {
  _id: string;
  name: string;
}

interface Slot {
  _id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export default function RegisterServiceAtHome() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams() as { serviceId: string };

  const tabBarHeight = useBottomTabBarHeight();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [availableTestTakers, setAvailableTestTakers] = useState<TestTaker[]>(
    []
  );
  const [slots, setSlots] = useState<Slot[]>([]);

  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [testTakerCount, setTestTakerCount] = useState(2);
  const [selectedTestTakers, setSelectedTestTakers] = useState<{
    [key: string]: string | null;
  }>({
    taker1: null,
    taker2: null,
    taker3: null,
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  // Lấy vị trí user
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cấp quyền thất bại",
          "Vui lòng cấp quyền vị trí để sử dụng tính năng này."
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Lấy data facilities và test takers, tính khoảng cách
  useEffect(() => {
    const fetchData = async () => {
      const accountId = await getAccountIdFromToken();
      if (!accountId) {
        setHasToken(false);
        return;
      }
      setHasToken(true);

      try {
        const [facilitiesRes, testTakersRes] = await Promise.all([
          getFacilities(),
          getTestTakers(accountId),
        ]);

        const facilitiesWithDistance = (facilitiesRes.data || []).map(
          (facility: Facility) => {
            const lon = facility.address?.location?.coordinates?.[0];
            const lat = facility.address?.location?.coordinates?.[1];
            if (
              userLocation &&
              typeof lat === "number" &&
              typeof lon === "number"
            ) {
              const distance = getDistanceFromLatLonInKm(
                userLocation.latitude,
                userLocation.longitude,
                lat,
                lon
              );
              return { ...facility, distance };
            }
            return facility;
          }
        );

        // Sắp xếp theo khoảng cách tăng dần, facilities không có distance được đẩy cuối
        facilitiesWithDistance.sort((a, b) => {
          if (typeof a.distance !== "number") return 1;
          if (typeof b.distance !== "number") return -1;
          return a.distance - b.distance;
        });

        setFacilities(facilitiesWithDistance);

        setAvailableTestTakers(testTakersRes.data || []);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải dữ liệu cần thiết.");
      }
    };
    fetchData();
  }, [userLocation]);

  // Cập nhật lại khoảng cách khi userLocation thay đổi
  useEffect(() => {
    if (!userLocation || facilities.length === 0) return;

    const updatedFacilities = facilities.map((facility) => {
      const lon = facility.address?.location?.coordinates?.[0];
      const lat = facility.address?.location?.coordinates?.[1];
      if (typeof lat === "number" && typeof lon === "number") {
        const distance = getDistanceFromLatLonInKm(
          userLocation.latitude,
          userLocation.longitude,
          lat,
          lon
        );
        return { ...facility, distance };
      }
      return facility;
    });

    // Sắp xếp lại theo khoảng cách
    updatedFacilities.sort((a, b) => {
      if (typeof a.distance !== "number") return 1;
      if (typeof b.distance !== "number") return -1;
      return a.distance - b.distance;
    });

    setFacilities(updatedFacilities);
  }, [userLocation]);

  // Tự chọn facility gần nhất
  useEffect(() => {
    if (!userLocation || facilities.length === 0) return;

    let nearestFacility = facilities[0];
    let minDist = nearestFacility.distance ?? Infinity;

    for (let i = 1; i < facilities.length; i++) {
      const facility = facilities[i];
      if ((facility.distance ?? Infinity) < minDist) {
        minDist = facility.distance ?? Infinity;
        nearestFacility = facility;
      }
    }
    if (nearestFacility._id !== selectedFacility) {
      setSelectedFacility(nearestFacility._id);
    }
  }, [userLocation, facilities]);

  if (hasToken === false) {
    return <NotLoggedIn />;
  }

  // Handlers
  const handleFacilityChange = (facilityId: string | null) => {
    setSelectedFacility(facilityId);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
  };

  const handleDateSelect = async (day: { dateString: string }) => {
    if (!selectedFacility) {
      Alert.alert("Thông báo", "Vui lòng chọn cơ sở trước!");
      return;
    }
    setSelectedDate(day.dateString);
    setSelectedSlot(null);
    setLoadingSlots(true);
    setSlots([]);

    try {
      const res = await getSlots({
        facilityId: selectedFacility,
        startDate: day.dateString,
        endDate: day.dateString,
        isAvailable: true,
      });
      const slotsArray = Array.isArray(res) ? res : res.data;
      const filteredSlots = slotsArray.filter((slot: Slot) => !slot.isBooked);
      setSlots(filteredSlots);
    } catch {
      setSlots([]);
      Alert.alert("Lỗi", "Không có lịch trống hoặc không thể tải lịch.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTestTakerChange = (
    pickerName: string,
    takerId: string | null
  ) => {
    setSelectedTestTakers((prev) => ({ ...prev, [pickerName]: takerId }));
  };

  const getFilteredTakers = (currentPicker: string) => {
    const selectedIds = Object.values(selectedTestTakers).filter(
      (id) => id !== null
    );
    const currentSelection = selectedTestTakers[currentPicker];
    return availableTestTakers.filter(
      (taker) =>
        !selectedIds.includes(taker._id) || taker._id === currentSelection
    );
  };

  const handleSubmit = async () => {
    const accountId = await getAccountIdFromToken();
    if (!accountId) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để thực hiện chức năng này.");
      return;
    }

    const finalTestTakers = Object.values(selectedTestTakers).filter(
      (id) => id !== null
    );

    if (
      !selectedFacility ||
      finalTestTakers.length < 2 ||
      !selectedDate ||
      !selectedSlot
    ) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ tất cả các mục.");
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingRes = await createBooking({
        slot: selectedSlot,
        account: accountId,
        note: "Đặt lịch hẹn xét nghiệm ADN tại nhà.",
      });
      const bookingId = bookingRes?.data?._id || bookingRes?._id;
      if (!bookingId) throw new Error("Không thể tạo lịch hẹn.");

      const serviceInfo = await getServiceById(serviceId);
      const isAdministration = serviceInfo?.data?.isAdministration ?? false;

      const caseMemberRes = await createCaseMember({
        testTaker: finalTestTakers,
        booking: bookingId,
        service: serviceId,
        note: "",
        isAtHome: !isAdministration,
        isSelfSampling: false,
      });

      const caseMemberId = caseMemberRes?.data?._id || caseMemberRes?._id;
      if (!caseMemberId) throw new Error("Không thể tạo hồ sơ xét nghiệm.");

      const serviceCaseRes = await createServiceCase({
        caseMember: caseMemberId,
      });
      const serviceCaseId = serviceCaseRes?.data?._id || serviceCaseRes?._id;
      if (!serviceCaseId) throw new Error("Không thể tạo đơn dịch vụ.");

      const paymentResponse = await createVNPayServicePayment({
        serviceCaseId,
        amount: 10000,
        description: "Thanh toán dịch vụ tại nhà",
      });

      const paymentUrl = paymentResponse?.redirectUrl;
      if (!paymentUrl) throw new Error("Không thể tạo liên kết thanh toán.");

      const supported = await Linking.canOpenURL(paymentUrl);
      if (supported) {
        await Linking.openURL(paymentUrl);

        if (isAdministration) {
          Alert.alert(
            "Lưu ý",
            "Dịch vụ hành chính yêu cầu bạn phải đến cơ sở gần nhất để xét nghiệm."
          );
        }

        router.back();
      } else {
        throw new Error("Không thể mở liên kết thanh toán.");
      }
    } catch (err: any) {
      Alert.alert(
        "Đăng ký thất bại",
        err.message || "Đã có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: styles.scroll.paddingBottom + tabBarHeight },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Đăng Ký Dịch Vụ Tại Nhà</Text>

          <Text style={styles.section}>1. Chọn cơ sở</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedFacility}
              onValueChange={handleFacilityChange}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="-- Chọn cơ sở --" value={null} />
              {facilities.map((facility) => (
                <Picker.Item
                  key={facility._id}
                  label={
                    typeof facility.distance === "number" &&
                    !isNaN(facility.distance)
                      ? `${facility.facilityName} (~${facility.distance.toFixed(
                          1
                        )} km)`
                      : facility.facilityName
                  }
                  value={facility._id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.section}>2. Chọn người xét nghiệm</Text>
          {[...Array(testTakerCount)].map((_, index) => {
            const pickerName = `taker${index + 1}`;
            return (
              <View style={styles.pickerWrapper} key={pickerName}>
                <Picker
                  selectedValue={selectedTestTakers[pickerName]}
                  onValueChange={(itemValue) =>
                    handleTestTakerChange(pickerName, itemValue)
                  }
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item
                    label={`-- Chọn người xét nghiệm ${index + 1} --`}
                    value={null}
                  />
                  {getFilteredTakers(pickerName).map((taker) => (
                    <Picker.Item
                      key={taker._id}
                      label={taker.name}
                      value={taker._id}
                    />
                  ))}
                </Picker>
              </View>
            );
          })}
          <View style={styles.buttonContainer}>
            {testTakerCount < 3 ? (
              <Button
                title="Thêm người"
                type="outline"
                buttonStyle={styles.actionButton}
                titleStyle={{ color: "#fff" }}
                onPress={() => setTestTakerCount(3)}
              />
            ) : (
              <Button
                title="Bớt người"
                type="outline"
                buttonStyle={{ ...styles.actionButton, ...styles.dangerButton }}
                titleStyle={{ color: "#fff" }}
                onPress={() => {
                  setTestTakerCount(2);
                  handleTestTakerChange("taker3", null);
                }}
              />
            )}
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.section}>3. Chọn ngày & lịch trống</Text>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={
                selectedDate
                  ? {
                      [selectedDate]: {
                        selected: true,
                        selectedColor: "#FF851B",
                      },
                    }
                  : {}
              }
              minDate={new Date().toISOString().split("T")[0]}
              theme={{
                calendarBackground: "#0074D9",
                dayTextColor: "#fff",
                todayTextColor: "#FFDC00",
                monthTextColor: "#fff",
                arrowColor: "#fff",
                textDisabledColor: "#ccc",
              }}
            />

            <Text style={styles.section}>Lịch trống</Text>
            <View style={{ minHeight: 100, marginBottom: 20 }}>
              {loadingSlots ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : slots.length > 0 ? (
                slots.map((slot) => (
                  <TouchableOpacity
                    key={slot._id}
                    onPress={() => setSelectedSlot(slot._id)}
                  >
                    <View
                      style={[
                        styles.card,
                        selectedSlot === slot._id && styles.selectedCard,
                      ]}
                    >
                      <Text style={styles.cardText}>
                        {slot.startTime} - {slot.endTime}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : selectedDate ? (
                <Text style={styles.noSlotText}>Không có slot trống nào</Text>
              ) : (
                <Text style={styles.noSlotText}>Hãy chọn ngày để xem lịch</Text>
              )}
            </View>
          </View>

          <Button
            title="Đăng Ký và Thanh Toán"
            onPress={handleSubmit}
            buttonStyle={styles.submitButton}
            disabled={isSubmitting || !selectedSlot}
            loading={isSubmitting}
          />
          <Text style={styles.footerText}>
            * Dịch vụ tại nhà chỉ áp dụng cho mục đích dân sự.
          </Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 20 },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    fontSize: 20,
    color: "#BBDEFB",
    marginVertical: 12,
    fontWeight: "600",
  },
  pickerWrapper: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    color: "#000",
  },
  picker: { color: "#000", height: 50 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 10,
  },
  actionButton: {
    borderColor: "#fff",
    borderWidth: 1,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  dangerButton: {
    borderColor: "#FF4136",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#FF851B",
    backgroundColor: "rgba(255, 133, 27, 0.3)",
  },
  cardText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  noSlotText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
    fontStyle: "italic",
  },
  submitButton: {
    backgroundColor: "#FF4136",
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  footerText: {
    color: "#BBDEFB",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 15,
  },
});
