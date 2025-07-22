import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("Không tìm thấy token!");
  return { Authorization: `Bearer ${token}` };
};

const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  const headers = await getAuthHeader();
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...headers,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    let errorMessage = `Lỗi HTTP ${response.status}`;
    try {
      const errData = await response.json();
      if (errData?.message) errorMessage = errData.message;
    } catch {
      // Ignore lỗi parse JSON
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// Lấy danh sách trạng thái hồ sơ dịch vụ
export const getServiceCaseStatusList = async (
  pageNumber = 1,
  pageSize = 100
) => {
  const url = new URL(`${API_BASE_URL}/sample-collector/service-case-status`);
  url.searchParams.append("pageNumber", pageNumber.toString());
  url.searchParams.append("pageSize", pageSize.toString());

  return fetchWithAuth(url.toString());
};

// Lấy danh sách hồ sơ dịch vụ theo trạng thái và isAtHome
export const getAllServiceCases = async (
  serviceCaseStatus: string,
  isAtHome: boolean
) => {
  const url = new URL(`${API_BASE_URL}/sample-collector/service-cases`);
  url.searchParams.append("serviceCaseStatus", serviceCaseStatus);
  url.searchParams.append("isAtHome", isAtHome.toString());

  return fetchWithAuth(url.toString());
};

// Cập nhật trạng thái hồ sơ dịch vụ
export const updateServiceCaseStatus = async (
  id: string,
  currentStatus: string
) => {
  if (!id) throw new Error("ID hồ sơ dịch vụ không được để trống");
  if (!currentStatus) throw new Error("Trạng thái mới không được để trống");

  const url = `${API_BASE_URL}/service-cases/${id}/status/${currentStatus}`;

  return fetchWithAuth(url, {
    method: "PATCH",
  });
};
