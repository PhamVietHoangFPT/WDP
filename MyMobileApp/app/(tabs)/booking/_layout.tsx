// app/profile/_layout.tsx

import { Stack } from "expo-router";

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // bạn tự render header rồi
      }}
    />
  );
}
