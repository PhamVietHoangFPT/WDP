const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
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

// Tạo lịch sử thanh toán dịch vụ (Service Payment History)
export const createServicePaymentHistory = async (data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/payments/service-case`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Lỗi khi tạo lịch sử thanh toán dịch vụ");
  return response.json();
};

// Lấy danh sách thanh toán của người dùng
export const getMyPayments = async () => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/payments`, {
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

export const getTestRequestHistories = async (params: {
  accountId: string;
  serviceCaseId: string;
  pageNumber?: number;
  pageSize?: number;
}) => {
  const headers = await getAuthHeader();

  // Tạo query string từ params
  const query = new URLSearchParams();

  query.append("accountId", params.accountId);
  query.append("serviceCaseId", params.serviceCaseId);
  if (params.pageNumber !== undefined)
    query.append("pageNumber", params.pageNumber.toString());
  if (params.pageSize !== undefined)
    query.append("pageSize", params.pageSize.toString());

  const response = await fetch(
    `${API_BASE_URL}/test-request-histories?${query.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );

  if (!response.ok) throw new Error("Không thể lấy lịch sử xét nghiệm ADN.");
  return response.json();
};
