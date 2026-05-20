import { db } from "./db";

export const saveLog = async (userId, username, actionType, description) => {
  try {
    await db.runAsync(
      `INSERT INTO system_logs (user_id, username, action_type, description) VALUES(?,?,?,?)`,
      [userId, username, actionType, description],
    );
  } catch (e) {
    console.error("Log kaydedilirken bir hata oluştu. " + e);
  }
};

export const getLogs = async (selectedDate, selectedUser) => {
  try {
    let query = `SELECT * FROM system_logs WHERE 1=1`;
    let params = [];

    // Tarih seçildiyse sorguya ekle
    if (selectedDate) {
      query += ` AND date(created_at) = date(?)`;
      params.push(selectedDate);
    }

    // Personel seçildiyse sorguya ekle
    if (selectedUser) {
      query += ` AND username = ?`;
      params.push(selectedUser);
    }

    // En yeni en üstte
    query += ` ORDER BY created_at DESC;`;

    return await db.getAllAsync(query, params);
  } catch (e) {
    console.error("Loglar çekilirken hata oluştu: " + e);
    return [];
  }
};
