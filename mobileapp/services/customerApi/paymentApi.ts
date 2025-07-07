import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper: Lấy header có token
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("Không tìm thấy token!");
  return { Authorization: `Bearer ${token}` };
};

// Tạo thanh toán mới
export const createPayment = async (data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Lỗi khi tạo thanh toán");
  return response.json();
};

// Lấy danh sách thanh toán của người dùng
export const getMyPayments = async () => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/payments/my`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!response.ok) throw new Error("Không thể lấy danh sách thanh toán");
  return response.json();
};

// Lấy chi tiết thanh toán theo ID
export const getPaymentById = async (id: string) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!response.ok) throw new Error("Không thể lấy thông tin thanh toán");
  return response.json();
};
