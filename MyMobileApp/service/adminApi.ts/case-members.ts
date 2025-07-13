import AsyncStorage from "@react-native-async-storage/async-storage";
// caseMembers.ts - Phiên bản cho mobile (React Native)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("Không tìm thấy token!");
  return { Authorization: `Bearer ${token}` };
};

export const getCaseMembers = async () => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/case-members`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách case members");
  return response.json();
};

export const createCaseMember = async (data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/case-members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Lỗi khi tạo case member");
  return response.json();
};

export const getCaseMemberById = async (id: string) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/case-members/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error(`Lỗi khi lấy case member ID: ${id}`);
  return response.json();
};

export const updateCaseMember = async (id: string, data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/case-members/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Lỗi khi cập nhật case member ID: ${id}`);
  return response.json();
};
