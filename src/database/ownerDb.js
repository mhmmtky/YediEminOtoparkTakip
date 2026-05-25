import { db } from "./db";

export const saveOwner = async (ownerData) => {
  try {
    const { full_name, phone, tc_no } = ownerData;

    const sql = `INSERT INTO owners (full_name, phone, tc_no) VALUES (?, ?, ?)`;
    const result = await db.runAsync(sql, [full_name, phone, tc_no]);

    return result;
  } catch (e) {
    console.error("SQL Katmanında saveOwner hatası:", e);
    return false;
  }
};
