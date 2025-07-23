import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("Không tìm thấy token!");
  return { Authorization: `Bearer ${token}` };
};

// POST /addresses -> Tạo địa chỉ mới cho người dùng
export const createAddress = async (data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Lỗi khi tạo địa chỉ");
  return response.json();
};

// GET /addresses -> Lấy tất cả địa chỉ
export const getAddresses = async () => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/addresses`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách địa chỉ");
  return response.json();
};

// GET /addresses/default -> Lấy địa chỉ mặc định của tài khoản
export const getDefaultAddress = async () => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/addresses/default`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error("Lỗi khi lấy địa chỉ mặc định");
  return response.json();
};

// GET /addresses/{id} -> Lấy địa chỉ theo ID
export const getAddressById = async (id: string) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error(`Lỗi khi lấy địa chỉ ID: ${id}`);
  return response.json();
};

// PATCH /addresses/{id} -> Cập nhật địa chỉ cá nhân theo ID
export const updateAddress = async (id: string, data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Lỗi khi cập nhật địa chỉ ID: ${id}`);
  return response.json();
};

// DELETE /addresses/{id} -> Xóa địa chỉ theo ID
export const deleteAddress = async (id: string) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error(`Lỗi khi xóa địa chỉ ID: ${id}`);
  return response.json();
};

// PATCH /addresses/default/{addressId} -> Cập nhật địa chỉ mặc định
export const setDefaultAddress = async (addressId: string) => {
  const headers = await getAuthHeader();
  const response = await fetch(
    `${API_BASE_URL}/addresses/default/${addressId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );
  if (!response.ok) throw new Error("Lỗi khi cập nhật địa chỉ mặc định");
  return response.json();
};
