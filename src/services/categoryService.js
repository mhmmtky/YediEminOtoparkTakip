import {
  getCategories,
  getCategoriesById,
  getTopCategory,
  saveCategory,
  updateCategoryPrice,
} from "@/src/database/categoryDb";
import LogService from "@/src/services/logs";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const handleGetCategories = async () => {
  try {
    const categories = await getCategories();
    return categories;
  } catch (e) {
    console.error("CategoryService katmanında hata: ", e);
    return [];
  }
};

export const handleUpdateCategoryPrice = async (id, newPrice) => {
  try {
    const priceNum = parseFloat(newPrice);

    if (isNaN(priceNum) || priceNum < 0) {
      return {
        success: false,
        error: "Lütfen pozitif değer girin!",
      };
    }

    const isSuccess = await updateCategoryPrice(id, priceNum);

    if (isSuccess) {
      const sessionData = await AsyncStorage.getItem("@user_session");
      let personal_username = "Bilinmeyen";
      let personal_id = null;
      console.log("session alındı");

      if (sessionData) {
        const parsedUser = JSON.parse(sessionData);
        personal_username = parsedUser.username;
        personal_id = parsedUser.id;
      }
      console.log("veriler girildi");

      console.log("cate name alınıyor");
      const cateRow = await getCategoriesById(id);
      const cateName = cateRow ? cateRow.name : "Bilinmeyen";
      console.log("catename alındı");

      console.log("logdata yazılıyor");
      const logData = {
        userId: personal_id,
        username: personal_username,
        actionType: "UPDATE",
        description:
          personal_username +
          " kişisi " +
          cateName +
          " kategorisinin fiyatını " +
          priceNum +
          " TL olarak güncelledi!",
      };
      console.log("log data yazıldı");

      await LogService.createLog(logData);

      console.log("log oluştu");

      return {
        success: true,
        message: "Kategori fiyatı güncellendi!",
      };
    }

    return {
      success: false,
      error: "Veritabanı katmanında güncelleme başarısız oldu.",
    };
  } catch (e) {
    console.error("categoryService katmanında hata oluştu:", e);
    return { success: false, error: e.message };
  }
};

export const handleAddCategory = async (name, price) => {
  try {
    if (!name || !name.trim()) {
      return {
        success: false,
        error: "Kategori ismi boş bırakılamaz!",
      };
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return {
        success: false,
        error: "Lütfen günlük ücreti pozitif değer girin!",
      };
    }

    const isSuccess = await saveCategory(name.trim(), priceNum);
    if (isSuccess) {
      const sessionData = await AsyncStorage.getItem("@user_session");
      let personal_username = "Bilinmeyen";
      let personal_id = null;
      console.log("session alındı");

      if (sessionData) {
        const parsedUser = JSON.parse(sessionData);
        personal_username = parsedUser.username;
        personal_id = parsedUser.id;
      }

      const logData = {
        userId: personal_id,
        username: personal_username,
        actionType: "INSERT",
        description:
          personal_username +
          " kişisi yeni kategori ekledi! Katgori Adı: " +
          name +
          " Günlük Fiyatı: " +
          price +
          " TL",
      };

      await LogService.createLog(logData);

      return {
        success: true,
        message: "Yeni kategori başarıyla oluşturuldu!",
      };
    }
    return {
      success: false,
      error: "Sistemsel bir hata oluştu.",
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const handleGetTopCategory = async () => {
  try {
    const result = await getTopCategory();
    return result && result.length > 0
      ? result[0]
      : { name: "Veri Yok", count: 0 };
  } catch (e) {
    console.error("Top category hatası:", e);
    return { name: "Hata", count: 0 };
  }
};
