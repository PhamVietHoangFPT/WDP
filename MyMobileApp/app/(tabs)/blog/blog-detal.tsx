import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import blogAPI from "@/service/customerApi/blog-api";

interface BlogDetail {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  image?: { url: string }[];
  created_by?: { name: string };
}

export default function BlogDetailScreen() {
  const { blogId } = useLocalSearchParams<{ blogId: string }>();
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!blogId) return;
        const res = await blogAPI.getBlogById(blogId);
        setBlog(res);
      } catch (e) {
        Alert.alert("Lỗi", "Không thể tải chi tiết blog");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [blogId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : blog ? (
          <View>
            {blog.image?.[0]?.url && (
              <Image
                source={{
                  uri: `${process.env.EXPO_PUBLIC_API_URL}${blog.image[0].url}`,
                }}
                style={styles.coverImage}
              />
            )}
            <Text style={styles.title}>{blog.title}</Text>
            <Text style={styles.meta}>
              {blog.created_by?.name || "Ẩn danh"} -{" "}
              {formatDate(blog.createdAt)}
            </Text>
            <Text style={styles.content}>{blog.content}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>Không tìm thấy bài viết.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 120 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 30,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  coverImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  meta: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 24,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
