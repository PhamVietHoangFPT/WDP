const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔑 Helper: Lấy token & trả về header
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("Không tìm thấy userToken!");
  return { Authorization: `Bearer ${token}` };
};

// 🔍 Lấy tất cả dịch vụ
export const getAllServices = async () => {
  const response = await fetch(`${API_BASE_URL}/services`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách dịch vụ");
  return response.json();
};

// 🔍 Lấy chi tiết 1 dịch vụ theo ID
export const getServiceById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error(`Lỗi khi lấy dịch vụ ID: ${id}`);
  return response.json();
};

// ➕ Tạo mới dịch vụ
export const createService = async (data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Lỗi khi tạo dịch vụ");
  return response.json();
};

// ✏️ Cập nhật dịch vụ theo ID
export const updateService = async (id: string, data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Lỗi khi cập nhật dịch vụ ID: ${id}`);
  return response.json();
};

// ❌ Xoá dịch vụ theo ID
export const deleteService = async (id: string) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error(`Lỗi khi xoá dịch vụ ID: ${id}`);
  return response.json();
};
