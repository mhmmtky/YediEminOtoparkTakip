import { db } from "./db";

export const getCategories = async () => {
  try {
    const rows = await db.getAllAsync(
      "SELECT id, name, daily_price FROM categories;",
    );
    return rows; // [{id: 1, name: 'Otomobil', daily_price: 150}, ...] şeklinde döner
  } catch (e) {
    console.error("Kategoriler DB'den çekilirken hata oluştu:", e);
    return [];
  }
};
