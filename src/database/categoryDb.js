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

export const updateCategoryPrice = async (id, newPrice) => {
  try {
    db.runSync("UPDATE categories SET daily_price = ? WHERE id = ?;", [
      newPrice,
      id,
    ]);

    console.log(
      `ID'si ${id} olan kategorinin yeni fiyatı ${newPrice} TL olarak SQL'e çakıldı kral!`,
    );
    return true;
  } catch (e) {
    console.error(`updateCategoryPrice veritabanı hatası oluştu: `, e);
    return false;
  }
};

export const saveCategory = async (name, price) => {
  try {
    db.runSync("INSERT INTO categories (name, daily_price) VALUES (?, ?);", [
      name,
      price,
    ]);
    return true;
  } catch (e) {
    console.error("saveCategory fonksiyonundad hata luştu: ", e);
    return false;
  }
};

export const getTopCategory = async () => {
  try {
    const sql = `
      SELECT c.category_id, cate.name, COUNT(*) as count 
      FROM cars c 
      JOIN categories cate ON c.category_id = cate.id 
      GROUP BY c.category_id 
      ORDER BY count DESC 
      LIMIT 1;
    `;
    const count = await db.getAllAsync(sql);

    return count;
  } catch (e) {
    console.error("getTopCategories fonksiyonunda hata: " + e);
    return { name: "Veri Yok", count: 0 };
  }
};
