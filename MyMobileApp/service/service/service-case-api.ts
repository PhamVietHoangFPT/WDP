const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Helper: Lấy header có userToken
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("Không tìm thấy userToken!");
  return { Authorization: `Bearer ${token}` };
};

// ➕ Tạo hồ sơ dịch vụ mới
export const createServiceCase = async (data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/service-cases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Lỗi khi tạo hồ sơ dịch vụ!");
  return response.json();
};

// 🔍 Lấy tất cả hồ sơ dịch vụ
export const getAllServiceCases = async (
  pageNumber = 1,
  pageSize = 5,
  currentStatus?: string | null
) => {
  const headers = await getAuthHeader();

  const params = new URLSearchParams();
  params.append("pageNumber", pageNumber.toString());
  params.append("pageSize", pageSize.toString());
  params.append("currentStatus", currentStatus ?? "null");

  const response = await fetch(
    `${API_BASE_URL}/service-cases?${params.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );

  if (!response.ok) throw new Error("Lỗi khi lấy danh sách hồ sơ dịch vụ!");
  return response.json();
};

// ✏️ Cập nhật trạng thái hồ sơ dịch vụ
export const updateServiceCaseStatus = async (
  id: string,
  currentStatus: string
) => {
  const headers = await getAuthHeader();
  const response = await fetch(
    `${API_BASE_URL}/service-cases/${id}/status/${currentStatus}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );

  if (!response.ok)
    throw new Error(`Lỗi khi cập nhật trạng thái hồ sơ dịch vụ ID: ${id}`);
  return response.json();
};

// 🧪 Tạo test service case
export const createServiceCaseTest = async (data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/service-cases/Test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Lỗi khi tạo service case test");
  return response.json();
};

export const getTestRequestHistories = async ({
  accountId,
  serviceCaseId,
  pageNumber = 1,
  pageSize = 10,
}: {
  accountId: string;
  serviceCaseId: string;
  pageNumber?: number;
  pageSize?: number;
}) => {
  const headers = await getAuthHeader();
  const url = new URL(`${API_BASE_URL}/test-request-histories`);
  url.searchParams.append("accountId", accountId);
  url.searchParams.append("serviceCaseId", serviceCaseId);
  url.searchParams.append("pageNumber", pageNumber.toString());
  url.searchParams.append("pageSize", pageSize.toString());

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!response.ok) throw new Error("Lỗi khi lấy lịch sử xét nghiệm ADN");
  return response.json();
};
