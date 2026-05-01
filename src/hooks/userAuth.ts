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

  const handleLogin = () => {
    if (!username || !password) {
      setStatus({ msg: "Lütfen tüm alanları doldur.", type: "error" });
      setTimeout(() => setStatus(null), 3000); // 3 sn sonra kapat
      return;
    }

    const user = loginUser(username, password);

    if (user) {
      setStatus({ msg: "Giriş Başarılı!", type: "success" });
      setTimeout(() => {
        setStatus(null);
        router.replace("/temps");
      }, 1500);
    } else {
      setStatus({ msg: "Kullanıcı adı veya şifre yanlış.", type: "error" });
      setTimeout(() => setStatus(null), 3000); // 3 sn sonra kapat
    }
  };

  return { username, setUsername, password, setPassword, handleLogin, status };
};
