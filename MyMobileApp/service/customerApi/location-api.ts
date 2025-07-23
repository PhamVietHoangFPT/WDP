import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("Không tìm thấy token!");
  return { Authorization: `Bearer ${token}` };
};

// GET /location/provinces - lấy danh sách tỉnh, hỗ trợ paging và filter code
export const getProvinceList = async ({
  pageNumber = 1,
  pageSize = 100,
  code,
}: {
  pageNumber?: number;
  pageSize?: number;
  code?: string;
}) => {
  const url = new URL(`${API_BASE_URL}/location/provinces`);
  url.searchParams.append("pageNumber", pageNumber.toString());
  url.searchParams.append("pageSize", pageSize.toString());
  if (code) url.searchParams.append("code", code);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Lỗi khi lấy danh sách tỉnh");
  return response.json();
};

// GET /location/wards/{province_code} - lấy danh sách xã theo mã tỉnh, hỗ trợ paging
export const getWardList = async ({
  pageNumber = 1,
  pageSize = 100,
  province_code,
}: {
  pageNumber?: number;
  pageSize?: number;
  province_code: string;
}) => {
  const url = new URL(`${API_BASE_URL}/location/wards/${province_code}`);
  url.searchParams.append("pageNumber", pageNumber.toString());
  url.searchParams.append("pageSize", pageSize.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Lỗi khi lấy danh sách xã");
  return response.json();
};

// POST /addresses/for-facility - tạo địa chỉ cho facility
export const createFacilityAddress = async (data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/addresses/for-facility`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Lỗi khi tạo địa chỉ cho cơ sở");
  return response.json();
};

// PUT /facilities/address/{id} - cập nhật địa chỉ facility (toàn bộ)
export const updateAddressFacility = async (id: string, data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/facilities/address/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Lỗi khi cập nhật địa chỉ cơ sở");
  return response.json();
};

// PATCH /addresses/facility/{id} - cập nhật một phần địa chỉ facility
export const updateFullAddressFacility = async (id: string, data: any) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/addresses/facility/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Lỗi khi cập nhật một phần địa chỉ cơ sở");
  return response.json();
};
