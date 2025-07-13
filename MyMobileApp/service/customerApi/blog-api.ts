import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Helper: Lấy header có token
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("Không tìm thấy token!");
  return { Authorization: `Bearer ${token}` };
};

const blogAPI = {
  // Lấy danh sách blog
  getBlogs: async () => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/blogs`, { headers });
    if (!res.ok) throw new Error("Lỗi khi lấy danh sách blog");
    return res.json();
  },

  // Lấy blog theo ID
  getBlogById: async (id: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/blogs/${id}`, { headers });
    if (!res.ok) throw new Error("Lỗi khi lấy chi tiết blog");
    return res.json();
  },

  // Tạo blog
  createBlog: async (data: any) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/blogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Lỗi khi tạo blog");
    return res.json();
  },

  // Cập nhật blog
  updateBlog: async (id: string, data: any) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Lỗi khi cập nhật blog");
    return res.json();
  },

  // Xoá blog
  deleteBlog: async (id: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Lỗi khi xoá blog");
    return res.json();
  },
};

export default blogAPI;
