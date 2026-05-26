import {
  getCategories,
  saveCategory,
  updateCategoryPrice,
} from "@/src/database/categoryDb";

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
      return {
        success: true,
        message: "Kategori fiyatı jilet gibi güncellendi kral!",
      };
    }

    return {
      success: false,
      error: "Veritabanı katmanında güncelleme başarısız oldu amk.",
    };
  } catch (e) {
    console.error("categoryService katmanında büyük hata koptu:", e);
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
