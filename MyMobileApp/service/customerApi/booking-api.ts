const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper lấy token
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("Không tìm thấy token!");
  return { Authorization: `Bearer ${token}` };
};

// Tạo booking mới
export const createBooking = async (bookingData: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(bookingData),
  });
  if (!response.ok) throw new Error("Lỗi khi tạo booking");
  return response.json();
};

// Lấy danh sách tất cả bookings
export const getBookings = async () => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách bookings");
  return response.json();
};

// Lấy thông tin booking theo ID
export const getBookingById = async (id: string) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error(`Lỗi khi lấy booking với ID: ${id}`);
  return response.json();
};

// Cập nhật slot mới cho booking
export const changeBookingSlot = async (id: string, slotId: string) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/bookings/change-slot/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ slotId }),
  });
  if (!response.ok) throw new Error(`Lỗi khi đổi slot booking ID: ${id}`);
  return response.json();
};
