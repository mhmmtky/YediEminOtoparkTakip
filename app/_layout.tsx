import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRootNavigationState, useRouter } from "expo-router";
import { useEffect } from "react";
import { setupDB } from "../src/database/db";

export default function RootLayout() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // veri tabanı tabloları kurulur
    setupDB();
  }, []);

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    const checkSession = async () => {
      try {
        const session = await AsyncStorage.getItem("@user_session");

        if (session) {
          // Eğer veri varsa, kullanıcıyı içeri al
          router.replace("/(tabs)/dashboard");
        } else {
          // Veri yoksa login ekranına gönder
          router.replace("/");
        }
      } catch (e) {
        console.error("Layout session kontrol hatası:", e);
      }
    };

    checkSession();
  }, [rootNavigationState?.key]); // Rota hazır olduğunda veya değiştiğinde tetiklenir

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
