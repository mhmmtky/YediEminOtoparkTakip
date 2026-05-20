import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { loginUser } from "../database/userDb";
import { hashPassword } from "../services/hashPassword";

export const useAuth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      setStatus({ msg: "Lütfen tüm alanları doldurunuz.", type: "error" });
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    try {
      const hashedPassword = await hashPassword(password);
      const user = await loginUser(username, hashedPassword);

      if (user) {
        const sessionData = JSON.stringify({
          id: user.id,
          name: user.name,
          surname: user.surname,
          username: user.username,
          personal_number: user.personal_number,
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
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (e) {
      console.error("Giriş esnasında hata meydana geldi:", e);
      setStatus({ msg: "Sistemsel bir hata oluştu.", type: "error" });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return { username, setUsername, password, setPassword, handleLogin, status };
};
