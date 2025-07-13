const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lấy header có token
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("Không tìm thấy token!");
  return { Authorization: `Bearer ${token}` };
};

export const createVNPayPayment = async (data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/payments/vnpay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Lỗi khi tạo thanh toán VNPay");
  return response.json();
};

export const getVNPayTransactionStatus = async (orderId: string) => {
  const headers = await getAuthHeader();
  const response = await fetch(
    `${API_BASE_URL}/payments/vnpay/status/${orderId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );

  if (!response.ok) throw new Error("Không thể lấy trạng thái giao dịch VNPay");
  return response.json();
};
