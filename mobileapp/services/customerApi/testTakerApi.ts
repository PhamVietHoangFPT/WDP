import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper thêm header token
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("Không tìm thấy token!");
  return { Authorization: `Bearer ${token}` };
};

// Tạo test taker
export const createTestTaker = async (data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/test-takers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Lỗi khi tạo test taker");
  return response.json();
};

// Lấy danh sách test takers
export const getTestTakers = async () => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/test-takers`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách test takers");
  return response.json();
};

// ✅ Lấy chi tiết test taker - ĐÃ FIX
export const getTestTakerById = async (id: string) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/test-takers/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!response.ok) throw new Error(`Lỗi khi lấy test taker ID: ${id}`);
  const json = await response.json();

  // ✅ Trả về phần tử đầu tiên trong data nếu là mảng
  if (Array.isArray(json.data)) {
    return json.data[0]; // 👈 Trả đúng object test taker
  }

  return json.data || null;
};

// Xoá test taker
export const deleteTestTaker = async (id: string) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/test-takers/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error(`Lỗi khi xoá test taker ID: ${id}`);
  return response.json();
};
