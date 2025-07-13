import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import blogAPI from "@/service/customerApi/blog-api";

interface Blog {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  image?: { url: string }[];
  created_by?: { name: string };
}

export default function BlogScreen() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await blogAPI.getBlogs();
        setBlogs(res.data); // ✅ Lấy đúng mảng blog
      } catch (e) {
        Alert.alert("Lỗi", "Không thể tải danh sách blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <LinearGradient colors={["#001f3f", "#0074D9"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Tin tức</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : blogs.length > 0 ? (
          <View>
            {/* Featured Blog */}
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() =>
                router.push({
                  pathname: "/blog/blog-detal",
                  params: { blogId: blogs[0]._id },
                })
              }
            >
              {blogs[0].image?.[0]?.url ? (
                <Image
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_API_URL}${blogs[0].image[0].url}`,
                  }}
                  style={styles.featuredImage}
                />
              ) : null}
              <View style={styles.featuredOverlay}>
                <Text style={styles.featuredTitle}>{blogs[0].title}</Text>
                <Text style={styles.featuredMeta}>
                  by {blogs[0].created_by?.name || "Ẩn danh"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Recent List */}
            <Text style={styles.recentTitle}>Bài viết gần đây</Text>
            {blogs.slice(1).map((blog) => (
              <TouchableOpacity
                key={blog._id}
                style={styles.recentCard}
                onPress={() =>
                  router.push({
                    pathname: "/blog/blog-detal",
                    params: { blogId: blog._id },
                  })
                }
              >
                <View style={styles.recentInfo}>
                  <Text style={styles.recentTitleText}>{blog.title}</Text>
                  <Text style={styles.recentDate}>
                    {formatDate(blog.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Chưa có bài blog nào.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 120 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  featuredImage: {
    width: "100%",
    height: 180,
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  featuredMeta: {
    color: "#ccc",
    fontSize: 13,
    marginTop: 4,
  },
  recentTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  recentCard: {
    paddingVertical: 12,
    borderBottomColor: "#ccc",
    borderBottomWidth: 0.3,
  },
  recentInfo: {
    justifyContent: "center",
  },
  recentTitleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  recentDate: {
    color: "#ccc",
    fontSize: 13,
    marginTop: 4,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
