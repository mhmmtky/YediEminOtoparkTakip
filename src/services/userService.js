import {
  adminUpdateUser,
  deleteUserById,
  getUserById,
  getUsers,
  saveUser,
  updateUserById,
} from "@/src/database/userDb";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hashPassword } from "./hashPassword";
import LogService from "./logs";

export const handleSaveUser = async (userData) => {
  const { name, surname, username, password, personal_number, role } = userData;

  // Boş alan kontrolü
  if (!name || !surname || !username || !password) {
    return false;
  }

  const hashedPassword = await hashPassword(password);

  try {
    const newUser = {
      name,
      surname,
      username,
      password: hashedPassword,
      personal_number,
      role,
      status: "active",
    };

    await saveUser(newUser);

    const sessionData = await AsyncStorage.getItem("@user_session");
    let activeUserId = null;
    let activeUsername = "System";

    if (sessionData !== null) {
      const parsedUser = JSON.parse(sessionData);
      activeUserId = parsedUser.id; // O an sisteme login olan elemanın ID'si
      activeUsername = parsedUser.username; // O an sisteme login olan elemanın kullanıcı adı
    }

    const logData = {
      userId: activeUserId,
      username: activeUsername,
      actionType: "INSERT",
      description:
        activeUsername +
        " kişisi " +
        username +
        " kişisinin sisteme kaydını gerçekleştirdi!",
    };

    await LogService.createLog(logData);

    return true;
  } catch (e) {
    console.error("Arayüz tarafında kayıt hatası:", e);
    return false;
  }
};

export const handleDeleteUser = async (userId, username) => {
  try {
    const timestamp = Date.now(); // milisaniye
    const formattedUsername = `[DELETED]_${username}_${timestamp}`;

    const dbSuccess = await deleteUserById(userId, formattedUsername);

    if (!dbSuccess) return false;

    const sessionData = await AsyncStorage.getItem("@user_session");
    let activeUserId = null;
    let activeUsername = "Sistem";

    if (sessionData !== null) {
      const parsedUser = JSON.parse(sessionData);
      activeUserId = parsedUser.id;
      activeUsername = parsedUser.username;
    }

    const logData = {
      userId: activeUserId,
      username: activeUsername,
      actionType: "DELETE",
      description: `${activeUsername} kişisi, ${username} kullanıcısını sistemden sildi!`,
    };

    await LogService.createLog(logData);

    return true;
  } catch (e) {
    console.error("Servis katmanında silme hatası:", e);
    return false;
  }
};

export const handleGetUsers = async () => {
  try {
    const dbUsers = await getUsers();

    // Eğer veritabanından veri gelmediyse veya boşsa boş dizi dön
    if (!dbUsers || !Array.isArray(dbUsers)) {
      return [];
    }

    const formattedUsers = dbUsers.map((user) => {
      return {
        id: user.id.toString(),
        name: user.name || "",
        surname: user.surname || "",
        username: user.username,
        personal_number: user.personal_number || "---",
        role: user.role || "employee",
        status: user.status || "active",
      };
    });

    return formattedUsers; // Arayüze listeyi dön
  } catch (e) {
    console.error("getUserService Katmanında hata:", e);
    return [];
  }
};

export const handleUpdateUser = async (userData) => {
  try {
    const { id, name, surname, username, password } = userData;

    if (!name || !surname || !username) {
      return { success: false, msg: "Lütfen boş alan bırakmayınız!" };
    }

    const currentUser = await getUserById(id);
    if (!currentUser) {
      return { success: false, msg: "Kullanıcı veritabanında bulunamadı!" };
    }

    // Yeni şifre yazdıysa hashle boş bıraktıysa şifreyi koru!
    let hashedPassword = currentUser.password;
    if (password && password.trim() !== "") {
      hashedPassword = await hashPassword(password);
    }

    const dbSuccess = await updateUserById(
      id,
      name,
      surname,
      username,
      hashedPassword,
    );
    if (!dbSuccess) {
      return { success: false, message: "Veritabanı güncelleme hatası!" };
    }

    const logData = {
      userId: id,
      username: username,
      actionType: "UPDATE",
      description: `${username} kullanıcısı kendi hesap bilgilerini güncelledi!`,
    };

    await LogService.createLog(logData);

    return { success: true, msg: "Güncelleme işlemi başarılı!" };
  } catch (e) {
    console.error("Servis katmanında profil güncelleme hatası:", e);
    return { success: false, msg: "Sistem hatası! Daha sonra tekrar deneyin!" };
  }
};

export const handleAdminUpdateUser = async (userData) => {
  const { id, name, surname, username, role, password } = userData;

  if (!name.trim() || !surname.trim() || !username.trim()) {
    return { success: false, error: "Lütfen tüm alanları doldurun!" };
  }

  try {
    // Yeni şifre girildiyse hashliyoruz, girilmediyse null bırakıyoruz
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await hashPassword(password);
    }

    const result = await adminUpdateUser({
      id,
      name,
      surname,
      username,
      role,
      password: hashedPassword,
    });

    if (result) {
      return { success: true };
    } else {
      return {
        success: false,
        error: "Veritabanı güncellenirken bir sorun oluştu!",
      };
    }
  } catch (e) {
    console.error("userService içinde handleUpdateUser hatası:", e);
    return { success: false, error: "Kullanıcı güncellenirken hata oluştu!" };
  }
};

export const handleGetUserById = async (id) => {
  try {
    const result = await getUserById(id);
    if (!result) return [];
    return result;
  } catch (e) {
    console.log("handleGetUserById fonksiyonunda hata oluştu: " + e);
    return [];
  }
};
