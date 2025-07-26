import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "react-native-elements";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { getFacilities } from "@/service/adminApi.ts/facilities-api";
import { getTestTakers } from "@/service/customerApi/testTaker-api";
import { getSlots } from "@/service/adminApi.ts/slot-api";
import { createBooking } from "@/service/customerApi/booking-api";
import { createCaseMember } from "@/service/adminApi.ts/case-members";
import { createServiceCase } from "@/service/service/service-case-api";
import { createVNPayServicePayment } from "@/service/customerApi/vnpay-api";
import { getServiceById } from "@/service/service/service-api";
import { getAddresses } from "@/service/customerApi/address-api";
import { jwtDecode } from "jwt-decode";

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

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [feeConfirmed, setFeeConfirmed] = useState(false);

  // Load addresses
  const loadAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data || []);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách địa chỉ.");
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

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
  // Khi selectedAddressId thay đổi => tính lại khoảng cách facilities dựa trên tọa độ địa chỉ đã chọn
  useEffect(() => {
    if (!selectedAddressId || facilities.length === 0) {
      setSelectedFacility(null);
      return;
    }
    // Lấy tọa độ địa chỉ đã chọn
    const selectedAddress = addresses.find(
      (addr) => addr._id === selectedAddressId
    );
    if (!selectedAddress?.location?.coordinates) {
      setSelectedFacility(null);
      return;
    }
    const [addrLon, addrLat] = selectedAddress.location.coordinates;

    // Tính khoảng cách facility so với địa chỉ đã chọn
    const facilitiesWithDistance = facilities.map((facility) => {
      const lon = facility.address?.location?.coordinates?.[0];
      const lat = facility.address?.location?.coordinates?.[1];
      if (typeof lat === "number" && typeof lon === "number") {
        const distance = getDistanceFromLatLonInKm(addrLat, addrLon, lat, lon);
        return { ...facility, distance };
      }
      return { ...facility, distance: Infinity };
    });

    // Sắp xếp theo khoảng cách tăng dần
    facilitiesWithDistance.sort(
      (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
    );

    setFacilities(facilitiesWithDistance);

    // Set facility gần nhất làm facility mặc định
    if (facilitiesWithDistance.length > 0) {
      setSelectedFacility(facilitiesWithDistance[0]._id);
    } else {
      setSelectedFacility(null);
    }
  }, [selectedAddressId, addresses]);

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
    return (
      <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
        Bạn cần đăng nhập để sử dụng chức năng này.
      </Text>
    );
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

  const handleCalculateShippingFee = async () => {
    if (!selectedAddressId || !selectedFacility) {
      Alert.alert("Thông báo", "Vui lòng chọn địa chỉ và cơ sở.");
      return;
    }
    setIsCalculatingFee(true);
    try {
      // Lấy tọa độ địa chỉ đã chọn
      const userAddress = addresses.find(
        (addr) => addr._id === selectedAddressId
      );
      if (!userAddress?.location?.coordinates) {
        throw new Error("Địa chỉ chọn không có tọa độ.");
      }
      const [userLon, userLat] = userAddress.location.coordinates;

      // Lấy tọa độ cơ sở
      const facility = facilities.find((f) => f._id === selectedFacility);
      if (!facility?.address?.location?.coordinates) {
        throw new Error("Cơ sở không có tọa độ.");
      }
      const [facilityLon, facilityLat] = facility.address.location.coordinates;

      // Tính khoảng cách
      const distance = getDistanceFromLatLonInKm(
        userLat,
        userLon,
        facilityLat,
        facilityLon
      );

      // Tính phí (ví dụ: miễn phí 5km đầu, 10k/km tiếp theo)
      let fee = distance > 5 ? (distance - 5) * 10000 : 0;
      fee = Math.ceil(fee / 1000) * 1000; // Làm tròn lên 1000

      setShippingFee(fee);
      Alert.alert(
        "Thông báo",
        `Phí vận chuyển ước tính: ${fee.toLocaleString()} ₫`
      );
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể tính phí vận chuyển");
      setShippingFee(null);
    } finally {
      setIsCalculatingFee(false);
    }
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
      !selectedSlot ||
      !selectedAddressId
    ) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ tất cả các mục.");
      return;
    }

    if (!feeConfirmed) {
      Alert.alert("Thông báo", "Vui lòng xác nhận phí vận chuyển.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Tạo booking
      const bookingRes = await createBooking({
        slot: selectedSlot,
        account: accountId,
        address: selectedAddressId,
        note: "Đặt lịch hẹn xét nghiệm ADN tại nhà.",
        shippingFee,
      });
      const bookingId = bookingRes?.data?._id || bookingRes?._id;
      if (!bookingId) throw new Error("Không thể tạo lịch hẹn.");

      // Lấy thông tin dịch vụ
      const serviceInfo = await getServiceById(serviceId);
      const isAdministration = serviceInfo?.data?.isAdministration ?? false;

      // Tạo case member
      const caseMemberRes = await createCaseMember({
        testTaker: finalTestTakers,
        booking: bookingId,
        service: serviceId,
        address: selectedAddressId,
        note: "",
        isAtHome: !isAdministration,
        isSelfSampling: false,
      });
      const caseMemberId = caseMemberRes?.data?._id || caseMemberRes?._id;
      if (!caseMemberId) throw new Error("Không thể tạo hồ sơ xét nghiệm.");

      // Tạo service case
      const serviceCaseRes = await createServiceCase({
        caseMember: caseMemberId,
        shippingFee: shippingFee,
      });
      const serviceCaseId = serviceCaseRes?.data?._id || serviceCaseRes?._id;
      if (!serviceCaseId) throw new Error("Không thể tạo đơn dịch vụ.");

      // // Tạo link thanh toán VNPAY
      // const paymentResponse = await createVNPayServicePayment({
      //   serviceCaseId,
      //   amount: 10000,
      //   description: "Thanh toán dịch vụ tại nhà",
      // });
      // Tính tổng tiền = giá dịch vụ + phí vận chuyển
      const servicePrice = serviceInfo?.data?.fee ?? 0;
      const totalAmount = servicePrice + (shippingFee || 0);

      // Tạo link thanh toán VNPAY với tổng tiền
      const paymentResponse = await createVNPayServicePayment({
        serviceCaseId,
        amount: totalAmount,
        description: `Thanh toán dịch vụ tại nhà (bao gồm phí ship)`,
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
            { paddingBottom: styles.scroll.paddingBottom },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Đăng Ký Dịch Vụ Tại Nhà</Text>

          <Text style={styles.section}>Chọn địa chỉ của bạn</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedAddressId}
              onValueChange={(value) => {
                setSelectedAddressId(value);
                setFeeConfirmed(false);
                setShippingFee(null);
              }}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="-- Chọn địa chỉ --" value={null} />
              {addresses.map((addr) => (
                <Picker.Item
                  key={addr._id}
                  label={addr.fullAddress}
                  value={addr._id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.section}>1. Chọn cơ sở</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedFacility}
              onValueChange={(value) => handleFacilityChange(value)}
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
            title="Tính phí vận chuyển"
            onPress={handleCalculateShippingFee}
            disabled={
              isCalculatingFee || !selectedAddressId || !selectedFacility
            }
          />

          {shippingFee !== null && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Text style={{ color: "#fff" }}>
                Phí vận chuyển: {shippingFee.toLocaleString()} ₫
              </Text>
              <TouchableOpacity
                onPress={() => setFeeConfirmed(!feeConfirmed)}
                style={{ marginLeft: 12 }}
              >
                <MaterialIcons
                  name={feeConfirmed ? "check-box" : "check-box-outline-blank"}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
              <Text style={{ color: "#fff", marginLeft: 6 }}>
                Xác nhận phí vận chuyển
              </Text>
            </View>
          )}

          <Button
            title="Đăng Ký và Thanh Toán"
            onPress={handleSubmit}
            disabled={!feeConfirmed || !selectedSlot || isSubmitting}
            loading={isSubmitting}
            style={{ marginTop: 20 }}
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
    marginBottom: 60,
    fontWeight: "bold",
  },
});
