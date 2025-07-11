import { API_BASE_URL } from "@env";

// ==================== SLOT APIs ====================

// Lấy danh sách slots (hỗ trợ filter)
export const getSlots = async ({
  facilityId,
  startDate,
  endDate,
  isAvailable,
}: {
  facilityId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isAvailable: boolean;
}) => {
  const params = new URLSearchParams({
    facilityId,
    startDate,
    endDate,
    isAvailable: isAvailable.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/slots?${params.toString()}`);
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách slots");
  return response.json();
};

// Lấy chi tiết slot theo ID
export const getSlotById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/slots/${id}`);
  if (!response.ok) throw new Error(`Lỗi khi lấy slot ID: ${id}`);
  return response.json();
};

// Đặt slot (nếu backend hỗ trợ)
export const bookSlot = async (slotId: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/slots/${slotId}/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Lỗi khi đặt slot ID: ${slotId}`);
  return response.json();
};

// ==================== SLOT TEMPLATE APIs ====================

// Tạo mẫu khung giờ mới
export const createSlotTemplate = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/slotTemplates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Lỗi khi tạo slot template");
  return response.json();
};

// Lấy danh sách slot templates
export const getSlotTemplates = async () => {
  const response = await fetch(`${API_BASE_URL}/slotTemplates`);
  if (!response.ok) throw new Error("Lỗi khi lấy danh sách slot templates");
  return response.json();
};

// Lấy thông tin slot template theo ID
export const getSlotTemplateById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/slotTemplates/${id}`);
  if (!response.ok) throw new Error(`Lỗi khi lấy slot template ID: ${id}`);
  return response.json();
};

// Cập nhật slot template theo ID
export const updateSlotTemplate = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/slotTemplates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Lỗi khi cập nhật slot template ID: ${id}`);
  return response.json();
};

// Xóa slot template theo ID
export const deleteSlotTemplate = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/slotTemplates/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Lỗi khi xóa slot template ID: ${id}`);
  return response.json();
};

// Lấy danh sách slot templates theo Facility ID
export const getSlotTemplatesByFacility = async (facilityId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/slot-templates/facility/${facilityId}`
  );
  if (!response.ok)
    throw new Error(
      `Lỗi khi lấy slot templates cho Facility ID: ${facilityId}`
    );
  return response.json();
};
