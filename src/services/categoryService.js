import { getCategories } from "@/src/database/categoryDb";

export const handleGetCategories = async () => {
  try {
    const categories = await getCategories();
    return categories;
  } catch (e) {
    console.error("CategoryService katmanında hata: ", e);
    return [];
  }
};
