import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { loginUser } from "../database/db";
export const useAuth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      setStatus({ msg: "Lütfen tüm alanları doldur.", type: "error" });
      setTimeout(() => setStatus(null), 3000); // 3 sn sonra kapat
      return;
    }

    const user = loginUser(username, password);

    if (user) {
      const sessionData = JSON.stringify({
        id: user.id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        role: user.role,
        status: user.status,
      });
      await AsyncStorage.setItem("@user_session", sessionData);

      setStatus({ msg: "Giriş Başarılı!", type: "success" });
      setTimeout(() => {
        setStatus(null);
        router.replace("/dashboard");
      }, 1500);
    } else {
      setStatus({ msg: "Kullanıcı adı veya şifre yanlış.", type: "error" });
      setTimeout(() => setStatus(null), 3000); // 3 sn sonra kapat
    }
  };

  return { username, setUsername, password, setPassword, handleLogin, status };
};
