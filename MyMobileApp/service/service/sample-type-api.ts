// services/sampleTypeApi.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export interface SampleType {
  _id?: string;
  name: string;
  sampleTypeFee: number;
  created_by?: string;
}

// Lấy tất cả sample types
export const getSampleTypes = async (): Promise<SampleType[]> => {
  const response = await fetch(`${API_BASE_URL}/sample-types`);
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách sample types");
  return response.json();
};

// Lấy sample type theo ID
export const getSampleTypeById = async (id: string): Promise<SampleType> => {
  const response = await fetch(`${API_BASE_URL}/sample-types/${id}`);
  if (!response.ok)
    throw new Error(`Lỗi khi lấy thông tin sample type ID: ${id}`);
  return response.json();
};

// Tạo sample type mới
export const createSampleType = async (data: SampleType) => {
  const response = await fetch(`${API_BASE_URL}/sample-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Lỗi khi tạo sample type");
  return response.json();
};

// Cập nhật sample type theo ID
export const updateSampleType = async (id: string, data: SampleType) => {
  const response = await fetch(`${API_BASE_URL}/sample-types/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Lỗi khi cập nhật sample type ID: ${id}`);
  return response.json();
};

// Xóa sample type theo ID
export const deleteSampleType = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/sample-types/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Lỗi khi xoá sample type ID: ${id}`);
  return response.json();
};
