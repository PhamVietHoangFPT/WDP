const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Tạo mới mẫu thử
export const createSample = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/samples`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Lỗi khi tạo mẫu thử");
  return response.json();
};

// Lấy tất cả các loại mẫu thử
export const getSamples = async () => {
  const response = await fetch(`${API_BASE_URL}/samples`);
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách mẫu thử");
  return response.json();
};

// Lấy chi tiết mẫu thử theo ID
export const getSampleById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/samples/${id}`);
  if (!response.ok) throw new Error(`Lỗi khi lấy mẫu thử ID: ${id}`);
  return response.json();
};

// Cập nhật mẫu thử theo ID
export const updateSample = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/samples/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Lỗi khi cập nhật mẫu thử ID: ${id}`);
  return response.json();
};

// Xoá mẫu thử theo ID
export const deleteSample = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/samples/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Lỗi khi xoá mẫu thử ID: ${id}`);
  return response.json();
};
