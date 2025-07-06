import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "react-native-elements";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";

import { getFacilities } from "../../services/adminApi.ts/facilitiesApi";
import { getSlots } from "../../services/adminApi.ts/slotApi";

interface Facility {
  _id: string;
  facilityName: string;
}

interface Slot {
  _id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  slotTemplate: string;
}

export default function Booking() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await getFacilities();
        setFacilities(res.data || []);
      } catch (error) {
        console.error("Lỗi khi load facilities:", error);
      }
    };
    fetchFacilities();
  }, []);

  const handleFacilityChange = (facilityId: string) => {
    setSelectedFacility(facilityId);
    setSelectedDate(null);
    setSlots([]);
  };

  const handleDateSelect = async (day: { dateString: string }) => {
    if (!selectedFacility) {
      Alert.alert("Thông báo", "Vui lòng chọn cơ sở trước!");
      return;
    }

    setSelectedDate(day.dateString);
    setLoading(true);
    setSlots([]); // ✅ Clear old slots when selecting new date

    try {
      const res = await getSlots({
        facilityId: selectedFacility,
        startDate: day.dateString,
        endDate: day.dateString,
        isAvailable: true,
      });

      const slotsArray = Array.isArray(res) ? res : res.data;
      const filtered = slotsArray.filter((slot: Slot) => !slot.isBooked);
      setSlots(filtered);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.log("Không có slot nào cho ngày này");
        setSlots([]); // ensure reset
      } else {
        console.error("Lỗi khi load slot:", error);
        Alert.alert("Lỗi", "Không thể tải lịch. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 }]}
      >
        <Text style={styles.title}>Đặt lịch</Text>

        <Text style={styles.section}>Chọn cơ sở</Text>
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
                label={facility.facilityName}
                value={facility._id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.section}>Chọn ngày</Text>
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

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : slots.length > 0 ? (
          slots.map((slot) => (
            <View key={slot._id} style={styles.card}>
              <Text style={styles.cardTitle}>
                Ngày: {slot.slotDate.slice(0, 10)}
              </Text>
              <Text style={styles.cardText}>
                Thời gian: {slot.startTime} - {slot.endTime}
              </Text>
              <Button
                title="Đặt ngay"
                onPress={() => console.log("Đặt slot:", slot._id)}
                buttonStyle={styles.bookButton}
              />
            </View>
          ))
        ) : selectedDate ? (
          <Text style={styles.noSlotText}>Không có slot trống nào</Text>
        ) : (
          <Text style={styles.noSlotText}>Hãy chọn ngày để xem lịch</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24 },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    fontSize: 20,
    color: "#BBDEFB",
    marginVertical: 10,
    fontWeight: "600",
  },
  pickerWrapper: {
    backgroundColor: "#0074D9",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  picker: { color: "#000", height: 50 },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 16,
    color: "#BBDEFB",
    marginBottom: 12,
  },
  bookButton: { backgroundColor: "#FF4136" },
  noSlotText: { color: "#fff", fontSize: 16, marginVertical: 8 },
});
