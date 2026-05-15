import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { setupDB } from "../src/database/db";

export default function RootLayout() {
  const router = useRouter();
  useEffect(() => {
    setupDB();
    const checkSession = async () => {
      try {
        const session = await AsyncStorage.getItem("@user_session");

        if (session) {
          // Eğer çekmecede veri varsa, kullanıcıyı içeri al
          console.log("Oturum bulundu, yönlendiriliyor...");
          router.replace("/(tabs)/dashboard");
        } else {
          // Veri yoksa login ekranında kalsın (veya oraya yönlendir)
          console.log("Oturum yok, login bekleniyor.");
          router.replace("/");
        }
      } catch (e) {
        console.error("Layout session kontrol hatası:", e);
      }
    };

    checkSession();
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
