import { API_BASE_URL } from "@env";

// Tạo booking mới
export const createBooking = async (bookingData: any) => {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });
  if (!response.ok) throw new Error("Lỗi khi tạo booking");
  return response.json();
};

// Lấy danh sách tất cả booking
export const getBookings = async () => {
  const response = await fetch(`${API_BASE_URL}/bookings`);
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách bookings");
  return response.json();
};

// Lấy thông tin booking theo ID
export const getBookingById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`);
  if (!response.ok) throw new Error(`Lỗi khi lấy booking với ID: ${id}`);
  return response.json();
};

// Cập nhật slot mới cho booking
export const changeBookingSlot = async (id: string, slotId: string) => {
  const response = await fetch(`${API_BASE_URL}/bookings/change-slot/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slotId }),
  });
  if (!response.ok) throw new Error(`Lỗi khi đổi slot booking ID: ${id}`);
  return response.json();
};
