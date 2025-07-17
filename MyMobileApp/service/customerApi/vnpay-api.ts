import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("Không tìm thấy token!");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// 1. Lấy danh sách ngân hàng
export const getVNPayBanks = async () => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/vnpay/banks`, {
    method: "GET",
    headers,
  });

  if (!response.ok) throw new Error("Không thể lấy danh sách ngân hàng");
  return response.json();
};

// 2. Tạo URL thanh toán (generic)
export const createVNPayPaymentURL = async (data: {
  amount: number;
  description: string;
  orderId: string;
}) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/vnpay/payment-url`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Không thể tạo liên kết thanh toán VNPay");
  return response.json();
};

// 3. Tạo URL thanh toán cho đơn dịch vụ
export const createVNPayServicePayment = async (data: {
  serviceCaseId: string; // ✅ đổi tên từ orderId sang serviceCaseId
  amount: number;
  description?: string;
}) => {
  const headers = await getAuthHeader();
  const response = await fetch(
    `${API_BASE_URL}/vnpay/payment-for-service-case-mobile`,
    {
      method: "POST",
      headers: {
        ...headers, // Authorization trước
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) throw new Error("Không thể tạo thanh toán VNPay.");
  return response.json();
};

// 4. Truy vấn trạng thái giao dịch VNPay
export const getVNPayTransactionStatus = async (orderId: string) => {
  const headers = await getAuthHeader();
  const response = await fetch(
    `${API_BASE_URL}/payments/vnpay/status/${orderId}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) throw new Error("Không thể lấy trạng thái giao dịch VNPay");
  return response.json();
};
