import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { setupDB } from "../src/database/db";

export default function RootLayout() {
  useEffect(() => {
    setupDB(); // Uygulama açıldığında tabloyu oluşturur
  }, []);
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    />
  );
}
