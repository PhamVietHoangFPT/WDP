import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import * as Linking from "expo-linking";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const router = useRouter();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Hàm xử lý deep link
    const handleDeepLink = ({ url }: { url: string }) => {
      const { path, queryParams } = Linking.parse(url);

      if (path === "payment-success") {
        // Điều hướng đến trang payment-success với các param query
        router.push({
          pathname: "/(tabs)/booking/payment-success",
          params: queryParams,
        });
      }

      // Thêm các xử lý path khác nếu cần
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Xử lý trường hợp app mới khởi động từ deep link (cold start)
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    })();

    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
