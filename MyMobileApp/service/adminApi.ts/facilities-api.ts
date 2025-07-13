const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Tạo mới facility
export const createFacility = async (facilityData: any) => {
  const response = await fetch(`${API_BASE_URL}/facilities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(facilityData),
  });
  if (!response.ok) throw new Error("Lỗi khi tạo facility");
  return response.json();
};

// Lấy danh sách facilities
export const getFacilities = async () => {
  const response = await fetch(`${API_BASE_URL}/facilities`);
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách facilities");
  return response.json();
};

// Lấy facility theo ID
export const getFacilityById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/facilities/${id}`);
  if (!response.ok) throw new Error(`Lỗi khi lấy facility ID: ${id}`);
  return response.json();
};

// Cập nhật facility theo ID
export const updateFacility = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Lỗi khi cập nhật facility ID: ${id}`);
  return response.json();
};

// Xoá facility theo ID
export const deleteFacility = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Lỗi khi xoá facility ID: ${id}`);
  return response.json();
};
