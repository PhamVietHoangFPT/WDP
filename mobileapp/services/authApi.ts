// services/authApi.ts
import { API_BASE_URL } from "@env";

interface LoginDataItem {
  accessToken: string; // <-- Đảm bảo đây là string
  // Thêm các trường khác nếu có trong đối tượng bên trong mảng data
}

interface LoginResponse {
  data: LoginDataItem[]; // <--- Thay đổi từ 'any' thành 'LoginDataItem[]'
  success: boolean;
  message: string;
  statusCode: number;
}

/**
 * Hàm thực hiện yêu cầu đăng nhập đến API.
 * @param email Email của người dùng.
 * @param password Mật khẩu của người dùng.
 * @returns Promise<LoginResponse> Phản hồi từ API.
 * @throws Error Nếu có lỗi trong quá trình kết nối hoặc phản hồi API.
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const url = `${API_BASE_URL}/auth/login`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Thêm log ở đây để đảm bảo response.json() trả về đúng cấu trúc mong muốn
    const rawResult = await response.json();
    console.log("authApi.ts - Raw API response:", rawResult);

    const result: LoginResponse = rawResult; // Gán trực tiếp sau khi kiểm tra rawResult

    if (!response.ok) {
      throw new Error(
        result.message || `API request failed with status ${response.status}`
      );
    }

    return result;
  } catch (error) {
    console.error("Lỗi khi gọi API đăng nhập trong authApi.ts:", error);
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
  }
};
